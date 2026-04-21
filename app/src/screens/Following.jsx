import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { FOLLOWING } from '../data/mockFriends.js';
import { ChevronLeft, Check } from 'lucide-react';

const CAT_COLOR = { festival: '#D94F30', market: '#E8B04B', live: '#5B4B8A', exhibition: '#6B6B6B' };
const CAT_LABEL = { en: { festival: 'Festival', market: 'Market', live: 'Live', exhibition: 'Exhibition' }, zh: { festival: '節慶', market: '市集', live: '現場', exhibition: '展覽' } };

export default function Following() {
  const { lang } = useContext(AppContext);
  const navigate = useNavigate();

  const venues = FOLLOWING.filter(f => f.type === 'venue');
  const hosts  = FOLLOWING.filter(f => f.type === 'host');

  const Row = ({ item, last }) => {
    const color = CAT_COLOR[item.category] ?? '#8A6F4A';
    const catLabel = CAT_LABEL[lang]?.[item.category] ?? item.category;
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20 }}>
              {item.category === 'festival' ? '🏮' : item.category === 'market' ? '🍢' : item.category === 'live' ? '🎸' : '🎨'}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui', fontSize: 14, fontWeight: 700, color: '#1A1A1A', letterSpacing: -0.2 }}>{item.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: 9999 }}>{catLabel}</span>
              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: '#8A6F4A' }}>{item.followers} followers</span>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 9999,
            background: 'rgba(26,15,10,0.06)',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700, color: '#1A1A1A',
          }}>
            <Check size={12} color="#7FA491" />
            {lang === 'zh' ? '已追蹤' : 'Following'}
          </div>
        </div>
        {!last && <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />}
      </>
    );
  };

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
        <h1 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui', fontSize: 20, fontWeight: 800, letterSpacing: -0.4, color: '#1A1A1A' }}>
          {lang === 'zh' ? '追蹤中' : 'Following'}
        </h1>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ paddingTop: 110, paddingBottom: 32 }}>

          {/* Venues */}
          <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', padding: '0 20px', marginBottom: 4 }}>
            {venues.length} {lang === 'zh' ? '個場地' : 'Venues'}
          </p>
          {venues.map((item, i) => <Row key={item.id} item={item} last={i === venues.length - 1} />)}

          <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', margin: '16px 0' }} />

          {/* Hosts */}
          <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase', padding: '0 20px', marginBottom: 4 }}>
            {hosts.length} {lang === 'zh' ? '個主辦方' : 'Hosts'}
          </p>
          {hosts.map((item, i) => <Row key={item.id} item={item} last={i === hosts.length - 1} />)}
        </div>
      </div>
    </div>
  );
}
