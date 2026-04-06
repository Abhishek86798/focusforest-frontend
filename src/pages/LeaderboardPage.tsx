/**
 * LeaderboardPage — Responsive implementation
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const SUPERWHITE = '#FAFAFA';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = '4px 4px 0px 0px rgba(26, 26, 26, 1)';

// ─── Static data ───────────────────────────────────────────────────────────────
const PODIUM = [
  { place: 2, name: 'Elena V.',      trees: '120 Trees', green: false, barH: 140, barHMobile: 100, badgeSize: 80  },
  { place: 1, name: 'Marcus Thorne', trees: '120 Trees', green: true,  barH: 192, barHMobile: 140, badgeSize: 112 },
  { place: 3, name: 'Julian K.',     trees: '120 Trees', green: false, barH: 112, barHMobile: 80, badgeSize: 80  },
];

const ROWS = [
  { rank: '04', name: 'Sarah Jenkins', trees: '112 Trees', streak: 8,  isMe: false },
  { rank: '05', name: 'Alex Mercer',   trees: '98 Trees',  streak: 12, isMe: true  },
  { rank: '06', name: 'David Chen',    trees: '84 Trees',  streak: 4,  isMe: false },
  { rank: '07', name: 'Amara Okafor', trees: '77 Trees',  streak: 15, isMe: false },
];

// ─── AvatarBadge ───────────────────────────────────────────────────────────────
function AvatarBadge({ place, green, isMobile }: { place: number; green: boolean; isMobile: boolean }) {
  const outer = isMobile ? (green ? 64 : 48) : (green ? 112 : 80);
  const innerSize = isMobile ? (green ? 24 : 20) : (green ? 40 : 32);
  const borderWidth = green ? (isMobile ? 2 : 4) : (isMobile ? 1 : 2);
  const borderColour = green ? GREEN : DARK;

  return (
    <div style={{
      width: outer,
      height: outer,
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: isMobile ? 8 : 12,
        border: `${borderWidth}px solid ${borderColour}`,
        boxSizing: 'border-box',
      }} />
      <div style={{
        position: 'absolute',
        width: innerSize,
        height: innerSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: isMobile ? 4 : 8,
        background: green ? GREEN : BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: green ? '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)' : 'none',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: isMobile ? (green ? 12 : 10) : (green ? 16 : 14),
          lineHeight: 1,
          color: green ? SUPERWHITE : DARK,
        }}>
          {place}
        </span>
      </div>
    </div>
  );
}

// ─── Podium ────────────────────────────────────────────────────────────────────
function Podium({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: isMobile ? 12 : 32,
      padding: isMobile ? '0 8px' : '0 16px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {PODIUM.map((p, i) => (
        <motion.div
          key={p.place}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.35 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Name */}
          <div style={{
            paddingBottom: isMobile ? 8 : 16,
            paddingTop: isMobile ? 8 : 16,
            textAlign: 'center',
            width: '100%',
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: p.green ? 900 : 700,
              fontSize: isMobile ? (p.green ? 14 : 12) : (p.green ? 24 : 18),
              letterSpacing: p.green ? '-0.025em' : '0',
              lineHeight: p.green ? 1.333 : 1.556,
              color: DARK,
              display: 'block',
              textAlign: 'center',
            }}>
              {p.name}
            </span>
          </div>

          {/* Bar */}
          <div style={{
            width: '100%',
            height: isMobile ? p.barHMobile : p.barH,
            background: p.green ? GREEN : SUPERWHITE,
            border: `${p.green ? 2 : 1}px solid ${DARK}`,
            boxShadow: SHADOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: '0 8px',
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? 'clamp(10px, 3vw, 16px)' : 'clamp(20px, 2.8vw, 40px)',
              textTransform: 'uppercase',
              color: p.green ? SUPERWHITE : DARK,
              textAlign: 'center',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              display: 'block',
            }}>
              {p.trees}
            </span>
          </div>

          {/* Place badge */}
          <AvatarBadge place={p.place} green={p.green} isMobile={isMobile} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Ranking table ─────────────────────────────────────────────────────────────
