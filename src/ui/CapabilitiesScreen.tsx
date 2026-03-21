import type { Capabilities } from '@platform/capabilities'

interface CheckItem {
  label: string
  description: string
  status: 'ok' | 'warn' | 'fail'
  detail: string
}

interface Props {
  capabilities: Capabilities
  onContinue: () => void
}

export default function CapabilitiesScreen({ capabilities, onContinue }: Props) {
  const checks: CheckItem[] = [
    {
      label: 'Camera',
      description: 'Required to see your drawing surface',
      status: capabilities.camera ? 'ok' : 'fail',
      detail: capabilities.camera ? 'Available' : 'Not available — camera access is required',
    },
    {
      label: 'WebGL 2',
      description: 'Required for 3D rendering',
      status: capabilities.webgl2 ? 'ok' : 'fail',
      detail: capabilities.webgl2 ? 'Supported' : 'Not supported — try a different browser',
    },
    {
      label: 'AR Mode',
      description: 'WebXR for precise surface tracking',
      status: capabilities.webxr ? 'ok' : 'warn',
      detail: capabilities.webxr
        ? 'Full WebXR AR available'
        : 'WebXR not available — using camera fallback mode (works, less precise)',
    },
    {
      label: 'Performance',
      description: 'Device memory and quality tier',
      status: capabilities.qualityTier === 'full' ? 'ok' : 'warn',
      detail:
        capabilities.qualityTier === 'full'
          ? `Full quality mode (${capabilities.deviceMemoryGb ?? '?'}GB RAM)`
          : `Lite mode — lower quality to maintain performance (${capabilities.deviceMemoryGb ?? '?'}GB RAM)`,
    },
  ]

  const hasFail = checks.some(c => c.status === 'fail')
  const hasWarn = checks.some(c => c.status === 'warn')

  const ICON = { ok: '✅', warn: '⚠️', fail: '❌' }
  const COLOR = {
    ok: 'rgba(16,185,129,0.15)',
    warn: 'rgba(251,191,36,0.12)',
    fail: 'rgba(239,68,68,0.12)',
  }
  const BORDER = {
    ok: 'rgba(16,185,129,0.3)',
    warn: 'rgba(251,191,36,0.3)',
    fail: 'rgba(239,68,68,0.3)',
  }
  const TEXT = { ok: '#34d399', warn: '#fbbf24', fail: '#f87171' }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0a0a18',
        display: 'flex',
        flexDirection: 'column',
        padding: 'max(24px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom))',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🗺</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>RealmSight</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Checking your device capabilities…
        </p>
      </div>

      {/* Check items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 420,
          width: '100%',
          margin: '0 auto',
          flex: 1,
        }}
      >
        {checks.map(check => (
          <div
            key={check.label}
            style={{
              background: COLOR[check.status],
              border: `1px solid ${BORDER[check.status]}`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{ICON[check.status]}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: 14 }}>
                  {check.label}
                </p>
                <span style={{ fontSize: 11, color: TEXT[check.status], fontWeight: 600 }}>
                  {check.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {check.description}
              </p>
              {check.status !== 'ok' && (
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 12,
                    color: TEXT[check.status],
                    lineHeight: 1.5,
                  }}
                >
                  {check.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary + CTA */}
      <div style={{ maxWidth: 420, width: '100%', margin: '24px auto 0' }}>
        {hasFail ? (
          <p style={{ textAlign: 'center', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
            Some required features are missing. RealmSight may not work on this device or browser.
          </p>
        ) : hasWarn ? (
          <p style={{ textAlign: 'center', color: '#fbbf24', fontSize: 13, marginBottom: 16 }}>
            Everything works, but some features are limited on this device.
          </p>
        ) : (
          <p style={{ textAlign: 'center', color: '#34d399', fontSize: 13, marginBottom: 16 }}>
            All systems go! Your device is fully supported.
          </p>
        )}
        <button
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '16px',
            background: hasFail ? 'rgba(99,102,241,0.5)' : '#6366f1',
            border: 'none',
            borderRadius: 16,
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {hasFail ? 'Continue anyway' : 'Get Started →'}
        </button>
      </div>
    </div>
  )
}
