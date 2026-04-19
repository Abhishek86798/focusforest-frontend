/**
 * LeaderboardPage — Responsive implementation
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useLeaderboard } from '../hooks/useForestData';
import { useAuthStore } from '../stores/authStore';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const SUPERWHITE = '#FAFAFA';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = '4px 4px 0px 0px rgba(26, 26, 26, 1)';

export interface PodiumEntry {
  place: number;
  name: string;
  trees: string;
  green: boolean;
  barH: number;
  barHMobile: number;
  badgeSize: number;
}

export interface RowEntry {
  rank: string;
  name: string;
  trees: string;
  streak?: number;
  isMe: boolean;
  avatarUrl?: string | null;
}

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
function Podium({ isMobile, podiumData }: { isMobile: boolean; podiumData: PodiumEntry[] }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: isMobile ? 12 : 32,
      padding: isMobile ? '0 8px' : '0 16px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {podiumData.map((p, i) => (
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
function RankingTable({ 
  isMobile, 
  rowsData, 
  isGroupMode, 
  onLoadMore, 
  hasMore, 
  isLoadingMore 
}: { 
  isMobile: boolean; 
  rowsData: RowEntry[]; 
  isGroupMode: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}) {
  const COL_GRID = '95px 1fr 220px 160px'; // Enforced tailwind min-width

  return (
    <div className="w-full overflow-x-auto">
      <div className="bg-[#FAFAFA] border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] rounded-[4px] overflow-hidden min-w-[600px]">

      {/* Header row */}
      <div className="grid items-center px-4 md:px-8 xl:px-10 h-12 md:h-[63px] border-b border-[rgba(26,26,26,0.12)] box-border" style={{ gridTemplateColumns: COL_GRID }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'left',
        }}>Rank</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'left',
        }}>Name</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'center',
        }}>Trees Completed</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: DARK,
          textAlign: 'right',
        }}>{isGroupMode ? 'Members' : 'Current Streak'}</span>
      </div>

      {/* Data rows */}
      {rowsData.map((row, i) => (
        <RankRow key={`${row.rank}-${row.name}`} row={row} index={i} isLast={i === rowsData.length - 1} />
      ))}

      {/* Show more */}
      <ShowMoreRow isMobile={isMobile} onLoadMore={onLoadMore} hasMore={hasMore} isLoading={isLoadingMore} />
      </div>
    </div>
  );
}

function RankRow({
  row, index, isLast,
}: {
  row: RowEntry;
  index: number;
  isLast: boolean;
}) {
  const me = row.isMe;
  const COL_GRID = '95px 1fr 220px 160px'; // Forced desktop grid layout to allow table scrolling

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.28 }}
      className={`grid items-center box-border ${me ? 'bg-[#006D37] border-t-2 border-b-2 border-t-[#006D37] border-b-[#006D37] shadow-[0px_4px_12px_0px_rgba(46,204,113,0.15)] px-4 py-4 md:px-8 md:py-6 xl:px-10 xl:py-8' : `bg-transparent border-b ${isLast ? 'border-b-transparent' : 'border-b-[rgba(26,26,26,0.1)]'} px-4 py-3 md:px-8 md:py-5 xl:px-10 xl:py-6`}`}
      style={{
        gridTemplateColumns: COL_GRID,
      }}
    >
      {/* Rank */}
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

      {/* Name */}
      <div className="flex items-center gap-2 md:gap-4">
        <div style={{
          width: me ? 48 : 40,
          height: me ? 48 : 40,
          borderRadius: 12,
          border: me ? `2px solid ${SUPERWHITE}` : `1px solid ${DARK}`,
          background: me ? 'rgba(255,255,255,0.12)' : 'transparent',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt={row.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ 
              fontFamily: "'Space Grotesk', sans-serif", 
              fontWeight: 700, 
              fontSize: me ? 20 : 16, 
              color: me ? SUPERWHITE : DARK 
            }}>
              {row.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
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

      {/* Trees */}
      <div style={{ opacity: me ? 1 : 0.8, textAlign: 'center' }}>
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

      {/* Streak (now rendered across all resolutions via min-w 600px scrolling) */}
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
    </motion.div>
  );
}

