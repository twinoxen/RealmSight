import { usePWAInstall } from './usePWAInstall'

export default function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall()

  if (!canInstall) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(15,15,26,0.92)',
        border: '1px solid rgba(99,102,241,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 16,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 320,
        width: 'calc(100vw - 32px)',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <span style={{ fontSize: 28 }}>🗺</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>
          Install RealmSight
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          Add to home screen for quick access
        </p>
      </div>
      <button
        onClick={install}
        style={{
          background: '#6366f1',
          border: 'none',
          borderRadius: 10,
          padding: '7px 14px',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Install
      </button>
    </div>
  )
}
