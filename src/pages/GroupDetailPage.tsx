import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { groupApi } from '../api';
import type { Group, GroupMember } from '../types';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG     = '#F2F2F2';
const WHITE  = '#FAFAFA';
const GREEN  = '#006D37';
const DARK   = '#1A1A1A';
const BORDER = '2px solid #1A1A1A';
const SHADOW = '4px 4px 0px 0px rgba(26,26,26,1)';

// ─── Tree display helper ──────────────────────────────────────────────────────
const TREE_STAGES = ['🌰', '🌱', '🌿', '🌳', '🌲'];

function TreeIcon({ stage, bare }: { stage: number; bare?: boolean }) {
  if (bare) return <span title="Missed day" style={{ fontSize: '18px', opacity: 0.3 }}>🟫</span>;
  return <span style={{ fontSize: '18px' }}>{TREE_STAGES[stage] ?? '🌱'}</span>;
}

// ─── Avatar helper ───────────────────────────────────────────────────────────
function Avatar({ member, size = 36 }: { member: GroupMember; size?: number }) {
  const initials = member.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '1.5px solid #1A1A1A',
          objectFit: 'cover',
        }}
      />
    );
  }

  // Color-coded placeholder by member name
  const hue = member.name.charCodeAt(0) * 17 % 360;
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '1.5px solid #1A1A1A',
      background: `hsl(${hue} 45% 60%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: Math.floor(size * 0.35),
      color: '#fff',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  highlighted,
  index,
}: {
  label: string;
  value: string | number;
  highlighted?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        border: BORDER,
        borderRadius: '10px',
        padding: '20px 24px',
        background: highlighted ? GREEN : WHITE,
        boxShadow: SHADOW,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: '11px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: highlighted ? 'rgba(255,255,255,0.75)' : '#666',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize: '32px',
        lineHeight: 1,
        color: highlighted ? WHITE : DARK,
      }}>
        {value}
      </span>
    </motion.div>
  );
}

// ─── Weekly tree row ──────────────────────────────────────────────────────────
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function WeeklySection() {
  const today = new Date().getDay(); // 0=Sun
  const adjustedToday = today === 0 ? 6 : today - 1; // 0=Mon

  const getWeekDates = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - adjustedToday);

    return DAYS.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const dates = getWeekDates();
  const startStr = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr   = dates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div style={{
      border: BORDER,
      borderRadius: '12px',
      padding: '28px 32px',
      background: WHITE,
      boxShadow: SHADOW,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#888',
            marginBottom: '4px',
          }}>
            This Week
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '20px',
            color: DARK,
          }}>
            {startStr.toUpperCase()} — {endStr.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Day columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '10px',
      }}>
        {DAYS.map((day, i) => {
          const isPast   = i < adjustedToday;
          const isToday  = i === adjustedToday;
          const isFuture = i > adjustedToday;

          return (
            <div
              key={day}
              style={{
                border: BORDER,
                borderRadius: '8px',
                borderStyle: isFuture ? 'dashed' : 'solid',
                padding: '14px 8px',
                background: isToday ? GREEN : WHITE,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                opacity: isFuture ? 0.4 : 1,
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isToday ? 'rgba(255,255,255,0.85)' : '#888',
              }}>
                {day}
              </span>
              {!isFuture && <TreeIcon stage={isPast ? 4 : 3} />}
              {!isFuture && (
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '11px',
                  color: isToday ? 'rgba(255,255,255,0.8)' : '#666',
                  textAlign: 'center',
                }}>
                  {isPast ? '🌲 Done' : '🌳 Today'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Member status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'focus' | 'break' | 'afk' }) {
  const configs = {
    focus: { label: 'Focus Session', bg: '#e8f5e9', dot: GREEN, text: GREEN, border: GREEN },
    break: { label: 'On Break',      bg: '#fff9e6', dot: '#f9c74f', text: '#a07800', border: '#f9c74f' },
    afk:   { label: 'AFK',          bg: '#f5f5f5', dot: '#ccc',    text: '#888',    border: '#ccc' },
  };
  const c = configs[status];
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 12px',
      borderRadius: '99px',
      background: c.bg,
      border: `1px solid ${c.border}`,
    }}>
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: c.dot,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '11px',
        fontWeight: 700,
        color: c.text,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
      }}>
        {c.label}
      </span>
    </div>
  );
}

// ─── Member activity table ────────────────────────────────────────────────────
function MemberTable({
  members,
  currentUserId,
  onRemove,
}: {
  members: GroupMember[];
  currentUserId?: string;
  onRemove: (userId: string) => void;
}) {
  return (
    <div style={{
      border: BORDER,
      borderRadius: '12px',
      background: WHITE,
      boxShadow: SHADOW,
      overflow: 'hidden',
    }}>
      {/* Table header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 28px 16px',
        borderBottom: '1px solid #eee',
      }}>
        <h3 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: DARK,
          margin: 0,
        }}>
          Members
        </h3>
        <button
          id="delete-group-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to leave/delete this group?')) {
              onRemove(currentUserId ?? '');
            }
          }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: DARK,
            background: WHITE,
            border: '1px solid #1A1A1A',
            borderRadius: '6px',
            padding: '6px 14px',
            cursor: 'pointer',
          }}
        >
          Delete Group
        </button>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
        padding: '10px 28px',
        borderBottom: '1px solid #e8e8e8',
        background: '#f8f8f8',
      }}>
        {['Member', 'Current Status', 'Personal Streak', 'Contribution'].map(h => (
          <span key={h} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#666',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {members.map((member, i) => {
        // For display we randomise status since backend doesn't return live status
        const statuses: Array<'focus' | 'break' | 'afk'> = ['focus', 'afk', 'focus'];
        const status = statuses[i % statuses.length];

        return (
          <motion.div
            key={member.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
              padding: '16px 28px',
              borderBottom: i < members.length - 1 ? '1px solid #f0f0f0' : 'none',
              alignItems: 'center',
            }}
          >
            {/* Member name + avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar member={member} size={36} />
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: DARK,
              }}>
                {member.name}
                {member.userId === currentUserId && (
                  <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '6px' }}>(you)</span>
                )}
              </span>
            </div>

            {/* Status */}
            <div>
              <StatusBadge status={status} />
            </div>

            {/* Streak */}
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: DARK,
            }}>
              {member.currentStreak} Days
            </span>

            {/* Contribution */}
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '16px',
              fontWeight: 700,
              color: DARK,
              textAlign: 'right',
            }}>
              {member.totalTrees}
            </span>
          </motion.div>
        );
      })}

      {members.length === 0 && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '13px',
          color: '#999',
        }}>
          No members yet.
        </div>
      )}
    </div>
  );
}

// ─── Group Detail Page ────────────────────────────────────────────────────────
export default function GroupDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();

  const [group,   setGroup]   = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await groupApi.get(id);
      setGroup(data);
    } catch {
      setError('Could not load group. It may not exist or you may not be a member.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const handleCopyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id || !userId) return;
    try {
      await groupApi.removeMember(id, userId);
      navigate('/groups');
    } catch {
      alert('Failed to leave/remove from group.');
    }
  };

  // ─── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
        <Sidebar activePage="groups" />
        <main style={{
          marginLeft: '101px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <span style={{ fontSize: '40px', animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>🌀</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px',
            color: '#888',
          }}>
            Loading group…
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
        <Sidebar activePage="groups" />
        <main style={{
          marginLeft: '101px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          padding: '48px',
        }}>
          <span style={{ fontSize: '48px' }}>🌫️</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '24px',
            color: DARK,
            fontWeight: 700,
          }}>
            Group not found
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px',
            color: '#777',
            maxWidth: '360px',
            textAlign: 'center',
          }}>
            {error ?? 'This group does not exist or you are not a member.'}
          </span>
          <button
            onClick={() => navigate('/groups')}
            style={{
              border: BORDER,
              borderRadius: '8px',
              padding: '12px 28px',
              background: DARK,
              color: WHITE,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              boxShadow: SHADOW,
            }}
          >
            ← Back to Groups
          </button>
        </main>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="groups" />

      <main style={{
        marginLeft: '101px',
        flex: 1,
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        maxWidth: '1200px',
      }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <button
              onClick={() => navigate('/groups')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#888',
                padding: 0,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = DARK)}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}
            >
              ← Your Groups
            </button>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '36px',
              color: DARK,
              margin: 0,
              lineHeight: 1.1,
            }}>
              {group.name}
            </h1>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              color: '#666',
              marginTop: '8px',
            }}>
              {group.memberCount}/5 members · {group.totalTrees} total trees grown
            </p>
          </div>

          {/* Invite code pill */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#888',
            }}>
              Invite Code
            </span>
            <button
              id="copy-invite-code-btn"
              onClick={handleCopyCode}
              title="Click to copy invite code"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: '22px',
                letterSpacing: '0.25em',
                color: DARK,
                background: WHITE,
                border: BORDER,
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                boxShadow: SHADOW,
                transition: 'background 0.15s, color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = GREEN;
                (e.currentTarget as HTMLButtonElement).style.color = WHITE;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = WHITE;
                (e.currentTarget as HTMLButtonElement).style.color = DARK;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0,0)';
              }}
            >
              {group.inviteCode}
            </button>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '11px',
              color: copied ? GREEN : '#aaa',
              fontWeight: 600,
              transition: 'color 0.2s',
            }}>
              {copied ? '✓ Copied!' : 'Click to copy'}
            </span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', gap: '20px' }}
        >
          <StatCard label="Total Minutes"    value="—"                    index={0} />
          <StatCard label="Sessions"         value="—"                    index={1} />
          <StatCard label="Trees Completed"  value={group.totalTrees}     index={2} />
          <StatCard label="Today's Trees"    value={group.memberCount}    index={3} highlighted />
        </motion.div>

        {/* ── Weekly tree calendar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <WeeklySection />
        </motion.div>

        {/* ── Member activity table ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <MemberTable
            members={group.members}
            onRemove={handleRemoveMember}
          />
        </motion.div>

        {/* ── Bottom spacer ── */}
        <div style={{ height: '48px' }} />
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
