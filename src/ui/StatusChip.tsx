export type ARStatus =
  | 'idle'
  | 'starting'
  | 'scanning'
  | 'scanning-no-surface'
  | 'scanning-poor-surface'
  | 'surface-found'
  | 'detecting'
  | 'placing'
  | 'ready'

interface StatusChipProps {
  status: ARStatus
  detectedGlyph?: string
}

const STATUS_CONFIG: Record<
  ARStatus,
  { label: string; color: string; bg: string; pulse?: boolean }
> = {
  idle: { label: 'Tap Start AR', color: 'rgba(255,255,255,0.5)', bg: 'rgba(0,0,0,0.4)' },
  starting: {
    label: 'Starting…',
    color: '#a5b4fc',
    bg: 'rgba(99,102,241,0.25)',
    pulse: true,
  },
  scanning: {
    label: '🔍 Point at a flat surface',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.2)',
    pulse: true,
  },
  'scanning-no-surface': {
    label: '🔍 Move closer to a flat surface',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.2)',
    pulse: true,
  },
  'scanning-poor-surface': {
    label: '⚠️ Try a smoother surface — table, paper, floor',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.2)',
    pulse: true,
  },
  'surface-found': {
    label: '✅ Surface detected',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.2)',
  },
  detecting: {
    label: '👁 Draw a glyph on the surface',
    color: '#a5b4fc',
    bg: 'rgba(99,102,241,0.25)',
    pulse: true,
  },
  placing: {
    label: '✨ Placing shape…',
    color: '#f9a8d4',
    bg: 'rgba(236,72,153,0.2)',
  },
  ready: { label: '🟢 Ready — draw or tap', color: '#34d399', bg: 'rgba(16,185,129,0.2)' },
}

export default function StatusChip({ status, detectedGlyph }: StatusChipProps) {
  const cfg = STATUS_CONFIG[status]
  const label = status === 'placing' && detectedGlyph ? `✨ Placing ${detectedGlyph}…` : cfg.label

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 14px',
        borderRadius: 20,
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontSize: 13,
        fontWeight: 500,
        color: cfg.color,
        pointerEvents: 'none',
        transition: 'all 0.3s',
        animation: cfg.pulse ? 'pulse 1.5s ease-in-out infinite' : 'none',
        maxWidth: 'calc(100vw - 48px)',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  )
}
