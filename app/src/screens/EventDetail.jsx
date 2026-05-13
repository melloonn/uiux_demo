import { useContext, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { EVENTS, VIBE_FALLBACK, PIN_COLOR } from '../data/events.js';
import { FRIENDS } from '../data/mockFriends.js';
import { LogisticsCapsule } from '../components/ui/LogisticsCapsule.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { ShareSheet } from '../components/ui/ShareSheet.jsx';
import { PlanPicker } from '../components/ui/PlanPicker.jsx';
import { Share2, ChevronLeft, MapPin, Users, Bookmark, UserPlus, X, Sparkles, Camera, UtensilsCrossed, CalendarDays } from 'lucide-react';

// CTA bar height — scroll content stops here so it's never hidden under the bar
const CTA_H = 82;

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, saved, planned, toggleSave, togglePlan, addToPlanScheduled, planSchedule } = useContext(AppContext);
  const [shareOpen, setShareOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 1600); }, []);

  const event = EVENTS.find(ev => ev.id === id);
  if (!event) return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, color: '#8A6F4A' }}>Event not found</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 12, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700 }}>Go back</button>
    </div>
  );

  const t = (obj) => (typeof obj === 'object' ? obj[lang] ?? obj.en : obj);
  const color = PIN_COLOR[event.category] ?? '#D94F30';
  const isSaved = saved.has(event.id);
  const isPlanned = planned.has(event.id);
  const tags = lang === 'zh' ? event.tagsZh : event.tags;

  return (
    // Outer — non-scrolling, fills IOSFrame
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>

      {/* Scrollable content — stops above the CTA bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: CTA_H,
        overflowY: 'auto',
      }}>
        {/* Hero */}
        <div style={{
          position: 'relative', height: 320,
          background: VIBE_FALLBACK[event.vibe] ?? VIBE_FALLBACK.warm,
          backgroundImage: `url(${event.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)' }}/>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute', top: 58, left: 16,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={20} color="#fff" />
          </button>

          {/* Share icon */}
          <button
            onClick={() => setShareOpen(true)}
            style={{
              position: 'absolute', top: 58, right: 16,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} color="#fff" />
          </button>

          {/* Category badge */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            padding: '5px 12px', borderRadius: 9999,
            background: color,
            fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, color: '#fff',
            textTransform: 'uppercase', letterSpacing: 0.8,
          }}>
            {event.category}
          </div>
        </div>

        {/* Body content */}
        <div style={{ padding: '24px 20px 20px' }}>
          <h1 style={{
            margin: '0 0 6px',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 26, fontWeight: 900, letterSpacing: -0.6, lineHeight: 1.1, color: '#1A1A1A',
          }}>
            {t(event.title)}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 14, fontWeight: 500, color: '#8A6F4A' }}>
              <MapPin size={14} color="#D94F30" />
              {t(event.subtitle)}
            </div>
            {/* Quick Google Maps link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lang === 'zh' ? event.location.zh : event.location.en)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 9999, background: 'rgba(66,133,244,0.1)', textDecoration: 'none' }}
            >
              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#4285F4' }}>
                {lang === 'zh' ? '📍 導航' : '📍 Maps'}
              </span>
            </a>
          </div>

          <div style={{ marginBottom: 16 }}>
            <LogisticsCapsule
              dist={event.dist} stops={event.stops}
              price={event.price} priceZh={event.priceZh}
              free={event.free} lang={lang}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {tags.map(tag => <Chip key={tag} label={tag} lightBg />)}
          </div>

          <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', marginBottom: 20 }} />

          <p style={{
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 15, fontWeight: 500, color: '#3A2E22',
            lineHeight: 1.65, margin: '0 0 24px', letterSpacing: -0.1,
          }}>
            {t(event.description)}
          </p>

          {/* AI Highlights */}
          {event.aiHighlights && event.aiHighlights.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={14} color="#E8B04B" />
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 800, color: '#8A5F00', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {lang === 'zh' ? 'AI 小提示' : 'AI Highlights'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {event.aiHighlights.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(232,176,75,0.08)', border: '1px solid rgba(232,176,75,0.18)' }}>
                    <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>💡</span>
                    <span style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, fontWeight: 500, color: '#6B4C00', lineHeight: 1.4 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          {event.photos && event.photos.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Camera size={14} color="#8A6F4A" />
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 800, color: '#8A6F4A', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {lang === 'zh' ? '現場照片' : 'Photos'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -20px', padding: '0 20px' }}>
                {[event.img, ...event.photos].map((url, i) => (
                  <div key={i} style={{ width: 160, height: 110, borderRadius: 12, flexShrink: 0, backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 2px 8px rgba(26,15,10,0.12)' }} />
                ))}
              </div>
            </div>
          )}

          {/* Vendors / Must-try (night markets) */}
          {event.vendors && event.vendors.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <UtensilsCrossed size={14} color="#D94F30" />
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 800, color: '#D94F30', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {lang === 'zh' ? '必吃推薦' : 'Must-Try Stalls'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {event.vendors.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(26,15,10,0.06)' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{v.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lang === 'zh' ? v.name.zh : v.name.en}
                      </div>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 11, color: '#8A6F4A', marginTop: 2 }}>
                        {lang === 'zh' ? `必吃：${v.mustTry.zh}` : `Order: ${v.mustTry.en}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0',
            borderTop: '1px solid rgba(26,15,10,0.08)',
            borderBottom: '1px solid rgba(26,15,10,0.08)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8B04B, #D94F30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 800, color: '#fff',
            }}>{event.host.charAt(0)}</div>
            <div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#8A6F4A', letterSpacing: 0.8, textTransform: 'uppercase' }}>Hosted by</div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{event.host}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA bar — position:absolute within IOSFrame, never fixed to viewport */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
        height: CTA_H,
        padding: '12px 20px 20px',
        background: 'rgba(250,247,242,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(26,15,10,0.08)',
        display: 'flex', gap: 10,
      }}>
        {/* Bookmark/Save */}
        <button
          onClick={() => toggleSave(event.id)}
          title={isSaved ? (lang === 'zh' ? '已收藏' : 'Saved') : (lang === 'zh' ? '收藏' : 'Save')}
          style={{
            width: 50, height: 50, borderRadius: 14,
            background: isSaved ? 'rgba(217,79,48,0.1)' : 'rgba(26,15,10,0.06)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Bookmark size={22} fill={isSaved ? '#D94F30' : 'none'} color={isSaved ? '#D94F30' : '#1A1A1A'} />
        </button>
        {/* Invite friends */}
        <button
          onClick={() => setInviteOpen(true)}
          title={lang === 'zh' ? '邀請朋友' : 'Invite friends'}
          style={{
            width: 50, height: 50, borderRadius: 14,
            background: 'rgba(26,15,10,0.06)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Users size={20} color="#1A1A1A" />
        </button>
        <button
          onClick={() => setPlanPickerOpen(true)}
          style={{
            flex: 1, height: 50, borderRadius: 14,
            background: isPlanned ? '#E8B04B' : '#1A1A1A',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 14, fontWeight: 800, letterSpacing: -0.2,
          }}
        >
          {isPlanned
            ? (lang === 'zh' ? '已加入計畫 · 修改時間' : 'In Plan · Edit Time')
            : (lang === 'zh' ? '加入計畫' : 'Add to Plan')}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, background: 'rgba(26,15,10,0.88)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700,
          padding: '10px 20px', borderRadius: 12, whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>{toast}</div>
      )}

      {/* Share sheet */}
      {shareOpen && (
        <ShareSheet
          event={event}
          lang={lang}
          onClose={() => setShareOpen(false)}
          onToast={showToast}
        />
      )}

      {/* Plan date+time picker sheet */}
      {planPickerOpen && (
        <PlanPicker
          lang={lang}
          initialDate={planSchedule.get(event.id)?.dateKey ?? 'today'}
          initialTime={planSchedule.get(event.id)?.timeSlot ?? 'afternoon'}
          onConfirm={({ dateKey, timeSlot }) => {
            addToPlanScheduled(event.id, { dateKey, timeSlot });
            setPlanPickerOpen(false);
            showToast(lang === 'zh' ? '已加入計畫 ✓' : 'Added to plan ✓');
          }}
          onClose={() => setPlanPickerOpen(false)}
          confirmLabel={isPlanned
            ? (lang === 'zh' ? '更新時間' : 'Update Schedule')
            : undefined}
        />
      )}

      {/* Invite friends sheet */}
      {inviteOpen && (
        <>
          <div onClick={() => setInviteOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)' }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: 'rgba(255,253,248,0.97)', backdropFilter: 'blur(24px)',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '10px 0 32px',
            boxShadow: '0 -16px 40px rgba(26,15,10,0.18)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,15,10,0.18)', margin: '6px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px' }}>
              <div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, fontWeight: 800, color: '#1A1A1A', letterSpacing: -0.3 }}>
                  {lang === 'zh' ? '邀請朋友一起' : 'Invite friends'}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', marginTop: 2 }}>
                  {lang === 'zh' ? '讓朋友加入收藏或計畫' : 'Let them save or plan this event too'}
                </div>
              </div>
              <button onClick={() => setInviteOpen(false)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#1A1A1A" />
              </button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', scrollbarWidth: 'none' }}>
              {FRIENDS.map(f => (
                <button key={f.id} onClick={() => {
                  showToast(lang === 'zh' ? `已邀請 ${f.name}` : `Invited ${f.name}`);
                  setInviteOpen(false);
                }} style={{ width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    {f.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{f.name}</div>
                    <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', marginTop: 1 }}>{f.relationship}</div>
                  </div>
                  <div style={{ padding: '5px 12px', borderRadius: 9999, background: 'rgba(217,79,48,0.1)', fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700, color: '#D94F30', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <UserPlus size={12} color="#D94F30" />
                    {lang === 'zh' ? '邀請' : 'Invite'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
