import { useCallback } from 'react'
import { useAppStore } from '@store/appStore'
import type { SceneManager } from '@scene/SceneManager'
import { useAR } from '@ar/useAR'

interface HUDProps {
  sceneRef: React.MutableRefObject<SceneManager | null>
}

export default function HUD({ sceneRef }: HUDProps) {
  const { capabilities } = useAppStore()
  const { mode, isActive, start, stop, handleTap, clear } = useAR(sceneRef)

  const onTap = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isActive) return
      const { clientX, clientY } = 'touches' in e ? (e.changedTouches[0] ?? e.touches[0]) : e
      handleTap(clientX, clientY)
    },
    [isActive, handleTap]
  )

  const modeLabel = mode === 'webxr' ? 'WebXR AR' : mode === 'camera-fallback' ? 'Camera Mode' : ''

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'all',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 3,
      }}
      onTouchStart={onTap}
      onClick={onTap}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px',
          paddingTop: 'max(16px, env(safe-area-inset-top))',
        }}
      >
        {modeLabel && (
          <span
            style={{
              pointerEvents: 'none',
              background: 'rgba(0,0,0,0.55)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              color: '#fff',
            }}
          >
            {modeLabel}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {isActive && (
            <button
              style={{
                pointerEvents: 'all',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: 20,
                padding: '6px 14px',
                color: '#fff',
                fontSize: 13,
              }}
              onClick={e => {
                e.stopPropagation()
                clear()
              }}
            >
              Clear
            </button>
          )}
          <button
            style={{
              pointerEvents: 'all',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              color: '#fff',
              fontSize: 20,
            }}
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Tap hint */}
      {isActive && (
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          <span
            style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              color: '#fff',
            }}
          >
            Tap to place a shape
          </span>
        </div>
      )}

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '24px 16px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          style={{
            pointerEvents: 'all',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            color: '#fff',
            fontSize: 20,
          }}
          aria-label="Glyph Reference"
        >
          📖
        </button>

        <button
          style={{
            pointerEvents: 'all',
            background: isActive ? 'rgba(239,68,68,0.85)' : 'rgba(99,102,241,0.9)',
            border: 'none',
            borderRadius: 32,
            padding: '14px 28px',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
          }}
          onClick={e => {
            e.stopPropagation()
            if (isActive) stop()
            else start()
          }}
        >
          {isActive ? 'Stop AR' : 'Start AR'}
        </button>

        <button
          style={{
            pointerEvents: 'all',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            color: '#fff',
            fontSize: 20,
          }}
          aria-label="Share"
        >
          🔗
        </button>
      </div>

      {/* Dev badge */}
      {import.meta.env.DEV && capabilities && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 16,
            background: 'rgba(0,0,0,0.7)',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 11,
            lineHeight: 1.6,
            pointerEvents: 'none',
          }}
        >
          <div>
            WebXR: {capabilities.webxr ? '✅' : '❌'} | WebGL2: {capabilities.webgl2 ? '✅' : '❌'}
          </div>
          <div>
            iOS: {capabilities.isIOS ? '✅' : '❌'} | Android:{' '}
            {capabilities.isAndroid ? '✅' : '❌'}
          </div>
          <div>
            Quality: {capabilities.qualityTier.toUpperCase()} | RAM:{' '}
            {capabilities.deviceMemoryGb ?? '?'}GB
          </div>
          <div>AR mode: {mode || 'inactive'}</div>
        </div>
      )}
    </div>
  )
}
