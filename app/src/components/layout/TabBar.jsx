import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, MapPin, CalendarDays, User } from 'lucide-react';

const TABS = [
  { path: '/',       labelEn: 'Home',    labelZh: '首頁',  Icon: Home },
  { path: '/vibes',  labelEn: 'Explore', labelZh: '探索',  Icon: Compass },
  { path: '/map',    labelEn: 'Map',     labelZh: '地圖',  Icon: MapPin },
  { path: '/plan',   labelEn: 'Plan',    labelZh: '計畫',  Icon: CalendarDays },
  { path: '/me',     labelEn: 'Me',      labelZh: '我',    Icon: User },
];

export function TabBar({ lang = 'en', dark = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePath = TABS.reduce((best, tab) => {
    if (pathname.startsWith(tab.path) && tab.path.length > best.length) return tab.path;
    return best;
  }, '');

  const ink    = dark ? 'rgba(255,255,255,0.55)' : '#8A6F4A';
  const active = dark ? '#fff'                   : '#D94F30';
  const bg     = dark
    ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)'
    : '#fff';
  const border = dark ? 'none' : '1px solid rgba(26,15,10,0.06)';

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 84, zIndex: 25,
      background: bg,
      borderTop: border,
      paddingTop: 10,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      boxShadow: dark ? 'none' : '0 -8px 24px rgba(26,15,10,0.04)',
    }}>
      {TABS.map(tab => {
        const isActive = tab.path === activePath || (tab.path === '/' && pathname === '/');
        const color = isActive ? active : ink;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: 0, minWidth: 48, color,
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <tab.Icon
                size={22}
                fill={isActive && !dark ? color : 'none'}
                color={color}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </div>
            <span style={{
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 10,
              fontWeight: isActive ? 800 : 600,
              color,
              letterSpacing: 0.1,
            }}>
              {lang === 'zh' ? tab.labelZh : tab.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
