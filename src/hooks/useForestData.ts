import { useQuery } from '@tanstack/react-query';
import { treeApi, sessionApi } from '../api';

/** Fetch today's live tree — auto-refreshes every 30 seconds during timer */
export function useTreeToday() {
  return useQuery({
    queryKey: ['tree', 'today'],
    queryFn: treeApi.today,
    staleTime: 30_000,    // 30 seconds
    refetchInterval: 60_000, // background refresh every 1 minute
  });
}

/** Fetch calendar data for a given month */
export function useTreeCalendar(month: number, year: number) {
  return useQuery({
    queryKey: ['tree', 'calendar', year, month],
    queryFn: () => treeApi.calendar(month, year),
    staleTime: 5 * 60_000, // 5 minutes — calendar doesn't change often
  });
}

/** Fetch session history — optionally filtered by date range */
export function useSessions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['sessions', startDate, endDate],
    queryFn: () => sessionApi.list(startDate, endDate),
    staleTime: 60_000,
  });
}
