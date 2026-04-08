import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../stores/sessionStore';
import { useIsMobile } from '../hooks/useIsMobile';
import type { SessionVariant } from '../types';

export interface VariantPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

// ─── Variant data ──────────────────────────────────────────────────────────────
// Figma cards '1'=Sprint, '2'=Classic(active), '3'=DeepWork, '4'=Flow, '5'=Custom
const PRESET_VARIANTS = [
  { id: 'sprint'    as SessionVariant, title: 'Sprint',    desc: 'High intensity bursts',  focus: '15:00', breakT: '3:00' },
  { id: 'classic'   as SessionVariant, title: 'Classic',   desc: 'Standard Pomodoro',      focus: '25:00', breakT: '5:00' },
  { id: 'deep_work' as SessionVariant, title: 'Deep Work', desc: 'Cognitive heavy tasks',  focus: '50:00', breakT: '10:00'},
  { id: 'flow'      as SessionVariant, title: 'Flow',      desc: 'Extended momentum',      focus: '90:00', breakT: '15:00'},
] as const;

// ─── Icons ─────────────────────────────────────────────────────────────────────
// Figma: icons are IMAGE-SVG nodes at x=26, y=41, row, justifyContent: space-between, gap=163.98px, w=204

function IconBolt() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <path d="M9 1L1 11H8L7 19L15 9H8L9 1Z" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTimer() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 20" fill="none">
      <circle cx="9" cy="11" r="8" stroke="#1A1A1A" strokeWidth="1.5"/>
      <path d="M9 7V11L11.5 13.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 1H11.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 1V3" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 1L11.5 8.5L19 10L11.5 11.5L10 19L8.5 11.5L1 10L8.5 8.5L10 1Z" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 1L16.7 3.3L19 4L16.7 4.7L16 7L15.3 4.7L13 4L15.3 3.3L16 1Z" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconWaves() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <path d="M1 2C3 2 4 4 6 4C8 4 9 2 11 2C13 2 14 4 16 4C18 4 19 2 21 2" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1 8C3 8 4 10 6 10C8 10 9 8 11 8C13 8 14 10 16 10C18 10 19 8 21 8" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1 14C3 14 4 16 6 16C8 16 9 14 11 14C13 14 14 16 16 16C18 16 19 14 21 14" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconSliders() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <path d="M1 2H13M13 2C13 3.657 14.343 5 16 5C17.657 5 19 3.657 19 2C19 0.343 17.657-1 16-1C14.343-1 13 0.343 13 2Z" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 14H7M7 14C7 15.657 5.657 17 4 17C2.343 17 1 15.657 1 14C1 12.343 2.343 11 4 11C5.657 11 7 12.343 7 14Z" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 1L17 17M17 1L1 17" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Card Radio / Check ────────────────────────────────────────────────────────
function CardRadio({ isActive }: { isActive: boolean }) {
  if (isActive) {
    // Figma: active card uses green filled check circle (Classic card has timer icon + checkmark)
    return (
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: '#006D37',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      border: '1.5px solid rgba(26,26,26,0.35)',
      flexShrink: 0,
    }} />
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtMins(mins: number): string {
  return `${String(mins).padStart(2, '0')}:00`;
}
function parseMins(raw: string): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  if (isNaN(n) || n < 1) return 1;
  return Math.min(n, 999);
}

// Icons map
const ICONS: Record<string, React.ReactNode> = {
  sprint: <IconBolt />,
  classic: <IconTimer />,
  deep_work: <IconSparkle />,
  flow: <IconWaves />,
  custom: <IconSliders />,
};

