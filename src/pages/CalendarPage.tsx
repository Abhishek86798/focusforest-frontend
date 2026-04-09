import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTreeCalendar, useWeekData, useStatsSummary } from '../hooks/useForestData';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const DARK = '#1A1A1A';
const DARK2 = '#1A1C1C';
const GREEN = '#006D37';
const WHITE = '#FFFFFF';
const SUPER_WHITE = '#FAFAFA';
const BG = '#F2F2F2';
const SHADOW = `4px 4px 0px 0px ${DARK}`;
const MUTED = '#3D4A3E';

// ─── Heatmap data generation ────────────────────────────────────────────────────
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function cellColor(stage: number): string {
  if (stage === 0) return 'transparent';
  // stage 1 = 25%, 2 = 50%, 3 = 75%, 4 = 100%
  const alphas = [0.25, 0.5, 0.75, 1];
  return `rgba(0, 109, 55, ${alphas[Math.min(stage - 1, 3)]})`;
}

// ─── Focus Grid Component ───────────────────────────────────────────────────────
function FocusGrid({ year, isMobile, heatmapData }: { year: number; isMobile: boolean; heatmapData: (number | null)[][] }) {
  return (
    <div
      style={{
        background: SUPER_WHITE,
        border: `2px solid ${DARK}`,
        boxShadow: SHADOW,
        padding: isMobile ? '20px 16px' : '32px 32px 28px',
        position: 'relative',
        overflowX: 'auto',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '16px' : '20px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '18px' : '24px', color: DARK }}>
          Focus Grid
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '16px' : '20px', color: DARK }}>
          {year}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0', minWidth: isMobile ? '600px' : 'auto' }}>
        {/* Day labels column */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '20px', paddingRight: '10px', gap: '3px' }}>
          {Array.from({ length: 7 }).map((_, i) => {
            let dayLabel = '';
            if (i === 1) dayLabel = 'MON';
            if (i === 2) dayLabel = 'TUE';
            if (i === 5) dayLabel = 'FRI';

            return (
              <span key={i} style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? '9px' : '11px',
                textTransform: 'uppercase',
                color: MUTED,
                lineHeight: '1',
                height: isMobile ? '10px' : '14px',
                display: 'flex',
                alignItems: 'center',
              }}>
                {dayLabel}
              </span>
            );
          })}
        </div>

        {/* Grid area */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginBottom: '6px', paddingLeft: '2px' }}>
            {MONTHS.map((month, mi) => (
              <div key={month} style={{ flex: `${mi === 1 ? 3.5 : 4.5}`, minWidth: 0 }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? '8px' : '11px',
                  textTransform: 'uppercase',
                  color: MUTED,
                }}>
                  {month}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '8px' }}>
            {heatmapData.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: isMobile ? '2px' : '3px' }}>
                {row.map((stage, wi) => (
                  <div
                    key={wi}
                    title={stage !== null ? `Stage ${stage}` : 'No data'}
                    style={{
                      width: isMobile ? '10px' : '14px',
                      height: isMobile ? '10px' : '14px',
                      flexShrink: 0,
                      background: stage !== null ? cellColor(stage) : 'transparent',
                      border: stage === null || stage === 0 ? `1px solid rgba(26,26,26,0.2)` : 'none',
                      borderRadius: '2px',
                      cursor: 'default',
                      transition: 'opacity 0.15s',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, isMobile }: { label: string; value: string; isMobile: boolean }) {
  return (
    <div style={{
      flex: '1 1 0',
      background: WHITE,
      border: `2px solid ${DARK}`,
      boxShadow: SHADOW,
      padding: isMobile ? '20px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: isMobile ? '120px' : '190px',
      minWidth: isMobile ? '140px' : 'auto',
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '10px' : '16px',
        lineHeight: '1em',
        textTransform: 'uppercase',
        color: MUTED,
        display: 'block',
        textAlign: 'center',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '32px' : '60px',
        lineHeight: '1em',
        color: DARK2,
        display: 'block',
        textAlign: 'center',
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Monthly Efforts ────────────────────────────────────────────────────────────
function MonthlyEfforts({ isMobile, currentMonth, currentYear }: { isMobile: boolean; currentMonth: number; currentYear: number }) {
  // Compute ISO 8601 week IDs for the current month
  const getISOWeekId = (date: Date): string => {
    const thursday = new Date(date);
    thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
    const jan4 = new Date(thursday.getFullYear(), 0, 4);
    const jan4Monday = new Date(jan4);
    jan4Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const weekNumber = Math.floor((thursday.getTime() - jan4Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return `${thursday.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  };

  const getWeekIdsForMonth = (month: number, year: number): string[] => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const weeks = new Set<string>();
    const current = new Date(firstDay);
    while (current <= lastDay) {
      weeks.add(getISOWeekId(current));
      current.setDate(current.getDate() + 7);
    }
    return Array.from(weeks).sort();
  };

  const weekIds = getWeekIdsForMonth(currentMonth, currentYear);
  
  // Fetch week data for each week — hooks must be called unconditionally at top level,
  // so we call exactly 6 (max weeks in a month) and slice what we need
  const w0 = useWeekData(weekIds[0] ?? '');
  const w1 = useWeekData(weekIds[1] ?? '');
  const w2 = useWeekData(weekIds[2] ?? '');
  const w3 = useWeekData(weekIds[3] ?? '');
  const w4 = useWeekData(weekIds[4] ?? '');
  const w5 = useWeekData(weekIds[5] ?? '');
  const weekQueries = [w0, w1, w2, w3, w4, w5].slice(0, weekIds.length);

  
  return (
    <div style={{
      background: WHITE,
      border: `2px solid ${DARK}`,
      boxShadow: SHADOW,
      padding: isMobile ? '20px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '24px',
    }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '18px' : '24px',
        textTransform: 'uppercase',
        color: DARK2,
        letterSpacing: '0.04em',
      }}>
        Monthly Efforts
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {weekQueries.map((query, i) => {
          const weekData = query.data;
          const weekLabel = `Week ${i + 1}`;
          
          // Calculate summary
          let totalSessions = 0;
          let treesCompleted = 0;
          
          if (weekData?.days) {
            weekData.days.forEach(day => {
              totalSessions += day.totalSessions || 0;
              if (day.stage === 4) treesCompleted++;
            });
          }
          
          const summary = weekData 
            ? `You completed ${totalSessions} session${totalSessions !== 1 ? 's' : ''} and helped grow ${treesCompleted} tree${treesCompleted !== 1 ? 's' : ''}!`
            : 'Loading...';
          
          return (
            <div
              key={weekIds[i]}
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '12px' : '16px 16px',
                border: `1px solid ${DARK}`,
                borderBottom: i < weekQueries.length - 1 ? 'none' : `1px solid ${DARK}`,
                background: WHITE,
                gap: isMobile ? '8px' : '16px',
                transition: 'background 0.15s',
              }}
            >
              {/* Week label */}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: isMobile ? '12px' : '14px',
                color: DARK2,
                flexShrink: 0,
                width: isMobile ? 'auto' : '60px',
              }}>
                {weekLabel}
              </span>

              {/* Summary */}
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: isMobile ? '12px' : '14px',
                color: DARK2,
                flex: 1,
                textAlign: isMobile ? 'left' : 'center',
              }}>
                {summary}
              </span>

              {/* View button */}
              <button
                style={{
                  flexShrink: 0,
                  background: GREEN,
                  border: 'none',
                  borderRadius: '2px',
                  padding: isMobile ? '6px 12px' : '6px 14px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? '10px' : '11px',
                  textTransform: 'uppercase',
                  color: SUPER_WHITE,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                  transition: 'opacity 0.15s, transform 0.1s',
                  alignSelf: isMobile ? 'flex-end' : 'auto',
                }}
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
type Category = 'solo' | 'groups';

export default function CalendarPage() {
  const [category, setCategory] = useState<Category>('solo');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const isMobile = useIsMobile();
  
  // Fetch calendar data (all trees for the year)
  const { data: calendarData } = useTreeCalendar();
  const trees = calendarData?.trees || [];
  
  // Fetch stats summary
  const { data: stats } = useStatsSummary();
  
  // Build heatmap matrix (7 rows x 53 columns) from tree data
  const heatmapData = useMemo(() => {
    const matrix: (number | null)[][] = Array.from({ length: 7 }, () => Array(53).fill(null));
    const yearStart = new Date(currentYear, 0, 1);
    const yearStartDay = yearStart.getDay(); // 0(Sun) - 6(Sat)
    
    trees.forEach(tree => {
      const treeDate = new Date(tree.date);
      if (treeDate.getFullYear() === currentYear) {
        const diffTime = treeDate.getTime() - yearStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const dayOfWeek = treeDate.getDay();
        const weekIndex = Math.floor((diffDays + yearStartDay) / 7);
        
        if (weekIndex >= 0 && weekIndex < 53 && dayOfWeek >= 0 && dayOfWeek < 7) {
          // Use stage for coloring: 0 (seed/bare) to 4 (full tree)
          matrix[dayOfWeek][weekIndex] = tree.isBare ? 0 : tree.stage;
        }
      }
    });
    
    return matrix;
  }, [trees, currentYear]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="calendar" />}

      <main style={{
        marginLeft: isMobile ? 0 : '101px',
        flex: 1,
        padding: isMobile ? '20px 16px 100px' : '73px 110px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '24px' : '40px',
      }}>

        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '8px',
          }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: DARK,
              margin: 0,
            }}>
              Calendar
            </h1>
          </div>
        )}

        {/* ── Category toggle ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? '12px' : '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: DARK,
          }}>
            Category
          </span>
          <div style={{
            display: 'flex',
            border: `1px solid ${DARK}`,
            background: SUPER_WHITE,
          }}>
            {(['solo', 'groups'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: isMobile ? '8px 24px' : '8px 32px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? '12px' : '14px',
                  textTransform: 'capitalize',
                  border: 'none',
                  cursor: 'pointer',
                  background: category === cat ? GREEN : 'transparent',
                  color: category === cat ? SUPER_WHITE : DARK,
                  opacity: category === cat ? 1 : 0.5,
                  transition: 'background 0.2s, color 0.2s, opacity 0.2s',
                  boxShadow: category === cat ? `2px 2px 0px rgba(0,0,0,0.2)` : 'none',
                }}
              >
                {cat === 'solo' ? 'Solo' : 'Groups'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Focus Grid (GitHub-style heatmap) ── */}
        {category === 'solo' ? (
          <FocusGrid year={currentYear} isMobile={isMobile} heatmapData={heatmapData} />
        ) : (
          <div style={{
            background: SUPER_WHITE,
            border: `2px solid ${DARK}`,
            boxShadow: SHADOW,
            padding: isMobile ? '40px 20px' : '80px 40px',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: isMobile ? '14px' : '16px',
              color: MUTED,
            }}>
              Join a group to see group calendar
            </span>
          </div>
        )}

        {/* ── Yearly stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '29px',
        }}>
          <StatCard label="Total Minutes" value={stats?.totalMinutes?.toString() ?? '--'} isMobile={isMobile} />
          <StatCard label="Trees Completed" value={stats?.treesCompleted?.toString() ?? '--'} isMobile={isMobile} />
          <StatCard label="Task Completion" value={stats ? `${Math.round(stats.taskCompletionRate * 100)}%` : '--'} isMobile={isMobile} />
          <StatCard label="Sessions" value={stats?.sessions?.toString() ?? '--'} isMobile={isMobile} />
        </div>

        {/* ── Monthly Efforts ── */}
        <MonthlyEfforts isMobile={isMobile} currentMonth={currentMonth} currentYear={currentYear} />
      </main>

      {isMobile && <MobileBottomNav activePage="calendar" />}
    </div>
  );
}
