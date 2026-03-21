import { useCallback, useState } from 'react'
import { useAppStore } from '@store/appStore'
import type { SceneManager } from '@scene/SceneManager'
import type { useAR } from '@ar/useAR'
import StatusChip from './StatusChip'
import GlyphReferencePanel from './GlyphReferencePanel'

interface HUDProps {
  sceneRef: React.MutableRefObject<SceneManager | null>
  arHook: ReturnType<typeof useAR>
  hasBg?: boolean
  onCaptureBg?: () => void
  onClearBg?: () => void
}

/** Prevents touches on interactive elements from propagating to the scene tap handler */
function stopTouch(e: React.TouchEvent) {
  e.stopPropagation()
}

export default function HUD({ arHook, hasBg, onCaptureBg, onClearBg }: HUDProps) {
  const { capabilities, visionReady, classifierReady, lastDetection, arStatus } = useAppStore()
  const { mode, isActive, start, stop, handleTap, clear, needsOrientationPermission } = arHook
  const [glyphPanelOpen, setGlyphPanelOpen] = useState(false)

  const onSceneTap = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isActive) return
      const { clientX, clientY } = 'touches' in e ? (e.changedTouches[0] ?? e.touches[0]) : e
      handleTap(clientX, clientY)
    },
    [isActive, handleTap]
  )

  const handleStart = useCallback(() => {
    const dev = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (needsOrientationPermission && typeof dev.requestPermission === 'function') {
      dev.requestPermission().catch(() => {})
    }
    start()
  }, [start, needsOrientationPermission])

  const btnStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    pointerEvents: 'all',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    ...extra,
  })

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
      onTouchStart={onSceneTap}
      onClick={onSceneTap}
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
        onTouchStart={stopTouch}
        onClick={e => e.stopPropagation()}
      >
        {mode !== 'none' && (
          <span
            style={{
              background: 'rgba(0,0,0,0.55)',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {mode === 'webxr' ? 'WebXR' : 'Camera'}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {isActive && onCaptureBg && (
            <button
              style={btnStyle({
                background: hasBg ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)',
                border: `1px solid ${hasBg ? 'rgba(16,185,129,0.6)' : 'rgba(99,102,241,0.5)'}`,
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
              })}
              onClick={() => {
                if (hasBg && onClearBg) onClearBg()
                else onCaptureBg()
              }}
            >
              {hasBg ? '✅ BG' : '📷 Set BG'}
            </button>
          )}

          {isActive && (
            <button
              style={btnStyle({
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 13,
              })}
              onClick={clear}
            >
              Clear
            </button>
          )}

          <button
            style={btnStyle({
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              fontSize: 20,
            })}
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
        onTouchStart={stopTouch}
        onClick={e => e.stopPropagation()}
      >
        <button
          style={btnStyle({
            background: glyphPanelOpen ? 'rgba(99,102,241,0.5)' : 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            fontSize: 20,
          })}
          aria-label="Glyph Reference"
          onClick={() => setGlyphPanelOpen(v => !v)}
        >
          📖
        </button>

        <button
          style={btnStyle({
            background: isActive ? 'rgba(239,68,68,0.85)' : 'rgba(99,102,241,0.9)',
            borderRadius: 32,
            padding: '14px 28px',
            fontSize: 16,
            fontWeight: 600,
          })}
          onClick={() => (isActive ? stop() : handleStart())}
        >
          {isActive ? 'Stop AR' : 'Start AR'}
        </button>

        <button
          style={btnStyle({
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            fontSize: 20,
          })}
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