function RankingTable({ isMobile }: { isMobile: boolean }) {
  const COL_GRID = isMobile ? '40px 1fr 80px' : '95px 1fr 220px 160px';

  return (
    <div style={{
      background: SUPERWHITE,
      border: `1px solid ${DARK}`,
      boxShadow: SHADOW,
      borderRadius: 4,
      overflow: 'hidden',
    }}>

      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: COL_GRID,
        alignItems: 'center',
        padding: isMobile ? '0 16px' : '0 32px',
        height: isMobile ? 48 : 63,
        borderBottom: '1px solid rgba(26,26,26,0.12)',
        boxSizing: 'border-box',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 8 : 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'left',
        }}>Rank</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 8 : 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'left',
        }}>Name</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 8 : 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'center',
        }}>{isMobile ? 'Trees' : 'Trees Completed'}</span>
        {!isMobile && (
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: DARK,
            textAlign: 'right',
          }}>Current Streak</span>
        )}
      </div>

      {/* Data rows */}
      {ROWS.map((row, i) => (
        <RankRow key={row.rank} row={row} index={i} isLast={i === ROWS.length - 1} isMobile={isMobile} />
      ))}

      {/* Show more */}
      <ShowMoreRow isMobile={isMobile} />
    </div>
  );
}

function RankRow({
  row, index, isLast, isMobile,
}: {
  row: typeof ROWS[0];
  index: number;
  isLast: boolean;
  isMobile: boolean;
}) {
  const me = row.isMe;
  const COL_GRID = isMobile ? '40px 1fr 80px' : '95px 1fr 220px 160px';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.28 }}
      style={{
        display: 'grid',
        gridTemplateColumns: COL_GRID,
        alignItems: 'center',
        padding: me ? (isMobile ? '16px' : '24px 32px') : (isMobile ? '12px 16px' : '20px 32px'),
        boxSizing: 'border-box',
        background: me ? GREEN : 'transparent',
        borderTop: me ? `2px solid ${GREEN}` : 'none',
        borderBottom: me ? `2px solid ${GREEN}` : isLast ? 'none' : '1px solid rgba(26,26,26,0.1)',
        boxShadow: me ? '0px 4px 12px 0px rgba(46, 204, 113, 0.15)' : 'none',
      }}
    >
      {/* Rank */}
      <div style={{ opacity: me ? 1 : 0.2 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: me ? 700 : 900,
          fontSize: me ? (isMobile ? 18 : 24) : (isMobile ? 14 : 20),
          color: me ? SUPERWHITE : DARK,
          lineHeight: me ? 1.333 : 1.4,
          display: 'block',
        }}>
          {row.rank}
        </span>
      </div>

      {/* Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
        <div style={{
          width: me ? (isMobile ? 32 : 48) : (isMobile ? 28 : 40),
          height: me ? (isMobile ? 32 : 48) : (isMobile ? 28 : 40),
          borderRadius: isMobile ? 8 : 12,
          border: me ? `2px solid ${SUPERWHITE}` : `1px solid ${DARK}`,
          background: me ? 'rgba(255,255,255,0.12)' : 'transparent',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: me ? (isMobile ? 14 : 18) : (isMobile ? 12 : 16),
          letterSpacing: '-0.025em',
          lineHeight: 1.5,
          color: me ? SUPERWHITE : DARK,
        }}>
          {row.name}
        </span>
      </div>

      {/* Trees */}
      <div style={{ opacity: me ? 1 : 0.8, textAlign: 'center' }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: me ? 700 : 500,
          fontSize: isMobile ? 10 : 12,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: me ? SUPERWHITE : DARK,
          lineHeight: 1.333,
        }}>
          {row.trees}
        </span>
      </div>

      {/* Streak (desktop only) */}
      {!isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: me ? 700 : 900,
            fontSize: me ? 20 : 16,
            color: me ? SUPERWHITE : GREEN,
            lineHeight: 1.5,
            textAlign: 'right',
          }}>
            {row.streak}
          </span>
          <svg width="11" height="16" viewBox="0 0 11 16" fill="none">
            <path
              d="M5.5 0C5.5 0 9.5 3.8 9.5 7.5C9.5 9.8 7.6 11.5 5.5 11.5C3.4 11.5 1.5 9.8 1.5 7.5C1.5 6.7 1.9 5.4 1.9 5.4C1.9 5.4 2.8 7 3.8 7C3.8 4.4 5.5 2.6 5.5 0Z"
              fill={me ? SUPERWHITE : GREEN}
            />
            <path
              d="M5.5 9C5.5 9 7 10 7 11.3C7 12.55 6.38 13.5 5.5 13.5C4.62 13.5 4 12.55 4 11.3C4 10 5.5 9 5.5 9Z"
              fill={me ? 'rgba(250,250,250,0.5)' : 'rgba(0,109,55,0.45)'}
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

