import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { VibeTile, VIBES } from '../components/event/VibeTile.jsx';
import { EVENTS } from '../data/events.js';
import { EventCard } from '../components/event/EventCard.jsx';

export default function VibeDiscovery() {
  const { lang, setLang, saved, planned, toggleSave, togglePlan } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      <TopBar
        title={lang === 'zh' ? '活動類型' : 'Categories'}
        lang={lang}
        setLang={setLang}
      />

      {/* Scrollable content — stops above TabBar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 84,
        overflowY: 'auto',
      }}>
        <div style={{ paddingTop: 110, paddingBottom: 20 }}>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {VIBES.map(v => (
                <VibeTile
                  key={v.id}
                  vibe={v}
                  lang={lang}
                  onClick={() => navigate(`/category/${v.id}`)}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', margin: '0 0 16px' }} />

          <p style={{
            fontFamily: '"Plus Jakarta Sans", system-ui',
            fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
            color: '#8A6F4A', textTransform: 'uppercase',
            padding: '0 20px', marginBottom: 4,
          }}>
            {lang === 'zh' ? '所有活動' : 'All Events'}
          </p>

          {EVENTS.map((ev, i) => (
            <div key={ev.id}>
              <EventCard
                event={ev} lang={lang}
                saved={saved.has(ev.id)} planned={planned.has(ev.id)}
                onSave={toggleSave} onPlan={togglePlan}
              />
              {i < EVENTS.length - 1 && <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />}
            </div>
          ))}
        </div>
      </div>

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
