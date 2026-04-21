// CultureFlow — Vertical swipeable feed
// Reels-style vertical snap feed with full-bleed hero + right action rail
// NOTE: hero images are Unsplash placeholders evoking Taiwan — swap with real event photography

const PALETTE = {
  red: '#D94F30',
  gold: '#E8B04B',
  ink: '#1A1A1A',
  rice: '#FAF7F2',
  jade: '#7FA491',
};

// ─────────────────────────────────────────────
// Event data — six events, bilingual fields
// ─────────────────────────────────────────────
const EVENTS = [
  {
    id: 'pingxi',
    img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=900&q=80&auto=format&fit=crop',
    title: { en: 'Pingxi Sky Lantern Festival', zh: '平溪天燈節' },
    subtitle: { en: 'Tonight · Pingxi District', zh: '今晚 · 平溪區' },
    tags: ['#FreeEntry', '#MRTAccessible', '#TrendingNow'],
    tagsZh: ['#免費入場', '#捷運可達', '#熱門'],
    saves: '12.4k',
    vibe: 'warm',
    host: 'New Taipei Tourism',
  },
  {
    id: 'raohe',
    img: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?w=900&q=80&auto=format&fit=crop',
    title: { en: 'Raohe Street Night Market', zh: '饒河街夜市' },
    subtitle: { en: 'Every night · Songshan', zh: '每晚 · 松山區' },
    tags: ['#StreetFood', '#OpenLate', '#LocalFavourite'],
    tagsZh: ['#街頭美食', '#深夜營業', '#在地人最愛'],
    saves: '8.2k',
    vibe: 'neon',
    host: 'Songshan Ciyou Temple',
  },
  {
    id: 'revolver',
    img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&q=80&auto=format&fit=crop',
    title: { en: 'Sunset Rollercoaster · Live', zh: '落日飛車 · 現場' },
    subtitle: { en: 'Sat 26 Apr · Revolver, Da\u2019an', zh: '4/26 週六 · Revolver 大安' },
    tags: ['#IndieLive', '#LateNight', '#Under500NT'],
    tagsZh: ['#獨立現場', '#深夜場', '#500元以下'],
    saves: '3.1k',
    vibe: 'night',
    host: 'Revolver Taipei',
  },
  {
    id: 'longshan',
    img: 'https://images.unsplash.com/photo-1542897644-e04428948020?w=900&q=80&auto=format&fit=crop',
    title: { en: 'Longshan Temple Lantern Night', zh: '龍山寺燈會夜' },
    subtitle: { en: 'Fri–Sun · Wanhua', zh: '週五至週日 · 萬華' },
    tags: ['#FreeEntry', '#Heritage', '#FamilyFriendly'],
    tagsZh: ['#免費入場', '#古蹟', '#親子友善'],
    saves: '21.7k',
    vibe: 'amber',
    host: 'Longshan Temple',
  },
  {
    id: 'dadaocheng',
    img: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=900&q=80&auto=format&fit=crop',
    title: { en: 'Dadaocheng Summer Riverside', zh: '大稻埕河岸夏夜' },
    subtitle: { en: 'Sat 3 May · Tamsui River', zh: '5/3 週六 · 淡水河畔' },
    tags: ['#Fireworks', '#MRTAccessible', '#FreeEntry'],
    tagsZh: ['#煙火', '#捷運可達', '#免費入場'],
    saves: '15.8k',
    vibe: 'dusk',
    host: 'Taipei City Office',
  },
  {
    id: 'huashan',
    img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80&auto=format&fit=crop',
    title: { en: 'Huashan 1914 Craft Market', zh: '華山1914文創市集' },
    subtitle: { en: 'This weekend · Zhongzheng', zh: '本週末 · 中正區' },
    tags: ['#Under200NT', '#Creative', '#RainOrShine'],
    tagsZh: ['#200元以下', '#文創', '#風雨無阻'],
    saves: '6.4k',
    vibe: 'warm',
    host: 'Huashan 1914',
  },
];

