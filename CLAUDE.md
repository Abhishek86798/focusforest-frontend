# FocusForest — CLAUDE.md (Frontend Phase)

## Project Identity

**FocusForest** is a collaborative study focus platform for college students.
Core mechanic: users grow one tree per day through Pomodoro sessions.
Every session = tree growth. Seven days = a weekly forest.
The forest is not a score — it is a living, honest record of effort.

**Backend**: Fully deployed at `https://focusforest-backend.onrender.com`
**Frontend**: React + Vite PWA (this phase)
**Developer**: Beginner developer — prefer clear, well-commented code.

---

## Tech Stack — Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP client | Axios (with withCredentials: true for httpOnly cookies) |
| State | Zustand (global) + React Query (server state) |
| PWA | vite-plugin-pwa + Workbox |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
src/
  api/           # Axios instance + all API call functions
  components/    # Reusable UI components (Button, Modal, TreeDisplay, etc.)
  pages/         # Route-level page components
  hooks/         # Custom React hooks
  stores/        # Zustand global stores
  types/         # TypeScript interfaces and types
  utils/         # Helper functions (formatters, score engine display, etc.)
  assets/        # Static assets (tree SVGs, images)
```

---

## API Configuration

**Base URL**: `https://focusforest-backend.onrender.com/api/v1`
**Auth**: JWT stored in httpOnly cookies — NEVER localStorage
**All requests**: must include `withCredentials: true` in Axios

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://focusforest-backend.onrender.com/api/v1',
  withCredentials: true, // CRITICAL — sends httpOnly cookie with every request
  headers: { 'Content-Type': 'application/json' },
});
```

---

## Backend API Endpoints (Already Built)

### Auth
- `POST /auth/signup` — `{ email, password, name, utcOffset }`
- `POST /auth/login` — `{ email, password }`
- `POST /auth/logout`
- `GET /auth/me` — returns user profile + streak

### Sessions
- `POST /sessions` — submit completed Pomodoro session
- `GET /sessions` — session history (supports `?startDate=&endDate=`)

**POST /sessions body:**
```json
{
  "variant": "classic | sprint | deep_work | flow | custom",
  "focusMinutes": 25,
  "taskText": "string | null",
  "taskStatus": "completed | carried | none",
  "clientSessionId": "uuid-v4"
}
```

**POST /sessions response:**
```json
{
  "tree": { "stage": 2, "glowLevel": 3, "stageProgress": 2.5 },
  "streak": { "currentStreak": 5 }
}
```

### Trees & Calendar
- `GET /trees/today` — today's live tree state
- `GET /trees/calendar?month=3&year=2026` — all daily trees
- `GET /trees/week/:weekId` — 7 days of a specific week

### Groups
- `POST /groups` — create group
- `POST /groups/join` — join via invite code `{ inviteCode }`
- `GET /groups/:id` — group details + members + forest stats
- `GET /groups/:id/calendar` — group calendar
- `DELETE /groups/:id/members/:userId` — leave/remove member

### Leaderboard
- `GET /leaderboard/solo?scope=global|friends&page=1`
- `GET /leaderboard/groups?scope=global|friends&page=1`

---

## Core Business Logic (DO NOT alter these rules)

### Score Engine (display only — server computes, never client)
```
stage_progress = (focus_minutes / 25) × task_multiplier
task_multiplier: completed = 1.5 | carried = 1.0 | none = 1.0
```

### Tree Stages
| Stage | Name | Emoji |
|-------|------|-------|
| 0 | Seed | 🌰 |
| 1 | Sprout | 🌱 |
| 2 | Sapling | 🌿 |
| 3 | Young Tree | 🌳 |
| 4 | Full Tree | 🌲 |

### Glow Levels (based on task completion ratio)
| Glow | Appearance |
|------|-----------|
| 4 | Full golden glow ✨ |
| 3 | Strong glow |
| 2 | Faint glow |
| 1 | Slight shimmer |
| 0 | Plain tree |

### Timer Variants
| Variant | Focus | Short Break | Long Break |
|---------|-------|-------------|------------|
| sprint | 15 min | 3 min | 10 min |
| classic | 25 min | 5 min | 20 min |
| deep_work | 50 min | 10 min | 30 min |
| flow | 90 min | 15 min | 45 min |
| custom | user-defined | user-defined | user-defined |

After 4 focus sessions → trigger long break automatically.

---

## Design System

### Color Palette (FocusForest theme)
```css
--color-forest-dark: #0d1f0f;    /* deep forest background */
--color-forest-mid: #1a3a1c;     /* card backgrounds */
--color-forest-green: #2d6a30;   /* primary green */
--color-leaf: #4caf50;           /* active/highlight green */
--color-gold: #f9c74f;           /* golden tree / streaks */
--color-gold-glow: #f8961e;      /* glow accent */
--color-soil: #5c3d2e;           /* bare soil / missed days */
--color-text-primary: #e8f5e9;   /* light text on dark bg */
--color-text-muted: #81c784;     /* muted green text */
```

### Typography
- Display / headings: `Playfair Display` or `Cormorant Garamond` — feel organic, literary
- Body: `DM Sans` or `Nunito` — readable, friendly
- Monospace (timers): `JetBrains Mono` — precision feel

### Design Principles
- Dark forest theme — backgrounds are deep dark green, NOT black or grey
- Trees are the emotional centrepiece — always largest element on screen
- Bare soil days (#5c3d2e) feel different from empty/null — it's not absence, it's a missed day
- Golden glow on trees uses CSS box-shadow or filter: drop-shadow with gold
- Timer digits are large, centered, monospaced — they own the screen during focus
- NO generic purple gradients. NO Inter font. NO white backgrounds.

---

## Page Architecture

### Route Map
```
/                     → redirect to /dashboard if auth'd, else /login
/login                → Login page
/signup               → Signup page
/dashboard            → Main dashboard (today's tree + week + session history)
/session              → Active timer screen
/calendar             → Solo calendar view (grid + monthly)
/profile              → User profile + all-time forest
/leaderboard          → Solo + group leaderboard
/groups               → Groups list
/groups/:id           → Group dashboard
/groups/:id/calendar  → Group calendar view
```

### Key Components
- `<TreeDisplay stage={0-4} glowLevel={0-4} size="sm|md|lg" />` — renders tree emoji + glow CSS
- `<TimerRing progress={0-1} />` — circular countdown ring
- `<CalendarGrid trees={DailyTree[]} />` — GitHub-style contribution grid
- `<WeekBox week={Week} onTap={() => {}} />` — one week row with 7 tree icons + badge
- `<SessionPopup task={string} onDone={() => {}} onCarry={() => {}} />` — post-session modal
- `<StreakBadge count={number} />` — flame icon + streak number

---

## Auth Flow

1. User signs up / logs in → JWT stored in httpOnly cookie automatically by backend
2. On app load → call `GET /auth/me` to check auth status
3. If 401 → redirect to `/login`
4. If success → store user in Zustand `useAuthStore`
5. NEVER store JWT in localStorage or sessionStorage

```typescript
// Pattern for protected routes
const { user, isLoading } = useAuthStore();
if (isLoading) return <LoadingScreen />;
if (!user) return <Navigate to="/login" />;
```

---

## PWA Requirements

- Timer must work fully offline (session stored in IndexedDB, synced on reconnect)
- `vite-plugin-pwa` with Workbox for service worker
- Manifest: name "FocusForest", theme_color matches `--color-forest-dark`
- Icons: 192x192 and 512x512 tree icon

---

## Coding Conventions

- All components: functional, TypeScript, named exports
- No `any` types — always define proper interfaces
- API functions live in `src/api/` — never fetch directly in components
- Custom hooks for all data fetching: `useTreeToday()`, `useSessions()`, etc.
- Error states and loading states always handled — never leave user with blank screen
- `clientSessionId` for POST /sessions: generate with `crypto.randomUUID()`
- UTC offset detection: `new Date().getTimezoneOffset() * -1` (in minutes)

---

## Development Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Current Status

**Backend**: Complete + deployed ✅
**Frontend**: Starting now

Build order:
1. Project setup + auth pages
2. Dashboard + timer core loop
3. Calendar views
4. Groups + leaderboard
5. PWA + offline mode

---

## Context for AI IDE Sessions

Always paste this block at the top when starting a new feature session:

```
I am building the frontend for FocusForest — a collaborative study focus platform.
Backend is deployed at https://focusforest-backend.onrender.com/api/v1
Stack: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query + Framer Motion
Auth: JWT in httpOnly cookies — withCredentials: true on all Axios requests
Score engine is SERVER-SIDE only — client only displays values received from API
Current task: [DESCRIBE THE SPECIFIC FEATURE]
Do NOT build: [LIST WHAT YOU ARE NOT DOING THIS SESSION]
```
