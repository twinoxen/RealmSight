import { useEffect } from 'react'
import { useAppStore } from '@store/appStore'
import { detectCapabilities } from '@platform/capabilities'
import { useScene } from '@scene/useScene'
import HUD from '@ui/HUD'

const CANVAS_ID = 'canvas-mount'

export default function App() {
  const { capabilities, setCapabilities } = useAppStore()
  const sceneRef = useScene(CANVAS_ID)

  useEffect(() => {
    const caps = detectCapabilities()
    setCapabilities(caps)
  }, [setCapabilities])

  if (import.meta.env.DEV) {
    ;(window as Window & { __scene?: typeof sceneRef }).__scene = sceneRef
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: 'transparent',
        position: 'relative',
      }}
    >
      <div id={CANVAS_ID} style={{ position: 'absolute', inset: 0 }} />
      {capabilities && <HUD sceneRef={sceneRef} />}
    </div>
  )
}
