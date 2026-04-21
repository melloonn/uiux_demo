// CultureFlow — Nearby Now map view (Screen 2) — interactive
// Pan + tap, filter chips, filter sheet, search, recenter, cluster expand,
// bilingual, map style switcher

const MAP_PALETTE = {
  red: '#D94F30',
  gold: '#E8B04B',
  ink: '#1A1A1A',
  rice: '#FAF7F2',
  jade: '#7FA491',
  water: '#B8D0CC',
  land: '#F2E7D5',
  landAlt: '#ECDFC8',
  landDeep: '#E4D4B8',
  mrtBrown: '#8B5E3C',
  mrtRed: '#D94F30',
  mrtGreen: '#7FA491',
  mrtBlue: '#6B8AAD',
  indigo: '#5B4B8A',  // live music
  slate:  '#6B6B6B',  // exhibition
};

// Category is now ONE of: festival | market | live | exhibition
// `free` is a separate price attribute.
// Reassigned per brief:
// 1 Longshan festival free, 2 Raohe market paid, 3 Huashan exhibition paid,
// 4 Ximending live free, 5 Dadaocheng live paid, 6 Revolver live paid,
// 7 Da'an Park market free, 8 Zhongzheng festival free,
// 9 Songshan Cultural Park exhibition paid, 10 Beitou Hot Spring festival paid
const BASE_PINS = [
  { id: 'longshan', x: 128, y: 430, category: 'festival',   labelZh: '龍', labelEn: 'Longshan',
    title: { en: 'Longshan Temple Lantern Night', zh: '龍山寺燈會夜' },
    district: { en: 'Wanhua', zh: '萬華' },
    dist: 1.2, stops: 2, free: true,  priceTier: 'free', price: 'Free',   priceZh: '免費',
    img: 'https://images.unsplash.com/photo-1542897644-e04428948020?w=400&q=70&auto=format&fit=crop' },

  { id: 'raohe',    x: 340, y: 318, category: 'market',     labelZh: '饒', labelEn: 'Raohe',
    title: { en: 'Raohe Street Night Market', zh: '饒河街夜市' },
    district: { en: 'Songshan', zh: '松山' },
    dist: 0.8, stops: 3, free: false, priceTier: '$$', price: '$$', priceZh: '$$',
    img: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=400&q=70&auto=format&fit=crop' },

  { id: 'huashan',  x: 240, y: 410, category: 'exhibition', labelZh: '華', labelEn: 'Huashan',
    title: { en: 'Huashan 1914 Exhibition', zh: '華山1914展覽' },
    district: { en: 'Zhongzheng', zh: '中正' },
    dist: 2.1, stops: 4, free: false, priceTier: '$', price: 'NT$280', priceZh: 'NT$280',
    img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70&auto=format&fit=crop' },

  { id: 'ximen',    x: 180, y: 400, category: 'live',       labelZh: '西', labelEn: 'Ximen',
    title: { en: 'Ximending Street Performance', zh: '西門町街頭演出' },
    district: { en: 'Wanhua', zh: '萬華' },
    dist: 1.8, stops: 3, free: true,  priceTier: 'free', price: 'Free', priceZh: '免費',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=70&auto=format&fit=crop' },

  { id: 'dadao',    x: 180, y: 300, category: 'live',       labelZh: '稻', labelEn: 'Dadaocheng',
    title: { en: 'Dadaocheng Riverside Concert', zh: '大稻埕河岸音樂會' },
    district: { en: 'Datong', zh: '大同' },
    dist: 3.4, stops: 5, free: false, priceTier: '$', price: 'NT$350', priceZh: 'NT$350',
    img: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=400&q=70&auto=format&fit=crop' },

  { id: 'revolver', x: 280, y: 482, category: 'live',       labelZh: 'R',  labelEn: 'Revolver',
    title: { en: 'Sunset Rollercoaster · Revolver', zh: '落日飛車 · Revolver' },
    district: { en: 'Da\u2019an', zh: '大安' },
    dist: 1.5, stops: 2, free: false, priceTier: '$$', price: 'NT$450', priceZh: 'NT$450',
    img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=70&auto=format&fit=crop' },

  { id: 'daan',     x: 270, y: 560, category: 'market',     labelZh: '公', labelEn: 'Daan Park',
    title: { en: 'Da\u2019an Forest Park Market', zh: '大安森林公園市集' },
    district: { en: 'Da\u2019an', zh: '大安' },
    dist: 2.8, stops: 5, free: true,  priceTier: 'free', price: 'Free', priceZh: '免費',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70&auto=format&fit=crop' },

  // cluster trio (pinned near upper-centre until expanded)
  { id: 'zhongzheng', x: 300, y: 240, cx: 276, cy: 222, category: 'festival',   labelZh: '正', labelEn: 'Zhongzheng',
    title: { en: 'Zhongzheng Temple Fair', zh: '中正廟會' },
    district: { en: 'Zhongzheng', zh: '中正' },
    dist: 2.6, stops: 4, free: true,  priceTier: 'free', price: 'Free', priceZh: '免費',
    img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&q=70&auto=format&fit=crop',
    inCluster: true },

  { id: 'songshan_park', x: 300, y: 240, cx: 324, cy: 222, category: 'exhibition', labelZh: '松', labelEn: 'Songshan',
    title: { en: 'Songshan Cultural Park Exhibition', zh: '松山文創園區展覽' },
    district: { en: 'Songshan', zh: '松山' },
    dist: 2.4, stops: 3, free: false, priceTier: '$', price: 'NT$320', priceZh: 'NT$320',
    img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=70&auto=format&fit=crop',
    inCluster: true },

  { id: 'beitou', x: 300, y: 240, cx: 300, cy: 264, category: 'festival', labelZh: '投', labelEn: 'Beitou',
    title: { en: 'Beitou Hot Spring Festival', zh: '北投溫泉季' },
    district: { en: 'Beitou', zh: '北投' },
    dist: 3.0, stops: 6, free: false, priceTier: '$$', price: 'NT$500', priceZh: 'NT$500',
    img: 'https://images.unsplash.com/photo-1470093851219-69951fcbb533?w=400&q=70&auto=format&fit=crop',
    inCluster: true },
];

const PIN_COLOR = {
  festival:   '#D94F30',
  market:     '#E8B04B',
  live:       '#5B4B8A',
  exhibition: '#6B6B6B',
};

const TEXT = {
  en: {
    nearbyNow: 'Nearby · Now',
    events: (n) => `${n} events`,
    searchPh: 'Search nearby events…',
    now: 'NOW',
    all: 'All nearby', festivals: 'Festivals', markets: 'Markets',
    exhibitions: 'Exhibitions', free: 'Free only', live: 'Live music',
    filters: 'Filters', distance: 'Distance', time: 'Time window',
    tNow: 'Now', tToday: 'Today', tWeekend: 'This weekend',
    priceLabel: 'Price',
    priceFree: 'Free', reset: 'Reset', apply: 'Apply filters',
    stops: (n) => `${n} stops`, stopsOne: '1 stop',
    cat: { festival: 'Festival', market: 'Market', live: 'Live Music', exhibition: 'Exhibition' },
    details: 'Details',
    river: 'TAMSUI R.',
    districts: { DATONG:'DATONG', WANHUA:'WANHUA', ZHONGZHENG:'ZHONGZHENG', DAAN:"DA'AN", SONGSHAN:'SONGSHAN', ZHONGSHAN:'ZHONGSHAN' },
    noMatch: 'No events match your filters',
    home: 'Home', discover: 'Discover', map: 'Map', plan: 'Plan', profile: 'Profile',
    km: (d) => `${d.toFixed(1)} km`,
    layers: 'Map style',
    standard: 'Standard', minimal: 'Minimal', heatmap: 'Heatmap',
  },
  zh: {
    nearbyNow: '附近 · 現在',
    events: (n) => `${n} 個活動`,
    searchPh: '搜尋附近文化活動…',
    now: '現在',
    all: '全部', festivals: '節慶', markets: '市集',
    exhibitions: '展覽', free: '只看免費', live: '現場演出',
    filters: '篩選', distance: '距離', time: '時間範圍',
    tNow: '現在', tToday: '今天', tWeekend: '本週末',
    priceLabel: '價格',
    priceFree: '免費', reset: '重設', apply: '套用篩選',
    stops: (n) => `${n} 站`, stopsOne: '1 站',
    cat: { festival: '節慶', market: '市集', live: '現場演出', exhibition: '展覽' },
    details: '查看詳情',
    river: '淡水河',
    districts: { DATONG:'大同', WANHUA:'萬華', ZHONGZHENG:'中正', DAAN:'大安', SONGSHAN:'松山', ZHONGSHAN:'中山' },
    noMatch: '沒有符合條件的活動',
    home: '首頁', discover: '探索', map: '地圖', plan: '計畫', profile: '我',
    km: (d) => `${d.toFixed(1)} 公里`,
    layers: '地圖樣式',
    standard: '標準', minimal: '簡約', heatmap: '熱點',
  },
};

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────
const MapIcon = {
  Back: ({ c='#1A1A1A' }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>),
  Search: ({ c='#1A1A1A' }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>),
  Sliders: ({ c='#1A1A1A' }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h12M4 12h7M4 18h10"/><circle cx="18" cy="6" r="2"/><circle cx="13" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>),
  Locate: ({ c='#1A1A1A' }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>),
  Metro: ({ c='#fff' }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="16" rx="5"/><path d="M9 15h6M8 21l2-2M16 21l-2-2"/></svg>),
  Chevron: ({ c }) => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>),
  Layers: ({ c }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l10 6-10 6L2 8l10-6zM2 14l10 6 10-6M2 19l10 6 10-6"/></svg>),
  Check: ({ c }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>),
  Home: ({ a, c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?c:'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V10z"/></svg>,
  Sparkle: ({ a, c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?c:'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/><circle cx="12" cy="12" r="2.5"/></svg>,
  MapPinTab: ({ a, c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?c:'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5" fill={a?'#fff':'none'}/></svg>,
  Cal: ({ a, c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?c:'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.5v4M16 2.5v4"/></svg>,
  User: ({ a, c }) => <svg width="22" height="22" viewBox="0 0 24 24" fill={a?c:'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>,
  X: ({ c='#1A1A1A', s=14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>),
};

const USER_POS = { x: 230, y: 390 };

// ─────────────────────────────────────────────
// SVG map (pannable group)
// Pin clicks are handled on individual <g data-pin> nodes using
// pointerdown/pointerup — no full-screen capture overlay.
// ─────────────────────────────────────────────
function TaipeiMap({ lang, visiblePins, pan, selectedId, onPinTap,
                     clusterExpanded, onClusterTap, mapStyle }) {
  const t = TEXT[lang];
  const individualInCluster = BASE_PINS.filter(p => p.inCluster);
  const visibleIds = new Set(visiblePins.map(p => p.id));
  const nonCluster = BASE_PINS.filter(p => !p.inCluster);
  const clusterVisibleCount = individualInCluster.filter(p => visibleIds.has(p.id)).length;

  // style-specific effects on the whole map (not on pins)
  const desaturate = mapStyle === 'minimal' ? 'saturate(0.45) brightness(1.02)' : 'none';

  return (
    <svg viewBox="0 0 390 640" width="100%" height="100%"
      style={{ display: 'block', touchAction: 'none',
               filter: desaturate, transition: 'filter 0.4s ease' }}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="paper" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill={MAP_PALETTE.land}/>
          <circle cx="20" cy="30" r="0.8" fill="#C9B88A" opacity="0.35"/>
          <circle cx="70" cy="90" r="0.6" fill="#C9B88A" opacity="0.3"/>
          <circle cx="100" cy="40" r="0.7" fill="#C9B88A" opacity="0.28"/>
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

      <g transform={`translate(${pan.x}, ${pan.y})`} style={{ transition: pan.animated ? 'transform 0.55s cubic-bezier(.2,.9,.3,1)' : 'none' }}>
        <rect x="-400" y="-400" width="1200" height="1500" fill="url(#paper)"/>

        <g opacity="0.45">
          <path d="M-10,80 Q60,40 120,70 T250,60 T400,85 L400,130 Q320,110 240,125 T100,120 T-10,140 Z" fill={MAP_PALETTE.landDeep}/>
          <path d="M-10,600 Q100,560 200,580 T400,570 L400,640 L-10,640 Z" fill={MAP_PALETTE.landDeep} opacity="0.7"/>
        </g>

        <g opacity="0.55" filter="url(#softShadow)">
          <ellipse cx="260" cy="430" rx="125" ry="90" fill={MAP_PALETTE.landAlt}/>
          <ellipse cx="160" cy="380" rx="95" ry="75" fill={MAP_PALETTE.landAlt} opacity="0.8"/>
        </g>

        <g>
          <path d="M -10 180 Q 40 190 80 220 T 150 260 Q 175 285 165 315 T 130 370 Q 120 415 80 440 T -10 470"
                fill="none" stroke={MAP_PALETTE.water} strokeWidth="28" strokeLinecap="round" opacity="0.95"/>
          <text x="40" y="210" fontFamily="'Plus Jakarta Sans', 'Noto Sans TC', system-ui"
                fontSize={lang==='zh'?13:10} fontWeight="600" fill="#6D8883" letterSpacing={lang==='zh'?3:2}>
            {t.river}
          </text>
        </g>

        <g fill="none" strokeWidth="3" strokeLinecap="round" opacity="0.85">
          <path d="M 90 80 Q 150 160 200 260 T 260 480 T 330 600" stroke={MAP_PALETTE.mrtRed} opacity="0.55"/>
          <path d="M 380 140 Q 320 220 240 300 T 120 450 T 40 560" stroke={MAP_PALETTE.mrtGreen} opacity="0.55"/>
          <path d="M -10 380 Q 80 370 180 400 T 300 420 T 400 390" stroke={MAP_PALETTE.mrtBlue} opacity="0.55"/>
          <path d="M 40 220 Q 150 280 240 320 T 360 360" stroke={MAP_PALETTE.mrtBrown} opacity="0.4"/>
        </g>

        <g>
          {[
            [200,260,MAP_PALETTE.mrtRed],[220,350,MAP_PALETTE.mrtRed],[255,460,MAP_PALETTE.mrtRed],
            [240,300,MAP_PALETTE.mrtGreen],[180,390,MAP_PALETTE.mrtGreen],[120,450,MAP_PALETTE.mrtGreen],
            [80,385,MAP_PALETTE.mrtBlue],[180,400,MAP_PALETTE.mrtBlue],[260,415,MAP_PALETTE.mrtBlue],
          ].map(([x,y,c],i) => (<circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={c} strokeWidth="2"/>))}
        </g>

        <g fontFamily="'Plus Jakarta Sans', 'Noto Sans TC', system-ui" fontWeight="700"
           fill="#8A6F4A" opacity="0.75" letterSpacing={lang==='zh'?3:2.5}>
          <text x="210" y="225" fontSize={lang==='zh'?13:10}>{t.districts.DATONG}</text>
          <text x="170" y="365" fontSize={lang==='zh'?13:10}>{t.districts.WANHUA}</text>
          <text x="290" y="370" fontSize={lang==='zh'?13:10}>{t.districts.ZHONGZHENG}</text>
          <text x="310" y="480" fontSize={lang==='zh'?13:10}>{t.districts.DAAN}</text>
          <text x="340" y="280" fontSize={lang==='zh'?13:10}>{t.districts.SONGSHAN}</text>
          <text x="240" y="190" fontSize={lang==='zh'?13:10}>{t.districts.ZHONGSHAN}</text>
        </g>

        {/* Heatmap overlay (pan-locked) — decorative gradient blobs above pins? no, below pins */}
        <g style={{ opacity: mapStyle === 'heatmap' ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <circle cx="220" cy="420" r="110" fill="url(#heat1)"/>
          <circle cx="320" cy="320" r="80"  fill="url(#heat1)"/>
          <circle cx="150" cy="410" r="70"  fill="url(#heat1)"/>
          <circle cx="290" cy="500" r="60"  fill="url(#heat1)"/>
          <circle cx="300" cy="240" r="70"  fill="url(#heat1)"/>
        </g>

        {/* non-cluster pins */}
        {nonCluster.map(p => (
          <PinGroup key={p.id} p={p}
            visible={visibleIds.has(p.id)}
            selected={selectedId === p.id}
            lang={lang}
            onTap={() => onPinTap(p.id)}/>
        ))}

        {/* cluster pins: either collapsed +N or expanded trio */}
        {individualInCluster.map(p => {
          const targetX = clusterExpanded ? p.cx : 300;
          const targetY = clusterExpanded ? p.cy : 240;
          return (
            <g key={p.id} style={{
              transform: `translate(${targetX}px, ${targetY}px)`,
              transition: 'transform 0.55s cubic-bezier(.34,1.35,.5,1), opacity 0.3s',
              opacity: clusterExpanded ? (visibleIds.has(p.id) ? 1 : 0.2) : 0,
              pointerEvents: clusterExpanded && visibleIds.has(p.id) ? 'auto' : 'none',
            }}>
              <PinInner p={p} selected={selectedId === p.id} lang={lang} onTap={() => onPinTap(p.id)}/>
            </g>
          );
        })}
        {!clusterExpanded && (
          <ClusterGroup count={clusterVisibleCount || 3}
            visible={clusterVisibleCount > 0}
            onTap={onClusterTap}/>
        )}

        <g>
          <circle cx={USER_POS.x} cy={USER_POS.y} r="18" fill={MAP_PALETTE.red} opacity="0.12">
            <animate attributeName="r" from="12" to="22" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.22" to="0" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={USER_POS.x} cy={USER_POS.y} r="7" fill="#fff"/>
          <circle cx={USER_POS.x} cy={USER_POS.y} r="5" fill={MAP_PALETTE.red}/>
        </g>
      </g>

      <g transform="translate(352,94)" opacity="0.55">
        <circle r="14" fill="#fff" stroke="#C9B88A" strokeWidth="1"/>
        <path d="M0 -9 L2.5 0 L0 9 L-2.5 0 Z" fill={MAP_PALETTE.red}/>
        <text x="0" y="-16" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" fontSize="7" fontWeight="700" fill="#8A6F4A">N</text>
      </g>
    </svg>
  );
}

// Wrapper that positions a pin and owns its local tap/drag detection
function PinGroup({ p, visible, selected, lang, onTap }) {
  // local pointer tracking — if the user drags >5px, don't treat as tap
  const ref = React.useRef(null);
  const handlers = usePinTap(onTap);
  return (
    <g data-pin
       ref={ref}
       transform={`translate(${p.x}, ${p.y})`}
       style={{
         cursor: 'pointer',
         opacity: visible ? 1 : 0.2,
         transition: 'opacity 0.3s ease',
         pointerEvents: visible ? 'auto' : 'none',
       }}
       {...handlers}>
      <PinInner p={p} selected={selected} lang={lang}/>
    </g>
  );
}

function ClusterGroup({ count, visible, onTap }) {
  const handlers = usePinTap(onTap);
  return (
    <g data-pin
       transform={`translate(300, 240)`}
       style={{ cursor: 'pointer', opacity: visible ? 1 : 0.2, transition: 'opacity 0.3s', pointerEvents: 'auto' }}
       {...handlers}>
      <circle r="26" fill={MAP_PALETTE.red} opacity="0.18">
        <animate attributeName="r" from="22" to="32" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.22" to="0" dur="2s" repeatCount="indefinite"/>
      </circle>
      <g filter="url(#softShadow)">
        <circle r="22" fill={MAP_PALETTE.red} stroke="#fff" strokeWidth="2.5"/>
        <text y="6" textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', system-ui"
              fontSize="15" fontWeight="800" fill="#fff">+{count}</text>
      </g>
    </g>
  );
}

// local tap hook — distinguish tap from drag using movement threshold
function usePinTap(onTap) {
  const start = React.useRef(null);
  return {
    onPointerDown: (e) => {
      e.stopPropagation();
      start.current = { x: e.clientX, y: e.clientY, moved: false };
    },
    onPointerMove: (e) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      if (Math.hypot(dx, dy) > 5) start.current.moved = true;
    },
    onPointerUp: (e) => {
      if (start.current && !start.current.moved) {
        e.stopPropagation();
        onTap && onTap();
      }
      start.current = null;
    },
    onPointerCancel: () => { start.current = null; },
  };
}

function PinInner({ p, selected, lang }) {
  const color = PIN_COLOR[p.category];
  const size = 36;
  const label = lang === 'zh' ? p.labelZh : p.labelEn.slice(0, 1);
  return (
    <g>
      {selected && (
        <circle r="32" fill={color} opacity="0.2">
          <animate attributeName="r" from="22" to="36" dur="1.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.28" to="0" dur="1.4s" repeatCount="indefinite"/>
        </circle>
      )}
      <g filter="url(#softShadow)" transform={selected ? 'scale(1.15)' : 'scale(1)'} style={{transition:'transform 0.2s'}}>
        <path d={`M ${-size/2} ${-size/2}
                 L ${size/2} ${-size/2}
                 Q ${size/2+4} ${-size/2} ${size/2+4} ${-size/2+4}
                 L ${size/2+4} ${size/2-4}
                 Q ${size/2+4} ${size/2} ${size/2} ${size/2}
                 L 4 ${size/2}
                 L 0 ${size/2+8}
                 L -4 ${size/2}
                 L ${-size/2} ${size/2}
                 Q ${-size/2-4} ${size/2} ${-size/2-4} ${size/2-4}
                 L ${-size/2-4} ${-size/2+4}
                 Q ${-size/2-4} ${-size/2} ${-size/2} ${-size/2} Z`}
              fill={color} stroke="#fff" strokeWidth="2.5"/>
        <text y="5" textAnchor="middle"
              fontFamily="'Plus Jakarta Sans','Noto Sans TC',system-ui"
              fontSize={lang === 'zh' ? 16 : 13} fontWeight="800" fill="#fff">{label}</text>
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────
function MapTopBar({ lang, search, setSearch, onFilter }) {
  const t = TEXT[lang];
  return (
    <div style={{
      position: 'absolute', top: 54, left: 0, right: 0, zIndex: 20,
      padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <button style={circleBtn()}><MapIcon.Back/></button>
      <div style={{
        flex: 1, height: 46, borderRadius: 100, background: '#fff',
        boxShadow: '0 6px 20px rgba(26,15,10,0.10), 0 1px 2px rgba(26,15,10,0.04)',
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 0 16px',
      }}>
        <MapIcon.Search c="#8A6F4A"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t.searchPh}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none',
            background: 'transparent',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 14, color: '#1A1A1A', fontWeight: 500,
          }}/>
        {search ? (
          <button onClick={() => setSearch('')} style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#E4D4B8', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}><MapIcon.X c="#8A6F4A" s={12}/></button>
        ) : (
          <div style={{
            padding: '4px 10px', borderRadius: 100,
            background: 'rgba(217,79,48,0.1)', color: '#D94F30',
            fontFamily: '"Plus Jakarta Sans", system-ui',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.2, flexShrink: 0,
          }}>{t.now}</div>
        )}
      </div>
      <button onClick={onFilter} style={circleBtn(true)}><MapIcon.Sliders c="#fff"/></button>
    </div>
  );
}

function circleBtn(accent) {
  return {
    width: 46, height: 46, borderRadius: '50%',
    background: accent ? '#1A1A1A' : '#fff',
    border: 'none', cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(26,15,10,0.10), 0 1px 2px rgba(26,15,10,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  };
}

// ─────────────────────────────────────────────
// Category chips (now includes Exhibitions + Free-only toggle)
// ─────────────────────────────────────────────
function CatChips({ lang, active, setActive, freeOnly, setFreeOnly }) {
  const t = TEXT[lang];
  const cats = [
    { k: 'all',        l: t.all,         color: '#1A1A1A' },
    { k: 'festival',   l: t.festivals,   color: PIN_COLOR.festival },
    { k: 'market',     l: t.markets,     color: PIN_COLOR.market },
    { k: 'live',       l: t.live,        color: PIN_COLOR.live },
    { k: 'exhibition', l: t.exhibitions, color: PIN_COLOR.exhibition },
  ];
  return (
    <div style={{
      position: 'absolute', top: 112, left: 0, right: 0, zIndex: 18,
      padding: '0 14px', display: 'flex', gap: 6, overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {cats.map(c => (
        <button key={c.k} onClick={() => setActive(c.k)} style={{
          flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 100,
          background: active === c.k ? c.color : '#fff',
          color: active === c.k ? '#fff' : '#1A1A1A',
          border: 'none', cursor: 'pointer',
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
          boxShadow: '0 4px 12px rgba(26,15,10,0.08)',
          display: 'flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap', transition: 'all 0.2s',
        }}>
          {c.k !== 'all' && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: active === c.k ? '#fff' : c.color,
            }}/>
          )}
          {c.l}
        </button>
      ))}
      {/* Separator */}
      <div style={{ width: 1, alignSelf: 'center', height: 22, background: 'rgba(26,15,10,0.12)', flexShrink: 0 }}/>
      {/* Free-only toggle */}
      <button onClick={() => setFreeOnly(v => !v)} style={{
        flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 100,
        background: freeOnly ? MAP_PALETTE.jade : '#fff',
        color: freeOnly ? '#fff' : '#1A1A1A',
        border: 'none', cursor: 'pointer',
        fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
        fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
        boxShadow: '0 4px 12px rgba(26,15,10,0.08)',
        display: 'flex', alignItems: 'center', gap: 6,
        whiteSpace: 'nowrap', transition: 'all 0.2s',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: freeOnly ? '#fff' : MAP_PALETTE.jade,
        }}/>
        {t.free}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Peek card
// ─────────────────────────────────────────────
function PeekCard({ pin, lang, onClose }) {
  if (!pin) return null;
  const t = TEXT[lang];
  const color = PIN_COLOR[pin.category];
  const isFree = pin.free;
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 92,
      zIndex: 30, padding: 12, borderRadius: 22, background: '#fff',
      boxShadow: '0 24px 60px rgba(26,15,10,0.2), 0 2px 6px rgba(26,15,10,0.05)',
      border: '1px solid rgba(26,15,10,0.05)',
      animation: 'peekIn 0.35s cubic-bezier(.34,1.2,.64,1)',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', position: 'relative' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, #1A1A1A)`,
          backgroundImage: `url(${pin.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%)' }}/>
          <div style={{
            position: 'absolute', left: 6, top: 6,
            width: 22, height: 22, borderRadius: 6,
            background: color, border: '1.5px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>{lang === 'zh' ? pin.labelZh : pin.labelEn.slice(0,1)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 2, paddingRight: 26 }}>
          <div>
            <div style={{
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
              color, textTransform: 'uppercase', marginBottom: 3,
            }}>
              {t.cat[pin.category]}{' · '}{pin.district[lang]}
            </div>
            <div style={{
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 16, fontWeight: 800, color: '#1A1A1A',
              letterSpacing: -0.4, lineHeight: 1.15,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{pin.title[lang]}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px 3px 6px', borderRadius: 100, background: '#F4EDDF',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#6B5335',
            }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: MAP_PALETTE.red }}/>
              {t.km(pin.dist)}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 100,
              background: '#1A1A1A', color: '#fff',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
            }}>
              <MapIcon.Metro c="#fff"/>
              {pin.stops === 1 ? t.stopsOne : t.stops(pin.stops)}
            </span>
            <span style={{
              padding: '3px 9px', borderRadius: 100,
              background: isFree ? MAP_PALETTE.jade : '#E8B04B',
              color: '#fff',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 11, fontWeight: 800, letterSpacing: 0.1,
            }}>{lang === 'zh' ? pin.priceZh : pin.price}</span>
          </div>
        </div>
        <button onClick={onClose} style={{
          position: 'absolute', top: 0, right: 0,
          width: 24, height: 24, borderRadius: '50%',
          background: '#F4EDDF', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><MapIcon.X c="#8A6F4A"/></button>
      </div>
      <button style={{
        marginTop: 12, width: '100%', height: 44,
        borderRadius: 14, border: 'none', cursor: 'pointer',
        background: '#1A1A1A', color: '#fff',
        fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
        fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>{t.details}<MapIcon.Chevron c="#fff"/></button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Layers popover + Recenter FAB (right-side stack)
// ─────────────────────────────────────────────
function SideStack({ hasPeek, needsRecenter, onRecenter, mapStyle, setMapStyle, lang }) {
  const [open, setOpen] = React.useState(false);
  const t = TEXT[lang];
  return (
    <div style={{
      position: 'absolute', right: 14, bottom: hasPeek ? 296 : 110,
      zIndex: 28, transition: 'bottom 0.3s ease',
      display: 'flex', flexDirection: 'column', gap: 10,
      alignItems: 'flex-end',
    }}>
      {/* popover */}
      <div style={{
        position: 'absolute', right: 54, bottom: 60,
        width: 168, padding: 8, borderRadius: 16,
        background: 'rgba(255,253,248,0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(26,15,10,0.06)',
        boxShadow: '0 20px 50px rgba(26,15,10,0.2)',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
        opacity: open ? 1 : 0,
        transformOrigin: 'bottom right',
        transition: 'all 0.22s cubic-bezier(.22,1,.36,1)',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 10, fontWeight: 800, letterSpacing: 1.4,
          color: '#8A6F4A', textTransform: 'uppercase',
          padding: '6px 10px 4px',
        }}>{t.layers}</div>
        {[
          { k: 'standard', l: t.standard },
          { k: 'minimal',  l: t.minimal },
          { k: 'heatmap',  l: t.heatmap },
        ].map(opt => (
          <button key={opt.k} onClick={() => { setMapStyle(opt.k); setOpen(false); }}
            style={{
              width: '100%', height: 36, padding: '0 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: mapStyle === opt.k ? 'rgba(217,79,48,0.08)' : 'transparent',
              color: mapStyle === opt.k ? MAP_PALETTE.red : '#1A1A1A',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
              marginBottom: 2,
            }}>
            <span>{opt.l}</span>
            {mapStyle === opt.k && <MapIcon.Check c={MAP_PALETTE.red}/>}
          </button>
        ))}
      </div>

      <button onClick={() => setOpen(o => !o)} style={{
        width: 44, height: 44, borderRadius: 14,
        background: open ? '#1A1A1A' : '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 8px 22px rgba(26,15,10,0.14), 0 1px 2px rgba(26,15,10,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        <MapIcon.Layers c={open ? '#fff' : '#1A1A1A'}/>
      </button>
      <button onClick={onRecenter} style={{
        width: 52, height: 52, borderRadius: '50%',
        background: MAP_PALETTE.red, border: 'none', cursor: 'pointer',
        boxShadow: `0 8px 22px rgba(217,79,48,0.45), 0 1px 2px rgba(26,15,10,0.1)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        animation: needsRecenter ? 'recenterPulse 1.4s ease-in-out infinite' : 'none',
      }}>
        <MapIcon.Locate c="#fff"/>
        {needsRecenter && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${MAP_PALETTE.red}`,
            animation: 'recenterRing 1.4s ease-out infinite',
          }}/>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Filter sheet
// ─────────────────────────────────────────────
function FilterSheet({ open, lang, value, onChange, onApply, onClose, onReset }) {
  const t = TEXT[lang];
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 40,
        background: open ? 'rgba(26,15,10,0.45)' : 'transparent',
        opacity: open ? 1 : 0, transition: 'opacity 0.25s',
        pointerEvents: open ? 'auto' : 'none',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(.22,1,.36,1)',
        background: 'rgba(255,253,248,0.92)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '10px 18px 22px',
        boxShadow: '0 -24px 60px rgba(26,15,10,0.24)',
        border: '1px solid rgba(255,255,255,0.6)',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(26,15,10,0.2)', margin: '6px auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{
            margin: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#1A1A1A',
          }}>{t.filters}</h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(26,15,10,0.08)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><MapIcon.X c="#1A1A1A" s={14}/></button>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={filterLabelStyle}>
            <span>{t.distance}</span>
            <span style={{ color: MAP_PALETTE.red, fontWeight: 800 }}>{t.km(value.distance)}</span>
          </div>
          <input type="range" min="0.5" max="5" step="0.1" value={value.distance}
            onChange={e => onChange({ ...value, distance: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: MAP_PALETTE.red }}/>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 2,
            fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 600, color: '#8A6F4A',
          }}><span>0 km</span><span>5 km</span></div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={filterLabelStyle}><span>{t.priceLabel}</span></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['free','$','$$','$$$'].map(p => {
              const active = value.prices.includes(p);
              const label = p === 'free' ? t.priceFree : p;
              return (
                <button key={p} onClick={() => {
                  const next = active ? value.prices.filter(x => x !== p) : [...value.prices, p];
                  onChange({ ...value, prices: next });
                }} style={{
                  flex: 1, height: 38, borderRadius: 12,
                  background: active ? '#1A1A1A' : 'rgba(26,15,10,0.05)',
                  color: active ? '#fff' : '#1A1A1A',
                  border: '1px solid ' + (active ? '#1A1A1A' : 'rgba(26,15,10,0.08)'),
                  cursor: 'pointer',
                  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                  fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                  transition: 'all 0.2s',
                }}>{label}</button>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={filterLabelStyle}><span>{t.time}</span></div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['now',t.tNow],['today',t.tToday],['weekend',t.tWeekend]].map(([k,l]) => {
              const active = value.time === k;
              return (
                <button key={k} onClick={() => onChange({ ...value, time: k })} style={{
                  flex: 1, height: 38, borderRadius: 12,
                  background: active ? MAP_PALETTE.red : 'rgba(26,15,10,0.05)',
                  color: active ? '#fff' : '#1A1A1A',
                  border: '1px solid ' + (active ? MAP_PALETTE.red : 'rgba(26,15,10,0.08)'),
                  cursor: 'pointer',
                  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                  fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                  transition: 'all 0.2s',
                }}>{l}</button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onReset} style={{
            flex: '0 0 35%', height: 48, borderRadius: 14,
            background: 'rgba(26,15,10,0.06)', border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 14, fontWeight: 700, color: '#1A1A1A',
          }}>{t.reset}</button>
          <button onClick={onApply} style={{
            flex: 1, height: 48, borderRadius: 14,
            background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 14, fontWeight: 800, letterSpacing: -0.1,
          }}>{t.apply}</button>
        </div>
      </div>
    </>
  );
}
const filterLabelStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
  fontSize: 13, fontWeight: 700, color: '#1A1A1A',
  marginBottom: 8, letterSpacing: -0.1,
};

// Tab bar + lang switch
function MapTabBar({ lang }) {
  const t = TEXT[lang];
  const tabs = [
    { k: 'home', l: t.home,     I: MapIcon.Home },
    { k: 'disc', l: t.discover, I: MapIcon.Sparkle },
    { k: 'map',  l: t.map,      I: MapIcon.MapPinTab, active: true },
    { k: 'plan', l: t.plan,     I: MapIcon.Cal },
    { k: 'me',   l: t.profile,  I: MapIcon.User },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25, height: 84,
      background: '#fff', borderTop: '1px solid rgba(26,15,10,0.06)',
      paddingTop: 10, display: 'flex', justifyContent: 'space-around',
      boxShadow: '0 -8px 24px rgba(26,15,10,0.04)',
    }}>
      {tabs.map(tab => {
        const color = tab.active ? MAP_PALETTE.red : '#8A6F4A';
        return (
          <button key={tab.k} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: 0, minWidth: 48,
          }}>
            <tab.I a={tab.active} c={color}/>
            <span style={{
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 10, fontWeight: tab.active ? 800 : 600,
              color, letterSpacing: 0.1,
            }}>{tab.l}</span>
          </button>
        );
      })}
    </div>
  );
}
function LangSwitch({ lang, setLang }) {
  return (
    <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
      style={{
        position: 'absolute', right: 14, top: 160, zIndex: 18,
        width: 40, height: 28, borderRadius: 100, background: '#fff',
        boxShadow: '0 4px 12px rgba(26,15,10,0.1)',
        border: 'none', cursor: 'pointer',
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontSize: 11, fontWeight: 800, color: '#1A1A1A', letterSpacing: 0.4,
      }}>{lang === 'en' ? 'EN' : '中'}</button>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
const DEFAULT_FILTERS = { distance: 5, prices: ['free','$','$$','$$$'], time: 'now' };

function MapScreen() {
  const [lang, setLang] = React.useState('en');
  const [selectedId, setSelectedId] = React.useState('raohe');
  const [cat, setCat] = React.useState('all');
  const [freeOnly, setFreeOnly] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = React.useState(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [clusterExpanded, setClusterExpanded] = React.useState(false);
  const [mapStyle, setMapStyle] = React.useState('standard');

  // pan state
  const [pan, setPan] = React.useState({ x: 0, y: 0, animated: false });
  const panRef = React.useRef(pan); panRef.current = pan;
  const dragRef = React.useRef(null);
  const surfaceRef = React.useRef(null);
  const PAN_LIMIT = 140;
  const DRAG_THRESHOLD = 5;

  // Pan on the surface. Pin clicks are handled locally by <PinGroup> — so
  // surface drag and pin taps never conflict.
  const onSurfacePointerDown = (e) => {
    // ignore if pointerdown starts on a pin
    if (e.target.closest && e.target.closest('[data-pin]')) return;
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX: panRef.current.x, origY: panRef.current.y,
      pointerId: e.pointerId, moved: false,
    };
    try { surfaceRef.current.setPointerCapture(e.pointerId); } catch(_){}
  };
  const onSurfacePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;
    const nx = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, dragRef.current.origX + dx));
    const ny = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, dragRef.current.origY + dy));
    setPan({ x: nx, y: ny, animated: false });
  };
  const endDrag = (e) => {
    if (!dragRef.current) return;
    try { surfaceRef.current.releasePointerCapture(dragRef.current.pointerId); } catch(_){}
    dragRef.current = null;
  };

  const needsRecenter = Math.abs(pan.x) + Math.abs(pan.y) > 8;
  const recenter = () => setPan({ x: 0, y: 0, animated: true });
  const clusterTap = () => setClusterExpanded(true);

  // Visible pin computation
  const visiblePins = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return BASE_PINS.filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (freeOnly && !p.free) return false;
      if (q) {
        const hay = (p.title.en + ' ' + p.title.zh + ' ' + p.labelEn + ' ' +
                     p.district.en + ' ' + p.district.zh).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (p.dist > filters.distance) return false;
      if (!filters.prices.includes(p.priceTier)) return false;
      return true;
    });
  }, [cat, freeOnly, search, filters]);

  const openSheet = () => { setDraftFilters(filters); setSheetOpen(true); };
  const applySheet = () => { setFilters(draftFilters); setSheetOpen(false); };
  const resetSheet = () => setDraftFilters(DEFAULT_FILTERS);

  const t = TEXT[lang];
  const selected = visiblePins.find(p => p.id === selectedId);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: MAP_PALETTE.rice, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 15,
        background: 'linear-gradient(180deg, rgba(250,247,242,0.85) 0%, rgba(250,247,242,0) 100%)',
        pointerEvents: 'none',
      }}/>

      <div
        ref={surfaceRef}
        onPointerDown={onSurfacePointerDown}
        onPointerMove={onSurfacePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 84,
          cursor: 'grab', touchAction: 'none',
        }}>
        <TaipeiMap
          lang={lang} pan={pan}
          visiblePins={visiblePins}
          selectedId={selected ? selectedId : null}
          onPinTap={(id) => setSelectedId(id)}
          clusterExpanded={clusterExpanded}
          onClusterTap={clusterTap}
          mapStyle={mapStyle}
        />
      </div>

      <div style={{
        position: 'absolute', left: 16, top: 156, zIndex: 18,
        fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
        fontSize: 11, fontWeight: 800, letterSpacing: lang==='zh'?1.2:1.6,
        color: '#8A6F4A', textTransform: lang==='zh'?'none':'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: MAP_PALETTE.red, boxShadow: `0 0 0 3px rgba(217,79,48,0.2)`,
        }}/>
        {t.nearbyNow}
        <span style={{
          marginLeft: 8, color: '#1A1A1A', fontSize: 12, letterSpacing: -0.1,
          fontWeight: 700, textTransform: 'none',
        }}>{t.events(visiblePins.length)}</span>
      </div>

      {visiblePins.length === 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: '45%',
          transform: 'translate(-50%, -50%)', zIndex: 22,
          padding: '10px 16px', borderRadius: 14,
          background: 'rgba(26,15,10,0.85)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          color: '#fff',
          fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
          fontSize: 13, fontWeight: 600,
        }}>{t.noMatch}</div>
      )}

      <MapTopBar lang={lang} search={search} setSearch={setSearch} onFilter={openSheet}/>
      <LangSwitch lang={lang} setLang={setLang}/>
      <CatChips lang={lang} active={cat} setActive={setCat}
                freeOnly={freeOnly} setFreeOnly={setFreeOnly}/>

      <SideStack hasPeek={!!selected} needsRecenter={needsRecenter}
        onRecenter={recenter} mapStyle={mapStyle} setMapStyle={setMapStyle}
        lang={lang}/>

      <PeekCard pin={selected} lang={lang} onClose={() => setSelectedId(null)}/>

      <MapTabBar lang={lang}/>

      <FilterSheet open={sheetOpen} lang={lang}
        value={draftFilters} onChange={setDraftFilters}
        onApply={applySheet} onReset={resetSheet} onClose={() => setSheetOpen(false)}/>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        @keyframes peekIn { 0% { opacity: 0; transform: translateY(28px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes recenterPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 22px rgba(217,79,48,0.45); }
          50% { transform: scale(1.06); box-shadow: 0 10px 28px rgba(217,79,48,0.6); }
        }
        @keyframes recenterRing {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { MapScreen });
