# FocusForest — Frontend Integration API Guide

**Backend:** `https://focusforest-backend.onrender.com`  
**Base path:** `/api/v1` (all endpoints except `/health` and `/dev/*`)  
**Status:** 89/89 Postman tests passing — all endpoints verified live  
**Version:** 1.0 · April 2026

---

## 0. Agent Rules — Read Before Any API Call

| Rule | Detail |
|------|--------|
| **AUTH** | All requests (except signup/login) use httpOnly cookie automatically. Use Axios with `withCredentials: true`. NEVER `localStorage`. NEVER `Authorization: Bearer` headers — cookie-only. |
| **SCORE ENGINE** | NEVER compute stage progress on the client. `POST /sessions` returns `tree.stageProgress`, `tree.stage`, `tree.glowLevel`. Display these values only. |
| **DEDUP** | Always generate `clientSessionId = crypto.randomUUID()` before starting a timer. If `POST /sessions` returns `409 DUPLICATE_SESSION`, treat as success — already counted. |
| **BASE URL** | Dev (Vite proxy): `/api/v1`. Prod: `https://focusforest-backend.onrender.com/api/v1`. Use relative paths in dev so cookies are not blocked by Secure/SameSite flags. |

### Axios Client Setup

```ts
// src/api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',          // Vite proxy in dev
  withCredentials: true,        // REQUIRED — sends httpOnly cookie on every request
  headers: { 'Content-Type': 'application/json' },
});

export default client;
```

```ts
// vite.config.ts — strips Secure/SameSite on localhost
server: {
  proxy: {
    '/api': {
      target: 'https://focusforest-backend.onrender.com',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### Error Response Envelope

Every error (4xx/5xx) returns this shape. Always check `error.code` in switch/case logic.

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable description."
  }
}
```

| HTTP Status | Error Code | Meaning |
|-------------|-----------|---------|
| 400 | `VALIDATION_ERROR` | Request body failed Zod schema |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT cookie |
| 403 | `FORBIDDEN` | Authenticated but not permitted |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `DUPLICATE_SESSION` | clientSessionId already processed — treat as success |
| 409 | `ALREADY_MEMBER` | User is already in this group |
| 409 | `EMAIL_EXISTS` | Email already registered |
| 403 | `GROUP_FULL` | Group has reached 5-member cap |
| 404 | `INVALID_INVITE_CODE` | Invite code not found or expired |

---

## 1. Health Check

### `GET /health`
No auth required. Use to verify backend is awake (Render free tier — UptimeRobot pings every 5 min).

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-05T10:30:00.000Z"
}
```

---

## 2. Auth

### `POST /api/v1/auth/signup` — Public

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "Test1234!",
  "name": "Abhishek",
  "utcOffset": 330
}
```
> `utcOffset` = `new Date().getTimezoneOffset() * -1` — auto-detect in browser, never ask user

**Response 201:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Abhishek",
    "avatarUrl": null,
    "utcOffset": 330
  }
}
```
> Sets `sb-access-token` + `sb-refresh-token` as httpOnly cookies automatically.

**Errors:** `400 VALIDATION_ERROR` · `409 EMAIL_EXISTS`

---

### `POST /api/v1/auth/login` — Public

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "Test1234!"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Abhishek",
    "avatarUrl": null
  }
}
```
> Cookie is what matters for all subsequent requests. `accessToken` in body is redundant — ignore it.

**Errors:** `400 VALIDATION_ERROR` · `401 INVALID_CREDENTIALS`

---

### `GET /api/v1/auth/me` — 🔒

