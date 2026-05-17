import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import HomeSwitcher from '@/components/HomeSwitcher.jsx';
import { Button } from '@/components/ui/button.jsx';
import { LogOut, User, Menu } from 'lucide-react';
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
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Properties', path: '/properties' },
    { name: 'Maintenance', path: '/maintenance-management' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-950 via-slate-950 to-black border-b border-blue-900/30 py-3 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 shadow-2xl transition-all duration-300 anti-alias-smooth">
      <div className="flex items-center gap-4 md:gap-6">
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-slate-300 hover:text-white hover:bg-white/10" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </Button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 ml-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                location.pathname === link.path && link.path !== '/' 
                  ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {!isAuthenticated && (
            <Link to="/signup" className="ml-4">
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 font-bold px-6 rounded-full"
              >
                Create Account
              </Button>
            </Link>
          )}
        </nav>
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-300">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-950 border-blue-900/50 text-slate-200 shadow-2xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-white">{currentUser?.name || 'User'}</p>
                    <p className="text-xs leading-none text-slate-400">
                      {currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="sm:hidden p-2">
                  <p className="text-xs font-medium text-slate-400 mb-2 px-2">Switch Home</p>
                  <HomeSwitcher />
                </div>
                <DropdownMenuSeparator className="sm:hidden bg-white/10" />
                <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer font-medium transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 font-semibold rounded-full px-6 transition-colors">Log in</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;