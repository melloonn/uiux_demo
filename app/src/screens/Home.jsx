import { useContext, useState, useCallback, useMemo } from 'react';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';
import { ShareSheet } from '../components/ui/ShareSheet.jsx';
import { FilterSheet, DEFAULT_HOME_FILTERS } from '../components/ui/FilterSheet.jsx';
import { EventCard } from '../components/event/EventCard.jsx';
import { VibeTile, VIBES } from '../components/event/VibeTile.jsx';
import { EVENTS } from '../data/events.js';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, SlidersHorizontal, X } from 'lucide-react';

const NEARBY_KM = 5;

function BrandLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5c2 3.5 5.5 5 5.5 9.2 0 3.2-2.5 5.8-5.5 5.8s-5.5-2.6-5.5-5.8C6.5 8.5 10 7 12 3.5z" fill="#D94F30" opacity="0.95"/>
      <path d="M12 8c.9 1.8 2.6 2.7 2.6 4.8 0 1.7-1.2 3-2.6 3s-2.6-1.3-2.6-3C9.4 10.7 11.1 9.8 12 8z" fill="#E8B04B" opacity="0.9"/>
    </svg>
  );
}

export default function Home() {
  const { lang, setLang, saved, planned, toggleSave, togglePlan, totalUnread } = useContext(AppContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('foryou');
  const [shareEvent, setShareEvent] = useState(null);
  const [toast, setToast] = useState(null);

  // Search + filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_HOME_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_HOME_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }, []);

  // How many filters are active (excluding defaults)
  const filterBadgeCount = useMemo(() => {
    let n = 0;
    if (filters.distance < DEFAULT_HOME_FILTERS.distance) n++;
    if (filters.prices.length < 4) n++;
    if (filters.categories.length > 0) n++;
    if (filters.time !== 'all') n++;
    if ((filters.show ?? 'all') !== 'all') n++;
    return n;
  }, [filters]);

  // Combined filtering: Nearby → sheet filters → search text
  const displayEvents = useMemo(() => {
    let evs = tab === 'nearby'
      ? EVENTS.filter(ev => ev.dist <= NEARBY_KM)
      : EVENTS;

    // category
    if (filters.categories.length > 0) {
      evs = evs.filter(ev => filters.categories.includes(ev.category));
    }
    // price
    if (filters.prices.length < 4) {
      evs = evs.filter(ev => filters.prices.includes(ev.priceTier));
    }
    // distance (only when below default max)
    if (filters.distance < DEFAULT_HOME_FILTERS.distance) {
      evs = evs.filter(ev => ev.dist != null && ev.dist <= filters.distance);
    }
    // saved status
    if (filters.show === 'saved') {
      evs = evs.filter(ev => saved.has(ev.id));
    } else if (filters.show === 'unsaved') {
      evs = evs.filter(ev => !saved.has(ev.id));
    }

    // search text
    const q = search.trim().toLowerCase();
    if (q) {
      evs = evs.filter(ev => {
        const hay = [
          ev.title.en, ev.title.zh,
          ev.host ?? '',
          ev.location?.en ?? '', ev.location?.zh ?? '',
          ...(ev.tags ?? []),
          ...(ev.tagsZh ?? []),
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    return evs;
  }, [tab, search, filters, saved]);

  // Any active filter/search/nearby → show results label, hide vibe tiles
  const isFiltered = search.trim().length > 0 || tab === 'nearby' || filterBadgeCount > 0;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>

      {/* ── Top bar (3 rows) ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 54, paddingLeft: 20, paddingRight: 16, paddingBottom: 12,
        background: 'rgba(250,247,242,0.94)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Row A: brand + messages + globe */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrandLogo />
            <span style={{
              fontFamily: '"Plus Jakarta Sans", system-ui',
              fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#1A1A1A',
            }}>
              CultureFlow
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate('/messages')}
              style={{
                position: 'relative', width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <MessageCircle size={19} color="#1A1A1A" strokeWidth={1.8} />
              {totalUnread > 0 && (
                <div style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#D94F30', border: '1.5px solid #FAF7F2',
                  pointerEvents: 'none',
                }} />
              )}
            </button>
            <GlobeToggle lang={lang} setLang={setLang} />
          </div>
        </div>

        {/* Row B: search bar + filter button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, height: 44, borderRadius: 9999,
            background: '#fff',
            boxShadow: inputFocused
              ? '0 0 0 1.5px #D94F30, 0 4px 14px rgba(26,15,10,0.08)'
              : '0 4px 14px rgba(26,15,10,0.08)',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 12px 0 14px',
            transition: 'box-shadow 0.18s',
          }}>
            <Search size={17} color={inputFocused ? '#D94F30' : '#8A8A8A'} strokeWidth={2} style={{ flexShrink: 0, transition: 'color 0.18s' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={lang === 'zh' ? '搜尋文化活動...' : 'Search cultural events...'}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                fontSize: 14, color: '#1A1A1A', fontWeight: 500,
              }}
            />
            {search.length > 0 && (
              <button
                onClick={() => setSearch('')}
                style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(26,15,10,0.12)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={11} color="#1A1A1A" />
              </button>
            )}
          </div>

          {/* Filter button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => { setDraftFilters(filters); setSheetOpen(true); }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: filterBadgeCount > 0 ? '#1A1A1A' : 'rgba(26,15,10,0.07)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <SlidersHorizontal size={17} color={filterBadgeCount > 0 ? '#fff' : '#1A1A1A'} />
            </button>
            {filterBadgeCount > 0 && (
              <div style={{
                position: 'absolute', top: -3, right: -3,
                minWidth: 18, height: 18, borderRadius: 9999, padding: '0 4px',
                background: '#D94F30', color: '#fff',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                {filterBadgeCount}
              </div>
            )}
          </div>
        </div>

        {/* Row C: For You / Nearby toggle */}
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 9999, background: 'rgba(26,15,10,0.07)', alignSelf: 'flex-start' }}>
          {[
            { k: 'foryou', en: 'For You', zh: '為你' },
            { k: 'nearby', en: 'Nearby',  zh: '附近' },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: '5px 14px', borderRadius: 9999,
              background: tab === t.k ? '#1A1A1A' : 'transparent',
              color: tab === t.k ? '#fff' : 'rgba(26,15,10,0.55)',
              border: 'none', cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", system-ui',
              fontSize: 12, fontWeight: 700,
              transition: 'all 0.18s',
            }}>
              {lang === 'zh' ? t.zh : t.en}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>
        <div style={{ paddingTop: 204, paddingBottom: 20 }}>

          {/* Nearby chip */}
          {tab === 'nearby' && !isFiltered && (
            <div style={{
              margin: '0 20px 12px', padding: '8px 14px', borderRadius: 12,
              background: 'rgba(217,79,48,0.08)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: '"Plus Jakarta Sans", system-ui',
              fontSize: 12, fontWeight: 700, color: '#D94F30',
            }}>
              <span>📍</span>
              {lang === 'zh' ? '顯示 5公里 以內活動' : 'Within 5km of city centre'}
              <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{displayEvents.length}</span>
            </div>
          )}

          {/* Search / filter results label */}
          {isFiltered && (
            <div style={{ padding: '0 20px 12px' }}>
              <p style={{
                fontFamily: '"Plus Jakarta Sans", system-ui',
                fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
                color: '#8A6F4A', textTransform: 'uppercase', margin: 0,
              }}>
                {lang === 'zh'
                  ? `搜尋結果 · ${displayEvents.length} 個活動`
                  : `Search results · ${displayEvents.length} event${displayEvents.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}

          {/* Vibe tiles — hidden when any filter/search is active */}
          {!isFiltered && (
            <div style={{ padding: '0 20px 4px' }}>
              <p style={{
                fontFamily: '"Plus Jakarta Sans", system-ui',
                fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
                color: '#8A6F4A', textTransform: 'uppercase', margin: '0 0 12px',
              }}>
                {lang === 'zh' ? '活動類型' : 'Explore by Category'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {VIBES.map(v => (
                  <VibeTile key={v.id} vibe={v} lang={lang} onClick={() => navigate(`/category/${v.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Divider + section header — only in default view */}
          {!isFiltered && (
            <>
              <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', margin: '20px 0 0' }} />
              <p style={{
                fontFamily: '"Plus Jakarta Sans", system-ui',
                fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
                color: '#8A6F4A', textTransform: 'uppercase',
                padding: '16px 20px 12px', margin: 0,
              }}>
                {tab === 'nearby'
                  ? (lang === 'zh' ? '附近活動' : 'Near You')
                  : (lang === 'zh' ? '✨ CultureFlow 精選' : '✨ CultureFlow Picks')}
              </p>
            </>
          )}

          {/* Event list */}
          <div style={{ paddingTop: isFiltered ? 0 : 4 }}>
            {displayEvents.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: '0 0 6px' }}>
                  {search.trim()
                    ? (lang === 'zh' ? `「${search}」沒有結果` : `No results for "${search}"`)
                    : (lang === 'zh' ? '沒有符合的活動' : 'No events match')}
                </p>
                {(search.trim() || filterBadgeCount > 0) && (
                  <button
                    onClick={() => { setSearch(''); setFilters(DEFAULT_HOME_FILTERS); setDraftFilters(DEFAULT_HOME_FILTERS); }}
                    style={{
                      marginTop: 12, padding: '10px 24px', borderRadius: 12,
                      background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer',
                      fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
                    }}
                  >
                    {lang === 'zh' ? '清除篩選' : 'Clear filters'}
                  </button>
                )}
              </div>
            ) : (
              displayEvents.map((ev, i) => (
                <div key={ev.id}>
                  <EventCard
                    event={ev} lang={lang}
                    saved={saved.has(ev.id)} planned={planned.has(ev.id)}
                    onSave={toggleSave} onPlan={togglePlan}
                    onShare={(e) => setShareEvent(e)}
                  />
                  {i < displayEvents.length - 1 && (
                    <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TabBar lang={lang} dark={false} />

      {toast && (
        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, background: 'rgba(26,15,10,0.88)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700,
          padding: '10px 20px', borderRadius: 12, whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>{toast}</div>
      )}

      {shareEvent && (
        <ShareSheet
          event={shareEvent}
          lang={lang}
          onClose={() => setShareEvent(null)}
          onToast={showToast}
        />
      )}

      <FilterSheet
        open={sheetOpen}
        lang={lang}
        draft={draftFilters}
        setDraft={setDraftFilters}
        onApply={() => { setFilters(draftFilters); setSheetOpen(false); }}
        onClose={() => setSheetOpen(false)}
        onReset={() => setDraftFilters(DEFAULT_HOME_FILTERS)}
        showSavedFilter={true}
      />
    </div>
  );
}
