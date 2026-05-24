import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Home, Eye, EyeOff, RefreshCw } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = '/dashboard'; // Always go to dashboard after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
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
  };

  return (
    <>
      <Helmet>
        <title>Log In - CasaCEO</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#1e3a5f' }}>
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Casa<span style={{ color: '#e8604c' }}>CEO</span></span>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border-slate-200 shadow-lg rounded-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your email to sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-3">
                    <p className="font-medium">{error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="self-start bg-white hover:bg-red-50 text-red-700 border-red-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Login
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link to="/password-reset" className="text-sm font-medium hover:opacity-70" style={{ color: '#1e3a5f' }}>
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-bold text-white"
                  style={{ background: '#1e3a5f' }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold hover:opacity-70" style={{ color: '#e8604c' }}>
                  Sign up free
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
