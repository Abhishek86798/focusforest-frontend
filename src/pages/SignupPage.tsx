import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { detectUtcOffset, formatUtcOffset } from '../utils';

// ── Validation schema ─────────────────────────────────────────────────────────
const schema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG      = '#0d1f0f';
const CARD    = '#1a3a1c';
const GREEN   = '#4caf50';
const GOLD    = '#f9c74f';
const TEXT    = '#e8f5e9';
const MUTED   = '#81c784';
const BORDER  = '#2d6a30';

// Password strength indicator
function getStrength(pw: string): { label: string; color: string; pct: number } {
  if (pw.length === 0) return { label: '', color: 'transparent', pct: 0 };
  const hasNum = /\d/.test(pw);
  const hasSpec = /[^a-zA-Z0-9]/.test(pw);
  if (pw.length >= 8 && (hasNum || hasSpec)) return { label: 'Strong', color: GREEN, pct: 100 };
  if (pw.length >= 8) return { label: 'Good', color: GOLD, pct: 66 };
  return { label: 'Weak', color: '#fca5a5', pct: 33 };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [pwValue, setPwValue] = useState('');

  const utcOffset = detectUtcOffset();
  const tzLabel = `UTC ${formatUtcOffset(utcOffset)}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await signup(data.name, data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 409) {
        setServerError('This email is already registered. Sign in instead?');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  const strength = getStrength(pwValue);
  const busy = isSubmitting || isLoading;

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? 'rgba(220,38,38,0.6)' : BORDER}`,
    borderRadius: '8px',
    color: TEXT,
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: MUTED,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.09em',
    marginBottom: '7px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      // subtle radial noise texture mimicking login page
      backgroundImage: `
        radial-gradient(ellipse 80% 60% at 80% 60%, rgba(45,106,48,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 20% 20%, rgba(76,175,80,0.07) 0%, transparent 50%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
      `,
    }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: '16px',
          padding: '44px 40px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(45,106,48,0.3)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', background: 'rgba(76,175,80,0.15)',
            border: `1px solid ${BORDER}`, borderRadius: '16px',
            marginBottom: '16px', boxShadow: '0 0 24px rgba(76,175,80,0.15)',
            fontSize: '24px'
          }}>
            🌱
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700,
            fontSize: '28px', color: GREEN, letterSpacing: '-0.01em',
            marginBottom: '6px'
          }}>
            Plant Your First Seed
          </h1>
          <p style={{ fontSize: '14px', color: MUTED }}>
            Start your focus journey today
          </p>
        </div>

        {/* Error banner */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: '8px', padding: '11px 16px', marginBottom: '20px',
              fontSize: '14px', color: '#fca5a5', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {serverError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              autoComplete="name"
              {...register('name')}
              placeholder="Your name"
              style={inputStyle(!!errors.name)}
              onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
              onBlur={e => (e.currentTarget.style.borderColor = errors.name ? 'rgba(220,38,38,0.6)' : BORDER)}
            />
            {errors.name && <span style={{ fontSize: '12px', color: '#fca5a5', marginTop: '5px', display: 'block' }}>{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="you@example.com"
              style={inputStyle(!!errors.email)}
              onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
              onBlur={e => (e.currentTarget.style.borderColor = errors.email ? 'rgba(220,38,38,0.6)' : BORDER)}
            />
            {errors.email && <span style={{ fontSize: '12px', color: '#fca5a5', marginTop: '5px', display: 'block' }}>{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password', { onChange: e => setPwValue(e.target.value) })}
                placeholder="Min 8 characters"
                style={{ ...inputStyle(!!errors.password), paddingRight: '56px' }}
                onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
                onBlur={e => (e.currentTarget.style.borderColor = errors.password ? 'rgba(220,38,38,0.6)' : BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: MUTED, fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
                  padding: '4px 6px', borderRadius: '4px',
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: '12px', color: '#fca5a5', marginTop: '5px', display: 'block' }}>{errors.password.message}</span>}
          </div>

          {/* Strength bar */}
          {pwValue.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '16px' }}>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${strength.pct}%`, background: strength.color, transition: 'width 0.3s ease, background 0.3s ease', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '11px', color: strength.color, marginTop: '5px', display: 'block', fontWeight: 500 }}>
                {strength.label}
              </span>
            </motion.div>
          )}

          {/* Confirm Password */}
          <div style={{ marginBottom: '16px', marginTop: pwValue.length === 0 ? '16px' : 0 }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              placeholder="Repeat password"
              style={inputStyle(!!errors.confirmPassword)}
              onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
              onBlur={e => (e.currentTarget.style.borderColor = errors.confirmPassword ? 'rgba(220,38,38,0.6)' : BORDER)}
            />
            {errors.confirmPassword && <span style={{ fontSize: '12px', color: '#fca5a5', marginTop: '5px', display: 'block' }}>{errors.confirmPassword.message}</span>}
          </div>

          {/* Timezone badge */}
          <div style={{
            marginBottom: '28px', fontSize: '12px', color: 'rgba(129,199,132,0.6)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span>🌐</span>
            <span>Your timezone: {tzLabel} (auto-detected)</span>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={busy}
            whileHover={busy ? {} : { scale: 1.01, y: -1 }}
            whileTap={busy ? {} : { scale: 0.99 }}
            style={{
              width: '100%', padding: '13px',
              background: busy ? 'rgba(76,175,80,0.45)' : GREEN,
              border: 'none', borderRadius: '8px',
              color: '#0a1f0b', fontSize: '15px', fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em',
              cursor: busy ? 'not-allowed' : 'pointer',
              boxShadow: busy ? 'none' : '0 4px 16px rgba(76,175,80,0.25)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            {busy ? 'Starting your journey…' : 'Start Growing 🌱'}
          </motion.button>
        </form>

        {/* Login link */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ height: '1px', background: `${BORDER}80`, marginBottom: '22px' }} />
          <p style={{ textAlign: 'center', fontSize: '14px', color: MUTED }}>
            Already growing?{' '}
            <Link
              to="/login"
              style={{
                color: GOLD, fontWeight: 600, textDecoration: 'none',
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Input placeholder colour */}
      <style>{`
        input::placeholder { color: rgba(232,245,233,0.2); }
      `}</style>
    </div>
  );
}
