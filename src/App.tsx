import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@store/appStore'
import { detectCapabilities } from '@platform/capabilities'
import { useScene } from '@scene/useScene'
import { usePipeline } from '@vision/usePipeline'
import { useAR } from '@ar/useAR'
import HUD from '@ui/HUD'
import LoadingScreen from '@ui/LoadingScreen'
import type { DetectionEvent } from '@vision/usePipeline'

const CANVAS_ID = 'canvas-mount'

export default function App() {
  const {
    capabilities,
    setCapabilities,
    isARActive,
    loadingStage,
    setLoadingStage,
    setArStatus,
    visionReady,
    classifierReady,
  } = useAppStore()

  const sceneRef = useScene(CANVAS_ID)
  const arHook = useAR(sceneRef)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [appReady, setAppReady] = useState(false)

  // Stage 1: detect capabilities (fast — sync)
  useEffect(() => {
    const caps = detectCapabilities()
    setCapabilities(caps)
    setLoadingStage('vision') // move to next stage immediately
  }, [setCapabilities, setLoadingStage])

  // Stage 2+3: vision worker + classifier loading
  useEffect(() => {
    if (visionReady) setLoadingStage('classifier')
  }, [visionReady, setLoadingStage])

  useEffect(() => {
    if (classifierReady) {
      setLoadingStage('done')
      // Brief delay so user sees "done" state
      setTimeout(() => setAppReady(true), 400)
    }
  }, [classifierReady, setLoadingStage])

  // Point videoRef at the camera element when AR is active
  useEffect(() => {
    if (isARActive) {
      videoRef.current = document.querySelector('video') as HTMLVideoElement | null
      setArStatus('scanning')
    } else {
      videoRef.current = null
      setArStatus('idle')
    }
  }, [isARActive, setArStatus])

  const onDetection = useCallback(
    (event: DetectionEvent) => {
      const ar = arHook.arRef?.current
      if (!ar) return
      setArStatus('placing')
      ar.placeGlyphAtNormalized(event.nx, event.ny, event.glyph.label)
      // Return to detecting after placement
      setTimeout(() => setArStatus('detecting'), 1500)
    },
    [arHook, setArStatus]
  )

  usePipeline({
    videoRef,
    enabled: isARActive && arHook.mode === 'camera-fallback',
    onDetection,
  })

  if (import.meta.env.DEV) {
    ;(window as Window & { __scene?: typeof sceneRef }).__scene = sceneRef
  }

  // Map loading stage to LoadingScreen stage prop
  const loadingScreenStage =
    loadingStage === 'done'
      ? 'classifier'
      : loadingStage === 'classifier'
        ? 'classifier'
        : loadingStage === 'vision'
          ? 'vision'
          : 'app'

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      <div id={CANVAS_ID} style={{ position: 'absolute', inset: 0 }} />
      {capabilities && appReady && <HUD sceneRef={sceneRef} arHook={arHook} />}
      {!appReady && <LoadingScreen stage={loadingScreenStage} />}
    </div>
  )
}