Returns authenticated user profile. **Call on app mount to check auth state.**

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Abhishek",
  "avatarUrl": null,
  "utcOffset": 330,
  "isPrivate": false,
  "createdAt": "2026-03-01T00:00:00.000Z"
}
```
> Returns `401 UNAUTHORIZED` if no valid cookie → redirect to `/login`.

---

### `POST /api/v1/auth/logout` — 🔒

No request body. Clears both auth cookies.

**Response 200:** `{ "message": "Logged out" }`

---

### `PATCH /api/v1/auth/profile` — 🔒

All fields optional.

**Request body:**
```json
{
  "name": "Abhishek",
  "avatarUrl": null,
  "isPrivate": true
}
```
> `isPrivate: true` hides user from global solo leaderboard. Does not affect group leaderboards.

**Response 200:** Full updated user object (same shape as `GET /auth/me`)

**Errors:** `400 VALIDATION_ERROR` · `404 NOT_FOUND`

---

## 3. Sessions

### `POST /api/v1/sessions` — 🔒

> **CRITICAL:** Score engine runs server-side only. Client sends raw data, displays computed result. NEVER send or compute `stageProgress` on the client.

**Request body:**
```json
{
  "variant": "classic",
  "focusMinutes": 25,
  "taskText": "Finish Chapter 4",
  "taskStatus": "completed",
  "clientSessionId": "uuid-v4"
}
```

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `variant` | string | `sprint` `classic` `deep_work` `flow` `custom` | Required |
| `focusMinutes` | integer | 1–240 | Required |
| `taskText` | string | max 200 chars | Optional — omit entirely if no task |
| `taskStatus` | string | `completed` `carried` `none` | Required |
| `clientSessionId` | string (UUID) | `crypto.randomUUID()` | Required — generate BEFORE starting timer |

**Response 200:**
```json
{
  "tree": {
    "stage": 2,
    "glowLevel": 3,
    "stageProgress": 2.5,
    "totalSessions": 3,
    "sessionsWithTask": 2
  },
  "streak": {
    "currentStreak": 5
  }
}
```

**Score engine reference** (server computes — display result only):

| Variant | Minutes | taskStatus | stageProgress |
|---------|---------|-----------|---------------|
| classic | 25 | completed | 1.5 |
| classic | 25 | none / carried | 1.0 |
| sprint | 15 | completed | 0.9 |
| sprint | 15 | none / carried | 0.6 |
| deep_work | 50 | completed | 3.0 |
| deep_work | 50 | none / carried | 2.0 |
| flow | 90 | completed | 5.4 |
| flow | 90 | none / carried | 3.6 |
| custom | N | completed | (N/25) × 1.5 |
| custom | N | none / carried | N/25 |

**Errors:** `400 VALIDATION_ERROR` · `409 DUPLICATE_SESSION` (treat as success — do not retry)

**Implementation pattern:**
```ts
const clientSessionId = crypto.randomUUID(); // generate BEFORE timer starts

try {
  const res = await client.post('/sessions', {
    variant, focusMinutes, taskText, taskStatus, clientSessionId
  });
  setTree(res.data.tree);
  setStreak(res.data.streak.currentStreak);
  queryClient.invalidateQueries(['trees', 'today']);
} catch (err) {
  if (err.response?.data?.error?.code === 'DUPLICATE_SESSION') {
    return; // already counted — silent success
  }
  throw err;
}
```

---

### `GET /api/v1/sessions` — 🔒

**Query params (all optional):**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `startDate` | YYYY-MM-DD | `2026-03-01` | Filter from date (inclusive) |
| `endDate` | YYYY-MM-DD | `2026-03-31` | Filter to date (inclusive) |
| `limit` | number | `50` | Default 50, max 200 |
| `offset` | number | `0` | Pagination offset |

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "variant": "classic",
      "focusMinutes": 25,
      "taskText": "Finish Chapter 4",
      "taskStatus": "completed",
      "stageProgress": 1.5,
      "createdAt": "2026-03-10T14:30:00.000Z"
    }
  ],
  "total": 42
}
```

---

## 4. Trees & Calendar

### `GET /api/v1/trees/today` — 🔒

Returns today's live tree state. Uses user's `utcOffset` to determine "today".

