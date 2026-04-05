/**
 * GroupsPage — pixel-faithful implementation of Figma node 156:257
 * Static mock data; API integration will follow after design sign-off.
 *
 * Layout (matching Figma absolute positions scaled to flex):
 *  ┌─Sidebar 101px─┬─Left panel 549px──────────┬─Right area 766px────────────┐
 *  │               │  Your Groups header        │  MEMBERS table (h≈483)     │
 *  │               │  ─ Active card (green)     │  MEMBERS table cont.       │
 *  │               │  ─ Inactive card           ├────────────────────────────┤
 *  │               │  ─ Inactive card           │  Stats 2×2 grid (h≈494)   │
 *  │               │  CREATE GROUP button       │                            │
 *  ├───────────────┴────────────────────────────┴────────────────────────────┤
 *  │  THIS WEEK calendar (full width)                                        │
 *  └─────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

// ─── Exact design tokens from Figma ──────────────────────────────────────────
const BG         = '#F2F2F2';   // page background (White in Figma)
const WHITE      = '#FFFFFF';   // card backgrounds (fill_INIITN)
const SUPERWHITE = '#FAFAFA';   // button/panel fills
const GREEN      = '#006D37';   // primary green
const DARK       = '#1A1A1A';   // Black in Figma
const SHADOW     = `4px 4px 0px 0px ${DARK}`;
const BORDER2    = `2px solid ${DARK}`;

// ─── Static mock data (from Figma) ───────────────────────────────────────────
const GROUPS = [
  { id: '1', name: 'The Pine Nuts', activeCount: 4, subtitle: 'Deep Work Collective', active: true  },
  { id: '2', name: 'The Pine Nuts', activeCount: 2, subtitle: 'Deep Work Collective', active: false },
  { id: '3', name: 'The Pine Nuts', activeCount: 3, subtitle: 'Deep Work Collective', active: false },
];

const MEMBERS = [
  { name: 'Marcus Thorne', status: 'focus' as const, streak: 42, contribution: 842 },
  { name: 'Elena Vance',   status: 'afk'   as const, streak: 12, contribution: 512 },
  { name: 'Julian K.',     status: 'focus' as const, streak: 28, contribution: 389 },
];

const STATS = [
  { label: 'Total Minutes',    value: '1000', green: false },
  { label: 'Trees Completed',  value: '30',   green: false },
  { label: 'Sessions',         value: '60',   green: false },
  { label: 'Todays Tree Count',value: '6',    green: true  },
];

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Figma Light Green for focus session badge bg */
const FOCUS_BG     = 'rgba(187,233,194,0.5)';
const FOCUS_BORDER = `1px solid ${GREEN}`;

/** AFK badge colours */
const AFK_BG     = '#EEEEEE';
const AFK_BORDER = '1px solid rgba(26,28,28,0.1)';
const AFK_DOT    = 'rgba(26,28,28,0.2)';
const AFK_TEXT   = 'rgba(26,28,28,0.4)';

function StatusBadge({ status }: { status: 'focus' | 'afk' }) {
  const isFocus = status === 'focus';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      background: isFocus ? FOCUS_BG : AFK_BG,
      border: isFocus ? FOCUS_BORDER : AFK_BORDER,
      borderRadius: '9999px',
    }}>
      {/* dot */}
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: isFocus ? GREEN : AFK_DOT,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      {/* label — Inter 900, 10px, uppercase (Figma style_MK6CKX) */}
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 900,
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '-0.05em',
        color: isFocus ? GREEN : AFK_TEXT,
      }}>
        {isFocus ? 'Focus Session' : 'AFK'}
      </span>
    </div>
  );
}

