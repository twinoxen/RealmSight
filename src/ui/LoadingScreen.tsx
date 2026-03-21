interface LoadingScreenProps {
  stage: 'app' | 'camera' | 'vision' | 'classifier'
  progress?: number // 0-100
}

const STAGE_LABELS: Record<LoadingScreenProps['stage'], string> = {
  app: 'Starting up…',
  camera: 'Opening camera…',
  vision: 'Loading computer vision…',
  classifier: 'Loading AI model…',
}

const STAGE_ORDER: LoadingScreenProps['stage'][] = ['app', 'camera', 'vision', 'classifier']

export default function LoadingScreen({ stage, progress }: LoadingScreenProps) {
  const stageIndex = STAGE_ORDER.indexOf(stage)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0f0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 32,
      }}
    >
      {/* Logo / wordmark */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🗺</div>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}
        >
          RealmSight
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Draw maps. See worlds.
        </p>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }}
      />

      {/* Stage label */}
      <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
        {STAGE_LABELS[stage]}
      </p>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {STAGE_ORDER.map((s, i) => (
          <div
            key={s}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                i < stageIndex
                  ? '#10b981'
                  : i === stageIndex
                    ? '#6366f1'
                    : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Optional progress bar */}
      {progress !== undefined && (
        <div
          style={{
            width: '100%',
            maxWidth: 240,
            height: 3,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#6366f1',
              transition: 'width 0.3s',
            }}
          />
        </div>
      )}
    </div>
  )
}
