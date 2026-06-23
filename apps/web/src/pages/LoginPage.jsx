import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Home, Eye, EyeOff, RefreshCw } from 'lucide-react';

/*
  CasaCEO — Log In (rebranded to the locked design system)
  --------------------------------------------------------------------------
  Calm, trustworthy, "a place that's mine." Inline tokens (matching the
  marketing pages) so the palette can't drift to slate/blue-600 utilities.

    Navy   #1e3a5f  primary — logo tile, button, links, headings
    Gold   #c9a96e  accent — the "CEO" in the wordmark, sparingly
    Paper  #faf8f4  warm off-white page background
    Ink    #1f2733 / #5b6472 / #95a0ae  text scale
    Line   #e9e4db  warm border
    Red    #dc2626  error

  Auth logic is unchanged from the prior version — only the presentation
  was rebranded.
*/

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const PAPER = '#faf8f4';
const LINE = '#e9e4db';
const INK = '#1f2733';
const INK2 = '#5b6472';
const INK3 = '#95a0ae';
const RED = '#dc2626';

const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const Wordmark = ({ size = 26 }) => (
  <span style={{ fontFamily: sans, fontSize: `${size}px`, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>
    Casa<span style={{ color: GOLD }}>CEO</span>
  </span>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  const from = '/dashboard'; // Always go to dashboard after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log(`LoginPage: Submitting login form for email: ${email}`);

    try {
      const response = await login(email, password);
      console.log('LoginPage: Login successful, redirecting to:', from, 'Response:', response);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('LoginPage: Login failed. Full error object:', err);

      // Extract detailed error message
      let detailedError = 'Backend connection failed or unknown error occurred.';
      if (err.response?.message) {
        detailedError = err.response.message;
      } else if (err.message) {
        detailedError = err.message;
      }

      if (err.status === 400) {
        detailedError = 'Invalid email or password. Please check your credentials.';
      } else if (err.status === 404) {
        detailedError = 'User not found.';
      }

      setError(`Login failed: ${detailedError} (Code: ${err.status || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setPassword('');
    console.log('LoginPage: User clicked Retry. Cleared error and password fields.');
  };

  // ── shared field styles ──────────────────────────────────────────
  const inputBase = {
    width: '100%',
    fontFamily: sans,
    fontSize: '15px',
    color: INK,
    background: '#fff',
    border: `1px solid ${LINE}`,
    borderRadius: '8px',
    padding: '11px 13px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  };
  const inputFocused = {
    borderColor: NAVY,
    boxShadow: `0 0 0 3px rgba(30,58,95,0.12)`,
  };
  const labelStyle = {
    display: 'block',
    fontFamily: sans,
    fontSize: '13px',
    fontWeight: 600,
    color: INK2,
    marginBottom: '7px',
  };

  return (
    <>
      <Helmet>
        <title>Log In - CasaCEO</title>
      </Helmet>
      <div style={{ minHeight: '100vh', background: PAPER, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 20px', fontFamily: sans }}>

        {/* Logo / wordmark */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none', marginBottom: '28px' }}>
          <div style={{ width: '42px', height: '42px', background: NAVY, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home style={{ width: '22px', height: '22px', color: '#fff' }} />
          </div>
          <Wordmark size={26} />
        </Link>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: '404px', background: '#fff', border: `1px solid ${LINE}`, borderRadius: '16px', boxShadow: '0 18px 44px -28px rgba(30,58,95,0.30)', padding: '34px 32px 30px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <h1 style={{ fontFamily: sans, fontSize: '23px', fontWeight: 700, color: INK, letterSpacing: '-0.01em', marginBottom: '7px' }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: sans, fontSize: '14.5px', color: INK2, lineHeight: 1.5 }}>
              Sign in to pick up where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: `1px solid #fecaca`, borderRadius: '10px', padding: '14px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <p style={{ fontFamily: sans, fontSize: '13.5px', fontWeight: 500, color: '#b91c1c', lineHeight: 1.45, margin: 0 }}>{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: sans, fontSize: '13px', fontWeight: 600, color: '#b91c1c', background: '#fff', border: `1px solid #fecaca`, borderRadius: '8px', padding: '7px 12px', cursor: 'pointer' }}
                >
                  <RefreshCw style={{ width: '14px', height: '14px' }} />
                  Retry login
                </button>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                required
                style={{ ...inputBase, ...(emailFocus ? inputFocused : {}) }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPwFocus(true)}
                  onBlur={() => setPwFocus(false)}
                  required
                  style={{ ...inputBase, paddingRight: '42px', ...(pwFocus ? inputFocused : {}) }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: INK3, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '9px' }}>
                <Link to="/password-reset" style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: NAVY, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', fontFamily: sans, fontSize: '15px', fontWeight: 700, color: '#fff', background: NAVY, border: 'none', borderRadius: '12px', padding: '13px', marginTop: '8px', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${LINE}`, marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: sans, fontSize: '14px', color: INK2, margin: 0 }}>
              Don&rsquo;t have an account?{' '}
              <Link to="/signup" style={{ fontFamily: sans, fontWeight: 600, color: NAVY, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