**Response 200:**
```json
{
  "date": "2026-04-05",
  "stage": 2,
  "glowLevel": 2,
  "totalSessions": 2,
  "sessionsWithTask": 2,
  "isBare": false,
  "finalisedAt": null
}
```

> - `stage 0` + `isBare: false` = Seed state (no sessions yet today — show 🌰)
> - `isBare: true` = past day with 0 sessions — show bare soil (`#5C3D2E`)
> - `finalisedAt: null` = active today; ISO string = past day locked at midnight
> - Refetch after every successful `POST /sessions` — `queryClient.invalidateQueries(['trees', 'today'])`

---

### `GET /api/v1/trees/calendar` — 🔒

**Query params (optional):**

| Param | Type | Notes |
|-------|------|-------|
| `month` | 1–12 | Requires `year` if set |
| `year` | YYYY | |

**Response 200:**
```json
{
  "trees": [
    {
      "date": "2026-03-10",
      "stage": 4,
      "glowLevel": 4,
      "totalSessions": 4,
      "sessionsWithTask": 4,
      "isBare": false,
      "finalisedAt": "2026-03-11T00:00:00.000Z"
    }
  ]
}
```
> Only days with session data are included. Gaps = no activity (future or missed days not in array).

---

### `GET /api/v1/trees/week/:weekId` — 🔒

**Param:** `weekId` format `YYYY-Www` (ISO week) — e.g. `2026-W12`, `2026-W01`

**Response 200:**
```json
{
  "weekId": "2026-W12",
  "startDate": "2026-03-16",
  "endDate": "2026-03-22",
  "complete": true,
  "days": [
    {
      "date": "2026-03-16",
      "stage": 4,
      "glowLevel": 3,
      "isBare": false
    }
  ]
}
```
> `days` always has exactly 7 items (Mon–Sun). `complete: true` = all 7 days had at least 1 session.

**Week ID helper:**
```ts
export const getCurrentWeekId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const week = Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
};
// Output: '2026-W14'
```

---

## 5. Groups

### `POST /api/v1/groups` — 🔒

**Request body:**
```json
{ "name": "Study Squad" }
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "Study Squad",
  "inviteCode": "XK7P2Q",
  "memberCount": 1,
  "createdAt": "2026-04-05T00:00:00.000Z"
}
```
> Display `inviteCode` prominently — user must share it to add members.

---

### `GET /api/v1/groups/:id` — 🔒

Caller must be a member. Returns full group info.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Study Squad",
  "inviteCode": "XK7P2Q",
  "memberCount": 3,
  "adminUserId": "uuid",
  "members": [
    {
      "userId": "uuid",
      "name": "Alice",
      "avatarUrl": null,
      "currentStreak": 7,
      "joinedAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "forestStats": {
    "totalCompletedTrees": 42
  },
  "createdAt": "2026-03-01T00:00:00.000Z"
}
```

**Errors:** `403 FORBIDDEN` (not a member) · `404 NOT_FOUND`

---

### `GET /api/v1/groups/:id/calendar` — 🔒

Group accountability view. Same `month`/`year` query params as `/trees/calendar`.

**Response 200:**
```json
{
  "days": [
    {
      "date": "2026-03-10",
      "members": [
        {
          "userId": "uuid",
          "name": "Alice",
          "stage": 4,
          "totalSessions": 4,
          "currentStreak": 7
        }
      ]
    }
  ]
}
```
> Only days with at least 1 member session are included. Missing days = no one studied.

---

### `POST /api/v1/groups/join` — 🔒

**Request body:**
```json
{ "inviteCode": "XK7P2Q" }
```
> Case-insensitive — server upcases automatically.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Study Squad",
  "memberCount": 4
}
```

**Errors:** `404 INVALID_INVITE_CODE` · `409 ALREADY_MEMBER` · `403 GROUP_FULL`

---

### `DELETE /api/v1/groups/:id/members/:userId` — 🔒

