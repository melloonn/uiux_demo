import { VIBE_FALLBACK } from '../../data/events.js';

const VIBES = [
  { id: 'festivals',          labelEn: 'Festivals',     labelZh: '節慶燈會', emoji: '🏮', vibe: 'warm',  filterCat: 'festivals' },
  { id: 'night-markets',      labelEn: 'Night Markets', labelZh: '夜市美食', emoji: '🍢', vibe: 'neon',  filterCat: 'night-markets' },
  { id: 'live-music',         labelEn: 'Live Music',    labelZh: '現場演出', emoji: '🎸', vibe: 'night', filterCat: 'live-music' },
  { id: 'temples-heritage',   labelEn: 'Heritage',      labelZh: '古蹟廟宇', emoji: '⛩️', vibe: 'amber', filterCat: 'temples-heritage' },
  { id: 'art-markets',        labelEn: 'Art & Markets', labelZh: '藝文市集', emoji: '🎨', vibe: 'jade',  filterCat: 'art-markets' },
  { id: 'exhibitions',        labelEn: 'Exhibitions',   labelZh: '展覽',     emoji: '🖼️', vibe: 'night', filterCat: 'exhibitions' },
];

export { VIBES };

export function VibeTile({ vibe, lang = 'en', onClick }) {
  const bg = VIBE_FALLBACK[vibe.vibe] ?? VIBE_FALLBACK.warm;
  const label = lang === 'zh' ? vibe.labelZh : vibe.labelEn;

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        background: bg,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        width: '100%',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6,
      }}>
        <span style={{ fontSize: 28 }}>{vibe.emoji}</span>
        <span style={{
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 12, fontWeight: 800, color: '#fff',
          letterSpacing: -0.2, textAlign: 'center',
          padding: '0 8px', textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          {label}
        </span>
      </div>
    </button>
  );
}
