/**
 * LeaderboardPage — Figma node 159:815
 *
 * Canvas: 1728 × 1259 | Sidebar: w=101px | Main window: w=1627px
 *
 * Exact Figma measurements used:
 *  • Podium frame (layout_WJZ23G)  : x=106, y=242, w=1416, h=388
 *    - 2nd Place (layout_AVQ003)   : x=16,  w=440, h=284
 *    - 1st Place (layout_QPVA3A)   : x=488, w=440, h=388
 *    - 3rd Place                   : x=960, w=440
 *    → All columns equal (440px), gap=32px, outer margin=16px
 *  • Table (layout_774AGG)         : x=122, y=718, w=1384
 *    - Row padding                 : 20px 32px  (from layout_L5Q5RJ / TII344)
 *    - Highlighted row             : 24px 32px  (from layout_4PEMHA)
 *    - Header height: 63px, cols:
 *        Rank x=32 w=95 | Name x=143 w=652 | Trees x=811 w=318 | Streak x=1145 w=207
 *
 *  Horizontal padding:
 *    Podium  → 106/1627 = 6.5% of content width
 *    Table   → 122/1627 = 7.5% of content width
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const SUPERWHITE = '#FAFAFA';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = '4px 4px 0px 0px rgba(26, 26, 26, 1)';

// ─── Static data ───────────────────────────────────────────────────────────────
// Figma: all three podium bars are the SAME width (440px each),
// they differ only in height: 1st=192, 2nd=140, 3rd=112
const PODIUM = [
  { place: 2, name: 'Elena V.',      trees: '120 Trees', green: false, barH: 140, badgeSize: 80  },
  { place: 1, name: 'Marcus Thorne', trees: '120 Trees', green: true,  barH: 192, badgeSize: 112 },
  { place: 3, name: 'Julian K.',     trees: '120 Trees', green: false, barH: 112, badgeSize: 80  },
];

const ROWS = [
  { rank: '04', name: 'Sarah Jenkins', trees: '112 Trees', streak: 8,  isMe: false },
  { rank: '05', name: 'Alex Mercer',   trees: '98 Trees',  streak: 12, isMe: true  },
  { rank: '06', name: 'David Chen',    trees: '84 Trees',  streak: 4,  isMe: false },
  { rank: '07', name: 'Amara Okafor', trees: '77 Trees',  streak: 15, isMe: false },
];

// ─── AvatarBadge ───────────────────────────────────────────────────────────────
// Figma: border frame (OX7789: 80×80, stroke 2px, radius 12px, padding 4px)
//        inner fill  (2PDJGJ: 32×32 centered — for 2nd/3rd)
// For 1st: border is 112×112 (6QKNH7, stroke 4px, radius 12px, padding 4px)
//           inner fill is 40×40 (84GL9F, green, radius centred inside)
function AvatarBadge({ place, green }: { place: number; green: boolean }) {
  const outer = green ? 112 : 80;
  const innerSize = green ? 40 : 32;
  const borderWidth = green ? 4 : 2;
  const borderColour = green ? GREEN : DARK;

  return (
    <div style={{
      width: outer,
      height: outer,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Outer border ring */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 12,
        border: `${borderWidth}px solid ${borderColour}`,
        boxSizing: 'border-box',
      }} />
      {/* Inner fill with place number — absolutely centred */}
      <div style={{
        position: 'absolute',
        width: innerSize,
        height: innerSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: 8,
        background: green ? GREEN : BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: green
          ? '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)'
          : 'none',
      }}>
        {/* style_J1XPEE (2/3): Space Grotesk 900, 14px
            style_5F2DJV (1):   Space Grotesk 900, 16px */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: green ? 16 : 14,
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
// Three equal columns (flex: 1 each) with 32px gap between them.
// Outer container has 16px padding on each side (matching Figma x=16 for 2nd/3rd).
// The parent wrapper adds the 6.5% page-level padding.
function Podium() {
  return (
    // inner: 16px edge margins, 32px col gaps — matches layout_AVQ003 / QPVA3A positions
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 32,
      padding: '0 16px',
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
            flex: 1,            // all three columns equal (440px each in Figma)
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Name — style_JPYRDY (2,3): Space Grotesk 700, 18px, centre
                    style_KIVBQ7 (1)  : Space Grotesk 900, 24px, −2.5% ls */}
          <div style={{
            paddingBottom: 16,
            paddingTop: 16,
            textAlign: 'center',
            width: '100%',
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: p.green ? 900 : 700,
              fontSize: p.green ? 24 : 18,
              letterSpacing: p.green ? '-0.025em' : '0',
              lineHeight: p.green ? 1.333 : 1.556,
              color: DARK,
              display: 'block',
              textAlign: 'center',
            }}>
              {p.name}
            </span>
          </div>

          {/* Bar — Figma style_W4NMUP: Space Grotesk 700, 40px, UPPER, lh=3.2em
              1st: green fill + black 2px stroke + drop shadow, h=192
              2nd: superwhite fill + black 1px stroke + drop shadow, h=140
              3rd: superwhite fill + black 1px stroke + drop shadow, h=112  */}
          <div style={{
            width: '100%',
            height: p.barH,
            background: p.green ? GREEN : SUPERWHITE,
            border: `${p.green ? 2 : 1}px solid ${DARK}`,
            boxShadow: SHADOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: '0 12px',
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(20px, 2.8vw, 40px)',
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
          <AvatarBadge place={p.place} green={p.green} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Ranking table ─────────────────────────────────────────────────────────────
// Figma column x-positions (within 1384px table, 32px side padding):
//   Rank:   x=32,    w=95px
//   Name:   x=143,   w=652px  (avatar 40×40 + 16px gap + name text)
//   Trees:  x=811,   w=318px
//   Streak: x=1145,  w=207px  (right-aligned)
//
// CSS grid: '95px 1fr 220px 160px' + padding 0 32px reproduces these positions
const COL_GRID = '95px 1fr 220px 160px';

function RankingTable() {
  return (
    <div style={{
      background: SUPERWHITE,
      border: `1px solid ${DARK}`,
      boxShadow: SHADOW,
      borderRadius: 4,
      overflow: 'hidden',
    }}>

      {/* Header row — h=63px, style_CTWW63: SG 700, 10px, UPPER, 10% ls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: COL_GRID,
        alignItems: 'center',
        padding: '0 32px',
        height: 63,
        borderBottom: '1px solid rgba(26,26,26,0.12)',
        boxSizing: 'border-box',
      }}>
        {(['Rank', 'Name', 'Trees Completed', 'Current Streak'] as const).map((label, idx) => (
          <span key={label} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: DARK,
            // Streak header is right-aligned (style_M2M75E)
            textAlign: idx === 3 ? 'right' : 'left',
          }}>
            {label}
          </span>
        ))}
      </div>

      {/* Data rows */}
      {ROWS.map((row, i) => (
        <RankRow
          key={row.rank}
          row={row}
          index={i}
          isLast={i === ROWS.length - 1}
        />
      ))}

      {/* Show more — layout_VQALLZ: center, padding 32px 0 */}
      <ShowMoreRow />
    </div>
  );
}

function RankRow({
  row, index, isLast,
}: {
  row: typeof ROWS[0];
  index: number;
  isLast: boolean;
}) {
  const me = row.isMe;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.28 }}
      style={{
        display: 'grid',
        gridTemplateColumns: COL_GRID,
        alignItems: 'center',
        // Figma: normal rows padding 20px 32px, highlighted row padding 24px 32px
        padding: me ? '24px 32px' : '20px 32px',
        boxSizing: 'border-box',
        background: me ? GREEN : 'transparent',
        // Figma: highlighted row has 2px green stroke on top+bottom
        borderTop:    me ? `2px solid ${GREEN}` : 'none',
        borderBottom: me
          ? `2px solid ${GREEN}`
          : isLast ? 'none' : '1px solid rgba(26,26,26,0.1)',
        boxShadow: me ? '0px 4px 12px 0px rgba(46, 204, 113, 0.15)' : 'none',
      }}
    >
      {/* Rank — style_IRPU2R (normal): SG 900, 20px / style_5TBYI5 (me): SG 700, 24px
          opacity 0.2 for non-highlighted (layout_QC53IF opacity=0.2) */}
      <div style={{ opacity: me ? 1 : 0.2 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: me ? 700 : 900,
          fontSize: me ? 24 : 20,
          color: me ? SUPERWHITE : DARK,
          lineHeight: me ? 1.333 : 1.4,
          display: 'block',
        }}>
          {row.rank}
        </span>
      </div>

      {/* Name: avatar square + name text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Avatar — layout_SNO9J4: 40×40 radius 12px stroke 1px
                    layout_5M5TPZ (me): 48×48 radius 12px stroke 2px */}
        <div style={{
          width:  me ? 48 : 40,
          height: me ? 48 : 40,
          borderRadius: 12,
          border: me ? `2px solid ${SUPERWHITE}` : `1px solid ${DARK}`,
          background: me ? 'rgba(255,255,255,0.12)' : 'transparent',
          flexShrink: 0,
        }} />
        {/* style_OMW1GL: SG 700, 16px, −2.5% ls | style_C7PVWG (me): SG 700, 18px */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: me ? 18 : 16,
          letterSpacing: '-0.025em',
          lineHeight: 1.5,
          color: me ? SUPERWHITE : DARK,
        }}>
          {row.name}
        </span>
      </div>

      {/* Trees — style_9M3XXP: SG 500, 12px, UPPER, 10% ls (opacity 0.8)
                 style_QRZEVA (me): SG 700, 12px, UPPER, 10% ls */}
      <div style={{ opacity: me ? 1 : 0.8 }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: me ? 700 : 500,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: me ? SUPERWHITE : DARK,
          lineHeight: 1.333,
        }}>
          {row.trees}
        </span>
      </div>

      {/* Streak + flame — layout_B8KPDU: row, flex-end, gap 5.99px */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
      }}>
        {/* style_PZBRS6: SG 900, 16px, right-aligned | style_K7A7JM (me): SG 700, 20px */}
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
        {/* Flame SVG */}
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
    </motion.div>
  );
}

