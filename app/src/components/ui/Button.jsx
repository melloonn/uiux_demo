// Shared button primitives
export function PrimaryButton({ children, onClick, className = '', style = {} }) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        height: 48,
        borderRadius: 14,
        background: '#1A1A1A',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: -0.1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 48,
        borderRadius: 14,
        background: 'rgba(26,15,10,0.06)',
        color: '#1A1A1A',
        border: 'none',
        cursor: 'pointer',
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontSize: 14,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function CircleButton({ children, onClick, accent = false, size = 46 }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: accent ? '#1A1A1A' : '#fff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(26,15,10,0.10), 0 1px 2px rgba(26,15,10,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
