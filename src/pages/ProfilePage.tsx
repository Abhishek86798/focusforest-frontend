/**
 * ProfilePage — Figma node 162:1832 ("Proflie")
 *
 * Layout (x/y relative to main window starting at x=101):
 *
 *  ┌─ Profile Header  (y=51, row, gap=32, padding=32 0) ─────────────────────┐
 *  │  [128×128 avatar box]   NAME (Space Grotesk 700, 48px, UPPER)           │
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ Stats Bento Grid  (y=280, row, w=1383, h=218) ─────────────────────────┐
 *  │  [STREAK — green, w=683.5, h=212]  [TREES, w=333.75]  [FOCUS, w=333.75]│
 *  └─────────────────────────────────────────────────────────────────────────┘
 *
 *  ┌─ Account Details  (y=810, column, gap=24) ──────────────────────────────┐
 *  │  ACCOUNT DETAILS heading                                                │
 *  │  ── Set Default Variant  ›                                              │
 *  │  ── Time Zone  ›                                                        │
 *  │  ── Sign Out  (red)                                                     │
 *  └─────────────────────────────────────────────────────────────────────────┘
 */

import Sidebar from '../components/Sidebar';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG         = '#F2F2F2';   // White in Figma
const SUPERWHITE = '#FAFAFA';
const WHITE      = '#FFFFFF';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW_SM  = '4px 4px 0px 0px rgba(26,26,26,1)';  // effect_B2LVL2
const SHADOW_MD  = '6px 6px 0px 0px rgba(26,26,26,1)';  // effect_2WZ40E (streak)
const RED        = '#FF0000';   // fill_RL3PCB

// ─── Small icon components ─────────────────────────────────────────────────────

/** Up-trend arrow for "+12 this week" */
const TrendUpIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path d="M1 7L4.5 3.5L7 6L11 1" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 1H11V4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Clock icon for "Top 5% User" */
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke={GREEN} strokeWidth="1.2"/>
    <path d="M6 3.5V6L7.5 7.5" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

/** Flame / streak icon (white, for streak card header) */
const FlameIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 20" fill="none">
    <path
      d="M8 0C8 0 13 5 13 10C13 13.314 10.761 16 8 16C5.239 16 3 13.314 3 10C3 8.5 3.5 7 3.5 7C3.5 7 5 9.5 6 9.5C6 6 8 3.5 8 0Z"
      fill="white" opacity="0.9"
    />
    <path
      d="M8 12C8 12 9.5 13 9.5 14.5C9.5 15.88 8.828 17 8 17C7.172 17 6.5 15.88 6.5 14.5C6.5 13 8 12 8 12Z"
      fill="white" opacity="0.55"
    />
  </svg>
);

/** Person/variant icon for settings rows */
const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" stroke={DARK} strokeWidth="1.5"/>
    <path d="M2 14C2.5 11 5 9.5 8 9.5C11 9.5 13.5 11 14 14" stroke={DARK} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/** Lock icon for Time Zone */
const LockIcon = () => (
  <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
    <rect x="1" y="8" width="14" height="12" rx="2" stroke={DARK} strokeWidth="1.5"/>
    <path d="M4 8V5.5C4 3.567 5.791 2 8 2C10.209 2 12 3.567 12 5.5V8" stroke={DARK} strokeWidth="1.5"/>
  </svg>
);

/** Sign out arrow icon */
const SignOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M7 15H3C2.448 15 2 14.552 2 14V4C2 3.448 2.448 3 3 3H7" stroke={RED} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 12L16 9L12 6" stroke={RED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 9H6" stroke={RED} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/** Chevron right (for settings rows) */
const ChevronRight = ({ color = DARK }: { color?: string }) => (
  <svg width="8" height="12" viewBox="0 0 8 14" fill="none">
    <path d="M1 1L7 7L1 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Section: Profile Header ───────────────────────────────────────────────────
// Figma: layout_FBENXJ: row, alignItems=center, gap=32, padding=32 0, x=221, y=51, w=1383
function ProfileHeader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '32px',
      padding: '32px 0',
    }}>
      {/* Avatar — layout_FBJS1X: 128×128, border 2px solid Black, shadow, borderRadius ~12–16px, fill #FFFFFF */}
      <div style={{
        width: '128px',
        height: '128px',
        flexShrink: 0,
        background: WHITE,
        border: `2px solid ${DARK}`,
        boxShadow: SHADOW_SM,
        borderRadius: '13px',
        boxSizing: 'border-box',
      }} />

      {/* Name — style_5ZS627: Space Grotesk 700, 48px, UPPER, -2.5% tracking, fill #1A1C1C */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: '48px',
        lineHeight: '1em',
        textTransform: 'uppercase',
        letterSpacing: '-0.025em',
        color: '#1A1C1C',
      }}>
        Name
      </span>
    </div>
  );
}

