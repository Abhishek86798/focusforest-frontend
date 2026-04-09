import { useQuery } from '@tanstack/react-query';
import { treeApi, sessionApi, leaderboardApi, statsApi, groupApi, preferencesApi } from '../api';

/** Fetch today's live tree — auto-refreshes every 30 seconds during timer */
export function useTreeToday() {
  return useQuery({
    queryKey: ['trees', 'today'],
    queryFn: treeApi.today,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Fetch calendar data for a given month */
export function useTreeCalendar(month?: number, year?: number) {
  return useQuery({
    queryKey: ['trees', 'calendar', year, month],
    queryFn: () => treeApi.calendar(month, year),
    staleTime: 5 * 60_000,
  });
}

/** Fetch week data for a given weekId (YYYY-Www format) */
export function useWeekData(weekId: string) {
  return useQuery({
    queryKey: ['trees', 'week', weekId],
    queryFn: () => treeApi.week(weekId),
    staleTime: 60_000,
  });
}

/** Fetch session history — optionally filtered by date range and limit */
export function useSessions(filters?: { startDate?: string; endDate?: string; limit?: number }) {
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => sessionApi.list(filters?.startDate, filters?.endDate, filters?.limit),
    staleTime: 60_000,
  });
}

/** Fetch solo leaderboard */
export function useLeaderboardSolo(scope: 'global' | 'none' = 'global', page = 1) {
  return useQuery({
    queryKey: ['leaderboard', 'solo', scope, page],
    queryFn: () => leaderboardApi.solo(scope, page),
    staleTime: 60_000,
  });
}

/** Fetch groups leaderboard */
export function useLeaderboardGroups(scope: 'global' | 'none' = 'global', page = 1) {
  return useQuery({
    queryKey: ['leaderboard', 'groups', scope, page],
    queryFn: () => leaderboardApi.groups(scope, page),
    staleTime: 60_000,
  });
}

/** Generic leaderboard hook for both types */
export function useLeaderboard(
  type: 'solo' | 'groups',
  scope: 'global' | 'none' = 'global',
  page = 1
) {
  return useQuery({
    queryKey: ['leaderboard', type, scope, page],
    queryFn: () =>
      type === 'solo'
        ? leaderboardApi.solo(scope, page)
        : leaderboardApi.groups(scope, page) as any,
    staleTime: 60_000,
  });
}

/** Fetch user stats summary */
export function useStatsSummary() {
  return useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: statsApi.summary,
    staleTime: 60_000,
  });
}

/**
 * Fetch current streak — always fresh from /stats/streak.
 * Do NOT read streak from user.currentStreak in auth store — it is stale.
 */
export function useStreak() {
  return useQuery({
    queryKey: ['stats', 'streak'],
    queryFn: statsApi.streak,
    staleTime: 30_000,  // refresh more frequently — streak matters
  });
}

/** Fetch user timer preferences (selectedVariant, lastTaskText) */
export function useUserPreferences() {
  return useQuery({
    queryKey: ['user', 'preferences'],
    queryFn: preferencesApi.get,
    staleTime: 5 * 60_000,
  });
}

// ── Groups ────────────────────────────────────────────────────────────────────

/** Fetch all groups for the current user */
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: groupApi.list,
    staleTime: 30_000,
  });
}

/** Fetch group details */
export function useGroupDetails(groupId: string | null) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupApi.get(groupId!),
    enabled: !!groupId,
    staleTime: 30_000,
  });
}

/** Fetch group stats */
export function useGroupStats(groupId: string | null) {
  return useQuery({
    queryKey: ['group', groupId, 'stats'],
    queryFn: () => groupApi.stats(groupId!),
    enabled: !!groupId,
    staleTime: 60_000,
  });
}

/** Fetch group member status */
export function useGroupMemberStatus(groupId: string | null) {
  return useQuery({
    queryKey: ['group', groupId, 'status'],
    queryFn: () => groupApi.memberStatus(groupId!),
    enabled: !!groupId,
    staleTime: 30_000,
    refetchInterval: 30_000, // refresh every 30s for live member status
  });
}
