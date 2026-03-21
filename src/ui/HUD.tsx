import { useAppStore } from '@store/appStore'

export default function HUD() {
  const { capabilities } = useAppStore()

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
        <button
          style={{ pointerEvents: 'all', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 20 }}
          aria-label="Settings"
        >⚙</button>
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px 16px', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        <button
          style={{ pointerEvents: 'all', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 20 }}
          aria-label="Glyph Reference"
        >📖</button>
        <button
          style={{ pointerEvents: 'all', background: 'rgba(255,255,255,0.15)', border: '3px solid #fff', borderRadius: '50%', width: 72, height: 72, color: '#fff', fontSize: 28 }}
          aria-label="Capture"
        >📷</button>
        <button
          style={{ pointerEvents: 'all', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 20 }}
          aria-label="Share"
        >🔗</button>
      </div>

      {/* Dev badge */}
      {import.meta.env.DEV && capabilities && (
        <div style={{ position: 'absolute', top: 70, right: 16, background: 'rgba(0,0,0,0.7)', padding: '6px 10px', borderRadius: 8, fontSize: 11, lineHeight: 1.6, pointerEvents: 'none' }}>
          <div>WebXR: {capabilities.webxr ? '✅' : '❌'} | WebGL2: {capabilities.webgl2 ? '✅' : '❌'}</div>
          <div>iOS: {capabilities.isIOS ? '✅' : '❌'} | Android: {capabilities.isAndroid ? '✅' : '❌'}</div>
          <div>Quality: {capabilities.qualityTier.toUpperCase()} | RAM: {capabilities.deviceMemoryGb ?? '?'}GB</div>
        </div>
      )}
    </div>
  )
}
