import { useContext, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { EVENTS, VIBE_FALLBACK } from '../data/events.js';
import { Heart, CalendarDays, MapPin, Share2, ChevronUp } from 'lucide-react';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';
import { ShareSheet } from '../components/ui/ShareSheet.jsx';

// Seeded shuffle so logo-tap always gives a different order
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Logo({ color = '#fff', onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3.5c2 3.5 5.5 5 5.5 9.2 0 3.2-2.5 5.8-5.5 5.8s-5.5-2.6-5.5-5.8C6.5 8.5 10 7 12 3.5z" fill={color} opacity="0.95"/>
        <path d="M12 8c.9 1.8 2.6 2.7 2.6 4.8 0 1.7-1.2 3-2.6 3s-2.6-1.3-2.6-3C9.4 10.7 11.1 9.8 12 8z" fill="#D94F30" opacity="0.9"/>
      </svg>
      <span style={{ fontFamily: '"Plus Jakarta Sans", system-ui', fontWeight: 800, fontSize: 17, color, letterSpacing: -0.3 }}>
        CultureFlow
      </span>
    </button>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#fff',
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        background: 'rgba(0,0,0,0.28)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
      }}>
        {icon}
      </div>
      <span style={{
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontSize: 11, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)', letterSpacing: 0.1,
      }}>{label}</span>
    </button>
  );
}

function FeedSlide({ ev, lang, active, idx, total, saved, planned, onSave, onPlan, onMap, onShare }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const tags = lang === 'zh' ? ev.tagsZh : ev.tags;
  const title = lang === 'zh' ? ev.title.zh : ev.title.en;
  const subtitle = lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en;

  return (
    <div style={{
      scrollSnapAlign: 'start',
      position: 'relative', width: '100%', height: '100%',
      flexShrink: 0, overflow: 'hidden', background: '#000',
    }}>
      {/* Hero */}
      <div style={{ position: 'absolute', inset: 0, background: VIBE_FALLBACK[ev.vibe] ?? VIBE_FALLBACK.warm }}>
        <img
          src={ev.img} alt=""
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
            transform: active ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      </div>

      {/* Scrims */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,5,3,0.4) 45%, rgba(10,5,3,0.88) 100%)', pointerEvents: 'none' }}/>

      {/* Left content rail */}
      <div style={{ position: 'absolute', left: 20, right: 92, bottom: 108, color: '#fff' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14,
          padding: '4px 12px 4px 4px', borderRadius: 9999,
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8B04B, #D94F30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff',
          }}>{ev.host.charAt(0)}</div>
          <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11.5, fontWeight: 600, letterSpacing: -0.1 }}>{ev.host}</span>
        </div>
        <h2 style={{
          margin: '0 0 6px', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 30, fontWeight: 900, lineHeight: 1.05, letterSpacing: -0.9,
          textShadow: '0 2px 14px rgba(0,0,0,0.45)',
        }}>{title}</h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 14, fontWeight: 500,
          color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#E8B04B', boxShadow: '0 0 8px #E8B04B' }}/>
          {subtitle}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tags.map(t => <Chip key={t} label={t} />)}
        </div>
      </div>

      {/* Right action rail */}
      <div style={{ position: 'absolute', right: 14, bottom: 120, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
        <ActionBtn
          icon={<Heart size={24} fill={saved ? '#D94F30' : 'none'} color={saved ? '#D94F30' : '#fff'} />}
          label={ev.saves}
          onClick={() => onSave(ev.id)}
        />
        <ActionBtn
          icon={<CalendarDays size={24} color={planned ? '#E8B04B' : '#fff'} />}
          label={lang === 'zh' ? '計畫' : 'Plan'}
          onClick={() => onPlan(ev.id)}
        />
        <ActionBtn
          icon={<MapPin size={24} color="#fff" />}
          label={lang === 'zh' ? '地圖' : 'Map'}
          onClick={() => onMap(ev.id)}
        />
        <ActionBtn
          icon={<Share2 size={22} color="#fff" />}
          label={lang === 'zh' ? '分享' : 'Share'}
          onClick={() => onShare(ev)}
        />
      </div>

      {/* Swipe hint on first card */}
      {idx === 0 && active && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 98,
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 600,
          letterSpacing: 1.2, textTransform: 'uppercase',
          animation: 'bob 1.6s ease-in-out infinite', pointerEvents: 'none',
        }}>
          <ChevronUp size={16} color="rgba(255,255,255,0.7)" />
          <span>{lang === 'zh' ? '向上滑動' : 'Swipe for next'}</span>
        </div>
      )}

      {/* Progress pips */}
      <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: 2, height: i === idx ? 16 : 6, borderRadius: 1,
            background: i === idx ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
            transition: 'height 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  );
}

