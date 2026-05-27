import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Bed, Bath, Square, Calendar, Edit3, Camera, Share2,
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, AlertCircle,
  CheckCircle2, Clock, Wrench, FileText, CreditCard, FolderOpen,
  Building2, TreePine, ShieldCheck, BookOpen, Key, LineChart,
  ArrowRight, ChevronRight, Zap, Droplets, Wind, Flame,
  BarChart2, Activity, Info, Star
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────
const HOME = {
  address: '2847 Peachtree Road NE',
  city: 'Atlanta, GA 30305',
  photo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
  beds: 4, baths: 3, sqft: '3,240', lot: '0.42 ac',
  yearBuilt: 2003, type: 'Single Family', lastUpdated: 'Today',
  purchasePrice: 685000, purchaseDate: 'Mar 2019',
  estimatedValue: 924000, valueConfidence: 'High',
  mortgageBalance: 521000, interestRate: 3.25,
  lender: 'Wells Fargo', monthlyPayment: 2847,
  equity: 403000, equityPct: 44,
  valueTrend: [
    { label: 'Purchase', value: 685 }, { label: '2020', value: 710 },
    { label: '2021', value: 780 }, { label: '2022', value: 870 },
    { label: '2023', value: 895 }, { label: 'Now', value: 924 },
  ],
};

const SYSTEMS = [
  { name: 'Roof', icon: Home, age: 8, lifespan: 25, condition: 'Good', cost: '$12,000–18,000', color: '#059669', bg: '#ecfdf5' },
  { name: 'HVAC', icon: Wind, age: 11, lifespan: 15, condition: 'Fair', cost: '$6,000–10,000', color: '#d97706', bg: '#fffbeb' },
  { name: 'Water Heater', icon: Flame, age: 13, lifespan: 12, condition: 'Needs Attention', cost: '$1,200–2,000', color: '#dc2626', bg: '#fef2f2' },
  { name: 'Plumbing', icon: Droplets, age: 21, lifespan: 50, condition: 'Good', color: '#059669', bg: '#ecfdf5', cost: 'Varies' },
  { name: 'Electrical', icon: Zap, age: 21, lifespan: 40, condition: 'Good', cost: 'Varies', color: '#059669', bg: '#ecfdf5' },
  { name: 'Foundation', icon: Square, age: 21, lifespan: 100, condition: 'Good', cost: '$5,000–30,000', color: '#059669', bg: '#ecfdf5' },
  { name: 'Windows', icon: Building2, age: 21, lifespan: 30, condition: 'Fair', cost: '$8,000–15,000', color: '#d97706', bg: '#fffbeb' },
  { name: 'Appliances', icon: Zap, age: 4, lifespan: 15, condition: 'Good', cost: 'Varies', color: '#059669', bg: '#ecfdf5' },
];

const ALERTS = [
  { severity: 'High', message: 'Water heater is past typical lifespan', action: 'Schedule Replacement', module: '/maintenance-management', icon: Flame },
  { severity: 'Medium', message: 'HVAC filter overdue by 30 days', action: 'Log Service', module: '/maintenance-management', icon: Wind },
  { severity: 'Medium', message: 'Homeowner insurance renews in 45 days', action: 'Review Policy', module: '/documents', icon: ShieldCheck },
  { severity: 'Low', message: 'Property tax payment due next month', action: 'View Details', module: '/property-tax', icon: FileText },
  { severity: 'Low', message: 'Roof enters final third of expected lifespan in 2 years', action: 'Plan Ahead', module: '/maintenance-management', icon: Home },
];

const ACTIVITY = [
  { date: 'May 22', type: 'Maintenance', description: 'Annual HVAC inspection completed', icon: Wrench, color: '#f97316' },
  { date: 'May 18', type: 'Document', description: 'Homeowner insurance policy uploaded', icon: FileText, color: '#7c3aed' },
  { date: 'May 10', type: 'Bill', description: 'Mortgage payment logged — $2,847', icon: CreditCard, color: '#2563eb' },
  { date: 'Apr 30', type: 'Valuation', description: 'Home value updated to $924,000', icon: TrendingUp, color: '#059669' },
  { date: 'Apr 15', type: 'Expense', description: 'Landscaping service — $320', icon: TreePine, color: '#16a34a' },
  { date: 'Apr 2', type: 'Maintenance', description: 'Exterior paint touch-up completed', icon: Wrench, color: '#f97316' },
];

