// ─────────────────────────────────────────────────────────────────────────────
// FocusForest — TypeScript interfaces
// These mirror the backend API response shapes exactly.
// ─────────────────────────────────────────────────────────────────────────────

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  utcOffset: number;           // minutes from UTC, e.g. IST = +330
  currentStreak: number;       // consecutive days with ≥1 session
  totalFocusMinutes: number;
  totalTrees: number;          // all-time completed trees (stage 4)
}

// ── Tree & Calendar ────────────────────────────────────────────────────────────
export type TreeStage = 0 | 1 | 2 | 3 | 4;
export type GlowLevel = 0 | 1 | 2 | 3 | 4;

export interface DailyTree {
  id: string;
  date: string;                // ISO date string e.g. "2026-04-02"
  stage: TreeStage;
  glowLevel: GlowLevel;
  stageProgress: number;       // 0.0–4.0, how close to next stage
  totalSessions: number;
  sessionsWithTask: number;
  isBare: boolean;             // true = day passed with zero sessions (missed day)
  finalisedAt: string | null;  // ISO datetime when day was locked in
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export type SessionVariant = 'sprint' | 'classic' | 'deep_work' | 'flow' | 'custom';
export type TaskStatus = 'completed' | 'carried' | 'none';

export interface Session {
  id: string;
  variant: SessionVariant;
  focusMinutes: number;
  taskText: string | null;
  taskStatus: TaskStatus;
  stageProgress: number;       // server-computed, display only
  createdAt: string;
}

// POST /sessions request body
export interface CreateSessionBody {
  variant: SessionVariant;
  focusMinutes: number;
  taskText: string | null;
  taskStatus: TaskStatus;
  clientSessionId: string;     // crypto.randomUUID() — prevents duplicate submissions
}

// POST /sessions response
export interface CreateSessionResponse {
  tree: {
    stage: TreeStage;
    glowLevel: GlowLevel;
    stageProgress: number;
  };
  streak: {
    currentStreak: number;
  };
}

// ── Groups ────────────────────────────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  members: GroupMember[];
  totalTrees: number;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalTrees: number;
  currentStreak: number;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalTrees: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

export interface GroupLeaderboardEntry {
  rank: number;
  groupId: string;
  groupName: string;
  memberCount: number;
  totalTrees: number;
  topMemberName: string;
}

// ── Timer Variant config (client-side display reference) ──────────────────────
export interface VariantConfig {
  id: SessionVariant;
  label: string;
  emoji: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  description: string;
}

export const VARIANT_CONFIGS: VariantConfig[] = [
  {
    id: 'sprint',
    label: 'Sprint',
    emoji: '⚡',
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    sessionsBeforeLongBreak: 4,
    description: '15 min focus · 3 min break',
  },
  {
    id: 'classic',
    label: 'Classic',
    emoji: '🍅',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 20,
    sessionsBeforeLongBreak: 4,
    description: '25 min focus · 5 min break',
  },
  {
    id: 'deep_work',
    label: 'Deep Work',
    emoji: '🧠',
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 4,
    description: '50 min focus · 10 min break',
  },
  {
    id: 'flow',
    label: 'Flow',
    emoji: '🌊',
    focusMinutes: 90,
    shortBreakMinutes: 15,
    longBreakMinutes: 45,
    sessionsBeforeLongBreak: 4,
    description: '90 min focus · 15 min break',
  },
  {
    id: 'custom',
    label: 'Custom',
    emoji: '⚙️',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 20,
    sessionsBeforeLongBreak: 4,
    description: 'Set your own times',
  },
];
