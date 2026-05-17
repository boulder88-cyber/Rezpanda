import React, { createContext, useContext, useState, useEffect } from 'react';

const PasswordProtectionContext = createContext();

export const usePasswordAuth = () => useContext(PasswordProtectionContext);

export const PasswordProtectionProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;

    // Published production domains only
    const isPublishedSite =
      hostname === 'casaceo.com' ||
      hostname === 'www.casaceo.com';

    // Preview / dev environments — Replit, localhost, etc.
    const isPreview =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.replit.dev') ||
      hostname.endsWith('.replit.app') ||
      hostname.endsWith('.repl.co') ||
      hostname.endsWith('.app-preview.com') ||
      hostname.endsWith('.app-preview.io');

    if (isPublishedSite) {
      setIsPasswordProtected(true);
      const storedAuth = localStorage.getItem('casaceoAuth');
      setIsAuthenticated(storedAuth === 'true');
    } else {
      // All preview environments — no password gate
      setIsPasswordProtected(false);
      setIsAuthenticated(true);
    }

    setIsChecking(false);
  }, []);

  const submitPassword = (password) => {
    if (password === 'casaceo2024') {
      localStorage.setItem('casaceoAuth', 'true');
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Incorrect password. Please try again.' };
  };

  const logout = () => {
    localStorage.removeItem('casaceoAuth');
    setIsAuthenticated(false);
  };

  if (isChecking) return null;

  return (
    <PasswordProtectionContext.Provider
      value={{ isPasswordProtected, isAuthenticated, submitPassword, logout }}
    >
      {children}
    </PasswordProtectionContext.Provider>
  );
};
