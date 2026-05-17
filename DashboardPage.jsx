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

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadHomes();
    } else {
      setHomes([]);
      setSelectedHome(null);
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

  const switchHome = (home) => {
    setSelectedHome(home);
    if (home) {
      localStorage.setItem('selectedHomeId', home.id);
    } else {
      localStorage.removeItem('selectedHomeId');
    }
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
    switchHome,
    addHome,
    loading,
    refreshHomes
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};