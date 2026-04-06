import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../stores/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '../api';
import { CreateSessionBody } from '../types';
import { useSessionStore } from '../stores/sessionStore';

// ─── Constants ────────────────────────────────────────────────────────────────

// Number of pomodoro slots to display as progress dots
const TOTAL_SESSIONS = 4;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ─── Idle Timer (frame 3-2) ────────────────────────────────────────────────

const IDLE_SIZE = 502;
const IDLE_STROKE = 6.972;
const IDLE_RADIUS = IDLE_SIZE / 2 - IDLE_STROKE / 2;
const IDLE_CIRC = 2 * Math.PI * IDLE_RADIUS;

// ─── Focus Timer (frame 64-640) ───────────────────────────────────────────

const FOCUS_SIZE = 553.31;
const FOCUS_STROKE = 7.685;
const FOCUS_RADIUS = FOCUS_SIZE / 2 - FOCUS_STROKE / 2;
const FOCUS_CIRC = 2 * Math.PI * FOCUS_RADIUS;

// ─── Mobile Timer (Figma 192:17 — 288×288, stroke 4px) ────────────────────

const MOB_SIZE   = 288;
const MOB_STROKE = 4;
const MOB_RADIUS = MOB_SIZE / 2 - MOB_STROKE / 2;  // 142
const MOB_CIRC   = 2 * Math.PI * MOB_RADIUS;        // ≈ 892.35

// ─── Mobile Focus Timer (Figma 192:233 — 308.22×308.22, stroke 4.28px) ───────

const MOB_FOCUS_SIZE   = 308.22;
const MOB_FOCUS_STROKE = 4.28;
const MOB_FOCUS_RADIUS = MOB_FOCUS_SIZE / 2 - MOB_FOCUS_STROKE / 2;  // ≈ 151.97
const MOB_FOCUS_CIRC   = 2 * Math.PI * MOB_FOCUS_RADIUS;              // ≈ 954.9

// ─── Mobile ProfileIcon (Figma 192:33 — 28×28) ────────────────────────────
const MobileProfileIcon = ({ color = '#1A1A1A' }: { color?: string }) => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M16 18.2857C19.1559 18.2857 21.7143 15.7274 21.7143 12.5715C21.7143 9.41555 19.1559 6.85718 16 6.85718C12.8441 6.85718 10.2857 9.41555 10.2857 12.5715C10.2857 15.7274 12.8441 18.2857 16 18.2857Z" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.24 27.2C7.26 25.53 8.69 24.14 10.40 23.18C12.11 22.22 14.04 21.72 16 21.72C17.96 21.72 19.89 22.22 21.60 23.18C23.31 24.14 24.74 25.53 25.76 27.2" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 30.86C24.21 30.86 30.86 24.21 30.86 16C30.86 7.79 24.21 1.14 16 1.14C7.79 1.14 1.14 7.79 1.14 16C1.14 24.21 7.79 30.86 16 30.86Z" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

import VariantPickerModal from '../components/VariantPickerModal';

