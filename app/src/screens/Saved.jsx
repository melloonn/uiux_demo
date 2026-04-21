import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { EventCard } from '../components/event/EventCard.jsx';
import { EVENTS } from '../data/events.js';
import { ChevronLeft } from 'lucide-react';

export default function Saved() {
  const { lang, saved, planned, toggleSave, togglePlan } = useContext(AppContext);
  const navigate = useNavigate();
  const savedEvents = EVENTS.filter(ev => saved.has(ev.id));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 58, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', gap: 12,
      }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronLeft size={18} color="#1A1A1A" />
        </button>
        <h1 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 20, fontWeight: 800, letterSpacing: -0.4, color: '#1A1A1A' }}>
          {lang === 'zh' ? '已收藏' : 'Saved'}
        </h1>
        <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 600, color: '#8A6F4A', marginLeft: 'auto' }}>
          {savedEvents.length} {lang === 'zh' ? '個活動' : (savedEvents.length === 1 ? 'event' : 'events')}
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ paddingTop: 106, paddingBottom: 32 }}>
          {savedEvents.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 600, color: '#8A6F4A', margin: 0 }}>
                {lang === 'zh' ? '尚未收藏任何活動' : 'No saved events yet'}
              </p>
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#B09070', marginTop: 6 }}>
                {lang === 'zh' ? '點擊愛心來收藏活動' : 'Tap the heart on any event to save it'}
              </p>
            </div>
          ) : (
            savedEvents.map((ev, i) => (
              <div key={ev.id}>
                <EventCard
                  event={ev} lang={lang}
                  saved={saved.has(ev.id)} planned={planned.has(ev.id)}
                  onSave={toggleSave} onPlan={togglePlan}
                />
                {i < savedEvents.length - 1 && (
                  <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
