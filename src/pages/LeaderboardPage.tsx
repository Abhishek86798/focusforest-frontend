/**
 * LeaderboardPage — Figma node 159:815
 *
 * Layout (matching Figma):
 *  ┌─Sidebar(101px)──────────────────────────────────────────────────────┐
 *  │  Category toggle (Solo | Groups)  [centred, x=691, y=60]           │
 *  │                                                                     │
 *  │  Podium  [x=106, y=242, w=1416, h=388]                             │
 *  │   ┌──2nd──┬──────1st──────┬──3rd──┐                                │
 *  │   │Elena V│ Marcus Thorne │Julian │                                 │
 *  │   │120T   │  120T (green) │ 120T  │                                 │
 *  │   │  ②   │      ①        │  ③   │                                 │
 *  │                                                                     │
 *  │  Ranking table  [x=122, y=718, w=1384]                             │
 *  │   Rank | Name | Trees Completed | Current Streak                   │
 *  │   04   | Sarah Jenkins  | 112 trees | 8  🔥                        │
 *  │ ▶ 05   | Alex Mercer   | 98 trees  | 12 🔥  ← green (current user) │
 *  │   06   | David Chen    | 84 trees  | 4  🔥                         │
 *  │   07   | Amara Okafor  | 77 trees  | 15 🔥                         │
 *  │                    Show more ↓                                      │
 *  └─────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

// ─── Design tokens (from Figma globalVars) ────────────────────────────────────
const BG         = '#F2F2F2';   // White in Figma
const SUPERWHITE = '#FAFAFA';   // Super White
const WHITE      = '#F2F2F2';   // White fill for bg circles
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = '4px 4px 0px 0px rgba(26,26,26,1)';

// ─── Static data from Figma ───────────────────────────────────────────────────

/** Top-3 podium */
const PODIUM = [
  {
    place: 2, name: 'Elena V.',     trees: '120 Trees',
    green: false, avatarSize: 80, barHeight: 140,
  },
  {
    place: 1, name: 'Marcus Thorne', trees: '120 Trees',
    green: true,  avatarSize: 112, barHeight: 192,
  },
  {
    place: 3, name: 'Julian K.',    trees: '120 Trees',
    green: false, avatarSize: 80, barHeight: 112,
  },
];

/** Ranking rows (Figma rows 4,5,6,7) */
const ROWS = [
  { rank: '04', name: 'Sarah Jenkins', trees: '112 trees', streak: 8,  isMe: false },
  { rank: '05', name: 'Alex Mercer',   trees: '98 trees',  streak: 12, isMe: true  }, // highlighted
  { rank: '06', name: 'David Chen',    trees: '84 trees',  streak: 4,  isMe: false },
  { rank: '07', name: 'Amara Okafor', trees: '77 trees',  streak: 15, isMe: false },
];

// ─── Avatar circle ────────────────────────────────────────────────────────────
function AvatarCircle({
  size,
  green,
  label,
}: {
  size: number;
  green: boolean;
  label: string;
}) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Outer border ring */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '12px',
        border: green ? `4px solid ${GREEN}` : `2px solid ${DARK}`,
        boxSizing: 'border-box',
      }} />
      {/* Inner background (number) */}
      <div style={{
        position: 'absolute',
        inset: green ? '8px' : '4px',
        borderRadius: '10px',
        background: green ? GREEN : WHITE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: green
          ? '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)'
          : 'none',
      }}>
        {/* Place number — style_DXR4C9 / style_Z9BSY8: Space Grotesk 900 */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: green ? '16px' : '14px',
          color: green ? SUPERWHITE : DARK,
          lineHeight: 1,
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Podium section ───────────────────────────────────────────────────────────
function Podium() {
  // Order: 2nd, 1st (centre), 3rd
  const order = [PODIUM[0], PODIUM[1], PODIUM[2]];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 0,
      padding: '0 16px',
      width: '100%',
    }}>
      {order.map((p, i) => (
        <motion.div
          key={p.place}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            maxWidth: '440px',
          }}
        >
          {/* Name */}
          <div style={{ marginBottom: '12px', textAlign: 'center' }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: p.place === 1 ? 900 : 700,
              fontSize: p.place === 1 ? '24px' : '18px',
              color: DARK,
              letterSpacing: p.place === 1 ? '-0.025em' : '0',
              lineHeight: 1.3,
            }}>
              {p.name}
            </span>
          </div>

          {/* Tree count bar */}
          {/*
            Figma:
              1st: green fill, black 2px stroke, drop shadow, h=192
              2nd/3rd: superwhite fill, black 1px stroke, drop shadow, h=140/112
          */}
          <div style={{
            width: '100%',
            height: `${p.barHeight}px`,
            background: p.green ? GREEN : SUPERWHITE,
            border: `${p.green ? '2' : '1'}px solid ${DARK}`,
            boxShadow: SHADOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* style_P2HKW1: Space Grotesk 700, 40px, UPPER, center */}
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '40px',
              textTransform: 'uppercase',
              color: p.green ? SUPERWHITE : DARK,
              textAlign: 'center',
              lineHeight: '3.2em',
            }}>
              {p.trees}
            </span>
          </div>

          {/* Avatar circle with place number */}
          <AvatarCircle
            size={p.avatarSize}
            green={p.green}
            label={String(p.place)}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Ranking table ────────────────────────────────────────────────────────────
