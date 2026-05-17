import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, Wrench, FileText, CreditCard, 
  TreePine, Home, ShieldCheck, Eye, 
  Users, Search, FolderOpen, X
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const offerings = [
  { name: 'Property Management', path: '/property-management', icon: Building2 },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Tax Reporting', path: '/expenses', icon: FileText },
  { name: 'Bill Pay', path: '/bill-pay', icon: CreditCard },
  { name: 'Landscape', path: '/plants', icon: TreePine },
  { name: 'Mortgage', path: '/documents', icon: Home },
  { name: 'Insurance', path: '/documents', icon: ShieldCheck },
  { name: 'Hawk Monitoring', path: '/image-gallery', icon: Eye },
  { name: 'Vendor Management', path: '/bills', icon: Users },
  { name: 'Next Home Finder', path: '/properties', icon: Search },
  { name: 'Documents', path: '/documents', icon: FolderOpen },
];

const DashboardSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 outline-none focus-ring rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">CasaCEO</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 scrollbar-hide">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Platform Offerings
          </div>
          
          {offerings.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group outline-none focus-ring
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Need Help?</p>
            <p className="text-xs text-slate-500 mb-3">Contact our support team for assistance.</p>
            <Button variant="outline" className="w-full text-xs h-8 rounded-lg">Support Center</Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;