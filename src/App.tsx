import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@store/appStore'
import { detectCapabilities } from '@platform/capabilities'
import { useScene } from '@scene/useScene'
import { usePipeline } from '@vision/usePipeline'
import { useAR } from '@ar/useAR'
import HUD from '@ui/HUD'
import type { DetectionEvent } from '@vision/usePipeline'

const CANVAS_ID = 'canvas-mount'

export default function App() {
  const { capabilities, setCapabilities, isARActive } = useAppStore()
  const sceneRef = useScene(CANVAS_ID)
  const arHook = useAR(sceneRef)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const caps = detectCapabilities()
    setCapabilities(caps)
  }, [setCapabilities])

  // Point videoRef at the camera video element when AR is active
  useEffect(() => {
    if (isARActive) {
      videoRef.current = document.querySelector('video') as HTMLVideoElement | null
    } else {
      videoRef.current = null
    }
  }, [isARActive])

  const onDetection = useCallback((event: DetectionEvent) => {
    const ar = arHook.arRef?.current
    if (!ar) return
    // Debounce: don't place the same glyph twice within 2 seconds
    ar.placeGlyphAtNormalized(event.nx, event.ny, event.glyph.label)
  }, [arHook])

  usePipeline({
    videoRef,
    enabled: isARActive && arHook.mode === 'camera-fallback',
    onDetection,
  })

  if (import.meta.env.DEV) {
    (window as Window & { __scene?: typeof sceneRef }).__scene = sceneRef
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      <div id={CANVAS_ID} style={{ position: 'absolute', inset: 0 }} />
      {capabilities && <HUD sceneRef={sceneRef} arHook={arHook} />}
    </div>
  )
}
