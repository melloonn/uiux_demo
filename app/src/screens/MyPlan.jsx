import { useContext, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';
import { EVENTS, PIN_COLOR, CATEGORY_LABEL, VIBE_FALLBACK } from '../data/events.js';
import { MapPin, Train, AlertTriangle, X, Plus, Sparkles, Share2, CalendarDays } from 'lucide-react';

// Generate 7 days from today
function buildDateStrip() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesZh = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: i === 0 ? 'today' : d.toISOString().slice(0, 10),
      dayEn: i === 0 ? 'Today' : dayNames[d.getDay()],
      dayZh: i === 0 ? '今天' : dayNamesZh[d.getDay()],
      dateNum: d.getDate(),
    });
  }
  return days;
}

const DATE_STRIP = buildDateStrip();

// Mock transit between events (seconds apart as placeholder)
function transitBetween(ev1, ev2) {
  if (!ev1 || !ev2) return null;
  const dx = (ev1.mapX ?? 195) - (ev2.mapX ?? 195);
  const dy = (ev1.mapY ?? 320) - (ev2.mapY ?? 320);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const km = (dist * 0.08).toFixed(1); // rough SVG-to-km
  const mins = Math.round(dist * 0.15 + 5);
  const stops = Math.round(dist / 30);
  const tight = mins < 20;
  const far   = parseFloat(km) > 8;
  return { km, mins, stops, tight, far };
}