/** Empty avatar circle (layout_XPVF9Y: 48×48, border-radius 9999px) */
function Avatar() {
  return (
    <div style={{
      width: 48, height: 48,
      borderRadius: '9999px',
      border: `1px solid ${DARK}`,
      background: SUPERWHITE,
      flexShrink: 0,
    }} />
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────
// Figma: layout_GRYLEX → x=111, y=83, width=549, height=1014
// We render it as flex-shrink-0, 549px wide.

function LeftPanel({ selectedId, onSelect }: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{
      width: '549px',
      flexShrink: 0,
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      overflow: 'hidden',
      alignSelf: 'flex-start', // don't stretch to fill full height
    }}>

      {/* ── Header (layout_QA9KQN) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '36px 36px 24px',
      }}>
        {/* "Your Groups" — style_8JABUP (implied Space Grotesk bold) */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '24px',
          color: DARK,
          letterSpacing: '-0.01em',
        }}>
          Your Groups
        </span>
        {/* Group icon (two people silhouette) */}
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M20 26V23.5C20 22.1739 19.4732 20.9022 18.5355 19.9645C17.5978 19.0268 16.3261 18.5 15 18.5H7.5C6.17392 18.5 4.90215 19.0268 3.96447 19.9645C3.02678 20.9022 2.5 22.1739 2.5 23.5V26" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.25 13.5C13.7353 13.5 15.75 11.4853 15.75 9C15.75 6.51472 13.7353 4.5 11.25 4.5C8.76472 4.5 6.75 6.51472 6.75 9C6.75 11.4853 8.76472 13.5 11.25 13.5Z" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M27.5 26V23.5C27.4992 22.3783 27.1122 21.2893 26.4018 20.4084C25.6913 19.5274 24.7 18.9076 23.5938 18.6562" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.0938 4.65625C21.2028 4.90608 22.197 5.52638 22.9093 6.40888C23.6216 7.29138 24.009 8.38244 24.009 9.50781C24.009 10.6332 23.6216 11.7242 22.9093 12.6067C22.197 13.4892 21.2028 14.1095 20.0938 14.3594" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* ── Group cards ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0 36px',
      }}>
        {GROUPS.map((group, i) => {
          const isSelected = group.id === selectedId;
          // Active group is always green in the Figma design;
          // additionally highlight whichever the user clicked.
          const isGreen = group.active || isSelected;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(group.id)}
              style={{
                background: isGreen ? GREEN : SUPERWHITE,
                border: `1.52px solid ${DARK}`,
                boxShadow: SHADOW,
                borderRadius: '4px',
                padding: '20px 24px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                transition: 'transform 0.12s',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Row: name + badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Group name — style_5K8LLN: Space Grotesk 700, ~22px */}
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  color: isGreen ? SUPERWHITE : DARK,
                  letterSpacing: '-0.01em',
                }}>
                  {group.name}
                </span>

                {/* "N Active" badge (layout_3IE9U8) */}
                <div style={{
                  background: isGreen ? SUPERWHITE : GREEN,
                  borderRadius: '4px',
                  padding: '4px 12px',
                }}>
                  {/* style_7JK120: Space Grotesk 700, ~12px */}
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    color: isGreen ? DARK : SUPERWHITE,
                    letterSpacing: '0.02em',
                  }}>
                    {group.activeCount} Active
                  </span>
                </div>
              </div>

              {/* Subtitle — style_FR4ICG, opacity 0.8 */}
              <div style={{ marginTop: '18px', opacity: 0.8 }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  color: isGreen ? SUPERWHITE : DARK,
                }}>
                  {group.subtitle}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── CREATE GROUP dashed button ── */}
      {/* Figma: layout_HBG3A4: x=56, y=849 inside the panel, 437×131, dashed border */}
      <div style={{ padding: '24px 36px 36px' }}>
        <button
          id="create-group-btn"
          style={{
            width: '100%',
            height: '96px',
            border: `1.52px dashed ${DARK}`,
            borderRadius: '4px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.18s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.9')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.6')}
        >
          {/* ⊕ icon (layout_TN7M8O, 21×30) */}
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            <circle cx="10.5" cy="10.5" r="9.5" stroke={DARK} strokeWidth="1.52"/>
            <path d="M10.5 5.5V15.5M5.5 10.5H15.5" stroke={DARK} strokeWidth="1.52" strokeLinecap="round"/>
          </svg>
          {/* "CREATE GROUP" — style_LXWYHV: Space Grotesk 700, 18px, uppercase */}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: DARK,
          }}>
            Create Group
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Members table ────────────────────────────────────────────────────────────
// Figma: layout_IHG198 → x=750, y=83, width=766, height=483
// padding: 32px, gap: 32px between header & table

