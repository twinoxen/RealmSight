import { useCallback, useState } from 'react'
import { useAppStore } from '@store/appStore'
import type { SceneManager } from '@scene/SceneManager'
import type { useAR } from '@ar/useAR'
import StatusChip from './StatusChip'
import GlyphReferencePanel from './GlyphReferencePanel'

interface HUDProps {
  sceneRef: React.MutableRefObject<SceneManager | null>
  arHook: ReturnType<typeof useAR>
}

export default function HUD({ arHook }: HUDProps) {
  const { capabilities, visionReady, classifierReady, lastDetection, arStatus } = useAppStore()
  const { mode, isActive, start, stop, handleTap, clear, needsOrientationPermission } = arHook
  const [glyphPanelOpen, setGlyphPanelOpen] = useState(false)

  const onTap = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isActive) return
      const { clientX, clientY } = 'touches' in e ? (e.changedTouches[0] ?? e.touches[0]) : e
      handleTap(clientX, clientY)
    },
    [isActive, handleTap]
  )

  const handleStart = useCallback(() => {
    // On iOS 13+, DeviceOrientationEvent.requestPermission must be called from a user gesture
    // We call it here before starting AR so the stabilization hook can use it
    const dev = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (needsOrientationPermission && typeof dev.requestPermission === 'function') {
      dev.requestPermission().catch(() => {})
    }
    start()
  }, [start, needsOrientationPermission])

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
        {/* Mode badge */}
        {mode !== 'none' && (
          <span
            style={{
              background: 'rgba(0,0,0,0.55)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
              pointerEvents: 'none',
            }}
          >
            {mode === 'webxr' ? 'WebXR' : 'Camera'}
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

      {/* Status chip — center */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <StatusChip status={arStatus} detectedGlyph={lastDetection?.label} />
      </div>

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
            background: glyphPanelOpen ? 'rgba(99,102,241,0.5)' : 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            width: 44,
            height: 44,
            color: '#fff',
            fontSize: 20,
          }}
          aria-label="Glyph Reference"
          onClick={e => {
            e.stopPropagation()
            setGlyphPanelOpen(v => !v)
          }}
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
            else handleStart()
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

      {/* Glyph reference panel */}
      <GlyphReferencePanel isOpen={glyphPanelOpen} onClose={() => setGlyphPanelOpen(false)} />

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
            Vision: {visionReady ? '✅' : '⏳'} | Classifier: {classifierReady ? '✅' : '⏳'}
          </div>
          <div>AR mode: {mode || 'inactive'}</div>
        </div>
      )}
    </div>
  )
}
