/**
 * ProfilePage — Responsive implementation with full API integration
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api';

import { useStatsSummary, useWeekData, useStreak } from '../hooks/useForestData';
import { getCurrentWeekId } from '../utils';
import { VARIANT_CONFIGS, type SessionVariant } from '../types';
import MonthlyEfforts from '../components/MonthlyEfforts';

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
const ProfileAvatar = ({ isMobile }: { isMobile: boolean }) => {
  const user = useAuthStore((s) => s.user);
  const uploadAvatar = useAuthStore((s) => s.uploadAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading avatar...');
    
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload avatar', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const dimension = isMobile ? '80px' : '128px';

  return (
    <div
      className="relative cursor-pointer group flex-shrink-0"
      style={{
        width: dimension,
        height: dimension,
        background: WHITE,
        border: `2px solid ${DARK}`,
        boxShadow: SHADOW_SM,
        borderRadius: user?.avatarUrl ? '50%' : (isMobile ? '10px' : '13px'),
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? '32px' : '48px', color: '#ccc' }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-white text-xs font-bold font-['Space_Grotesk'] uppercase tracking-widest">Upload</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

function ProfileHeader({ isMobile, userName }: { isMobile: boolean; userName: string }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 py-6 md:py-8">
      {/* Avatar */}
      <ProfileAvatar isMobile={isMobile} />

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

// ─── Section: Edit Profile Form ────────────────────────────────────────────────
function EditProfileForm({ isMobile }: { isMobile: boolean }) {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setIsPrivate(user.isPrivate);
    }
  }, [user]);

  const hasChanges = user && (name !== user.name || isPrivate !== user.isPrivate);

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const payload: any = {};
      if (name !== user.name) payload.name = name;
      if (isPrivate !== user.isPrivate) payload.isPrivate = isPrivate;
      
      await authApi.updateProfile(payload);
      // Update local Zustand store
      useAuthStore.setState({ user: { ...user, ...payload } });
      toast.success('Profile updated');
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.data?.error?.code === 'VALIDATION_ERROR') {
        toast.error('Invalid input');
      } else if (err.response?.status === 404) {
        toast.error('Profile not found');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '24px',
      paddingTop: isMobile ? '16px' : '24px',
      paddingBottom: isMobile ? '24px' : '48px',
      width: '100%',
    }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '16px' : '20px',
        lineHeight: '1.4em',
        textTransform: 'uppercase',
        letterSpacing: '-0.025em',
        color: DARK,
      }}>
        Edit Profile
      </span>

      <div className="w-full max-w-lg" style={{
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${DARK}`,
      }}>
        {/* Name Input Row */}
        <div className="flex flex-col md:flex-row md:items-center py-4 md:py-5 min-h-[44px]" style={{ gap: '16px' }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? '12px' : '14px',
            lineHeight: '1.43em',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: DARK,
            minWidth: '150px'
          }}>
            Display Name
          </span>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="flex-1 bg-transparent border-b-2 border-transparent hover:border-[#1A1A1A] px-0 py-1 focus:outline-none focus:border-[#006D37] transition-colors font-['Space_Grotesk'] font-bold text-[16px] md:text-[20px] text-[#1A1A1A]"
            placeholder="Your Name"
          />
        </div>

        {/* Privacy Toggle Row */}
        <div className="flex flex-row items-center justify-between md:justify-start py-4 md:py-5 min-h-[44px]" style={{ gap: '16px', borderTop: `1px solid ${DARK}` }}>
           <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? '12px' : '14px',
            lineHeight: '1.43em',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: DARK,
            minWidth: '150px'
          }}>
            Private Profile
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#006D37] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006D37]"></div>
          </label>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-6 md:pt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1A1A1A] text-white px-8 py-3 rounded-[4px] font-['Space_Grotesk'] font-bold text-[14px] uppercase tracking-[0.05em] hover:bg-[#006D37] transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
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
    <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
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
      <div className="flex flex-row gap-4 md:flex-[2]">
        {/* Trees Grown */}
        <div className="flex-1 bg-[#FAFAFA] border border-[#1A1A1A] p-4 md:px-6 md:pt-6 md:pb-[84px] flex flex-col gap-2 md:gap-4 box-border shadow-[4px_4px_0px_0px_#1A1A1A]">
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
        <div className="flex-1 bg-[#FAFAFA] border border-[#1A1A1A] p-4 md:px-6 md:pt-6 md:pb-[84px] flex flex-col gap-2 md:gap-4 box-border shadow-[4px_4px_0px_0px_#1A1A1A]">
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
  const { user, updateProfile } = useAuthStore();
  const selectedVariant = (user?.default_variant || 'classic') as SessionVariant;

  // Get timezone string
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleVariantSelect = async (variant: SessionVariant) => {
    // Optimistic UI updates handle themselves if we setShowVariantModal false,
    // but the actual save will call updateProfile which sets user store right away.
    setShowVariantModal(false);
    const toastId = toast.loading('Saving preference...');
    try {
      await updateProfile({ default_variant: variant });
      toast.success('Default variant updated', { id: toastId });
    } catch {
      toast.error('Failed to save preference', { id: toastId });
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
        <div className="w-full max-w-lg" style={{
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
          <div className="bg-[#FAFAFA] border-2 border-[#1A1A1A] rounded-lg max-w-[500px] w-full max-h-[80vh] overflow-y-auto px-6 md:px-8 py-6 md:py-8 shadow-[6px_6px_0px_0px_#1A1A1A]">
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
                  className={`border-2 border-[#1A1A1A] rounded-[4px] cursor-pointer transition-transform duration-150 p-4 md:p-5 ${selectedVariant === variant.id ? 'bg-[#006D37]' : 'bg-[#FFFFFF]'}`}
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
              className="w-full mt-6 p-3 bg-[#FFFFFF] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[4px] min-h-[44px] min-w-[44px] uppercase transition-all duration-200 ease-out active:scale-[0.97] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >  Cancel
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
      className={`flex flex-row justify-between items-center py-4 md:py-5 min-h-[44px] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        borderTop: borderTop ? `1px solid ${DARK}` : 'none',
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

      <main className="flex-1 flex flex-col box-border ml-0 md:ml-[101px] h-screen overflow-y-auto overflow-x-hidden">
        <div className="w-full px-4 md:px-8 lg:px-12 max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] mx-auto py-5 md:py-8 pb-[100px] md:pb-[100px] flex flex-col items-center">

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
        <div className="w-full flex justify-start pb-4">
          <ProfileHeader isMobile={isMobile} userName={user?.name || 'User'} />
        </div>

        {/* Edit Profile Form */}
        <div className="w-full flex justify-start">
          <EditProfileForm isMobile={isMobile} />
        </div>

        {/* Stats Bento Grid */}
        <StatsBentoGrid isMobile={isMobile} />

        {/* Spacer */}
        <div style={{ height: isMobile ? '32px' : '80px', flexShrink: 0 }} />

        {/* Monthly Efforts */}
        <div className="w-full flex justify-start">
          <MonthlyEfforts />
        </div>

        {/* Spacer */}
        <div style={{ height: isMobile ? '32px' : '80px', flexShrink: 0 }} />

        {/* Account Details */}
        <div className="w-full flex justify-start">
          <AccountDetails isMobile={isMobile} onSignOut={handleSignOut} />
        </div>
        </div>
      </main>

      {isMobile && <MobileBottomNav activePage="dashboard" />}
    </div>
  );
}