function ShowMoreRow() {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(v => !v)}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.65')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = '0.4')}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        // layout_VQALLZ: padding 32px 0
        padding: '32px 0',
        borderTop: '1px solid rgba(26,26,26,0.08)',
        cursor: 'pointer',
        opacity: 0.4,
        transition: 'opacity 0.18s',
        userSelect: 'none',
      }}
    >
      {/* style_7KB821: SG 700, 10px, UPPER, 20% ls */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 10,
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
  active, onChange,
}: {
  active: 'solo' | 'groups';
  onChange: (v: 'solo' | 'groups') => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* "CATEGORY" label — style_0631J8: SG 700, 16px, UPPER, 7.5% ls */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: '0.075em',
        color: DARK,
      }}>
        Category
      </span>

      {/* Toggle pill — w=245, h=56, 1px border, 4px radius, padding 4px */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        background: SUPERWHITE,
        border: `1px solid ${DARK}`,
        borderRadius: 4,
        padding: 4,
        width: 245,
        height: 56,
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
            {/* style_I14GO6: SG 700, 14px, 2.5% ls */}
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 14,
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="leaderboard" />

      <main style={{
        marginLeft: 101,      // sidebar width
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}>

        {/* ── Category toggle — centred, paddingTop=60px (Figma y≈60) ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 60,
          paddingBottom: 48,
        }}>
          <CategoryToggle active={category} onChange={setCategory} />
        </div>

        {/* ── Podium — 6.5% horizontal padding (= 106px at 1627px canvas) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            paddingLeft: '6.5%',
            paddingRight: '6.5%',
          }}
        >
          <Podium />
        </motion.div>

        {/* Gap: podium bottom → table top ≈ 88px (y=718 − (y=242+h=388) = 88) */}
        <div style={{ height: 88 }} />

        {/* ── Ranking table — 7.5% horizontal padding (= 122px at 1627px canvas) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            paddingLeft: '7.5%',
            paddingRight: '7.5%',
          }}
        >
          <RankingTable />
        </motion.div>

        <div style={{ height: 60 }} />
      </main>
    </div>
  );
}