export default function ReelsFeed() {
  const { lang, setLang, saved, planned, toggleSave, togglePlan } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [events, setEvents] = useState(EVENTS);
  const [shareEvent, setShareEvent] = useState(null); // event being shared
  const [toast, setToast] = useState(null);
  const [feedTab, setFeedTab] = useState('foryou'); // 'foryou' | 'nearby'
  const scrollRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIdx(Math.round(el.scrollTop / el.clientHeight));
  };

  // Logo tap: reshuffle + scroll to top + toast
  const handleLogoTap = () => {
    setEvents(shuffle(EVENTS));
    setActiveIdx(0);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    showToast('✨ ' + (lang === 'zh' ? '已刷新推薦' : 'Refreshed with new picks'));
  };

  // Map button: navigate to /map?focus=eventId
  const handleMap = (eventId) => {
    navigate(`/map?focus=${eventId}`);
  };

  // Share button: open share sheet
  const handleShare = (ev) => {
    setShareEvent(ev);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, zIndex: 20,
        padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <Logo onClick={handleLogoTap} />
        </div>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          {/* For You / Nearby toggle */}
          <div style={{
            display: 'flex', gap: 2, padding: 3, borderRadius: 9999,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {[
              { k: 'foryou', en: 'For You', zh: '為你推薦' },
              { k: 'nearby', en: 'Nearby',  zh: '附近' },
            ].map(tab => (
              <button key={tab.k} onClick={() => setFeedTab(tab.k)} style={{
                padding: '6px 12px', borderRadius: 9999,
                background: feedTab === tab.k ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: feedTab === tab.k ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
                border: 'none', fontFamily: '"Plus Jakarta Sans"',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.18s',
              }}>{lang === 'zh' ? tab.zh : tab.en}</button>
            ))}
          </div>
          <GlobeToggle lang={lang} setLang={setLang} dark />
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          position: 'absolute', inset: 0,
          overflowY: 'scroll', overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {events.map((ev, i) => (
          <div key={ev.id + i} style={{ width: '100%', height: '100%', flexShrink: 0 }}>
            <FeedSlide
              ev={ev} lang={lang} active={i === activeIdx}
              idx={i} total={events.length}
              saved={saved.has(ev.id)} planned={planned.has(ev.id)}
              onSave={toggleSave} onPlan={togglePlan}
              onMap={handleMap}
              onShare={handleShare}
            />
          </div>
        ))}
      </div>

      {/* TabBar */}
      <TabBar lang={lang} dark={true} />

      {/* Global toast */}
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', top: '44%',
          transform: 'translate(-50%, -50%)',
          padding: '10px 18px', borderRadius: 14,
          background: 'rgba(20,10,8,0.82)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', fontFamily: '"Plus Jakarta Sans"',
          fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
          pointerEvents: 'none', zIndex: 60,
          animation: 'toastIn 0.3s ease',
        }}>{toast}</div>
      )}

      {/* Share sheet */}
      {shareEvent && (
        <ShareSheet
          event={shareEvent}
          lang={lang}
          onClose={() => setShareEvent(null)}
          onToast={showToast}
        />
      )}

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translate(-50%, 0); opacity: 0.7; }
          50% { transform: translate(-50%, -6px); opacity: 1; }
        }
        @keyframes toastIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes sheetUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
