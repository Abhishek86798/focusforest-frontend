import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTreeCalendar, useWeekData, useStatsSummary } from '../hooks/useForestData';
import toast from 'react-hot-toast';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const DARK = '#1A1A1A';
const DARK2 = '#1A1C1C';
const GREEN = '#006D37';
const WHITE = '#FFFFFF';
const SUPER_WHITE = '#FAFAFA';
const BG = '#F2F2F2';
const SHADOW = `4px 4px 0px 0px ${DARK}`;
const MUTED = '#3D4A3E';

// ─── Monthly Focus Grid Component ───────────────────────────────────────────────────────
const TREE_EMOJIS = ['🌰', '🌱', '🌿', '🌳', '🌲'];
const GLOW_COLORS = ['none', 'drop-shadow(0 0 8px #F9C74F)', 'drop-shadow(0 0 12px #F9C74F)', 'drop-shadow(0 0 16px #F9C74F)', 'drop-shadow(0 0 20px #F9C74F)'];

function MonthlyFocusGrid({ month, year, onMonthChange, isMobile }: { month: number; year: number; onMonthChange: (m: number, y: number) => void; isMobile: boolean }) {
  const { data: calendarData, isLoading, isError } = useTreeCalendar(month, year);
  const trees = calendarData?.trees || [];
  
  if (isError) {
    toast.error('Failed to load calendar data. Please refresh.');
  }
  
  const handlePrev = () => {
    if (month === 1) onMonthChange(12, year - 1);
    else onMonthChange(month - 1, year);
  };
  const handleNext = () => {
    if (month === 12) onMonthChange(1, year + 1);
    else onMonthChange(month + 1, year);
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0(Sun) - 6(Sat)
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Start Mon (0) to Sun (6)

  return (
    <div className="bg-[#FAFAFA] border-2 border-[#1A1A1A] p-4 md:p-8 lg:p-[48px_80px] shadow-[4px_4px_0px_0px_#1A1A1A]">
      {/* Title row */}
      <div className="flex justify-center items-center gap-6 md:gap-12 mb-6 md:mb-10 w-full">
        <button onClick={handlePrev} className="min-h-[44px] min-w-[44px] flex items-center justify-center font-bold font-['Space_Grotesk'] border-2 border-[#1A1A1A] rounded p-2 hover:bg-gray-100 transition-colors">
          ←
        </button>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '18px' : '32px', color: DARK, textTransform: 'uppercase' }}>
          {monthName}
        </span>
        <button onClick={handleNext} className="min-h-[44px] min-w-[44px] flex items-center justify-center font-bold font-['Space_Grotesk'] border-2 border-[#1A1A1A] rounded p-2 hover:bg-gray-100 transition-colors">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4 lg:gap-6 min-w-[300px]">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
          <div key={d} className="text-center font-bold font-['Space_Grotesk'] text-[#3D4A3E] text-[10px] md:text-sm lg:text-base border-b-2 border-[#1A1A1A] pb-2 mb-2 lg:mb-4">{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} className="min-w-[40px] min-h-[40px] md:min-w-[48px] md:min-h-[48px] lg:min-w-[56px] lg:min-h-[56px] xl:min-w-[64px] xl:min-h-[64px]" />)}
        
        {isLoading ? (
          Array.from({ length: daysInMonth }).map((_, i) => (
            <div key={`skel-${i}`} className="animate-pulse bg-[#E8E8E8] aspect-square border-2 border-[#1A1A1A] min-w-[40px] min-h-[40px] md:min-w-[48px] md:min-h-[48px] lg:min-w-[56px] lg:min-h-[56px] xl:min-w-[64px] xl:min-h-[64px]" />
          ))
        ) : (
          Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const treeDay = trees.find((t: any) => t.date.startsWith(dateStr));
            
            let bg = 'transparent';
            let emoji = '';
            let filter = 'none';

            if (treeDay) {
              if (treeDay.isBare) {
                bg = '#5C3D2E';
              } else {
                emoji = TREE_EMOJIS[treeDay.stage] || '🌰';
                filter = GLOW_COLORS[treeDay.glowLevel] || 'none';
              }
            }

            return (
              <div key={i} className="aspect-square flex flex-col items-center justify-start border-2 border-[#1A1A1A] relative min-w-[40px] min-h-[40px] md:min-w-[48px] md:min-h-[48px] lg:min-w-[56px] lg:min-h-[56px] xl:min-w-[64px] xl:min-h-[64px]" style={{ background: bg }}>
                <span className="absolute top-1 left-2 font-['Inter'] font-bold text-[10px] md:text-sm" style={{ color: bg === '#5C3D2E' ? 'rgba(255,255,255,0.8)' : DARK }}>
                  {dayNum}
                </span>
                <div className="flex-1 w-full flex items-center justify-center pt-3 lg:pt-4">
                  {emoji && (
                    <span className="text-lg md:text-xl lg:text-2xl" style={{ filter, transform: 'translateY(-2px)' }}>
                      {emoji}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, isMobile }: { label: string; value: string; isMobile: boolean }) {
  return (
    <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-5 md:p-8 flex flex-col justify-between h-[120px] md:h-[190px] min-w-[140px] md:min-w-0 shadow-[4px_4px_0px_0px_#1A1A1A] flex-1">
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
    <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-[4px_4px_0px_0px_#1A1A1A]">
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
                onClick={() => toast('Detailed view coming soon!')}
                className="min-h-[44px] min-w-[44px] transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  flexShrink: 0,
                  background: GREEN,
                  border: 'none',
                  borderRadius: '4px',
                  padding: isMobile ? '6px 12px' : '6px 14px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '12px',
                  color: SUPER_WHITE,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
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
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const isMobile = useIsMobile();
  
  // Fetch stats summary
  const { data: stats, isError: isStatsError } = useStatsSummary();
  if (isStatsError) {
    toast.error('Failed to load stats. Please refresh.');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="calendar" />}

      <main className="flex-1 flex flex-col box-border ml-0 md:ml-[101px] h-screen overflow-y-auto overflow-x-hidden">
        <div className="w-full px-4 md:px-8 lg:px-12 max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto py-5 md:pt-[73px] pb-[100px] md:pb-[80px] flex flex-col gap-6 md:gap-10">

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
                className="min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: isMobile ? '8px 24px' : '8px 32px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? '12px' : '14px',
                  textTransform: 'capitalize',
                  color: category === cat ? SUPER_WHITE : DARK,
                  background: category === cat ? GREEN : 'transparent',
                  border: `1px solid ${category === cat ? GREEN : DARK}`,
                  borderRadius: '4px',
                  opacity: category === cat ? 1 : 0.5,
                }}
              >
                {cat === 'solo' ? 'Solo' : 'Groups'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Monthly Focus Grid ── */}
        {category === 'solo' ? (
          <MonthlyFocusGrid 
            month={currentMonth} 
            year={currentYear} 
            onMonthChange={(m, y) => {
              setCurrentMonth(m);
              setCurrentYear(y);
            }} 
            isMobile={isMobile} 
          />
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-7">
          <StatCard label="Total Minutes" value={stats?.totalMinutes?.toString() ?? '--'} isMobile={isMobile} />
          <StatCard label="Trees Completed" value={stats?.treesCompleted?.toString() ?? '--'} isMobile={isMobile} />
          <StatCard label="Task Completion" value={stats ? `${Math.round(stats.taskCompletionRate * 100)}%` : '--'} isMobile={isMobile} />
          <StatCard label="Sessions" value={stats?.sessions?.toString() ?? '--'} isMobile={isMobile} />
        </div>

        {/* ── Monthly Efforts ── */}
        <MonthlyEfforts isMobile={isMobile} currentMonth={currentMonth} currentYear={currentYear} />
        </div>
      </main>

      {isMobile && <MobileBottomNav activePage="calendar" />}
    </div>
  );
}
