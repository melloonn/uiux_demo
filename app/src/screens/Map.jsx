// Map screen — full interactive Taipei map (migrated from map.jsx)
import { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { EventPeek } from '../components/event/EventPeek.jsx';
import { FilterSheet, DEFAULT_MAP_FILTERS } from '../components/ui/FilterSheet.jsx';
import { EVENTS, PIN_COLOR, CATEGORY_ICON } from '../data/events.js';
import { Search, SlidersHorizontal, Locate, Layers, Check, X } from 'lucide-react';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';

const MAP_PALETTE = {
  red: '#D94F30', gold: '#E8B04B', ink: '#1A1A1A', rice: '#FAF7F2',
  water: '#B8D0CC', land: '#F2E7D5', landAlt: '#ECDFC8', landDeep: '#E4D4B8',
  mrtRed: '#D94F30', mrtGreen: '#7FA491', mrtBlue: '#6B8AAD', mrtBrown: '#8B5E3C',
};

// City filter chips
const CITIES = [
  { k: 'taipei',    zh: '台北', en: 'Taipei',     color: '#D94F30' },
  { k: 'new-taipei', zh: '新北', en: 'New Taipei', color: '#5B4B8A' },
  { k: 'taoyuan',   zh: '桃園', en: 'Taoyuan',    color: '#6B8AAD' },
  { k: 'taichung',  zh: '台中', en: 'Taichung',   color: '#E8B04B' },
  { k: 'tainan',    zh: '台南', en: 'Tainan',     color: '#8B4A2F' },
  { k: 'kaohsiung', zh: '高雄', en: 'Kaohsiung',  color: '#4285F4' },
  { k: 'yilan',     zh: '宜蘭', en: 'Yilan',      color: '#7FA491' },
  { k: 'hualien',   zh: '花蓮', en: 'Hualien',    color: '#8A6F4A' },
  { k: 'taitung',   zh: '台東', en: 'Taitung',    color: '#6B6B6B' },
];

// Pan target (SVG units) when a city chip is selected
const CITY_PAN = {
  'taipei':     { x: 0,   y: 0 },
  'new-taipei': { x: 60,  y: -40 },
  'taoyuan':    { x: 80,  y: -60 },
  'taichung':   { x: 0,   y: -130 },
  'tainan':     { x: 20,  y: -140 },
  'kaohsiung':  { x: 40,  y: -140 },
  'yilan':      { x: -120, y: 20 },
  'hualien':    { x: -140, y: 0 },
  'taitung':    { x: -140, y: 20 },
};

function getCity(ev) {
  return ev.city ?? 'taipei';
}

const USER_POS = { x: 230, y: 390 };
const DEFAULT_FILTERS = DEFAULT_MAP_FILTERS;
const ALL_PRICES = ['free', '$', '$$', '$$$'];

function TaipeiMap({ lang, visibleIds, selectedId, onPinTap, pan, mapStyle }) {
  const desaturate = mapStyle === 'minimal' ? 'saturate(0.45) brightness(1.02)' : 'none';
  const districts = lang === 'zh'
    ? { DATONG: '大同', WANHUA: '萬華', ZHONGZHENG: '中正', DAAN: '大安', SONGSHAN: '松山', ZHONGSHAN: '中山' }
    : { DATONG: 'DATONG', WANHUA: 'WANHUA', ZHONGZHENG: 'ZHONGZHENG', DAAN: "DA'AN", SONGSHAN: 'SONGSHAN', ZHONGSHAN: 'ZHONGSHAN' };

  return (
    <svg viewBox="0 0 390 640" width="100%" height="100%"
      style={{ display: 'block', touchAction: 'none', filter: desaturate, transition: 'filter 0.4s ease' }}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="paper" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill={MAP_PALETTE.land}/>
          <circle cx="20" cy="30" r="0.8" fill="#C9B88A" opacity="0.35"/>
          <circle cx="70" cy="90" r="0.6" fill="#C9B88A" opacity="0.3"/>
        </pattern>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dy="2"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="heat1" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#E8B04B" stopOpacity="0.7"/>
          <stop offset="55%" stopColor="#D94F30" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#D94F30" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <g transform={`translate(${pan.x},${pan.y})`} style={{ transition: pan.animated ? 'transform 0.55s cubic-bezier(.2,.9,.3,1)' : 'none' }}>
        <rect x="-400" y="-400" width="1200" height="1500" fill="url(#paper)"/>

        {/* terrain blobs */}
        <g opacity="0.45">
          <path d="M-10,80 Q60,40 120,70 T250,60 T400,85 L400,130 Q320,110 240,125 T100,120 T-10,140 Z" fill={MAP_PALETTE.landDeep}/>
          <path d="M-10,600 Q100,560 200,580 T400,570 L400,640 L-10,640 Z" fill={MAP_PALETTE.landDeep} opacity="0.7"/>
        </g>
        <g opacity="0.55" filter="url(#softShadow)">
          <ellipse cx="260" cy="430" rx="125" ry="90" fill={MAP_PALETTE.landAlt}/>
          <ellipse cx="160" cy="380" rx="95" ry="75" fill={MAP_PALETTE.landAlt} opacity="0.8"/>
        </g>

        {/* Tamsui river */}
        <path d="M -10 180 Q 40 190 80 220 T 150 260 Q 175 285 165 315 T 130 370 Q 120 415 80 440 T -10 470"
          fill="none" stroke={MAP_PALETTE.water} strokeWidth="28" strokeLinecap="round" opacity="0.95"/>
        <text x="40" y="210" fontFamily="'Plus Jakarta Sans','Noto Sans TC',system-ui"
          fontSize={lang === 'zh' ? 13 : 10} fontWeight="600" fill="#6D8883" letterSpacing={lang === 'zh' ? 3 : 2}>
          {lang === 'zh' ? '淡水河' : 'TAMSUI R.'}
        </text>

        {/* MRT lines */}
        <g fill="none" strokeWidth="3" strokeLinecap="round" opacity="0.85">
          <path d="M 90 80 Q 150 160 200 260 T 260 480 T 330 600" stroke={MAP_PALETTE.mrtRed} opacity="0.55"/>
          <path d="M 380 140 Q 320 220 240 300 T 120 450 T 40 560" stroke={MAP_PALETTE.mrtGreen} opacity="0.55"/>
          <path d="M -10 380 Q 80 370 180 400 T 300 420 T 400 390" stroke={MAP_PALETTE.mrtBlue} opacity="0.55"/>
          <path d="M 40 220 Q 150 280 240 320 T 360 360" stroke={MAP_PALETTE.mrtBrown} opacity="0.4"/>
        </g>
        {[[200,260,MAP_PALETTE.mrtRed],[220,350,MAP_PALETTE.mrtRed],[255,460,MAP_PALETTE.mrtRed],
          [240,300,MAP_PALETTE.mrtGreen],[180,390,MAP_PALETTE.mrtGreen],[120,450,MAP_PALETTE.mrtGreen],
          [80,385,MAP_PALETTE.mrtBlue],[180,400,MAP_PALETTE.mrtBlue],[260,415,MAP_PALETTE.mrtBlue],
        ].map(([x,y,c],i) => <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={c} strokeWidth="2"/>)}

        {/* District labels */}
        <g fontFamily="'Plus Jakarta Sans','Noto Sans TC',system-ui" fontWeight="700" fill="#8A6F4A" opacity="0.75" letterSpacing={lang==='zh'?3:2.5}>
          <text x="210" y="225" fontSize={lang==='zh'?13:10}>{districts.DATONG}</text>
          <text x="170" y="365" fontSize={lang==='zh'?13:10}>{districts.WANHUA}</text>
          <text x="290" y="370" fontSize={lang==='zh'?13:10}>{districts.ZHONGZHENG}</text>
          <text x="310" y="480" fontSize={lang==='zh'?13:10}>{districts.DAAN}</text>
          <text x="340" y="280" fontSize={lang==='zh'?13:10}>{districts.SONGSHAN}</text>
          <text x="240" y="190" fontSize={lang==='zh'?13:10}>{districts.ZHONGSHAN}</text>
        </g>

        {/* Heatmap overlay */}
        <g style={{ opacity: mapStyle === 'heatmap' ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <circle cx="220" cy="420" r="110" fill="url(#heat1)"/>
          <circle cx="320" cy="320" r="80" fill="url(#heat1)"/>
          <circle cx="150" cy="410" r="70" fill="url(#heat1)"/>
        </g>

        {/* Event pins */}
        {EVENTS.map(ev => {
          const visible = visibleIds.has(ev.id);
          const selected = selectedId === ev.id;
          const color = PIN_COLOR[ev.category] ?? '#D94F30';
          const label = CATEGORY_ICON[ev.category] ?? '●';
          const size = 36;
          return (
            <g key={ev.id}
              data-pin
              transform={`translate(${ev.mapX},${ev.mapY})`}
              style={{ cursor: 'pointer', opacity: visible ? 1 : 0.2, transition: 'opacity 0.3s', pointerEvents: visible ? 'auto' : 'none' }}
              onClick={(e) => { e.stopPropagation(); onPinTap(ev.id); }}
            >
              {selected && (
                <circle r="32" fill={color} opacity="0.2">
                  <animate attributeName="r" from="22" to="36" dur="1.4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.28" to="0" dur="1.4s" repeatCount="indefinite"/>
                </circle>
              )}
              <g filter="url(#softShadow)" style={{ transform: selected ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>
                <path d={`M${-size/2} ${-size/2} L${size/2} ${-size/2} Q${size/2+4} ${-size/2} ${size/2+4} ${-size/2+4} L${size/2+4} ${size/2-4} Q${size/2+4} ${size/2} ${size/2} ${size/2} L4 ${size/2} L0 ${size/2+8} L-4 ${size/2} L${-size/2} ${size/2} Q${-size/2-4} ${size/2} ${-size/2-4} ${size/2-4} L${-size/2-4} ${-size/2+4} Q${-size/2-4} ${-size/2} ${-size/2} ${-size/2} Z`}
                  fill={color} stroke="#fff" strokeWidth="2.5"/>
                <text y="6" textAnchor="middle"
                  fontFamily="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',system-ui"
                  fontSize="16">{label}</text>
              </g>
            </g>
          );
        })}

        {/* User dot */}
        <g>
          <circle cx={USER_POS.x} cy={USER_POS.y} r="18" fill={MAP_PALETTE.red} opacity="0.12">
            <animate attributeName="r" from="12" to="22" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.22" to="0" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={USER_POS.x} cy={USER_POS.y} r="7" fill="#fff"/>
          <circle cx={USER_POS.x} cy={USER_POS.y} r="5" fill={MAP_PALETTE.red}/>
        </g>
      </g>

      {/* Compass */}
      <g transform="translate(352,94)" opacity="0.55">
        <circle r="14" fill="#fff" stroke="#C9B88A" strokeWidth="1"/>
        <path d="M0 -9 L2.5 0 L0 9 L-2.5 0 Z" fill={MAP_PALETTE.red}/>
        <text x="0" y="-16" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" fontSize="7" fontWeight="700" fill="#8A6F4A">N</text>
      </g>
    </svg>
  );
}

export default function MapScreen() {
  const { lang, setLang, saved, planned } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(null);

  // On mount: if navigated from Reels with ?focus=eventId, select that pin
  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus) setSelectedId(focus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [activeCats, setActiveCats] = useState(new Set());   // empty = all categories
  const [activeCities, setActiveCities] = useState(new Set()); // empty = all cities
  const [freeOnly, setFreeOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  const [layersOpen, setLayersOpen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0, animated: false });
  const panRef = useRef(pan); panRef.current = pan;
  const dragRef = useRef(null);
  const surfaceRef = useRef(null);
  const PAN_LIMIT = 140;

  const t = (en, zh) => lang === 'zh' ? zh : en;

  const onSurfacePointerDown = (e) => {
    if (e.target.closest?.('[data-pin]')) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y, moved: false };
    try { surfaceRef.current.setPointerCapture(e.pointerId); } catch(_) {}
  };
  const onSurfacePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) > 5) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;
    setPan({
      x: Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, dragRef.current.origX + dx)),
      y: Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, dragRef.current.origY + dy)),
      animated: false,
    });
  };
  const endDrag = (e) => {
    try { surfaceRef.current?.releasePointerCapture(dragRef.current?.pointerId); } catch(_) {}
    dragRef.current = null;
  };
  const needsRecenter = Math.abs(pan.x) + Math.abs(pan.y) > 8;
  const recenter = () => setPan({ x: 0, y: 0, animated: true });

  const visibleIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return new Set(EVENTS.filter(ev => {
      if (activeCats.size > 0 && !activeCats.has(ev.category)) return false;
      if (activeCities.size > 0 && !activeCities.has(getCity(ev))) return false;
      if (freeOnly && !ev.free) return false;
      if (q) {
        const hay = `${ev.title.en} ${ev.title.zh} ${ev.location?.en ?? ''} ${ev.location?.zh ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (ev.dist > filters.distance) return false;
      if (!filters.prices.includes(ev.priceTier)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(ev.category)) return false;
      return true;
    }).map(ev => ev.id));
  }, [activeCats, activeCities, freeOnly, search, filters]);

  const selectedEvent = EVENTS.find(ev => ev.id === selectedId && visibleIds.has(ev.id));

  const cats = [
    { k: 'festivals',         l: t('Festivals', '節慶'), color: PIN_COLOR.festivals },
    { k: 'night-markets',     l: t('Markets',   '夜市'), color: PIN_COLOR['night-markets'] },
    { k: 'live-music',        l: t('Live',      '演出'), color: PIN_COLOR['live-music'] },
    { k: 'temples-heritage',  l: t('Heritage',  '廟宇'), color: PIN_COLOR['temples-heritage'] },
    { k: 'art-markets',       l: t('Art',       '市集'), color: PIN_COLOR['art-markets'] },
    { k: 'exhibitions',       l: t('Exhibits',  '展覽'), color: PIN_COLOR.exhibitions },
  ];

  const toggleCat = (k) => setActiveCats(prev => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });
  const toggleCity = (k) => {
    setActiveCities(prev => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
        if (next.size === 0) setPan({ x: 0, y: 0, animated: true });
      } else {
        next.add(k);
        const target = CITY_PAN[k] ?? { x: 0, y: 0 };
        setPan({ ...target, animated: true });
      }
      return next;
    });
  };

  const filterBadgeCount = useMemo(() => {
    let n = 0;
    if (filters.distance < 10) n++;
    if (filters.prices.length < ALL_PRICES.length) n++;
    if (filters.categories.length > 0) n++;
    if (filters.time !== 'all') n++;
    return n;
  }, [filters]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: MAP_PALETTE.land, overflow: 'hidden' }}>
      {/* Map surface */}
      <div
        ref={surfaceRef}
        onPointerDown={onSurfacePointerDown}
        onPointerMove={onSurfacePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, cursor: 'grab', touchAction: 'none' }}
      >
        <TaipeiMap lang={lang} visibleIds={visibleIds} selectedId={selectedId} onPinTap={setSelectedId} pan={pan} mapStyle={mapStyle} />
      </div>

      {/* Top fade gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, zIndex: 15, background: 'linear-gradient(180deg, rgba(250,247,242,0.9) 0%, rgba(250,247,242,0.7) 70%, rgba(250,247,242,0) 100%)', pointerEvents: 'none' }}/>

      {/* Search bar */}
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, zIndex: 20, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, height: 46, borderRadius: 9999, background: '#fff',
          boxShadow: '0 6px 20px rgba(26,15,10,0.10)',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 0 16px',
        }}>
          <Search size={18} color="#8A6F4A" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Search nearby events…', '搜尋附近文化活動…')}
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 14, color: '#1A1A1A', fontWeight: 500,
            }}
          />
          {search ? (
            <button onClick={() => setSearch('')} style={{
              width: 22, height: 22, borderRadius: '50%', background: '#E4D4B8',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><X size={12} color="#8A6F4A" /></button>
          ) : (
            <div style={{
              padding: '4px 10px', borderRadius: 9999, background: 'rgba(217,79,48,0.1)', color: '#D94F30',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
            }}>{t('NOW', '現在')}</div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setSheetOpen(true)} style={{
            width: 46, height: 46, borderRadius: '50%',
            background: filterBadgeCount > 0 ? '#D94F30' : '#1A1A1A',
            border: 'none', cursor: 'pointer',
            boxShadow: filterBadgeCount > 0 ? '0 6px 20px rgba(217,79,48,0.4)' : '0 6px 20px rgba(26,15,10,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            <SlidersHorizontal size={18} color="#fff" />
          </button>
          {filterBadgeCount > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: '#1A1A1A', color: '#fff',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', border: '1.5px solid #FAF7F2',
            }}>{filterBadgeCount}</div>
          )}
        </div>
      </div>

      {/* Category chips — multi-select */}
      <div style={{
        position: 'absolute', top: 112, left: 0, right: 0, zIndex: 18,
        padding: '0 14px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {/* Clear all chip */}
        {activeCats.size > 0 && (
          <button onClick={() => setActiveCats(new Set())} style={{
            flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 9999,
            background: '#1A1A1A', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 12, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(26,15,10,0.15)',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
          }}>
            <X size={11} color="#fff" />
            {t('Clear', '清除')}
          </button>
        )}
        {cats.map(c => {
          const active = activeCats.has(c.k);
          return (
            <button key={c.k} onClick={() => toggleCat(c.k)} style={{
              flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 9999,
              background: active ? c.color : '#fff',
              color: active ? '#fff' : '#1A1A1A',
              border: active ? `2px solid ${c.color}` : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 13, fontWeight: 700,
              boxShadow: active ? `0 4px 14px ${c.color}55` : '0 4px 12px rgba(26,15,10,0.08)',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 13 }}>{CATEGORY_ICON[c.k]}</span>
              {c.l}
            </button>
          );
        })}
        <div style={{ width: 1, alignSelf: 'center', height: 22, background: 'rgba(26,15,10,0.12)', flexShrink: 0 }}/>
        <button onClick={() => setFreeOnly(v => !v)} style={{
          flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 9999,
          background: freeOnly ? '#7FA491' : '#fff', color: freeOnly ? '#fff' : '#1A1A1A',
          border: freeOnly ? '2px solid #7FA491' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 13, fontWeight: 700,
          boxShadow: freeOnly ? '0 4px 14px #7FA49155' : '0 4px 12px rgba(26,15,10,0.08)',
          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: freeOnly ? '#fff' : '#7FA491' }}/>
          {t('Free only', '只看免費')}
        </button>
      </div>

      {/* City chips */}
      <div style={{
        position: 'absolute', top: 154, left: 0, right: 0, zIndex: 17,
        padding: '0 14px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        <span style={{
          flexShrink: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#8A6F4A',
          textTransform: 'uppercase', alignSelf: 'center',
        }}>
          {t('City', '城市')}
        </span>
        {CITIES.map(c => {
          const active = activeCities.has(c.k);
          return (
            <button key={c.k} onClick={() => toggleCity(c.k)} style={{
              flexShrink: 0, height: 28, padding: '0 12px', borderRadius: 9999,
              background: active ? c.color : 'rgba(255,255,255,0.82)',
              color: active ? '#fff' : '#5A4A35',
              border: active ? `1.5px solid ${c.color}` : '1.5px solid rgba(26,15,10,0.1)',
              cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 11, fontWeight: 700,
              boxShadow: active ? `0 2px 10px ${c.color}44` : '0 2px 8px rgba(26,15,10,0.06)',
              transition: 'all 0.2s',
            }}>
              {lang === 'zh' ? c.zh : c.en}
            </button>
          );
        })}
        {activeCities.size > 0 && (
          <button onClick={() => { setActiveCities(new Set()); setPan({ x: 0, y: 0, animated: true }); }} style={{
            flexShrink: 0, height: 28, padding: '0 10px', borderRadius: 9999,
            background: 'transparent', color: '#8A6F4A',
            border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700,
          }}>
            {t('All', '全部')}
          </button>
        )}
      </div>

      {/* Nearby label */}
      <div style={{
        position: 'absolute', left: 16, top: 190, zIndex: 18,
        fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
        fontSize: 11, fontWeight: 800, letterSpacing: 1.6,
        color: '#8A6F4A', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#D94F30', boxShadow: '0 0 0 3px rgba(217,79,48,0.2)' }}/>
        {t('Nearby · Now', '附近 · 現在')}
        <span style={{ marginLeft: 8, color: '#1A1A1A', fontSize: 12, letterSpacing: -0.1, fontWeight: 700, textTransform: 'none' }}>
          {visibleIds.size} {t('events', '個活動')}
        </span>
      </div>

      {/* Language switch */}
      <div style={{ position: 'absolute', right: 14, top: 190, zIndex: 18 }}>
        <GlobeToggle lang={lang} setLang={setLang} />
      </div>

      {/* Side stack — layers + recenter */}
      <div style={{
        position: 'absolute', right: 14, bottom: selectedEvent ? 296 : 110,
        zIndex: 28, transition: 'bottom 0.3s ease',
        display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
      }}>
        {/* layers popover */}
        {layersOpen && (
          <div style={{
            position: 'absolute', right: 54, bottom: 60,
            width: 168, padding: 8, borderRadius: 16,
            background: 'rgba(255,253,248,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(26,15,10,0.06)',
            boxShadow: '0 20px 50px rgba(26,15,10,0.2)',
          }}>
            {[['standard', t('Standard','標準')], ['minimal', t('Minimal','簡約')], ['heatmap', t('Heatmap','熱點')]].map(([k, l]) => (
              <button key={k} onClick={() => { setMapStyle(k); setLayersOpen(false); }} style={{
                width: '100%', height: 36, padding: '0 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: mapStyle === k ? 'rgba(217,79,48,0.08)' : 'transparent',
                color: mapStyle === k ? '#D94F30' : '#1A1A1A',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700,
              }}>
                <span>{l}</span>
                {mapStyle === k && <Check size={14} color="#D94F30" />}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setLayersOpen(o => !o)} style={{
          width: 44, height: 44, borderRadius: 14,
          background: layersOpen ? '#1A1A1A' : '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(26,15,10,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Layers size={20} color={layersOpen ? '#fff' : '#1A1A1A'} />
        </button>
        <button onClick={recenter} style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#D94F30', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 22px rgba(217,79,48,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Locate size={20} color="#fff" />
        </button>
      </div>

      {/* Peek card */}
      <EventPeek event={selectedEvent} lang={lang} onClose={() => setSelectedId(null)} />

      <FilterSheet
        open={sheetOpen}
        lang={lang}
        draft={draftFilters}
        setDraft={setDraftFilters}
        onApply={() => { setFilters(draftFilters); setSheetOpen(false); }}
        onClose={() => setSheetOpen(false)}
        onReset={() => setDraftFilters(DEFAULT_FILTERS)}
        maxDistance={10}
        showSavedFilter={false}
      />

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
