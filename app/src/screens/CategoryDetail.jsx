import { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { EventCard } from '../components/event/EventCard.jsx';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';
import { EVENTS, VIBE_FALLBACK } from '../data/events.js';
import { VIBES } from '../components/event/VibeTile.jsx';
import { ChevronLeft } from 'lucide-react';

function filterEvents(events, vibe) {
  return events.filter(ev => {
    if (vibe.filterCat && vibe.filterVibe) {
      return ev.category === vibe.filterCat && ev.vibe === vibe.filterVibe;
    }
    if (vibe.filterCat) return ev.category === vibe.filterCat;
    if (vibe.filterVibe) return ev.vibe === vibe.filterVibe;
    return true;
  });
}

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { lang, setLang, saved, planned, toggleSave, togglePlan } = useContext(AppContext);

  const vibe = VIBES.find(v => v.id === categoryId);
  if (!vibe) return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, color: '#8A6F4A' }}>Category not found</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 12, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700 }}>Go back</button>
    </div>
  );

  const label = lang === 'zh' ? vibe.labelZh : vibe.labelEn;
  const filteredEvents = filterEvents(EVENTS, vibe);
  const heroBg = VIBE_FALLBACK[vibe.vibe] ?? VIBE_FALLBACK.warm;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>

      {/* Scrollable content — stops above TabBar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>

        {/* Hero */}
        <div style={{
          position: 'relative', height: 220,
          background: heroBg,
          backgroundSize: 'cover', backgroundPosition: 'center',
          flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' }} />

          <button onClick={() => navigate(-1)} style={{
            position: 'absolute', top: 58, left: 16,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ChevronLeft size={20} color="#fff" />
          </button>

          <div style={{ position: 'absolute', top: 58, right: 16 }}>
            <GlobeToggle lang={lang} setLang={setLang} dark />
          </div>

          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{vibe.emoji}</div>
            <h1 style={{
              margin: 0,
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 28, fontWeight: 900, letterSpacing: -0.5, color: '#fff',
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}>{label}</h1>
          </div>
        </div>

        {/* Horizontal snap carousel */}
        {filteredEvents.length > 0 && (
          <div style={{ padding: '20px 0 4px' }}>
            <div style={{
              display: 'flex', gap: 12, overflowX: 'auto',
              scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
              padding: '0 20px 8px',
            }}>
              {filteredEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/event/${ev.id}`)}
                  style={{
                    flexShrink: 0, width: '80%', scrollSnapAlign: 'start',
                    borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                    height: 180, position: 'relative',
                    backgroundImage: `url(${ev.img})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                    <p style={{ margin: '0 0 3px', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                      {lang === 'zh' ? ev.title.zh : ev.title.en}
                    </p>
                    <p style={{ margin: 0, fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                      {lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event list */}
        <div style={{ paddingTop: 12 }}>
          <p style={{
            fontFamily: '"Plus Jakarta Sans", system-ui',
            fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
            color: '#8A6F4A', textTransform: 'uppercase',
            padding: '0 20px', marginBottom: 4,
          }}>
            {filteredEvents.length} {lang === 'zh' ? '個活動' : (filteredEvents.length === 1 ? 'event' : 'events')}
          </p>

          {filteredEvents.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, color: '#8A6F4A' }}>
              {lang === 'zh' ? '目前沒有相關活動' : 'No events in this category yet'}
            </div>
          ) : (
            filteredEvents.map((ev, i) => (
              <div key={ev.id}>
                <EventCard
                  event={ev} lang={lang}
                  saved={saved.has(ev.id)} planned={planned.has(ev.id)}
                  onSave={toggleSave} onPlan={togglePlan}
                />
                {i < filteredEvents.length - 1 && (
                  <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
