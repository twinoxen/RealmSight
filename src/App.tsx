import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@store/appStore'
import { detectCapabilities } from '@platform/capabilities'
import { useScene } from '@scene/useScene'
import { usePipeline } from '@vision/usePipeline'
import { useAR } from '@ar/useAR'
import HUD from '@ui/HUD'
import LoadingScreen from '@ui/LoadingScreen'
import CapabilitiesScreen from '@ui/CapabilitiesScreen'
import PWAInstallBanner from '@pwa/PWAInstallBanner'
import { useSceneDB } from '@db/useSceneDB'
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
    arStatus,
  } = useAppStore()

  const sceneRef = useScene(CANVAS_ID)
  const arHook = useAR(sceneRef)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [appReady, setAppReady] = useState(false)
  const [capsChecked, setCapsChecked] = useState(false)
  const [captureBg, setCaptureBg] = useState(false)
  const [hasBg, setHasBg] = useState(false)
  const { saveScene, updateScene } = useSceneDB()
  const currentSceneId = useRef<number | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Boot: detect capabilities then show app after a brief init delay
  // Vision worker & classifier boot lazily when AR starts — don't block on them
  useEffect(() => {
    const caps = detectCapabilities()
    setCapabilities(caps)
    setLoadingStage('vision')

    // Give Three.js + scene a moment to init, then show the app
    const timer = setTimeout(() => {
      setLoadingStage('done')
      setAppReady(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [setCapabilities, setLoadingStage])

  // Point videoRef at the camera element when AR is active
  useEffect(() => {
    if (isARActive) {
      videoRef.current = document.querySelector('video') as HTMLVideoElement | null

      // Auto-save every 10 seconds
      autoSaveTimer.current = setInterval(async () => {
        const ar = arHook.arRef?.current
        if (!ar) return
        const models = ar.exportModels()
        if (models.length === 0) return
        if (currentSceneId.current === null) {
          const id = await saveScene('Untitled Scene', models)
          currentSceneId.current = id
        } else {
          await updateScene(currentSceneId.current, models)
        }
      }, 10000)
    } else {
      videoRef.current = null
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current)
        autoSaveTimer.current = null
      }
    }
  }, [isARActive, saveScene, updateScene, arHook.arRef])

  const onDetection = useCallback(
    (event: DetectionEvent) => {
      const ar = arHook.arRef?.current
      if (!ar) return
      // Show surface plane on iOS when we detect any contour
      ar.showFallbackSurface()
      setArStatus('placing')
      ar.placeGlyphAtNormalized(event.nx, event.ny, event.glyph.label)
      setTimeout(() => setArStatus('detecting'), 1500)
    },
    [arHook.arRef, setArStatus]
  )

  const onScanFeedback = useCallback(
    (quality: 'none' | 'poor' | 'ok') => {
      // Only update scan status if we're in scanning/detecting mode (not placing)
      if (
        arStatus !== 'scanning' &&
        arStatus !== 'detecting' &&
        arStatus !== 'scanning-no-surface' &&
        arStatus !== 'scanning-poor-surface'
      )
        return
      if (quality === 'none') setArStatus('scanning-no-surface')
      else if (quality === 'poor') setArStatus('scanning-poor-surface')
      else setArStatus('detecting')
    },
    [arStatus, setArStatus]
  )

  const { clearBackground } = usePipeline({
    videoRef,
    enabled: isARActive && arHook.mode === 'camera-fallback',
    onDetection,
    onScanFeedback,
    captureBackground: captureBg,
    onBackgroundCaptured: () => {
      setCaptureBg(false)
      setHasBg(true)
      setArStatus('detecting')
    },
  })

  const triggerBgCapture = useCallback(() => {
    setCaptureBg(true)
    setArStatus('scanning')
  }, [setArStatus])

  const triggerBgClear = useCallback(() => {
    clearBackground()
    setHasBg(false)
  }, [clearBackground])

  if (import.meta.env.DEV) {
    ;(window as Window & { __scene?: typeof sceneRef }).__scene = sceneRef
  }

  const loadingScreenStage = loadingStage === 'vision' ? 'vision' : 'app'

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
      {capabilities && appReady && capsChecked && (
        <HUD
          sceneRef={sceneRef}
          arHook={arHook}
          hasBg={hasBg}
          onCaptureBg={triggerBgCapture}
          onClearBg={triggerBgClear}
        />
      )}
      {capabilities && appReady && capsChecked && <PWAInstallBanner />}
      {capabilities && appReady && !capsChecked && (
        <CapabilitiesScreen capabilities={capabilities} onContinue={() => setCapsChecked(true)} />
      )}
      {!appReady && <LoadingScreen stage={loadingScreenStage} />}
    </div>
  )
}
