/**
 * GroupsPage — Responsive implementation
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Design tokens ──────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const WHITE      = '#FFFFFF';
const SUPERWHITE = '#FAFAFA';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = `4px 4px 0px 0px ${DARK}`;
const BORDER2    = `2px solid ${DARK}`;

// ─── Static mock data ───────────────────────────────────────────────────────
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
const FOCUS_BG     = 'rgba(187,233,194,0.5)';
const FOCUS_BORDER = `1px solid ${GREEN}`;
const AFK_BG       = '#EEEEEE';
const AFK_BORDER   = '1px solid rgba(26,28,28,0.1)';
const AFK_DOT      = 'rgba(26,28,28,0.2)';
const AFK_TEXT     = 'rgba(26,28,28,0.4)';

function StatusBadge({ status, isMobile }: { status: 'focus' | 'afk'; isMobile: boolean }) {
  const isFocus = status === 'focus';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isMobile ? '4px' : '6px',
      padding: isMobile ? '3px 8px' : '4px 12px',
      background: isFocus ? FOCUS_BG : AFK_BG,
      border: isFocus ? FOCUS_BORDER : AFK_BORDER,
      borderRadius: '9999px',
    }}>
      <span style={{
        width: isMobile ? '4px' : '6px',
        height: isMobile ? '4px' : '6px',
        borderRadius: '50%',
        background: isFocus ? GREEN : AFK_DOT,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 900,
        fontSize: isMobile ? '8px' : '10px',
        textTransform: 'uppercase',
        letterSpacing: '-0.05em',
        color: isFocus ? GREEN : AFK_TEXT,
      }}>
        {isFocus ? 'Focus' : 'AFK'}
      </span>
    </div>
  );
}

function Avatar({ size = 48 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '9999px',
      border: `1px solid ${DARK}`,
      background: SUPERWHITE,
      flexShrink: 0,
    }} />
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────
function LeftPanel({ selectedId, onSelect, isMobile }: {
  selectedId: string;
  onSelect: (id: string) => void;
  isMobile: boolean;
}) {
  return (
    <div style={{
      width: isMobile ? '100%' : '549px',
      flexShrink: 0,
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      overflow: 'hidden',
      alignSelf: 'flex-start',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '24px 20px 16px' : '36px 36px 24px',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '20px' : '24px',
          color: DARK,
          letterSpacing: '-0.01em',
        }}>
          Your Groups
        </span>
        <svg width={isMobile ? '24' : '30'} height={isMobile ? '24' : '30'} viewBox="0 0 30 30" fill="none">
          <path d="M20 26V23.5C20 22.1739 19.4732 20.9022 18.5355 19.9645C17.5978 19.0268 16.3261 18.5 15 18.5H7.5C6.17392 18.5 4.90215 19.0268 3.96447 19.9645C3.02678 20.9022 2.5 22.1739 2.5 23.5V26" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11.25 13.5C13.7353 13.5 15.75 11.4853 15.75 9C15.75 6.51472 13.7353 4.5 11.25 4.5C8.76472 4.5 6.75 6.51472 6.75 9C6.75 11.4853 8.76472 13.5 11.25 13.5Z" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M27.5 26V23.5C27.4992 22.3783 27.1122 21.2893 26.4018 20.4084C25.6913 19.5274 24.7 18.9076 23.5938 18.6562" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.0938 4.65625C21.2028 4.90608 22.197 5.52638 22.9093 6.40888C23.6216 7.29138 24.009 8.38244 24.009 9.50781C24.009 10.6332 23.6216 11.7242 22.9093 12.6067C22.197 13.4892 21.2028 14.1095 20.0938 14.3594" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Group cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '12px' : '16px',
        padding: isMobile ? '0 20px' : '0 36px',
      }}>
        {GROUPS.map((group, i) => {
          const isSelected = group.id === selectedId;
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
                padding: isMobile ? '16px' : '20px 24px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                transition: 'transform 0.12s',
              }}
            >
              {/* Row: name + badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? '16px' : '22px',
                  color: isGreen ? SUPERWHITE : DARK,
                  letterSpacing: '-0.01em',
                }}>
                  {group.name}
                </span>

                <div style={{
                  background: isGreen ? SUPERWHITE : GREEN,
                  borderRadius: '4px',
                  padding: isMobile ? '3px 8px' : '4px 12px',
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? '10px' : '12px',
                    color: isGreen ? DARK : SUPERWHITE,
                    letterSpacing: '0.02em',
                  }}>
                    {group.activeCount} Active
                  </span>
                </div>
              </div>

              {/* Subtitle */}
              <div style={{ marginTop: isMobile ? '12px' : '18px', opacity: 0.8 }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: isMobile ? '12px' : '14px',
                  color: isGreen ? SUPERWHITE : DARK,
                }}>
                  {group.subtitle}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CREATE GROUP button */}
      <div style={{ padding: isMobile ? '16px 20px 24px' : '24px 36px 36px' }}>
        <button
          style={{
            width: '100%',
            height: isMobile ? '64px' : '96px',
            border: `1.52px dashed ${DARK}`,
            borderRadius: '4px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '8px' : '12px',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.18s',
          }}
        >
          <svg width={isMobile ? '16' : '21'} height={isMobile ? '16' : '21'} viewBox="0 0 21 21" fill="none">
            <circle cx="10.5" cy="10.5" r="9.5" stroke={DARK} strokeWidth="1.52"/>
            <path d="M10.5 5.5V15.5M5.5 10.5H15.5" stroke={DARK} strokeWidth="1.52" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? '14px' : '18px',
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
function MembersTable({ isMobile }: { isMobile: boolean }) {
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
      padding: isMobile ? '16px' : '32px',
      gap: isMobile ? '16px' : '32px',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '18px' : '24px',
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          color: DARK,
        }}>
          Members
        </span>
        <button
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? '10px' : '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: DARK,
            background: SUPERWHITE,
            border: `1px solid ${DARK}`,
            borderRadius: '2px',
            padding: isMobile ? '6px 12px' : '8px 16px',
            cursor: 'pointer',
          }}
        >
          Delete Group
        </button>
      </div>

      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflowX: 'auto' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 80px 60px' : '1fr 1fr 1fr 0.7fr',
          padding: isMobile ? '0 8px' : '0 10px',
          height: isMobile ? '36px' : '46px',
          alignItems: 'center',
          borderBottom: `1px solid rgba(26,28,28,0.1)`,
          minWidth: isMobile ? '280px' : 'auto',
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '8px' : '10px',
            textTransform: 'uppercase', letterSpacing: '10%',
            color: DARK, textAlign: 'left',
          }}>Member</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '8px' : '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'center',
          }}>Status</span>
          {!isMobile && (
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: DARK, textAlign: 'center',
            }}>Streak</span>
          )}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '8px' : '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'right',
          }}>Contrib</span>
        </div>

        {/* Data rows */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '0 8px' : '0 10px',
        }}>
          {MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.08 }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 80px 60px' : '1fr 1fr 1fr 0.7fr',
                alignItems: 'center',
                borderBottom: i < MEMBERS.length - 1 ? `1px solid rgba(26,28,28,0.1)` : 'none',
                padding: '0',
                minWidth: isMobile ? '280px' : 'auto',
              }}
            >
              {/* Member cell */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px',
                padding: isMobile ? '12px 1px' : '24px 1px',
              }}>
                <Avatar size={isMobile ? 32 : 48} />
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: isMobile ? '12px' : '16px',
                  color: DARK,
                }}>
                  {member.name}
                </span>
              </div>

              {/* Status cell */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                padding: isMobile ? '12px 1px' : '37.5px 1px',
              }}>
                <StatusBadge status={member.status} isMobile={isMobile} />
              </div>

              {/* Streak cell (desktop only) */}
              {!isMobile && (
                <div style={{
                  display: 'flex', justifyContent: 'center',
                  padding: '34.5px 1px',
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: '20px',
                    color: DARK, textAlign: 'center',
                  }}>
                    {member.streak} Days
                  </span>
                </div>
              )}

              {/* Contribution cell */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                padding: isMobile ? '12px 1px' : '32px 1px 33px',
              }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900, fontSize: isMobile ? '16px' : '24px',
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
function StatsGrid({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      padding: isMobile ? '16px' : '48px 56px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: isMobile ? '12px' : '18px',
      }}>
        {STATS.map(card => (
          <StatCard key={card.label} card={card} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ card, isMobile }: { card: (typeof STATS)[0]; isMobile: boolean }) {
  return (
    <div style={{
      background: card.green ? GREEN : WHITE,
      border: BORDER2,
      boxShadow: `4px 4px 0px 0px ${DARK}`,
      padding: isMobile ? '16px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: isMobile ? '8px' : '16px',
      height: isMobile ? '100px' : '190px',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
    }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '9px' : '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: card.green ? SUPERWHITE : '#3D4A3E',
        display: 'block',
        textAlign: 'center',
      }}>
        {card.label}
      </span>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '28px' : '60px',
        lineHeight: '1em',
        color: card.green ? SUPERWHITE : '#1A1C1C',
        display: 'block',
        textAlign: 'center',
        letterSpacing: '-0.02em',
      }}>
        {card.value}
      </span>
    </div>
  );
}

