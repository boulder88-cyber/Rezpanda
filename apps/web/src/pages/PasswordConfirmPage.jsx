import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Home, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const PasswordConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { confirmPasswordReset } = useAuth();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const validateForm = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      await confirmPasswordReset(token, password, confirmPassword);
      setSuccess(true);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully reset.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Password confirmation failed:', err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
      toast({
        title: "Reset Failed",
        description: "Could not update your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Set New Password - CasaCEO</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6 transition-transform hover:scale-105">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-slate-900">CasaCEO</span>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-2 text-center pt-8">
              <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
              <CardDescription className="text-base">
                {success 
                  ? "Your password has been updated" 
                  : "Please enter your new password below."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {success ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-center text-slate-600 text-sm leading-relaxed">
                    Your password has been successfully reset. You will be redirected to the login page momentarily.
                  </p>
                  <Button asChild className="w-full mt-2 h-11">
                    <Link to="/login">Go to Login Now</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 font-medium">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading || !token}
                        className="h-11 bg-slate-50/50 focus-visible:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading || !token}
                        className="h-11 bg-slate-50/50 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium transition-all active:scale-[0.98]" 
                    disabled={loading || !token || !password || !confirmPassword}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            {!success && (
              <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/50 py-4">
                <Link to="/login" className="flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default PasswordConfirmPage;