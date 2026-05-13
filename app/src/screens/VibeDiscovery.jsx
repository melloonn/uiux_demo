import { useContext, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { VibeTile, VIBES } from '../components/event/VibeTile.jsx';
import { EVENTS } from '../data/events.js';
import { EventCard } from '../components/event/EventCard.jsx';
import { PlanPicker } from '../components/ui/PlanPicker.jsx';
import { Dice6, X } from 'lucide-react';

// ─── Keyword → category/flag mapping (spec-exact) ──────────────────────────
const KEYWORD_RULES = [
  { terms: ['開心','快樂','happy','excited','fun','joyful'],
    cats: ['festivals','art-markets'] },
  { terms: ['放鬆','輕鬆','chill','relax','relaxed','calm','cozy','slow'],
    cats: ['exhibitions','art-markets'] },
  { terms: ['戶外','outdoor','outside','nature','fresh air','walk'],
    cats: ['festivals','temples-heritage'] },
  { terms: ['音樂','music','live','concert','band','gig'],
    cats: ['live-music'] },
  { terms: ['美食','food','eat','hungry','snack','foodie','yummy'],
    cats: ['night-markets'] },
  { terms: ['免費','free','cheap','budget','no money','broke'],
    free: true },
  { terms: ['附近','nearby','close','around me','local','walking distance'],
    nearby: true },
  { terms: ['藝術','art','藝文','culture','creative','gallery','museum','exhibit'],
    cats: ['exhibitions','art-markets'] },
  { terms: ['今晚','tonight','now','today','this evening','later','weekend'],
    tonight: true },
  { terms: ['熱門','popular','trending','hot','人氣'],
    popular: true },
];

// ─── 8 mood chips ──────────────────────────────────────────────────────────
const MOOD_CHIPS = [
  { en: '🆓 Free',    zh: '🆓 免費',   kw: { zh: '免費', en: 'free' } },
  { en: '🌙 Tonight', zh: '🌙 今晚',   kw: { zh: '今晚', en: 'tonight' } },
  { en: '🍜 Food',    zh: '🍜 美食',   kw: { zh: '美食', en: 'food' } },
  { en: '🎨 Art',     zh: '🎨 藝文',   kw: { zh: '藝文', en: 'art' } },
  { en: '🌿 Outdoor', zh: '🌿 戶外',   kw: { zh: '戶外', en: 'outdoor' } },
  { en: '🎵 Music',   zh: '🎵 音樂',   kw: { zh: '音樂', en: 'music' } },
  { en: '📍 Nearby',  zh: '📍 附近',   kw: { zh: '附近', en: 'nearby' } },
  { en: '🔥 Popular', zh: '🔥 熱門',   kw: { zh: '熱門', en: 'popular' } },
];

// ─── Core search logic ─────────────────────────────────────────────────────
function searchEvents(query) {
  const lower = query.trim().toLowerCase();
  if (!lower) return null;

  const cats    = new Set();
  let free      = false;
  let nearby    = false;
  let tonight   = false;
  let popular   = false;
  let anyMatch  = false;

  for (const rule of KEYWORD_RULES) {
    if (rule.terms.some(t => lower.includes(t.toLowerCase()))) {
      anyMatch = true;
      (rule.cats ?? []).forEach(c => cats.add(c));
      if (rule.free)    free    = true;
      if (rule.nearby)  nearby  = true;
      if (rule.tonight) tonight = true;
      if (rule.popular) popular = true;
    }
  }

  let pool;

  if (!anyMatch) {
    // Title/tag text search fallback
    pool = EVENTS.filter(ev => {
      const hay = [
        ev.title.en, ev.title.zh,
        ev.description?.en ?? '', ev.description?.zh ?? '',
        ...(ev.tags ?? []), ...(ev.tagsZh ?? []),
      ].join(' ').toLowerCase();
      return hay.includes(lower);
    });
    return { events: pool.slice(0, 5), isFallback: pool.length === 0 };
  }

  // Category union
  if (cats.size > 0) {
    pool = EVENTS.filter(ev => cats.has(ev.category));
  } else {
    pool = [...EVENTS];
  }

  // Free filter
  if (free)    pool = pool.filter(ev => ev.free || ev.priceTier === 'free');

  // Tonight: keep events whose date field mentions tonight/every/today
  if (tonight) {
    const todayPool = pool.filter(ev => {
      const d = (ev.date?.en ?? '').toLowerCase();
      return d.includes('tonight') || d.includes('every') || d.includes('today');
    });
    if (todayPool.length > 0) pool = todayPool;
  }

  // Sort: nearby by distance, popular by savedCount, otherwise by savedCount
  if (nearby) {
    pool = pool.sort((a, b) => (a.dist ?? 99) - (b.dist ?? 99));
  } else if (popular) {
    pool = pool.sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0));
  } else {
    pool = pool.sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0));
  }

  return { events: pool.slice(0, 5), isFallback: false };
}

