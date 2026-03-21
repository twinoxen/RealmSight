import { useCallback, useRef, useState, useEffect } from 'react'
import { ARSession } from './ARSession'
import { useCameraFallback } from './useCameraFallback'
import { useStabilization } from './useStabilization'
import { useAppStore } from '@store/appStore'
import type { SceneManager } from '@scene/SceneManager'

export function useAR(sceneRef: React.MutableRefObject<SceneManager | null>) {
  const { setARActive, setArStatus } = useAppStore()
  const arRef = useRef<ARSession | null>(null)
  const [mode, setMode] = useState<'webxr' | 'camera-fallback' | 'none'>('none')
  const [isActive, setIsActive] = useState(false)

  // Track if we need to request orientation permissions
  const [needsOrientationPermission, setNeedsOrientationPermission] = useState(false)

  const { start: startCamera, stop: stopCamera } = useCameraFallback()

  // Apply device orientation stabilization when in fallback mode
  useStabilization(sceneRef, isActive && mode === 'camera-fallback')

  useEffect(() => {
    // Check if we're on iOS and might need orientation permissions
    const dev = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof dev.requestPermission === 'function') {
      setNeedsOrientationPermission(true)
    }
  }, [])

  const start = useCallback(async () => {
    const scene = sceneRef.current
    if (!scene) return
    setArStatus('starting')

    const ar = new ARSession(scene)
    arRef.current = ar

    const supported = await ARSession.isSupported()
    if (supported) {
      await ar.startWebXR()
      setMode('webxr')
    } else {
      startCamera()
      setMode('camera-fallback')
    }

    setIsActive(true)
    setARActive(true)
    setArStatus('scanning')
  }, [sceneRef, setARActive, setArStatus, startCamera])

  const stop = useCallback(async () => {
    await arRef.current?.stop()
    stopCamera()
    arRef.current = null
    setMode('none')
    setIsActive(false)
    setARActive(false)
    setArStatus('idle')
  }, [setARActive, setArStatus, stopCamera])

  const handleTap = useCallback(
    (x: number, y: number) => {
      const ar = arRef.current
      if (!ar) return
      setArStatus('placing')
      if (mode === 'webxr') ar.placeShape()
      else if (mode === 'camera-fallback') ar.placeShapeAtScreen(x, y)
      setTimeout(() => setArStatus('ready'), 800)
    },
    [mode, setArStatus]
  )

  const clear = useCallback(() => {
    arRef.current?.clearShapes()
    setArStatus('detecting')
  }, [setArStatus])

  return { mode, isActive, start, stop, handleTap, clear, arRef, needsOrientationPermission }
}
