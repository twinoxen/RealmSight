import { useEffect, useRef } from 'react'

/**
 * Starts the rear camera feed and renders it behind the Three.js canvas.
 * Used on iOS Safari where WebXR immersive-ar is not supported.
 */
export function useCameraFallback(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const video = document.createElement('video')
    video.setAttribute('playsinline', 'true')
    video.setAttribute('autoplay', 'true')
    video.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;'
    document.body.prepend(video)
    videoRef.current = video

    // Make Three.js canvas transparent so camera shows through
    const canvas = document.querySelector('#canvas-mount canvas') as HTMLCanvasElement | null
    if (canvas) canvas.style.background = 'transparent'

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(stream => { video.srcObject = stream })
      .catch(err => console.warn('[CameraFallback] getUserMedia failed:', err))

    return () => {
      const stream = video.srcObject as MediaStream | null
      stream?.getTracks().forEach(t => t.stop())
      video.remove()
      videoRef.current = null
    }
  }, [enabled])

  return videoRef
}