function getPopularFallback() {
  return [...EVENTS]
    .sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0))
    .slice(0, 3);
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function VibeDiscovery() {
  const { lang, setLang, saved, planned, toggleSave, togglePlan,
          planSchedule, addToPlanScheduled } = useContext(AppContext);
  const navigate = useNavigate();

  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState(null); // null = not searched yet
  const [planPickerEvent, setPlanPickerEvent] = useState(null);
  const inputRef = useRef(null);

  const t = (en, zh) => lang === 'zh' ? zh : en;

  const doSearch = useCallback((q) => {
    const r = searchEvents(q);
    setResults(r);
  }, []);

  const handleSubmit = () => {
    doSearch(query);
    inputRef.current?.blur();
  };

  const handleChipTap = (chip) => {
    const word = lang === 'zh' ? chip.kw.zh : chip.kw.en;
    const already = query.toLowerCase().includes(word.toLowerCase());
    const newQuery = already ? query : (query.trim() ? query.trim() + ' ' + word : word);
    setQuery(newQuery);
    doSearch(newQuery);
  };

  const handleSurprise = () => {
    const pool = results?.events?.length > 0 ? results.events : EVENTS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/event/${pick.id}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
  };

  const handlePlanPress = (eventId) => {
    const ev = EVENTS.find(e => e.id === eventId);
    if (ev) setPlanPickerEvent(ev);
  };

  const isSearching = results !== null;
  const showFallback = isSearching && (results.events.length === 0 || results.isFallback);
  const fallbackEvents = getPopularFallback();

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      <TopBar title={t('Explore', '探索')} lang={lang} setLang={setLang} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>
        <div style={{ paddingTop: 110, paddingBottom: 24 }}>

          {/* ── Main input + Surprise Me ── */}
          <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              flex: 1, height: 46, borderRadius: 9999, background: '#fff',
              boxShadow: '0 4px 14px rgba(26,15,10,0.08)',
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px 0 16px',
            }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder={t("What's your vibe today?", '現在什麼心情？想去哪種地方…')}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                  fontSize: 14, color: '#1A1A1A', fontWeight: 500,
                }}
              />
              {query ? (
                <button
                  onClick={handleClear}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(26,15,10,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <X size={12} color="#1A1A1A" />
                </button>
              ) : null}
            </div>

            {/* Surprise Me */}
            <button
              onClick={handleSurprise}
              style={{
                height: 46, padding: '0 14px', borderRadius: 9999,
                background: 'rgba(217,79,48,0.1)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                fontSize: 13, fontWeight: 700, color: '#D94F30',
              }}
            >
              <Dice6 size={16} color="#D94F30" />
              <span style={{ whiteSpace: 'nowrap' }}>{t('Surprise', '骰子')}</span>
            </button>
          </div>

          {/* ── 8 Mood chips ── */}
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MOOD_CHIPS.map(chip => {
                const word = lang === 'zh' ? chip.kw.zh : chip.kw.en;
                const active = query.toLowerCase().includes(word.toLowerCase());
                return (
                  <button
                    key={chip.en}
                    onClick={() => handleChipTap(chip)}
                    style={{
                      height: 34, padding: '0 14px', borderRadius: 9999, border: 'none',
                      cursor: 'pointer',
                      background: active ? '#1A1A1A' : '#fff',
                      color: active ? '#fff' : '#1A1A1A',
                      fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                      fontSize: 13, fontWeight: 700,
                      boxShadow: active
                        ? '0 4px 12px rgba(26,15,10,0.20)'
                        : '0 2px 8px rgba(26,15,10,0.07)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {lang === 'zh' ? chip.zh : chip.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Results: "為你推薦" ── */}
          {isSearching && (
            <>
              <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', margin: '0 0 16px' }} />

              {showFallback ? (
                <>
                  <div style={{ padding: '0 20px 12px' }}>
                    <p style={{
                      fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                      fontSize: 13, fontWeight: 600, color: '#8A6F4A', margin: 0,
                    }}>
                      {t(
                        "No exact matches — you might also like these",
                        '找不到完全符合的，這些你可能也會喜歡',
                      )}
                    </p>
                  </div>
                  {fallbackEvents.map((ev, i) => (
                    <div key={ev.id}>
                      <EventCard
                        event={ev} lang={lang}
                        saved={saved.has(ev.id)} planned={planned.has(ev.id)}
                        onSave={toggleSave} onPlan={handlePlanPress}
                      />
                      {i < fallbackEvents.length - 1 && (
                        <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{
                      fontFamily: '"Plus Jakarta Sans", system-ui',
                      fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
                      color: '#8A6F4A', textTransform: 'uppercase', margin: 0,
                    }}>
                      {t('For You', '為你推薦')} · {results.events.length}
                    </p>
                    <button
                      onClick={handleClear}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#D94F30', fontWeight: 700 }}
                    >
                      {t('Clear', '清除')}
                    </button>
                  </div>
                  {results.events.map((ev, i) => (
                    <div key={ev.id}>
                      <EventCard
                        event={ev} lang={lang}
                        saved={saved.has(ev.id)} planned={planned.has(ev.id)}
                        onSave={toggleSave} onPlan={handlePlanPress}
                      />
                      {i < results.events.length - 1 && (
                        <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ── Category tiles (shown when not searching) ── */}
          {!isSearching && (
            <div style={{ padding: '0 20px 20px' }}>
              <p style={{
                fontFamily: '"Plus Jakarta Sans", system-ui',
                fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
                color: '#8A6F4A', textTransform: 'uppercase', margin: '0 0 12px',
              }}>
                {t('Browse by Category', '依類型探索')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {VIBES.map(v => (
                  <VibeTile key={v.id} vibe={v} lang={lang} onClick={() => navigate(`/category/${v.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan picker */}
      {planPickerEvent && (
        <PlanPicker
          lang={lang}
          initialDate={planSchedule.get(planPickerEvent.id)?.dateKey ?? 'today'}
          initialTime={planSchedule.get(planPickerEvent.id)?.timeSlot ?? 'afternoon'}
          onConfirm={({ dateKey, timeSlot }) => {
            addToPlanScheduled(planPickerEvent.id, { dateKey, timeSlot });
            setPlanPickerEvent(null);
          }}
          onClose={() => setPlanPickerEvent(null)}
          confirmLabel={
            planned.has(planPickerEvent.id)
              ? (lang === 'zh' ? '更新時間' : 'Update Schedule')
              : undefined
          }
        />
      )}

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
