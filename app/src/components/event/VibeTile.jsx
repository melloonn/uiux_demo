import { VIBE_FALLBACK, CATEGORY_ICON } from '../../data/events.js';

const VIBES = [
  { id: 'festivals',          labelEn: 'Festivals',     labelZh: '節慶燈會', vibe: 'warm',  filterCat: 'festivals' },
  { id: 'night-markets',      labelEn: 'Night Markets', labelZh: '夜市美食', vibe: 'neon',  filterCat: 'night-markets' },
  { id: 'live-music',         labelEn: 'Live Music',    labelZh: '現場演出', vibe: 'night', filterCat: 'live-music' },
  { id: 'temples-heritage',   labelEn: 'Heritage',      labelZh: '古蹟廟宇', vibe: 'amber', filterCat: 'temples-heritage' },
  { id: 'art-markets',        labelEn: 'Art & Markets', labelZh: '藝文市集', vibe: 'jade',  filterCat: 'art-markets' },
  { id: 'exhibitions',        labelEn: 'Exhibitions',   labelZh: '展覽',     vibe: 'night', filterCat: 'exhibitions' },
].map(v => ({ ...v, emoji: CATEGORY_ICON[v.id] ?? '●' }));

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
