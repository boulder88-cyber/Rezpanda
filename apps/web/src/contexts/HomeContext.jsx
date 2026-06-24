import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
const HomeContext = createContext();
export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within HomeProvider');
  }
  return context;
};
export const HomeProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [homes, setHomes] = useState([]);
  const [selectedHome, setSelectedHome] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── All-Properties mode ──
  // A SEPARATE flag, not a fake home. When true, pages that understand it can
  // show every property's data. `selectedHome` STILL points at a real home
  // (the last real one chosen), so any page that reads selectedHome.id keeps
  // working untouched. Pages opt in by checking `allProperties`.
  const [allProperties, setAllProperties] = useState(false);

  // ── Other & unassigned scope ──
  // A second SEPARATE flag (same idea as allProperties): a portfolio scope for
  // the bills not tied to any property — "Other bills" + "Needs placement".
  // It is NOT a home and creates NO row in `homes`; `selectedHome` still points
  // at a real home underneath, so pages that don't understand this flag keep
  // working. Only surfaces (Bill Pay's "other" view, the switcher label/item)
  // opt in. Mutually exclusive with allProperties and with picking a home.
  const [otherScope, setOtherScope] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadHomes();
    } else {
      setHomes([]);
      setSelectedHome(null);
      setAllProperties(false);
      setOtherScope(false);
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);
  const loadHomes = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('homes').getFullList({
        sort: '-created',
        $autoCancel: false,
      });
      setHomes(records);

      // Restore the all-properties preference if it was set.
      const savedAll = localStorage.getItem('allProperties') === 'true';
      setAllProperties(savedAll && records.length > 1);

      // Restore the Other-scope preference. Available even with a single home
      // (unplaced bills can exist regardless of how many properties there are).
      // Mutually exclusive with all-properties — all-properties wins if both
      // somehow persisted.
      const savedOther = localStorage.getItem('otherScope') === 'true';
      setOtherScope(savedOther && !(savedAll && records.length > 1));

      // Try to restore previously selected home from localStorage, or pick the first one
      const savedHomeId = localStorage.getItem('selectedHomeId');
      if (savedHomeId && records.find(h => h.id === savedHomeId)) {
        setSelectedHome(records.find(h => h.id === savedHomeId));
      } else if (records.length > 0) {
        setSelectedHome(records[0]);
        localStorage.setItem('selectedHomeId', records[0].id);
      } else {
        setSelectedHome(null);
        localStorage.removeItem('selectedHomeId');
      }
    } catch (error) {
      console.error('Failed to load homes:', error);
    } finally {
      setLoading(false);
    }
  };
  // Switching to a specific home always turns OFF all-properties mode.
  const switchHome = (home) => {
    setSelectedHome(home);
    setAllProperties(false);
    setOtherScope(false);
    localStorage.setItem('allProperties', 'false');
    localStorage.setItem('otherScope', 'false');
    if (home) {
      localStorage.setItem('selectedHomeId', home.id);
    } else {
      localStorage.removeItem('selectedHomeId');
    }
  };
  // Turn on all-properties mode. selectedHome is left as-is (a real home) so
  // pages that don't understand the flag keep working on that home.
  const viewAllProperties = () => {
    setAllProperties(true);
    setOtherScope(false);
    localStorage.setItem('allProperties', 'true');
    localStorage.setItem('otherScope', 'false');
  };
  // Turn on the Other & unassigned scope. Like viewAllProperties, this leaves
  // selectedHome pointing at a real home underneath; only opted-in surfaces
  // react to the flag. Mutually exclusive with all-properties.
  const viewOther = () => {
    setOtherScope(true);
    setAllProperties(false);
    localStorage.setItem('otherScope', 'true');
    localStorage.setItem('allProperties', 'false');
  };
  const addHome = async (homeData) => {
    try {
      const newHome = await pb.collection('homes').create({
        ...homeData,
        ownerId: currentUser.id,
      }, { $autoCancel: false });

      setHomes(prev => [newHome, ...prev]);
      switchHome(newHome);
      return newHome;
    } catch (error) {
      console.error('Failed to add home:', error);
      throw error;
    }
  };
  const refreshHomes = async () => {
    await loadHomes();
  };
  const value = {
    homes,
    selectedHome,
    allProperties,
    otherScope,
    switchHome,
    viewAllProperties,
    viewOther,
    addHome,
    loading,
    refreshHomes
  };
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};
