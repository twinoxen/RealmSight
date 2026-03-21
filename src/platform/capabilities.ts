export type QualityTier = 'full' | 'lite'

export interface Capabilities {
  webxr: boolean
  webgl2: boolean
  camera: boolean
  deviceMemoryGb: number | null
  qualityTier: QualityTier
  isIOS: boolean
  isAndroid: boolean
}

export function detectCapabilities(): Capabilities {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)

  const webxr = 'xr' in navigator
  const webgl2 = (() => {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    } catch { return false }
  })()
  const camera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const deviceMemoryGb = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null

  const qualityTier: QualityTier =
    (deviceMemoryGb !== null && deviceMemoryGb < 4) ? 'lite' : 'full'

  return { webxr, webgl2, camera, deviceMemoryGb, qualityTier, isIOS, isAndroid }
}
