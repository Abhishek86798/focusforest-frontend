import apiClient from './client';
import type {
  User,
  DailyTree,
  WeekData,
  Session,
  CreateSessionBody,
  CreateSessionResponse,
  Group,
  GroupDetails,
  GroupStats,
  GroupMemberStatus,
  LeaderboardEntry,
  GroupLeaderboardEntry,
  StatsSummary,
  SessionVariant,
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

  /** Update user profile (name, isPrivate, utcOffset, default_variant) */
  updateProfile: (data: { name?: string; isPrivate?: boolean; utcOffset?: number; default_variant?: string }) =>
    apiClient.patch<User>('/auth/profile', data).then(r => r.data),

  /** Upload user avatar */
  uploadAvatar: async (formData: FormData) => {
    const response = await apiClient.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ── User Preferences ──────────────────────────────────────────────────────────

export interface UserPreferences {
  selectedVariant: string;
  lastTaskText: string | null;
}

export const preferencesApi = {
  /** Get user timer preferences */
  get: () =>
    apiClient.get<UserPreferences>('/user/preferences').then(r => r.data),

  /** Update timer preference (selectedVariant, etc.) */
  update: (data: Partial<UserPreferences>) =>
    apiClient.patch<UserPreferences>('/user/preferences', data).then(r => r.data),
};

export const timerApi = {
  /** Get available timer variants */
  variants: () => apiClient.get<SessionVariant[]>('/timer/variants').then(r => r.data),
};

// ── Trees & Calendar ──────────────────────────────────────────────────────────

export const treeApi = {
  /** Get today's live tree state */
  today: () => apiClient.get<DailyTree>('/trees/today').then(r => r.data),

  /** Get calendar data for a given month */
  calendar: (month?: number, year?: number) =>
    apiClient
      .get<{ trees: DailyTree[] }>('/trees/calendar', { params: month && year ? { month, year } : {} })
      .then(r => r.data),

  /** Get all 7 days of a specific week by weekId */
  week: (weekId: string) =>
    apiClient.get<WeekData>(`/trees/week/${weekId}`).then(r => r.data),
};

// ── Sessions ──────────────────────────────────────────────────────────────────

export const sessionApi = {
  /** Start an immersive session with live tracking */
  start: (body: { variant: string; focusMinutes: number; taskText?: string | null; clientSessionId: string }) =>
    apiClient.post<{ sessionId: string; expectedEndAt: string }>('/sessions/start', body).then(r => r.data),

  /** Complete an active session */
  complete: (sessionId: string, taskStatus: 'completed' | 'carried' | 'none') =>
    apiClient.post<CreateSessionResponse>(`/sessions/${sessionId}/complete`, { taskStatus }).then(r => r.data),

  /** Abandon an active session — POST /sessions/:id/abandon */
  abandon: (sessionId: string) =>
    apiClient.post<{ message: string }>(`/sessions/${sessionId}/abandon`).then(r => r.data),

  /** Submit a completed Pomodoro session (legacy instant submit) */
  create: (body: CreateSessionBody) =>
    apiClient.post<CreateSessionResponse>('/sessions', body).then(r => r.data),

  /** Get session history (optional date filter + limit) */
  list: (startDate?: string, endDate?: string, limit?: number) =>
    apiClient
      .get<{ sessions: Session[]; total: number }>('/sessions', {
        params: { ...(startDate && { startDate }), ...(endDate && { endDate }), ...(limit && { limit }) },
      })
      .then(r => r.data),
};

// ── Groups ────────────────────────────────────────────────────────────────────

export const groupApi = {
  /** Get all groups for the current user */
  list: () =>
    apiClient.get<{ groups: Group[] }>('/groups').then(r => r.data),

  /** Create a new group */
  create: (name: string) =>
    apiClient.post<Group>('/groups', { name }).then(r => r.data),

  /** Join a group by invite code */
  join: (inviteCode: string) =>
    apiClient.post<Group>('/groups/join', { inviteCode }).then(r => r.data),

  /** Get group details + members + stats */
  get: (groupId: string) =>
    apiClient.get<GroupDetails>(`/groups/${groupId}`).then(r => r.data),

  /** Get group stats */
  stats: (groupId: string) =>
    apiClient.get<GroupStats>(`/groups/${groupId}/stats`).then(r => r.data),

  /** Get group member status */
  memberStatus: (groupId: string) =>
    apiClient.get<{ members: GroupMemberStatus[] }>(`/groups/${groupId}/members/status`).then(r => r.data),

  /** Get group calendar */
  calendar: (groupId: string, month?: number, year?: number) =>
    apiClient
      .get<{ days: any[] }>(`/groups/${groupId}/calendar`, { params: month && year ? { month, year } : {} })
      .then(r => r.data),

  /** Delete a group (admin only) */
  delete: (groupId: string) =>
    apiClient.delete(`/groups/${groupId}`),

  /** Leave or remove a member from a group */
  removeMember: (groupId: string, userId: string) =>
    apiClient.delete(`/groups/${groupId}/members/${userId}`),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardApi = {
  /** Solo leaderboard */
  solo: (scope: 'global' | 'none' = 'global', page = 1) =>
    apiClient
      .get<{ scope: string; page: number; total: number; entries: LeaderboardEntry[] }>(
        '/leaderboard/solo',
        { params: { scope, page, limit: 20 } }
      )
      .then(r => r.data),

  /** Groups leaderboard */
  groups: (scope: 'global' | 'none' = 'global', page = 1) =>
    apiClient
      .get<{ scope: string; page: number; total: number; entries: GroupLeaderboardEntry[] }>(
        '/leaderboard/groups',
        { params: { scope, page, limit: 20 } }
      )
      .then(r => r.data),
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export const statsApi = {
  /** Get user stats summary */
  summary: () =>
    apiClient.get<StatsSummary>('/stats/summary').then(r => r.data),

  /** Get current streak data — always fresh, not from auth store */
  streak: () =>
    apiClient.get<StreakData>('/stats/streak').then(r => r.data),
};
