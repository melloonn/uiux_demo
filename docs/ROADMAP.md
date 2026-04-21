# CultureFlow — Feature Roadmap

## Completed

### Core App Scaffold
- React 18 + Vite + Tailwind v4 with custom design tokens
- React Router v6 with Framer Motion page transitions (slide / fade)
- IOSFrame wrapper for desktop preview (390×844 iPhone shell)
- AppContext: lang, saved/planned events, chats state
- Persistent TabBar (Home, Reels, Map, Plan, Me) — pinned via `position:absolute`

### Home Screen
- For You / Nearby toggle with 5km proximity filter
- **Explore by Category** grid (6 tiles → navigate to `/category/:id`)
- **✨ CultureFlow Picks** event list
- **Messages icon** with unread badge → `/messages`

### Reels Feed (`/reels`)
- Vertical scroll-snap feed with full-screen event cards
- Save, Plan, Map, Share action rail
- Logo tap shuffles feed + toast notification
- For You / Nearby tab filter

### Map (`/map`)
- SVG Taipei map with pan gestures (5px threshold)
- Event pins with animated pulse on selection
- Category chips + Free-only quick filter
- **Enhanced filter sheet**: category multi-select, price multi-select, time single-select, distance 1–10km
- **Active filter badge count** on filter button
- Layers popover (Standard / Minimal / Heatmap)
- Recenter FAB
- EventPeek card on pin tap → EventDetail

### Event Detail (`/event/:id`)
- Hero image, back + share buttons
- LogisticsCapsule (distance, MRT stops, price)
- Tags, description, host row
- Heart (save) + Add to Plan CTA — pinned above scroll
- **Share sheet** wired: Send to friend (opens friend picker) / Copy link / Instagram Story

### Explore by Category (`/category/:id`)
- Hero gradient + emoji + title matching selected vibe
- Horizontal snap carousel of filtered events
- Filtered event list (by filterCat / filterVibe)

### My Plan (`/plan`)
- Planned events section
- Saved events section

### Profile (`/me`)
- Avatar, archetype badge, stats (Explored / Saved / Planned)
- Quote card
- **Friends card**: stacked avatars → `/friends`
- **Following card**: `12 venues · 8 hosts` → `/following`
- Settings list rows

### Globe Language Toggle
- Globe icon replaces EN/中 text across all screens
- Popover with 🇬🇧 English / 🇹🇼 中文, checkmark, click-outside dismiss
- `dark` variant for Reels and Map overlays

### Social — Messages & Chats
- `/messages`: pinned group chats (📌 Active plans) + direct messages
- `/messages/:chatId`: iMessage-style chat with:
  - Inline event card bubbles (tap → EventDetail)
  - Text send with Enter key support
  - "+" attachment menu → Share event picker / Location / Photo
  - Unread count clears on open
- Friend picker: send any event to a friend → navigates to their DM thread

### Social — Friends & Following
- `/friends`: scrollable friend list with avatar, relationship, shared plan count, message shortcut
- `/following`: venues (12) and hosts (8) with follow status

### Mock Data
- 8 events across Taipei (festivals, markets, live, exhibition)
- 8 friends with colored letter avatars
- 5 chat threads (2 group, 3 DM) with realistic bilingual messages + inline event shares
- 20 followed venues/hosts

---

## In Progress / Next

- [ ] Onboarding flow (persona quiz → preference setup)
- [ ] Real event search with filters applied on server
- [ ] Push notifications for saved events going live
- [ ] Event RSVP + attendee list
- [ ] Group plan coordination (voting on events in chat)
- [ ] Map clustering for dense event areas
- [ ] Dark mode
- [ ] Offline support / PWA
