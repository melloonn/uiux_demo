import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { PERSONAS } from '../data/personas.js';
import { EVENTS, PIN_COLOR, CATEGORY_LABEL, VIBE_FALLBACK } from '../data/events.js';
import { FRIENDS, FOLLOWING } from '../data/mockFriends.js';
import { ChevronRight, Settings } from 'lucide-react';

export default function Profile() {
  const { lang, setLang, saved, planned } = useContext(AppContext);
  const navigate = useNavigate();
  const persona = PERSONAS.yichen;
  const venueCount = FOLLOWING.filter(f => f.type === 'venue').length;
  const hostCount  = FOLLOWING.filter(f => f.type === 'host').length;

  const savedEvents = EVENTS.filter(ev => saved.has(ev.id));

  const t = (en, zh) => lang === 'zh' ? zh : en;

  const SmallEventCard = ({ ev }) => {
    const color = PIN_COLOR[ev.category] ?? '#D94F30';
    const label = CATEGORY_LABEL[ev.category]?.[lang] ?? ev.category;
    return (
      <div
        onClick={() => navigate(`/event/${ev.id}`)}
        style={{
          flexShrink: 0, width: 140, borderRadius: 16, overflow: 'hidden',
          cursor: 'pointer', background: '#fff',
          boxShadow: '0 4px 14px rgba(26,15,10,0.08)',
        }}
      >
        <div style={{
          height: 84, position: 'relative',
          background: VIBE_FALLBACK[ev.vibe] ?? VIBE_FALLBACK.warm,
          backgroundImage: `url(${ev.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
          <div style={{
            position: 'absolute', bottom: 6, left: 8,
            padding: '2px 7px', borderRadius: 9999,
            background: color,
            fontFamily: '"Plus Jakarta Sans"', fontSize: 9, fontWeight: 800, color: '#fff',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>{label}</div>
        </div>
        <div style={{ padding: '8px 10px' }}>
          <div style={{
            fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
            fontSize: 12, fontWeight: 800, color: '#1A1A1A', letterSpacing: -0.2,
            lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lang === 'zh' ? ev.title.zh : ev.title.en}
          </div>
          <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 500, color: '#8A6F4A', marginTop: 2 }}>
            {lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 58, paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <h1 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 26, fontWeight: 900, letterSpacing: -0.6, color: '#1A1A1A' }}>
          {t('My Hub', '我的中心')}
        </h1>
        <button
          onClick={() => navigate('/settings')}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Settings size={17} color="#1A1A1A" />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>
        <div style={{ paddingTop: 110, paddingBottom: 28 }}>

          {/* User card */}
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{
              background: '#fff', borderRadius: 20,
              padding: '18px 18px 14px',
              boxShadow: '0 4px 16px rgba(26,15,10,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #E8B04B, #D94F30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 900, color: '#fff',
                }}>
                  {persona.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 17, fontWeight: 800, color: '#1A1A1A', letterSpacing: -0.3 }}>{persona.name}</div>
                  <div style={{
                    display: 'inline-block', marginTop: 4,
                    padding: '3px 10px', borderRadius: 9999,
                    background: persona.archetype === 'Explorer' ? 'rgba(91,75,138,0.1)' : 'rgba(232,176,75,0.15)',
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
                    color: persona.archetype === 'Explorer' ? '#5B4B8A' : '#8A5F00',
                  }}>
                    {t(persona.archetype, persona.archetype === 'Explorer' ? '探索者' : '規劃者')}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 0 }}>
                {[
                  [EVENTS.length, t('Explored', '已探索')],
                  [saved.size,    t('Saved', '已收藏')],
                  [planned.size,  t('Planned', '已計畫')],
                ].map(([value, label], i, arr) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    {i > 0 && <div style={{ position: 'absolute', left: 0, top: '15%', height: '70%', width: 1, background: 'rgba(26,15,10,0.08)' }} />}
                    <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 900, color: '#1A1A1A', letterSpacing: -0.4 }}>{value}</div>
                    <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 600, color: '#8A6F4A', letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Saved section */}
          <div style={{ padding: '20px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
              <p style={{ margin: 0, fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase' }}>
                {t('Saved', '已收藏')}
              </p>
              <button onClick={() => navigate('/saved')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700, color: '#D94F30' }}>
                {t('View all', '查看全部')}
              </button>
            </div>
            {savedEvents.length === 0 ? (
              <div style={{ padding: '0 20px 8px' }}>
                <div style={{ background: '#fff', borderRadius: 18, padding: '24px', textAlign: 'center', boxShadow: '0 4px 14px rgba(26,15,10,0.06)' }}>
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, color: '#8A6F4A' }}>{t('No saved events yet', '尚未收藏任何活動')}</div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: 12,
                overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
                padding: '0 20px 4px',
              }}>
                {savedEvents.map(ev => (
                  <div key={ev.id} style={{ scrollSnapAlign: 'start' }}>
                    <SmallEventCard ev={ev} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends section */}
          <div
            onClick={() => navigate('/friends')}
            style={{ margin: '20px 20px 0', padding: '16px 18px', background: '#fff', borderRadius: 18, boxShadow: '0 4px 16px rgba(26,15,10,0.06)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase' }}>
                {t('Friends', '朋友')}
              </span>
              <ChevronRight size={16} color="rgba(26,15,10,0.3)" />
            </div>
            <div style={{ display: 'flex' }}>
              {FRIENDS.slice(0, 5).map((f, i) => (
                <div key={f.id} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: f.color, border: '2px solid #fff',
                  marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 800, color: '#fff',
                }}>{f.initials[0]}</div>
              ))}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(26,15,10,0.07)', border: '2px solid #fff',
                marginLeft: -10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700, color: '#8A6F4A',
              }}>+{FRIENDS.length - 5}</div>
            </div>
          </div>

          {/* Following section */}
          <div
            onClick={() => navigate('/following')}
            style={{ margin: '12px 20px 0', padding: '16px 18px', background: '#fff', borderRadius: 18, boxShadow: '0 4px 16px rgba(26,15,10,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', marginBottom: 6 }}>
                {t('Following', '追蹤中')}
              </div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                {venueCount} {t('venues', '個場地')} · {hostCount} {t('hosts', '個主辦方')}
              </div>
            </div>
            <ChevronRight size={18} color="rgba(26,15,10,0.3)" />
          </div>

        </div>
      </div>

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