function ShowMoreRow({ isMobile }: { isMobile: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(v => !v)}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: isMobile ? '20px 0' : '32px 0',
        borderTop: '1px solid rgba(26,26,26,0.08)',
        cursor: 'pointer',
        opacity: 0.4,
        transition: 'opacity 0.18s',
        userSelect: 'none',
      }}
    >
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? 9 : 10,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: DARK,
      }}>
        {open ? 'Show less' : 'Show more'}
      </span>
      <svg
        width="10" height="7" viewBox="0 0 10 7" fill="none"
        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
      >
        <path d="M1 1.5L5 5.5L9 1.5" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Category toggle ───────────────────────────────────────────────────────────
function CategoryToggle({
  active, onChange, isMobile,
}: {
  active: 'solo' | 'groups';
  onChange: (v: 'solo' | 'groups') => void;
  isMobile: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? 14 : 16,
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        color: DARK,
      }}>
        Category
      </span>

      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        background: SUPERWHITE,
        border: `1px solid ${DARK}`,
        borderRadius: 4,
        padding: 4,
        width: isMobile ? 200 : 245,
        height: isMobile ? 48 : 56,
        boxSizing: 'border-box',
        gap: 4,
      }}>
        {(['solo', 'groups'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 2,
              background: active === tab ? GREEN : 'transparent',
              boxShadow: active === tab ? '0px 1px 2px 0px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.18s, opacity 0.18s',
              opacity: active === tab ? 1 : 0.5,
            }}
          >
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? 12 : 14,
              letterSpacing: '0.025em',
              color: active === tab ? SUPERWHITE : DARK,
            }}>
              {tab === 'solo' ? 'Solo' : 'Groups'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [category, setCategory] = useState<'solo' | 'groups'>('solo');
  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="leaderboard" />}

      <main style={{
        marginLeft: isMobile ? 0 : 101,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        boxSizing: 'border-box',
        paddingBottom: isMobile ? 100 : 0,
      }}>

        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px 0',
          }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: DARK,
              margin: 0,
            }}>
              Leaderboard
            </h1>
          </div>
        )}

        {/* Category toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: isMobile ? 24 : 60,
          paddingBottom: isMobile ? 24 : 48,
        }}>
          <CategoryToggle active={category} onChange={setCategory} isMobile={isMobile} />
        </div>

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            paddingLeft: isMobile ? '16px' : '6.5%',
            paddingRight: isMobile ? '16px' : '6.5%',
          }}
        >
          <Podium isMobile={isMobile} />
        </motion.div>

        {/* Gap */}
        <div style={{ height: isMobile ? 32 : 88 }} />

        {/* Ranking table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            paddingLeft: isMobile ? '16px' : '7.5%',
            paddingRight: isMobile ? '16px' : '7.5%',
          }}
        >
          <RankingTable isMobile={isMobile} />
        </motion.div>

        <div style={{ height: isMobile ? 24 : 60 }} />
      </main>

      {isMobile && <MobileBottomNav activePage="leaderboard" />}
    </div>
  );
}