function MembersTable({ onDeleteGroup }: { onDeleteGroup?: () => void }) {
  return (
    <div style={{
      background: WHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      padding: '32px',
      gap: '32px',
    }}>
      {/* Header row (layout_K5K799) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* "MEMBERS" — style_NFDTCD: Space Grotesk 700, 24px, UPPER, -5% tracking */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '24px',
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          color: DARK,
        }}>
          Members
        </span>
        {/* DELETE GROUP button — layout_7XAHX7: 8px 16px padding */}
        <button
          id="delete-group-btn"
          onClick={onDeleteGroup}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: DARK,
            background: SUPERWHITE,
            border: `1px solid ${DARK}`,
            borderRadius: '2px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Delete Group
        </button>
      </div>

      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Column headers (layout_KZASGM: 46px tall, 0 10px padding) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 0.7fr',
          padding: '0 10px',
          height: '46px',
          alignItems: 'center',
          borderBottom: `1px solid rgba(26,28,28,0.1)`,
        }}>
          {/* MEMBER — style_UWMCEY: Space Grotesk 700, 10px, LEFT, 10% spacing */}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '10%',
            color: DARK, textAlign: 'left',
          }}>Member</span>
          {/* CURRENT STATUS — style_QB0VUF: center */}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'center',
          }}>Current Status</span>
          {/* PERSONAL STREAK — style_QB0VUF: center */}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'center',
          }}>Personal Streak</span>
          {/* CONTRIBUTION — style_YVT5CI: right */}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'right',
          }}>Contribution</span>
        </div>

        {/* Data rows (layout_EHNSGB: column, gap: -1px, 0 10px padding, h=290) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 10px',
        }}>
          {MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.08 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 0.7fr',
                alignItems: 'center',
                borderBottom: i < MEMBERS.length - 1
                  ? `1px solid rgba(26,28,28,0.1)` : 'none',
                padding: '0',
              }}
            >
              {/* Member cell (layout_FUJ7DM: row, gap 16px, padding 24px 1px) */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '24px 1px',
              }}>
                <Avatar />
                {/* name — style_56HTO2: Space Grotesk 700, 16px */}
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '16px',
                  color: DARK,
                }}>
                  {member.name}
                </span>
              </div>

              {/* Status cell (layout_I1DTCH: center, padding 37.5px 1px) */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                padding: '37.5px 1px',
              }}>
                <StatusBadge status={member.status} />
              </div>

              {/* Streak cell (layout_C5FU92: center, padding 34.5px 1px) */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                padding: '34.5px 1px',
              }}>
                {/* style_ZZXSK7: Space Grotesk 700, 20px, center */}
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '20px',
                  color: DARK, textAlign: 'center',
                }}>
                  {member.streak} Days
                </span>
              </div>

              {/* Contribution cell (layout_INGETY: flex-end, padding 32px 1px 33px) */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                padding: '32px 1px 33px',
              }}>
                {/* style_FMVVGC: Space Grotesk 900, 24px, right */}
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900, fontSize: '24px',
                  color: DARK, textAlign: 'right',
                }}>
                  {member.contribution}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats 2×2 grid ───────────────────────────────────────────────────────────
// Figma: layout_HI55DY → x=750, y=603, width=766, height=494
// Inner: layout_AHHZOV: row, gap=56, inside 56px 48px padding
// Each column (layout_0Z5UMA): column, gap=18px, width=299
// Each card (layout_217P93): padding=32px, height=190, gap=16

function StatsGrid() {
  return (
    <div style={{
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      padding: '48px 56px',
    }}>
      {/* 2×2 grid: TotalMinutes | TreesCompleted / Sessions | TodayTreeCount */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '18px',
      }}>
        {STATS.map(card => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>
    </div>
  );
}


function StatCard({ card }: { card: (typeof STATS)[0] }) {
  return (
    <div style={{
      background: card.green ? GREEN : WHITE,
      border: BORDER2,
      boxShadow: `4px 4px 0px 0px ${DARK}`,
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '16px',
      height: '190px',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
    }}>
      {/* Label — style_AVPIKZ: Space Grotesk 700, 12px, UPPER, center */}
      <div>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: card.green ? SUPERWHITE : '#3D4A3E',
          display: 'block',
          textAlign: 'center',
        }}>
          {card.label}
        </span>
      </div>
      {/* Value — style_WFRDJZ: Space Grotesk 700, **60px**, center */}
      <div>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '60px',
          lineHeight: '1em',
          color: card.green ? SUPERWHITE : '#1A1C1C',
          display: 'block',
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}>
          {card.value}
        </span>
      </div>
    </div>
  );
}

// ─── Weekly calendar ──────────────────────────────────────────────────────────
// Figma: layout_H65X23 → x=111, y=1154, width=1405, padding=32, gap=32
// Header: "THIS WEEK" (Space Grotesk 900, 30px, UPPER) + "OCT 21 - OCT 27" (Inter 600, 16px)
// Days: Mon/Tue/Wed = solid border; Thu/Fri/Sat/Sun = dashed, opacity 0.4
// Wed = Green bg; Mon/Tue = white bg