// Small event thumbnail used in Saved grid and timeline
function EventThumb({ ev, lang, size = 56 }) {
  const color = PIN_COLOR[ev.category] ?? '#D94F30';
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0, overflow: 'hidden', position: 'relative',
      background: VIBE_FALLBACK[ev.vibe] ?? VIBE_FALLBACK.warm,
      backgroundImage: `url(${ev.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      <div style={{
        position: 'absolute', bottom: 3, left: 3,
        padding: '1px 5px', borderRadius: 9999, background: color,
        fontFamily: '"Plus Jakarta Sans"', fontSize: 8, fontWeight: 800, color: '#fff',
      }}>
        {CATEGORY_LABEL[ev.category]?.[lang] ?? ev.category}
      </div>
    </div>
  );
}

export default function MyPlan() {
  const { lang, setLang, saved, planned, togglePlan } = useContext(AppContext);
  const navigate = useNavigate();

  const [activeDateKey, setActiveDateKey] = useState('today');
  const [segment, setSegment] = useState('planned'); // 'planned' | 'saved' | 'past'
  const [showRouteModal, setShowRouteModal] = useState(false);
  const dateStripRef = useRef(null);

  const plannedEvents = useMemo(() => EVENTS.filter(ev => planned.has(ev.id)), [planned]);
  const savedEvents   = useMemo(() => EVENTS.filter(ev => saved.has(ev.id)), [saved]);

  // For now all planned events show under any date filter (mock — real app would use event.date)
  const filteredPlanned = activeDateKey === 'today' ? plannedEvents : plannedEvents;

  const t = (en, zh) => lang === 'zh' ? zh : en;

  // Mock AI summary stats
  const totalKm = plannedEvents.reduce((sum, ev, i, arr) => {
    if (i === 0) return 0;
    const t = transitBetween(arr[i - 1], ev);
    return sum + (t ? parseFloat(t.km) : 0);
  }, 0).toFixed(1);
  const mrtLines = Math.min(plannedEvents.length, 2);
  const estCost  = plannedEvents.reduce((s, ev) => s + (ev.priceTier === 'free' ? 0 : ev.priceTier === 'budget' ? 150 : 350), 0);
  const estHrs   = (plannedEvents.length * 1.5 + parseFloat(totalKm) * 0.1).toFixed(0);

  const segments = [
    { k: 'planned', labelEn: '📌 Planned', labelZh: '📌 已計畫' },
    { k: 'saved',   labelEn: '❤️ Saved',   labelZh: '❤️ 已收藏' },
    { k: 'past',    labelEn: '✅ Past',     labelZh: '✅ 已過去' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 54, paddingLeft: 20, paddingRight: 16, paddingBottom: 10,
        background: 'rgba(250,247,242,0.94)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 26, fontWeight: 900, letterSpacing: -0.6, color: '#1A1A1A',
        }}>
          {t('My Plan', '我的計畫')}
        </h1>
        <GlobeToggle lang={lang} setLang={setLang} />
      </div>

      {/* Scrollable content */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>
        <div style={{ paddingTop: 102, paddingBottom: 100 }}>

          {/* Date strip */}
          <div
            ref={dateStripRef}
            style={{
              display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
              padding: '14px 20px 10px',
            }}
          >
            {DATE_STRIP.map(d => {
              const isActive = activeDateKey === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setActiveDateKey(d.key)}
                  style={{
                    flexShrink: 0, minWidth: 52, padding: '8px 12px',
                    borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: isActive ? '#D94F30' : 'rgba(26,15,10,0.06)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    transition: 'all 0.18s',
                  }}
                >
                  <span style={{
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700,
                    color: isActive ? 'rgba(255,255,255,0.8)' : '#8A6F4A',
                    textTransform: 'uppercase',
                  }}>
                    {lang === 'zh' ? d.dayZh : d.dayEn}
                  </span>
                  <span style={{
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 900,
                    color: isActive ? '#fff' : '#1A1A1A',
                    lineHeight: 1,
                  }}>
                    {d.dateNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Summary card — only when planned events exist */}
          {plannedEvents.length > 0 && (
            <div style={{
              margin: '4px 20px 16px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #FDF5E8 0%, rgba(232,176,75,0.12) 100%)',
              border: '1px solid rgba(232,176,75,0.25)',
              padding: '16px 18px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 14, right: 14,
                padding: '3px 8px', borderRadius: 9999,
                background: 'rgba(232,176,75,0.2)',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 800,
                color: '#8A5F00', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Sparkles size={10} color="#8A5F00" />
                AI
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingRight: 40 }}>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                  {t(`${plannedEvents.length} events planned`, `已規劃 ${plannedEvents.length} 個活動`)}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: '#8A5F00' }}>
                  {t(`${totalKm} km total travel · ${mrtLines} MRT line${mrtLines !== 1 ? 's' : ''}`, `總移動 ${totalKm} 公里 · ${mrtLines} 條捷運`)}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: '#8A5F00' }}>
                  {t(`~NT$${estCost} estimated · ${estHrs} hrs`, `預估 NT$${estCost} · ${estHrs} 小時`)}
                </div>
                <div style={{
                  marginTop: 4, paddingTop: 8,
                  borderTop: '1px solid rgba(232,176,75,0.2)',
                  fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 600,
                  color: '#6B4C00', fontStyle: 'italic',
                }}>
                  {t(
                    'Mostly cultural venues on the east side — comfy walking plan',
                    '行程以東區文化場所為主 — 步行友善'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Segment control */}
          <div style={{
            display: 'flex', gap: 0, margin: '0 20px 16px',
            padding: 4, borderRadius: 14, background: 'rgba(26,15,10,0.07)',
          }}>
            {segments.map(s => (
              <button key={s.k} onClick={() => setSegment(s.k)} style={{
                flex: 1, padding: '8px 6px', borderRadius: 11, border: 'none', cursor: 'pointer',
                background: segment === s.k ? '#fff' : 'transparent',
                color: segment === s.k ? '#1A1A1A' : 'rgba(26,15,10,0.45)',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700,
                boxShadow: segment === s.k ? '0 2px 8px rgba(26,15,10,0.1)' : 'none',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}>
                {lang === 'zh' ? s.labelZh : s.labelEn}
              </button>
            ))}
          </div>

          {/* ── PLANNED VIEW ── */}
          {segment === 'planned' && (
            filteredPlanned.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <CalendarDays size={40} color="rgba(26,15,10,0.15)" style={{ margin: '0 auto 14px' }} />
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: '0 0 6px' }}>
                  {t('No planned events yet', '尚未計畫任何活動')}
                </p>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#B09070', margin: '0 0 20px' }}>
                  {t('Add events you want to attend', '加入你想參加的活動')}
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '12px 28px', borderRadius: 14,
                    background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
                  }}
                >
                  {t('Browse events', '探索活動')}
                </button>
              </div>
            ) : (
              <div style={{ padding: '0 20px' }}>
                {filteredPlanned.map((ev, i) => {
                  const transit = i > 0 ? transitBetween(filteredPlanned[i - 1], ev) : null;
                  const mockTime = `${14 + i}:00`;
                  return (
                    <div key={ev.id}>
                      {/* Transit capsule between events */}
                      {transit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 4px 28px' }}>
                          <div style={{ width: 1, height: 20, background: 'rgba(26,15,10,0.12)', marginLeft: 3 }} />
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: 9999,
                            background: (transit.tight || transit.far) ? 'rgba(217,79,48,0.08)' : 'rgba(26,15,10,0.05)',
                          }}>
                            {transit.tight || transit.far
                              ? <AlertTriangle size={11} color="#D94F30" />
                              : <Train size={11} color="#8A6F4A" />
                            }
                            <span style={{
                              fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
                              color: (transit.tight || transit.far) ? '#D94F30' : '#8A6F4A',
                            }}>
                              {transit.tight
                                ? t(`Tight — ${transit.mins} min gap`, `緊湊 — ${transit.mins} 分鐘間隔`)
                                : transit.far
                                  ? t(`Long transit — ${transit.mins} min`, `長途移動 — ${transit.mins} 分鐘`)
                                  : t(`🚇 ${transit.mins} min · ${transit.km} km`, `🚇 ${transit.mins} 分鐘 · ${transit.km} 公里`)
                              }
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Event row */}
                      <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                        {/* Time column */}
                        <div style={{ width: 36, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                          <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#D94F30' }}>
                            {mockTime}
                          </span>
                          {i < filteredPlanned.length - 1 && (
                            <div style={{ flex: 1, width: 1, background: 'rgba(26,15,10,0.1)', marginTop: 4, minHeight: 20 }} />
                          )}
                        </div>

                        {/* Card */}
                        <div
                          onClick={() => navigate(`/event/${ev.id}`)}
                          style={{
                            flex: 1, background: '#fff', borderRadius: 16,
                            padding: '12px', marginBottom: 8,
                            boxShadow: '0 4px 14px rgba(26,15,10,0.07)',
                            cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start',
                          }}
                        >
                          <EventThumb ev={ev} lang={lang} size={56} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"',
                              fontSize: 14, fontWeight: 800, color: '#1A1A1A',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {lang === 'zh' ? ev.title.zh : ev.title.en}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                              <MapPin size={10} color="#8A6F4A" />
                              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: '#8A6F4A' }}>
                                {lang === 'zh' ? ev.location.zh : ev.location.en}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); togglePlan(ev.id); }}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                              background: 'rgba(217,79,48,0.08)', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <X size={13} color="#D94F30" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── SAVED VIEW ── */}
          {segment === 'saved' && (
            savedEvents.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🤍</div>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: '0 0 6px' }}>
                  {t('Heart events you\'re interested in', '收藏你感興趣的活動')}
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: 16, padding: '12px 28px', borderRadius: 14,
                    background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
                  }}
                >
                  {t('Explore', '探索')}
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px',
              }}>
                {savedEvents.map(ev => {
                  const color = PIN_COLOR[ev.category] ?? '#D94F30';
                  const isPlanned = planned.has(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => navigate(`/event/${ev.id}`)}
                      style={{
                        background: '#fff', borderRadius: 16, overflow: 'hidden',
                        boxShadow: '0 4px 14px rgba(26,15,10,0.08)', cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        height: 100, position: 'relative',
                        background: VIBE_FALLBACK[ev.vibe] ?? VIBE_FALLBACK.warm,
                        backgroundImage: `url(${ev.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />
                        <div style={{
                          position: 'absolute', bottom: 6, left: 8,
                          padding: '2px 7px', borderRadius: 9999, background: color,
                          fontFamily: '"Plus Jakarta Sans"', fontSize: 9, fontWeight: 800, color: '#fff',
                        }}>
                          {CATEGORY_LABEL[ev.category]?.[lang] ?? ev.category}
                        </div>
                        {/* + promote button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); if (!isPlanned) togglePlan(ev.id); }}
                          style={{
                            position: 'absolute', top: 8, right: 8,
                            width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                            background: isPlanned ? '#D94F30' : 'rgba(255,255,255,0.9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          {isPlanned
                            ? <span style={{ fontSize: 12 }}>✓</span>
                            : <Plus size={14} color="#1A1A1A" />
                          }
                        </button>
                      </div>
                      <div style={{ padding: '8px 10px 10px' }}>
                        <div style={{
                          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"',
                          fontSize: 12, fontWeight: 800, color: '#1A1A1A',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {lang === 'zh' ? ev.title.zh : ev.title.en}
                        </div>
                        <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, color: '#8A6F4A', marginTop: 2 }}>
                          {lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── PAST VIEW ── */}
          {segment === 'past' && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🗓️</div>
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: 0 }}>
                {t('No past events yet', '尚無過去活動')}
              </p>
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#B09070', marginTop: 6 }}>
                {t('Events you\'ve attended will appear here', '你參加過的活動將顯示在這裡')}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Floating action buttons */}
      {segment === 'planned' && plannedEvents.length > 0 && (
        <div style={{
          position: 'absolute', left: 20, right: 20, bottom: 96,
          display: 'flex', gap: 10, zIndex: 30,
        }}>
          <button
            onClick={() => setShowRouteModal(true)}
            style={{
              flex: 1, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: '#1A1A1A', color: '#fff',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(26,15,10,0.3)',
            }}
          >
            <Sparkles size={16} color="#E8B04B" />
            {t('Generate route', '規劃路線')}
          </button>
          <button
            style={{
              width: 48, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: '#fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(26,15,10,0.12)',
            }}
          >
            <Share2 size={18} color="#1A1A1A" />
          </button>
        </div>
      )}

      <TabBar lang={lang} dark={false} />

      {/* Generate Route Modal */}
      {showRouteModal && (
        <div
          onClick={() => setShowRouteModal(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#FAF7F2', borderRadius: '20px 20px 0 0',
              padding: '20px 20px 40px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>
                  {t('🪄 Auto Route', '🪄 自動路線')}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#8A6F4A', marginTop: 2 }}>
                  {t('Optimised by proximity & time', '依位置與時間優化')}
                </div>
              </div>
              <button onClick={() => setShowRouteModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="#1A1A1A" />
              </button>
            </div>

            {plannedEvents.map((ev, i) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: PIN_COLOR[ev.category] ?? '#D94F30',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, color: '#fff',
                }}>{i + 1}</div>
                <EventThumb ev={ev} lang={lang} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang === 'zh' ? ev.title.zh : ev.title.en}
                  </div>
                </div>
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 600, color: '#8A6F4A' }}>
                  {`${14 + i}:00`}
                </span>
              </div>
            ))}

            <div style={{
              marginTop: 8, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(232,176,75,0.1)', border: '1px solid rgba(232,176,75,0.25)',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 600, color: '#8A5F00',
            }}>
              {t(`~${estHrs} hrs · NT$${estCost} estimated · ${totalKm} km`, `約 ${estHrs} 小時 · NT$${estCost} · ${totalKm} 公里`)}
            </div>

            <button
              onClick={() => setShowRouteModal(false)}
              style={{
                marginTop: 14, width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: '#1A1A1A', color: '#fff',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700,
              }}
            >
              {t('Save as plan', '儲存為計畫')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