Two uses:
- **Leave group (self):** pass own `userId` — any member can do this
- **Remove member (admin only):** pass another member's `userId` — requires caller to be group admin

**Response 200:** `{ "message": "Member removed" }`

**Errors:** `403 FORBIDDEN` (not admin when removing others) · `404 NOT_FOUND`

---

## 6. Leaderboard

### `GET /api/v1/leaderboard/solo` — 🔒

**Query params:**

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `scope` | `global` \| `none` | `global` | `global` = all public users. `none` = empty (for privacy mode UI) |
| `page` | number | `1` | Pagination |
| `limit` | number | `20` | Max 50 |

**Response 200:**
```json
{
  "scope": "global",
  "page": 1,
  "total": 500,
  "entries": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "Alice",
      "avatarUrl": null,
      "totalTrees": 120,
      "currentStreak": 30
    }
  ]
}
```
> Users with `isPrivate: true` are excluded from global scope.

---

### `GET /api/v1/leaderboard/groups` — 🔒

Same query params as solo. Groups ranked by sum of all members' completed trees.

**Response 200:**
```json
{
  "scope": "global",
  "page": 1,
  "total": 100,
  "entries": [
    {
      "rank": 1,
      "groupId": "uuid",
      "name": "Study Squad",
      "totalTrees": 320,
      "memberCount": 5
    }
  ]
}
```

---

## 7. Dev Tools

### `POST /dev/midnight-reset` — No auth

> **DEV ONLY.** Manually triggers the midnight cron for the current user. Use to test streak logic and day-boundary behaviour without waiting for real midnight.

No request body.

**Response 200:**
```json
{
  "ok": true,
  "message": "Midnight reset triggered for current timezone batch"
}
```

---

## 8. Frontend Integration Patterns

### Auth Store (Zustand)

```ts
import { create } from 'zustand';
import client from '@/api/client';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      const res = await client.get('/auth/me');
      set({ user: res.data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false }); // 401 → not logged in
    }
  },

  login: async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password });
    set({ user: res.data.user });
  },

  logout: async () => {
    await client.post('/auth/logout');
    set({ user: null });
  },
}));
```

### React Query Hooks

```ts
// useTreeToday.ts
export const useTreeToday = () =>
  useQuery({
    queryKey: ['trees', 'today'],
    queryFn: () => client.get('/trees/today').then(r => r.data),
    staleTime: 30_000,
  });

// useWeekData.ts
export const useWeekData = (weekId: string) =>
  useQuery({
    queryKey: ['trees', 'week', weekId],
    queryFn: () => client.get(`/trees/week/${weekId}`).then(r => r.data),
  });

// useCalendar.ts
export const useCalendar = (month: number, year: number) =>
  useQuery({
    queryKey: ['trees', 'calendar', month, year],
    queryFn: () =>
      client.get('/trees/calendar', { params: { month, year } }).then(r => r.data),
  });

// useSessions.ts
export const useSessions = (filters = {}) =>
  useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => client.get('/sessions', { params: filters }).then(r => r.data),
  });

// useLeaderboard.ts
export const useLeaderboard = (type: 'solo' | 'groups', scope = 'global', page = 1) =>
  useQuery({
    queryKey: ['leaderboard', type, scope, page],
    queryFn: () =>
      client.get(`/leaderboard/${type}`, { params: { scope, page } }).then(r => r.data),
  });

// useGroupData.ts
export const useGroupData = (id: string) =>
  useQuery({
    queryKey: ['group', id],
    queryFn: () => client.get(`/groups/${id}`).then(r => r.data),
    enabled: !!id,
  });
```

### Tree Visual Display Logic

