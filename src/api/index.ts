import { apiClient } from './client';
import type {
  User,
  DailyTree,
  Session,
  CreateSessionBody,
  CreateSessionResponse,
  Group,
  LeaderboardEntry,
  GroupLeaderboardEntry,
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  /** Get currently authenticated user. Returns null on 401. */
  me: () => apiClient.get<User>('/auth/me').then(r => r.data),

  /** Log in with email + password */
  login: (email: string, password: string) =>
    apiClient.post<{ user: User; accessToken: string }>('/auth/login', { email, password }).then(r => r.data),

  /** Sign up — utcOffset auto-detected from browser */
  signup: (payload: { name: string; email: string; password: string; utcOffset: number }) =>
    apiClient.post<{ user: User; accessToken: string }>('/auth/signup', payload).then(r => r.data),

  /** Log out — clears httpOnly cookie on backend */
  logout: () => apiClient.post('/auth/logout'),
};

// ── Trees & Calendar ──────────────────────────────────────────────────────────

export const treeApi = {
  /** Get today's live tree state */
  today: () => apiClient.get<DailyTree>('/trees/today').then(r => r.data),

  /** Get calendar data for a given month */
  calendar: (month: number, year: number) =>
    apiClient
      .get<DailyTree[]>('/trees/calendar', { params: { month, year } })
      .then(r => r.data),

  /** Get all 7 days of a specific week by weekId */
  week: (weekId: string) =>
    apiClient.get<DailyTree[]>(`/trees/week/${weekId}`).then(r => r.data),
};

// ── Sessions ──────────────────────────────────────────────────────────────────

export const sessionApi = {
  /** Submit a completed Pomodoro session */
  create: (body: CreateSessionBody) =>
    apiClient.post<CreateSessionResponse>('/sessions', body).then(r => r.data),

  /** Get session history (optional date filter) */
  list: (startDate?: string, endDate?: string) =>
    apiClient
      .get<Session[]>('/sessions', { params: { startDate, endDate } })
      .then(r => r.data),
};

// ── Groups ────────────────────────────────────────────────────────────────────

export const groupApi = {
  /** Create a new group */
  create: (name: string) =>
    apiClient.post<Group>('/groups', { name }).then(r => r.data),

  /** Join a group by invite code */
  join: (inviteCode: string) =>
    apiClient.post<Group>('/groups/join', { inviteCode }).then(r => r.data),

  /** Get group details + members + stats */
  get: (groupId: string) =>
    apiClient.get<Group>(`/groups/${groupId}`).then(r => r.data),

  /** Get group calendar */
  calendar: (groupId: string, month: number, year: number) =>
    apiClient
      .get<DailyTree[]>(`/groups/${groupId}/calendar`, { params: { month, year } })
      .then(r => r.data),

  /** Leave or remove a member from a group */
  removeMember: (groupId: string, userId: string) =>
    apiClient.delete(`/groups/${groupId}/members/${userId}`),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardApi = {
  /** Solo leaderboard */
  solo: (scope: 'global' | 'friends' = 'global', page = 1) =>
    apiClient
      .get<LeaderboardEntry[]>('/leaderboard/solo', { params: { scope, page } })
      .then(r => r.data),

  /** Groups leaderboard */
  groups: (scope: 'global' | 'friends' = 'global', page = 1) =>
    apiClient
      .get<GroupLeaderboardEntry[]>('/leaderboard/groups', { params: { scope, page } })
      .then(r => r.data),
};
