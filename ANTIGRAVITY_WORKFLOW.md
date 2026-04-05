# FocusForest — Antigravity IDE Frontend Workflow Guide

> This guide tells you exactly what to write in Antigravity's
> 250-character description box and 1200-character content box
> for every major frontend task.

---

## How Antigravity Works

- **250-char Description** = what you want (short, precise, triggers the right skill)
- **1200-char Content** = full context (paste CLAUDE.md excerpt + specific requirements)

Rule: Description names the feature. Content explains the exact spec.

---

## ── SETUP TASKS ──

### Task 1 — Initialize Vite + React + TypeScript Project

**Description (250 chars):**
```
Initialize FocusForest frontend: Vite + React 18 + TypeScript + Tailwind CSS + React Router v6 + Zustand + React Query + Framer Motion + Axios. Create folder structure: src/api, components, pages, hooks, stores, types, utils, assets.
```

**Content (1200 chars):**
```
Project: FocusForest frontend (study focus PWA for college students).
Backend deployed at https://focusforest-backend.onrender.com/api/v1

Create the project with these exact packages:
- vite + react + typescript (template)
- tailwindcss + autoprefixer + postcss
- react-router-dom v6
- zustand (global state)
- @tanstack/react-query (server state)
- framer-motion (animations)
- axios (HTTP with withCredentials: true)
- react-hook-form + zod (forms)
- lucide-react (icons)
- vite-plugin-pwa (PWA later)

Create src/api/client.ts with:
  baseURL: 'https://focusforest-backend.onrender.com/api/v1'
  withCredentials: true (JWT in httpOnly cookies — NEVER localStorage)

Create folder structure:
  src/api/ src/components/ src/pages/ src/hooks/
  src/stores/ src/types/ src/utils/ src/assets/

Add these CSS variables in index.css:
  --color-forest-dark: #0d1f0f
  --color-forest-mid: #1a3a1c
  --color-leaf: #4caf50
  --color-gold: #f9c74f
  --color-soil: #5c3d2e

Do NOT build any pages yet. Only setup.
```

---

### Task 2 — Auth Store + Protected Routes

**Description (250 chars):**
```
Build Zustand auth store and React Router protected routes for FocusForest. useAuthStore with user, isLoading, login, logout, checkAuth. ProtectedRoute component redirects to /login if unauthenticated.
```

**Content (1200 chars):**
```
Backend: https://focusforest-backend.onrender.com/api/v1
Auth uses JWT in httpOnly cookies. Never localStorage.

Build src/stores/authStore.ts (Zustand):
  State: { user: User | null, isLoading: boolean }
  Actions: login(email, password), signup(email, password, name), logout(), checkAuth()
  checkAuth() calls GET /auth/me — if 401 sets user to null
  login() calls POST /auth/login, then checkAuth() to populate user

Build src/types/index.ts with interfaces:
  User: { id, email, name, avatarUrl, utcOffset, currentStreak, totalFocusMinutes, totalTrees }
  DailyTree: { id, date, stage, glowLevel, totalSessions, sessionsWithTask, isBare, finalisedAt }
  Session: { id, variant, focusMinutes, taskText, taskStatus, stageProgress, createdAt }

Build src/components/ProtectedRoute.tsx:
  Uses useAuthStore. If isLoading → show <LoadingScreen />
  If no user → <Navigate to="/login" />
  Else → render children

Build src/App.tsx routes:
  / → redirect to /dashboard
  /login, /signup → public
  /dashboard, /session, /calendar, /profile, /leaderboard, /groups, /groups/:id → protected

Do NOT build page content yet.
```

---

## ── AUTH PAGES ──

### Task 3 — Login Page

**Description (250 chars):**
```
Build FocusForest login page. Dark forest theme (#0d1f0f background). Tree logo at top. Email + password form. Show error messages. On success redirect to /dashboard. Link to /signup. Framer Motion fade-in.
```

**Content (1200 chars):**
```
FocusForest design: dark forest theme. Background: #0d1f0f. Cards: #1a3a1c.
Primary green: #4caf50. Gold: #f9c74f. Text: #e8f5e9.
Font: Playfair Display (heading) + DM Sans (body). NO Inter, NO white backgrounds.

Login page spec:
- Full screen dark forest background with subtle noise texture
- Centered card with border: 1px solid #2d6a30, rounded-xl
- Top: 🌲 logo + "FocusForest" in Playfair Display, forest green
- Tagline: "Every minute counts. Grow your forest." in muted green
- Form: email input + password input (show/hide toggle)
- Submit button: solid leaf green, "Enter the forest"
- Error: red-tinted message below form if login fails
- Bottom link: "New here? Plant your first seed →" → /signup
- Framer Motion: card fades up on mount (y: 20 → 0, opacity: 0 → 1)

API call: POST /auth/login { email, password }
Uses useAuthStore.login() action.
On success → navigate('/dashboard')
On 401 → show "Invalid email or password"

Use React Hook Form + Zod for validation.
Email: valid email. Password: min 6 chars.

Do NOT build signup. Only login.
```