// ─── Weekly calendar ──────────────────────────────────────────────────────────
function WeeklySection({ isMobile }: { isMobile: boolean }) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const adjustedToday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - adjustedToday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const rangeLabel = `${fmtDate(monday)} - ${fmtDate(sunday)}`;

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
      padding: isMobile ? '16px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '32px',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: isMobile ? '18px' : '30px',
          textTransform: 'uppercase',
          color: DARK,
          lineHeight: '1.2em',
        }}>
          This Week
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: isMobile ? '12px' : '16px',
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
        gap: isMobile ? '4px' : '12px',
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
                gap: isMobile ? '4px' : '8px',
                padding: isMobile ? '8px 4px' : '16px',
                minHeight: isMobile ? '80px' : '140px',
                opacity: isFuture ? 0.4 : 1,
                boxSizing: 'border-box',
              }}
            >
              {/* Day label */}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? '8px' : '12px',
                textTransform: 'uppercase',
                color: isToday ? 'rgba(250,250,250,0.9)' : DARK,
                opacity: isToday ? 1 : 0.6,
                letterSpacing: '0.02em',
              }}>
                {day}
              </span>

              {/* Tree SVG icon */}
              {!isFuture && (
                <svg
                  width={isMobile ? '16' : '30'}
                  height={isMobile ? '20' : '35'}
                  viewBox="0 0 30 35"
                  fill="none"
                >
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

              {/* Check icon */}
              {!isFuture && (
                <svg width={isMobile ? '12' : '20'} height={isMobile ? '12' : '20'} viewBox="0 0 20 20" fill="none">
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
  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="groups" />}

      {/* Main content */}
      <div style={{
        marginLeft: isMobile ? 0 : '101px',
        flex: 1,
        padding: isMobile ? '20px 16px 100px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '16px' : '24px',
        boxSizing: 'border-box',
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
              Groups
            </h1>
          </div>
        )}

        {/* Top area: Left panel + Right panels */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '24px',
          alignItems: 'flex-start',
        }}>

          {/* Left: Your Groups */}
          <LeftPanel
            selectedId={selectedId}
            onSelect={setSelected}
            isMobile={isMobile}
          />

          {/* Right column: Members + Stats stacked */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '24px',
            width: isMobile ? '100%' : 'auto',
          }}>
            <MembersTable isMobile={isMobile} />
            <StatsGrid isMobile={isMobile} />
          </div>
        </div>

        {/* Bottom: THIS WEEK calendar (full width) */}
        <WeeklySection isMobile={isMobile} />

        {/* Bottom spacer */}
        <div style={{ height: '24px' }} />
      </div>

      {isMobile && <MobileBottomNav activePage="groups" />}
    </div>
  );
}
