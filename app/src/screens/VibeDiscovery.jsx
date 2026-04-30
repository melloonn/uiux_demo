import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { VibeTile, VIBES } from '../components/event/VibeTile.jsx';
import { EVENTS } from '../data/events.js';
import { EventCard } from '../components/event/EventCard.jsx';
import { Search, Shuffle, X, Sparkles, Send } from 'lucide-react';

// Keyword → mood/category mapping for conversational input
const KEYWORD_MAP = [
  { terms: ['outdoor', 'outside', 'park', 'nature', '戶外', '公園', '自然'], mood: 'outdoor' },
  { terms: ['free', 'cheap', '免費', '零預算', '不想花錢', 'no money', 'budget'], mood: 'free' },
  { terms: ['food', 'eat', 'hungry', 'snack', 'market', 'night market', '吃', '夜市', '美食', '肚子餓', '宵夜'], mood: 'food' },
  { terms: ['music', 'live', 'concert', 'band', 'jazz', 'electronic', '音樂', '現場', '演唱', '演出'], mood: 'music' },
  { terms: ['art', 'gallery', 'exhibition', 'museum', '藝術', '展覽', '美術館', '博物館'], mood: 'art' },
  { terms: ['celebrate', 'party', 'festival', 'fun', '開心', '慶祝', '節慶', '熱鬧', '派對'], mood: 'food' },
  { terms: ['temple', 'heritage', 'history', 'culture', '廟', '古蹟', '歷史', '文化', '宗教'], mood: 'art' },
  { terms: ['night', 'late', 'evening', '夜晚', '晚上', '深夜'], mood: 'tonight' },
  { terms: ['popular', 'trending', 'hot', '熱門', '人氣', '推薦'], mood: 'popular' },
  { terms: ['nearby', 'close', 'local', '附近', '近的', '就近'], mood: 'nearby' },
];

function parseConversationalInput(input) {
  const lower = input.toLowerCase();
  for (const { terms, mood } of KEYWORD_MAP) {
    if (terms.some(t => lower.includes(t))) return mood;
  }
  return null;
}

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
  const [chatInput, setChatInput] = useState('');
  const [chatResult, setChatResult] = useState(null); // { events: [], mood: string, query: string }

  const t = (en, zh) => lang === 'zh' ? zh : en;

  const handleChatSubmit = () => {
    const q = chatInput.trim();
    if (!q) return;
    const detectedMood = parseConversationalInput(q);
    let pool = EVENTS;
    if (detectedMood) {
      const moodDef = MOOD_TAGS.find(m => m.k === detectedMood);
      if (moodDef) pool = EVENTS.filter(moodDef.filter);
    } else {
      // Fallback: search title/tags
      const lower = q.toLowerCase();
      pool = EVENTS.filter(ev => {
        const hay = [ev.title.en, ev.title.zh, ...(ev.tags ?? []), ...(ev.tagsZh ?? [])].join(' ').toLowerCase();
        return hay.includes(lower);
      });
    }
    const sorted = [...pool].sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0));
    setChatResult({ events: sorted.slice(0, 5), mood: detectedMood, query: q });
    setChatInput('');
  };

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

          {/* Conversational mood input */}
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={12} color="#E8B04B" />
              <p style={{ fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A5F00', textTransform: 'uppercase', margin: 0 }}>
                {t('Tell me your mood', '說說你的心情')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                flex: 1, height: 44, borderRadius: 9999, background: '#fff',
                boxShadow: '0 4px 14px rgba(26,15,10,0.08)',
                display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 0 14px',
              }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                  placeholder={t('e.g. "I want outdoor food, free only"', '例：「戶外的、免費的、想吃東西」')}
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}
                />
              </div>
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim()}
                style={{ width: 44, height: 44, borderRadius: '50%', background: chatInput.trim() ? '#D94F30' : 'rgba(26,15,10,0.08)', border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.18s' }}
              >
                <Send size={16} color={chatInput.trim() ? '#fff' : '#8A6F4A'} />
              </button>
            </div>

            {/* Chat result */}
            {chatResult && (
              <div style={{ marginTop: 12, borderRadius: 14, background: 'linear-gradient(135deg, #FDF5E8 0%, rgba(232,176,75,0.08) 100%)', border: '1px solid rgba(232,176,75,0.2)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 12, fontWeight: 700, color: '#8A5F00' }}>
                    {chatResult.mood
                      ? t(`Showing "${MOOD_TAGS.find(m=>m.k===chatResult.mood)?.en ?? chatResult.mood}" picks`, `「${MOOD_TAGS.find(m=>m.k===chatResult.mood)?.zh ?? chatResult.mood}」推薦`)
                      : t(`Results for "${chatResult.query}"`, `「${chatResult.query}」的結果`)}
                  </div>
                  <button onClick={() => setChatResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <X size={13} color="#8A5F00" />
                  </button>
                </div>
                {chatResult.events.length === 0 ? (
                  <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#8A6F4A', margin: 0 }}>{t('No matching events found', '找不到符合的活動')}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {chatResult.events.map(ev => (
                      <button key={ev.id} onClick={() => navigate(`/event/${ev.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '8px 10px', border: 'none', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 6px rgba(26,15,10,0.06)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, backgroundImage: `url(${ev.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lang === 'zh' ? ev.title.zh : ev.title.en}
                          </div>
                          <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', marginTop: 1 }}>
                            {lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
