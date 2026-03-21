import { useEffect, useRef } from 'react'

export function useCameraFallback(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    let active = true
    const video = document.createElement('video')
    video.playsInline = true
    video.muted = true
    video.autoplay = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.style.cssText = [
      'position:fixed','inset:0','width:100%','height:100%',
      'object-fit:cover','z-index:1','background:#000',
      'pointer-events:none',
    ].join(';')
    document.body.insertBefore(video, document.body.firstChild)
    videoRef.current = video

    const mount = document.getElementById('canvas-mount')
    const canvas = mount?.querySelector('canvas') as HTMLCanvasElement | null
    if (mount) { mount.style.position = 'fixed'; mount.style.inset = '0'; mount.style.zIndex = '2' }
    if (canvas) { canvas.style.background = 'transparent'; canvas.style.position = 'absolute'; canvas.style.inset = '0' }
    window.dispatchEvent(new CustomEvent('realmsight:set-clear-alpha', { detail: 0 }))

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        video.srcObject = stream
        video.play().catch(_err => setTimeout(() => video.play().catch(console.warn), 300))
      })
      .catch(err => console.error('[CameraFallback] getUserMedia failed:', err))

    return () => {
      active = false
      const stream = video.srcObject as MediaStream | null
      stream?.getTracks().forEach(t => t.stop())
      video.srcObject = null
      video.remove()
      videoRef.current = null
      if (canvas) { canvas.style.background = ''; canvas.style.position = ''; canvas.style.inset = '' }
      if (mount) { mount.style.zIndex = '' }
      window.dispatchEvent(new CustomEvent('realmsight:set-clear-alpha', { detail: 1 }))
    }
  }, [enabled])

  return videoRef
}