// Figma: layout_N7GJMC → x=122, y=718, full-width, hug height
// Columns x-positions (from Figma):
//   Rank: x=32    (width ~95)
//   Name: x=143   (width ~652)
//   Trees: x=811  (width ~318)
//   Streak: x=1145 (width ~207) right-aligned

function RankingTable() {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? ROWS : ROWS;

  return (
    <div style={{
      background: SUPERWHITE,
      border: `1px solid ${DARK}`,
      boxShadow: SHADOW,
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      {/* Column header row */}
      <div style={{
        position: 'relative',
        height: '63px',
        borderBottom: `1px solid rgba(26,26,26,0.12)`,
      }}>
        {/* Rank — x=32: style_4IM0AN: Space Grotesk 700, 10px, UPPER, 10% spacing */}
        <ColHeader label="Rank"            left="32px"    align="left"  />
        <ColHeader label="Name"            left="143px"   align="left"  />
        <ColHeader label="Trees Completed" left="55%"     align="left"  />
        <ColHeader label="Current Streak"  right="32px"   align="right" />
      </div>

      {/* Data rows */}
      {visibleRows.map((row, i) => (
        <RankRow key={row.rank} row={row} index={i} isLast={i === visibleRows.length - 1} />
      ))}

      {/* Show more row (layout_T3XUCO: center, padding 32px 0) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        padding: '32px 0',
        borderTop: `1px solid rgba(26,26,26,0.08)`,
        cursor: 'pointer',
        opacity: 0.4,
        transition: 'opacity 0.18s',
      }}
        onClick={() => setShowAll(v => !v)}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.7')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.4')}
      >
        {/* style_QGFX0E: Space Grotesk 700, 10px, UPPER, 20% spacing */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '20%',
          color: DARK,
        }}>
          Show more
        </span>
        {/* Down arrow icon */}
        <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
          <path d="M1 1L5 5L9 1" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function ColHeader({
  label, left, right, align,
}: {
  label: string;
  left?: string;
  right?: string;
  align: 'left' | 'right';
}) {
  return (
    <span style={{
      position: 'absolute',
      top: '50%',
      left,
      right,
      transform: 'translateY(-50%)',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: DARK,
      textAlign: align,
    }}>
      {label}
    </span>
  );
}

function RankRow({ row, index, isLast }: {
  row: (typeof ROWS)[0];
  index: number;
  isLast: boolean;
}) {
  const isMe = row.isMe;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07 }}
      style={{
        position: 'relative',
        background: isMe ? GREEN : 'transparent',
        borderBottom: isLast && !isMe ? 'none' : isMe
          ? `2px solid ${GREEN}` // Figma: strokeWeight 2px 0px (top+bottom)
          : `1px solid rgba(26,28,28,0.1)`,
        boxShadow: isMe ? '0px 4px 12px 0px rgba(46,204,113,0.15)' : 'none',
        padding: '0 32px',
        display: 'grid',
        gridTemplateColumns: '95px 1fr 1fr auto',
        alignItems: 'center',
        minHeight: isMe ? '96px' : '80px',
        gap: '16px',
      }}
    >
      {/* Rank number — style_DNHGXC: Space Grotesk 900, 20px; opacity 0.2 */}
      <div style={{ opacity: isMe ? 1 : 0.2 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: isMe ? '24px' : '20px',
          // Figma: style_1Z2EMD (highlighted) / style_DNHGXC (normal)
          color: isMe ? SUPERWHITE : DARK,
          lineHeight: 1.33,
        }}>
          {row.rank}
        </span>
      </div>

      {/* Name column: avatar circle + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Avatar border circle (layout_3F9EKY: 40×40, borderRadius 12px) */}
        <div style={{
          width: isMe ? '48px' : '40px',
          height: isMe ? '48px' : '40px',
          borderRadius: '12px',
          border: isMe ? `2px solid ${GREEN}` : `1px solid ${DARK}`,
          background: isMe ? SUPERWHITE : 'transparent',
          flexShrink: 0,
        }} />
        {/* Name — style_VL3WGE / style_MK13X8: Space Grotesk 700, 16–18px */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMe ? '18px' : '16px',
          letterSpacing: '-0.025em',
          color: isMe ? SUPERWHITE : DARK,
        }}>
          {row.name}
        </span>
      </div>

      {/* Trees — style_SOBJP1 / style_35DTI9: Space Grotesk 500/700, 12px, UPPER, 10% */}
      <div style={{ opacity: isMe ? 1 : 0.8 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: isMe ? 700 : 500,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: isMe ? SUPERWHITE : DARK,
        }}>
          {row.trees}
        </span>
      </div>

      {/* Streak + flame icon — right-aligned */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '6px',
      }}>
        {/* Streak number — style_QSHJU9 / style_D0VJJV: Space Grotesk 900, 16–20px */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: isMe ? '20px' : '16px',
          color: isMe ? SUPERWHITE : GREEN,
          lineHeight: 1.5,
          textAlign: 'right',
        }}>
          {row.streak}
        </span>
        {/* Flame icon (Figma IMAGE-SVG) */}
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <path
            d="M7 0C7 0 11.5 4.5 11.5 8.5C11.5 11.0376 9.5376 13 7 13C4.4624 13 2.5 11.0376 2.5 8.5C2.5 7.5 3 6 3 6C3 6 4 8 5 8C5 5 7 3 7 0Z"
            fill={isMe ? SUPERWHITE : GREEN}
            opacity={isMe ? 0.9 : 0.85}
          />
          <path
            d="M7 10C7 10 8.5 11 8.5 12.5C8.5 13.8807 7.88071 15 7 15C6.11929 15 5.5 13.8807 5.5 12.5C5.5 11 7 10 7 10Z"
            fill={isMe ? 'rgba(250,250,250,0.6)' : 'rgba(0,109,55,0.5)'}
          />
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Category toggle ──────────────────────────────────────────────────────────
// Figma: layout_EW7ZMZ → x=691, y=60, w=245; solo+groups toggle pill
function CategoryToggle({
  active,
  onChange,
}: {
  active: 'solo' | 'groups';
  onChange: (v: 'solo' | 'groups') => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    }}>
      {/* "Category" label — style_CSY2H8: Space Grotesk 700, 16px, UPPER, 7.5% */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        color: DARK,
        textAlign: 'center',
      }}>
        Category
      </span>
      {/* Toggle pill (layout_J2BTG7: w=245, h=56, padding 4px 16px) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: SUPERWHITE,
        border: `1px solid ${DARK}`,
        borderRadius: '4px',
        padding: '4px 16px',
        width: '245px',
        height: '56px',
        boxSizing: 'border-box',
        gap: '8px',
      }}>
        {/* Solo tab (layout_7E5TTT: padding 10px 32px) */}
        <button
          onClick={() => onChange('solo')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: '2px',
            background: active === 'solo' ? GREEN : 'transparent',
            boxShadow: active === 'solo' ? '0px 1px 2px 0px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            transition: 'background 0.18s',
            opacity: active === 'solo' ? 1 : 0.5,
          }}
        >
          {/* style_4GLPQR: Space Grotesk 700, 14px, 2.5% */}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.025em',
            color: active === 'solo' ? SUPERWHITE : DARK,
          }}>
            Solo
          </span>
        </button>
        {/* Groups tab */}
        <button
          onClick={() => onChange('groups')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: '2px',
            background: active === 'groups' ? GREEN : 'transparent',
            boxShadow: active === 'groups' ? '0px 1px 2px 0px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            transition: 'background 0.18s',
            opacity: active === 'groups' ? 1 : 0.5,
          }}
        >
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.025em',
            color: active === 'groups' ? SUPERWHITE : DARK,
          }}>
            Groups
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [category, setCategory] = useState<'solo' | 'groups'>('solo');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="leaderboard" />

      <main style={{
        marginLeft: '101px',
        flex: 1,
        padding: '32px 32px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        boxSizing: 'border-box',
      }}>

        {/* ── Category toggle (centred) ── */}
        {/* Figma: x=691 from left edge → ~691-101=590 from sidebar → ~centred in content */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CategoryToggle active={category} onChange={setCategory} />
        </div>

        {/* ── Podium ── */}
        {/* Figma: x=106, y=242 relative to main window */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Podium />
        </motion.div>

        {/* ── Ranking table ── */}
        {/* Figma: x=122, y=718 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <RankingTable />
        </motion.div>

        {/* Bottom spacer */}
        <div style={{ height: '24px' }} />
      </main>
    </div>
  );
}