// ─── Section: Stats Bento Grid ────────────────────────────────────────────────
// Figma: layout_APMZKK: x=221, y=280, w=1383, h=218
// Three cards in a row (no explicit gap — Figma uses absolute x positions)
function StatsBentoGrid() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: '16px',
      width: '100%',
    }}>
      {/* ── Streak Focal Point ──
          layout_2Y307Z: w=683.5, h=212, GREEN bg, padding=32, 1px black stroke
          shadow: 6px 6px 0px 0px #1A1A1A
          Icon: large flame silhouette absolutely positioned at x=550, opacity=0.1
      */}
      <div style={{
        position: 'relative',
        flex: '1.95',           // 683.5 / (683.5+333.75+333.75) ≈ ratio
        minHeight: '212px',
        background: GREEN,
        border: `1px solid ${DARK}`,
        boxShadow: SHADOW_MD,
        padding: '32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Background flame watermark — absolute, opacity 0.1 */}
        <div style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-10px',
          opacity: 0.1,
          pointerEvents: 'none',
        }}>
          <svg width="148" height="165" viewBox="0 0 148 165" fill="none">
            <path
              d="M74 0C74 0 148 55 148 104C148 138.794 114.51 165 74 165C33.49 165 0 138.794 0 104C0 84 13 66 13 66C13 66 34 104 55 104C55 65 74 39 74 0Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Top: label row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <FlameIcon />
          {/* "CURRENT STREAK" — style_4OQACA: Inter 600, 12px, UPPER, 10% spacing */}
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: SUPERWHITE,
            lineHeight: 1.33,
          }}>
            Current Streak
          </span>
        </div>

        {/* Number — style_16D2PS: Space Grotesk 700, 96px, -5% tracking */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '96px',
          lineHeight: '1em',
          letterSpacing: '-0.05em',
          color: SUPERWHITE,
          display: 'block',
        }}>
          124
        </span>
      </div>

      {/* ── Trees Grown ──
          layout_QYPHJ1: w=333.75, h=214, SUPERWHITE, padding=24 24 84, gap=16, 1px stroke, shadow 4px
      */}
      <div style={{
        flex: '1',
        background: SUPERWHITE,
        border: `1px solid ${DARK}`,
        boxShadow: SHADOW_SM,
        padding: '24px 24px 84px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Label */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600, fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: DARK, lineHeight: 1.33,
        }}>
          Trees Grown
        </span>
        {/* Value — style_JT8PXJ: Space Grotesk 700, 36px */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: '36px',
          lineHeight: '1.11em',
          color: DARK,
        }}>
          1,482
        </span>
        {/* Sub-label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendUpIcon />
          {/* style_TZ5TDS: Inter 600, 12px, UPPER, fill=Green */}
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600, fontSize: '12px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: GREEN, lineHeight: 1.33,
          }}>
            +12 this week
          </span>
        </div>
      </div>

      {/* ── Focus Hours ──
          Same dimensions as Trees Grown card
      */}
      <div style={{
        flex: '1',
        background: SUPERWHITE,
        border: `1px solid ${DARK}`,
        boxShadow: SHADOW_SM,
        padding: '24px 24px 84px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Label */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600, fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: DARK, lineHeight: 1.33,
        }}>
          Focus Hours
        </span>
        {/* Value */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: '36px',
          lineHeight: '1.11em',
          color: DARK,
        }}>
          840
        </span>
        {/* Sub-label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockIcon />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600, fontSize: '12px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: GREEN, lineHeight: 1.33,
          }}>
            Top 5% User
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Account Details ─────────────────────────────────────────────────
// Figma: layout_KZ6U3Y: column, gap=24, padding=0 0 48, x=221, y=810, w=1383, h=237
function AccountDetails() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      paddingBottom: '48px',
      width: '100%',
    }}>
      {/* Heading — style_M36V2Z: Space Grotesk 700, 20px, UPPER, -2.5% */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '1.4em',
        textTransform: 'uppercase',
        letterSpacing: '-0.025em',
        color: DARK,
      }}>
        Account Details
      </span>

      {/* Border container — three rows with top/bottom dividers */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${DARK}`,
      }}>
        {/* Row 1: Set Default Variant */}
        <SettingsRow
          icon={<PersonIcon />}
          label="Set Default Variant"
          labelStyle="style_QKVS8X"
          showChevron
        />

        {/* Row 2: Time Zone */}
        <SettingsRow
          icon={<LockIcon />}
          label="Time Zone"
          labelStyle="style_9SWDHN"
          showChevron
          borderTop
        />

        {/* Row 3: Sign Out */}
        <SettingsRow
          icon={<SignOutIcon />}
          label="Sign Out"
          labelStyle="style_7622EJ"
          color={RED}
          borderTop
        />
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  color = DARK,
  showChevron = false,
  borderTop = false,
}: {
  icon: React.ReactNode;
  label: string;
  labelStyle?: string;
  color?: string;
  showChevron?: boolean;
  borderTop?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      borderTop: borderTop ? `1px solid ${DARK}` : 'none',
    }}>
      {/* Left side: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {icon}
        {/* style_QKVS8X / style_9SWDHN / style_7622EJ:
            Inter 600–700, 14px, UPPER, 10% tracking */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: color === RED ? 700 : 600,
          fontSize: '14px',
          lineHeight: '1.43em',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color,
        }}>
          {label}
        </span>
      </div>
      {/* Chevron right */}
      {showChevron && <ChevronRight color={DARK} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="dashboard" />

      <main style={{
        marginLeft: '101px',
        flex: 1,
        /* Figma: main window x=221 from full page = 221-101=120px from sidebar edge */
        padding: '0 120px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* Profile Header — y=51 from page top */}
        <ProfileHeader />

        {/* Stats Bento Grid — y=280 from page top; gap from header bottom = 280-51-header_height ≈ auto flex */}
        <StatsBentoGrid />

        {/* Spacer between grid and account details (y=810 - y=280 - h=218 = 312px gap) */}
        <div style={{ height: '80px', flexShrink: 0 }} />

        {/* Account Details — y=810 */}
        <AccountDetails />
      </main>
    </div>
  );
}
