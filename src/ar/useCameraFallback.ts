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
    // All four attributes required for autoplay camera on iOS Safari
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')
    video.setAttribute('autoplay', 'true')
    video.setAttribute('muted', 'true')
    video.muted = true
    video.style.cssText = [
      'position:fixed',
      'inset:0',
      'width:100%',
      'height:100%',
      'object-fit:cover',
      'z-index:0',
      'background:#000',
    ].join(';')
    document.body.prepend(video)
    videoRef.current = video

    // Make Three.js canvas transparent so camera shows through
    const mount = document.getElementById('canvas-mount')
    const canvas = mount?.querySelector('canvas') as HTMLCanvasElement | null
    if (canvas) {
      canvas.style.background = 'transparent'
      canvas.style.position = 'absolute'
      canvas.style.zIndex = '1'
    }
    if (mount) mount.style.zIndex = '1'

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then(stream => {
        video.srcObject = stream
        // Explicit play() call needed on some browsers even with autoplay attr
        video.play().catch(err => console.warn('[CameraFallback] play() failed:', err))
      })
      .catch(err => console.warn('[CameraFallback] getUserMedia failed:', err))

    return () => {
      const stream = video.srcObject as MediaStream | null
      stream?.getTracks().forEach(t => t.stop())
      video.remove()
      if (canvas) {
        canvas.style.background = ''
        canvas.style.position = ''
        canvas.style.zIndex = ''
      }
      videoRef.current = null
    }
  }, [enabled])

  return videoRef
}
