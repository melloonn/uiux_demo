import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useLanguage } from './hooks/useLanguage.js';
import { useSavedEvents } from './hooks/useSavedEvents.js';
import { IOSFrame } from './components/ui/IOSFrame.jsx';
import { CHATS } from './data/mockMessages.js';

import Home           from './screens/Home.jsx';
import ReelsFeed      from './screens/ReelsFeed.jsx';
import MapScreen      from './screens/Map.jsx';
import VibeDiscovery  from './screens/VibeDiscovery.jsx';
import EventDetail    from './screens/EventDetail.jsx';
import CategoryDetail from './screens/CategoryDetail.jsx';
import MyPlan         from './screens/MyPlan.jsx';
import Profile        from './screens/Profile.jsx';
import Messages       from './screens/Messages.jsx';
import ChatDetail     from './screens/ChatDetail.jsx';
import Friends        from './screens/Friends.jsx';
import Following      from './screens/Following.jsx';
import Settings       from './screens/Settings.jsx';
import Saved          from './screens/Saved.jsx';
import FriendProfile  from './screens/FriendProfile.jsx';
import Onboarding     from './screens/Onboarding.jsx';

export const AppContext = createContext(null);

// Tab order for determining slide direction
const TAB_ORDER = ['/', '/reels', '/map', '/plan', '/me'];
function tabIndex(pathname) {
  const base = '/' + pathname.split('/')[1];
  const i = TAB_ORDER.indexOf(base);
  return i === -1 ? 0 : i;
}

// Detail routes (slide in from right, no tab transition)
const DETAIL_PREFIXES = ['/event/', '/category/', '/messages/', '/friends/', '/settings', '/saved', '/plan', '/following'];

// Framer Motion slide variants
const variants = {
  enterRight: { x: '100%', opacity: 0 },
  enterLeft:  { x: '-30%', opacity: 0 },
  center:     { x: 0,      opacity: 1 },
  exitLeft:   { x: '-30%', opacity: 0 },
  exitRight:  { x: '100%', opacity: 0 },
  fadeOut:    { opacity: 0, x: 0 },
  fadeIn:     { opacity: 0, x: 0 },
};

function PageWrapper({ children, direction }) {
  const isDetail = direction === 'detail';
  return (
    <motion.div
      style={{ position: 'absolute', inset: 0 }}
      initial={isDetail ? 'enterRight' : direction === 'forward' ? 'enterRight' : direction === 'back' ? 'enterLeft' : 'fadeIn'}
      animate="center"
      exit={isDetail ? 'exitLeft' : direction === 'forward' ? 'exitLeft' : direction === 'back' ? 'exitRight' : 'fadeOut'}
      variants={variants}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Redirect to /onboarding on first launch
function OnboardingGate() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!localStorage.getItem('cf_onboarded') && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const [prevIdx] = useState(() => tabIndex(location.pathname));

  const curIdx = tabIndex(location.pathname);
  const isDetail = DETAIL_PREFIXES.some(p => location.pathname.startsWith(p));

  return (
    <>
      <OnboardingGate />
    <AnimatePresence mode="wait" initial={false}>
      <PageWrapper key={location.pathname} direction={isDetail ? 'detail' : 'tab'}>
        <Routes location={location}>
          <Route path="/onboarding"             element={<Onboarding />} />
          <Route path="/"                       element={<Home />} />
          <Route path="/reels"                  element={<ReelsFeed />} />
          <Route path="/map"                    element={<MapScreen />} />
          <Route path="/vibes"                  element={<VibeDiscovery />} />
          <Route path="/event/:id"              element={<EventDetail />} />
          <Route path="/category/:categoryId"   element={<CategoryDetail />} />
          <Route path="/messages"               element={<Messages />} />
          <Route path="/messages/:chatId"       element={<ChatDetail />} />
          <Route path="/friends"                element={<Friends />} />
          <Route path="/friends/:id"            element={<FriendProfile />} />
          <Route path="/following"              element={<Following />} />
          <Route path="/plan"                   element={<MyPlan />} />
          <Route path="/saved"                  element={<Saved />} />
          <Route path="/settings"               element={<Settings />} />
          <Route path="/me"                     element={<Profile />} />
        </Routes>
      </PageWrapper>
    </AnimatePresence>
    </>
  );
}

export default function App() {
  const { lang, setLang, toggle: toggleLang } = useLanguage('en');
  const { saved, planned, toggleSave, togglePlan } = useSavedEvents();

  // Chat state
  const [chats, setChats] = useState(CHATS);

  const sendMessage = useCallback((chatId, msg, meta = {}) => {
    const newMsg = {
      id: 'msg-' + Date.now(),
      from: 'me',
      isMe: true,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ...msg,
    };
    setChats(prev => {
      const idx = prev.findIndex(c => c.id === chatId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], messages: [...updated[idx].messages, newMsg] };
        return updated;
      }
      return [...prev, {
        id: chatId,
        type: 'direct',
        name: meta.name || 'Friend',
        friendId: meta.friendId,
        unread: 0,
        pinned: false,
        messages: [newMsg],
      }];
    });
  }, []);

  const clearUnread = useCallback((chatId) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
  }, []);

  const totalUnread = useMemo(() => chats.reduce((sum, c) => sum + (c.unread || 0), 0), [chats]);

  const ctx = {
    lang, setLang, toggleLang,
    saved, planned, toggleSave, togglePlan,
    chats, sendMessage, clearUnread, totalUnread,
  };
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 500;

  const inner = (
    <AppContext.Provider value={ctx}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        <AnimatedRoutes />
      </div>
    </AppContext.Provider>
  );

  if (!isDesktop) {
    return <div style={{ width: '100%', height: '100%' }}>{inner}</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(1200px 800px at 20% -10%, #F4E4C9 0%, transparent 55%), radial-gradient(900px 600px at 110% 110%, #F6D4C4 0%, transparent 55%), #EFE9DE',
      padding: '36px 16px',
    }}>
      <IOSFrame>
        {inner}
      </IOSFrame>
    </div>
  );
}
