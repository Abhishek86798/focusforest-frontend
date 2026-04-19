import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string;
  stage: number;
  glowLevel: number;
  totalSessions: number;
  sessionsWithTask: number;
  isBare: boolean;
  finalisedAt: string | null;
}

export interface Session {
  id: string;
  variant: string;
  focusMinutes: number;
  taskText: string | null;
  taskStatus: string;
  stageProgress: number;
  createdAt: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const DARK = '#1A1A1A';

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MonthlyEfforts() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'grid' | 'weekly'>('grid');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Fetch Calendar Data
  const { data: calendarDataObj, isLoading: calendarLoading, isError: calendarError, refetch: refetchCalendar } = useQuery({
    queryKey: ['calendar', currentMonth, currentYear],
    queryFn: async () => {
      const res = await apiClient.get('/trees/calendar', {
        params: { month: currentMonth, year: currentYear }
      });
      return res.data;
    }
  });

  // Fetch Sessions Data
  const { data: sessionsDataObj, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useQuery({
    queryKey: ['sessions', currentMonth, currentYear],
    queryFn: async () => {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const res = await apiClient.get('/sessions', {
        params: { startDate, endDate, limit: 1000 } // Get all for the month
      });
      return res.data;
    }
  });

  const calendarData: CalendarDay[] = calendarDataObj?.trees || [];
  const sessionsData: Session[] = sessionsDataObj?.sessions || [];

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    setSelectedDay(null); // Reset selection
  };

  const isLoading = calendarLoading || sessionsLoading;
  const isError = calendarError || sessionsError;

  return (
    <div className="w-full flex flex-col pt-8 pb-4">
      {/* Container with top border to match section styling */}
      <div className="w-full max-w-lg md:max-w-none flex flex-col md:border-t md:border-[${DARK}] pt-6 md:pt-8" style={{ borderColor: DARK }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '20px',
          lineHeight: '1.4em',
          textTransform: 'uppercase',
          letterSpacing: '-0.025em',
          color: DARK,
          marginBottom: '24px'
        }}>
          Monthly Efforts
        </h2>

        <div className="w-full flex flex-col gap-6 md:gap-8 bg-white md:bg-transparent">
          
          <MonthNavigator 
            currentMonth={currentMonth} 
            currentYear={currentYear} 
            onChange={handleMonthChange} 
          />

