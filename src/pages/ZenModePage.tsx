import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import zenTreeImg from '../assets/zen_tree.png';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG = '#F2F2F2';
const DARK = '#1A1A1A';

// ─── Floating icon positions from Figma (relative to 1728×1117 canvas) ───────
// Each icon is a white tree/leaf SVG scattered decoratively
interface FloatItem {
  id: number;
  x: number;   // percent of container width
  y: number;   // percent of container height
  size: number; // px
  opacity: number;
  animDelay: number; // seconds
  variant: 'pine' | 'leaf' | 'sprout' | 'fern' | 'flower';
  rotate: number;
}

const FLOAT_ITEMS: FloatItem[] = [
  { id: 1,  x: 15.3,  y: 7.4,   size: 66,  opacity: 1,    animDelay: 0,    variant: 'pine',   rotate: -8 },
  { id: 2,  x: 8.2,   y: 29.0,  size: 68,  opacity: 0.85, animDelay: 0.8,  variant: 'leaf',   rotate: 12 },
  { id: 3,  x: 11.9,  y: 58.5,  size: 55,  opacity: 0.9,  animDelay: 1.6,  variant: 'sprout', rotate: -5 },
  { id: 4,  x: 11.7,  y: 53.6,  size: 44,  opacity: 0.7,  animDelay: 2.1,  variant: 'fern',   rotate: 20 },
  { id: 5,  x: 16.9,  y: 79.6,  size: 67,  opacity: 0.9,  animDelay: 0.4,  variant: 'pine',   rotate: -15 },
  { id: 6,  x: 8.4,   y: 73.3,  size: 131, opacity: 0.75, animDelay: 1.2,  variant: 'flower', rotate: 0 },
  { id: 7,  x: 27.0,  y: 24.6,  size: 55,  opacity: 0.8,  animDelay: 1.9,  variant: 'leaf',   rotate: 30 },
  { id: 8,  x: 38.0,  y: 70.5,  size: 61,  opacity: 0.85, animDelay: 0.6,  variant: 'sprout', rotate: -10 },
  { id: 9,  x: 25.9,  y: 88.8,  size: 44,  opacity: 0.7,  animDelay: 2.5,  variant: 'pine',   rotate: 8 },
  { id: 10, x: 32.5,  y: -3.2,  size: 63,  opacity: 0.85, animDelay: 1.4,  variant: 'fern',   rotate: -20 },
  { id: 11, x: 67.4,  y: 29.0,  size: 55,  opacity: 0.8,  animDelay: 0.9,  variant: 'leaf',   rotate: 15 },
  { id: 12, x: 74.9,  y: 58.6,  size: 64,  opacity: 0.9,  animDelay: 1.7,  variant: 'pine',   rotate: -12 },
  { id: 13, x: 83.7,  y: 2.9,   size: 68,  opacity: 0.85, animDelay: 0.3,  variant: 'sprout', rotate: 5 },
  { id: 14, x: 80.1,  y: 29.0,  size: 68,  opacity: 0.9,  animDelay: 2.0,  variant: 'flower', rotate: -7 },
  { id: 15, x: 87.0,  y: 74.5,  size: 66,  opacity: 0.8,  animDelay: 1.1,  variant: 'pine',   rotate: 10 },
  { id: 16, x: 62.4,  y: 88.6,  size: 55,  opacity: 0.75, animDelay: 0.5,  variant: 'fern',   rotate: -25 },
];

