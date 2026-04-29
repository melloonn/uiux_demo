import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

export function GlobeToggle({ lang, setLang, dark = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const btnBg = open
    ? (dark ? 'rgba(255,255,255,0.25)' : '#1A1A1A')
    : (dark ? 'rgba(0,0,0,0.3)' : 'rgba(26,15,10,0.07)');
  const iconColor = (open && !dark) ? '#fff' : (dark ? '#fff' : '#1A1A1A');
  const labelColor = dark ? 'rgba(255,255,255,0.9)' : '#1A1A1A';
  const btnBorder = dark
    ? '1px solid rgba(255,255,255,0.22)'
    : '1px solid rgba(26,15,10,0.12)';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36, borderRadius: 9999, paddingLeft: 10, paddingRight: 12,
          background: btnBg,
          backdropFilter: dark ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: dark ? 'blur(14px)' : 'none',
          border: btnBorder,
          display: 'flex', alignItems: 'center', gap: 5,
          cursor: 'pointer', transition: 'background 0.2s',
        }}
      >
        <Globe size={14} color={iconColor} />
        <span style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 12, fontWeight: 700, color: labelColor, letterSpacing: 0.1 }}>
          {lang === 'zh' ? '中文' : 'EN'}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0,
          width: 160, padding: 6, borderRadius: 14,
          background: 'rgba(255,253,248,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(26,15,10,0.08)',
          boxShadow: '0 16px 40px rgba(26,15,10,0.18)',
          zIndex: 200,
        }}>
          {[
            { value: 'en', flag: '🇬🇧', label: 'English' },
            { value: 'zh', flag: '🇹🇼', label: '中文' },
          ].map(({ value, flag, label }) => (
            <button
              key={value}
              onClick={() => { setLang(value); setOpen(false); }}
              style={{
                width: '100%', height: 38, padding: '0 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                background: lang === value ? 'rgba(217,79,48,0.08)' : 'transparent',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: '"Plus Jakarta Sans", system-ui',
                fontSize: 14, fontWeight: lang === value ? 700 : 600,
                color: lang === value ? '#D94F30' : '#1A1A1A',
              }}
            >
              <span style={{ fontSize: 16 }}>{flag}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {lang === value && <span style={{ fontSize: 12, color: '#D94F30' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