---

### Task 4 — Signup Page

**Description (250 chars):**
```
Build FocusForest signup page. Same dark forest theme as login. Fields: name, email, password, confirm password. Auto-detect UTC offset. On success go to /dashboard. Framer Motion animation.
```

**Content (1200 chars):**
```
Same visual style as login page (dark forest, #0d1f0f bg, #1a3a1c card).
FocusForest fonts: Playfair Display + DM Sans.

Signup page spec:
- Headline: "Plant Your First Seed" in Playfair Display
- Fields: Full Name, Email, Password, Confirm Password
- Password strength: show weak/good/strong indicator bar below password field
  weak = <8 chars (red), good = 8+ chars (yellow), strong = 8+ with number/special (green)
- UTC offset: auto-detect with new Date().getTimezoneOffset() * -1
  Show small text: "Your timezone: IST (+330)" — read only, just for user awareness
- Submit: "Start Growing 🌱"
- Error handling: show field-level errors + API errors
- Bottom: "Already growing? Sign in →" → /login

API call: POST /auth/signup
Body: { email, password, name, utcOffset }
utcOffset = new Date().getTimezoneOffset() * -1 (minutes from UTC)

On 201 success → navigate('/dashboard')
On 409 (email taken) → show "This email is already registered"

React Hook Form + Zod validation:
  name: min 2 chars
  email: valid email
  password: min 8 chars
  confirmPassword: must match password

Do NOT build dashboard.
```

---

## ── CORE LOOP ──

### Task 5 — Dashboard Page

**Description (250 chars):**
```
Build FocusForest dashboard. Shows: today's live tree (large, center), current streak badge, this week's 7 day slots with tree icons, weekly stats summary, Start Session button. Dark forest theme.
```

**Content (1200 chars):**
```
FocusForest dashboard — the main screen users see after login.
Theme: dark forest. Font: Playfair Display (headings) + DM Sans (body).

API calls needed:
  GET /trees/today → { date, stage, glowLevel, totalSessions, stageProgress, isBare, finalisedAt }
  GET /trees/week/:weekId → 7 day slots
  GET /auth/me → user.currentStreak, user.totalFocusMinutes

Layout (top to bottom):
1. Header: "Good morning, [name] 🌿" + streak badge (🔥 5 days)
2. TODAY'S TREE (emotional centrepiece):
   - Large tree emoji/display based on stage 0-4 and glowLevel 0-4
   - Stage names: 0=Seed🌰 1=Sprout🌱 2=Sapling🌿 3=YoungTree🌳 4=FullTree🌲
   - Gold glow (CSS filter: drop-shadow) if glowLevel > 0
   - Stage progress bar below tree showing today's progress toward stage 4
   - Sessions done today: "3 sessions today"
3. THIS WEEK: 7 small day slots (Mon-Sun), each shows stage emoji + faint glow
   - Today's slot has a white ring border
   - Bare soil days (#5c3d2e background) for missed/no-session days
4. WEEKLY STATS: focus minutes this week, sessions done, task completion rate %
5. Big button: "Start a Session →" → navigate('/session')

TreeDisplay component: takes stage(0-4) and glowLevel(0-4), renders emoji + gold drop-shadow CSS.
Framer Motion: tree bounces gently on page load (scale 0.9 → 1.0).
```

---

### Task 6 — Timer Variant Picker Modal

**Description (250 chars):**
```
Build timer variant picker modal for FocusForest. 5 options: Sprint, Classic, Deep Work, Flow, Custom. Shows focus/break times. "Always use this" checkbox. Forest theme. Framer Motion slide-up animation.
```

