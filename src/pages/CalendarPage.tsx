import { useState } from 'react';
import Sidebar from '../components/Sidebar';

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
// Rows: MON, TUE, FRI shown  (3 visible rows in design)
// Cols: ~52 weeks × 7 days = 364 cells per row, but we show only Mon/Tue/Fri
// Simplify: generate a realistic-looking heatmap with varying density

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKS = 53;

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Generate a cell: 0 = empty, 1-4 = intensity (darker green)
function generateHeatmapRow(rowIdx: number): number[] {
  return Array.from({ length: WEEKS }, (_, w) => {
    const r = seededRandom(rowIdx * 1000 + w * 7);
    // Make it realistic: denser in some months, sparse in others
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
function FocusGrid({ year }: { year: number }) {
  return (
    <div
      style={{
        background: SUPER_WHITE,
        border: `2px solid ${DARK}`,
        boxShadow: SHADOW,
        padding: '32px 32px 28px',
        position: 'relative',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '24px', color: DARK }}>
          Focus Grid
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '20px', color: DARK }}>
          {year}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0' }}>
        {/* Day labels column */}
        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '20px', paddingRight: '10px', gap: '3px' }}>
          {Array.from({ length: 7 }).map((_, i) => {
            // Suppose row 0=SUN, 1=MON, 2=TUE, 3=WED, 4=THU, 5=FRI, 6=SAT
            let dayLabel = '';
            if (i === 1) dayLabel = 'MON';
            if (i === 2) dayLabel = 'TUE';
            if (i === 5) dayLabel = 'FRI';

            return (
              <span key={i} style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                color: MUTED,
                lineHeight: '1',
                height: '14px',
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
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  color: MUTED,
                }}>
                  {month}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {HEATMAP_DATA.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: '3px' }}>
                {row.map((val, wi) => (
                  <div
                    key={wi}
                    title={val > 0 ? `${val} session${val > 1 ? 's' : ''}` : 'No sessions'}
                    style={{
                      width: '14px',
                      height: '14px',
                      flexShrink: 0,
                      background: val === 0
                        ? 'transparent'
                        : cellColor(val),
                      border: val === 0
                        ? `1.5px solid rgba(26,26,26,0.2)`
                        : 'none',
                      borderRadius: '2px',
                      cursor: 'default',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.75'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
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
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      flex: '1 1 0',
      background: WHITE,
      border: `2px solid ${DARK}`,
      boxShadow: SHADOW,
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '190px',
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: '16px',
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
        fontSize: '60px',
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

function MonthlyEfforts() {
  return (
    <div style={{
      background: WHITE,
      border: `2px solid ${DARK}`,
      boxShadow: SHADOW,
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: '24px',
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
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 16px',
              border: `1px solid ${DARK}`,
              borderBottom: i < WEEKS_DATA.length - 1 ? 'none' : `1px solid ${DARK}`,
              background: WHITE,
              gap: '16px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F8F8F8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = WHITE; }}
          >
            {/* Week label */}
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: DARK2,
              flexShrink: 0,
              width: '60px',
            }}>
              {week.label}
            </span>

            {/* Summary */}
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '14px',
              color: DARK2,
              flex: 1,
              textAlign: 'center',
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
                padding: '6px 14px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                color: SUPER_WHITE,
                cursor: 'pointer',
                letterSpacing: '0.05em',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-1px,-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0,0)';
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="calendar" />

      <main style={{
        marginLeft: '101px',
        flex: 1,
        padding: '73px 110px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}>

        {/* ── Category toggle ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
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
                  padding: '8px 32px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
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
        <FocusGrid year={currentYear} />

        {/* ── Yearly stat cards ── */}
        <div style={{ display: 'flex', gap: '29px' }}>
          <StatCard label="Total Minutes" value="14000" />
          <StatCard label="Trees Completed" value="284" />
          <StatCard label="Task Completion" value="74%" />
          <StatCard label="Sessions" value="700" />
        </div>

        {/* ── Monthly Efforts ── */}
        <MonthlyEfforts />
      </main>
    </div>
  );
}
