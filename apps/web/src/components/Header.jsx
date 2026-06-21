import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import HomeSwitcher from '@/components/HomeSwitcher.jsx';
import { Button } from '@/components/ui/button.jsx';
import { LogOut, User, Menu, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <header
      className="border-b py-3 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50"
      style={{ background: '#1e3a5f', borderColor: 'rgba(255,255,255,0.10)' }}
    >
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile: open the sidebar */}
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-white/80 hover:text-white hover:bg-white/10" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </Button>

        {/* Logo — links home to the dashboard */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white hidden sm:block">
            Casa<span style={{ color: '#c9a96e' }}>CEO</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:block">
              <div className="bg-white/5 rounded-full border border-white/10 p-1 backdrop-blur-sm">
                <HomeSwitcher />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-transparent">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full transition-colors" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <User className="h-6 w-6 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white text-slate-700 shadow-lg" style={{ borderColor: '#e9e4db' }} align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none" style={{ color: '#1f2733' }}>{currentUser?.name || 'User'}</p>
                    <p className="text-xs leading-none" style={{ color: '#95a0ae' }}>
                      {currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator style={{ background: '#e9e4db' }} />
                <div className="sm:hidden p-2">
                  <p className="text-xs font-medium mb-2 px-2" style={{ color: '#5b6472' }}>Switch Home</p>
                  <HomeSwitcher />
                </div>
                <DropdownMenuSeparator className="sm:hidden" style={{ background: '#e9e4db' }} />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 font-semibold rounded-full px-6 transition-colors">Log in</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
