import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { TabBar } from '../components/layout/TabBar.jsx';
import { FRIENDS } from '../data/mockFriends.js';
import { SquarePen, Search } from 'lucide-react';

function Avatar({ friendId, size = 38 }) {
  const friend = FRIENDS.find(f => f.id === friendId);
  if (!friend) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#DDD' }} />;
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

function GroupAvatars({ members }) {
  const first3 = members.slice(0, 3);
  return (
    <div style={{ position: 'relative', width: 46, height: 38, flexShrink: 0 }}>
      {first3.map((id, i) => {
        const f = FRIENDS.find(fr => fr.id === id);
        if (!f) return null;
        const offsets = [[0, 0], [14, 0], [7, 12]];
        return (
          <div key={id} style={{
            position: 'absolute',
            left: offsets[i][0], top: offsets[i][1],
            width: 26, height: 26, borderRadius: '50%',
            background: f.color, border: '2px solid #FAF7F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 9, fontWeight: 800, color: '#fff',
          }}>
            {f.initials[0]}
          </div>
        );
      })}
    </div>
  );
}

function lastMessagePreview(chat) {
  const last = chat.messages[chat.messages.length - 1];
  if (!last) return '';
  if (last.eventId) return '📅 Shared an event';
  return last.text || '';
}

function lastMessageTime(chat) {
  const last = chat.messages[chat.messages.length - 1];
  return last?.time || '';
}

export default function Messages() {
  const { lang, chats } = useContext(AppContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const pinnedChats = chats.filter(c => c.pinned);
  const dmChats = chats.filter(c => !c.pinned && c.type === 'direct');

  const filter = (list) => query
    ? list.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : list;

  const ChatRow = ({ chat }) => {
    const preview = lastMessagePreview(chat);
    const time = lastMessageTime(chat);
    return (
      <button
        onClick={() => navigate(`/messages/${chat.id}`)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {chat.type === 'group'
          ? <GroupAvatars members={chat.members} />
          : <Avatar friendId={chat.friendId} size={46} />
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
            <span style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 700, color: '#1A1A1A', letterSpacing: -0.2 }}>{chat.name}</span>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 500, color: '#8A6F4A', flexShrink: 0, marginLeft: 8 }}>{time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
              fontSize: 13, fontWeight: chat.unread > 0 ? 600 : 400,
              color: chat.unread > 0 ? '#1A1A1A' : '#8A6F4A',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 200,
            }}>{preview}</span>
            {chat.unread > 0 && (
              <div style={{
                minWidth: 20, height: 20, borderRadius: 9999, padding: '0 6px',
                background: '#D94F30', color: '#fff',
                fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8,
              }}>{chat.unread}</div>
            )}
          </div>
        </div>
      </button>
    );
  };

  const SectionLabel = ({ text }) => (
    <p style={{
      fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.4,
      color: '#8A6F4A', textTransform: 'uppercase', padding: '0 20px', marginBottom: 0, marginTop: 0,
    }}>{text}</p>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: 58, paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
        background: 'rgba(250,247,242,0.9)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(26,15,10,0.06)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <h1 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 26, fontWeight: 900, letterSpacing: -0.6, color: '#1A1A1A' }}>
          {lang === 'zh' ? '訊息' : 'Messages'}
        </h1>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SquarePen size={16} color="#1A1A1A" />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 84, overflowY: 'auto' }}>
        <div style={{ paddingTop: 110, paddingBottom: 32 }}>

          {/* Search */}
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{
              height: 42, borderRadius: 12,
              background: 'rgba(26,15,10,0.07)',
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px',
            }}>
              <Search size={16} color="#8A6F4A" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={lang === 'zh' ? '搜尋對話…' : 'Search conversations…'}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                  fontSize: 14, color: '#1A1A1A', fontWeight: 500,
                }}
              />
            </div>
          </div>

          {/* Pinned / Active plans */}
          {filter(pinnedChats).length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>📌</span>
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 1.3, color: '#8A6F4A', textTransform: 'uppercase' }}>
                  {lang === 'zh' ? '活躍計畫' : 'Active plans'}
                </span>
              </div>
              {filter(pinnedChats).map((chat, i) => (
                <div key={chat.id}>
                  <ChatRow chat={chat} />
                  {i < filter(pinnedChats).length - 1 && <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />}
                </div>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: 'rgba(26,15,10,0.08)', margin: '8px 0 16px' }} />

          {/* Direct messages */}
          {filter(dmChats).length > 0 && (
            <div>
              <div style={{ padding: '0 20px 8px' }}>
                <SectionLabel text={lang === 'zh' ? '直接訊息' : 'Direct messages'} />
              </div>
              {filter(dmChats).map((chat, i) => (
                <div key={chat.id}>
                  <ChatRow chat={chat} />
                  {i < filter(dmChats).length - 1 && <div style={{ height: 1, background: 'rgba(26,15,10,0.06)', margin: '0 20px' }} />}
                </div>
              ))}
            </div>
          )}

          {filter(pinnedChats).length === 0 && filter(dmChats).length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: '"Plus Jakarta Sans"', fontSize: 14, color: '#8A6F4A' }}>
              {lang === 'zh' ? '沒有符合的對話' : 'No conversations found'}
            </div>
          )}
        </div>
      </div>

      <TabBar lang={lang} dark={false} />
    </div>
  );
}
