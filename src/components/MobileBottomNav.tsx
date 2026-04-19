/**
 * MobileBottomNav — Figma node 192:144 "BottomNavBar"
 *
 * Measurements from Figma:
 *   Container:  w=402, h=75  Super White fill, 1px Black stroke, radius 24 24 0 0
 *   Icon row (layout_X5H7KL): row, alignItems=center, gap=35px, x=27, y=16.03, w=347
 *   Active icon (layout_ASLV7Q): padding=7.69px all, h=38.46, Green fill
 */

import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SUPERWHITE = '#FAFAFA';

// ─── SVG icon set (same paths as Sidebar) ──────────────────────────────────────

const HomeIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
    <path
      d="M3.75 11.25L15 2.5L26.25 11.25V25C26.25 25.663 25.9866 26.299 25.5178 26.7678C25.0489 27.2366 24.413 27.5 23.75 27.5H6.25C5.587 27.5 4.951 27.2366 4.482 26.7678C4.013 26.299 3.75 25.663 3.75 25V11.25Z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M11.25 27.5V15H18.75V27.5"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const DashboardIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
    <rect x="3.75" y="3.75"  width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2" />
    <rect x="16.75" y="3.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2" />
    <rect x="3.75" y="16.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2" />
    <rect x="16.75" y="16.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2" />
  </svg>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
    <rect x="3.75" y="5" width="22.5" height="21.25" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 3.75V6.25" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 3.75V6.25" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3.75 11.25H26.25" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <rect x="8"  y="15" width="4" height="4" rx="0.5" fill={color} />
    <rect x="13" y="15" width="4" height="4" rx="0.5" fill={color} />
    <rect x="18" y="15" width="4" height="4" rx="0.5" fill={color} />
    <rect x="8"  y="20" width="4" height="4" rx="0.5" fill={color} />
    <rect x="13" y="20" width="4" height="4" rx="0.5" fill={color} />
  </svg>
);

const GroupIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
    <path
      d="M21.25 26.25V23.75C21.25 22.424 20.723 21.152 19.786 20.214C18.848 19.277 17.576 18.75 16.25 18.75H8.75C7.424 18.75 6.152 19.277 5.214 20.214C4.277 21.152 3.75 22.424 3.75 23.75V26.25"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M12.5 13.75C15.261 13.75 17.5 11.511 17.5 8.75C17.5 5.989 15.261 3.75 12.5 3.75C9.739 3.75 7.5 5.989 7.5 8.75C7.5 11.511 9.739 13.75 12.5 13.75Z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M26.25 26.25V23.75C26.249 22.642 25.875 21.567 25.189 20.694C24.503 19.822 23.544 19.203 22.469 18.938"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M20 3.938C21.078 4.201 22.04 4.821 22.728 5.695C23.416 6.569 23.791 7.646 23.791 8.756C23.791 9.866 23.416 10.944 22.728 11.818C22.04 12.692 21.078 13.312 20 13.575"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const StatsIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
    <rect x="3.75"  y="16.25" width="7.5" height="11.25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="11.25" y="7.5"   width="7.5" height="20"    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="18.75" y="12.5"  width="7.5" height="15"    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type MobilePageKey = 'dashboard' | 'stats' | 'calendar' | 'groups' | 'leaderboard';

interface NavItem {
  key:  MobilePageKey;
  label: string;
  path:  string;
  icon:  (color: string) => ReactNode;
}

// ─── Nav items — matches sidebar order ────────────────────────────────────────
// Figma bottom nav order (left → right): Home, Dashboard, Calendar, Groups, Stats
const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',    label: 'Home',        path: '/dashboard',   icon: c => <HomeIcon color={c} />      },
  { key: 'stats',        label: 'Dashboard',   path: '/stats',       icon: c => <DashboardIcon color={c} /> },
  { key: 'calendar',    label: 'Calendar',    path: '/calendar',    icon: c => <CalendarIcon color={c} />  },
  { key: 'groups',      label: 'Groups',      path: '/groups',      icon: c => <GroupIcon color={c} />     },
  { key: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: c => <StatsIcon color={c} />     },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Mobile bottom navigation bar.
 * Fixed position at viewport bottom, always visible above keyboard.
 */
export default function MobileBottomNav({
  activePage = 'dashboard',
}: {
  activePage?: MobilePageKey;
}) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        /* Figma: h=75, Super White fill, 1px Black stroke, radius 24 24 0 0 */
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        height:          75,
        background:      SUPERWHITE,
        border:          `1px solid ${DARK}`,
        borderBottom:    'none',
        borderRadius:    '24px 24px 0 0',
        /* Sit above page content */
        zIndex:          200,
        /* Safe area for notched iOS phones */
        paddingBottom:   'env(safe-area-inset-bottom, 0px)',
        boxSizing:       'border-box',
        boxShadow:       '0px -2px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/*
        Figma layout_X5H7KL:
          row, alignItems=center, gap=35px
          x=27, y=16.03, w=347 (within 402px frame)
          → padding-left=27px, spacing achieved via justify-content + gap
      */}
      <div
        style={{
          display:        'flex',
          flexDirection:  'row',
          alignItems:     'center',
          justifyContent: 'space-between',
          height:         '100%',
          padding:        '0 27px',
          boxSizing:      'border-box',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive   = activePage === item.key;
          const iconColor  = isActive ? SUPERWHITE : DARK;

          return (
            <button
              key={item.key}
              title={item.label}
              aria-label={item.label}
              onClick={() => navigate(item.path)}
              className="transition-all duration-200 ease-out active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:   isActive ? GREEN : 'none',
                border:       'none',
                padding:      isActive ? '7.7px' : 0,
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                flexShrink:   0,
                borderRadius: isActive ? 8 : 0,
                width:        38,
                height:       38,
                opacity:      isActive ? 1 : 0.5,
                transition: 'opacity 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.opacity = '0.5';
              }}
            >
              {item.icon(iconColor)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