// ─── SVG tree variant shapes ──────────────────────────────────────────────────
function FloatingSvg({ variant, size, color = 'white' }: { variant: FloatItem['variant']; size: number; color?: string }) {
  switch (variant) {
    case 'pine':
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 4L46 22H37L46 38H35V56H25V38H14L23 22H14L30 4Z" fill={color} opacity="0.95"/>
        </svg>
      );
    case 'leaf':
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 8C30 8 8 20 8 38C8 50 18 56 30 56C42 56 52 50 52 38C52 20 30 8 30 8Z" fill={color} opacity="0.9"/>
          <path d="M30 8L30 56" stroke={color} strokeWidth="2" opacity="0.5"/>
        </svg>
      );
    case 'sprout':
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="22" r="14" fill={color} opacity="0.9"/>
          <rect x="27" y="34" width="6" height="20" rx="3" fill={color} opacity="0.8"/>
          <ellipse cx="19" cy="38" rx="10" ry="8" fill={color} opacity="0.75"/>
          <ellipse cx="41" cy="38" rx="10" ry="8" fill={color} opacity="0.75"/>
        </svg>
      );
    case 'fern':
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 56L30 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          <path d="M30 42C30 42 14 34 12 20C24 22 30 34 30 42Z" fill={color} opacity="0.85"/>
          <path d="M30 32C30 32 44 22 48 8C36 10 30 22 30 32Z" fill={color} opacity="0.85"/>
          <path d="M30 50C30 50 18 44 16 34" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
        </svg>
      );
    case 'flower':
      return (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="30" cy="16" rx="8" ry="12" fill={color} opacity="0.85"/>
          <ellipse cx="44" cy="30" rx="12" ry="8" fill={color} opacity="0.85"/>
          <ellipse cx="30" cy="44" rx="8" ry="12" fill={color} opacity="0.85"/>
          <ellipse cx="16" cy="30" rx="12" ry="8" fill={color} opacity="0.85"/>
          <circle cx="30" cy="30" r="9" fill={color}/>
        </svg>
      );
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ZenModePage() {
  const navigate = useNavigate();
  // Inject keyframe animation + Escape to exit
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes zenFloat {
        0%   { transform: translateY(0px)   rotate(var(--zen-rot)); }
        50%  { transform: translateY(-12px) rotate(var(--zen-rot)); }
        100% { transform: translateY(0px)   rotate(var(--zen-rot)); }
      }
      @keyframes zenPulse {
        0%   { opacity: 0.6; transform: scale(1); }
        50%  { opacity: 1;   transform: scale(1.015); }
        100% { opacity: 0.6; transform: scale(1); }
      }
      @keyframes zenFadeIn {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .zen-hero-text {
        animation: zenFadeIn 0.8s ease both;
      }
      .zen-exit-text {
        animation: zenFadeIn 0.8s ease 0.3s both;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .zen-exit-text:hover {
        opacity: 0.5 !important;
      }
    `;
    document.head.appendChild(style);

    // Escape key exits zen mode
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/dashboard');
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      style.remove();
      window.removeEventListener('keydown', handleKey);
    };
  }, [navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: BG,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Scattered floating tree icons ── */}
      {FLOAT_ITEMS.map(item => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            opacity: item.opacity * 0.4,   // white icons on light bg → keep subtle
            animation: `zenFloat ${3.5 + (item.animDelay % 1.5)}s ease-in-out ${item.animDelay}s infinite`,
            // CSS custom property for rotation, referenced in keyframe
            ['--zen-rot' as string]: `${item.rotate}deg`,
            transform: `rotate(${item.rotate}deg)`,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 8px rgba(0,109,55,0.15))',
          }}
        >
          <FloatingSvg variant={item.variant} size={item.size} color="#006D37" />
        </div>
      ))}

      {/* ── Centered content column ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '30px',
          width: '1402px',
          maxWidth: '90vw',
          height: '743px',
          maxHeight: '80vh',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Top: You did 45 sessions */}
        <div
          className="zen-hero-text"
          style={{
            width: '522px',
            maxWidth: '100%',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(16px, 1.6vw, 20px)',
              lineHeight: '0.8em',
              letterSpacing: '0.12em',
              textTransform: 'lowercase',
              color: DARK,
              opacity: 0.6,
              display: 'block',
            }}
          >
            you did 45 sessions
          </span>
        </div>

        {/* Middle: Tree illustration */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            animation: 'zenPulse 5s ease-in-out infinite',
          }}
        >
          <img
            src={zenTreeImg}
            alt="A beautiful grown tree"
            style={{
              width: 'min(639px, 60vw)',
              height: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Bottom: Exit view */}
        <div
          style={{
            width: '522px',
            maxWidth: '100%',
            textAlign: 'center',
          }}
        >
          <span
            className="zen-exit-text"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/dashboard')}
            onKeyDown={e => e.key === 'Enter' && navigate('/dashboard')}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(14px, 1.4vw, 18px)',
              lineHeight: '1em',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: DARK,
              opacity: 0.7,
              display: 'block',
              animationDelay: '0.3s',
            }}
          >
            Exit view
          </span>
        </div>
      </div>
    </div>
  );
}