```ts
const STAGE_EMOJIS = ['🌰', '🌱', '🌿', '🌳', '🌲'];

const getGlowStyle = (glowLevel: number): string => {
  const glows = [
    '',                                      // 0 — no glow
    'drop-shadow(0 0 2px #F9C74F)',           // 1 — slight shimmer
    'drop-shadow(0 0 4px #F9C74F)',           // 2 — faint glow
    'drop-shadow(0 0 8px #F9C74F)',           // 3 — strong glow
    'drop-shadow(0 0 12px #F9C74F)',          // 4 — full golden
  ];
  return glows[glowLevel] ?? '';
};

// Rendering rules:
// isBare: true           → show soil bg (#5C3D2E), no tree emoji
// isBare: false, stage 0 → show 🌰 (seed — no sessions yet today)
// isBare: false, stage 1+ → STAGE_EMOJIS[stage] + getGlowStyle(glowLevel)
```

---

## 9. Quick Reference

### All Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Server health check |
| POST | `/api/v1/auth/signup` | None | Create account |
| POST | `/api/v1/auth/login` | None | Login |
| GET | `/api/v1/auth/me` | 🔒 | Current user profile |
| POST | `/api/v1/auth/logout` | 🔒 | Logout |
| PATCH | `/api/v1/auth/profile` | 🔒 | Update name / privacy |
| POST | `/api/v1/sessions` | 🔒 | Submit completed session |
| GET | `/api/v1/sessions` | 🔒 | Session history |
| GET | `/api/v1/trees/today` | 🔒 | Today's live tree |
| GET | `/api/v1/trees/calendar` | 🔒 | All daily trees |
| GET | `/api/v1/trees/week/:weekId` | 🔒 | 7-day week data |
| POST | `/api/v1/groups` | 🔒 | Create group |
| POST | `/api/v1/groups/join` | 🔒 | Join via invite code |
| GET | `/api/v1/groups/:id` | 🔒 | Group details + members |
| GET | `/api/v1/groups/:id/calendar` | 🔒 | Group accountability calendar |
| DELETE | `/api/v1/groups/:id/members/:userId` | 🔒 | Remove member / leave group |
| GET | `/api/v1/leaderboard/solo` | 🔒 | Solo rankings |
| GET | `/api/v1/leaderboard/groups` | 🔒 | Group rankings |
| POST | `/dev/midnight-reset` | None | Dev: trigger midnight cron |

### Tree Stage Reference

| Stage | Name | Emoji | Cumulative Points |
|-------|------|-------|-------------------|
| 0 | Seed | 🌰 | 0.0 |
| 1 | Sprout | 🌱 | 1.0 |
| 2 | Sapling | 🌿 | 2.0 |
| 3 | Young Tree | 🌳 | 3.0 |
| 4 | Full Tree | 🌲 | 4.0 |

### Glow Level Reference

| glowLevel | CSS Filter | Condition |
|-----------|-----------|-----------|
| 0 | none | 0% tasks completed |
| 1 | `drop-shadow(0 0 2px #F9C74F)` | 1–24% tasks completed |
| 2 | `drop-shadow(0 0 4px #F9C74F)` | 25–49% tasks completed |
| 3 | `drop-shadow(0 0 8px #F9C74F)` | 50–74% tasks completed |
| 4 | `drop-shadow(0 0 12px #F9C74F)` | 75–100% tasks completed |

### Color Palette

| CSS Variable | Hex | Use For |
|---|---|---|
| `--color-forest-dark` | `#0D1F0F` | Page background |
| `--color-forest-mid` | `#1A3A1C` | Cards, modals, panels |
| `--color-leaf` | `#4CAF50` | Buttons, active states, links |
| `--color-gold` | `#F9C74F` | Golden tree glow, streak counts |
| `--color-soil` | `#5C3D2E` | Bare soil — missed day cells |
| `--color-text-primary` | `#E8F5E9` | Main text on dark bg |
| `--color-text-muted` | `#81C784` | Secondary labels, timestamps |
| `--color-error` | `#EF5350` | Validation errors |

---

*🌲 FocusForest API Guide — 89/89 Postman tests passing — v1.0 April 2026*
