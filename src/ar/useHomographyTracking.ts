import { useEffect, useRef } from 'react'
import { estimateCameraShift, applyCameraShift } from './HomographyAnchor'
import type { BackgroundFrame } from '@vision/bgSubtract'
import type { SceneManager } from '@scene/SceneManager'

interface TrackingConfig {
  sceneRef: React.MutableRefObject<SceneManager | null>
  backgroundRef: React.MutableRefObject<BackgroundFrame | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  enabled: boolean
  depthEstimate?: number // estimated surface depth in meters, default 1.2
  smoothing?: number // 0-1 how aggressively to apply, default 0.3
}

let trackingCanvas: HTMLCanvasElement | null = null
let trackingCtx: CanvasRenderingContext2D | null = null

function getTrackingCtx(w: number, h: number) {
  if (!trackingCanvas) {
    trackingCanvas = document.createElement('canvas')
    trackingCtx = trackingCanvas.getContext('2d', { willReadFrequently: true })
  }
  trackingCanvas.width = w
  trackingCanvas.height = h
  return trackingCtx!
}

export function useHomographyTracking({
  sceneRef,
  backgroundRef,
  videoRef,
  enabled,
  depthEstimate = 1.2,
  smoothing = 0.35,
}: TrackingConfig) {
  const rafRef = useRef<number | null>(null)
  const lastShiftRef = useRef({ dx: 0, dy: 0, scale: 1, confidence: 0 })

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    let frameCount = 0

    const track = () => {
      rafRef.current = requestAnimationFrame(track)

      // Only process every 3rd frame — tracking at 10fps is enough
      frameCount++
      if (frameCount % 3 !== 0) return

      const bg = backgroundRef.current
      const video = videoRef.current
      const scene = sceneRef.current

      if (!bg || !video || !scene || video.readyState < 2) return

      const W = video.videoWidth || video.clientWidth
      const H = video.videoHeight || video.clientHeight
      if (!W || !H || bg.width !== W || bg.height !== H) return

      const ctx = getTrackingCtx(W, H)
      ctx.drawImage(video, 0, 0, W, H)
      const currentData = ctx.getImageData(0, 0, W, H)

      const shift = estimateCameraShift(bg.data, currentData.data, W, H)

      // Smooth the shift to avoid jitter
      const smoothed = {
        dx: lastShiftRef.current.dx * 0.6 + shift.dx * 0.4,
        dy: lastShiftRef.current.dy * 0.6 + shift.dy * 0.4,
        scale: shift.scale,
        confidence: shift.confidence,
      }
      lastShiftRef.current = smoothed

      applyCameraShift(scene.camera, smoothed, depthEstimate, smoothing)
    }

    rafRef.current = requestAnimationFrame(track)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, backgroundRef, videoRef, sceneRef, depthEstimate, smoothing])
}