function ShowMoreRow({ isMobile, onLoadMore, hasMore, isLoading }: { 
  isMobile: boolean; 
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  if (!hasMore) return null;
  
  return (
    <button
      onClick={onLoadMore}
      disabled={isLoading}
      className={`w-full flex justify-center items-center gap-2 py-5 md:py-8 border-t border-[rgba(26,26,26,0.08)] select-none min-h-[44px] transition-all duration-200 ease-out active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-wait ${isLoading ? 'opacity-30' : 'opacity-40 hover:opacity-100 cursor-pointer'}`}
    >
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? 9 : 10,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: DARK,
      }}>
        {isLoading ? 'Loading...' : 'Load more'}
      </span>
      {!isLoading && (
        <svg
          width="10" height="7" viewBox="0 0 10 7" fill="none"
          style={{ transition: 'transform 0.2s' }}
        >
          <path d="M1 1.5L5 5.5L9 1.5" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
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
    <div className="flex flex-col items-center gap-3 md:gap-5">
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

      <div className="bg-[#FAFAFA] border border-[#1A1A1A] rounded-[4px] p-1 flex items-stretch gap-1 box-border w-[200px] md:w-[245px] h-[52px] md:h-[56px]">
        {(['solo', 'groups'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="min-h-[44px] min-w-[44px] transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 2,
              background: active === tab ? GREEN : 'transparent',
              boxShadow: active === tab ? '0px 1px 2px 0px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
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
  const [page, setPage] = useState(1);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const user = useAuthStore(s => s.user);
  const lastProcessedPage = React.useRef(0);

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useLeaderboard(category, 'global', page);
  const entries = leaderboardData?.entries || [];
  const total = leaderboardData?.total || 0;

  // Accumulate entries when page changes
  React.useEffect(() => {
    // Only process if we have new data and haven't processed this page yet
    if (entries.length === 0 || lastProcessedPage.current === page) return;
    
    lastProcessedPage.current = page;
    
    if (page === 1) {
      setAllEntries(entries);
    } else {
      setAllEntries(prev => [...prev, ...entries]);
    }
  }, [entries, page]);

  // Reset when category changes
  const handleCategoryChange = (newCategory: 'solo' | 'groups') => {
    setCategory(newCategory);
    setPage(1);
    setAllEntries([]);
    lastProcessedPage.current = 0; // Reset the ref
  };

  // Load more handler
  const handleLoadMore = () => {
    if (!isLoading && allEntries.length < total) {
      setPage(p => p + 1);
    }
  };

  const hasMore = allEntries.length < total;
  const displayEntries = allEntries.length > 0 ? allEntries : entries;

  // Podium data (top 3)
  const podiumRaw = displayEntries.slice(0, 3);
  const p1 = podiumRaw[0];
  const p2 = podiumRaw[1];
  const p3 = podiumRaw[2];
  
  const podiumData: PodiumEntry[] = [
    {
      place: 2,
      name: p2 ? (category === 'solo' ? p2.name : p2.name) : '---',
      trees: p2 ? `${p2.totalTrees} Trees` : '0 Trees',
      green: false,
      barH: 140, barHMobile: 100, badgeSize: 80
    },
    {
      place: 1,
      name: p1 ? (category === 'solo' ? p1.name : p1.name) : '---',
      trees: p1 ? `${p1.totalTrees} Trees` : '0 Trees',
      green: true,
      barH: 192, barHMobile: 140, badgeSize: 112
    },
    {
      place: 3,
      name: p3 ? (category === 'solo' ? p3.name : p3.name) : '---',
      trees: p3 ? `${p3.totalTrees} Trees` : '0 Trees',
      green: false,
      barH: 112, barHMobile: 80, badgeSize: 80
    }
  ];

  // Rows data (rank 4+)
  const rowsRaw = displayEntries.slice(3);
  const rowsData: RowEntry[] = rowsRaw.map((entry: any) => ({
    rank: entry.rank.toString().padStart(2, '0'),
    name: entry.name,
    trees: `${entry.totalTrees} Trees`,
    streak: category === 'solo' ? entry.currentStreak : entry.memberCount,
    // Use server-provided isCurrentUser flag (most reliable)
    isMe: category === 'solo' ? (entry.isCurrentUser ?? (user ? entry.userId === user.id : false)) : false,
    avatarUrl: entry.avatarUrl,
  }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="leaderboard" />}

      <main className="flex-1 flex flex-col box-border ml-0 md:ml-[101px] h-screen overflow-y-auto overflow-x-hidden">
        <div className="w-full px-4 md:px-8 lg:px-12 max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto py-5 md:py-6 pb-[100px] md:pb-16 flex flex-col">

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
          <CategoryToggle active={category} onChange={handleCategoryChange} isMobile={isMobile} />
        </div>

        {/* Podium */}
        <motion.div
          key={`podium-${category}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%',
          }}
        >
          {isLoading && page === 1 ? (
            <div className="w-full flex flex-col gap-2 mt-8 px-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse bg-[#FAFAFA] border border-[rgba(26,26,26,0.08)] h-[64px] rounded-[4px] w-full" />
              ))}
            </div>
          ) : displayEntries.length > 0 ? (
            <Podium isMobile={isMobile} podiumData={podiumData} />
          ) : (
            <div className="py-12 text-center text-[#666] font-['Inter'] text-[14px] md:text-[16px]">
              No focus warriors yet. Be the first!
            </div>
          )}
        </motion.div>

        {/* Gap */}
        <div style={{ height: isMobile ? 32 : 88 }} />

        {/* Ranking table */}
        {displayEntries.length > 3 && (
          <motion.div
            key={`table-${category}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              width: '100%',
            }}
          >
            <RankingTable 
              isMobile={isMobile} 
              rowsData={rowsData} 
              isGroupMode={category === 'groups'}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoadingMore={isLoading && page > 1}
            />
          </motion.div>
        )}

        <div style={{ height: isMobile ? 24 : 60 }} />
        </div>
      </main>

      {isMobile && <MobileBottomNav activePage="leaderboard" />}
    </div>
  );
}
