import { useContext, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';
import { PlanPicker, TIME_SLOT_HOURS } from '../components/ui/PlanPicker.jsx';
import { EVENTS, PIN_COLOR, CATEGORY_LABEL, VIBE_FALLBACK } from '../data/events.js';
import { MapPin, Train, AlertTriangle, X, Plus, Sparkles, Share2, CalendarDays, GripVertical, CheckCircle, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

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
  const km = (dist * 0.08).toFixed(1);
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

// Build Google Maps direction URL for an ordered list of events
function buildGoogleMapsUrl(events, lang) {
  if (events.length === 0) return null;
  const locs = events.map(ev => encodeURIComponent(lang === 'zh' ? ev.location.zh : ev.location.en));
  if (locs.length === 1) return `https://www.google.com/maps/search/?api=1&query=${locs[0]}`;
  const origin = locs[0];
  const dest   = locs[locs.length - 1];
  const waypts = locs.slice(1, -1).join('|');
  const base   = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
  return waypts ? `${base}&waypoints=${waypts}` : base;
}

// Build LINE share URL
function buildLineShareUrl(events, lang) {
  const names = events.map(ev => lang === 'zh' ? ev.title.zh : ev.title.en).join(' → ');
  const text = lang === 'zh'
    ? `我的 CultureFlow 行程：${names}`
    : `My CultureFlow itinerary: ${names}`;
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

export default function MyPlan() {
  const { lang, setLang, saved, planned, togglePlan, planSchedule, setPlanSchedule, addToPlanScheduled } = useContext(AppContext);
  const navigate = useNavigate();

  const [activeDateKey, setActiveDateKey] = useState('today');
  const [segment, setSegment] = useState('planned'); // 'planned' | 'saved' | 'past'
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showDayFullModal, setShowDayFullModal] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState([]);
  const [pastIds, setPastIds] = useState(new Set());
  const [editPicker, setEditPicker] = useState(null); // { eventId, dateKey, timeSlot }
  const [draggingId, setDraggingId] = useState(null);
  const [dropTargetIdx, setDropTargetIdx] = useState(null);

  // Ordered plan list — synced with planned Set, preserving drag order
  const [planOrder, setPlanOrder] = useState([]);
  useEffect(() => {
    setPlanOrder(prev => {
      const valid = prev.filter(id => planned.has(id));
      const added = [...planned].filter(id => !prev.includes(id));
      return [...valid, ...added];
    });
  }, [planned]);

  const dateStripRef = useRef(null);

  const orderedPlanned = useMemo(
    () => planOrder.map(id => EVENTS.find(ev => ev.id === id)).filter(Boolean),
    [planOrder]
  );

  // Filter planned events by the selected date strip tab
  const filteredPlanned = useMemo(() => {
    return orderedPlanned.filter(ev => {
      const sched = planSchedule.get(ev.id);
      if (!sched) return activeDateKey === 'today'; // unscheduled events only show on "today"
      return sched.dateKey === activeDateKey;
    });
  }, [orderedPlanned, activeDateKey, planSchedule]);

  const savedEvents   = useMemo(() => EVENTS.filter(ev => saved.has(ev.id)), [saved]);
  const pastEvents    = useMemo(() => EVENTS.filter(ev => pastIds.has(ev.id)), [pastIds]);

  const t = (en, zh) => lang === 'zh' ? zh : en;

  // Mark event as attended: remove from plan, add to past
  const markAttended = (id) => {
    togglePlan(id);
    setPastIds(prev => new Set([...prev, id]));
  };

  // ── Drag-to-reorder ──
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const handleDragStart = (i, evId) => {
    dragIdx.current = i;
    setDraggingId(evId);
  };
  const handleDragOver = (e, i) => {
    e.preventDefault();
    dragOverIdx.current = i;
    setDropTargetIdx(i);
  };
  const handleDrop = () => {
    if (dragIdx.current === null || dragOverIdx.current === null) return;
    if (dragIdx.current !== dragOverIdx.current) {
      const next = [...planOrder];
      const fromId = filteredPlanned[dragIdx.current]?.id;
      const toId   = filteredPlanned[dragOverIdx.current]?.id;
      if (fromId && toId) {
        const fromPos = next.indexOf(fromId);
        const toPos   = next.indexOf(toId);
        if (fromPos !== -1 && toPos !== -1) {
          next.splice(fromPos, 1);
          next.splice(toPos, 0, fromId);
        }
      }
      setPlanOrder(next);
    }
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDraggingId(null);
    setDropTargetIdx(null);
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetIdx(null);
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  // Move item up or down within the filtered (day) view — also swaps time slots
  const moveFilteredItem = useCallback((filteredIdx, dir) => {
    const targetIdx = filteredIdx + dir;
    if (targetIdx < 0 || targetIdx >= filteredPlanned.length) return;
    const id1 = filteredPlanned[filteredIdx].id;
    const id2 = filteredPlanned[targetIdx].id;
    const next = [...planOrder];
    const pos1 = next.indexOf(id1);
    const pos2 = next.indexOf(id2);
    if (pos1 === -1 || pos2 === -1) return;
    [next[pos1], next[pos2]] = [next[pos2], next[pos1]];
    setPlanOrder(next);
    // Swap the time slots so the left-side time labels follow the activity
    setPlanSchedule(prev => {
      const ns = new Map(prev);
      const sched1 = ns.get(id1);
      const sched2 = ns.get(id2);
      if (sched1 && sched2) {
        ns.set(id1, { ...sched1, timeSlot: sched2.timeSlot });
        ns.set(id2, { ...sched2, timeSlot: sched1.timeSlot });
      }
      return ns;
    });
  }, [filteredPlanned, planOrder, setPlanSchedule]);

  // Auto-generate itinerary suggestions with 4-activity cap and night market dedup
  const handleAutoGenerate = useCallback(() => {
    const existingCount = filteredPlanned.length;

    // Block if day already has 4 activities
    if (existingCount >= 4) {
      setShowDayFullModal(true);
      return;
    }

    const anchor = filteredPlanned[0] ?? orderedPlanned[0];
    if (!anchor) return;

    const neededCount = 4 - existingCount;

    // Time slots already occupied for this day
    const occupiedSlots = new Set(
      filteredPlanned.map(ev => planSchedule.get(ev.id)?.timeSlot).filter(Boolean)
    );

    // Does the current day plan already include a night market?
    const hasNightMarket = filteredPlanned.some(ev => ev.category === 'night-markets');

    // Sort unplanned events by proximity to anchor
    const pool = EVENTS.filter(ev => !planned.has(ev.id));
    const sorted = [...pool].sort((a, b) => {
      const da = Math.hypot((a.mapX ?? 200) - (anchor.mapX ?? 200), (a.mapY ?? 400) - (anchor.mapY ?? 400));
      const db = Math.hypot((b.mapX ?? 200) - (anchor.mapX ?? 200), (b.mapY ?? 400) - (anchor.mapY ?? 400));
      return da - db;
    });

    const allTimeSlots = ['morning', 'afternoon', 'evening', 'night'];
    const freeSlots = allTimeSlots.filter(ts => !occupiedSlots.has(ts));

    const picks = [];
    let nightMarketAdded = false;
    const usedSlots = new Set();

    for (const ev of sorted) {
      if (picks.length >= neededCount) break;

      const isNightMarket = ev.category === 'night-markets';

      // Skip if we already have a night market (existing or just added)
      if (isNightMarket && (hasNightMarket || nightMarketAdded)) continue;

      let assignSlot;
      if (isNightMarket) {
        // Night markets go in evening or night slot if available
        assignSlot = freeSlots.find(s => (s === 'evening' || s === 'night') && !usedSlots.has(s))
          ?? freeSlots.find(s => !usedSlots.has(s));
      } else {
        assignSlot = freeSlots.find(s => !usedSlots.has(s));
      }

      if (!assignSlot) break;

      picks.push({ ev, timeSlot: assignSlot });
      usedSlots.add(assignSlot);
      if (isNightMarket) nightMarketAdded = true;
    }

    setAutoSuggestions(picks);
    setShowAutoModal(true);
  }, [filteredPlanned, orderedPlanned, planned, planSchedule]);

  // AI summary stats (based on the current date's filtered events)
  const totalKm = filteredPlanned.reduce((sum, ev, i, arr) => {
    if (i === 0) return 0;
    const tr = transitBetween(arr[i - 1], ev);
    return sum + (tr ? parseFloat(tr.km) : 0);
  }, 0).toFixed(1);
  const mrtLines = Math.min(filteredPlanned.length, 2);
  const estCost  = filteredPlanned.reduce((s, ev) => s + (ev.priceTier === 'free' ? 0 : ev.priceTier === '$' ? 150 : 350), 0);
  const estHrs   = (filteredPlanned.length * 1.5 + parseFloat(totalKm) * 0.1).toFixed(0);

  const segments = [
    { k: 'planned', labelEn: '📌 Planned', labelZh: '📌 已計畫' },
    { k: 'saved',   labelEn: '🔖 Saved',   labelZh: '🔖 已收藏' },
    { k: 'past',    labelEn: '✅ Past',     labelZh: '✅ 已參加' },
  ];

  const displayList = filteredPlanned.length > 0 ? filteredPlanned : orderedPlanned;
  const gmUrl   = buildGoogleMapsUrl(displayList, lang);
  const lineUrl = buildLineShareUrl(displayList, lang);

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
          <div ref={dateStripRef} style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '14px 20px 10px' }}>
            {DATE_STRIP.map(d => {
              const isActive = activeDateKey === d.key;
              return (
                <button key={d.key} onClick={() => setActiveDateKey(d.key)} style={{
                  flexShrink: 0, minWidth: 52, padding: '8px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: isActive ? '#D94F30' : 'rgba(26,15,10,0.06)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.18s',
                }}>
                  <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700, color: isActive ? 'rgba(255,255,255,0.8)' : '#8A6F4A', textTransform: 'uppercase' }}>
                    {lang === 'zh' ? d.dayZh : d.dayEn}
                  </span>
                  <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 900, color: isActive ? '#fff' : '#1A1A1A', lineHeight: 1 }}>
                    {d.dateNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Summary card */}
          {filteredPlanned.length > 0 && (
            <div style={{
              margin: '4px 20px 16px', borderRadius: 18,
              background: 'linear-gradient(135deg, #FDF5E8 0%, rgba(232,176,75,0.12) 100%)',
              border: '1px solid rgba(232,176,75,0.25)', padding: '16px 18px', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 14, right: 14, padding: '3px 8px', borderRadius: 9999,
                background: 'rgba(232,176,75,0.2)', fontFamily: '"Plus Jakarta Sans"',
                fontSize: 10, fontWeight: 800, color: '#8A5F00', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Sparkles size={10} color="#8A5F00" /> AI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingRight: 40 }}>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                  {t(`${filteredPlanned.length} events planned`, `已規劃 ${filteredPlanned.length} 個活動`)}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: '#8A5F00' }}>
                  {t(`${totalKm} km total · ${mrtLines} MRT line${mrtLines !== 1 ? 's' : ''}`, `總移動 ${totalKm} 公里 · ${mrtLines} 條捷運`)}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: '#8A5F00' }}>
                  {t(`~NT$${estCost} estimated · ${estHrs} hrs`, `預估 NT$${estCost} · ${estHrs} 小時`)}
                </div>
                <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid rgba(232,176,75,0.2)', fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 600, color: '#6B4C00', fontStyle: 'italic' }}>
                  {t('Tap time to edit · ▲▼ or drag to reorder · ✓ to mark attended', '點時間修改 · ▲▼ 或拖動排序 · ✓ 標記已參加')}
                </div>
              </div>
            </div>
          )}

          {/* Segment control */}
          <div style={{ display: 'flex', gap: 0, margin: '0 20px 16px', padding: 4, borderRadius: 14, background: 'rgba(26,15,10,0.07)' }}>
            {segments.map(s => (
              <button key={s.k} onClick={() => setSegment(s.k)} style={{
                flex: 1, padding: '8px 6px', borderRadius: 11, border: 'none', cursor: 'pointer',
                background: segment === s.k ? '#fff' : 'transparent',
                color: segment === s.k ? '#1A1A1A' : 'rgba(26,15,10,0.45)',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700,
                boxShadow: segment === s.k ? '0 2px 8px rgba(26,15,10,0.1)' : 'none',
                transition: 'all 0.18s', whiteSpace: 'nowrap',
              }}>
                {lang === 'zh' ? s.labelZh : s.labelEn}
              </button>
            ))}
          </div>

          {/* ── PLANNED VIEW ── */}
          {segment === 'planned' && (
            orderedPlanned.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <CalendarDays size={40} color="rgba(26,15,10,0.15)" style={{ margin: '0 auto 14px' }} />
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: '0 0 6px' }}>
                  {t('No planned events yet', '尚未計畫任何活動')}
                </p>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#B09070', margin: '0 0 20px' }}>
                  {t('Add events you want to attend', '加入你想參加的活動')}
                </p>
                <button onClick={() => navigate('/')} style={{ padding: '12px 28px', borderRadius: 14, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700 }}>
                  {t('Browse events', '探索活動')}
                </button>
              </div>
            ) : filteredPlanned.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 14, fontWeight: 700, color: '#8A6F4A', margin: '0 0 6px' }}>
                  {t('No events on this day', '這一天沒有活動安排')}
                </p>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#B09070', margin: '0 0 16px' }}>
                  {t('Add events from the plan tab or browse below', '可從活動頁面加入或點下方按鈕自動排程')}
                </p>
                <button onClick={handleAutoGenerate} style={{ padding: '10px 24px', borderRadius: 14, background: 'rgba(217,79,48,0.1)', color: '#D94F30', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}>
                  <Sparkles size={14} color="#D94F30" />
                  {t('Auto-generate itinerary', '幫我排行程')}
                </button>
              </div>
            ) : (
              <div style={{ padding: '0 20px' }}>
                {filteredPlanned.map((ev, i) => {
                  const transit = i > 0 ? transitBetween(filteredPlanned[i - 1], ev) : null;
                  const sched = planSchedule.get(ev.id);
                  const timeStr = sched ? `${TIME_SLOT_HOURS[sched.timeSlot] ?? '09'}:00` : '09:00';
                  const isBeingDragged = draggingId === ev.id;
                  const isDropTarget = dropTargetIdx === i && draggingId !== null && !isBeingDragged;
                  return (
                    <div key={ev.id}
                      draggable
                      onDragStart={() => handleDragStart(i, ev.id)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      style={{ opacity: isBeingDragged ? 0.5 : 1, transition: 'opacity 0.15s' }}
                    >
                      {/* Drop target indicator */}
                      {isDropTarget && (
                        <div style={{ height: 3, background: '#D94F30', borderRadius: 2, margin: '4px 0' }} />
                      )}

                      {/* Transit capsule */}
                      {transit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 4px 28px' }}>
                          <div style={{ width: 1, height: 20, background: 'rgba(26,15,10,0.12)', marginLeft: 3 }} />
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 9999,
                            background: (transit.tight || transit.far) ? 'rgba(217,79,48,0.08)' : 'rgba(26,15,10,0.05)',
                          }}>
                            {transit.tight || transit.far
                              ? <AlertTriangle size={11} color="#D94F30" />
                              : <Train size={11} color="#8A6F4A" />
                            }
                            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: (transit.tight || transit.far) ? '#D94F30' : '#8A6F4A' }}>
                              {transit.tight
                                ? t(`Tight — ${transit.mins} min gap`, `緊湊 — ${transit.mins} 分鐘間隔`)
                                : transit.far
                                  ? t(`Long transit — ${transit.mins} min`, `長途移動 — ${transit.mins} 分鐘`)
                                  : t(`🚇 ${transit.mins} min · ${transit.km} km`, `🚇 ${transit.mins} 分鐘 · ${transit.km} 公里`)
                              }
                            </span>
                            {i > 0 && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(lang === 'zh' ? filteredPlanned[i-1].location.zh : filteredPlanned[i-1].location.en)}&destination=${encodeURIComponent(lang === 'zh' ? ev.location.zh : ev.location.en)}`}
                                target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', color: '#D94F30', textDecoration: 'none' }}
                              >
                                <ExternalLink size={10} color="#D94F30" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Event row */}
                      <div style={{ display: 'flex', gap: 12, marginBottom: 4, minWidth: 0 }}>
                        {/* Time column — tap to edit */}
                        <div style={{ width: 36, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditPicker({ eventId: ev.id, dateKey: sched?.dateKey ?? 'today', timeSlot: sched?.timeSlot ?? 'afternoon' });
                            }}
                            title={t('Edit time', '修改時間')}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          >
                            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#D94F30', textDecoration: 'underline dotted' }}>{timeStr}</span>
                          </button>
                          {i < filteredPlanned.length - 1 && (
                            <div style={{ flex: 1, width: 1, background: 'rgba(26,15,10,0.1)', marginTop: 4, minHeight: 20 }} />
                          )}
                        </div>

                        {/* Card — Issue 2: minWidth:0 prevents overflow */}
                        <div
                          onClick={() => navigate(`/event/${ev.id}`)}
                          style={{
                            flex: 1, minWidth: 0, background: '#fff', borderRadius: 16, padding: '12px', marginBottom: 8,
                            boxShadow: isBeingDragged
                              ? '0 12px 32px rgba(26,15,10,0.18)'
                              : '0 4px 14px rgba(26,15,10,0.07)',
                            transform: isBeingDragged ? 'scale(1.02)' : 'scale(1)',
                            cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                            transition: 'box-shadow 0.15s, transform 0.15s',
                          }}
                        >
                          {/* Drag handle */}
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', alignSelf: 'center', cursor: 'grab', color: 'rgba(26,15,10,0.25)', flexShrink: 0 }}
                          >
                            <GripVertical size={16} />
                          </div>
                          <EventThumb ev={ev} lang={lang} size={52} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, fontWeight: 800, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lang === 'zh' ? ev.title.zh : ev.title.en}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                              <MapPin size={10} color="#8A6F4A" />
                              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: '#8A6F4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {lang === 'zh' ? ev.location.zh : ev.location.en}
                              </span>
                            </div>
                          </div>
                          {/* Action column */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                            {/* Move up */}
                            <button
                              onClick={(e) => { e.stopPropagation(); moveFilteredItem(i, -1); }}
                              disabled={i === 0}
                              style={{ width: 26, height: 26, borderRadius: 8, background: i === 0 ? 'transparent' : 'rgba(26,15,10,0.05)', border: 'none', cursor: i === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i === 0 ? 0.2 : 1 }}
                            >
                              <ChevronUp size={13} color="#8A6F4A" />
                            </button>
                            {/* Move down */}
                            <button
                              onClick={(e) => { e.stopPropagation(); moveFilteredItem(i, 1); }}
                              disabled={i === filteredPlanned.length - 1}
                              style={{ width: 26, height: 26, borderRadius: 8, background: i === filteredPlanned.length - 1 ? 'transparent' : 'rgba(26,15,10,0.05)', border: 'none', cursor: i === filteredPlanned.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i === filteredPlanned.length - 1 ? 0.2 : 1 }}
                            >
                              <ChevronDown size={13} color="#8A6F4A" />
                            </button>
                            {/* Mark attended */}
                            <button
                              onClick={(e) => { e.stopPropagation(); markAttended(ev.id); }}
                              title={t('Mark as attended', '標記已參加')}
                              style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(127,164,145,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <CheckCircle size={13} color="#7FA491" />
                            </button>
                            {/* Remove */}
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePlan(ev.id); }}
                              style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(217,79,48,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <X size={12} color="#D94F30" />
                            </button>
                          </div>
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
                <div style={{ fontSize: 40, marginBottom: 14 }}>🔖</div>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: '0 0 6px' }}>
                  {t('Bookmark events you\'re interested in', '收藏你感興趣的活動')}
                </p>
                <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '12px 28px', borderRadius: 14, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700 }}>
                  {t('Explore', '探索')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
                {savedEvents.map(ev => {
                  const color = PIN_COLOR[ev.category] ?? '#D94F30';
                  const isPlanned = planned.has(ev.id);
                  return (
                    <div key={ev.id} onClick={() => navigate(`/event/${ev.id}`)} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 14px rgba(26,15,10,0.08)', cursor: 'pointer' }}>
                      <div style={{ height: 100, position: 'relative', background: VIBE_FALLBACK[ev.vibe] ?? VIBE_FALLBACK.warm, backgroundImage: `url(${ev.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />
                        <div style={{ position: 'absolute', bottom: 6, left: 8, padding: '2px 7px', borderRadius: 9999, background: color, fontFamily: '"Plus Jakarta Sans"', fontSize: 9, fontWeight: 800, color: '#fff' }}>
                          {CATEGORY_LABEL[ev.category]?.[lang] ?? ev.category}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); if (!isPlanned) togglePlan(ev.id); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isPlanned ? '#D94F30' : 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                          {isPlanned ? <span style={{ fontSize: 12 }}>✓</span> : <Plus size={14} color="#1A1A1A" />}
                        </button>
                      </div>
                      <div style={{ padding: '8px 10px 10px' }}>
                        <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 12, fontWeight: 800, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            pastEvents.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🗓️</div>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#8A6F4A', margin: 0 }}>
                  {t('No attended events yet', '尚無已參加的活動')}
                </p>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#B09070', marginTop: 6 }}>
                  {t('Tap ✓ on a planned event to mark it as attended', '在計畫活動上點 ✓ 標記已參加')}
                </p>
              </div>
            ) : (
              <div style={{ padding: '0 20px' }}>
                {pastEvents.map(ev => (
                  <div key={ev.id} onClick={() => navigate(`/event/${ev.id}`)} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid rgba(26,15,10,0.06)' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <EventThumb ev={ev} lang={lang} size={52} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={20} color="#7FA491" />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 14, fontWeight: 700, color: '#8A6F4A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'zh' ? ev.title.zh : ev.title.en}
                      </div>
                      <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#B09070', marginTop: 2 }}>
                        {t('Attended ✓', '已參加 ✓')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Floating action buttons */}
      {segment === 'planned' && orderedPlanned.length > 0 && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 96, display: 'flex', gap: 10, zIndex: 30 }}>
          {/* Auto-generate itinerary */}
          <button onClick={handleAutoGenerate} style={{
            height: 48, padding: '0 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'rgba(217,79,48,0.1)', color: '#D94F30',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0,
          }}>
            <Sparkles size={14} color="#D94F30" />
            {t('Auto-plan', '幫我排行程')}
          </button>
          <button onClick={() => setShowRouteModal(true)} style={{
            flex: 1, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: '#1A1A1A', color: '#fff',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(26,15,10,0.3)',
          }}>
            <Sparkles size={16} color="#E8B04B" />
            {t('View Route', '查看路線')}
          </button>
          {/* Share to LINE */}
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0, textDecoration: 'none',
            background: '#06C755', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(6,199,85,0.35)',
          }}>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>LINE</span>
          </a>
          <button style={{ width: 48, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,15,10,0.12)' }}>
            <Share2 size={18} color="#1A1A1A" />
          </button>
        </div>
      )}

      <TabBar lang={lang} dark={false} />

      {/* Auto-generate itinerary modal */}
      {showAutoModal && (
        <div onClick={() => setShowAutoModal(false)} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FAF7F2', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="#E8B04B" />
                  <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{t('Suggested Itinerary', '智慧行程建議')}</span>
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#8A6F4A', marginTop: 2 }}>{t('Based on proximity to your planned events', '依已計畫活動就近推薦')}</div>
              </div>
              <button onClick={() => setShowAutoModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="#1A1A1A" />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 14px' }}>
              {['morning','afternoon','evening','night'].map(ts => {
                const labels = { morning: { en: '☀️ Morning', zh: '☀️ 上午' }, afternoon: { en: '🌤 Afternoon', zh: '🌤 下午' }, evening: { en: '🌆 Evening', zh: '🌆 傍晚' }, night: { en: '🌙 Night', zh: '🌙 深夜' } };
                const hasAny = autoSuggestions.some(s => s.timeSlot === ts);
                if (!hasAny) return null;
                return <span key={ts} style={{ padding: '3px 10px', borderRadius: 9999, background: 'rgba(26,15,10,0.07)', fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#8A6F4A' }}>{lang === 'zh' ? labels[ts].zh : labels[ts].en}</span>;
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {autoSuggestions.map(({ ev, timeSlot }, i) => {
                const color = PIN_COLOR[ev.category] ?? '#D94F30';
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: '#fff', boxShadow: '0 2px 8px rgba(26,15,10,0.06)' }}>
                    <EventThumb ev={ev} lang={lang} size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, fontWeight: 800, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'zh' ? ev.title.zh : ev.title.en}
                      </div>
                      <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', marginTop: 2 }}>
                        {lang === 'zh' ? ev.location.zh : ev.location.en}
                      </div>
                    </div>
                    <button onClick={() => setAutoSuggestions(prev => prev.filter((_, j) => j !== i))} style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(217,79,48,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <X size={12} color="#D94F30" />
                    </button>
                  </div>
                );
              })}
            </div>
            {autoSuggestions.length === 0 ? (
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#8A6F4A', textAlign: 'center', marginBottom: 16 }}>{t('All suggestions removed', '已移除所有建議')}</p>
            ) : (
              <button
                onClick={() => {
                  autoSuggestions.forEach(({ ev, timeSlot }) => addToPlanScheduled(ev.id, { dateKey: activeDateKey, timeSlot }));
                  setShowAutoModal(false);
                }}
                style={{ width: '100%', height: 50, borderRadius: 14, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 15, fontWeight: 800, marginBottom: 10 }}
              >
                {t(`Add ${autoSuggestions.length} events to plan`, `加入 ${autoSuggestions.length} 個活動到計畫`)}
              </button>
            )}
            <button onClick={() => setShowAutoModal(false)} style={{ width: '100%', height: 46, borderRadius: 14, border: 'none', cursor: 'pointer', background: 'rgba(26,15,10,0.07)', color: '#1A1A1A', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700 }}>
              {t('Cancel', '取消')}
            </button>
          </div>
        </div>
      )}

      {/* Day-full warning modal */}
      {showDayFullModal && (
        <div onClick={() => setShowDayFullModal(false)} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FAF7F2', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(217,79,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#D94F30" />
              </div>
              <div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 17, fontWeight: 800, color: '#1A1A1A' }}>
                  {t('Day is full!', '今天行程已滿！')}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#8A6F4A', marginTop: 2 }}>
                  {t('You already have 4 activities planned for this day.', '你今天已安排了 4 個活動。')}
                </div>
              </div>
            </div>
            <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, color: '#5A4A35', margin: '0 0 18px', lineHeight: 1.5 }}>
              {t('Want to replace an existing activity? Remove one from the list below, then run Auto-plan again.', '想替換現有活動嗎？請先從下方清單刪除一個活動，再重新執行自動排程。')}
            </p>
            <button onClick={() => setShowDayFullModal(false)} style={{ width: '100%', height: 50, borderRadius: 14, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 15, fontWeight: 800 }}>
              {t('OK, got it', '知道了')}
            </button>
          </div>
        </div>
      )}

      {/* Generate Route Modal */}
      {showRouteModal && (
        <div onClick={() => setShowRouteModal(false)} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#FAF7F2', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{t('🗺 Route Plan', '🗺 路線規劃')}</div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, color: '#8A6F4A', marginTop: 2 }}>{t('Optimised by proximity & time', '依位置與時間優化')}</div>
              </div>
              <button onClick={() => setShowRouteModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="#1A1A1A" />
              </button>
            </div>

            {displayList.map((ev, i) => {
              const transit = i > 0 ? transitBetween(displayList[i-1], ev) : null;
              return (
                <div key={ev.id}>
                  {transit && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0 6px 34px' }}>
                      <div style={{ width: 1, height: 14, background: 'rgba(26,15,10,0.15)', marginLeft: -18 }} />
                      <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: transit.tight || transit.far ? '#D94F30' : '#8A6F4A', fontWeight: 600 }}>
                        🚇 {transit.mins} min · {transit.km} km
                      </span>
                      <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(lang === 'zh' ? displayList[i-1].location.zh : displayList[i-1].location.en)}&destination=${encodeURIComponent(lang === 'zh' ? ev.location.zh : ev.location.en)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 9999, background: 'rgba(217,79,48,0.1)', textDecoration: 'none' }}>
                        <ExternalLink size={10} color="#D94F30" />
                        <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700, color: '#D94F30' }}>{t('Maps', '地圖')}</span>
                      </a>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: PIN_COLOR[ev.category] ?? '#D94F30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, color: '#fff' }}>{i + 1}</div>
                    <EventThumb ev={ev} lang={lang} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'zh' ? ev.title.zh : ev.title.en}
                      </div>
                      <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', marginTop: 1 }}>
                        {lang === 'zh' ? ev.location.zh : ev.location.en}
                      </div>
                    </div>
                    <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 600, color: '#8A6F4A' }}>{(() => { const s = planSchedule.get(ev.id); return s ? `${TIME_SLOT_HOURS[s.timeSlot] ?? '09'}:00` : '09:00'; })()}</span>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(232,176,75,0.1)', border: '1px solid rgba(232,176,75,0.25)', fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 600, color: '#8A5F00' }}>
              {t(`~${estHrs} hrs · NT$${estCost} estimated · ${totalKm} km total`, `約 ${estHrs} 小時 · NT$${estCost} · ${totalKm} 公里`)}
            </div>

            {/* Open full route in Google Maps */}
            {gmUrl && (
              <a href={gmUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 50, borderRadius: 14, background: '#4285F4', color: '#fff', textDecoration: 'none', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700 }}>
                <ExternalLink size={16} color="#fff" />
                {t('Open in Google Maps', '在 Google Maps 開啟')}
              </a>
            )}

            {/* Share to LINE */}
            <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 50, borderRadius: 14, background: '#06C755', color: '#fff', textDecoration: 'none', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700 }}>
              <span style={{ fontWeight: 900, letterSpacing: -0.5 }}>LINE</span>
              {t('Share to LINE', '分享至 LINE')}
            </a>

            <button onClick={() => setShowRouteModal(false)} style={{ marginTop: 10, width: '100%', height: 46, borderRadius: 14, border: 'none', cursor: 'pointer', background: 'rgba(26,15,10,0.07)', color: '#1A1A1A', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700 }}>
              {t('Close', '關閉')}
            </button>
          </div>
        </div>
      )}

      {/* Edit date/time picker for an existing plan item */}
      {editPicker && (
        <PlanPicker
          lang={lang}
          initialDate={editPicker.dateKey}
          initialTime={editPicker.timeSlot}
          onConfirm={({ dateKey, timeSlot }) => {
            addToPlanScheduled(editPicker.eventId, { dateKey, timeSlot });
            setEditPicker(null);
          }}
          onClose={() => setEditPicker(null)}
          confirmLabel={lang === 'zh' ? '更新時間' : 'Update Schedule'}
          zOffset={60}
        />
      )}
    </div>
  );
}