function SessionPopup({ task, onAction }: { task: string; onAction: (status: 'completed' | 'carried' | 'none') => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-sm px-4">
      <div className="bg-[#FAFAFA] rounded-[32px] w-full max-w-md p-10 flex flex-col items-center text-center shadow-2xl">
        <h3 className="font-['Space_Grotesk'] font-bold text-[36px] text-[#1A1A1A] mb-2 leading-tight">
          Session Complete! 🎉
        </h3>
        {task ? (
          <>
            <p className="font-['Inter'] text-[18px] text-[#1A1A1A]/80 mb-8">
              Your task: <strong className="text-[#006D37]">{task}</strong>
            </p>
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => onAction('completed')}
                className="w-full h-[60px] bg-[#006D37] text-white rounded-[8px] font-['Inter'] font-bold text-[18px] shadow-lg transition-transform hover:-translate-y-1"
              >
                ✅ Done (Complete)
              </button>
              <button
                onClick={() => onAction('carried')}
                className="w-full h-[60px] bg-[#FAFAFA] border-2 border-[#E8E8E8] text-[#1A1A1A] rounded-[8px] font-['Inter'] font-bold text-[18px] transition-colors hover:border-[#CCCCCC]"
              >
                ↩️ Carry Forward
              </button>
            </div>
          </>
        ) : (
          <p className="font-['Inter'] text-[24px] text-[#006D37] font-medium mt-4">
            Nice work!
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const currentStreak = user?.currentStreak || 0;
  const queryClient = useQueryClient();

  const isMobile = useIsMobile();
  const { selectedVariant, customFocusMinutes, alwaysUseVariant } = useSessionStore();
  const customBreakMinutes = useSessionStore(s => (s as any).customBreakMinutes || 5);

  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const [showSessionPopup, setShowSessionPopup] = useState(false);

  const getVariantSeconds = (v: string, phase: 'focus' | 'break' | 'longBreak') => {
    if (phase === 'longBreak') return 15 * 60;
    const isFocus = phase === 'focus';
    switch (v) {
      case 'sprint': return isFocus ? 15 * 60 : 3 * 60;
      case 'classic': return isFocus ? 25 * 60 : 5 * 60;
      case 'deep_work': return isFocus ? 50 * 60 : 10 * 60;
      case 'flow': return isFocus ? 90 * 60 : 15 * 60;
      case 'custom': return isFocus ? customFocusMinutes * 60 : customBreakMinutes * 60;
      default: return isFocus ? 25 * 60 : 5 * 60;
    }
  };

  const getVariantLabel = (v: string, phase: 'focus' | 'break' | 'longBreak') => {
    if (phase === 'longBreak') return 'Long Break . 15 min';
    const isBreak = phase === 'break';
    switch (v) {
      case 'sprint': return `Sprint . ${isBreak ? '3 min Break' : '15 min'}`;
      case 'classic': return `Classic . ${isBreak ? '5 min Break' : '25 min'}`;
      case 'deep_work': return `Deep Work . ${isBreak ? '10 min Break' : '50 min'}`;
      case 'flow': return `Flow . ${isBreak ? '15 min Break' : '90 min'}`;
      case 'custom': return `Custom . ${isBreak ? 'Break' : 'Focus'}`;
      default: return `Classic . ${isBreak ? '5 min Break' : '25 min'}`;
    }
  };

  const modeSeconds = getVariantSeconds(selectedVariant, sessionPhase);
  const modeLabel = getVariantLabel(selectedVariant, sessionPhase);

  const [timeLeft, setTimeLeft] = useState(modeSeconds);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionMutation = useMutation({
    mutationFn: sessionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tree'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      useAuthStore.getState().checkAuth();
    },
    onError: (err) => {
      console.error('Failed to log session', err);
    }
  });

  const focusMode = running || sessionPhase !== 'focus' || (timeLeft < modeSeconds && timeLeft > 0);

  useEffect(() => {
    if (!running) {
      setTimeLeft(modeSeconds);
    }
  }, [selectedVariant, customFocusMinutes, running, modeSeconds, sessionPhase]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (sessionPhase === 'focus') {
              setShowSessionPopup(true);
            } else {
              setCompletedSessions(c => Math.min(c + 1, TOTAL_SESSIONS));
              setSessionPhase('focus');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, sessionPhase]);

  useEffect(() => {
    if (showSessionPopup && !task) {
      const timer = setTimeout(() => {
        handlePopupComplete('none');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSessionPopup, task]);

  const handlePopupComplete = (status: 'completed' | 'carried' | 'none') => {
    const body: CreateSessionBody = {
      variant: selectedVariant,
      focusMinutes: Math.floor(getVariantSeconds(selectedVariant, 'focus') / 60),
      taskText: task || null,
      taskStatus: status,
      clientSessionId: crypto.randomUUID()
    };
    sessionMutation.mutate(body);
    if (status === 'completed') setTask('');
    setShowSessionPopup(false);
    const is4thSession = completedSessions + 1 === TOTAL_SESSIONS;
    setSessionPhase(is4thSession ? 'longBreak' : 'break');
    setRunning(true);
  };

  const ringColor = sessionPhase === 'focus' ? '#006D37' : '#F9C74F';

  const handleStart = () => {
    if (alwaysUseVariant) {
      setRunning(true);
    } else {
      setShowVariantPicker(true);
    }
  };

  const handleAbandon = () => {
    if (!window.confirm('Are you sure you want to end this session completely?')) return;
    setRunning(false);
    setSessionPhase('focus');
    setTimeLeft(modeSeconds);
  };

  const idleProgress = timeLeft / modeSeconds;
  const idleDashOffset = IDLE_CIRC * (1 - idleProgress);

  const focusProgress = timeLeft / modeSeconds;
  const focusDashOffset = FOCUS_CIRC * (1 - focusProgress);

  // ── MOBILE Focus Mode (Figma 192:233) ─────────────────────────────────────
  if (isMobile && (focusMode || (timeLeft < modeSeconds && timeLeft > 0))) {
    const mobFocusProgress   = timeLeft / modeSeconds;
    const mobFocusDashOffset = MOB_FOCUS_CIRC * (1 - mobFocusProgress);

    return (
      <div
        style={{
          /* Figma 192:233: 402×874, White (#F2F2F2) */
          height:        '100dvh',
          background:    '#F2F2F2',
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
          position:      'relative',
        }}
      >
        {/*
          Body (layout_60JUV4):
            x=35, y=48, w=332, h=778
            column, justifyContent=space-between, alignItems=center, gap=38
          4 children: Task chip | Image | Timer | ABANDON SESSION
        */}
        <main
          style={{
            flex:           1,
            padding:        '48px 35px 40px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'space-between',
            boxSizing:      'border-box',
            overflowY:      'auto',
          }}
        >
          {/* ── Task chip (layout_0G1W7U): 156×32.96 ──
                Shadow: 3.66px offset, Black
                Button: 152.34×29.3, Green, radius=5
                Text: SG 700, 10.25px, UPPER, 5% ls
          ── */}
          {task ? (
            <div style={{ position: 'relative', width: 156, height: 32.96, flexShrink: 0 }}>
              {/* Shadow (layout_XT95IJ): offset 3.66px */}
              <div
                style={{
                  position:     'absolute',
                  left:         3.66,
                  top:          3.66,
                  width:        152.34,
                  height:       29.3,
                  background:   '#1A1A1A',
                  borderRadius: 5,
                }}
              />
              {/* Green chip (layout_SGXTD1) */}
              <div
                style={{
                  position:       'absolute',
                  left:           0,
                  top:            0,
                  width:          152.34,
                  height:         29.3,
                  background:     '#006D37',
                  borderRadius:   5,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  overflow:       'hidden',
                }}
              >
                <span
                  style={{
                    fontFamily:    "'Space Grotesk', sans-serif",
                    fontWeight:    700,
                    fontSize:      10.25,
                    letterSpacing: '5%',
                    textTransform: 'uppercase',
                    color:         '#FAFAFA',
                    whiteSpace:    'nowrap',
                    overflow:      'hidden',
                    textOverflow:  'ellipsis',
                    maxWidth:      '100%',
                    padding:       '0 8px',
                  }}
                >
                  {task}
                </span>
              </div>
            </div>
          ) : (
            /* Placeholder spacer so space-between still works without a task */
            <div style={{ width: 156, height: 32.96, flexShrink: 0 }} />
          )}

          {/* ── Forest image (layout_NQ8IOS): w=fill, h=228 ── */}
          <div
            style={{
              width:        '100%',
              height:       228,
              borderRadius: 12,
              overflow:     'hidden',
              flexShrink:   0,
            }}
          >
            <img
              src="/images/tree_hero.png"
              alt="Focus Forest"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* ── Timer circle (layout_B4VH97): 308.22×308.22 ──
                Absolute positions (Figma px):
                  Time    : x=58.33,  y=53.42,  w=191.21, h=87   — SG 700, 68.49px
                  Focus btn: x=101.85, y=160.42, w=103.45, h=38.53 — shadow 2.85px
                  Dots     : x=122.8,  y=221.66, row gap=9.82, dot=7.37×7.37
                  Label    : x=116.22, y=251.75, w=77, h=12        — Inter 700, 9.99px
          ── */}
          <div
            style={{
              width:      MOB_FOCUS_SIZE,
              height:     MOB_FOCUS_SIZE,
              position:   'relative',
              flexShrink: 0,
            }}
          >
            {/* SVG arcs */}
            <svg
              viewBox={`0 0 ${MOB_FOCUS_SIZE} ${MOB_FOCUS_SIZE}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              {/* Track — Faded white #E8E8E8 */}
              <circle
                cx={MOB_FOCUS_SIZE / 2} cy={MOB_FOCUS_SIZE / 2} r={MOB_FOCUS_RADIUS}
                fill="none" stroke="#E8E8E8" strokeWidth={MOB_FOCUS_STROKE}
              />
              {/* Progress arc — Green */}
              <circle
                cx={MOB_FOCUS_SIZE / 2} cy={MOB_FOCUS_SIZE / 2} r={MOB_FOCUS_RADIUS}
                fill="none" stroke={ringColor} strokeWidth={MOB_FOCUS_STROKE}
                strokeDasharray={MOB_FOCUS_CIRC}
                strokeDashoffset={mobFocusDashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${MOB_FOCUS_SIZE / 2} ${MOB_FOCUS_SIZE / 2})`}
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>

            {/* Time — layout_4CEUQI: x=58.33, y=53.42, w=191.21, h=87
                style_R7MZXL: SG 700, 68.49px */}
            <span
              style={{
                position:       'absolute',
                left:           58.33,
                top:            53.42,
                width:          191.21,
                height:         87,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontFamily:     "'Space Grotesk', sans-serif",
                fontWeight:     700,
                fontSize:       68.49,
                lineHeight:     1.276,
                color:          '#1A1A1A',
                letterSpacing:  '-2px',
                whiteSpace:     'nowrap',
              }}
            >
              {formatTime(timeLeft)}
            </span>

            {/* Focus / Resume button — layout_IZFBRJ: x=101.85, y=160.42, w=103.45, h=38.53
                Shadow (layout_N1HCBC): 2.85px offset
                Button (layout_9M8E53): 100.6×35.67, Green, radius=6
                Text (style_TWWLSJ): Inter 700, 17.12px */}
            <div
              style={{
                position: 'absolute',
                left:     101.85,
                top:      160.42,
                width:    103.45,
                height:   38.53,
              }}
            >
              {/* Shadow */}
              <div
                style={{
                  position:     'absolute',
                  left:         2.85,
                  top:          2.85,
                  width:        100.6,
                  height:       35.67,
                  background:   '#1A1A1A',
                  borderRadius: 6,
                }}
              />
              <button
                onClick={() => setRunning(r => !r)}
                style={{
                  position:     'absolute',
                  left:         0,
                  top:          0,
                  width:        100.6,
                  height:       35.67,
                  background:   '#006D37',
                  border:       'none',
                  borderRadius: 6,
                  cursor:       'pointer',
                  fontFamily:   "'Inter', sans-serif",
                  fontWeight:   700,
                  fontSize:     17.12,
                  color:        '#FAFAFA',
                  transition:   'transform 0.1s',
                }}
                onMouseDown={e  => (e.currentTarget.style.transform = 'translate(2.85px,2.85px)')}
                onMouseUp={e    => (e.currentTarget.style.transform = 'none')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                onTouchStart={e  => ((e.currentTarget as HTMLButtonElement).style.transform = 'translate(2.85px,2.85px)')}
                onTouchEnd={e    => ((e.currentTarget as HTMLButtonElement).style.transform = 'none')}
              >
                {running ? 'Focus' : 'Resume'}
              </button>
            </div>

            {/* Progress dots — layout_I5TQQX: x=122.8, y=221.66, row, gap=9.82px
                Each dot (layout_SSG4P3): 7.37×7.37
                effect_AXFW74: active ring rgba(0,109,55,0.2) spread=2.46px */}
            <div
              style={{
                position:      'absolute',
                left:          122.8,
                top:           221.66,
                display:       'flex',
                flexDirection: 'row',
                gap:           9.82,
                alignItems:    'center',
              }}
            >
              {Array.from({ length: TOTAL_SESSIONS }).map((_, i) => {
                const done   = i < completedSessions;
                const active = i === completedSessions;
                return (
                  <div
                    key={i}
                    style={{
                      width:        7.37,
                      height:       7.37,
                      borderRadius: '50%',
                      background:   done ? '#006D37' : 'transparent',
                      border:       `1.8px solid ${done ? '#006D37' : active ? '#006D37' : '#C4C4C4'}`,
                      /* effect_AXFW74: boxShadow spread 2.46px green glow */
                      boxShadow:    active ? '0 0 0 2.46px rgba(0,109,55,0.2)' : 'none',
                      transition:   'all 0.3s ease',
                    }}
                  />
                );
              })}
            </div>

            {/* Mode label — layout_X0J3A8: x=116.22, y=251.75, w=77, h=12
                style_ZABD48: Inter 700, 9.99px */}
            <span
              style={{
                position:   'absolute',
                left:       116.22,
                top:        251.75,
                width:      77,
                height:     12,
                textAlign:  'center',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize:   9.99,
                lineHeight: 1.21,
                color:      '#1A1A1A',
                whiteSpace: 'nowrap',
              }}
            >
              {modeLabel}
            </span>
          </div>

          {/* ── ABANDON SESSION (layout_SRJC3X / WYVTUX)
                w=208 (fill), h=30.81
                style_Y7CQBV: SG 700, 10.27px, UPPER, ls=23.37%
          ── */}
          <button
            onClick={handleAbandon}
            style={{
              width:          208,
              height:         30.81,
              flexShrink:     0,
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              fontFamily:     "'Space Grotesk', sans-serif",
              fontWeight:     700,
              fontSize:       10.27,
              lineHeight:     1.558,
              letterSpacing:  '0.24em',
              textTransform:  'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              color:          '#1A1A1A',
              transition:     'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Abandon Session
          </button>
        </main>

        {showSessionPopup && <SessionPopup task={task} onAction={handlePopupComplete} />}

        <VariantPickerModal
          isOpen={showVariantPicker}
          onClose={() => setShowVariantPicker(false)}
          onContinue={() => {
            setShowVariantPicker(false);
            setRunning(true);
          }}
        />
      </div>
    );
  }

  // ── Focus Mode: Full-screen (NO sidebar) ─────────────────────────────────
  if (focusMode || (timeLeft < modeSeconds && timeLeft > 0)) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#F2F2F2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Hero: column, centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(24px, 5vh, 78px)',
            width: '100%',
            maxWidth: '1400px',
            padding: '0 40px',
          }}
        >
          {/* Task chip */}
          {task && (
            <div style={{ position: 'relative', width: 234.77, height: 49.6 }}>
              <div style={{ position: 'absolute', top: 5.51, left: 5.51, width: 229.26, height: 44.09, background: '#1A1A1A', borderRadius: 6 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: 229.26, height: 44.09, background: '#006D37', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15.43, letterSpacing: '5%', textTransform: 'uppercase', color: '#FAFAFA' }}>
                  {task}
                </span>
              </div>
            </div>
          )}

          {/* Timer and Tree row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(40px, 10vw, 210px)',
              width: '100%',
            }}
          >
            {/* Tree */}
            <div style={{ width: 'clamp(200px, 38vw, 580px)', aspectRatio: '580/398', borderRadius: 16, overflow: 'hidden', flexShrink: 1 }}>
              <img src="/images/tree_hero.png" alt="Focus Forest" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Timer circle */}
            <div style={{ width: 'clamp(220px, 34vw, 500px)', aspectRatio: '1/1', position: 'relative', flexShrink: 0 }}>
              <svg viewBox={`0 0 ${FOCUS_SIZE} ${FOCUS_SIZE}`} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                <circle cx={FOCUS_SIZE / 2} cy={FOCUS_SIZE / 2} r={FOCUS_RADIUS} fill="none" stroke="#E8E8E8" strokeWidth={FOCUS_STROKE} />
                <circle
                  cx={FOCUS_SIZE / 2} cy={FOCUS_SIZE / 2} r={FOCUS_RADIUS}
                  fill="none" stroke={ringColor} strokeWidth={FOCUS_STROKE}
                  strokeDasharray={FOCUS_CIRC} strokeDashoffset={focusDashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${FOCUS_SIZE / 2} ${FOCUS_SIZE / 2})`}
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              {/* Inner content */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14%' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(40px, 7vw, 110px)', lineHeight: 1, color: '#1A1A1A', letterSpacing: '-3px', whiteSpace: 'nowrap' }}>
                  {formatTime(timeLeft)}
                </span>

                {/* Focus / Resume button */}
                <div style={{ position: 'relative', width: 'clamp(110px, 12vw, 170px)', height: 'clamp(38px, 5vh, 62px)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: '#1A1A1A', borderRadius: 8, transform: 'translate(5px,5px)' }} />
                  <button
                    onClick={() => setRunning(r => !r)}
                    style={{ position: 'absolute', inset: 0, background: '#006D37', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(16px, 2vw, 28px)', color: '#FAFAFA', transition: 'transform 0.1s ease', width: '100%', height: '100%' }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'translate(5px,5px)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'none')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    {running ? 'Focus' : 'Resume'}
                  </button>
                </div>

                {/* Progress dots */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                  {Array.from({ length: TOTAL_SESSIONS }).map((_, i) => {
                    const done = i < completedSessions;
                    const active = i === completedSessions;
                    return (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: done ? '#006D37' : 'transparent', border: `2px solid ${done ? '#006D37' : active ? '#006D37' : '#C4C4C4'}`, boxShadow: active ? '0 0 0 4px rgba(0,109,55,0.2)' : 'none', transition: 'all 0.3s ease' }} />
                    );
                  })}
                </div>

                {/* Mode label */}
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(11px, 1.3vw, 17px)', color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                  {modeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Abandon session */}
          <button
            onClick={handleAbandon}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(13px, 1.3vw, 20px)', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '2.4px', textDecoration: 'underline', textUnderlineOffset: '4px', padding: '8px 0', transition: 'opacity 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = '#CC2200'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#1A1A1A'; }}
          >
            Abandon Session
          </button>
        </div>

        {showSessionPopup && <SessionPopup task={task} onAction={handlePopupComplete} />}
      </div>
    );
  }

  // ── MOBILE IDLE layout ──────────────────────────────────────────────────
  if (isMobile) {
    const mobProgress   = timeLeft / modeSeconds;
    const mobDashOffset = MOB_CIRC * (1 - mobProgress);

    return (
      <div
        style={{
          /* Figma 192:4 frame: 402×874, White (#F2F2F2) background */
          height:         '100dvh',
          background:     '#F2F2F2',
          display:        'flex',
          flexDirection:  'column',
          overflow:       'hidden',
          position:       'relative',
        }}
      >
        {/* ── Mobile Header (layout_799P1H) —
              row, space-between, x=20, y=22, w=362
              Streak left | Title center | Profile right
        ── */}
        <header
          style={{
            display:        'flex',
            flexDirection:  'row',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '22px 20px 0',
            flexShrink:     0,
          }}
        >
          {/* Streak badge — layout_XUYIOG: 53×24.7, Light Green rgba(187,233,194,0.5) */}
          <div
            style={{
              width:          53,
              height:         24.7,
              background:     'rgba(187, 233, 194, 0.5)',
              borderRadius:   24,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            5.15,  // layout_2JMTQL gap
            }}
          >
            {/* Streak leaf icon — layout_BA4X4C: 11.58×11.58 */}
            <svg width="11.58" height="11.58" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C7 2 3 7 3 12C3 13.9 3.7 15.6 4.8 17C4.8 17 6 15 8 15C8 17 7 19 6 20C7.5 21.3 9.7 22 12 22C17 22 21 17 21 12C21 6.5 17 3 14 4C14.5 5.5 14 8 12 9C12 7 11 5.5 12 2Z" fill="#006D37" />
            </svg>
            {/* "12" — style_ZN8LW3: Inter 500, 16.47px, Green */}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize:   16.47,
                lineHeight: 1,
                color:      '#006D37',
              }}
            >
              {currentStreak}
            </span>
          </div>

          {/* Title — style_XYHB3Q: Space Grotesk 700, 20px, Black, center */}
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize:   20,
              lineHeight: 1.276,
              color:      '#1A1A1A',
              margin:     0,
            }}
          >
            Focus Forest
          </h1>

          {/* Profile — layout_KWIBDS: 28×28 */}
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border:     'none',
              padding:    0,
              cursor:     'pointer',
              width:      28,
              height:     28,
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MobileProfileIcon />
          </button>
        </header>

        {/* ── Scrollable body (layout_6063Y5) —
              x=35, y=91, w=332, column, center, gap=38
        ── */}
        <main
          style={{
            flex:           1,
            overflowY:      'auto',
            /* x=35 → sides 35px (8.7% of 402), top matches y=91 - header height */
            padding:        '25px 35px 90px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            38,
            boxSizing:      'border-box',
          }}
        >
          {/* ── Forest image — layout_WPW8LI: w=fill, h=228 ── */}
          <div
            style={{
              width:        '100%',
              height:       228,
              borderRadius: 12,
              overflow:     'hidden',
              flexShrink:   0,
            }}
          >
            <img
              src="/images/tree_hero.png"
              alt="Focus Forest"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* ── Timer circle (layout_665RMR): 288×288 ──
                Inner elements absolutely positioned per Figma coordinates:
                  Time  "25:00" : x=54.5,  y=49.91,  w=178.67, h=82
                  Start button  : x=95.17, y=149.9,  w=96.67,  h=36
                  Label text    : x=108.6, y=235.24, w=72,     h=11
          ── */}
          <div
            style={{
              width:      MOB_SIZE,
              height:     MOB_SIZE,
              position:   'relative',
              flexShrink: 0,
            }}
          >
            {/* SVG ring */}
            <svg
              viewBox={`0 0 ${MOB_SIZE} ${MOB_SIZE}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              {/* Track (Faded white #E8E8E8)  — Ellipse 1 */}
              <circle
                cx={MOB_SIZE / 2} cy={MOB_SIZE / 2} r={MOB_RADIUS}
                fill="none" stroke="#E8E8E8" strokeWidth={MOB_STROKE}
              />
              {/* Progress arc (Green) — Ellipse 2 */}
              <circle
                cx={MOB_SIZE / 2} cy={MOB_SIZE / 2} r={MOB_RADIUS}
                fill="none" stroke={ringColor} strokeWidth={MOB_STROKE}
                strokeDasharray={MOB_CIRC}
                strokeDashoffset={mobDashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${MOB_SIZE / 2} ${MOB_SIZE / 2})`}
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>

            {/* Time "25:00" — layout_UIM932: x=54.5, y=49.91, w=178.67, h=82
                style_3V19RG: Space Grotesk 700, 64px, lh=1.276 */}
            <span
              style={{
                position:   'absolute',
                left:       54.5,
                top:        49.91,
                width:      178.67,
                height:     82,
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize:   64,
                lineHeight: 1.276,
                color:      '#1A1A1A',
                letterSpacing: '-2px',
                whiteSpace: 'nowrap',
              }}
            >
              {formatTime(timeLeft)}
            </span>

            {/* Start button (layout_OGSTZT / DC9K18 / 9V2WBX)
                Frame: x=95.17, y=149.9, w=96.67, h=36
                Shadow div offset: 2.67px x+y
                Button: Green, w=94, h=33.33, radius=6
                Text (style_90J5ES): Inter 700, 16px, Super White */}
            <div
              style={{
                position: 'absolute',
                left:     95.17,
                top:      149.9,
                width:    96.67,
                height:   36,
              }}
            >
              {/* Shadow (layout_DC9K18): offset 2.67px */}
              <div
                style={{
                  position:     'absolute',
                  inset:        0,
                  background:   '#1A1A1A',
                  borderRadius: 6,
                  transform:    'translate(2.67px, 2.67px)',
                }}
              />
              <button
                onClick={handleStart}
                style={{
                  position:     'absolute',
                  left:         0,
                  top:          0,
                  width:        94,
                  height:       33.33,
                  background:   '#006D37',
                  border:       'none',
                  borderRadius: 6,
                  cursor:       'pointer',
                  fontFamily:   "'Inter', sans-serif",
                  fontWeight:   700,
                  fontSize:     16,
                  color:        '#FAFAFA',
                  transition:   'transform 0.1s',
                }}
                onMouseDown={e  => (e.currentTarget.style.transform = 'translate(2.67px,2.67px)')}
                onMouseUp={e    => (e.currentTarget.style.transform = 'none')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                onTouchStart={e  => ((e.currentTarget as HTMLButtonElement).style.transform = 'translate(2.67px,2.67px)')}
                onTouchEnd={e    => ((e.currentTarget as HTMLButtonElement).style.transform = 'none')}
              >
                Start
              </button>
            </div>

            {/* Mode label (layout_YE7KMO): x=108.6, y=235.24, w=72, h=11
                style_7IHSYT: Inter 700, 9.33px, center */}
            <span
              style={{
                position:  'absolute',
                left:      108.6,
                top:       235.24,
                width:     72,
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize:  9.33,
                lineHeight: 1.21,
                color:     '#1A1A1A',
                whiteSpace: 'nowrap',
              }}
            >
              {modeLabel}
            </span>
          </div>

          {/* ── Task + Variant (layout_HJMJU8): w=282.93, column, gap=35.81 ── */}
          <div
            style={{
              width:          '100%',
              maxWidth:       282.93,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            35.81,
            }}
          >
            {/* Input (layout_64R2WR): 217.27×41.78, Super White, 0.6px border */}
            <div
              style={{
                width:        217.27,
                height:       41.78,
                background:   '#FAFAFA',
                border:       '0.6px solid #1A1A1A',
                borderRadius: 4,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                boxSizing:    'border-box',
              }}
            >
              <input
                type="text"
                placeholder="Add Task (Optional)"
                value={task}
                onChange={e => setTask(e.target.value)}
                style={{
                  background:  'none',
                  border:      'none',
                  outline:     'none',
                  width:       '100%',
                  padding:     '0 12px',
                  textAlign:   'center',
                  fontFamily:  "'Inter', sans-serif",
                  fontWeight:  500,
                  /* style_IOW0DO: fontSize=11.94 */
                  fontSize:    11.94,
                  color:       '#1A1A1A',
                }}
              />
            </div>

            {/* "CHANGE TIMER VARIANT"
                style_6C7XVA: Space Grotesk 700, 11.94px, UPPER, ls=2.4% */}
            <button
              onClick={() => setShowVariantPicker(true)}
              style={{
                background:     'none',
                border:         'none',
                cursor:         'pointer',
                fontFamily:     "'Space Grotesk', sans-serif",
                fontWeight:     700,
                fontSize:       11.94,
                lineHeight:     0.8,
                textTransform:  'uppercase',
                letterSpacing:  '2.4%',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                color:          '#1A1A1A',
                padding:        '4px 0',
                transition:     'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Change Timer Variant
            </button>
          </div>
        </main>

        {showSessionPopup && <SessionPopup task={task} onAction={handlePopupComplete} />}

        <VariantPickerModal
          isOpen={showVariantPicker}
          onClose={() => setShowVariantPicker(false)}
          onContinue={() => {
            setShowVariantPicker(false);
            setRunning(true);
          }}
        />

        {/* Bottom nav — layout_R8KTTY: y=799, h=75, radius 24 24 0 0 */}
        <MobileBottomNav activePage="dashboard" />
      </div>
    );
  }

  // ── IDLE layout (WITH sidebar) ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F2F2F2', overflow: 'hidden' }}>
      <Sidebar activePage="dashboard" />

      <main
        style={{
          marginLeft: '101px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 40px 0 40px',
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(24px, 2.5vw, 36px)',
              lineHeight: '1.276em',
              color: '#1A1A1A',
              margin: 0,
            }}
          >
            Focus Forest
          </h1>

          {/* Streak badge */}
          <div
            style={{
              height: 'clamp(36px, 3.5vh, 48px)',
              padding: '0 16px',
              minWidth: 80,
              background: 'rgba(187, 233, 194, 0.5)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C14.65 22 17.20 20.95 19.07 19.07C20.95 17.20 22 14.65 22 12C22 9 20 6.5 17 5C17.5 7 17 9 15 10C15 8 14 6.5 12 5C12 7 10.5 9 9 10C8 11 7 12.5 7 14C7 15.33 7.53 16.60 8.46 17.54C9.40 18.47 10.67 19 12 19" fill="#FF6B35" />
              <path d="M12 22C13.59 22 15.12 21.37 16.24 20.24C17.37 19.12 18 17.59 18 16C18 14.5 17 13 16 12C16 13.5 15 14.5 13.5 15C14 13.5 13.5 12 12 11C12 12.5 11 13.5 10 14.5C9.5 15 9 15.9 9 17C9 18.33 9.53 19.60 10.46 20.54C11.40 21.47 12.67 22 12 22" fill="#FFD700" />
            </svg>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: 'clamp(20px, 2vw, 28px)',
                color: '#006D37',
                lineHeight: 1,
              }}
            >
              {currentStreak}
            </span>
          </div>
        </header>

        {/* Hero section */}
        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(24px, 4vh, 60px)',
            padding: '20px 40px',
            overflow: 'hidden',
          }}
        >
          {/* Timer + Tree row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(32px, 8vw, 160px)',
              width: '100%',
            }}
          >
            {/* Tree image */}
            <div
              style={{
                width: 'clamp(180px, 36vw, 520px)',
                aspectRatio: '580 / 398',
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 1,
              }}
            >
              <img
                src="/images/tree_hero.png"
                alt="Focus Forest tree illustration"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Timer circle */}
            <div
              style={{
                width: 'clamp(200px, 30vw, 440px)',
                aspectRatio: '1 / 1',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <svg
                viewBox={`0 0 ${IDLE_SIZE} ${IDLE_SIZE}`}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              >
                <circle cx={IDLE_SIZE / 2} cy={IDLE_SIZE / 2} r={IDLE_RADIUS} fill="none" stroke="#E8E8E8" strokeWidth={IDLE_STROKE} />
                <circle
                  cx={IDLE_SIZE / 2} cy={IDLE_SIZE / 2} r={IDLE_RADIUS}
                  fill="none" stroke={ringColor} strokeWidth={IDLE_STROKE}
                  strokeDasharray={IDLE_CIRC} strokeDashoffset={idleDashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${IDLE_SIZE / 2} ${IDLE_SIZE / 2})`}
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>

              {/* Content inside circle */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14%',
                }}
              >
                {/* Time readout */}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(36px, 6.5vw, 96px)',
                    lineHeight: 1,
                    color: '#1A1A1A',
                    letterSpacing: '-2px',
                    display: 'block',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatTime(timeLeft)}
                </span>

                {/* Neomorphic Start button */}
                <div
                  style={{
                    position: 'relative',
                    width: 'clamp(100px, 10vw, 152px)',
                    height: 'clamp(36px, 4.5vh, 54px)',
                    marginTop: '4px',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: '#1A1A1A', borderRadius: 6, transform: 'translate(4px,4px)' }} />
                  <button
                    onClick={handleStart}
                    style={{
                      position: 'absolute', inset: 0,
                      background: '#006D37', border: 'none', borderRadius: 6,
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", fontWeight: 700,
                      fontSize: 'clamp(15px, 1.6vw, 22px)',
                      color: '#FAFAFA',
                      transition: 'transform 0.1s ease',
                      width: '100%',
                      height: '100%',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translate(-4px,-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                    onMouseDown={e => (e.currentTarget.style.transform = 'none')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'translate(-4px,-4px)')}
                  >
                    Start
                  </button>
                </div>

                {/* Mode label */}
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(11px, 1.1vw, 15px)',
                    color: '#1A1A1A',
                    marginTop: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {modeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Task + Variant */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(12px, 2vh, 20px)',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: 'clamp(44px, 6vh, 70px)',
                background: '#FAFAFA',
                border: '1px solid #1A1A1A',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '20px',
                paddingRight: '20px',
                boxSizing: 'border-box',
              }}
            >
              <input
                type="text"
                placeholder="Add Task (Optional)"
                value={task}
                onChange={e => setTask(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: 'clamp(14px, 1.3vw, 20px)',
                  color: '#1A1A1A',
                  textAlign: 'center',
                }}
              />
            </div>

            <button
              onClick={() => setShowVariantPicker(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(11px, 1.1vw, 15px)',
                color: '#1A1A1A',
                textTransform: 'uppercase',
                letterSpacing: '2.4px',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                padding: '6px 0',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Change Timer Variant
            </button>
          </div>
        </section>
      </main>

      {showSessionPopup && <SessionPopup task={task} onAction={handlePopupComplete} />}

      <VariantPickerModal
        isOpen={showVariantPicker}
        onClose={() => setShowVariantPicker(false)}
        onContinue={() => {
          setShowVariantPicker(false);
          setRunning(true);
        }}
      />
    </div>
  );
}
