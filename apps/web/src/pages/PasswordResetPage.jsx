import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Home, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();

  const requestWithRetry = async (targetEmail, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await requestPasswordReset(targetEmail);
        return true;
      } catch (err) {
        lastError = err;
        console.warn(`Attempt ${i + 1} failed. Retrying...`);
        // Exponential backoff: 1s, 2s, 4s
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    throw lastError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    
    try {
      await requestWithRetry(email);
      setSuccess(true);
      setEmail(''); // Clear input on success
      toast({
        title: "Success",
        description: "Password reset link sent to your email.",
      });
    } catch (err) {
      console.error('Password reset request failed:', err);
      
      // Provide more specific error messages based on common PocketBase errors
      let errorMessage = 'Failed to send email. Please try again later.';
      if (err.status === 404 || err.message.toLowerCase().includes('not found')) {
        errorMessage = 'No account found with this email address.';
      } else if (err.status === 400) {
        errorMessage = 'Invalid email format or request.';
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - CasaCEO</title>
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
              <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
              <CardDescription className="text-base">
                {success 
                  ? "Check your email for reset instructions" 
                  : "Enter your email address and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {success ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-center text-slate-600 text-sm leading-relaxed">
                    We've sent an email with a link to reset your password. 
                    Please check your spam folder if you don't see it within a few minutes.
                  </p>
                  <Button asChild className="w-full mt-2 h-11" variant="outline">
                    <Link to="/login">Return to Login</Link>
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
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 bg-slate-50/50 focus-visible:ring-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium transition-all active:scale-[0.98]" 
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Link...
                      </>
                    ) : (
                      'Send Reset Link'
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

export default PasswordResetPage;