const MODULES = [
  { title: 'Maintenance', icon: Wrench, link: '/maintenance-management', color: '#f97316', bg: '#fff7ed' },
  { title: 'Bill Pay', icon: CreditCard, link: '/bill-pay', color: '#2563eb', bg: '#eff6ff' },
  { title: 'Expenses', icon: DollarSign, link: '/expenses', color: '#059669', bg: '#ecfdf5' },
  { title: 'Documents', icon: FolderOpen, link: '/documents', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Utilities', icon: Building2, link: '/utilities', color: '#0891b2', bg: '#ecfeff' },
  { title: 'Home Value', icon: TrendingUp, link: '/home-valuation', color: '#1e3a5f', bg: '#eef2f8' },
  { title: 'Rentals', icon: Key, link: '/rental-properties', color: '#db2777', bg: '#fdf2f8' },
  { title: 'Landscaping', icon: TreePine, link: '/plants', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'Warranty', icon: ShieldCheck, link: '/warranty-tracker', color: '#059669', bg: '#ecfdf5' },
  { title: 'Property Tax', icon: FileText, link: '/property-tax', color: '#dc2626', bg: '#fef2f2' },
  { title: 'Learning Hub', icon: BookOpen, link: '/learn', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Reports', icon: LineChart, link: '/expenses', color: '#7c3aed', bg: '#faf5ff' },
];

// ─── Condition Badge ──────────────────────────────────────────────────
const ConditionBadge = ({ condition }) => {
  const styles = {
    'Good': 'bg-green-100 text-green-700',
    'Fair': 'bg-amber-100 text-amber-700',
    'Needs Attention': 'bg-red-100 text-red-600',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[condition]}`}>
      {condition}
    </span>
  );
};

// ─── Severity Badge ───────────────────────────────────────────────────
const SeverityBadge = ({ severity }) => {
  const styles = {
    'High': 'bg-red-100 text-red-600',
    'Medium': 'bg-amber-100 text-amber-700',
    'Low': 'bg-blue-100 text-blue-600',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[severity]}`}>
      {severity}
    </span>
  );
};

// ─── Mini Bar Chart ───────────────────────────────────────────────────
const ValueChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-16 mt-3">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${(d.value / max) * 52}px`,
              background: i === data.length - 1 ? '#1e3a5f' : '#cbd5e1',
            }}
          />
          <span className="text-slate-400 text-[9px] font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── System Health Bar ────────────────────────────────────────────────
