/**
 * Sidebar — pixel-faithful implementation of Figma node 159:1264
 *
 * Key measurements from Figma:
 *   Sidebar:          width=101, height=1117 (fills viewport)
 *   Inner container:  x=30, y=51, width=42, height=1015, gap=408px (between top group & profile)
 *   Logo (Frame):     width=fill, height=42, fills=Green — plain green square, no icon
 *   Nav group:        gap=105px between Logo and nav icons group
 *   Frame 12 (icons): width=32, height=428, gap=67px — 5 icons stacked
 *   Profile (SVG):    width=32, height=32, at bottom
 *
 * Active state (from image):
 *   — Green square background (42×42) with 2px solid Black border
 *   — Icon rendered in Super White (#FAFAFA)
 *
 * Inactive state:
 *   — No background, no border
 *   — Icon in Black (#1A1A1A), full opacity
 */

import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SUPERWHITE = '#FAFAFA';

// ─── SVG Icons (29×29 viewBox, matches Figma ~32px render size) ───────────────

/** Home / House icon */
const HomeIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
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

/** Dashboard / 4-squares grid icon */
const DashboardIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
    <rect x="3.75" y="3.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2"/>
    <rect x="16.75" y="3.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2"/>
    <rect x="3.75" y="16.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2"/>
    <rect x="16.75" y="16.75" width="9.5" height="9.5" rx="1.5" stroke={color} strokeWidth="2"/>
  </svg>
);

/** Calendar icon */
const CalendarIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
    <rect x="3.75" y="5" width="22.5" height="21.25" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 3.75V6.25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 3.75V6.25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M3.75 11.25H26.25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <rect x="8" y="15" width="4" height="4" rx="0.5" fill={color}/>
    <rect x="13" y="15" width="4" height="4" rx="0.5" fill={color}/>
    <rect x="18" y="15" width="4" height="4" rx="0.5" fill={color}/>
    <rect x="8" y="20" width="4" height="4" rx="0.5" fill={color}/>
    <rect x="13" y="20" width="4" height="4" rx="0.5" fill={color}/>
  </svg>
);

/** Groups / People icon */
const GroupIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
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

/** Stats / Bar chart icon */
const StatsIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
    <rect x="3.75" y="16.25" width="7.5" height="11.25" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="11.25" y="7.5"  width="7.5" height="20"    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="18.75" y="12.5" width="7.5" height="15"    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Profile / Person-in-circle icon — exact paths from Figma node 59:205 */
const ProfileIcon = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    {/* Head */}
    <path
      d="M16 18.2857C19.1559 18.2857 21.7143 15.7274 21.7143 12.5715C21.7143 9.41555 19.1559 6.85718 16 6.85718C12.8441 6.85718 10.2857 9.41555 10.2857 12.5715C10.2857 15.7274 12.8441 18.2857 16 18.2857Z"
      stroke={color} strokeWidth="2.28571" strokeLinecap="round" strokeLinejoin="round"
    />
    {/* Shoulders */}
    <path
      d="M6.24 27.1999C7.25998 25.5256 8.6935 24.1419 10.4028 23.1818C12.112 22.2216 14.0395 21.7173 16 21.7173C17.9605 21.7173 19.888 22.2216 21.5972 23.1818C23.3065 24.1419 24.74 25.5256 25.76 27.1999"
      stroke={color} strokeWidth="2.28571" strokeLinecap="round" strokeLinejoin="round"
    />
    {/* Outer circle */}
    <path
      d="M16 30.8571C24.2054 30.8571 30.8571 24.2053 30.8571 16C30.8571 7.79459 24.2054 1.14282 16 1.14282C7.79463 1.14282 1.14286 7.79459 1.14286 16C1.14286 24.2053 7.79463 30.8571 16 30.8571Z"
      stroke={color} strokeWidth="2.28571" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageKey = 'dashboard' | 'calendar' | 'groups' | 'stats' | 'leaderboard';

