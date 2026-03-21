import { useEffect, useRef, useCallback } from 'react'
import { VisionWorkerClient } from './VisionWorkerClient'
import { GlyphClassifier } from './GlyphClassifier'
import { subtractBackground } from './bgSubtract'
import { useAppStore } from '@store/appStore'
import type { ContourResult } from './opencv.worker'
import type { ClassificationResult } from './GlyphClassifier'
import type { BackgroundFrame } from './bgSubtract'

export interface DetectionEvent {
  glyph: ClassificationResult
  contour: ContourResult
  nx: number
  ny: number
}

let offscreenCanvas: HTMLCanvasElement | null = null
let offscreenCtx: CanvasRenderingContext2D | null = null

function getOffscreenCtx(w: number, h: number) {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas')
    offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true })
  }
  if (offscreenCanvas.width !== w || offscreenCanvas.height !== h) {
    offscreenCanvas.width = w
    offscreenCanvas.height = h
  }
  return offscreenCtx!
}

interface PipelineConfig {
  videoRef: React.RefObject<HTMLVideoElement | null>
  modelUrl?: string
  onDetection: (event: DetectionEvent) => void
  onScanFeedback?: (quality: 'none' | 'poor' | 'ok') => void
  enabled: boolean
  /** When true, captures the next frame as the background reference */
  captureBackground?: boolean
  onBackgroundCaptured?: () => void
}

export function usePipeline({
  videoRef,
  modelUrl,
  onDetection,
  onScanFeedback,
  enabled,
  captureBackground,
  onBackgroundCaptured,
}: PipelineConfig) {
  const { capabilities, setVisionReady, setClassifierReady, setLastDetection } = useAppStore()
  const workerRef = useRef<VisionWorkerClient | null>(null)
  const classifierRef = useRef<GlyphClassifier | null>(null)
  const backgroundRef = useRef<BackgroundFrame | null>(null)
  const captureNextRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const processingRef = useRef(false)
  const frameCountRef = useRef(0)
  const onDetectionRef = useRef(onDetection)
  onDetectionRef.current = onDetection

  // Boot worker + classifier once
  useEffect(() => {
    const worker = new VisionWorkerClient()
    worker.onReady = () => setVisionReady(true)
    workerRef.current = worker

    const classifier = new GlyphClassifier()
    classifier.load(modelUrl).then(() => setClassifierReady(true))
    classifierRef.current = classifier

    return () => {
      worker.dispose()
      classifier.dispose()
      workerRef.current = null
      classifierRef.current = null
      setVisionReady(false)
      setClassifierReady(false)
    }
  }, [modelUrl, setVisionReady, setClassifierReady])

  const processOneFrame = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return
    const worker = workerRef.current
    const classifier = classifierRef.current
    if (!worker?.isReady || !classifier?.isReady) return
    if (processingRef.current) return

    const W = video.videoWidth || video.clientWidth
    const H = video.videoHeight || video.clientHeight
    if (!W || !H) return

    frameCountRef.current++
    if (capabilities?.qualityTier === 'lite' && frameCountRef.current % 3 !== 0) return

    processingRef.current = true
    try {
      const ctx = getOffscreenCtx(W, H)
      ctx.drawImage(video, 0, 0, W, H)
      const rawImageData = ctx.getImageData(0, 0, W, H)

      // Capture background if requested
      if (captureNextRef.current) {
        backgroundRef.current = {
          data: new Uint8ClampedArray(rawImageData.data),
          width: W,
          height: H,
        }
        captureNextRef.current = false
        onBackgroundCaptured?.()
      }

      // Apply background subtraction if we have a reference frame
      const imageData = backgroundRef.current
        ? subtractBackground(rawImageData, backgroundRef.current)
        : rawImageData

      const contours = await worker.processFrame(imageData)

      // Emit scan quality feedback based on contour count
      if (onScanFeedback) {
        const allContours = contours.filter((c: ContourResult) => c.area > 500)
        if (allContours.length === 0) onScanFeedback('none')
        else if (allContours.length < 3) onScanFeedback('poor')
        else onScanFeedback('ok')
      }

      const candidates = contours
        .filter((c: ContourResult) => c.area > 2000 && c.complexity < 500)
        .sort((a: ContourResult, b: ContourResult) => b.area - a.area)
        .slice(0, 3)

      for (const contour of candidates) {
        const pad = 8
        const cropX = Math.max(0, contour.x - pad)
        const cropY = Math.max(0, contour.y - pad)
        const cropW = Math.min(W - cropX, contour.width + pad * 2)
        const cropH = Math.min(H - cropY, contour.height + pad * 2)
        const crop = ctx.getImageData(cropX, cropY, cropW, cropH)

        const result = await classifier.classify(crop)
        if (result) {
          const event: DetectionEvent = {
            glyph: result,
            contour,
            nx: contour.cx / W,
            ny: contour.cy / H,
          }
          setLastDetection(result)
          onDetectionRef.current(event)
          break
        }
      }
    } catch {
      // skip frame on error
    } finally {
      processingRef.current = false
    }
  }, [videoRef, capabilities, setLastDetection])

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    const loop = () => {
      processOneFrame()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, processOneFrame])

  // Trigger background capture on next frame
  useEffect(() => {
    if (captureBackground) captureNextRef.current = true
  }, [captureBackground])

  const clearBackground = useCallback(() => {
    backgroundRef.current = null
  }, [])

  const hasBackground = () => backgroundRef.current !== null

  return { clearBackground, hasBackground }
}
