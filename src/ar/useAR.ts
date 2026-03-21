import { useCallback, useEffect, useRef, useState } from 'react'
import { ARSession } from './ARSession'
import { useCameraFallback } from './useCameraFallback'
import { useAppStore } from '@store/appStore'
import type { SceneManager } from '@scene/SceneManager'

export function useAR(sceneRef: React.MutableRefObject<SceneManager | null>) {
  const { capabilities, setARActive } = useAppStore()
  const arRef = useRef<ARSession | null>(null)
  const [mode, setMode] = useState<'webxr' | 'camera-fallback' | 'none'>('none')
  const [isActive, setIsActive] = useState(false)

  // iOS camera fallback — activates when in camera-fallback mode
  useCameraFallback(mode === 'camera-fallback')

  const start = useCallback(async () => {
    const scene = sceneRef.current
    if (!scene) return

    const ar = new ARSession(scene)
    arRef.current = ar

    const supported = await ARSession.isSupported()
    if (supported) {
      await ar.startWebXR()
      setMode('webxr')
    } else {
      // iOS / unsupported: camera fallback
      setMode('camera-fallback')
    }

    setIsActive(true)
    setARActive(true)
  }, [sceneRef, setARActive])

  const stop = useCallback(async () => {
    await arRef.current?.stop()
    arRef.current = null
    setMode('none')
    setIsActive(false)
    setARActive(false)
  }, [setARActive])

  const handleTap = useCallback((x: number, y: number) => {
    const ar = arRef.current
    if (!ar) return
    if (mode === 'webxr') {
      ar.placeShape()
    } else if (mode === 'camera-fallback') {
      ar.placeShapeAtScreen(x, y)
    }
  }, [mode])

  const clear = useCallback(() => arRef.current?.clearShapes(), [])

  return { mode, isActive, start, stop, handleTap, clear }
}
