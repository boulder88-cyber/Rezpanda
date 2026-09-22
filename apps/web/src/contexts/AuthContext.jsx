import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing. PocketBase connected to URL:', pb.baseUrl);

    if (pb.authStore.isValid) {
      console.log('AuthContext: Found valid existing auth session for user:', pb.authStore.model.email);
      setCurrentUser(pb.authStore.model);
    } else {
      console.log('AuthContext: No valid existing auth session found.');
    }
    setInitialLoading(false);

    // PocketBase's authStore can fire onChange repeatedly with an unchanged
    // model (observed 70+ times on a single page load). Using the functional
    // update form lets us compare against the latest state (not a stale
    // closure) and bail out — returning the same object reference — when
    // nothing actually changed, so React skips the re-render instead of
    // thrashing every consumer of currentUser (this was the cause of the
    // flickering header).
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser((prev) => {
        if (prev?.id === model?.id) {
          return prev;
        }
        console.log('AuthContext: Auth store changed. New model:', model?.email || 'null');
        return model;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    console.log(`AuthContext: Attempting login for email: ${email}`);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      console.log('AuthContext: Login successful.');
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: Login error encountered:', error.message || error);
      throw error;
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    console.log(`AuthContext: Attempting signup for email: ${email}`);
    try {
      const record = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
      });
      console.log('AuthContext: User record created successfully:', record);

      console.log('AuthContext: Attempting auto-login with new credentials...');
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: Signup error encountered:', error.message || error);
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    console.log(`AuthContext: Requesting password reset for: ${email}`);
    try {
      const result = await pb.collection('users').requestPasswordReset(email);
      return result;
    } catch (error) {
      console.error('AuthContext: Password reset request error:', error.message || error);
      throw error;
    }
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    console.log('AuthContext: Confirming password reset with token');
    try {
      const result = await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
      return result;
    } catch (error) {
      console.error('AuthContext: Password reset confirmation error:', error.message || error);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user.');
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    isAuthenticated: !!currentUser,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