**Content (1200 chars):**
```
Shown when user clicks "Start Sess           ion" on dashboard.
Modal slides up from bottom (Framer Motion: y: 100% → 0).
Background: blur + dark overlay behind modal.
Card: #1a3a1c, rounded-t-3xl, padding generous.

Title: "Choose Your Focus Mode" in Playfair Display.

5 variant cards (horizontal scroll on mobile, grid on desktop):
  ⚡ Sprint    — 15 min focus | 3 min break  | 0.6 stage/session
  🍅 Classic  — 25 min focus | 5 min break  | 1.0 stage/session (DEFAULT — show badge)
  🧠 Deep Work— 50 min focus | 10 min break | 2.0 stages/session
  🌊 Flow     — 90 min focus | 15 min break | 3.6 stages/session
  ⚙️ Custom   — user sets focus + break duration manually

Each card: emoji large, name, focus/break times in small text, stage progress per session.
Selected card: border: 2px solid #4caf50, background slightly brighter.

At bottom:
  ☐ "Always use this variant" checkbox
  → "Set Task for This Session" button (goes to task-setting step)
  → "Skip Task, Just Focus" link (goes directly to timer)

State: selectedVariant, alwaysUse. Store selectedVariant in sessionStore (Zustand).
If user had previously checked "always use" → pre-select that variant and show "Continue" directly.

Do NOT build the timer yet — only this modal.
```

---

### Task 7 — Active Timer Screen

**Description (250 chars):**
```
Build FocusForest active timer page. Large circular countdown ring, task reminder at top, variant name, pause/stop controls. Switches between focus and break automatically. Dark immersive theme.
```

**Content (1200 chars):**
```
Full-screen immersive timer. No distractions. Background: #0d1f0f.
State comes from Zustand sessionStore: selectedVariant, taskText, focusMinutes.

Layout:
1. TOP: small task reminder in muted green if task was set: "📌 Finish Chapter 4 notes"
   If no task: nothing shown (no empty space)
2. VARIANT LABEL: "🍅 Classic — Focus" or "🍅 Classic — Short Break"
3. CIRCULAR RING TIMER (centrepiece):
   - SVG circle with stroke-dashoffset countdown animation
   - Inner: large JetBrains Mono timer digits "24:37"
   - Ring color: #4caf50 during focus, #f9c74f during break
   - Ring depletes clockwise as time passes
4. SESSION COUNT: "Session 2 of 4" below ring
5. CONTROLS: ⏸ Pause | ⏹ End Session (with confirm dialog)

Timer logic:
  - Uses useRef + setInterval for countdown
  - On focus timer end → show SessionPopup modal (DO NOT navigate away)
  - After popup → start break timer automatically
  - After break → increment session count, reset focus timer
  - After 4 sessions → trigger long break instead of short break

SessionPopup (inline modal):
  "Session Complete! 🎉"
  "Your task: [taskText]" (if set)
  Two buttons: ✅ Done (taskStatus: 'completed') | ↩️ Carry Forward (taskStatus: 'carried')
  No task set: just show "Nice work!" and auto-dismiss after 2s with taskStatus: 'none'

POST /sessions on every focus session end (before break starts).
Body: { variant, focusMinutes, taskText, taskStatus, clientSessionId: crypto.randomUUID() }
```

---

## ── CALENDAR ──

### Task 8 — Calendar Page (Daily Grid)

**Description (250 chars):**
```
Build FocusForest calendar page. GitHub-style contribution grid. Each cell = one day with tree emoji + glow. Bare soil for missed days. Tap a cell to see day detail panel. Monthly navigation. Dark theme.
```

**Content (1200 chars):**
```
FocusForest calendar — user's lifetime consistency record.
API: GET /trees/calendar?month=3&year=2026
Returns array of DailyTree: { date, stage, glowLevel, isBare, totalSessions }

DAILY GRID VIEW (default tab):
- GitHub contribution graph style
- Columns: Mon Tue Wed Thu Fri Sat Sun (7 columns)
- Rows: one per week (expand as months have more weeks)
- Each cell (approx 40x40px):
    stage 0 (no session today but day not over): faint seed color
    isBare = true: #5c3d2e (soil color, distinct and sad)
    stage 1-4: tree emoji + appropriate glow
- Tap any cell → slide-in panel from bottom:
    Day date in Playfair Display
    Tree visual (large)
    Sessions count, variant used, tasks set, task outcomes
    Close button

MONTHLY NAVIGATION:
- ← March 2026 → header
- Previous/next month arrows

TABS:
- "Daily Grid" (default, described above)
- "Weekly View" (shows 4 week boxes — build this as Task 9)

EMPTY STATE:
- If no data for a month: "No sessions recorded this month. Start growing 🌱"

Tree emoji mapping:
  stage 0 = 🌰, 1 = 🌱, 2 = 🌿, 3 = 🌳, 4 = 🌲
Glow: CSS filter drop-shadow with gold color, intensity based on glowLevel (0-4).

Do NOT build groups calendar or weekly view yet.
```

---

## ── GROUPS ──

### Task 9 — Groups List + Create Group

**Description (250 chars):**
```
Build FocusForest groups page. Show user's groups list. Create group form (name input → returns invite code). Join group form (6-digit code input). Max 5 members. Dark forest theme with leaf green accents.
```

