import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { useHome } from '@/contexts/HomeContext.jsx';
import { PlusCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedHome, loading } = useHome();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Conditionally hide sidebar and header (which contains the property filter) on the landing page
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !selectedHome ? (
            <div className="flex flex-col items-center justify-center flex-1 max-w-md mx-auto text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome to RezPanda</h2>
              <p className="text-slate-600">
                To get started, you need to add your first property. You can manage multiple properties from the dropdown menu above.
              </p>
              <p className="text-sm text-slate-500">
                Use the "Select a Home" dropdown in the top navigation bar to add a new property.
              </p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full flex-1">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;