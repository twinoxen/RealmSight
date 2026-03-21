import { useCallback, useRef, useState } from 'react'
import { ARSession } from './ARSession'
import { useCameraFallback } from './useCameraFallback'
import { useAppStore } from '@store/appStore'
import type { SceneManager } from '@scene/SceneManager'

export function useAR(sceneRef: React.MutableRefObject<SceneManager | null>) {
  const { setARActive } = useAppStore()
  const arRef = useRef<ARSession | null>(null)
  const [mode, setMode] = useState<'webxr' | 'camera-fallback' | 'none'>('none')
  const [isActive, setIsActive] = useState(false)

  // Returns start/stop methods rather than reacting via effect
  const { start: startCameraFallback, stop: stopCameraFallback } = useCameraFallback()

  const start = useCallback(async () => {
    const scene = sceneRef.current
    if (!scene) return

    const ar = new ARSession(scene)
    arRef.current = ar

    // Fast synchronous check to skip async gap if WebXR is definitely absent (iOS Chrome/Safari)
    // This preserves the synchronous gesture chain for getUserMedia
    if (!navigator.xr) {
      try {
        await startCameraFallback()
        setMode('camera-fallback')
        setIsActive(true)
        setARActive(true)
      } catch (err) {
        console.error("Camera start failed", err)
      }
      return
    }

    // If xr exists, we need to check if immersive-ar is supported (Android/Quest etc)
    const supported = await ARSession.isSupported()
    if (supported) {
      await ar.startWebXR()
      setMode('webxr')
    } else {
      // Fallback if supported is false despite navigator.xr being present
      try {
        await startCameraFallback()
        setMode('camera-fallback')
      } catch (err) {
        console.error("Camera fallback start failed", err)
      }
    }

    setIsActive(true)
    setARActive(true)
  }, [sceneRef, setARActive, startCameraFallback])

  const stop = useCallback(async () => {
    await arRef.current?.stop()
    arRef.current = null
    
    // Stop camera fallback if it was active
    stopCameraFallback()

    setMode('none')
    setIsActive(false)
    setARActive(false)
  }, [setARActive, stopCameraFallback])

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
