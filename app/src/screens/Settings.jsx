import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { GlobeToggle } from '../components/ui/GlobeToggle.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { lang, setLang } = useContext(AppContext);
  const navigate = useNavigate();
  const t = (en, zh) => lang === 'zh' ? zh : en;

  const sections = [
    {
      title: t('Preferences', '偏好設定'),
      items: [
        { label: t('Language', '語言設定'), right: <GlobeToggle lang={lang} setLang={setLang} /> },
        { label: t('Notifications', '通知設定'), value: t('On', '開啟') },
        { label: t('Accessibility', '無障礙設定'), value: '' },
      ],
    },
    {
      title: t('Privacy & Data', '隱私與資料'),
      items: [
        { label: t('Privacy Settings', '隱私設定'), value: '' },
        { label: t('Data & Personalisation', '資料與個人化'), value: '' },
        { label: t('Delete Account', '刪除帳號'), value: '', danger: true },
      ],
    },
    {
      title: t('About', '關於'),
      items: [
        { label: t('Share CultureFlow', '分享 CultureFlow'), value: '' },
        { label: t('Rate the App', '為應用程式評分'), value: '' },
        { label: t('Version', '版本'), value: '1.0.0', static: true },
      ],
    },
  ];

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
          {t('Settings', '設定')}
        </h1>
      </div>

      {/* Scrollable content */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ paddingTop: 106, paddingBottom: 40 }}>
          {sections.map(section => (
            <div key={section.title} style={{ marginBottom: 28 }}>
              <p style={{
                margin: '0 0 8px', padding: '0 20px',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800,
                letterSpacing: 1.4, color: '#8A6F4A', textTransform: 'uppercase',
              }}>
                {section.title}
              </p>
              <div style={{ margin: '0 20px', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 14px rgba(26,15,10,0.06)' }}>
                {section.items.map((item, i, arr) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '15px 18px',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(26,15,10,0.06)' : 'none',
                      cursor: item.static ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{
                      fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 15, fontWeight: 600,
                      color: item.danger ? '#D94F30' : '#1A1A1A',
                    }}>
                      {item.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.right ? item.right : null}
                      {item.value && (
                        <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 500, color: '#8A6F4A' }}>
                          {item.value}
                        </span>
                      )}
                      {!item.static && !item.right && (
                        <ChevronRight size={16} color="rgba(26,15,10,0.25)" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
