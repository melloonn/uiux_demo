import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ChevronLeft } from 'lucide-react';
import { AppContext } from '../../App.jsx';
import { FRIENDS } from '../../data/mockFriends.js';

function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}

function FriendAvatar({ friend, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: friend.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Plus Jakarta Sans"', fontSize: size * 0.35, fontWeight: 800, color: '#fff',
    }}>
      {friend.initials}
    </div>
  );
}

function FriendPickerSheet({ event, lang, onClose, onToast }) {
  const { sendMessage } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSend = (friend) => {
    const chatId = `dm-${friend.id}`;
    sendMessage(chatId, { eventId: event.id }, { name: friend.name, friendId: friend.id });
    onToast(lang === 'zh' ? `已傳送給 ${friend.name}` : `Sent to ${friend.name}`);
    onClose();
    setTimeout(() => navigate(`/messages/${chatId}`), 350);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 61,
        background: 'rgba(18,12,10,0.96)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px 0 28px',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)', margin: '6px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px 0 0', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={20} color="rgba(255,255,255,0.6)" />
          </button>
          <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.3, flex: 1, textAlign: 'center' }}>
            {lang === 'zh' ? '選擇朋友' : 'Send to...'}
          </span>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ maxHeight: 320, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {FRIENDS.map(friend => (
            <button key={friend.id} onClick={() => handleSend(friend)} style={{
              width: '100%', padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <FriendAvatar friend={friend} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>{friend.name}</div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{friend.relationship}</div>
              </div>
              <div style={{
                padding: '6px 14px', borderRadius: 9999,
                background: 'rgba(217,79,48,0.2)',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700, color: '#FF7A5C',
              }}>
                {lang === 'zh' ? '傳送' : 'Send'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function LineIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#06C755"/>
      <path d="M12 4C7.58 4 4 7.1 4 10.93c0 2.45 1.55 4.6 3.88 5.93-.17.6-.64 2.18-.73 2.52-.11.41.15.4.32.29.13-.08 2.08-1.41 2.93-1.98.51.07 1.04.11 1.6.11 4.42 0 8-3.1 8-6.93C20 7.1 16.42 4 12 4z" fill="white"/>
    </svg>
  );
}

export function ShareSheet({ event, lang, onClose, onToast }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const copyLink = () => {
    const url = `https://cultureflow.tw/event/${event.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    onToast(lang === 'zh' ? '連結已複製' : 'Link copied');
    onClose();
  };

  const title = lang === 'zh' ? event.title.zh : event.title.en;

  const shareToLine = () => {
    const text = lang === 'zh'
      ? `${title}\nhttps://cultureflow.tw/event/${event.id}`
      : `Check this out: ${title}\nhttps://cultureflow.tw/event/${event.id}`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
    onClose();
  };

  const options = [
    {
      icon: <LineIcon size={20} />,
      label: 'LINE',
      sub: lang === 'zh' ? '分享至 LINE' : 'Share via LINE',
      action: shareToLine,
      iconBg: '#06C755',
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      label: lang === 'zh' ? '傳給朋友' : 'Send to friend',
      sub: lang === 'zh' ? '在 CultureFlow 內傳送' : 'Send within CultureFlow',
      action: () => setPickerOpen(true),
    },
    {
      icon: <Link2 size={20} />,
      label: lang === 'zh' ? '複製連結' : 'Copy link',
      sub: `cultureflow.tw/event/${event.id}`,
      action: copyLink,
    },
    {
      icon: <InstagramIcon size={20} />,
      label: lang === 'zh' ? '分享到 Instagram' : 'Share to Instagram Story',
      sub: lang === 'zh' ? '視覺預覽' : 'Visual mockup',
      action: () => { onToast(lang === 'zh' ? '開啟 Instagram…' : 'Opening Instagram…'); onClose(); },
    },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 51,
        background: 'rgba(18,12,10,0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px 0 28px',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)', margin: '6px auto 18px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, backgroundImage: `url(${event.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
            <div style={{ fontFamily: '"Plus Jakarta Sans",system-ui', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>CultureFlow</div>
          </div>
        </div>

        {options.map(opt => (
          <button key={opt.label} onClick={opt.action} style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: opt.iconBg ?? 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {opt.icon}
            </div>
            <div>
              <div style={{ fontFamily: '"Plus Jakarta Sans",system-ui', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>{opt.label}</div>
              {opt.sub && <div style={{ fontFamily: '"Plus Jakarta Sans",system-ui', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{opt.sub}</div>}
            </div>
          </button>
        ))}

        <div style={{ padding: '8px 20px 0' }}>
          <button onClick={onClose} style={{ width: '100%', height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: '"Plus Jakarta Sans",system-ui', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {lang === 'zh' ? '取消' : 'Cancel'}
          </button>
        </div>
      </div>

      {pickerOpen && (
        <FriendPickerSheet event={event} lang={lang} onClose={onClose} onToast={onToast} />
      )}
    </>
  );
}
