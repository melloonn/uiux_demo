// Horizontal event card for the Home screen list view
import { useNavigate } from 'react-router-dom';
import { Heart, CalendarDays } from 'lucide-react';
import { VIBE_FALLBACK, PIN_COLOR, CATEGORY_LABEL } from '../../data/events.js';

export function EventCard({ event, lang = 'en', saved, planned, onSave, onPlan }) {
  const navigate = useNavigate();
  const t = (obj) => (typeof obj === 'object' ? obj[lang] ?? obj.en : obj);
  const color = PIN_COLOR[event.category] ?? '#D94F30';

  return (
    <div
      style={{
        display: 'flex', gap: 12, padding: '12px 20px',
        cursor: 'pointer', alignItems: 'center',
      }}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      {/* Thumbnail */}
      <div style={{
        width: 72, height: 72, borderRadius: 14, flexShrink: 0,
        background: VIBE_FALLBACK[event.vibe] ?? VIBE_FALLBACK.warm,
        backgroundImage: `url(${event.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 4, left: 4,
          padding: '2px 7px', borderRadius: 9999,
          background: color,
          fontFamily: '"Plus Jakarta Sans"', fontSize: 9, fontWeight: 800, color: '#fff',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {CATEGORY_LABEL[event.category]?.[lang] ?? event.category}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 15, fontWeight: 800, color: '#1A1A1A',
          letterSpacing: -0.3, lineHeight: 1.2, marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t(event.title)}
        </div>
        <div style={{
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 12, fontWeight: 500, color: '#8A6F4A',
          marginBottom: 6,
        }}>
          {t(event.subtitle)}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(lang === 'zh' ? event.tagsZh : event.tags).slice(0, 2).map(tag => (
            <span key={tag} style={{
              padding: '3px 8px', borderRadius: 9999,
              background: tag.includes('免費') || tag.toLowerCase().includes('free')
                ? 'rgba(127,164,145,0.15)' : 'rgba(26,15,10,0.06)',
              color: tag.includes('免費') || tag.toLowerCase().includes('free') ? '#4A8066' : '#6B5335',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onSave?.(event.id); }}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: saved ? 'rgba(217,79,48,0.1)' : 'rgba(26,15,10,0.05)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Heart size={15} fill={saved ? '#D94F30' : 'none'} color={saved ? '#D94F30' : '#8A6F4A'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPlan?.(event.id); }}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: planned ? 'rgba(232,176,75,0.15)' : 'rgba(26,15,10,0.05)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CalendarDays size={15} fill={planned ? '#E8B04B' : 'none'} color={planned ? '#E8B04B' : '#8A6F4A'} />
        </button>
      </div>
    </div>
  );
}