**Content (1200 chars):**
```
FocusForest groups — max 5 members, persistent like WhatsApp group.
Two sections on this page: My Groups + Create/Join.

MY GROUPS LIST:
  API: Need to add — GET /groups (user's groups) — if not yet built, use GET /auth/me for group list
  Each group card:
    Group name (Playfair Display)
    Member count "3/5 members"
    Your contribution: X trees grown
    "View Group →" link → /groups/:id

CREATE GROUP section:
  Input: "Group name" (min 3 chars, max 30 chars)
  Button: "Create Group 🌲"
  API: POST /groups { name }
  Response: { id, name, inviteCode, memberCount: 1 }
  On success: show invite code in a styled box:
    "Your group is live! Share this code:"
    [ A B 3 X 9 Q ] ← large monospaced digits, tap to copy
    Auto-navigate to /groups/:id after 3 seconds

JOIN GROUP section:
  Input: 6-digit code (auto-uppercase, max 6 chars)
  Button: "Join Group"
  API: POST /groups/join { inviteCode }
  On 200: navigate to /groups/:id
  On 409 ALREADY_MEMBER: "You are already in this group"
  On 404: "Invalid invite code. Check and try again."
  On full group: "This group is full (5/5 members)"

Both sections separated by a divider "— or —"
Framer Motion: each group card animates in with stagger delay.
```

---

## ── LEADERBOARD ──

### Task 10 — Leaderboard Page

**Description (250 chars):**
```
Build FocusForest leaderboard. Solo ranking by total trees. Toggle: Global vs Friends. Shows rank, avatar, name, total trees, current streak. Current user highlighted. Dark forest theme with gold accents.
```

**Content (1200 chars):**
```
FocusForest leaderboard — ranked by total all-time completed trees.
Two tabs: Solo | Groups
Two scope toggles: Global | Friends (members across your groups)

API:
  GET /leaderboard/solo?scope=global&page=1
  GET /leaderboard/groups?scope=global&page=1

SOLO LEADERBOARD:
Each row shows:
  Rank number (1 = 🥇 2 = 🥈 3 = 🥉, rest = number)
  Avatar (initials circle if no avatar)
  Display name
  Total trees: "47 🌲"
  Current streak: "🔥 12"
  Current user row: highlighted with #2d6a30 background + left border #4caf50

Top 3 rows get special treatment:
  Rank 1: gold background tint, larger text
  Rank 2: silver tint
  Rank 3: bronze tint

SCOPE TOGGLE:
  [Global] [Friends] — pill toggle, Friends = only members across your groups
  On toggle: re-fetch with new scope param

GROUPS TAB:
  Groups ranked by total group forest size (all members all-time trees)
  Show: group name, member count, total trees, top member name

PAGINATION:
  "Load more" button at bottom if more results available (page param)
  Show 20 per page

EMPTY FRIENDS STATE:
  "Join a group to see your friends' rankings 🌿"
  Link to /groups

Framer Motion: rows stagger in from right on load.
Gold color #f9c74f for tree counts and streak numbers.
```

---

## ── QUICK REFERENCE ──

### Universal Context Block (paste at top of every session)

```
I am building the frontend for FocusForest — collaborative study focus platform.
Backend: https://focusforest-backend.onrender.com/api/v1
Stack: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query + Framer Motion + Axios
Auth: JWT in httpOnly cookies. withCredentials: true on ALL Axios calls. NEVER localStorage.
Score engine: SERVER-SIDE only. Client only displays values from API response.
Design: Dark forest theme. Colors: bg #0d1f0f, card #1a3a1c, green #4caf50, gold #f9c74f.
Fonts: Playfair Display (headings) + DM Sans (body). NO Inter. NO white backgrounds.
Current task: [REPLACE THIS]
Do NOT build: [REPLACE THIS]
```

### Score Engine Reference (for display only — never compute on client)
| Variant | Minutes | Status | Stage Progress |
|---------|---------|--------|---------------|
| classic | 25 | completed | 1.5 |
| classic | 25 | none/carried | 1.0 |
| sprint | 15 | completed | 0.9 |
| sprint | 15 | none | 0.6 |
| deep_work | 50 | completed | 3.0 |
| flow | 90 | completed | 5.4 |

### Tree Stage → Emoji Quick Map
`0=🌰 1=🌱 2=🌿 3=🌳 4=🌲`

### Common Error Codes from Backend
| Code | Meaning |
|------|---------|
| DUPLICATE_SESSION | clientSessionId already used — return 409 |
| ALREADY_MEMBER | User already in this group |
| NOT_FOUND | Group or resource doesn't exist |
| VALIDATION_ERROR | Zod validation failed on request body |
