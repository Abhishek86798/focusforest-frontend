/**
 * ProfilePage — Responsive implementation with full API integration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../stores/authStore';

import { useStatsSummary, useWeekData, useStreak } from '../hooks/useForestData';
import { preferencesApi } from '../api';
import { getCurrentWeekId } from '../utils';
import { VARIANT_CONFIGS, type SessionVariant } from '../types';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const SUPERWHITE = '#FAFAFA';
const WHITE      = '#FFFFFF';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW_SM  = '4px 4px 0px 0px rgba(26,26,26,1)';
const SHADOW_MD  = '6px 6px 0px 0px rgba(26,26,26,1)';
const RED        = '#FF0000';

// ─── Small icon components ─────────────────────────────────────────────────────

const TrendUpIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path d="M1 7L4.5 3.5L7 6L11 1" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 1H11V4" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke={GREEN} strokeWidth="1.2"/>
    <path d="M6 3.5V6L7.5 7.5" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

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

const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" stroke={DARK} strokeWidth="1.5"/>
    <path d="M2 14C2.5 11 5 9.5 8 9.5C11 9.5 13.5 11 14 14" stroke={DARK} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
    <rect x="1" y="8" width="14" height="12" rx="2" stroke={DARK} strokeWidth="1.5"/>
    <path d="M4 8V5.5C4 3.567 5.791 2 8 2C10.209 2 12 3.567 12 5.5V8" stroke={DARK} strokeWidth="1.5"/>
  </svg>
);

const SignOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M7 15H3C2.448 15 2 14.552 2 14V4C2 3.448 2.448 3 3 3H7" stroke={RED} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 12L16 9L12 6" stroke={RED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 9H6" stroke={RED} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ChevronRight = ({ color = DARK }: { color?: string }) => (
  <svg width="8" height="12" viewBox="0 0 8 14" fill="none">
    <path d="M1 1L7 7L1 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Section: Profile Header ───────────────────────────────────────────────────
function ProfileHeader({ isMobile, userName }: { isMobile: boolean; userName: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: isMobile ? '16px' : '32px',
      padding: isMobile ? '24px 0' : '32px 0',
    }}>
      {/* Avatar */}
      <div style={{
        width: isMobile ? '80px' : '128px',
        height: isMobile ? '80px' : '128px',
        flexShrink: 0,
        background: WHITE,
        border: `2px solid ${DARK}`,
        boxShadow: SHADOW_SM,
        borderRadius: isMobile ? '10px' : '13px',
        boxSizing: 'border-box',
      }} />

      {/* Name */}
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '24px' : '48px',
        lineHeight: '1em',
        textTransform: 'uppercase',
        letterSpacing: '-0.025em',
        color: '#1A1C1C',
        textAlign: isMobile ? 'center' : 'left',
      }}>
        {userName || 'User'}
      </span>
    </div>
  );
}

// ─── Section: Stats Bento Grid ────────────────────────────────────────────────
function StatsBentoGrid({ isMobile }: { isMobile: boolean }) {
  const { user } = useAuthStore();
  const { data: stats } = useStatsSummary();
  const weekId = getCurrentWeekId();
  const { data: weekData } = useWeekData(weekId);

  // Calculate trees this week (count days where stage === 4)
  const treesThisWeek = weekData?.days?.filter(day => day.stage === 4).length || 0;

  // Use live streak from /stats/streak, not stale auth store value
  const { data: streakApiData } = useStreak();
  const currentStreak = streakApiData?.currentStreak ?? user?.currentStreak ?? 0;

  // Focus hours from stats (totalMinutes / 60)
  const focusHours = stats?.totalMinutes ? Math.round(stats.totalMinutes / 60) : '--';

  // Trees grown from stats
  const treesGrown = stats?.treesCompleted ?? '--';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'stretch',
      gap: '16px',
      width: '100%',
    }}>
      {/* Streak Focal Point */}
      <div style={{
        position: 'relative',
        flex: isMobile ? 'none' : '1.95',
        minHeight: isMobile ? '160px' : '212px',
        background: GREEN,
        border: `1px solid ${DARK}`,
        boxShadow: SHADOW_MD,
        padding: isMobile ? '24px' : '32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Background flame watermark */}
        <div style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-10px',
          opacity: 0.1,
          pointerEvents: 'none',
        }}>
          <svg width={isMobile ? '100' : '148'} height={isMobile ? '110' : '165'} viewBox="0 0 148 165" fill="none">
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
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? '10px' : '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: SUPERWHITE,
            lineHeight: 1.33,
          }}>
            Current Streak
          </span>
        </div>

        {/* Number */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '64px' : '96px',
          lineHeight: '1em',
          letterSpacing: '-0.05em',
          color: SUPERWHITE,
          display: 'block',
        }}>
          {currentStreak}
        </span>
      </div>

      {/* Trees Grown & Focus Hours */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'row',
        gap: '16px',
        flex: isMobile ? 'none' : '2',
      }}>
        {/* Trees Grown */}
        <div style={{
          flex: 1,
          background: SUPERWHITE,
          border: `1px solid ${DARK}`,
          boxShadow: SHADOW_SM,
          padding: isMobile ? '16px' : '24px 24px 84px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '8px' : '16px',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600, fontSize: isMobile ? '10px' : '12px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, lineHeight: 1.33,
          }}>
            Trees Grown
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '24px' : '36px',
            lineHeight: '1.11em',
            color: DARK,
          }}>
            {treesGrown}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendUpIcon />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600, fontSize: isMobile ? '10px' : '12px',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              color: GREEN, lineHeight: 1.33,
            }}>
              +{treesThisWeek} this week
            </span>
          </div>
        </div>

        {/* Focus Hours */}
        <div style={{
          flex: 1,
          background: SUPERWHITE,
          border: `1px solid ${DARK}`,
          boxShadow: SHADOW_SM,
          padding: isMobile ? '16px' : '24px 24px 84px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '8px' : '16px',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600, fontSize: isMobile ? '10px' : '12px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, lineHeight: 1.33,
          }}>
            Focus Hours
          </span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '24px' : '36px',
            lineHeight: '1.11em',
            color: DARK,
          }}>
            {focusHours}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ClockIcon />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600, fontSize: isMobile ? '10px' : '12px',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              color: GREEN, lineHeight: 1.33,
            }}>
              Keep it up!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Account Details ─────────────────────────────────────────────────
