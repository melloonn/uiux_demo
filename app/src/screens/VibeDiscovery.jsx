import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { VibeTile, VIBES } from '../components/event/VibeTile.jsx';
import { EVENTS } from '../data/events.js';
import { EventCard } from '../components/event/EventCard.jsx';
import { Search, Shuffle, X } from 'lucide-react';

// Mood/keyword → category mapping for quick discovery
const MOOD_TAGS = [
  { k: 'free',      en: '🤩 Free',         zh: '🤩 免費',       filter: e => e.free },
  { k: 'tonight',   en: '🌙 Tonight',       zh: '🌙 今晚',       filter: e => e.date?.en?.toLowerCase().includes('tonight') || e.date?.en?.toLowerCase().includes('every') },
  { k: 'food',      en: '🍜 Food & Market', zh: '🍜 吃吃喝喝',   filter: e => e.category === 'night-markets' || e.category === 'art-markets' },
  { k: 'art',       en: '🎨 Art & Culture', zh: '🎨 藝術文化',   filter: e => e.category === 'exhibitions' || e.category === 'art-markets' },
  { k: 'outdoor',   en: '🌿 Outdoor',       zh: '🌿 戶外',       filter: e => ['festivals', 'temples-heritage'].includes(e.category) },
  { k: 'music',     en: '🎵 Live Music',    zh: '🎵 現場音樂',   filter: e => e.category === 'live-music' },
  { k: 'nearby',    en: '📍 Nearby',        zh: '📍 附近',       filter: e => (e.dist ?? 99) <= 5 },
  { k: 'popular',   en: '🔥 Popular',       zh: '🔥 熱門',       filter: e => (e.savedCount ?? 0) >= 8000 },
];

export default function VibeDiscovery() {
  const { lang, setLang, saved, planned, toggleSave, togglePlan } = useContext(AppContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [activeMood, setActiveMood] = useState(null);

  const t = (en, zh) => lang === 'zh' ? zh : en;

  // Surprise Me: navigate to a random event matching the active mood or any event
  const handleSurprise = () => {
    const pool = activeMood
      ? EVENTS.filter(MOOD_TAGS.find(m => m.k === activeMood)?.filter ?? (() => true))
      : EVENTS;
    const pick = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : EVENTS[0];
    navigate(`/event/${pick.id}`);
  };

  // Filter events by keyword and/or mood tag
  const filteredEvents = useMemo(() => {
    let evs = EVENTS;
    if (activeMood) {
      const moodDef = MOOD_TAGS.find(m => m.k === activeMood);
      if (moodDef) evs = evs.filter(moodDef.filter);
    }
    const q = keyword.trim().toLowerCase();
    if (q) {
      evs = evs.filter(ev => {
        const hay = [
          ev.title.en, ev.title.zh,
          ev.description?.en ?? '', ev.description?.zh ?? '',
          ...(ev.tags ?? []), ...(ev.tagsZh ?? []),
          ev.category,
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    return evs;
  }, [activeMood, keyword]);

  const isFiltering = activeMood || keyword.trim().length > 0;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      <TopBar title={lang === 'zh' ? '活動類型' : 'Categories'} lang={lang} setLang={setLang} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>
        <div style={{ paddingTop: 110, paddingBottom: 20 }}>

          {/* Keyword search + Surprise Me */}
          <div style={{ padding: '0 20px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              flex: 1, height: 44, borderRadius: 9999, background: '#fff',
              boxShadow: '0 4px 14px rgba(26,15,10,0.08)',
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 0 14px',
            }}>
              <Search size={16} color={keyword ? '#D94F30' : '#8A6F4A'} />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder={t('Search by mood, keyword…', '輸入心情、關鍵字…')}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}
              />
              {keyword && (
                <button onClick={() => setKeyword('')} style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(26,15,10,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={11} color="#1A1A1A" />
                </button>
              )}
            </div>
            {/* Surprise Me */}
            <button
              onClick={handleSurprise}
              title={t('Surprise Me', '隨機探索')}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(217,79,48,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Shuffle size={18} color="#D94F30" />
            </button>
          </div>

          {/* Mood quick-pick chips */}
          <div style={{ padding: '0 20px 16px' }}>
            <p style={{ fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', margin: '0 0 10px' }}>
              {t('How are you feeling?', '今天想做什麼？')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MOOD_TAGS.map(m => {
                const active = activeMood === m.k;
                return (
                  <button key={m.k} onClick={() => setActiveMood(active ? null : m.k)} style={{
                    height: 34, padding: '0 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    background: active ? '#1A1A1A' : '#fff',
                    color: active ? '#fff' : '#1A1A1A',
                    fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                    fontSize: 13, fontWeight: 700,
                    boxShadow: active ? '0 4px 12px rgba(26,15,10,0.2)' : '0 2px 8px rgba(26,15,10,0.07)',
                    transition: 'all 0.18s',
                  }}>
                    {lang === 'zh' ? m.zh : m.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category tiles — shown only when not filtering */}
          {!isFiltering && (
            <div style={{ padding: '0 20px 20px' }}>
              <p style={{ fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', margin: '0 0 10px' }}>
                {t('Browse by Category', '依類型探索')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {VIBES.map(v => (
                  <VibeTile key={v.id} vibe={v} lang={lang} onClick={() => navigate(`/category/${v.id}`)} />
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', margin: '0 0 12px' }} />

          {/* Results header */}
          <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', margin: 0 }}>
              {isFiltering
                ? t(`Results · ${filteredEvents.length}`, `結果 · ${filteredEvents.length}`)
                : t('All Events', '所有活動')}
            </p>
            {isFiltering && (
              <button onClick={() => { setActiveMood(null); setKeyword(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#D94F30', fontWeight: 700 }}>
                {t('Clear', '清除')}
              </button>
            )}
          </div>

          {filteredEvents.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 700, color: '#8A6F4A' }}>
                {t('No events match', '沒有符合的活動')}
              </p>
            </div>
          ) : (
            filteredEvents.map((ev, i) => (
              <div key={ev.id}>
                <EventCard event={ev} lang={lang} saved={saved.has(ev.id)} planned={planned.has(ev.id)} onSave={toggleSave} onPlan={togglePlan} />
                {i < filteredEvents.length - 1 && <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />}
              </div>
            ))
          )}
        </div>
      </div>

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