function WeeklySection() {
  // Calculate current week dates for the range label
  const today    = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const adjustedToday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon

  const monday = new Date(today);
  monday.setDate(today.getDate() - adjustedToday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const rangeLabel = `${fmtDate(monday)} - ${fmtDate(sunday)}`;

  // Day state: 0=Mon..6=Sun; past = completed, today = active green, future = dashed
  const dayStates = WEEK_DAYS.map((_, i) => ({
    isPast:   i < adjustedToday,
    isToday:  i === adjustedToday,
    isFuture: i > adjustedToday,
  }));

  return (
    <div style={{
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    }}>

      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        {/* "THIS WEEK" — style_XG34MP: Space Grotesk 900, 30px, UPPER */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: '30px',
          textTransform: 'uppercase',
          color: DARK,
          lineHeight: '1.2em',
        }}>
          This Week
        </span>
        {/* "OCT 21 - OCT 27" — style_EOSVKH: Inter 600, 16px */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '16px',
          color: DARK,
          letterSpacing: '0.04em',
        }}>
          {rangeLabel}
        </span>
      </div>

      {/* 7 day columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '12px',
      }}>
        {WEEK_DAYS.map((day, i) => {
          const { isPast, isToday, isFuture } = dayStates[i];

          return (
            <div
              key={day}
              style={{
                border: `2px ${isFuture ? 'dashed' : 'solid'} ${DARK}`,
                borderRadius: '4px',
                background: isToday ? GREEN : SUPERWHITE,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '16px',
                minHeight: '140px',
                opacity: isFuture ? 0.4 : 1,
                boxSizing: 'border-box',
              }}
            >
              {/* Day label — style_KR1POR: Space Grotesk 900, 12px, UPPER */}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: '12px',
                textTransform: 'uppercase',
                color: isToday ? 'rgba(250,250,250,0.9)' : DARK,
                opacity: isToday ? 1 : 0.6,
                letterSpacing: '0.02em',
              }}>
                {day}
              </span>

              {/* Tree SVG icon (Figma shows IMAGE-SVG tree) */}
              {!isFuture && (
                <svg
                  width="30"
                  height="35"
                  viewBox="0 0 30 35"
                  fill="none"
                >
                  {/* Simple stylised tree */}
                  <polygon
                    points="15,2 28,26 2,26"
                    fill={isToday ? SUPERWHITE : GREEN}
                    stroke={isToday ? 'rgba(250,250,250,0.5)' : DARK}
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="15,10 24,28 6,28"
                    fill={isToday ? 'rgba(250,250,250,0.85)' : `${GREEN}cc`}
                  />
                  <rect
                    x="12.5" y="26" width="5" height="7"
                    rx="1"
                    fill={isToday ? 'rgba(250,250,250,0.7)' : '#7B4F2E'}
                    stroke={isToday ? 'rgba(250,250,250,0.4)' : DARK}
                    strokeWidth="1"
                  />
                </svg>
              )}

              {/* Check / circle icon (Figma shows IMAGE-SVG check) */}
              {!isFuture && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10" cy="10" r="9"
                    stroke={isToday ? 'rgba(250,250,250,0.55)' : 'rgba(26,26,26,0.25)'}
                    strokeWidth="1.5"
                  />
                  {(isPast || isToday) && (
                    <path
                      d="M6 10L8.8 13L14 7"
                      stroke={isToday ? 'rgba(250,250,250,0.9)' : 'rgba(26,26,26,0.55)'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GroupsPage() {
  const [selectedId, setSelected] = useState<string>('1');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="groups" />

      {/* Main content (after 101px sidebar) */}
      <div style={{
        marginLeft: '101px',
        flex: 1,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
      }}>

        {/* ── Top area: Left panel + Right panels side by side ── */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
        }}>

          {/* Left: Your Groups */}
          <LeftPanel
            selectedId={selectedId}
            onSelect={setSelected}
          />

          {/* Right column: Members + Stats stacked */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <MembersTable />
            <StatsGrid />
          </div>
        </div>

        {/* ── Bottom: THIS WEEK calendar (full width) ── */}
        <WeeklySection />

        {/* Bottom spacer */}
        <div style={{ height: '24px' }} />
      </div>
    </div>
  );
}
