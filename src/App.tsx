import { useEffect, useRef } from 'react'
import { useAppStore } from '@store/appStore'
import { detectCapabilities } from '@platform/capabilities'
import HUD from '@ui/HUD'

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { capabilities, setCapabilities } = useAppStore()

  useEffect(() => {
    const caps = detectCapabilities()
    setCapabilities(caps)
    console.log('[RealmSight] Capabilities:', caps)
  }, [setCapabilities])

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      {/* Three.js canvas mount point */}
      <div ref={canvasRef} id="canvas-mount" style={{ position: 'absolute', inset: 0 }} />
      {/* React UI overlay */}
      {capabilities && <HUD />}
    </div>
  )
}
