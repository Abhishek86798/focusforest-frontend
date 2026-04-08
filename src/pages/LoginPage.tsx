import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

// ── Validation ────────────────────────────────────────────────────────────────
const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

// ── Design tokens (spec: dark forest theme) ───────────────────────────────────
const BG      = '#0d1f0f';
const CARD    = '#1a3a1c';
const GREEN   = '#4caf50';
const GOLD    = '#f9c74f';
const TEXT    = '#e8f5e9';
const MUTED   = '#81c784';
const BORDER  = '#2d6a30';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const user = useAuthStore(state => state.user);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await login(data.email.trim(), data.password.trim());
      // Small delay to ensure cookie is set before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/', { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setServerError('Invalid email or password');
      } else if (err.response?.status === 400) {
        setServerError('Please check your inputs');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  const busy = isSubmitting;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        // subtle radial noise texture
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 20% 60%, rgba(45,106,48,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(76,175,80,0.07) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Framer Motion card: y 20→0, opacity 0→1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 40px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(45,106,48,0.3)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Logo + brand ── */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* Tree icon */}
          <div
            style={{
              display: 'inline-flex',
              width: '60px', height: '60px',
              background: 'rgba(76,175,80,0.15)',
              border: `1px solid ${BORDER}`,
              borderRadius: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '18px',
              boxShadow: '0 0 24px rgba(76,175,80,0.15)',
            }}
          >
            🌲
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '30px',
              color: GREEN,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            FocusForest
          </h1>
          <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.5 }}>
            Every minute counts. Grow your forest.
          </p>
        </div>

        {/* ── Error banner ── */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: '8px',
              padding: '11px 16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#fca5a5',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {serverError}
          </motion.div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '7px',
            }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${errors.email ? 'rgba(220,38,38,0.6)' : BORDER}`,
                borderRadius: '8px',
                color: TEXT,
                fontSize: '15px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
              onBlur={e => (e.currentTarget.style.borderColor = errors.email ? 'rgba(220,38,38,0.6)' : BORDER)}
            />
            {errors.email && (
              <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '5px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              marginBottom: '7px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                style={{
                  width: '100%',
                  padding: '11px 52px 11px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${errors.password ? 'rgba(220,38,38,0.6)' : BORDER}`,
                  borderRadius: '8px',
                  color: TEXT,
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = GREEN)}
                onBlur={e => (e.currentTarget.style.borderColor = errors.password ? 'rgba(220,38,38,0.6)' : BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: MUTED, fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
                  padding: '4px 6px', borderRadius: '4px',
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '5px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={busy}
            whileHover={busy ? {} : { scale: 1.01, y: -1 }}
            whileTap={busy ? {} : { scale: 0.99 }}
            style={{
              width: '100%',
              padding: '13px',
              background: busy ? 'rgba(76,175,80,0.45)' : GREEN,
              border: 'none',
              borderRadius: '8px',
              color: '#0a1f0b',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.02em',
              cursor: busy ? 'not-allowed' : 'pointer',
              boxShadow: busy ? 'none' : '0 4px 16px rgba(76,175,80,0.25)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            {busy ? 'Entering the forest…' : 'Enter the forest →'}
          </motion.button>
        </form>

        {/* ── Divider + signup link ── */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ height: '1px', background: `${BORDER}80`, marginBottom: '22px' }} />
          <p style={{ textAlign: 'center', fontSize: '14px', color: MUTED }}>
            New here?{' '}
            <Link
              to="/signup"
              style={{
                color: GOLD,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Plant your first seed →
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
