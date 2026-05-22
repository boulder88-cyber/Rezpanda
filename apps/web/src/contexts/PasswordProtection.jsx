import React, { createContext, useContext, useState, useEffect } from 'react';

const PasswordProtectionContext = createContext();

export const usePasswordAuth = () => useContext(PasswordProtectionContext);

const GATE_PASSWORD = 'casaceo2024';
const STORAGE_KEY = 'casaceoAuth';

export const PasswordProtectionProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;

    const isDevEnvironment =
      true ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.replit.dev') ||
      hostname.endsWith('.replit.app') ||
      hostname.endsWith('.repl.co');

    if (isDevEnvironment) {
      setIsPasswordProtected(false);
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Production — always protected
    setIsPasswordProtected(true);
    
    try {
      const storedAuth = sessionStorage.getItem(STORAGE_KEY);
      setIsAuthenticated(storedAuth === 'true');
    } catch (e) {
      // sessionStorage blocked (private mode) — not authenticated
      setIsAuthenticated(false);
    }
    
    setIsChecking(false);
  }, []);

  const submitPassword = (password) => {
    if (password === GATE_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        // sessionStorage blocked — session only
      }
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Incorrect password. Please try again.' };
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setIsAuthenticated(false);
  };

  // Show nothing while checking to prevent flash
  if (isChecking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1e3a5f', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: '#c9a96e', fontFamily: 'sans-serif', fontSize: '18px' }}>
          Loading CasaCEO...
        </div>
      </div>
    );
  }

  return (
    <PasswordProtectionContext.Provider
      value={{ isPasswordProtected, isAuthenticated, submitPassword, logout }}
    >
      {children}
    </PasswordProtectionContext.Provider>
  );
};