// ─── VariantPickerModal ───────────────────────────────────────────────────────
export default function VariantPickerModal({ isOpen, onClose, onContinue }: VariantPickerModalProps) {
  const {
    selectedVariant, setVariant,
    alwaysUseVariant, setAlwaysUse,
    customFocusMinutes, customBreakMinutes, setCustomTimes,
  } = useSessionStore();
  const isMobile = useIsMobile();

  const [customFocusRaw, setCustomFocusRaw] = useState(String(customFocusMinutes));
  const [customBreakRaw, setCustomBreakRaw] = useState(String(customBreakMinutes));

  const handleFocusBlur = () => {
    const mins = parseMins(customFocusRaw);
    setCustomFocusRaw(String(mins));
    setCustomTimes(mins, parseMins(customBreakRaw));
  };
  const handleBreakBlur = () => {
    const mins = parseMins(customBreakRaw);
    setCustomBreakRaw(String(mins));
    setCustomTimes(parseMins(customFocusRaw), mins);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(26,26,26,0.55)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              zIndex: 50,
              width: isMobile ? 'calc(100vw - 32px)' : 'min(1272px, 96vw)',
              maxHeight: isMobile ? '85vh' : '90vh',
              overflowY: 'auto',
              background: '#F2F2F2',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '24px 20px 32px' : '66px 65px 80px',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10, marginBottom: isMobile ? 24 : 97,
            }}>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 12 : 16,
                color: '#1A1A1A', lineHeight: '1.21em',
              }}>
                Configuration
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{
                  margin: 0,
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 24 : 48,
                  color: '#1A1A1A', lineHeight: '1.276em',
                }}>
                  Select Timer Variant
                </h2>

                <button
                  onClick={onClose}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-label="Close"
                >
                  <IconClose />
                </button>
              </div>
            </div>

            {/* 4 Preset Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? 12 : 35,
              marginBottom: isMobile ? 24 : 40,
            }}>
              {PRESET_VARIANTS.map((v) => {
                const isActive = v.id === selectedVariant;
                return (
                  <PresetCard
                    key={v.id}
                    id={v.id}
                    title={v.title}
                    desc={v.desc}
                    focus={v.focus}
                    breakT={v.breakT}
                    icon={ICONS[v.id]}
                    isActive={isActive}
                    alwaysUse={alwaysUseVariant}
                    onSelect={() => setVariant(v.id)}
                    onAlwaysUse={(e) => {
                      e.stopPropagation();
                      if (isActive) setAlwaysUse(!alwaysUseVariant);
                      else { setVariant(v.id); setAlwaysUse(true); }
                    }}
                    isMobile={isMobile}
                  />
                );
              })}
            </div>

            {/* Custom Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {(() => {
                const isActive = selectedVariant === 'custom';
                return (
                  <div
                    onClick={() => setVariant('custom')}
                    style={{ position: 'relative', cursor: 'pointer', width: isMobile ? '100%' : 256, maxWidth: 256 }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 0, right: isMobile ? 0 : -15,
                        background: '#006D37',
                        borderRadius: '0 12px 0 12px',
                        padding: isMobile ? '6px 10px' : '10px 16px',
                        zIndex: 1,
                      }}>
                        <span style={{
                          fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 12,
                          color: '#E8E8E8', lineHeight: '1.21em',
                        }}>
                          Active
                        </span>
                      </div>
                    )}

                    <div style={{
                      width: '100%', minHeight: isMobile ? 200 : 285,
                      background: '#FAFAFA',
                      border: isActive ? '3px solid #006D37' : '1px solid rgba(26,26,26,0.12)',
                      borderRadius: 12,
                      padding: isMobile ? '0 0 16px' : '0 0 24px',
                      boxSizing: 'border-box',
                      position: 'relative',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: isActive ? '0 8px 28px rgba(0,109,55,0.14)' : 'none',
                    }}>
                      <div style={{
                        display: 'flex', flexDirection: 'row',
                        justifyContent: 'space-between', alignItems: 'center',
                        padding: isMobile ? '24px 16px 0' : '41px 26px 0',
                      }}>
                        <IconSliders />
                        <CardRadio isActive={isActive} />
                      </div>

                      <div style={{
                        display: 'flex', flexDirection: 'row',
                        justifyContent: 'space-between', alignItems: 'flex-end',
                        padding: isMobile ? '0 16px' : '0 26px',
                        marginTop: 12,
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 22,
                            color: '#1A1A1A', lineHeight: '1.27em',
                          }}>
                            Custom
                          </span>
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 11 : 13,
                            color: '#006D37', lineHeight: '1.4em',
                          }}>
                            Your time variant
                          </span>
                        </div>

                        <div
                          style={{
                            border: '0.5px solid #1A1A1A',
                            borderRadius: 3,
                            padding: '2px 6px',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isActive) setAlwaysUse(!alwaysUseVariant);
                            else { setVariant('custom'); setAlwaysUse(true); }
                          }}
                        >
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: isMobile ? 8 : 10,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            color: isActive && alwaysUseVariant ? '#006D37' : 'rgba(26,26,26,0.5)',
                          }}>
                            Always Use
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 12,
                          borderTop: '1px solid rgba(26,28,28,0.1)',
                          padding: isMobile ? '12px 16px 0' : '16px 26px 0',
                          marginTop: 16,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 12 : 14,
                            color: '#1A1A1A', lineHeight: '1.43em',
                          }}>
                            Focus
                          </span>
                          <input
                            type="number" min={1} max={999}
                            value={customFocusRaw}
                            onChange={(e) => { setCustomFocusRaw(e.target.value); setVariant('custom'); }}
                            onBlur={handleFocusBlur}
                            onFocus={() => setVariant('custom')}
                            placeholder="25"
                            style={{
                              width: isMobile ? 44 : 52, height: isMobile ? 20 : 24,
                              border: '0.5px solid #1A1A1A',
                              borderRadius: 2,
                              padding: '0 5px',
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700, fontSize: isMobile ? 11 : 13,
                              textAlign: 'center',
                              background: 'transparent',
                              outline: 'none',
                              color: '#1A1A1A',
                              appearance: 'textfield',
                            } as React.CSSProperties}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 12 : 14,
                            color: '#1A1A1A', lineHeight: '1.43em',
                          }}>
                            Break
                          </span>
                          <input
                            type="number" min={1} max={999}
                            value={customBreakRaw}
                            onChange={(e) => { setCustomBreakRaw(e.target.value); setVariant('custom'); }}
                            onBlur={handleBreakBlur}
                            onFocus={() => setVariant('custom')}
                            placeholder="5"
                            style={{
                              width: isMobile ? 44 : 52, height: isMobile ? 20 : 24,
                              border: '0.5px solid #1A1A1A',
                              borderRadius: 2,
                              padding: '0 5px',
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700, fontSize: isMobile ? 11 : 13,
                              textAlign: 'center',
                              background: 'transparent',
                              outline: 'none',
                              color: '#1A1A1A',
                              appearance: 'textfield',
                            } as React.CSSProperties}
                          />
                        </div>

                        {isActive && customFocusRaw && customBreakRaw && (
                          <p style={{
                            margin: 0, marginTop: 2,
                            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 9 : 11,
                            color: 'rgba(0,109,55,0.65)', fontStyle: 'italic',
                          }}>
                            {fmtMins(parseMins(customFocusRaw))} focus · {fmtMins(parseMins(customBreakRaw))} break
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Actions */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 16 : 24,
              marginTop: isMobile ? 32 : 64,
            }}>
              <button
                onClick={onContinue}
                style={{
                  width: isMobile ? '100%' : 300, height: isMobile ? 52 : 64,
                  maxWidth: 300,
                  background: '#006D37', color: '#FAFAFA',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: isMobile ? 14 : 18,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  transition: 'opacity 0.15s',
                }}
              >
                Set Task for This Session
              </button>

              <button
                onClick={onContinue}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 12 : 16,
                  color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em',
                  transition: 'color 0.15s',
                }}
              >
                Skip Task, Just Focus
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── PresetCard ───────────────────────────────────────────────────────────────
function PresetCard({
  title, desc, focus, breakT, icon, isActive, alwaysUse, onSelect, onAlwaysUse, isMobile = false,
}: {
  id?: SessionVariant; title: string; desc: string; focus: string; breakT: string;
  icon: React.ReactNode; isActive: boolean; alwaysUse: boolean;
  onSelect: () => void; onAlwaysUse: (e: React.MouseEvent) => void;
  isMobile?: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        flex: isMobile ? '1 1 auto' : '0 0 auto',
        width: isMobile ? 'auto' : (isActive ? 284 : 257),
        paddingTop: isActive ? (isMobile ? 12 : 20) : 0,
      }}
    >
      {isActive && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: isMobile ? 56 : 72, height: isMobile ? 28 : 40,
          background: '#006D37',
          borderRadius: '0 12px 0 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: isMobile ? 9 : 12,
            color: '#E8E8E8',
          }}>
            Active
          </span>
        </div>
      )}

      <div style={{
        width: isMobile ? '100%' : (isActive ? 256 : 257),
        height: isMobile ? 'auto' : 285,
        minHeight: isMobile ? 180 : 285,
        background: '#FAFAFA',
        borderRadius: 12,
        border: isActive
          ? '3px solid #006D37'
          : '1px solid rgba(26,26,26,0.12)',
        boxShadow: isActive ? '0 8px 28px rgba(0,109,55,0.14)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        padding: isMobile ? '16px 12px 12px' : 0,
      }}>
        {/* Icons row */}
        <div style={{
          position: isMobile ? 'relative' : 'absolute', 
          top: isMobile ? 0 : 41, 
          left: isMobile ? 0 : 26,
          width: isMobile ? '100%' : 204,
          display: 'flex', flexDirection: 'row',
          justifyContent: 'space-between', alignItems: 'center',
          marginBottom: isMobile ? 8 : 0,
        }}>
          {icon}
          <CardRadio isActive={isActive} />
        </div>

        {/* Title & Always Use row */}
        <div style={{
          position: isMobile ? 'relative' : 'absolute', 
          top: isMobile ? 0 : 93, 
          left: isMobile ? 0 : 26,
          width: isMobile ? '100%' : 213,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: isMobile ? 6 : 38,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 22,
              color: '#1A1A1A', lineHeight: '1.27em',
            }}>
              {title}
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 10 : 13,
              color: '#006D37', lineHeight: '1.4em',
            }}>
              {desc}
            </span>
          </div>

          <div
            style={{
              flexShrink: 0,
              border: '0.5px solid #1A1A1A',
              borderRadius: 3,
              padding: '2px 6px',
              cursor: 'pointer',
              height: 16,
              display: 'flex', alignItems: 'center',
            }}
            onClick={onAlwaysUse}
          >
            <span style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: isMobile ? 7 : 9,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: isActive && alwaysUse ? '#006D37' : 'rgba(26,26,26,0.45)',
              whiteSpace: 'nowrap',
            }}>
              Always Use
            </span>
          </div>
        </div>

        {/* Focus & Break section */}
        <div style={{
          position: isMobile ? 'relative' : 'absolute', 
          top: isMobile ? 0 : 172, 
          left: isMobile ? 0 : 26,
          width: isMobile ? '100%' : 204,
          display: 'flex', flexDirection: 'column',
          gap: isMobile ? 8 : 12,
          borderTop: '1px solid rgba(26,28,28,0.1)',
          paddingTop: isMobile ? 10 : 16,
          marginTop: isMobile ? 10 : 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 11 : 14,
              color: '#1A1A1A', lineHeight: '1.43em',
            }}>
              Focus
            </span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 11 : 14,
              color: '#1A1A1A', lineHeight: '1.43em',
            }}>
              {focus}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: isMobile ? 11 : 14,
              color: '#1A1A1A', lineHeight: '1.43em',
            }}>
              Break
            </span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 11 : 14,
              color: '#1A1A1A', lineHeight: '1.43em',
            }}>
              {breakT}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