          {isError ? (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-red-200 text-red-600 rounded">
              <span className="font-['Space_Grotesk'] font-bold text-lg mb-2">Failed to load monthly data</span>
              <button 
                onClick={() => { refetchCalendar(); refetchSessions(); }}
                className="px-4 py-2 bg-[#1A1A1A] text-white font-bold rounded shadow-sm text-sm uppercase"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <StatsBar calendarData={calendarData} sessionsData={sessionsData} />
              
              <div className="flex flex-col w-full gap-4">
                {/* View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-[#006D37] text-white' : 'bg-[#FAFAFA] text-[#1A1A1A] border border-[#1A1A1A]'} 
                    font-['Space_Grotesk'] font-bold text-sm rounded-[4px] uppercase tracking-wider transition-all active:scale-[0.98] ${viewMode === 'grid' && `shadow-[2px_2px_0px_0px_#1A1A1A]`}`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`px-4 py-2 ${viewMode === 'weekly' ? 'bg-[#006D37] text-white' : 'bg-[#FAFAFA] text-[#1A1A1A] border border-[#1A1A1A]'} 
                    font-['Space_Grotesk'] font-bold text-sm rounded-[4px] uppercase tracking-wider transition-all active:scale-[0.98] ${viewMode === 'weekly' && `shadow-[2px_2px_0px_0px_#1A1A1A]`}`}
                  >
                    Weekly View
                  </button>
                </div>

                {calendarData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[#1A1A1A] bg-[#FAFAFA]">
                    <span className="text-4xl mb-3">🌱</span>
                    <span className="font-['Space_Grotesk'] text-[#1A1A1A] font-bold text-lg text-center">
                      No activity this month.
                    </span>
                    <span className="font-['Inter'] text-[#666] text-sm text-center max-w-sm mt-1">
                      Start a focus session from your dashboard to plant a tree and begin growing your forest.
                    </span>
                  </div>
                ) : (
                  viewMode === 'grid' 
                    ? <CalendarGrid calendarData={calendarData} currentMonth={currentMonth} currentYear={currentYear} onSelectDay={setSelectedDay} />
                    : <WeeklyView calendarData={calendarData} currentMonth={currentMonth} currentYear={currentYear} onSelectDay={setSelectedDay} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <DayDetailPanel 
        selectedDay={selectedDay} 
        onClose={() => setSelectedDay(null)} 
        calendarData={calendarData} 
        sessionsData={sessionsData} 
      />
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function MonthNavigator({ currentMonth, currentYear, onChange }: { 
  currentMonth: number, currentYear: number, onChange: (m: number, y: number) => void 
}) {
  const dateObj = new Date(currentYear, currentMonth - 1, 1);
  const monthName = dateObj.toLocaleString('default', { month: 'long' });
  
  const goBack = () => {
    if (currentMonth === 1) onChange(12, currentYear - 1);
    else onChange(currentMonth - 1, currentYear);
  };

  const now = new Date();
  const isCurrentMonth = currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();

  const goForward = () => {
    if (isCurrentMonth) return;
    if (currentMonth === 12) onChange(1, currentYear + 1);
    else onChange(currentMonth + 1, currentYear);
  };

  const goToday = () => {
    if (isCurrentMonth) return;
    onChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="flex items-center justify-between w-full border-b border-[#1A1A1A] pb-4">
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={goBack}
          className="p-2 border-2 border-[#1A1A1A] bg-[#FAFAFA] text-[#1A1A1A] hover:bg-gray-100 active:scale-95 transition-all shadow-[2px_2px_0px_0px_#1A1A1A]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <span className="font-['Space_Grotesk'] font-bold text-xl md:text-2xl text-[#1A1A1A] min-w-[140px] text-center uppercase tracking-wide">
          {monthName} {currentYear}
        </span>

        <button 
          onClick={goForward}
          disabled={isCurrentMonth}
          className={`p-2 border-2 border-[#1A1A1A] transition-all ${isCurrentMonth ? 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed' : 'bg-[#FAFAFA] text-[#1A1A1A] hover:bg-gray-100 active:scale-95 shadow-[2px_2px_0px_0px_#1A1A1A]'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <button 
        onClick={goToday}
        disabled={isCurrentMonth}
        className={`px-4 py-2 font-['Space_Grotesk'] font-bold text-sm tracking-wider uppercase border-2 border-[#1A1A1A] transition-all 
          ${isCurrentMonth ? 'opacity-0 pointer-events-none' : 'bg-[#FAFAFA] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white shadow-[2px_2px_0px_0px_#1A1A1A]'}`}
      >
        Today
      </button>
    </div>
  );
}

function StatsBar({ calendarData, sessionsData }: { calendarData: CalendarDay[], sessionsData: Session[] }) {
  const totalFocusMinutes = sessionsData.reduce((sum, s) => sum + s.focusMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1).replace(/\.0$/, '');
  const totalSessions = sessionsData.length;
  
  const treesCompleted = calendarData.filter(d => d.stage === 4).length;
  
  const sessionsWithTask = sessionsData.filter(s => s.taskText && s.taskText.trim() !== '');
  const tasksCompleted = sessionsWithTask.filter(s => s.taskStatus === 'completed');
  const taskRate = sessionsWithTask.length > 0
    ? Math.round((tasksCompleted.length / sessionsWithTask.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      <StatCard label="Focus Hours" value={totalFocusHours} icon="🕐" />
      <StatCard label="Trees Grown" value={treesCompleted.toString()} icon="🌳" />
      <StatCard label="Sessions" value={totalSessions.toString()} icon="📋" />
      <StatCard label="Task Rate" value={`${taskRate}%`} icon="✅" />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="bg-[#FAFAFA] border border-[#1A1A1A] p-3 md:p-4 flex flex-col gap-1 md:gap-2 shadow-[2px_2px_0px_0px_#1A1A1A]">
      <div className="flex items-center gap-2">
        <span className="text-sm md:text-base">{icon}</span>
        <span className="font-['Inter'] font-semibold text-[10px] md:text-xs text-[#1A1A1A] uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </span>
      </div>
      <span className="font-['Space_Grotesk'] font-bold text-2xl md:text-3xl text-[#1A1A1A] mt-1">
        {value}
      </span>
    </div>
  );
}

function CalendarGrid({ calendarData, currentMonth, currentYear, onSelectDay }: { 
  calendarData: CalendarDay[], currentMonth: number, currentYear: number, onSelectDay: (d: string) => void 
}) {
  const days = useMemo(() => buildCalendarDays(currentMonth, currentYear), [currentMonth, currentYear]);
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#FAFAFA] border border-[#1A1A1A] p-4 shadow-[4px_4px_0px_0px_#1A1A1A] overflow-x-auto min-w-full">
      <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[300px]">
        {/* Header row */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center font-['Inter'] font-semibold text-[#666] text-[10px] md:text-xs uppercase pb-2">
            {day}
          </div>
        ))}

        {/* Days grid */}
        {days.map((dayObj, idx) => {
          if (!dayObj) return <div key={`empty-${idx}`} className="h-10 md:h-14 bg-transparent" />;
          
          const data = calendarData.find(d => d.date === dayObj.dateString);
          const isToday = dayObj.dateString === todayString;
          
          let cellColor = 'bg-[#E0E0E0]'; // empty/future
          if (data && !data.isBare && data.stage > 0) {
            const stages: Record<number, string> = {
              1: 'bg-[#A2D5A4]', // sprout
              2: 'bg-[#66B86A]', // sapling
              3: 'bg-[#2E9E35]', // young
              4: 'bg-[#006D37]', // full
            };
            cellColor = stages[data.stage] || cellColor;
          } else if (data && data.isBare) {
            cellColor = 'bg-[#8D6E63]'; // bare soil
          }

          const glowClass = (data && data.glowLevel > 0)
            ? `ring-2 ring-[#FFD700] ring-opacity-${Math.min(data.glowLevel * 25, 100)} ring-offset-1` 
            : '';
            
          const todayPulse = isToday ? 'ring-2 ring-black ring-offset-2 border-2 border-black' : 'border border-[rgba(26,26,26,0.1)]';

          const emojis = ['🌱', '🌿', '🌳', '🌳'];
          const emoji = data && data.stage > 0 && data.stage <= 4 ? emojis[data.stage - 1] : null;

          return (
            <div 
              key={dayObj.dateString}
              onClick={() => onSelectDay(dayObj.dateString)}
              className={`h-10 md:h-14 relative rounded-sm cursor-pointer hover:opacity-80 transition-all ${cellColor} ${glowClass} ${todayPulse}`}
              title={dayObj.dateString}
            >
              <span className="absolute top-1 left-1 text-[9px] md:text-[10px] font-['Space_Grotesk'] font-bold opacity-60 mix-blend-luminosity">
                {dayObj.dayNum}
              </span>
              {emoji && (
                <div className="absolute inset-0 flex items-center justify-center text-xs md:text-lg">
                  {emoji}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyView({ calendarData, currentMonth, currentYear, onSelectDay }: { 
  calendarData: CalendarDay[], currentMonth: number, currentYear: number, onSelectDay: (d: string) => void 
}) {
  const days = useMemo(() => buildCalendarDays(currentMonth, currentYear), [currentMonth, currentYear]);
  
  // Group into weeks
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-3">
      {weeks.map((week, idx) => {
        // Evaluate completion
        const isComplete = week.every(day => {
          if (!day) return true; // Empty padding days don't fail a week
          const data = calendarData.find(d => d.date === day.dateString);
          if (!data) return false; // If a day in month has no data, incomplete
          return !data.isBare && data.stage > 0;
        });

        return (
          <div key={`week-${idx}`} className="flex flex-col md:flex-row items-stretch md:items-center bg-[#FAFAFA] border border-[#1A1A1A] p-3 shadow-[2px_2px_0px_0px_#1A1A1A] gap-4">
            
            <div className="w-full md:w-32 font-['Inter'] font-semibold text-xs text-[#1A1A1A] uppercase tracking-wider text-center md:text-left pt-2 md:pt-0">
              Week {idx + 1}
            </div>

            <div className="flex flex-1 justify-between md:justify-start gap-1 md:gap-2">
              {week.map((day, j) => {
                if (!day) return <div key={`w-empty-${j}`} className="flex-1 max-w-[40px] md:max-w-[48px] h-10 md:h-12" />; // placeholder
                
                const data = calendarData.find(d => d.date === day.dateString);
                const emojis = ['🌱', '🌿', '🌳', '🌳'];
                const emoji = data && data.stage > 0 ? emojis[data.stage - 1] : null;
                
                let cellColor = data?.isBare ? 'bg-[#8D6E63]' : data && data.stage > 0 ? 'bg-[#E8F5E9] border-[#A2D5A4]' : 'bg-gray-100 border-gray-200';
                if (!data) cellColor = 'bg-gray-100 border-gray-200';

                return (
                  <div 
                    key={day.dateString}
                    onClick={() => onSelectDay(day.dateString)}
                    className={`flex-1 max-w-[40px] md:max-w-[48px] h-10 md:h-12 border rounded-sm flex items-center justify-center cursor-pointer hover:ring-2 ring-[#006D37] ring-offset-1 transition-all ${cellColor}`}
                    title={day.dateString}
                  >
                    <div className="absolute bg-[#FAFAFA] hidden md:flex text-[8px] top-[2px] right-[2px] opacity-60"></div>
                     <span className="text-[10px] font-['Space_Grotesk'] text-gray-500 mr-1 md:hidden">{day.dayNum}</span>
                     {emoji && <span className="text-sm md:text-lg">{emoji}</span>}
                  </div>
                );
              })}
            </div>

            <div className={`mt-3 md:mt-0 px-3 py-1.5 md:py-2 border-2 rounded ${isComplete ? 'border-[#006D37] bg-[#E8F5E9] text-[#006D37]' : 'border-gray-400 bg-gray-100 text-gray-600'} font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 min-w-[130px]`}>
              {isComplete ? '✅ Complete' : '⬜ Incomplete'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayDetailPanel({ selectedDay, onClose, calendarData, sessionsData }: { 
  selectedDay: string | null, onClose: () => void, calendarData: CalendarDay[], sessionsData: Session[] 
}) {
  if (!selectedDay) return null;

  const dayTree = calendarData.find(d => d.date === selectedDay);
  const daySessions = sessionsData.filter(s => s.createdAt.substring(0, 10) === selectedDay).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const stageNames: Record<number, string> = {
    0: 'Bare Soil', 1: 'Sprout', 2: 'Sapling', 3: 'Young Tree', 4: 'Full Tree'
  };
  const glowNames: Record<number, string> = {
    0: 'None', 1: 'Slight Shimmer', 2: 'Faint Glow', 3: 'Strong Glow', 4: 'Full Golden'
  };

  const dayDateObj = new Date(selectedDay + 'T00:00:00'); // local time representation
  const dateFormatted = dayDateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const totalFocus = daySessions.reduce((sum, s) => sum + s.focusMinutes, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full md:pl-10">
        <div className={`pointer-events-auto w-screen max-w-md transform transition-transform duration-300 ease-in-out sm:duration-500 translate-x-0`}>
          <div className="flex h-full flex-col overflow-y-scroll bg-white border-l-2 border-[#1A1A1A] shadow-[0_0_0_0_rgba(0,0,0,0)] md:shadow-[-8px_0px_0px_0px_#1A1A1A]">
            
            {/* Header */}
            <div className="px-5 py-6 sm:px-6 border-b-2 border-[#1A1A1A] bg-[#FAFAFA] flex items-center justify-between sticky top-0 z-10">
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                📅 {dateFormatted}
              </h2>
              <button
                type="button"
                className="rounded-md bg-white text-[#1A1A1A] hover:bg-gray-100 border-2 border-[#1A1A1A] p-1.5 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="relative mt-6 flex-1 px-5 sm:px-6 pb-12 flex flex-col gap-6">
              
              {/* Overviews */}
              <div className="bg-[#E8F5E9] border-2 border-[#006D37] rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute right-[-10px] top-[-10px] text-7xl opacity-20 transform rotate-12">🌳</div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="font-['Inter'] text-[#006D37] text-xs font-bold uppercase tracking-widest">Growth Result</span>
                  <span className="font-['Space_Grotesk'] text-[#1A1A1A] text-xl font-bold">
                    Stage: {dayTree ? stageNames[dayTree.stage] : 'Bare Soil'} {dayTree && dayTree.stage > 0 ? `(${dayTree.stage}/4)` : ''}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[#1A1A1A] text-lg font-bold">
                    ✨ Glow: {dayTree ? glowNames[dayTree.glowLevel] : 'None'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-[#FAFAFA] border border-[#1A1A1A] p-4 flex flex-col shadow-[2px_2px_0px_0px_#1A1A1A]">
                  <span className="font-['Inter'] text-[#666] text-[10px] font-bold uppercase tracking-widest">Sessions</span>
                  <span className="font-['Space_Grotesk'] text-[#1A1A1A] text-2xl font-bold">{daySessions.length}</span>
                </div>
                <div className="flex-1 bg-[#FAFAFA] border border-[#1A1A1A] p-4 flex flex-col shadow-[2px_2px_0px_0px_#1A1A1A]">
                  <span className="font-['Inter'] text-[#666] text-[10px] font-bold uppercase tracking-widest">Focus Time</span>
                  <span className="font-['Space_Grotesk'] text-[#1A1A1A] text-2xl font-bold">{totalFocus} m</span>
                </div>
              </div>

              {/* Session Timeline */}
              <div className="flex flex-col mt-4">
                <h3 className="font-['Inter'] text-[#1A1A1A] text-sm font-bold uppercase tracking-widest mb-4 border-b border-[#E0E0E0] pb-2">
                  Session Breakdown
                </h3>
                
                {daySessions.length === 0 ? (
                  <p className="text-[#666] font-['Inter'] text-sm italic py-4">No sessions recorded on this day.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {daySessions.map((session, i) => {
                      const timeStr = new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={session.id || i} className="border border-[#1A1A1A] bg-white p-3 flex flex-col gap-2 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006D37]"></div>
                          
                          <div className="flex justify-between items-center pl-2">
                            <span className="font-['Space_Grotesk'] text-[#1A1A1A] font-bold text-sm">
                              {timeStr} — <span className="capitalize">{session.variant.replace('_', ' ')}</span>
                            </span>
                            <span className="font-['Inter'] text-xs font-semibold text-[#666] px-2 py-0.5 bg-gray-100 rounded">
                              {session.focusMinutes}m
                            </span>
                          </div>
                          
                          <div className="pl-2 pt-1 border-t border-gray-100 text-sm font-['Inter']">
                            {session.taskText ? (
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[#1A1A1A] break-words line-clamp-2 leading-tight">
                                  Task: {session.taskText}
                                </span>
                                {session.taskStatus === 'completed' && <span className="shrink-0 text-[#006D37] font-bold text-xs bg-[#E8F5E9] px-1.5 py-0.5 rounded uppercase">✅ Done</span>}
                                {session.taskStatus === 'carried' && <span className="shrink-0 text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded uppercase">➡️ Carried</span>}
                                {session.taskStatus === 'none' && <span className="shrink-0 text-gray-500 font-bold text-xs bg-gray-100 px-1.5 py-0.5 rounded uppercase">Incomplete</span>}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No task set</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[88px] bg-gray-200 border border-gray-300 shadow-[2px_2px_0px_0px_#ccc]" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 border bg-gray-50 p-4 border-gray-300 shadow-[4px_4px_0px_0px_#ccc]">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="h-10 md:h-14 bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function buildCalendarDays(month: number, year: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // Sun=0, Mon=1...
  
  // Adjust for Monday start. If Sunday(0), it should be 6. If Monday(1), 0.
  const offset = (firstDay + 6) % 7;
  
  const calendarArray: ({ dateString: string, dayNum: number } | null)[] = [];
  
  // padding
  for (let i = 0; i < offset; i++) {
    calendarArray.push(null);
  }
  
  // days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarArray.push({
      dateString: `${year}-${mm}-${dd}`,
      dayNum: d
    });
  }
  
  return calendarArray;
}
