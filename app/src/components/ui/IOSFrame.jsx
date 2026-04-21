// IOSFrame — wraps the app in an iPhone 16 Pro shell for demo/prototype display
// In production (full-screen mobile), omit this and just render children directly.
export function IOSFrame({ children, dark = false, width = 390, height = 844 }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      flexShrink: 0,
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
        pointerEvents: 'none',
      }} />
      {/* Status bar spacer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 59,
        zIndex: 10, pointerEvents: 'none',
      }} />
      {/* Content */}
      <div style={{ height: '100%', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none',
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100,
          background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)',
        }} />
      </div>
    </div>
  );
}
