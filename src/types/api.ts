/**
 * API Response Types
 * Shared types for API responses used throughout the application
 */

// Re-export commonly used types from index.ts
export type {
  User,
  DailyTree,
  TreeStage,
  GlowLevel,
  WeekData,
  Session,
  SessionVariant,
  TaskStatus,
  CreateSessionBody,
  CreateSessionResponse,
  Group,
  GroupDetails,
  GroupMember,
  GroupStats,
  GroupMemberStatus,
  LeaderboardEntry,
  GroupLeaderboardEntry,
  StatsSummary,
  VariantConfig,
} from './index';

import type {
  User,
  DailyTree,
  TreeStage,
  GlowLevel,
  WeekData,
  Session,
  Group,
  GroupDetails,
  GroupStats,
  GroupMemberStatus,
  LeaderboardEntry,
  GroupLeaderboardEntry,
  StatsSummary,
} from './index';

// API Error Response
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// Auth API Responses
export interface LoginResponse {
  user: User;
}

export interface SignupResponse {
  user: User;
}

export interface MeResponse extends User {}

// Tree API Responses
export interface TreeTodayResponse extends DailyTree {}

export interface TreeCalendarResponse {
  trees: DailyTree[];
}

export interface TreeWeekResponse extends WeekData {}

// Session API Responses
export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

export interface SessionStartResponse {
  sessionId: string;
  startedAt: string;
}

export interface SessionCompleteResponse {
  tree: {
    stage: TreeStage;
    glowLevel: GlowLevel;
    stageProgress: number;
  };
  streak: {
    currentStreak: number;
  };
}

// Group API Responses
export interface GroupListResponse {
  groups: Group[];
}

export interface GroupCreateResponse {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupJoinResponse {
  id: string;
  name: string;
  memberCount: number;
}

export interface GroupDetailsResponse extends GroupDetails {}

export interface GroupStatsResponse extends GroupStats {}

export interface GroupMemberStatusResponse {
  members: GroupMemberStatus[];
}

// Leaderboard API Responses
export interface LeaderboardResponse {
  scope: 'global' | 'none';
  page: number;
  total: number;
  entries: LeaderboardEntry[];
}

export interface GroupLeaderboardResponse {
  scope: 'global' | 'none';
  page: number;
  total: number;
  entries: GroupLeaderboardEntry[];
}

// Stats API Responses
export interface StatsSummaryResponse extends StatsSummary {}