const HealthBar = ({ age, lifespan }) => {
  const pct = Math.min((age / lifespan) * 100, 100);
  const color = pct > 90 ? '#dc2626' : pct > 65 ? '#d97706' : '#059669';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const HomeProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const equity = HOME.estimatedValue - HOME.mortgageBalance;
  const gain = HOME.estimatedValue - HOME.purchasePrice;
  const gainPct = ((gain / HOME.purchasePrice) * 100).toFixed(1);

  return (
    <>
      <Helmet><title>Home Profile — CasaCEO</title></Helmet>

      <div className="min-h-screen bg-slate-50">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
              Casa<span style={{ color: '#c9a96e' }}>CEO</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <Link to="/ready-to-sell" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1A1A1A' }}>
              <Star className="w-3.5 h-3.5" /> Ready to Sell
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img src={HOME.photo} alt="Home" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">System of Record</p>
            <h1 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight">{HOME.address}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{HOME.city}</p>
          </div>
          <button className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-white/30 transition-colors">
            <Camera className="w-3.5 h-3.5" /> Add Photo
          </button>
        </div>

        {/* ── Vitals Strip ── */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 sm:gap-10 py-4 overflow-x-auto scrollbar-hide">
              {[
                { icon: <Bed className="w-4 h-4" />, value: HOME.beds, label: 'Beds' },
                { icon: <Bath className="w-4 h-4" />, value: HOME.baths, label: 'Baths' },
                { icon: <Square className="w-4 h-4" />, value: HOME.sqft, label: 'Sq Ft' },
                { icon: <TreePine className="w-4 h-4" />, value: HOME.lot, label: 'Lot' },
                { icon: <Calendar className="w-4 h-4" />, value: HOME.yearBuilt, label: 'Built' },
                { icon: <Home className="w-4 h-4" />, value: HOME.type, label: 'Type' },
                { icon: <Clock className="w-4 h-4" />, value: HOME.lastUpdated, label: 'Updated' },
              ].map((v, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-slate-400">{v.icon}</span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-none">{v.value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{v.label}</p>
                  </div>
                  {i < 6 && <div className="w-px h-6 bg-slate-200 ml-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ── Row 1: Value + Equity LEFT | Systems RIGHT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Value + Equity */}
            <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-900 text-base">Value & Equity</h2>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{HOME.valueConfidence} Confidence</span>
              </div>

              {/* Big value number */}
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Estimated Value</p>
                <p className="text-4xl font-extrabold text-slate-900">${HOME.estimatedValue.toLocaleString()}</p>
                <p className="text-green-600 text-sm font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +${gain.toLocaleString()} ({gainPct}%) since purchase
                </p>
              </div>

              {/* Value trend chart */}
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Value History</p>
                <ValueChart data={HOME.valueTrend} />
              </div>

              {/* Equity + mortgage grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Equity</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#1e3a5f' }}>${equity.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{HOME.equityPct}% of value</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Mortgage</p>
                  <p className="text-2xl font-extrabold text-slate-900">${HOME.mortgageBalance.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{HOME.interestRate}% · {HOME.lender}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Monthly Payment</p>
                  <p className="text-lg font-bold text-slate-900">${HOME.monthlyPayment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Purchase Price</p>
                  <p className="text-lg font-bold text-slate-900">${HOME.purchasePrice.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{HOME.purchaseDate}</p>
                </div>
              </div>
            </div>

            {/* Systems Health */}
            <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-slate-900 text-base">Systems & Structure</h2>
                <span className="text-xs text-slate-400 font-medium">Digital Twin</span>
              </div>
              <div className="space-y-4">
                {SYSTEMS.map((sys, i) => {
                  const Icon = sys.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: sys.bg }}>
                        <Icon className="w-4 h-4" style={{ color: sys.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900 text-sm">{sys.name}</p>
                          <ConditionBadge condition={sys.condition} />
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">Age: {sys.age} yrs · Lifespan: {sys.lifespan} yrs · Est. replacement: {sys.cost}</p>
                        <HealthBar age={sys.age} lifespan={sys.lifespan} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Alerts & Risks ── */}
          <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: '#e8604c' }} />
                <h2 className="font-extrabold text-slate-900 text-base">Alerts & Risks</h2>
              </div>
              <span className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                {ALERTS.filter(a => a.severity === 'High').length} High Priority
              </span>
            </div>
            <div className="space-y-3">
              {ALERTS.map((alert, i) => {
                const Icon = alert.icon;
                return (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    alert.severity === 'High' ? 'bg-red-50 border-red-100' :
                    alert.severity === 'Medium' ? 'bg-amber-50 border-amber-100' :
                    'bg-blue-50 border-blue-100'
                  }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.severity === 'High' ? 'bg-red-100' :
                      alert.severity === 'Medium' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        alert.severity === 'High' ? 'text-red-500' :
                        alert.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <p className="text-slate-700 font-medium text-sm">{alert.message}</p>
                    </div>
                    <Link to={alert.module} className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 ${
                      alert.severity === 'High' ? 'bg-red-500' :
                      alert.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {alert.action}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Recent Activity ── */}
          <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-extrabold text-slate-900 text-base">Recent Activity</h2>
              <span className="text-xs text-slate-400 font-medium">Home Memory</span>
            </div>
            <div className="space-y-1">
              {ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm font-medium">{item.description}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.type}</p>
                    </div>
                    <span className="text-slate-400 text-xs flex-shrink-0">{item.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Module Grid ── */}
          <div>
            <h2 className="font-extrabold text-slate-900 text-base mb-5">All Modules</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {MODULES.map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <Link key={i} to={mod.link} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all group text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: mod.bg }}>
                      <Icon className="w-5 h-5" style={{ color: mod.color }} />
                    </div>
                    <p className="text-slate-700 text-xs font-semibold leading-tight">{mod.title}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Ready to Sell CTA ── */}
          <div className="rounded-3xl overflow-hidden relative" style={{ background: '#1e3a5f' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5" style={{ background: '#c9a96e', transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10 p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Lifecycle Action</p>
                <h2 className="text-white font-extrabold text-2xl mb-2">Prepare This Home for Market</h2>
                <p className="text-blue-200 text-sm max-w-md leading-relaxed">
                  Your home's full history is already organized. One tap generates a complete, agent-ready Home Dossier.
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
                <Link
                  to="/ready-to-sell"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-white text-sm hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                  style={{ background: '#1A1A1A' }}
                >
                  <Star className="w-4 h-4" />
                  Generate Home Dossier
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-blue-300 text-xs">Selling soon? Your home's story is already written.</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default HomeProfilePage;
