import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useStatsSummary, useStreak, useSessions, useWeekData } from '../hooks/useForestData';
import { getCurrentWeekId } from '../utils';
import { getTreeForVariant } from '../utils/variantMapping';

// ─── Design tokens ────────────────────────────────────────────────────────────
const DARK = '#1A1A1A';
const WHITE = '#FFFFFF';
const SUPER_WHITE = '#FAFAFA';
const GREEN = '#006D37';
const BG = '#F2F2F2';
const SHADOW = `4px 4px 0px 0px ${DARK}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

type Outcome = 'SUCCESS' | 'WITHERED' | 'ABANDONED';

function StatCard({
  label, value, highlighted = false, isMobile = false,
}: { label: string; value: string; highlighted?: boolean; isMobile?: boolean }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        height: isMobile ? '120px' : '190px',
        minWidth: isMobile ? '0' : 'auto',
        background: highlighted ? GREEN : WHITE,
        border: `2px solid ${DARK}`,
        boxShadow: SHADOW,
        borderRadius: '0px',
        padding: isMobile ? '16px' : '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '9px' : '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: '1.33em',
          color: highlighted ? 'rgba(255,255,255,0.8)' : '#3D4A3E',
          display: 'block',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '32px' : '60px',
          lineHeight: '1em',
          color: highlighted ? WHITE : DARK,
          display: 'block',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SkeletonCard({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        height: isMobile ? '120px' : '190px',
        background: '#E8E8E8',
        border: `2px solid ${DARK}`,
        borderRadius: '0px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function TreeSvg({ color = GREEN, size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L18 10H14L18 17H13V22H11V17H6L10 10H6L12 2Z" fill={color} />
    </svg>
  );
}

function OutcomeBadge({ outcome, isMobile }: { outcome: Outcome; isMobile: boolean }) {
  const isSuccess = outcome === 'SUCCESS';
  const isAbandoned = outcome === 'ABANDONED';
  const bg = isSuccess ? '#2ECC71' : isAbandoned ? '#FFF3CD' : '#FFDAD6';
  const color = isSuccess ? '#005027' : isAbandoned ? '#856404' : '#93000A';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: isMobile ? '0 4px' : '0 8px',
        background: bg,
        border: `${isMobile ? '1px' : '2px'} solid ${DARK}`,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 900,
        fontSize: isMobile ? '8px' : '10px',
        lineHeight: isMobile ? '1.8em' : '2em',
        textTransform: 'uppercase',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {outcome}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StatsDashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // ── Live API data ─────────────────────────────────────────────────────────
  const currentWeekId = getCurrentWeekId();

  const { data: stats, isLoading: statsLoading, isError: statsError } = useStatsSummary();
  const { data: streakData, isLoading: streakLoading } = useStreak();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({ limit: 20 });
  const { data: weekData, isLoading: weekLoading } = useWeekData(currentWeekId);

  if (statsError) {
    toast.error('Failed to load stats. Please refresh.');
  }

  const sessions = sessionsData?.sessions || [];
  const currentStreak = streakData?.currentStreak ?? 0;

  // Stat card values — from /stats/summary (authoritative)
  const totalMinutes = stats?.totalMinutes ?? 0;
  const treesCompleted = stats?.treesCompleted ?? 0;
  const totalSessionsCount = stats?.sessions ?? 0;
  const taskCompletionRate = stats?.taskCompletionRate
    ? Math.round(stats.taskCompletionRate * 100)
    : 0;

  // Week grid — from /trees/week/:weekId
  const weekDays = weekData?.days || [];
  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Week date range label from API response
  const weekRangeLabel = weekData
    ? (() => {
        const start = new Date(weekData.startDate);
        const end = new Date(weekData.endDate);
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${fmt(start)} – ${fmt(end)}`;
      })()
    : '—';

  // Today's date string for "today" detection
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {/* Pulse animation for skeletons */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {!isMobile && <Sidebar activePage="stats" />}

      <main
        style={{
          marginLeft: isMobile ? 0 : '101px',
          flex: 1,
          padding: isMobile ? '20px 16px 100px' : '73px 111px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '20px' : '32px',
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '8px' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '20px', color: DARK, margin: 0 }}>
              Stats Dashboard
            </h1>
          </div>
        )}

        {/* ── Top row: Streak + Stats grid ── */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '40px', alignItems: 'stretch' }}>

          {/* ─ Streak Card ─ */}
          <div
            style={{
              width: isMobile ? '100%' : '549px',
              height: isMobile ? 'auto' : '464px',
              minHeight: isMobile ? '200px' : 'auto',
              background: SUPER_WHITE,
              border: `2px solid ${DARK}`,
              boxShadow: SHADOW,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: isMobile ? '24px' : '52px 57px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '20px' : '30px', lineHeight: '1.276em', color: DARK }}>
                Your Streak
              </span>
              <svg width={isMobile ? '24' : '36.5'} height={isMobile ? '24' : '36.5'} viewBox="0 0 40 40" fill="none">
                <path d="M20 37C23.98 37 27.79 35.42 30.6 32.62C33.41 29.81 35 25.99 35 22C35 17.5 32.5 13.25 29 11C29.5 13.5 28.5 16 26.5 17.5C26.5 14.5 25 12 22 10C22 13.5 19.5 16 17.5 17.5C16 19 15 20.75 15 23C15 24.99 15.79 26.9 17.17 28.32C18.55 29.73 20.42 30.5 22 30.5" fill="#FF6B35"/>
                <path d="M20 37C22.39 37 24.68 36.05 26.36 34.36C28.05 32.68 29 30.39 29 28C29 25.75 27.5 23.5 26.5 22C26.5 24.5 25 25.75 22.75 26.5C23.5 24.25 22.75 22 20 20C20 22.5 18.5 24 17 26C16.25 26.75 15 28.35 15 30C15 31.99 15.79 33.9 17.17 35.32C18.55 36.47 19 37 20 37" fill="#FFD700"/>
              </svg>
            </div>
            <div>
              {streakLoading ? (
                <div style={{ height: isMobile ? '96px' : '256px', background: '#E8E8E8', animation: 'pulse 1.5s ease-in-out infinite', borderRadius: '4px' }} />
              ) : (
                <>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '48px' : '128px', lineHeight: '1em', letterSpacing: isMobile ? '-2px' : '-6px', textTransform: 'uppercase', color: DARK, display: 'block' }}>
                    {currentStreak} DAY
                  </span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '48px' : '128px', lineHeight: '1em', letterSpacing: isMobile ? '-2px' : '-6px', textTransform: 'uppercase', color: DARK, display: 'block' }}>
                    STREAK
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ─ Stats grid (2×2) ─ */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: isMobile ? '12px' : '18px' }}>
            {statsLoading ? (
              <>
                <SkeletonCard isMobile={isMobile} />
                <SkeletonCard isMobile={isMobile} />
                <SkeletonCard isMobile={isMobile} />
                <SkeletonCard isMobile={isMobile} />
              </>
            ) : (
              <>
                <StatCard label="Total Minutes" value={totalMinutes.toLocaleString()} isMobile={isMobile} />
                <StatCard label="Sessions" value={totalSessionsCount.toLocaleString()} isMobile={isMobile} />
                <StatCard label="Trees Completed" value={treesCompleted.toLocaleString()} isMobile={isMobile} />
                <StatCard label="Task Completion" value={`${taskCompletionRate}%`} highlighted isMobile={isMobile} />
              </>
            )}
          </div>
        </div>

        {/* ── Weekly Tree Slots ── */}
        <div
          style={{
            background: SUPER_WHITE,
            border: `2px solid ${DARK}`,
            boxShadow: SHADOW,
            padding: isMobile ? '16px' : '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: isMobile ? '18px' : '30px', lineHeight: '1.2em', textTransform: 'uppercase', color: DARK }}>
              This Week
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: isMobile ? '12px' : '16px', lineHeight: '1.5em', color: DARK }}>
              {weekRangeLabel}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0px' }}>
            {weekLoading
              ? DAY_LABELS.map(d => (
                  <div key={d} style={{ flex: '1 1 0', minHeight: isMobile ? '100px' : '200px', background: '#E8E8E8', animation: 'pulse 1.5s ease-in-out infinite', margin: '0 1px' }} />
                ))
              : DAY_LABELS.map((dayLabel, i) => {
                  const dayData = weekDays[i];
                  const dateStr = dayData?.date || '';
                  const isPast = dateStr < todayStr;
                  const isToday = dateStr === todayStr;
                  const isFuture = dateStr > todayStr;
                  const hasTree = (dayData?.stage ?? 0) >= 1;
                  const isCompleted = (dayData?.stage ?? 0) === 4;

                  return (
                    <div
                      key={dayLabel}
                      style={{
                        flex: '1 1 0',
                        minHeight: isMobile ? '100px' : '200px',
                        background: isToday ? GREEN : SUPER_WHITE,
                        border: `2px ${isFuture ? 'dashed' : 'solid'} ${DARK}`,
                        boxShadow: isToday ? SHADOW : 'none',
                        opacity: isFuture ? 0.4 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: isMobile ? '8px' : '16px',
                        gap: isMobile ? '4px' : '8px',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: isMobile ? '8px' : '12px', textTransform: 'uppercase', lineHeight: '1.33em', color: isToday ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,26,0.6)' }}>
                        {dayLabel}
                      </span>

                      {(isPast || isToday) && hasTree && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '2px' : '6px', flex: 1, justifyContent: 'center' }}>
                          <TreeSvg color={isToday ? 'rgba(255,255,255,0.9)' : GREEN} size={isToday ? (isMobile ? 16 : 30) : (isMobile ? 14 : 25)} />
                        </div>
                      )}

                      {isFuture && <div style={{ flex: 1 }} />}

                      {/* Checkmark for completed trees (stage 4) */}
                      {!isFuture && (
                        <svg width={isMobile ? '14' : '22'} height={isMobile ? '14' : '22'} viewBox="0 0 22 22" fill="none">
                          <circle cx="11" cy="11" r="10" stroke={isToday ? 'rgba(255,255,255,0.55)' : 'rgba(26,26,26,0.25)'} strokeWidth="1.5" />
                          {isCompleted && (
                            <path d="M6.5 11L9.5 14L15.5 8" stroke={isToday ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,26,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                        </svg>
                      )}
                    </div>
                  );
                })}
          </div>
        </div>

        {/* ── Session History Log ── */}
        <div
          style={{
            background: WHITE,
            border: `2px solid ${DARK}`,
            boxShadow: SHADOW,
            padding: isMobile ? '16px' : '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '32px',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '18px' : '30px', lineHeight: '1.2em', textTransform: 'uppercase', color: DARK }}>
            Session History Log
          </span>

          <div style={{ overflowX: 'auto' }}>
            {sessionsLoading ? (
              <div style={{ height: '200px', background: '#E8E8E8', animation: 'pulse 1.5s ease-in-out infinite', borderRadius: '4px' }} />
            ) : sessions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#666', fontFamily: "'Inter', sans-serif", fontSize: '16px' }}>
                No sessions yet. Start your first focus session!
              </div>
            ) : (
              <table
                style={{
                  width: '100%',
                  minWidth: isMobile ? '500px' : 'auto',
                  borderCollapse: 'collapse',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${DARK}` }}>
                    {['DATE', 'VARIANT', 'DURATION', 'TASK', 'OUTCOME'].map(col => (
                      <th
                        key={col}
                        style={{
                          textAlign: 'left',
                          padding: isMobile ? '8px 4px' : '16px 8px 17px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          fontSize: isMobile ? '10px' : '14px',
                          lineHeight: '1.43em',
                          textTransform: 'uppercase',
                          color: DARK,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((row, i) => {
                    const dateObj = new Date(row.createdAt);
                    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const treeName = getTreeForVariant(row.variant).name;

                    // Map taskStatus → display outcome
                    let outcome: Outcome;
                    if (row.taskStatus === 'completed') outcome = 'SUCCESS';
                    else if (row.taskStatus === 'carried') outcome = 'WITHERED';
                    else outcome = 'ABANDONED';

                    return (
                      <tr
                        key={row.id || i}
                        style={{
                          borderBottom: i < sessions.length - 1 ? '1px solid #EEEEEE' : 'none',
                          transition: 'background 0.15s',
                        }}
                      >
                        <td style={{ padding: isMobile ? '12px 4px' : '24px 8px 25px', fontWeight: 500, fontSize: isMobile ? '12px' : '14px', color: DARK }}>
                          {dateStr}
                        </td>
                        <td style={{ padding: isMobile ? '12px 4px' : '20px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
                            <TreeSvg size={isMobile ? 10 : 14} color={GREEN} />
                            <span style={{ fontWeight: 500, fontSize: isMobile ? '11px' : '14px', color: DARK }}>{treeName}</span>
                          </div>
                        </td>
                        <td style={{ padding: isMobile ? '12px 4px' : '24.5px 8px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '12px' : '14px', color: DARK }}>
                          {row.focusMinutes}m
                        </td>
                        <td style={{ padding: isMobile ? '12px 4px' : '24px 8px 25px', fontWeight: 500, fontSize: isMobile ? '11px' : '14px', color: DARK }}>
                          {row.taskText || '—'}
                        </td>
                        <td style={{ padding: isMobile ? '12px 4px' : '22px 8px 23px' }}>
                          <OutcomeBadge outcome={outcome} isMobile={isMobile} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Back link */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? '12px' : '14px',
              color: DARK,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              opacity: 0.5,
              transition: 'opacity 0.2s',
            }}
          >
            ← Back to Focus
          </button>
        </div>
      </main>

      {isMobile && <MobileBottomNav activePage="stats" />}
    </div>
  );
}
