// Tag chip — color-coded: jade for free, gold for trending, glass default
export function Chip({ label, variant = 'default' }) {
  const isFree = label.toLowerCase().includes('free') || label.includes('免費');
  const isTrending = label.toLowerCase().includes('trending') || label.includes('熱門');
  const tint = isFree
    ? { bg: 'rgba(127,164,145,0.28)', border: 'rgba(127,164,145,0.55)', fg: '#CDE5D6' }
    : isTrending
    ? { bg: 'rgba(232,176,75,0.28)', border: 'rgba(232,176,75,0.55)', fg: '#FFDFA0' }
    : { bg: 'rgba(255,255,255,0.14)', border: 'rgba(255,255,255,0.28)', fg: '#fff' };

  return (
    <div style={{
      padding: '6px 11px',
      borderRadius: 9999,
      background: tint.bg,
      border: `1px solid ${tint.border}`,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      fontFamily: '"Plus Jakarta Sans", system-ui',
      fontSize: 12,
      fontWeight: 600,
      color: tint.fg,
      letterSpacing: -0.1,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

// Category chip for Map/filters — solid bg
export function CatChip({ label, active, color, dot, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: 34,
        padding: '0 14px',
        borderRadius: 9999,
        background: active ? color : '#fff',
        color: active ? '#fff' : '#1A1A1A',
        border: 'none',
        cursor: 'pointer',
        fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: -0.1,
        boxShadow: '0 4px 12px rgba(26,15,10,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      {dot && (
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: active ? '#fff' : color,
          flexShrink: 0,
        }} />
      )}
      {label}
    </button>
  );
}
