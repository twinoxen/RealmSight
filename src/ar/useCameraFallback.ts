import { useRef, useCallback } from 'react'

/**
 * Starts the rear camera feed and renders it behind the Three.js canvas.
 * Used on iOS Safari/Chrome where WebXR immersive-ar is not supported.
 */
export function useCameraFallback() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const stop = useCallback(() => {
    if (!videoRef.current) return

    const stream = videoRef.current.srcObject as MediaStream | null
    stream?.getTracks().forEach(t => t.stop())
    videoRef.current.remove()
    videoRef.current = null

    // Reset Three.js canvas styling
    const mount = document.getElementById('canvas-mount')
    const canvas = mount?.querySelector('canvas') as HTMLCanvasElement | null
    if (canvas) {
      canvas.style.background = ''
      canvas.style.position = ''
      canvas.style.zIndex = ''
    }
    if (mount) mount.style.zIndex = ''
  }, [])

  const start = useCallback(async () => {
    if (videoRef.current) return // already running

    const video = document.createElement('video')
    // All attributes required for autoplay camera on iOS WebKit
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
      'z-index:1', // Behind canvas but above body
      'background:#000',
      'pointer-events:none', // Let taps pass through to HUD overlay
    ].join(';')
    document.body.prepend(video)
    videoRef.current = video

    // Make Three.js canvas transparent so camera shows through
    const mount = document.getElementById('canvas-mount')
    const canvas = mount?.querySelector('canvas') as HTMLCanvasElement | null
    if (canvas) {
      canvas.style.background = 'transparent'
      canvas.style.position = 'absolute'
      canvas.style.zIndex = '2'
      canvas.style.pointerEvents = 'none' // Allow touches to pass through to HUD/etc if needed
    }
    if (mount) mount.style.zIndex = '2'

    // Try progressively looser constraints
    const constraints = [
      {
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      {
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      },
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      { video: true, audio: false },
    ]

    let stream: MediaStream | null = null
    let lastErr: unknown = null

    for (const constraint of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint)
        break
      } catch (err) {
        lastErr = err
        console.warn(`[CameraFallback] Failed with constraint ${JSON.stringify(constraint)}:`, err)
      }
    }

    if (!stream) {
      console.error('[CameraFallback] All getUserMedia attempts failed', lastErr)
      stop()
      throw lastErr || new Error('Camera not available')
    }

    video.srcObject = stream

    // Explicit play() call is needed on some browsers
    try {
      await video.play()
    } catch (err) {
      console.warn('[CameraFallback] play() failed:', err)
    }
  }, [stop])

  return { start, stop, videoRef }
}
