import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { Button } from '@/components/ui/button.jsx';
import {
  Building2, Wrench, FileText, CreditCard, TreePine, ShieldCheck,
  Home, FolderOpen, Users, LineChart,
  ChevronDown, Plus, MapPin, Check, Bell, AlertCircle,
  Clock, DollarSign, TrendingUp, Key, Loader2, X,
  ArrowRight, CheckCircle2, Sparkles, BookOpen
} from 'lucide-react';

// ─── Property Switcher ────────────────────────────────────────────────
const PropertySwitcher = () => {
  const { homes, selectedHome, switchHome, addHome, loading } = useHome();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeAddress, setNewHomeAddress] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddHome = async () => {
    if (!newHomeName.trim()) return;
    setAdding(true);
    try {
      await addHome({ name: newHomeName, address: newHomeAddress });
      setNewHomeName('');
      setNewHomeAddress('');
      setShowAddForm(false);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="w-9 h-9 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#eef2f8'}}>
          <Home className="w-5 h-5" style={{color:'#1e3a5f'}} />
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Active Property</p>
          <p className="font-bold text-slate-900 text-base leading-tight">
            {loading ? 'Loading...' : selectedHome?.name || 'Select Property'}
          </p>
          {selectedHome?.address && (
            <p className="text-xs text-slate-400 truncate max-w-40">{selectedHome.address}</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium px-2 py-1">Your Properties</p>
            {homes.length === 0 && !loading && (
              <p className="text-sm text-slate-400 text-center py-4">No properties yet</p>
            )}
            {homes.map(home => (
              <button
                key={home.id}
                onClick={() => { switchHome(home); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors ${selectedHome?.id === home.id ? 'bg-slate-50' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'#eef2f8'}}>
                  <MapPin className="w-4 h-4" style={{color:'#1e3a5f'}} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{home.name}</p>
                  {home.address && <p className="text-xs text-slate-400 truncate">{home.address}</p>}
                </div>
                {selectedHome?.id === home.id && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
              </button>
            ))}

            <div className="border-t border-slate-100 mt-2 pt-2">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Property
                </button>
              ) : (
                <div className="p-2 space-y-2">
                  <input
                    autoFocus
                    placeholder="Property name (e.g. Lake House)"
                    value={newHomeName}
                    onChange={e => setNewHomeName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <input
                    placeholder="Address (optional)"
                    value={newHomeAddress}
                    onChange={e => setNewHomeAddress(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 h-9 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddHome}
                      disabled={!newHomeName.trim() || adding}
                      className="flex-1 h-9 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{background:'#1e3a5f'}}
                    >
                      {adding ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

// ─── Module Tiles ─────────────────────────────────────────────────────
const MODULES = [
  {
    title: 'Maintenance',
    description: 'Schedule, log, and automate every service',
    icon: Wrench,
    link: '/maintenance-management',
    color: '#f97316',
    bg: '#fff7ed',
    badge: null,
  },
  {
    title: 'Bill Pay',
    description: 'Centralize every payment and reminder',
    icon: CreditCard,
    link: '/bill-pay',
    color: '#2563eb',
    bg: '#eff6ff',
    badge: null,
  },
  {
    title: 'Documents',
    description: 'Your secure, searchable home archive',
    icon: FolderOpen,
    link: '/documents',
    color: '#7c3aed',
    bg: '#f5f3ff',
    badge: null,
  },
  {
    title: 'Expenses',
    description: 'Know exactly where your money goes',
    icon: DollarSign,
    link: '/expenses',
    color: '#059669',
    bg: '#ecfdf5',
    badge: null,
  },
  {
    title: 'Utilities',
    description: 'All your accounts, one dashboard',
    icon: Building2,
    link: '/utilities',
    color: '#0891b2',
    bg: '#ecfeff',
    badge: null,
  },
  {
    title: 'Home Value',
    description: 'See what your homes are worth today',
    icon: TrendingUp,
    link: '/home-valuation',
    color: '#1e3a5f',
    bg: '#eef2f8',
    badge: 'New',
  },
  {
    title: 'Rental Properties',
    description: 'Manage tenants, leases, and requests',
    icon: Key,
    link: '/rental-properties',
    color: '#db2777',
    bg: '#fdf2f8',
    badge: null,
  },
  {
    title: 'Landscaping',
    description: 'Keep your properties beautiful effortlessly',
    icon: TreePine,
    link: '/plants',
    color: '#16a34a',
    bg: '#f0fdf4',
    badge: null,
  },
  {
    title: 'Insurance',
    description: 'Never let coverage lapse again',
    icon: ShieldCheck,
    link: '/documents',
    color: '#dc2626',
    bg: '#fef2f2',
    badge: null,
  },
  {
    title: 'Tax Reports',
    description: 'Export ready-to-file reports in one click',
    icon: FileText,
    link: '/expenses',
    color: '#d97706',
    bg: '#fffbeb',
    badge: 'Soon',
  },
  {
    title: 'Vendors',
    description: 'Find vetted pros near your homes',
    icon: Users,
    link: '/maintenance-management',
    color: '#0369a1',
    bg: '#f0f9ff',
    badge: 'Soon',
  },
  {
    title: 'Learning Hub',
    description: 'Expert guides for maintenance, finance, insurance & more',
    icon: BookOpen,
    link: '/learn',
    color: '#7c3aed',
    bg: '#f5f3ff',
    badge: '12 guides',
  },
  {
    title: 'Property Tax',
    description: 'Track bills, find exemptions, and appeal over-assessments',
    icon: FileText,
    link: '/property-tax',
    color: '#dc2626',
    bg: '#fef2f2',
    badge: null,
  },
  {
    title: 'Home Timeline',
    description: 'Every event, update, and insight — remembered automatically',
    icon: Clock,
    link: '/timeline',
    color: '#1e3a5f',
    bg: '#eef2f8',
    badge: null,
  },
  {
    title: 'Warranty Tracker',
    description: 'Track coverage across every home',
    icon: ShieldCheck,
    link: '/warranty-tracker',
    color: '#059669',
    bg: '#ecfdf5',
    badge: null,
  },
  {
    title: 'Reports',
    description: 'Data-driven decisions for every home',
    icon: LineChart,
    link: '/expenses',
    color: '#7c3aed',
    bg: '#faf5ff',
    badge: 'Soon',
  },
];

// ─── Module Tile Component ────────────────────────────────────────────
const ModuleTile = ({ module }) => {
  const Icon = module.icon;
  return (
    <Link
      to={module.link}
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden"
    >
      {module.badge && (
        <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${
          module.badge === 'New' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {module.badge}
        </span>
      )}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ background: module.bg }}
      >
        <Icon className="w-6 h-6" style={{ color: module.color }} />
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-1">{module.title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed">{module.description}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: module.color }}>
        Open <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
};

// ─── Quick Alerts ─────────────────────────────────────────────────────
const QuickAlerts = ({ selectedHome }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!selectedHome) return;
    const mockAlerts = [
      { type: 'bill', message: 'Electric bill due in 3 days', link: '/bill-pay', urgent: true },
      { type: 'maintenance', message: 'HVAC service overdue', link: '/maintenance-management', urgent: true },
      { type: 'document', message: 'Home insurance renews in 30 days', link: '/documents', urgent: false },
    ];
    setAlerts(mockAlerts);
  }, [selectedHome]);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-slate-400" />
        <h2 className="font-bold text-slate-900 text-base">Alerts</h2>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {alerts.filter(a => a.urgent).length}
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <Link key={i} to={alert.link}>
            <div className={`flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity ${
              alert.urgent ? 'bg-red-50' : 'bg-amber-50'
            }`}>
              <AlertCircle className={`w-4 h-4 flex-shrink-0 ${alert.urgent ? 'text-red-500' : 'text-amber-500'}`} />
              <p className="text-sm font-medium text-slate-700">{alert.message}</p>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Welcome Banner ───────────────────────────────────────────────────
const WelcomeBanner = ({ user, selectedHome }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{background:'#1e3a5f'}}>
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{background:'#c9a96e', transform:'translate(30%, -30%)'}}></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{background:'#c9a96e', transform:'translate(-30%, 30%)'}}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{greeting}, {firstName} 👋</p>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              {selectedHome ? selectedHome.name : 'Welcome to CasaOS'}
            </h1>
            <p className="text-blue-200 text-sm">
              {selectedHome?.address || 'Select a property to begin managing your home like an asset'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[
      {
        label: 'Bills Due', value: '3', sublabel: 'this week',
        trend: '↑ 1 more than last week', trendUp: false,
        icon: <CreditCard className="w-4 h-4" />, color: '#d97706', bg: '#fffbeb', border: '#fde68a',
        link: '/bill-pay', tooltip: 'View bills due this week',
        badge: null,
      },
      {
        label: 'Maintenance', value: '2', sublabel: 'overdue',
        trend: '↑ action needed', trendUp: false,
        icon: <Wrench className="w-4 h-4" />, color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
        link: '/maintenance-management', tooltip: 'View overdue maintenance tasks',
        badge: null,
      },
      {
        label: 'Documents', value: '14', sublabel: 'stored',
        trend: '↑ 2 added this month', trendUp: true,
        icon: <FolderOpen className="w-4 h-4" />, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
        link: '/documents', tooltip: 'Open document vault',
        badge: null,
      },
      {
        label: 'This Month', value: '$2,840', sublabel: 'expenses',
        trend: '↓ 12% vs last month', trendUp: true,
        icon: <DollarSign className="w-4 h-4" />, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
        link: '/expenses', tooltip: 'View expense breakdown',
        badge: null,
      },
    ].map((stat, i) => (
      <Link
        key={i}
        to={stat.link}
        title={stat.tooltip}
        className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer block"
        style={{ borderColor: stat.border }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: stat.bg }}>
            <span style={{ color: stat.color }}>{stat.icon}</span>
          </div>
          <span className="text-xs font-medium" style={{ color: stat.trendUp ? '#059669' : '#dc2626' }}>{stat.trend}</span>
        </div>
        <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-slate-400">{stat.label} · {stat.sublabel}</p>
          <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5" style={{ color: stat.color }}>
            View <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    ))}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────
const DashboardPage = () => {
  const { selectedHome, homes, loading } = useHome();
  const { currentUser } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard — CasaCEO</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50">

        {/* ── Top Nav Bar ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'#1e3a5f'}}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg hidden sm:block" style={{color:'#1e3a5f'}}>
                Casa<span style={{color:'#c9a96e'}}>CEO</span>
              </span>
            </div>
          </div>

          {/* Property Switcher — CENTER of header */}
          <PropertySwitcher />

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{background:'#1e3a5f'}}>
              {currentUser?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Welcome Banner */}
          <WelcomeBanner user={currentUser} selectedHome={selectedHome} />

          {/* Quick Stats */}
          <QuickStats />

          {/* Two column layout: modules + alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Module Tiles — takes 2/3 */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-slate-900">Your Modules</h2>
                <p className="text-xs text-slate-400">{selectedHome?.name || 'Add a property to get started'}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MODULES.map((module, i) => (
                  <ModuleTile key={i} module={module} />
                ))}
              </div>
            </div>

            {/* Right column: alerts + quick actions */}
            <div className="space-y-6">
              {/* Alerts */}
              <QuickAlerts selectedHome={selectedHome} />

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  {[
                    { label: 'Log a bill payment', link: '/bill-pay', icon: <CreditCard className="w-4 h-4" /> },
                    { label: 'Add maintenance task', link: '/maintenance-management', icon: <Wrench className="w-4 h-4" /> },
                    { label: 'Upload a document', link: '/documents', icon: <FolderOpen className="w-4 h-4" /> },
                    { label: 'Check home value', link: '/home-valuation', icon: <TrendingUp className="w-4 h-4" /> },
                  ].map((action, i) => (
                    <Link key={i} to={action.link}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 flex-shrink-0">
                          {action.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* No property prompt */}
              {!loading && homes.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                  <Home className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <p className="font-bold text-amber-800 text-sm mb-1">No properties yet</p>
                  <p className="text-amber-600 text-xs mb-3">Add your first property to unlock your full dashboard.</p>
                <button
                  onClick={() => {}}
                  className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: '#1e3a5f' }}
                >
                  Add Your First Property →
                </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
