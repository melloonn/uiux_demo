import { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { FRIENDS } from '../data/mockFriends.js';
import { ChevronLeft, MessageCircle, UserCheck } from 'lucide-react';

export default function FriendProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(AppContext);
  const friend = FRIENDS.find(f => f.id === id);

  if (!friend) return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, color: '#8A6F4A' }}>{lang === 'zh' ? '找不到朋友' : 'Friend not found'}</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 12, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700 }}>
        {lang === 'zh' ? '返回' : 'Go back'}
      </button>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 58, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', gap: 12,
      }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronLeft size={18} color="#1A1A1A" />
        </button>
        <h1 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 20, fontWeight: 800, letterSpacing: -0.4, color: '#1A1A1A' }}>
          {friend.name}
        </h1>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ paddingTop: 106, paddingBottom: 40 }}>

          {/* Profile card */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 16px rgba(26,15,10,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: friend.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 28, fontWeight: 900, color: '#fff',
                marginBottom: 14,
              }}>
                {friend.initials}
              </div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 20, fontWeight: 800, color: '#1A1A1A', letterSpacing: -0.4 }}>{friend.name}</div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 500, color: '#8A6F4A', marginTop: 4 }}>{friend.relationship}</div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => navigate(`/messages/dm-${friend.id}`)}
                  style={{
                    height: 44, padding: '0 22px', borderRadius: 12,
                    background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <MessageCircle size={16} color="#fff" />
                  {lang === 'zh' ? '傳訊息' : 'Message'}
                </button>
                <button
                  style={{
                    height: 44, padding: '0 22px', borderRadius: 12,
                    background: 'rgba(91,75,138,0.1)', color: '#5B4B8A', border: 'none', cursor: 'pointer',
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <UserCheck size={16} color="#5B4B8A" />
                  {lang === 'zh' ? '朋友' : 'Friends'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ margin: '16px 20px 0', background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 4px 14px rgba(26,15,10,0.06)' }}>
            <div style={{ display: 'flex' }}>
              {[
                [friend.sharedPlans, lang === 'zh' ? '共同計畫' : 'Shared Plans'],
                [friend.lastSeen,    lang === 'zh' ? '上線時間' : 'Last Active'],
              ].map(([value, label], i) => (
                <div key={label} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  {i > 0 && <div style={{ position: 'absolute', left: 0, top: '10%', height: '80%', width: 1, background: 'rgba(26,15,10,0.08)' }} />}
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 20, fontWeight: 900, color: '#1A1A1A', letterSpacing: -0.3 }}>{value}</div>
                  <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 600, color: '#8A6F4A', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
