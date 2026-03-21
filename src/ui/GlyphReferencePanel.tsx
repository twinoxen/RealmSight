import { useState } from 'react'
import { GLYPH_LABELS, GLYPH_META } from '@vision/glyphs'
import type { GlyphLabel } from '@vision/glyphs'

interface GlyphReferenceProps {
  isOpen: boolean
  onClose: () => void
}

const DRAWING_TIPS: Record<GlyphLabel, { strokes: string; tip: string }> = {
  house: {
    strokes: '3 strokes',
    tip: 'Draw a triangle on top of a square — like a simple house outline.',
  },
  castle: {
    strokes: '4 strokes',
    tip: 'Draw a tall rectangle with small squares on top for battlements.',
  },
  bridge: {
    strokes: '2 strokes',
    tip: 'Draw an arch (half circle) with a horizontal line across the top.',
  },
  road: { strokes: '2 strokes', tip: 'Draw two parallel horizontal lines close together.' },
  river: { strokes: '1 stroke', tip: 'Draw a loose wavy/squiggly horizontal line.' },
  tree: {
    strokes: '2 strokes',
    tip: 'Draw a tall triangle. Add a short line at the base for the trunk.',
  },
  mountain: { strokes: '1 stroke', tip: 'Draw a wide triangle (like an upside-down V).' },
  temple: { strokes: '3 strokes', tip: 'Draw a rectangle with a cross (+) on top.' },
}

const GLYPH_DRAWINGS: Record<GlyphLabel, string> = {
  house: '🏠',
  castle: '🏰',
  bridge: '🌉',
  road: '═══',
  river: '〰️',
  tree: '🌲',
  mountain: '⛰️',
  temple: '⛪',
}

export default function GlyphReferencePanel({ isOpen, onClose }: GlyphReferenceProps) {
  const [selected, setSelected] = useState<GlyphLabel | null>(null)

  if (!isOpen) return null

  const selectedMeta = selected ? GLYPH_META[selected] : null
  const selectedTip = selected ? DRAWING_TIPS[selected] : null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 20,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 21,
          background: '#0f0f1a',
          borderRadius: '20px 20px 0 0',
          border: '1px solid rgba(99,102,241,0.2)',
          padding: '0 0 max(24px, env(safe-area-inset-bottom)) 0',
          animation: 'slideUp 0.3s ease',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle + header */}
        <div
          style={{
            padding: '12px 20px 0',
            position: 'sticky',
            top: 0,
            background: '#0f0f1a',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              margin: '0 auto 16px',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Glyph Reference
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                Draw these symbols on any flat surface
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Detail card when glyph selected */}
        {selected && selectedMeta && selectedTip && (
          <div
            style={{
              margin: '0 16px 16px',
              padding: 16,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 16,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 40 }}>{GLYPH_DRAWINGS[selected]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 15 }}>
                  {selectedMeta.displayName}
                </p>
                <p style={{ margin: '2px 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  {selectedTip.strokes}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedTip.tip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Glyph grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            padding: '0 16px',
          }}
        >
          {GLYPH_LABELS.map(label => {
            const meta = GLYPH_META[label]
            const isSelected = selected === label
            return (
              <button
                key={label}
                onClick={() => setSelected(isSelected ? null : label)}
                style={{
                  background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSelected ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14,
                  padding: '12px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 28 }}>{GLYPH_DRAWINGS[label]}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: isSelected ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {meta.displayName.split(' /')[0]}
                </span>
              </button>
            )
          })}
        </div>

        <p
          style={{
            margin: '16px 16px 0',
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
          }}
        >
          Tap a glyph to see drawing tips
        </p>
      </div>
    </>
  )
}
