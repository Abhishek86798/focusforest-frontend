import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';

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
const WEEKS = 53;

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateHeatmapRow(rowIdx: number): number[] {
  return Array.from({ length: WEEKS }, (_, w) => {
    const r = seededRandom(rowIdx * 1000 + w * 7);
    const monthInfluence = Math.sin((w / WEEKS) * Math.PI * 2.5) * 0.3 + 0.7;
    if (r > 0.35 * monthInfluence) {
      const intensity = Math.ceil(seededRandom(rowIdx * 500 + w) * 4);
      return Math.min(intensity, 4);
    }
    return 0;
  });
}

const HEATMAP_DATA = Array.from({ length: 7 }).map((_, i) => generateHeatmapRow(i));

function cellColor(value: number): string {
  if (value === 0) return 'transparent';
  const alphas = [0.25, 0.45, 0.7, 1];
  return `rgba(0, 109, 55, ${alphas[value - 1]})`;
}

// ─── Focus Grid Component ───────────────────────────────────────────────────────
function FocusGrid({ year, isMobile }: { year: number; isMobile: boolean }) {
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
            {HEATMAP_DATA.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: isMobile ? '2px' : '3px' }}>
                {row.map((val, wi) => (
                  <div
                    key={wi}
                    title={val > 0 ? `${val} session${val > 1 ? 's' : ''}` : 'No sessions'}
                    style={{
                      width: isMobile ? '10px' : '14px',
                      height: isMobile ? '10px' : '14px',
                      flexShrink: 0,
                      background: val === 0 ? 'transparent' : cellColor(val),
                      border: val === 0 ? `1px solid rgba(26,26,26,0.2)` : 'none',
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
const WEEKS_DATA = [
  { label: 'Week 1', summary: 'You completed 18 sessions and help growing 5 trees!!' },
  { label: 'Week 2', summary: 'You completed 18 sessions and help growing 5 trees!!' },
  { label: 'Week 3', summary: 'You completed 18 sessions and help growing 5 trees!!' },
  { label: 'Week 4', summary: 'You completed 18 sessions and help growing 5 trees!!' },
];

function MonthlyEfforts({ isMobile }: { isMobile: boolean }) {
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
        {WEEKS_DATA.map((week, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '12px' : '16px 16px',
              border: `1px solid ${DARK}`,
              borderBottom: i < WEEKS_DATA.length - 1 ? 'none' : `1px solid ${DARK}`,
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
              {week.label}
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
              {week.summary}
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
        ))}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
type Category = 'solo' | 'groups';

export default function CalendarPage() {
  const [category, setCategory] = useState<Category>('solo');
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();

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
        <FocusGrid year={currentYear} isMobile={isMobile} />

        {/* ── Yearly stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '29px',
        }}>
          <StatCard label="Total Minutes" value="14000" isMobile={isMobile} />
          <StatCard label="Trees Completed" value="284" isMobile={isMobile} />
          <StatCard label="Task Completion" value="74%" isMobile={isMobile} />
          <StatCard label="Sessions" value="700" isMobile={isMobile} />
        </div>

        {/* ── Monthly Efforts ── */}
        <MonthlyEfforts isMobile={isMobile} />
      </main>

      {isMobile && <MobileBottomNav activePage="calendar" />}
    </div>
  );
}
