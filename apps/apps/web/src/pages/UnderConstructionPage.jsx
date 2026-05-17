import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { usePasswordAuth } from '@/contexts/PasswordProtection.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Lock, AlertCircle, Loader2, HardHat, KeyRound, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

// ─── View: Site Access Password Gate ─────────────────────────────────
const AccessGateView = ({ onForgotPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { submitPassword } = usePasswordAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const result = submitPassword(password);
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <>
      <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-orange-500/20">
        <HardHat className="w-8 h-8 text-orange-500" />
      </div>
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">RezPanda</h1>
        <p className="text-base text-zinc-400 leading-relaxed">
          Our platform is currently under construction. Please enter the access password to view the preview environment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="relative group">
            <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
            <Input
              type="password"
              placeholder="Enter access password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
              disabled={isLoading}
              className={`pl-11 h-12 text-base bg-zinc-900/50 text-white placeholder:text-zinc-500 transition-all ${
                error ? 'border-red-500/50 focus-visible:ring-red-500' : 'border-white/10 focus-visible:ring-orange-500'
              }`}
              autoFocus
            />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium py-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !password}
          className="w-full h-12 text-base font-medium bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 disabled:opacity-70 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Access...</>
          ) : (
            'Enter Preview'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/10"></div>
        <span className="text-zinc-600 text-xs uppercase tracking-widest">Account</span>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>

      <button
        onClick={onForgotPassword}
        className="w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors py-2"
      >
        <KeyRound className="w-4 h-4" />
        Forgot your account password?
      </button>
    </>
  );
};

// ─── View: Forgot Password Form ────────────────────────────────────
const ForgotPasswordView = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      let msg = 'Failed to send reset email. Please try again.';
      if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
        msg = 'No account found with that email address.';
      } else if (err.status === 400) {
        msg = 'Invalid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We've sent a password reset link to your email address. Check your spam folder if you don't see it within a few minutes.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to access gate
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-2 border border-blue-500/20">
        <Mail className="w-8 h-8 text-blue-400" />
      </div>
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Reset Your Password</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Enter the email address associated with your RezPanda account and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-zinc-300 text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-12 bg-zinc-900/50 text-white placeholder:text-zinc-500 border-white/10 focus-visible:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending Link...</>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to access gate
        </button>
      </div>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const UnderConstructionPage = () => {
  const [view, setView] = useState('gate'); // 'gate' | 'forgot'

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <Helmet>
        <title>RezPanda — Coming Soon</title>
      </Helmet>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-8 pt-10 pb-10">
          {view === 'gate' ? (
            <AccessGateView onForgotPassword={() => setView('forgot')} />
          ) : (
            <ForgotPasswordView onBack={() => setView('gate')} />
          )}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          © {new Date().getFullYear()} RezPanda. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default UnderConstructionPage;
