import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Home, Eye, EyeOff, Check, X } from 'lucide-react';
import { usePasswordValidation } from '@/hooks/usePasswordValidation.js';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isValid: isPasswordValid, requirements, validatePasswordMatch } = usePasswordValidation(formData.password);
  
  const passwordsMatch = validatePasswordMatch(formData.password, formData.passwordConfirm);
  const showMatchError = formData.passwordConfirm.length > 0 && !passwordsMatch;
  const canSubmit = isPasswordValid && passwordsMatch && formData.name && formData.email;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log(`SignupPage: Submitting signup form for email: ${formData.email}`);

    if (!passwordsMatch) {
      console.warn('SignupPage: Passwords do not match validation failed.');
      return setError('Passwords do not match. Please ensure both password fields are identical.');
    }

    if (!isPasswordValid) {
      return setError('Please ensure all password requirements are met.');
    }

    setLoading(true);
    try {
      const response = await signup(formData.email, formData.password, formData.passwordConfirm, formData.name);
      console.log('SignupPage: Signup successful! Response:', response);
      
      // Redirect to dashboard on success
      console.log(`SignupPage: Redirecting to dashboard at ${new Date().toISOString()}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('SignupPage: Signup failed. Full error object:', err);
      
      let detailedError = 'Failed to create an account.';
      
      if (err.response?.data) {
        console.error('SignupPage: Validation errors from backend:', err.response.data);
        // Try to extract specific field errors if available
        const fieldErrors = Object.entries(err.response.data)
          .map(([field, errorObj]) => `${field}: ${errorObj.message}`)
          .join(', ');
        if (fieldErrors) {
          detailedError = `Validation failed - ${fieldErrors}`;
        }
      } else if (err.response?.message) {
        detailedError = err.response.message;
      } else if (err.message) {
        detailedError = err.message;
      }

      setError(`Signup Error: ${detailedError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - CasaCEO</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">CasaCEO</span>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Start managing your home like a pro</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Requirements Feedback */}
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1.5 p-3 bg-slate-50 rounded-md border border-slate-100">
                      <p className="text-xs font-medium text-slate-700 mb-2">Password requirements:</p>
                      {requirements.map((req, index) => (
                        <div key={index} className="flex items-center text-xs">
                          {req.met ? (
                            <Check className="w-3.5 h-3.5 text-green-600 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-500 mr-2 flex-shrink-0" />
                          )}
                          <span className={req.met ? "text-green-700" : "text-slate-600"}>
                            {req.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="passwordConfirm"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      required
                      className={`pr-10 ${showMatchError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {showMatchError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <X className="w-3 h-3 mr-1" /> Passwords do not match
                    </p>
                  )}
                  {formData.passwordConfirm.length > 0 && passwordsMatch && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <Check className="w-3 h-3 mr-1" /> Passwords match
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={loading || !canSubmit}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignupPage;