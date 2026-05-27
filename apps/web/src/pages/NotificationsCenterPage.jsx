import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Bell, AlertTriangle, CheckCircle2, Info, Clock,
  Wrench, FileText, ShieldCheck, DollarSign, TrendingUp,
  Wind, Flame, Droplets, Zap, TreePine, CreditCard,
  ArrowRight, X, Check, ChevronDown, Filter, Sparkles,
  Activity, Star, RotateCcw, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const NOTIFICATIONS = [
  // Maintenance & Systems
  { id: 1, category: 'Maintenance', severity: 'Urgent', title: 'Roof nearing end of expected lifespan', sub: 'Installed 2008 · Typical lifespan 20 years · Est. replacement: $18,000', due: 'Within 12 months', primaryAction: 'Schedule Vendor', module: '/maintenance-management', icon: Home, status: 'Active' },
  { id: 2, category: 'Maintenance', severity: 'Urgent', title: 'Water heater past typical lifespan', sub: 'Age: 13 years · Expected lifespan: 12 years · Est. replacement: $1,500', due: 'Immediate', primaryAction: 'Schedule Vendor', module: '/maintenance-management', icon: Flame, status: 'Active' },
  { id: 3, category: 'Maintenance', severity: 'Recommended', title: 'HVAC filter overdue by 30 days', sub: 'Last serviced: Feb 2026 · Filter replacement recommended every 90 days', due: 'This week', primaryAction: 'Schedule Vendor', module: '/maintenance-management', icon: Wind, status: 'Active' },
  { id: 4, category: 'Maintenance', severity: 'Recommended', title: 'Exterior paint approaching end of cycle', sub: 'Last painted: 2019 · Typical repaint cycle: 7–10 years · Est. cost: $6,000', due: 'Within 18 months', primaryAction: 'View Details', module: '/maintenance-management', icon: Home, status: 'Active' },
  { id: 5, category: 'Maintenance', severity: 'Informational', title: 'Gutter cleaning — seasonal reminder', sub: 'Spring cleaning recommended · Last service: Oct 2025', due: 'This month', primaryAction: 'Schedule Vendor', module: '/maintenance-management', icon: TreePine, status: 'Active' },
  // Financial & Administrative
  { id: 6, category: 'Financial', severity: 'Urgent', title: 'Homeowner insurance renewal in 45 days', sub: 'Policy expires Jul 10, 2026 · Review for coverage gaps before renewal', due: 'Jul 10, 2026', primaryAction: 'Renew Policy', module: '/documents', icon: ShieldCheck, status: 'Active' },
  { id: 7, category: 'Financial', severity: 'Recommended', title: 'Property tax payment due next month', sub: 'Glynn County · Estimated amount: $6,200 · Q3 2026 installment', due: 'Jun 30, 2026', primaryAction: 'View Details', module: '/property-tax', icon: FileText, status: 'Active' },
  { id: 8, category: 'Financial', severity: 'Recommended', title: 'Mortgage rate environment favorable for refinance', sub: 'Current rate: 3.10% · 30-year fixed avg: 6.2% · Review your options', due: 'No deadline', primaryAction: 'Review Estimate', module: '/home-valuation', icon: DollarSign, status: 'Active' },
  { id: 9, category: 'Financial', severity: 'Informational', title: 'Utility bill 18% above seasonal average', sub: 'April electricity: $312 · 3-month avg: $264 · May indicate HVAC inefficiency', due: 'No deadline', primaryAction: 'View Details', module: '/utilities', icon: Zap, status: 'Active' },
  // Market & Valuation
  { id: 10, category: 'Valuation', severity: 'Informational', title: 'Home value increased $24,000 this quarter', sub: 'Current estimate: $1,245,000 · Previous: $1,221,000 · Confidence: High', due: 'No deadline', primaryAction: 'View Details', module: '/home-valuation', icon: TrendingUp, status: 'Active' },
  { id: 11, category: 'Valuation', severity: 'Recommended', title: 'Equity milestone reached — 49% equity', sub: 'You now own nearly half your home\'s value · Total equity: $615,000', due: 'No deadline', primaryAction: 'View Details', module: '/home-valuation', icon: TrendingUp, status: 'Active' },
  { id: 12, category: 'Valuation', severity: 'Informational', title: '3 comparable homes sold nearby this month', sub: 'Avg sale price: $1,218,000 · Affects your estimated value range', due: 'No deadline', primaryAction: 'View Details', module: '/home-valuation', icon: TrendingUp, status: 'Active' },
  // Documents & Compliance
  { id: 13, category: 'Documents', severity: 'Recommended', title: 'Appliance warranty expires in 60 days', sub: 'LG Refrigerator · Purchase date: Jun 2021 · 5-year warranty ending', due: 'Aug 1, 2026', primaryAction: 'View Details', module: '/warranty-tracker', icon: FileText, status: 'Active' },
  { id: 14, category: 'Documents', severity: 'Informational', title: 'Roof inspection report missing from records', sub: 'Last documented inspection: 2019 · Recommended every 3–5 years', due: 'No deadline', primaryAction: 'View Details', module: '/documents', icon: FileText, status: 'Active' },
  // Safety & Risk
  { id: 15, category: 'Safety', severity: 'Recommended', title: 'Smoke detector battery check overdue', sub: 'Annual battery replacement recommended · Last checked: unknown', due: 'This month', primaryAction: 'View Details', module: '/maintenance-management', icon: AlertTriangle, status: 'Active' },
  { id: 16, category: 'Safety', severity: 'Informational', title: 'Hurricane season begins June 1', sub: 'St. Simons Island is in a hurricane-prone zone · Review preparedness checklist', due: 'Jun 1, 2026', primaryAction: 'View Details', module: '/documents', icon: AlertTriangle, status: 'Active' },
];

const FILTERS = ['All', 'Urgent', 'Recommended', 'Informational', 'Completed', 'Dismissed'];
const SORT_OPTIONS = ['Newest', 'Oldest', 'By Severity', 'By Category'];

// ═══════════════════════════════════════════════════════════════════════
// ATOMIC COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const SeverityPill = ({ severity }) => {
  const styles = {
    Urgent: 'bg-red-100 text-red-600',
    Recommended: 'bg-amber-100 text-amber-700',
    Informational: 'bg-blue-100 text-blue-600',
    Completed: 'bg-green-100 text-green-700',
    Dismissed: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`font-medium rounded-full px-2 py-0.5 ${styles[severity]}`} style={{ fontSize: '12px' }}>
      {severity}
    </span>
  );
};

const CategoryTag = ({ category }) => {
  const styles = {
    Maintenance: { bg: '#fff7ed', color: '#f97316' },
    Financial: { bg: '#ecfdf5', color: '#059669' },
    Valuation: { bg: '#eef2f8', color: '#1e3a5f' },
    Documents: { bg: '#f5f3ff', color: '#7c3aed' },
    Safety: { bg: '#fef2f2', color: '#dc2626' },
    Vendor: { bg: '#f0f9ff', color: '#0369a1' },
  };
  const s = styles[category] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="font-medium rounded-full px-2 py-0.5" style={{ fontSize: '11px', background: s.bg, color: s.color }}>
      {category}
    </span>
  );
};

const ActionButton = ({ label, module, severity }) => {
  const bg = severity === 'Urgent' ? '#ef4444' : severity === 'Recommended' ? '#f59e0b' : '#3b82f6';
  return (
    <Link to={module} className="font-semibold text-white hover:opacity-90 transition-all rounded-xl whitespace-nowrap" style={{ background: bg, padding: '8px 14px', fontSize: '12px' }}>
      {label}
    </Link>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY ROW
// ═══════════════════════════════════════════════════════════════════════

const SummaryCard = ({ label, count, sub, icon: Icon, color, bg, onClick, active }) => (
  <button
    onClick={onClick}
    className="flex-1 text-left transition-all hover:shadow-md"
    style={{
      background: active ? color : 'white',
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${active ? color : '#e2e8f0'}`,
      boxShadow: active ? `0 0 0 2px ${color}30` : '0 1px 3px rgba(0,0,0,0.06)',
    }}
  >
    <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
      <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: active ? 'rgba(255,255,255,0.2)' : bg }}>
        <Icon style={{ width: '16px', height: '16px', color: active ? 'white' : color }} />
      </div>
      <p className="font-extrabold" style={{ fontSize: '24px', color: active ? 'white' : '#0f172a', lineHeight: 1 }}>{count}</p>
    </div>
    <p className="font-semibold" style={{ fontSize: '14px', color: active ? 'rgba(255,255,255,0.9)' : '#0f172a' }}>{label}</p>
    <p style={{ fontSize: '12px', color: active ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '2px' }}>{sub}</p>
  </button>
);

const SummaryRow = ({ notifications, activeFilter, onFilter }) => {
  const urgent = notifications.filter(n => n.severity === 'Urgent').length;
  const recommended = notifications.filter(n => n.severity === 'Recommended').length;
  const informational = notifications.filter(n => n.severity === 'Informational').length;
  const upcoming = notifications.filter(n => n.due !== 'No deadline' && n.due !== 'Immediate').length;

  return (
    <div className="flex gap-4 flex-col sm:flex-row" style={{ marginBottom: '24px' }}>
      <SummaryCard label="Urgent Items" count={urgent} sub="Require attention soon" icon={AlertTriangle} color="#ef4444" bg="#fef2f2" onClick={() => onFilter('Urgent')} active={activeFilter === 'Urgent'} />
      <SummaryCard label="Recommended Actions" count={recommended} sub="Plan ahead to avoid issues" icon={Sparkles} color="#f59e0b" bg="#fffbeb" onClick={() => onFilter('Recommended')} active={activeFilter === 'Recommended'} />
      <SummaryCard label="Insights" count={informational} sub="General updates and reminders" icon={Info} color="#3b82f6" bg="#eff6ff" onClick={() => onFilter('Informational')} active={activeFilter === 'Informational'} />
      <SummaryCard label="Upcoming Deadlines" count={upcoming} sub="Next 30 days" icon={Clock} color="#1e3a5f" bg="#eef2f8" onClick={() => onFilter('All')} active={false} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATION ITEM
// ═══════════════════════════════════════════════════════════════════════

const NotificationItem = ({ notification, onDismiss, onComplete }) => {
  const Icon = notification.icon;
  const borderColors = {
    Urgent: '#fecaca',
    Recommended: '#fde68a',
    Informational: '#bfdbfe',
  };
  const iconColors = {
    Urgent: { bg: '#fee2e2', color: '#ef4444' },
    Recommended: { bg: '#fef3c7', color: '#f59e0b' },
    Informational: { bg: '#dbeafe', color: '#3b82f6' },
  };
  const ic = iconColors[notification.severity] || iconColors.Informational;

  return (
    <div
      className="bg-white flex items-start gap-4 group hover:shadow-md transition-all"
      style={{ borderRadius: '12px', padding: '16px', border: `1px solid ${borderColors[notification.severity] || '#e2e8f0'}`, marginBottom: '0' }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: ic.bg, marginTop: '2px' }}>
        <Icon style={{ width: '18px', height: '18px', color: ic.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '8px' }}>
          <SeverityPill severity={notification.severity} />
          <CategoryTag category={notification.category} />
        </div>
        <p className="font-semibold text-slate-800" style={{ fontSize: '15px', lineHeight: '1.4' }}>{notification.title}</p>
        <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '4px', lineHeight: '1.5' }}>{notification.sub}</p>
        {notification.due !== 'No deadline' && (
          <p className="flex items-center gap-1 font-medium" style={{ fontSize: '12px', marginTop: '8px', color: notification.severity === 'Urgent' ? '#ef4444' : '#94a3b8' }}>
            <Clock style={{ width: '12px', height: '12px' }} /> Due: {notification.due}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <ActionButton label={notification.primaryAction} module={notification.module} severity={notification.severity} />
        <div className="flex gap-2">
          <button
            onClick={() => onComplete(notification.id)}
            className="flex items-center gap-1 font-medium text-slate-400 hover:text-green-600 transition-colors"
            style={{ fontSize: '12px' }}
            title="Mark Complete"
          >
            <Check style={{ width: '12px', height: '12px' }} /> Complete
          </button>
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex items-center gap-1 font-medium text-slate-400 hover:text-slate-600 transition-colors"
            style={{ fontSize: '12px' }}
            title="Dismiss"
          >
            <X style={{ width: '12px', height: '12px' }} /> Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATION LIST
// ═══════════════════════════════════════════════════════════════════════

const NotificationList = ({ notifications, activeFilter, onDismiss, onComplete }) => {
  const filtered = activeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.severity === activeFilter || n.status === activeFilter);

  if (filtered.length === 0) {
    return (
      <div className="bg-white text-center" style={{ borderRadius: '12px', padding: '48px 20px', border: '1px solid #e2e8f0' }}>
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" style={{ marginBottom: '16px' }} />
        <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>
          {activeFilter === 'Urgent' ? 'No urgent items at this time.' : 'No active notifications. Your home is fully up to date.'}
        </p>
        <p className="text-slate-400" style={{ fontSize: '14px' }}>
          {activeFilter === 'Urgent'
            ? "We'll notify you immediately if anything changes."
            : 'New insights will appear here as HomeOS monitors your home.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {filtered.map(n => (
        <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} onComplete={onComplete} />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// FILTER BAR
// ═══════════════════════════════════════════════════════════════════════

const FilterBar = ({ activeFilter, onFilter, sortBy, onSort }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ marginBottom: '24px' }}>
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onFilter(f)}
          className="font-medium transition-all rounded-xl"
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            background: activeFilter === f ? '#1e3a5f' : 'white',
            color: activeFilter === f ? 'white' : '#64748b',
            border: `1px solid ${activeFilter === f ? '#1e3a5f' : '#e2e8f0'}`,
          }}
        >
          {f}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-2">
      <Filter style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
      <select
        value={sortBy}
        onChange={e => onSort(e.target.value)}
        className="border border-slate-200 rounded-xl text-slate-600 bg-white focus:outline-none"
        style={{ padding: '8px 12px', fontSize: '13px' }}
      >
        {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
      </select>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const NotificationsCenterPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const handleDismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleComplete = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'Completed', severity: 'Completed' } : n));
  const active = notifications.filter(n => n.status === 'Active');

  return (
    <>
      <Helmet><title>Notifications & Insights — CasaCEO</title></Helmet>
      <div className="min-h-screen bg-slate-50">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm" style={{ padding: '12px 32px' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
                Casa<span style={{ color: '#c9a96e' }}>CEO</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Bell style={{ width: '18px', height: '18px', color: '#1e3a5f' }} />
              <span className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Notifications & Insights</span>
              {active.filter(n => n.severity === 'Urgent').length > 0 && (
                <span className="font-bold text-white rounded-full px-2 py-0.5" style={{ background: '#ef4444', fontSize: '12px' }}>
                  {active.filter(n => n.severity === 'Urgent').length} Urgent
                </span>
              )}
            </div>
            <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Dashboard</Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto" style={{ padding: '32px' }}>

          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2', marginBottom: '8px' }}>
              Notifications & Insights
            </h1>
            <p className="text-slate-500" style={{ fontSize: '15px' }}>
              Real-time alerts, recommendations, and upcoming deadlines for your home.
            </p>
          </div>

          {/* Summary Row */}
          <SummaryRow notifications={active} activeFilter={activeFilter} onFilter={setActiveFilter} />

          {/* Intelligence Banner */}
          <div className="flex items-center gap-3 rounded-2xl" style={{ background: '#eef2f8', border: '1px solid #c7d7eb', padding: '14px 20px', marginBottom: '24px' }}>
            <Activity style={{ width: '18px', height: '18px', color: '#1e3a5f', flexShrink: 0 }} />
            <p className="text-slate-700 font-medium" style={{ fontSize: '14px' }}>
              HomeOS is monitoring your home 24/7 — systems, finances, risks, documents, and market conditions.
            </p>
            <Link to="/home-profile" className="font-semibold whitespace-nowrap flex items-center gap-1 ml-auto hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
              View Home Profile <ArrowRight style={{ width: '12px', height: '12px' }} />
            </Link>
          </div>

          {/* Filter Bar */}
          <FilterBar activeFilter={activeFilter} onFilter={setActiveFilter} sortBy={sortBy} onSort={setSortBy} />

          {/* Notification List */}
          <NotificationList
            notifications={active}
            activeFilter={activeFilter}
            onDismiss={handleDismiss}
            onComplete={handleComplete}
          />

          {/* Bottom CTA */}
          {active.length > 0 && (
            <div className="flex items-center justify-between rounded-2xl" style={{ background: '#1e3a5f', padding: '20px 24px', marginTop: '32px' }}>
              <div>
                <p className="font-semibold text-white" style={{ fontSize: '15px' }}>Ready to sell this home?</p>
                <p className="text-blue-200" style={{ fontSize: '13px', marginTop: '4px' }}>Your Home Dossier is one tap away.</p>
              </div>
              <Link to="/ready-to-sell" className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1A1A1A', padding: '10px 18px', fontSize: '13px' }}>
                <Star style={{ width: '14px', height: '14px' }} /> Ready to Sell <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default NotificationsCenterPage;
