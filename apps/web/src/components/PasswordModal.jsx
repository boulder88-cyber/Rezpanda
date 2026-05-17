import React, { useState } from 'react';
import { usePasswordAuth } from '@/contexts/PasswordProtection.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { HardHat, Lock, AlertCircle, Loader2 } from 'lucide-react';

const PasswordModal = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { handlePasswordSubmit } = usePasswordAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsLoading(true);
    setError('');

    // Simulate slight network delay for better UX
    setTimeout(() => {
      const isValid = handlePasswordSubmit(password);
      if (!isValid) {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
      }
      // If valid, context state updates and modal will unmount automatically
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center shadow-inner mb-5">
            <HardHat className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Under Construction
          </h2>
          <p className="text-sm mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
            This application is currently in development. Please enter the access password to continue.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <Input
                type="password"
                placeholder="Enter access password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading}
                className={`pl-11 h-12 text-base bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-orange-500 text-slate-900 dark:text-white transition-all ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                autoFocus
              />
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium py-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !password}
            className="w-full h-12 text-base font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Access Site'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;