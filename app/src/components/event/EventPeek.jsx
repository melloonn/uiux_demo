import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { LogisticsCapsule } from '../ui/LogisticsCapsule.jsx';
import { PIN_COLOR, CATEGORY_LABEL } from '../../data/events.js';

export function EventPeek({ event, lang = 'en', onClose }) {
  const navigate = useNavigate();
  if (!event) return null;

  const color = PIN_COLOR[event.category] ?? '#D94F30';
  const t = (obj) => (typeof obj === 'object' ? obj[lang] ?? obj.en : obj);

  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 92,
      zIndex: 30, padding: 12, borderRadius: 22, background: '#fff',
      boxShadow: '0 24px 60px rgba(26,15,10,0.2), 0 2px 6px rgba(26,15,10,0.05)',
      border: '1px solid rgba(26,15,10,0.05)',
      animation: 'peekIn 0.35s cubic-bezier(.34,1.2,.64,1)',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', position: 'relative' }}>
        {/* thumbnail */}
        <div style={{
          width: 84, height: 84, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, #1A1A1A)`,
          backgroundImage: `url(${event.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%)' }} />
        </div>

        {/* info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 2, paddingRight: 26 }}>
          <div>
            <div style={{
              fontFamily: '"Plus Jakarta Sans", system-ui',
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color, textTransform: 'uppercase', marginBottom: 3,
            }}>
              {CATEGORY_LABEL[event.category]?.[lang] ?? event.category} · {t(event.location)}
            </div>
            <div style={{
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 16, fontWeight: 800, color: '#1A1A1A',
              letterSpacing: -0.4, lineHeight: 1.15,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {t(event.title)}
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            <LogisticsCapsule
              dist={event.dist}
              stops={event.stops}
              price={event.price}
              priceZh={event.priceZh}
              free={event.free}
              lang={lang}
            />
          </div>
        </div>

        {/* close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 0, right: 0,
          width: 24, height: 24, borderRadius: '50%',
          background: '#F4EDDF', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={12} color="#8A6F4A" />
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate(`/event/${event.id}`)}
        style={{
          marginTop: 12, width: '100%', height: 44,
          borderRadius: 14, border: 'none', cursor: 'pointer',
          background: '#1A1A1A', color: '#fff',
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        {lang === 'zh' ? '查看詳情' : 'View Details'}
        <ChevronRight size={16} color="#fff" />
      </button>

      <style>{`
        @keyframes peekIn {
          0% { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
