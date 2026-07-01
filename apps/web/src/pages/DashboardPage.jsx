import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import PropertiesAtAGlance from '@/components/PropertiesAtAGlance.jsx';
import GettingStartedCard from '@/components/GettingStartedCard.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Wrench, CreditCard, FolderOpen,
  Home, ChevronDown, Plus, MapPin, Check, Bell, AlertCircle,
  TrendingUp, ArrowRight, ArrowLeft, Sparkles, LogOut, User, Settings, CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';

// ─── User menu ────────────────────────────────────────────────────────
// Replaces the static initial-only avatar with a real account menu: name,
// email, manage homes, and log out. Reuses the same logout from AuthContext
// that the global Header uses, so behavior is consistent everywhere.
const UserMenu = () => {
  const { currentUser, logout } = useAuth();
  const initial = currentUser?.name?.[0]?.toUpperCase() || 'U';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ background: '#1e3a5f' }}
          title="Account"
          aria-label="Account menu"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white text-slate-700 shadow-lg" style={{ borderColor: '#e9e4db' }} align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none" style={{ color: '#1f2733' }}>{currentUser?.name || 'User'}</p>
            {currentUser?.email && (
              <p className="text-xs leading-none" style={{ color: '#95a0ae' }}>{currentUser.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ background: '#e9e4db' }} />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/manage-homes">
            <Settings className="mr-2 h-4 w-4" />
            <span>Manage homes</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator style={{ background: '#e9e4db' }} />
        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium transition-colors">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#eef2f8'}}>
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

// ─── The Three Tiles ──────────────────────────────────────────────────
// Bills    → Bill Pay, Property Tax, Insurance (premium), Mortgage
// Maintenance → Maintenance, Warranty servicing, Vendors
// Records  → Documents, Insurance policy doc, Warranty docs
const TILES = [
  {
    title: 'Bills',
    description: 'Bills, mortgage, property tax & insurance — what you owe, all in one place.',
    icon: CreditCard,
    link: '/bill-pay',
    color: '#e8604c',
    bg: '#fdf0ee',
  },
  {
    title: 'Maintenance',
    description: 'Service schedules, warranties & the pros who keep your home running.',
    icon: Wrench,
    link: '/maintenance-management',
    color: '#1e3a5f',
    bg: '#eef2f8',
  },
  {
    title: 'Records',
    description: 'Documents, policies & warranties — your home’s paperwork, filed and findable.',
    icon: FolderOpen,
    link: '/documents',
    color: '#c9a96e',
    bg: '#faf6ee',
  },
];

const HomeTile = ({ tile }) => {
  const Icon = tile.icon;
  return (
    <Link
      to={tile.link}
      className="bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col"
    >
      {/* soft corner wash in the tile's color */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.07] group-hover:opacity-10 transition-opacity"
        style={{ background: tile.color, transform: 'translate(30%, -30%)' }}
      />
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform"
        style={{ background: tile.bg }}
      >
        <Icon className="w-8 h-8" style={{ color: tile.color }} />
      </div>
      <h3 className="font-extrabold text-slate-900 text-2xl mb-2">{tile.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed flex-1">{tile.description}</p>
      <div className="mt-6 flex items-center gap-1.5 text-sm font-bold" style={{ color: tile.color }}>
        Open
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        <h2 className="font-bold text-slate-900 text-base">Needs your attention</h2>
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

// ─── Caretaker read (single-home / selected-property view) ────────────
// The caretaker lens for the standard dashboard. PropertiesAtAGlance carries
// the read on its tiles, but that only renders for multi-home users on the
// overview — so a single-home caretaker (or one drilled into a property) needs
// the read here too. Shows only for a home managed on behalf of someone.
// Fetches that home's real open bills and voices the same "is this home okay"
// status: green when nothing needs eyes, amber when it does. See, don't do.
const CaretakerBanner = ({ selectedHome }) => {
  const [state, setState] = useState({ loading: true, overdue: 0, pending: 0 });

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!selectedHome?.id || !selectedHome?.managedOnBehalf) return;
      try {
        const bills = await pb.collection('invoices').getFullList({
          filter: `homeId="${selectedHome.id}"`,
          $autoCancel: false,
        });
        if (!active) return;
        const now = new Date(); now.setHours(0, 0, 0, 0);
        // Open = not cleared (the locked predicate). Overdue = unpaid past due,
        // status-agnostic. Pending = still in review.
        const open = bills.filter((b) => !b.cleared);
        const overdue = open.filter((b) => {
          if (!b.dueDate) return false;
          const d = new Date(b.dueDate); d.setHours(0, 0, 0, 0);
          return d < now;
        }).length;
        const pending = open.filter((b) => b.status === 'pending_review').length;
        setState({ loading: false, overdue, pending });
      } catch {
        if (active) setState({ loading: false, overdue: 0, pending: 0 });
      }
    };
    run();
    return () => { active = false; };
  }, [selectedHome?.id, selectedHome?.managedOnBehalf]);

  if (!selectedHome?.managedOnBehalf) return null;

  const whose = selectedHome.onBehalfOfName ? `${selectedHome.onBehalfOfName}’s home` : 'This home';
  const okay = !state.loading && state.overdue === 0 && state.pending === 0;

  let msg;
  if (state.loading) msg = 'Checking on things…';
  else if (state.overdue > 0) msg = `${state.overdue} ${state.overdue === 1 ? 'bill is' : 'bills are'} past due`;
  else if (state.pending > 0) msg = `${state.pending} ${state.pending === 1 ? 'bill' : 'bills'} to review`;
  else msg = 'Bills are current — nothing needs your eye';

  return (
    <div
      className="rounded-2xl flex items-start gap-3 p-4 shadow-sm"
      style={{
        background: okay ? '#ecfdf5' : '#fffbeb',
        border: `1px solid ${okay ? '#a7f3d0' : '#fde68a'}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: okay ? '#059669' : '#f59e0b' }}
      >
        {okay
          ? <CheckCircle2 className="w-5 h-5 text-white" />
          : <AlertCircle className="w-5 h-5 text-white" />}
      </div>
      <div className="min-w-0">
        <p className="font-semibold" style={{ fontSize: '13px', color: '#c9a96e' }}>
          {selectedHome.onBehalfOfName ? `On behalf of ${selectedHome.onBehalfOfName}` : 'Managed on your behalf'}
        </p>
        <p className="font-medium" style={{ fontSize: '14px', color: '#1f2733', marginTop: '1px' }}>
          <span className="font-semibold">{whose}:</span> {msg}
        </p>
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
              {selectedHome ? selectedHome.name : 'Welcome to CasaCEO'}
            </h1>
            <p className="text-blue-200 text-sm">
              {selectedHome?.address || 'Add a property to start running your home like an asset'}
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

// ─── Main Dashboard ───────────────────────────────────────────────────
const DashboardPage = () => {
  const { selectedHome, homes, loading } = useHome();
  const { currentUser } = useAuth();

  // Entry model:
  //  • 0–1 homes  → straight into the property dashboard (nothing changes).
  //  • 2+ homes   → land on "properties at a glance" first; entering a tile
  //                 flips `enteredProperty` and drops into that home's board.
  // `enteredProperty` is session-local on purpose: every fresh login starts at
  // the glance for multi-home users, which is the whole point of the change.
  const [enteredProperty, setEnteredProperty] = useState(false);
  const isMultiHome = !loading && homes.length > 1;

  // Multi-home users who haven't drilled into a property yet see the overview.
  if (isMultiHome && !enteredProperty) {
    return (
      <>
        <Helmet>
          <title>Your properties — CasaCEO</title>
        </Helmet>
        <div className="min-h-screen" style={{ background: '#faf8f4' }}>
          {/* Top nav (logo + avatar only — the switcher isn't needed here) */}
          <header className="sticky top-0 z-30 bg-white border-b px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between shadow-sm" style={{ borderColor: '#e9e4db' }}>
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
                Casa<span style={{ color: '#c9a96e' }}>CEO</span>
              </span>
            </Link>
            <UserMenu />
          </header>

          <main className="px-4 sm:px-6 lg:px-8 py-8">
            <PropertiesAtAGlance onEnter={() => setEnteredProperty(true)} />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard — CasaCEO</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50">

        {/* ── Top Nav Bar ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'#1e3a5f'}}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg hidden sm:block" style={{color:'#1e3a5f'}}>
                Casa<span style={{color:'#c9a96e'}}>CEO</span>
              </span>
            </Link>
            {isMultiHome && (
              <button
                onClick={() => setEnteredProperty(false)}
                className="hidden sm:flex items-center gap-1.5 font-medium transition-colors"
                style={{ fontSize: '13px', color: '#5b6472' }}
              >
                <ArrowLeft className="w-4 h-4" /> All properties
              </button>
            )}
          </div>

          <PropertySwitcher />

          <div className="flex items-center gap-3">
            {/* Ready to Sell — kept as a top-right button per plan */}
            <Link
              to="/ready-to-sell"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-all"
              style={{ background: '#1A1A1A' }}
            >
              <Home className="w-4 h-4" />
              Ready to Sell
            </Link>
            <UserMenu />
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          <WelcomeBanner user={currentUser} selectedHome={selectedHome} />

          {/* Caretaker read — only for a home managed on behalf of someone. */}
          <CaretakerBanner selectedHome={selectedHome} />

          {/* ── Getting set up — calm self-completing checklist, retires itself ── */}
          <GettingStartedCard />

          {/* ── The three tiles — the whole point of the screen ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TILES.map((tile, i) => (
              <HomeTile key={i} tile={tile} />
            ))}
          </div>

          {/* ── Home value — the one optional 'see' surface, linked directly
                (Explore container retired; a folder for one item is a detour). ── */}
          <Link
            to="/home-valuation"
            className="group flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-6 py-4 hover:shadow-md hover:border-slate-200 transition-all"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eef2f8' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#1e3a5f' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-700 text-base">Home value</p>
              <p className="text-slate-400 text-sm">See what your home is worth today.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* ── Supporting context: alerts + quick actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickAlerts selectedHome={selectedHome} />

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Quick actions
              </h2>
              <div className="space-y-2">
                {[
                  { label: 'Log a bill payment', link: '/bill-pay', icon: <CreditCard className="w-4 h-4" /> },
                  { label: 'Add a maintenance task', link: '/maintenance-management', icon: <Wrench className="w-4 h-4" /> },
                  { label: 'Upload a document', link: '/documents', icon: <FolderOpen className="w-4 h-4" /> },
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
          </div>

          {!loading && homes.length === 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
              <Home className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p className="font-bold text-amber-800 text-sm mb-1">No properties yet</p>
              <p className="text-amber-600 text-xs mb-3">Add your first property to start managing your home.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