// ─────────────────────────────────────────────
// Icons — stroked, 24px, white
// ─────────────────────────────────────────────
const Icon = {
  Heart: ({ filled, color = '#fff' }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Calendar: ({ color = '#fff' }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M3 10h18M8 2v4M16 2v4" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  ),
  Map: ({ color = '#fff' }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3L3 5.5v15.5L9 18.5m0-15.5v15.5m0-15.5l6 2.5m-6 13l6-2.5m0-13L21 3v15.5L15 21m0-18v18" />
    </svg>
  ),
  Share: ({ color = '#fff' }) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
      <path d="M16 6l-4-4-4 4M12 2v14" />
    </svg>
  ),
  Chevron: ({ color = '#fff' }) => (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8l6-6 6 6" />
    </svg>
  ),
  Home: ({ active, color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V10z" />
    </svg>
  ),
  Search: ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  ),
  Plan: ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 2.5v4M16 2.5v4" />
    </svg>
  ),
  Profile: ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
// Logo mark — small lotus/flame glyph + wordmark
// ─────────────────────────────────────────────
function Logo({ color = '#fff' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3.5c2 3.5 5.5 5 5.5 9.2 0 3.2-2.5 5.8-5.5 5.8s-5.5-2.6-5.5-5.8C6.5 8.5 10 7 12 3.5z" fill={color} opacity="0.95"/>
        <path d="M12 8c.9 1.8 2.6 2.7 2.6 4.8 0 1.7-1.2 3-2.6 3s-2.6-1.3-2.6-3C9.4 10.7 11.1 9.8 12 8z" fill={PALETTE.red} opacity="0.9"/>
      </svg>
      <span style={{
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontWeight: 800, fontSize: 17, color,
        letterSpacing: -0.3,
      }}>CultureFlow</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Decorative image placeholder — painterly gradient
// when Unsplash is blocked, these paint an evocative fallback
// ─────────────────────────────────────────────
const VIBE_FALLBACK = {
  warm: 'radial-gradient(120% 80% at 70% 20%, #F4A65C 0%, #D94F30 45%, #4A1810 100%)',
  neon: 'radial-gradient(90% 90% at 20% 80%, #E8B04B 0%, #D94F30 35%, #6B1B1A 75%, #120607 100%)',
  night: 'radial-gradient(80% 60% at 60% 30%, #3D2B5F 0%, #1A1030 60%, #0A0614 100%)',
  amber: 'radial-gradient(110% 70% at 30% 20%, #FFD27A 0%, #E8B04B 35%, #A6552A 75%, #2B0F06 100%)',
  dusk: 'linear-gradient(180deg, #F6A26B 0%, #D94F30 45%, #4C1A2D 100%)',
};

function Hero({ ev, active }) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: VIBE_FALLBACK[ev.vibe] || VIBE_FALLBACK.warm,
      overflow: 'hidden',
    }}>
      {!failed && (
        <img
          src={ev.img}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
            transform: active ? 'scale(1.04)' : 'scale(1.0)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '0.6s, 8s',
            transitionTimingFunction: 'ease, ease-out',
          }}
        />
      )}
      {/* grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        opacity: 0.5, mixBlendMode: 'overlay', pointerEvents: 'none',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────
// Action rail button
// ─────────────────────────────────────────────
function ActionBtn({ icon, label, active, onClick, burst }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: '#fff',
      }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        background: 'rgba(0,0,0,0.28)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
        position: 'relative',
        transform: burst ? 'scale(1.18)' : 'scale(1)',
        transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {icon}
        {burst && (
          <span aria-hidden style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: `2px solid ${PALETTE.red}`,
            animation: 'burst 0.55s ease-out forwards',
          }} />
        )}
      </div>
      <span style={{
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontSize: 11, fontWeight: 600,
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        letterSpacing: 0.1,
      }}>{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Tag chip
// ─────────────────────────────────────────────
function TagChip({ label, variant = 'default' }) {
  const isFree = label.toLowerCase().includes('free') || label.includes('免費');
  const isTrending = label.toLowerCase().includes('trending') || label.includes('熱門');
  const tint = isFree
    ? { bg: 'rgba(127,164,145,0.28)', border: 'rgba(127,164,145,0.55)', fg: '#CDE5D6' }
    : isTrending
    ? { bg: 'rgba(232,176,75,0.28)', border: 'rgba(232,176,75,0.55)', fg: '#FFDFA0' }
    : { bg: 'rgba(255,255,255,0.14)', border: 'rgba(255,255,255,0.28)', fg: '#fff' };
  return (
    <div style={{
      padding: '6px 11px', borderRadius: 100,
      background: tint.bg, border: `1px solid ${tint.border}`,
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      fontFamily: '"Plus Jakarta Sans", system-ui',
      fontSize: 12, fontWeight: 600, color: tint.fg,
      letterSpacing: -0.1, whiteSpace: 'nowrap',
    }}>{label}</div>
  );
}

// ─────────────────────────────────────────────
// Single feed card
// ─────────────────────────────────────────────
function FeedCard({ ev, lang, active, idx, total, tweaks }) {
  const [saved, setSaved] = React.useState(false);
  const [planned, setPlanned] = React.useState(false);
  const [saveBurst, setSaveBurst] = React.useState(false);
  const [planBurst, setPlanBurst] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const handleSave = () => {
    setSaved(s => !s);
    setSaveBurst(true);
    setTimeout(() => setSaveBurst(false), 600);
    setToast(saved ? null : (lang === 'zh' ? '已收藏' : 'Saved'));
    setTimeout(() => setToast(null), 1400);
  };
  const handlePlan = () => {
    setPlanned(p => !p);
    setPlanBurst(true);
    setTimeout(() => setPlanBurst(false), 600);
    setToast(planned ? null : (lang === 'zh' ? '已加入計畫' : 'Added to plan'));
    setTimeout(() => setToast(null), 1400);
  };
  const handleMap = () => {
    setToast(lang === 'zh' ? '開啟地圖' : 'Opening map');
    setTimeout(() => setToast(null), 1200);
  };
  const handleShare = () => {
    setToast(lang === 'zh' ? '連結已複製' : 'Link copied');
    setTimeout(() => setToast(null), 1200);
  };

  const tags = lang === 'zh' ? ev.tagsZh : ev.tags;
  const scrimIntensity = tweaks.scrim; // 0..1
  const titleWeight = tweaks.bold ? 900 : 800;

  return (
    <div style={{
      scrollSnapAlign: 'start',
      position: 'relative', width: '100%', height: '100%',
      flexShrink: 0,
      overflow: 'hidden',
      background: '#000',
    }}>
      <Hero ev={ev} active={active} />

      {/* top scrim — for logo legibility */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 160,
        background: `linear-gradient(180deg, rgba(0,0,0,${0.55 * scrimIntensity}) 0%, rgba(0,0,0,0) 100%)`,
        pointerEvents: 'none',
      }}/>
      {/* bottom scrim — heavier */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%',
        background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,5,3,${0.45 * scrimIntensity}) 45%, rgba(10,5,3,${0.88 * scrimIntensity}) 100%)`,
        pointerEvents: 'none',
      }}/>

      {/* LEFT content rail */}
      <div style={{
        position: 'absolute', left: 20, right: 92, bottom: 108,
        color: '#fff',
      }}>
        {/* host chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          marginBottom: 14,
          padding: '4px 12px 4px 4px', borderRadius: 100,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          whiteSpace: 'nowrap', maxWidth: '100%',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: `linear-gradient(135deg, ${PALETTE.gold}, ${PALETTE.red})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 800, color: '#fff',
          }}>{ev.host.charAt(0)}</div>
          <span style={{
            fontFamily: '"Plus Jakarta Sans"', fontSize: 11.5, fontWeight: 600,
            letterSpacing: -0.1, textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
          }}>{ev.host}</span>
        </div>

        {/* title */}
        <h2 style={{
          margin: 0, marginBottom: 6,
          fontFamily: '"Plus Jakarta Sans", system-ui',
          fontSize: 30, fontWeight: titleWeight,
          lineHeight: 1.05, letterSpacing: -0.9,
          textWrap: 'balance',
          textShadow: '0 2px 14px rgba(0,0,0,0.45)',
        }}>{lang === 'zh' ? ev.title.zh : ev.title.en}</h2>

        {/* subtitle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          fontFamily: '"Plus Jakarta Sans", system-ui',
          fontSize: 14, fontWeight: 500,
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: PALETTE.gold, boxShadow: `0 0 8px ${PALETTE.gold}`,
          }}/>
          {lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en}
        </div>

        {/* tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tags.map(t => <TagChip key={t} label={t} />)}
        </div>
      </div>

      {/* RIGHT action rail */}
      <div style={{
        position: 'absolute', right: 14, bottom: 120,
        display: 'flex', flexDirection: 'column', gap: 18,
        alignItems: 'center',
      }}>
        <ActionBtn
          icon={<Icon.Heart filled={saved} color={saved ? PALETTE.red : '#fff'} />}
          label={saved ? bumpSaves(ev.saves) : ev.saves}
          active={saved}
          burst={saveBurst}
          onClick={handleSave}
        />
        <ActionBtn
          icon={<Icon.Calendar color={planned ? PALETTE.gold : '#fff'} />}
          label={lang === 'zh' ? '加入計畫' : 'Plan'}
          active={planned}
          burst={planBurst}
          onClick={handlePlan}
        />
        <ActionBtn
          icon={<Icon.Map />}
          label={lang === 'zh' ? '地圖' : 'Map'}
          onClick={handleMap}
        />
        <ActionBtn
          icon={<Icon.Share />}
          label={lang === 'zh' ? '分享' : 'Share'}
          onClick={handleShare}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', top: '42%',
          transform: 'translate(-50%, -50%)',
          padding: '10px 18px', borderRadius: 14,
          background: 'rgba(20,10,8,0.72)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', fontFamily: '"Plus Jakarta Sans"',
          fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
          pointerEvents: 'none',
          animation: 'toastIn 0.3s ease',
        }}>{toast}</div>
      )}

      {/* Swipe-up hint (only on first card) */}
      {idx === 0 && active && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 98,
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 600,
          letterSpacing: 1.2, textTransform: 'uppercase',
          animation: 'bob 1.6s ease-in-out infinite',
          pointerEvents: 'none',
        }}>
          <Icon.Chevron color="rgba(255,255,255,0.7)" />
          <span>{lang === 'zh' ? '向上滑動' : 'Swipe for next'}</span>
        </div>
      )}

      {/* Progress pips (right edge, very subtle) */}
      <div style={{
        position: 'absolute', right: 6, top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: 2, height: i === idx ? 16 : 6,
            borderRadius: 1,
            background: i === idx ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
            transition: 'height 0.3s ease',
          }}/>
        ))}
      </div>
    </div>
  );
}