interface NavItem {
  key: PageKey;
  label: string;
  path: string;
  icon: (color: string) => ReactNode;
}

// ─── Nav items — matching Figma icon order top→bottom ─────────────────────────
// Image shows: Home, Dashboard(4-grid), Calendar, Groups, Stats
const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',    label: 'Home',        path: '/dashboard',   icon: c => <HomeIcon color={c} /> },
  { key: 'stats',        label: 'Dashboard',   path: '/stats',       icon: c => <DashboardIcon color={c} /> },
  { key: 'calendar',    label: 'Calendar',    path: '/calendar',    icon: c => <CalendarIcon color={c} /> },
  { key: 'groups',      label: 'Groups',      path: '/groups',      icon: c => <GroupIcon color={c} /> },
  { key: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: c => <StatsIcon color={c} /> },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ activePage = 'dashboard' }: { activePage?: PageKey }) {
  const navigate = useNavigate();

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0, top: 0,
        /* Figma: width=101, height=1117 — fill full viewport height */
        width: '101px',
        height: '100vh',
        background: SUPERWHITE,
        /* effect_XPYJMV */
        boxShadow: '1px 4px 50px 0px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 100,
        boxSizing: 'border-box',
      }}
    >
      {/*
        Inner container (layout_67AX2T):
          x=30, y=51  → marginTop=51, marginLeft auto (centred inside 101px)
          width=42, height=1015
          justifyContent=space-between, gap=408px
          — top group (Logo + nav) vs bottom (Profile)
      */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '42px',
          height: 'calc(100vh - 102px)',
          margin: '51px 0',
          flexShrink: 0,
        }}
      >
        {/* ── Top group: Logo + Nav icons ──
            layout_F1FYIR: column, alignItems=center, gap=105px, height=575
        */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '105px',
            width: '100%',
            height: '575px',
          }}
        >
          {/* ── Logo (layout_XFUPYF): width=fill, height=42, fills=Green ──
              Plain green square — no icon inside, matching Figma "Logo" frame
          */}
          <div
            role="button"
            tabIndex={0}
            title="Focus Forest"
            onClick={() => navigate('/dashboard')}
            onKeyDown={e => e.key === 'Enter' && navigate('/dashboard')}
            style={{
              width: '42px',
              height: '42px',
              background: GREEN,
              cursor: 'pointer',
              flexShrink: 0,
              border: 'none',
              outline: 'none',
            }}
          />

          {/* ── Nav icons (Frame 12 / layout_A3GDL8):
                width=32, height=428, gap=67px, column, alignItems=center
                5 icons × 32px height + 4 gaps × 67px = 160 + 268 = 428 ✓
          ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '32px',
              height: '428px',
              gap: '67px',
            }}
          >
            {NAV_ITEMS.map(item => {
              const isActive = activePage === item.key;
              const iconColor = isActive ? SUPERWHITE : DARK;

              return (
                <button
                  key={item.key}
                  title={item.label}
                  onClick={() => navigate(item.path)}
                  style={{
                    /*
                      Active state (from Figma image):
                        42×42 green square with 2px solid Black border
                      Inactive state:
                        no background, no border, icon at full opacity in DARK
                    */
                    width: isActive ? '42px' : '32px',
                    height: isActive ? '42px' : '32px',
                    /* compensate size change so layout stays stable */
                    margin: isActive ? '-5px' : '0',
                    background: isActive ? GREEN : 'transparent',
                    border: isActive ? `2px solid ${DARK}` : 'none',
                    borderRadius: '0',         // brutal square, no rounding
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s, border 0.15s, opacity 0.15s',
                    opacity: isActive ? 1 : 0.55,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '0.55';
                    }
                  }}
                >
                  {item.icon(iconColor)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Profile (layout_8IAFEW): width=32, height=32, at bottom ── */}
        <button
          title="Profile"
          onClick={() => navigate('/profile')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            flexShrink: 0,
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
        >
          <ProfileIcon color={DARK} />
        </button>
      </div>
    </aside>
  );
}
