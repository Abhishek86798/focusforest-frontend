import type { TreeStage, GlowLevel } from '../types';

// ── Tree display helpers ───────────────────────────────────────────────────────

/**
 * Maps tree stage (0-4) to its emoji representation.
 * These are display-only values — stages are computed server-side.
 */
export const STAGE_EMOJI: Record<TreeStage, string> = {
  0: '🌰',
  1: '🌱',
  2: '🌿',
  3: '🌳',
  4: '🌲',
};

export const STAGE_NAMES: Record<TreeStage, string> = {
  0: 'Seed',
  1: 'Sprout',
  2: 'Sapling',
  3: 'Young Tree',
  4: 'Full Tree',
};

/**
 * Generates a CSS filter drop-shadow for glow levels (0-4).
 * Returns empty string for glow 0 (no glow).
 */
export function glowFilter(level: GlowLevel): string {
  if (level === 0) return 'none';
  const goldIntensities = [
    '',                              // 0 — never reached here
    'drop-shadow(0 0 4px #f9c74f)',  // 1 — subtle shimmer
    'drop-shadow(0 0 8px #f9c74f)',  // 2 — faint glow
    'drop-shadow(0 0 14px #f8961e)', // 3 — strong glow
    'drop-shadow(0 0 22px #f8961e) drop-shadow(0 0 8px #f9c74f)', // 4 — full golden
  ];
  return goldIntensities[level];
}

// ── Time / date helpers ────────────────────────────────────────────────────────

/** Format seconds as MM:SS string */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Format minutes as human-readable e.g. "1h 25m" or "45m" */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Get UTC offset of local machine in minutes (e.g. IST = +330) */
export function detectUtcOffset(): number {
  return new Date().getTimezoneOffset() * -1;
}

/** Format UTC offset as string e.g. "+5:30" or "-4:00" */
export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${String(m).padStart(2, '0')}`;
}

/** Get ISO date string for today (local time) e.g. "2026-04-02" */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current week ID in YYYY-Www format (e.g. "2026-W14").
 * Uses ISO 8601: weeks start on Monday, Week 1 contains the first Thursday.
 */
export function getCurrentWeekId(): string {
  const date = new Date();
  // Copy date and set to nearest Thursday (ISO week anchor)
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  // Get Jan 4 of that year (always in Week 1 per ISO standard)
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  // Week number = floor((thursday - jan4Monday) / 7) + 1
  const jan4Monday = new Date(jan4);
  jan4Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const weekNumber = Math.floor((thursday.getTime() - jan4Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  const year = thursday.getFullYear();
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

// ── String helpers ─────────────────────────────────────────────────────────────

/** Get initials from a full name e.g. "Abhik Roy" → "AR" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}
