import { useContext, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { EVENTS } from '../data/events.js';
import { FRIENDS } from '../data/mockFriends.js';
import { ChevronLeft, MoreHorizontal, Send, Plus, CalendarDays, MapPin, Camera, X } from 'lucide-react';

// Mini event card inside a chat bubble
function EventBubble({ eventId, isMe, lang, onNavigate }) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return null;
  const title = lang === 'zh' ? ev.title.zh : ev.title.en;
  const sub   = lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en;
  const accent = isMe ? 'rgba(255,255,255,0.15)' : 'rgba(26,15,10,0.06)';
  const textColor = isMe ? '#fff' : '#1A1A1A';
  const subColor = isMe ? 'rgba(255,255,255,0.7)' : '#8A6F4A';

  return (
    <div
      onClick={() => onNavigate(`/event/${ev.id}`)}
      style={{
        width: 230, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        background: isMe ? 'rgba(217,79,48,0.85)' : '#fff',
        boxShadow: '0 3px 14px rgba(26,15,10,0.13)',
        border: `1px solid ${accent}`,
      }}
    >
      <div style={{
        height: 110,
        backgroundImage: `url(${ev.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
          <CalendarDays size={11} color={subColor} />
          <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 600, color: subColor }}>
            {lang === 'zh' ? ev.date.zh : ev.date.en}
          </span>
        </div>
        <p style={{ margin: '0 0 3px', fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui', fontSize: 14, fontWeight: 800, color: textColor, letterSpacing: -0.3, lineHeight: 1.25 }}>
          {title}
        </p>
        <p style={{ margin: 0, fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: subColor }}>
          {sub}
        </p>
        <div style={{
          marginTop: 10, padding: '6px 0 0', borderTop: `1px solid ${accent}`,
          fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
          color: isMe ? 'rgba(255,255,255,0.9)' : '#D94F30',
        }}>
          {lang === 'zh' ? '點擊查看 →' : 'Tap to view →'}
        </div>
      </div>
    </div>
  );
}

function SenderName({ fromId }) {
  const friend = FRIENDS.find(f => f.id === fromId);
  if (!friend) return null;
  return (
    <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: friend.color, marginBottom: 3, display: 'block' }}>
      {friend.name}
    </span>
  );
}

function Avatar({ friendId, size = 28 }) {
  const friend = FRIENDS.find(f => f.id === friendId);
  if (!friend) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#DDD', flexShrink: 0 }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: friend.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Plus Jakarta Sans"', fontSize: size * 0.35, fontWeight: 800, color: '#fff',
    }}>
      {friend.initials[0]}
    </div>
  );
}

function AttachmentMenu({ chatId, lang, onClose, onToast }) {
  const { sendMessage } = useContext(AppContext);
  const [eventPickerOpen, setEventPickerOpen] = useState(false);

  const attachOptions = [
    { icon: '📅', label: lang === 'zh' ? '分享活動' : 'Share event',    action: () => setEventPickerOpen(true) },
    { icon: '📍', label: lang === 'zh' ? '分享位置' : 'Location',       action: () => { onToast(lang === 'zh' ? '即將推出' : 'Coming soon'); onClose(); } },
    { icon: '📷', label: lang === 'zh' ? '照片' : 'Photo',              action: () => { onToast(lang === 'zh' ? '即將推出' : 'Coming soon'); onClose(); } },
  ];

  if (eventPickerOpen) {
    return (
      <>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60 }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 61,
          background: 'rgba(250,247,242,0.97)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: '1px solid rgba(26,15,10,0.08)',
          padding: '10px 0 24px',
          boxShadow: '0 -20px 50px rgba(26,15,10,0.15)',
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,15,10,0.15)', margin: '6px auto 12px' }} />
          <p style={{ margin: '0 0 8px', padding: '0 20px', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: '#8A6F4A', textTransform: 'uppercase' }}>
            {lang === 'zh' ? '選擇活動' : 'Pick an event'}
          </p>
          <div style={{ maxHeight: 340, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {EVENTS.map(ev => (
              <button key={ev.id} onClick={() => {
                sendMessage(chatId, { eventId: ev.id });
                onClose();
              }} style={{
                width: '100%', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12,
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundImage: `url(${ev.img})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui', fontSize: 14, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang === 'zh' ? ev.title.zh : ev.title.en}
                  </p>
                  <p style={{ margin: '2px 0 0', fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', fontWeight: 500 }}>
                    {lang === 'zh' ? ev.subtitle.zh : ev.subtitle.en}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60 }} />
      <div style={{
        position: 'absolute', left: 16, bottom: 72, zIndex: 61,
        background: 'rgba(255,253,248,0.97)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 18, padding: '6px 0',
        border: '1px solid rgba(26,15,10,0.08)',
        boxShadow: '0 12px 36px rgba(26,15,10,0.16)',
        minWidth: 190,
      }}>
        {attachOptions.map(opt => (
          <button key={opt.label} onClick={opt.action} style={{
            width: '100%', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{ fontSize: 18 }}>{opt.icon}</span>
            <span style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { lang, chats, sendMessage, clearUnread } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const chat = chats.find(c => c.id === chatId);

  useEffect(() => {
    if (chatId) clearUnread(chatId);
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages?.length]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(chatId, { text: inputText.trim() });
    setInputText('');
  };

  if (!chat) return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, color: '#8A6F4A' }}>Chat not found</p>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 12, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700 }}>Go back</button>
    </div>
  );

  const friend = chat.type === 'direct' ? FRIENDS.find(f => f.id === chat.friendId) : null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 56, paddingBottom: 10, paddingLeft: 12, paddingRight: 16,
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', gap: 10,
      }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronLeft size={18} color="#1A1A1A" />
        </button>

        {friend ? (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: friend.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {friend.initials}
          </div>
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8B04B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            👥
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 800, color: '#1A1A1A', letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name}</div>
          {friend && <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: '#8A6F4A' }}>{friend.lastSeen}</div>}
          {chat.type === 'group' && <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: '#8A6F4A' }}>{chat.members.length} members</div>}
        </div>

        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MoreHorizontal size={18} color="#1A1A1A" />
        </button>
      </div>

      {/* Messages list */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 68, overflowY: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ paddingTop: 112, paddingBottom: 16 }}>
          {chat.messages.map((msg, i) => {
            const prevMsg = i > 0 ? chat.messages[i - 1] : null;
            const showAvatar = !msg.isMe && (!prevMsg || prevMsg.from !== msg.from || prevMsg.isMe);
            const showSender = chat.type === 'group' && !msg.isMe && showAvatar;

            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: msg.eventId ? 10 : 4 }}>
                {showSender && (
                  <div style={{ paddingLeft: 52, marginBottom: 2 }}>
                    <SenderName fromId={msg.from} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: msg.isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8, padding: '0 16px' }}>
                  {!msg.isMe && showAvatar && <Avatar friendId={msg.from} size={28} />}
                  {!msg.isMe && !showAvatar && <div style={{ width: 28, flexShrink: 0 }} />}

                  {msg.eventId ? (
                    <EventBubble eventId={msg.eventId} isMe={msg.isMe} lang={lang} onNavigate={navigate} />
                  ) : (
                    <div style={{
                      maxWidth: '72%', padding: '10px 14px',
                      borderRadius: msg.isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.isMe ? '#D94F30' : '#fff',
                      boxShadow: '0 2px 8px rgba(26,15,10,0.08)',
                    }}>
                      <p style={{ margin: 0, fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui', fontSize: 14, fontWeight: 500, color: msg.isMe ? '#fff' : '#1A1A1A', lineHeight: 1.45 }}>
                        {msg.text}
                      </p>
                    </div>
                  )}
                </div>
                {msg.time && (i === chat.messages.length - 1 || chat.messages[i + 1]?.from !== msg.from) && (
                  <div style={{ textAlign: msg.isMe ? 'right' : 'left', padding: msg.isMe ? '2px 18px 0' : '2px 18px 0 54px' }}>
                    <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 500, color: 'rgba(26,15,10,0.35)' }}>{msg.time}</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 68, padding: '10px 12px 14px',
        background: 'rgba(250,247,242,0.95)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(26,15,10,0.07)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={() => setAttachOpen(o => !o)} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: attachOpen ? '#1A1A1A' : 'rgba(26,15,10,0.08)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.18s',
        }}>
          {attachOpen
            ? <X size={16} color="#fff" />
            : <Plus size={18} color="#1A1A1A" />
          }
        </button>

        <div style={{
          flex: 1, height: 38, borderRadius: 9999,
          background: 'rgba(26,15,10,0.07)',
          display: 'flex', alignItems: 'center', padding: '0 14px',
        }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'zh' ? '輸入訊息…' : 'Message…'}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: '"Plus Jakarta Sans","Noto Sans TC",system-ui',
              fontSize: 14, color: '#1A1A1A', fontWeight: 500,
            }}
          />
        </div>

        <button onClick={handleSend} disabled={!inputText.trim()} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: inputText.trim() ? '#D94F30' : 'rgba(26,15,10,0.08)',
          border: 'none', cursor: inputText.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.18s',
        }}>
          <Send size={15} color={inputText.trim() ? '#fff' : '#8A6F4A'} />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, background: 'rgba(26,15,10,0.88)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          color: '#fff', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700,
          padding: '10px 20px', borderRadius: 12, whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>{toast}</div>
      )}

      {/* Attachment menu */}
      {attachOpen && (
        <AttachmentMenu
          chatId={chatId}
          lang={lang}
          onClose={() => setAttachOpen(false)}
          onToast={showToast}
        />
      )}
    </div>
  );
}