function AccountDetails({ isMobile, onSignOut }: { isMobile: boolean; onSignOut: () => void }) {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<SessionVariant>(() => {
    return (localStorage.getItem('focusforest_default_variant') as SessionVariant) || 'classic';
  });

  // Get timezone string
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleVariantSelect = async (variant: SessionVariant) => {
    setSelectedVariant(variant);
    localStorage.setItem('focusforest_default_variant', variant);
    setShowVariantModal(false);
    // Also persist to backend so it's available on any device/session
    try {
      await preferencesApi.update({ selectedVariant: variant });
    } catch {
      // Non-critical: localStorage already saved it
      toast.error('Could not save variant preference to server.');
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '24px' : '48px',
        width: '100%',
      }}>
        {/* Heading */}
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '16px' : '20px',
          lineHeight: '1.4em',
          textTransform: 'uppercase',
          letterSpacing: '-0.025em',
          color: DARK,
        }}>
          Account Details
        </span>

        {/* Border container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderTop: `1px solid ${DARK}`,
        }}>
          <SettingsRow
            icon={<PersonIcon />}
            label="Set Default Variant"
            value={VARIANT_CONFIGS.find(v => v.id === selectedVariant)?.label}
            showChevron
            isMobile={isMobile}
            onClick={() => setShowVariantModal(true)}
          />
          <SettingsRow
            icon={<LockIcon />}
            label="Time Zone"
            value={timezone}
            borderTop
            isMobile={isMobile}
          />
          <SettingsRow
            icon={<SignOutIcon />}
            label="Sign Out"
            color={RED}
            borderTop
            isMobile={isMobile}
            onClick={onSignOut}
          />
        </div>
      </div>

      {/* Variant Picker Modal */}
      {showVariantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,26,26,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: SUPERWHITE,
            border: `2px solid ${DARK}`,
            boxShadow: SHADOW_MD,
            borderRadius: '8px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: DARK,
              marginBottom: '24px',
              textTransform: 'uppercase',
            }}>
              Set Default Variant
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {VARIANT_CONFIGS.filter(v => v.id !== 'custom').map((variant) => (
                <div
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant.id)}
                  style={{
                    padding: isMobile ? '16px' : '20px',
                    background: selectedVariant === variant.id ? GREEN : WHITE,
                    border: `2px solid ${DARK}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <span style={{ fontSize: '24px' }}>{variant.emoji}</span>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: isMobile ? '16px' : '18px',
                        color: selectedVariant === variant.id ? SUPERWHITE : DARK,
                      }}>
                        {variant.label}
                      </span>
                    </div>
                    {selectedVariant === variant.id && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill={SUPERWHITE} />
                        <path d="M6 10L8.8 13L14 7" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: isMobile ? '12px' : '14px',
                    color: selectedVariant === variant.id ? 'rgba(250,250,250,0.8)' : '#666',
                  }}>
                    {variant.description}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowVariantModal(false)}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '12px',
                background: WHITE,
                color: DARK,
                border: `2px solid ${DARK}`,
                borderRadius: '4px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  color = DARK,
  showChevron = false,
  borderTop = false,
  isMobile = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  color?: string;
  showChevron?: boolean;
  borderTop?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '16px 0' : '20px 0',
        borderTop: borderTop ? `1px solid ${DARK}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Left side: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
        {icon}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: color === RED ? 700 : 600,
          fontSize: isMobile ? '12px' : '14px',
          lineHeight: '1.43em',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color,
        }}>
          {label}
        </span>
      </div>
      
      {/* Right side: value or chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {value && (
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? '11px' : '13px',
            color: '#666',
          }}>
            {value}
          </span>
        )}
        {showChevron && <ChevronRight color={DARK} />}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="dashboard" />}

      <main style={{
        marginLeft: isMobile ? 0 : '101px',
        flex: 1,
        padding: isMobile ? '20px 16px 100px' : '0 120px',
        display: 'flex',
        flexDirection: 'column',
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
              Profile
            </h1>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader isMobile={isMobile} userName={user?.name || 'User'} />

        {/* Stats Bento Grid */}
        <StatsBentoGrid isMobile={isMobile} />

        {/* Spacer */}
        <div style={{ height: isMobile ? '32px' : '80px', flexShrink: 0 }} />

        {/* Account Details */}
        <AccountDetails isMobile={isMobile} onSignOut={handleSignOut} />
      </main>

      {isMobile && <MobileBottomNav activePage="dashboard" />}
    </div>
  );
}
