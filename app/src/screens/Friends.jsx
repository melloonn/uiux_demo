import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { FRIENDS } from '../data/mockFriends.js';
import { ChevronLeft, MessageCircle } from 'lucide-react';

export default function Friends() {
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  const catColors = { festival: '#D94F30', market: '#E8B04B', live: '#5B4B8A', exhibition: '#6B6B6B' };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 58, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
        background: 'rgba(250,247,242,0.9)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} color="#1A1A1A" />
        </button>
        <h1 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 20, fontWeight: 800, letterSpacing: -0.4, color: '#1A1A1A' }}>
          {lang === 'zh' ? '朋友' : 'Friends'}
        </h1>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ paddingTop: 110, paddingBottom: 32 }}>
          <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', padding: '0 20px', marginBottom: 4 }}>
            {FRIENDS.length} {lang === 'zh' ? '位朋友' : 'friends'}
          </p>

          {FRIENDS.map((friend, i) => (
            <div key={friend.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                  background: friend.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 800, color: '#fff',
                }}>
                  {friend.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#1A1A1A', letterSpacing: -0.2 }}>{friend.name}</div>
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: '#8A6F4A', marginTop: 2 }}>
                    {friend.relationship} · {lang === 'zh' ? `${friend.sharedPlans} 個共同計畫` : `${friend.sharedPlans} shared plan${friend.sharedPlans !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/messages/dm-${friend.id}`)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <MessageCircle size={16} color="#1A1A1A" />
                </button>
              </div>
              {i < FRIENDS.length - 1 && <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