function bumpSaves(s) {
  // small cosmetic increment: 12.4k -> 12.4k (user tapped)
  // keep static to not lie about counts; show "+1" via toast instead
  return s;
}

// ─────────────────────────────────────────────
// Top bar (logo + lang + filter)
// ─────────────────────────────────────────────
function TopBar({ lang, setLang }) {
  return (
    <div style={{
      position: 'absolute', top: 54, left: 0, right: 0, zIndex: 20,
      padding: '0 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}><Logo color="#fff"/></div>

      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
        {/* For-you / Nearby toggle */}
        <div style={{
          display: 'flex', gap: 2, padding: 3, borderRadius: 100,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <button style={pillBtn(true)}>{lang === 'zh' ? '為你推薦' : 'For You'}</button>
          <button style={pillBtn(false)}>{lang === 'zh' ? '附近' : 'Nearby'}</button>
        </div>

        {/* Language switcher */}
        <button
          onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
          style={{
            width: 44, height: 32, borderRadius: 100,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontFamily: '"Plus Jakarta Sans", system-ui',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
            cursor: 'pointer',
          }}
        >{lang === 'en' ? 'EN' : '中'}</button>
      </div>
    </div>
  );
}

function pillBtn(active) {
  return {
    padding: '6px 12px', borderRadius: 100,
    background: active ? 'rgba(255,255,255,0.95)' : 'transparent',
    color: active ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
    border: 'none',
    fontFamily: '"Plus Jakarta Sans", system-ui',
    fontSize: 12, fontWeight: 700, letterSpacing: -0.1,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

// ─────────────────────────────────────────────
// Bottom tab bar — for navigation context
// ─────────────────────────────────────────────
function TabBar({ lang }) {
  const tabs = [
    { key: 'home', label: lang === 'zh' ? '探索' : 'Feed', icon: Icon.Home, active: true },
    { key: 'search', label: lang === 'zh' ? '搜尋' : 'Search', icon: Icon.Search },
    { key: 'plan', label: lang === 'zh' ? '計畫' : 'Plan', icon: Icon.Plan },
    { key: 'me', label: lang === 'zh' ? '我' : 'Me', icon: Icon.Profile },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 84, zIndex: 25,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
      padding: '10px 20px 0',
      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)',
      pointerEvents: 'none',
    }}>
      {tabs.map(t => (
        <div key={t.key} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          pointerEvents: 'auto', cursor: 'pointer',
          color: t.active ? '#fff' : 'rgba(255,255,255,0.6)',
        }}>
          <t.icon active={t.active} color={t.active ? '#fff' : 'rgba(255,255,255,0.7)'}/>
          <span style={{
            fontFamily: '"Plus Jakarta Sans"',
            fontSize: 10, fontWeight: t.active ? 700 : 500,
            letterSpacing: 0.1,
          }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main feed
// ─────────────────────────────────────────────
function Feed({ tweaks }) {
  const [lang, setLang] = React.useState('en');
  const [activeIdx, setActiveIdx] = React.useState(0);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollTop / el.clientHeight);
      setActiveIdx(i);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#000',
      overflow: 'hidden',
    }}>
      <TopBar lang={lang} setLang={setLang}/>

      <div
        ref={scrollRef}
        style={{
          position: 'absolute', inset: 0,
          overflowY: 'scroll', overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {EVENTS.map((ev, i) => (
          <FeedCard
            key={ev.id}
            ev={ev} lang={lang}
            active={i === activeIdx}
            idx={i} total={EVENTS.length}
            tweaks={tweaks}
          />
        ))}
      </div>

      <TabBar lang={lang}/>

      {/* hide scrollbar */}
      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes burst {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes bob {
          0%, 100% { transform: translate(-50%, 0); opacity: 0.7; }
          50% { transform: translate(-50%, -6px); opacity: 1; }
        }
        @keyframes toastIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { Feed, PALETTE });
