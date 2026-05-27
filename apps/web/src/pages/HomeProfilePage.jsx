import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, MapPin, Calendar, Clock, TrendingUp, TrendingDown,
  DollarSign, Shield, Zap, FileText, Wrench, Plus, Upload,
  AlertCircle, CheckCircle2, ChevronRight, Star, Bell,
  BarChart2, Activity, Eye, ArrowUpRight, Download,
  Droplets, Wifi, Flame, BookOpen, Key, Settings,
  ShieldCheck, AlertTriangle, RefreshCw, ExternalLink, Layers
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════
// SHARED DATA MODEL (spec-aligned)
// ═══════════════════════════════════════════════════════════════════════

const SAMPLE_HOME = {
  id: '1',
  address: '123 Oakwood Lane, St. Simons Island, GA 31522',
  type: 'primary',
  purchaseDate: '2018-06-15',
  purchasePrice: 850000,
  squareFeet: 3240,
  bedrooms: 4,
  bathrooms: 3.5,
  yearBuilt: 2008,
  lastUpdated: '2026-05-27',
  valuation: [
    { id: 'v1', date: '2025-06', value: 1180000, source: 'AVM', confidenceScore: 82 },
    { id: 'v2', date: '2025-08', value: 1195000, source: 'AVM', confidenceScore: 79 },
    { id: 'v3', date: '2025-10', value: 1210000, source: 'HomeOS', confidenceScore: 85 },
    { id: 'v4', date: '2025-12', value: 1225000, source: 'MLS', confidenceScore: 91 },
    { id: 'v5', date: '2026-02', value: 1230000, source: 'HomeOS', confidenceScore: 88 },
    { id: 'v6', date: '2026-04', value: 1245000, source: 'AVM', confidenceScore: 86 },
  ],
  mortgage: [{
    id: 'm1', lender: 'Wells Fargo', balance: 630000, rate: 3.25,
    payment: 3280, nextPaymentDate: '2026-06-01',
  }],
  insurancePolicies: [
    { id: 'i1', provider: 'State Farm', type: 'homeowners', premium: 1840, coverage: 1200000, renewalDate: '2026-09-01' },
    { id: 'i2', provider: 'USAA', type: 'umbrella', premium: 285, coverage: 2000000, renewalDate: '2026-11-15' },
  ],
  utilities: [
    { id: 'u1', provider: 'Georgia Power', type: 'electric', accountNumber: '4821-003', monthlySpend: 142, nextBillDate: '2026-06-05' },
    { id: 'u2', provider: 'Atlanta Gas Light', type: 'gas', accountNumber: '7730-112', monthlySpend: 68, nextBillDate: '2026-06-08' },
    { id: 'u3', provider: 'Comcast Xfinity', type: 'internet', accountNumber: 'X-88402', monthlySpend: 89, nextBillDate: '2026-06-15' },
  ],
  documents: [
    { id: 'd1', type: 'Deed', title: 'Property Deed', uploadDate: '2018-06-15' },
    { id: 'd2', type: 'Insurance', title: 'State Farm HO-3 Policy', uploadDate: '2026-04-01' },
    { id: 'd3', type: 'Warranties', title: 'HVAC System Warranty', uploadDate: '2022-03-10' },
  ],
  events: [
    { id: 'e1', type: 'maintenance', title: 'HVAC Annual Service', date: '2026-05-15', cost: 285, status: 'completed' },
    { id: 'e2', type: 'inspection', title: 'Annual Home Inspection', date: '2026-04-15', cost: 350, status: 'completed' },
    { id: 'e3', type: 'maintenance', title: 'Roof Inspection', date: '2026-06-10', cost: 175, status: 'upcoming' },
    { id: 'e4', type: 'financial', title: 'Insurance Renewal', date: '2026-09-01', cost: 1840, status: 'upcoming' },
    { id: 'e5', type: 'maintenance', title: 'Pest Control Service', date: '2026-03-20', cost: 125, status: 'overdue' },
  ],
};

const MISSING_DOCS = ['Closing Disclosure', 'Survey / Site Plan', 'Flood Certificate'];

// ═══════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS (spec: MetricCard, SectionHeader, AlertBadge)
// ═══════════════════════════════════════════════════════════════════════

const MetricCard = ({ title, value, trend, icon: Icon, color = '#1e3a5f', bg = '#eef2f8', border = '#c7d7eb', sub }) => (
  <div className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
      <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg }}>
        {Icon && <Icon style={{ width: '16px', height: '16px', color }} />}
      </div>
      {trend !== undefined && (
        <span className="flex items-center gap-0.5 font-semibold" style={{ fontSize: '12px', color: trend >= 0 ? '#059669' : '#dc2626' }}>
          {trend >= 0 ? <TrendingUp style={{ width: '12px', height: '12px' }} /> : <TrendingDown style={{ width: '12px', height: '12px' }} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>{value}</p>
    <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{title}</p>
    {sub && <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{sub}</p>}
  </div>
);

const SectionHeader = ({ title, subtitle, action, actionHref, icon: Icon }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
    <div className="flex items-center gap-2">
      {Icon && <Icon style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
      <div>
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{title}</h2>
        {subtitle && <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '1px' }}>{subtitle}</p>}
      </div>
    </div>
    {action && (
      <Link to={actionHref || '#'} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: '12px', color: '#1e3a5f' }}>
        {action} <ChevronRight style={{ width: '13px', height: '13px' }} />
      </Link>
    )}
  </div>
);

const AlertBadge = ({ status }) => {
  const styles = {
    overdue: { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
    upcoming: { bg: '#fffbeb', color: '#d97706', label: 'Upcoming' },
    new: { bg: '#ecfdf5', color: '#059669', label: 'New' },
    completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Completed' },
    risk: { bg: '#fef3c7', color: '#f59e0b', label: 'Risk' },
  };
  const s = styles[status] || styles.upcoming;
  return (
    <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: s.bg, color: s.color, padding: '2px 8px' }}>
      {s.label}
    </span>
  );
};

const EventRow = ({ event, onAction }) => {
  const typeIcons = { maintenance: Wrench, inspection: CheckCircle2, financial: DollarSign, insurance: Shield, utility: Zap, repair: Wrench, upgrade: Star };
  const Icon = typeIcons[event.type] || Activity;
  return (
    <div className="flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '10px 12px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc' }}>
        <Icon style={{ width: '14px', height: '14px', color: '#64748b' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate" style={{ fontSize: '13px' }}>{event.title}</p>
        <p className="text-slate-400" style={{ fontSize: '11px' }}>
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {event.cost ? ` · $${event.cost.toLocaleString()}` : ''}
        </p>
      </div>
      <AlertBadge status={event.status} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4: VALUATION SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════

const ValuationSnapshot = ({ home }) => {
  const latest = home.valuation[home.valuation.length - 1];
  const prev = home.valuation[home.valuation.length - 2];
  const change = latest && prev ? ((latest.value - prev.value) / prev.value * 100).toFixed(1) : 0;
  const equity = latest ? latest.value - home.mortgage[0]?.balance : 0;
  const chartData = home.valuation.map(v => ({ month: v.date, value: v.value }));

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Valuation Snapshot" subtitle="12-month trend + confidence" action="Full Dashboard" actionHref="/home-valuation" icon={TrendingUp} />
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '16px' }}>
        <div className="bg-slate-50 rounded-xl" style={{ padding: '12px' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Current Value</p>
          <p className="font-extrabold text-slate-900" style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>${(latest?.value / 1000).toFixed(0)}K</p>
          <p className="font-semibold" style={{ fontSize: '11px', color: parseFloat(change) >= 0 ? '#059669' : '#dc2626', marginTop: '2px' }}>
            {parseFloat(change) >= 0 ? '+' : ''}{change}% vs last period
          </p>
        </div>
        <div className="rounded-xl" style={{ padding: '12px', background: '#ecfdf5' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Owner Equity</p>
          <p className="font-extrabold text-green-700" style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>${(equity / 1000).toFixed(0)}K</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>after mortgage</p>
        </div>
        <div className="rounded-xl" style={{ padding: '12px', background: '#eef2f8' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Confidence</p>
          <p className="font-extrabold" style={{ fontSize: '20px', lineHeight: 1, color: '#1e3a5f', marginTop: '2px' }}>{latest?.confidenceScore}%</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{latest?.source}</p>
        </div>
      </div>
      <div style={{ height: '90px', marginLeft: '-4px', marginRight: '-4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis hide tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Value']} />
            <Area type="monotone" dataKey="value" stroke="#1e3a5f" strokeWidth={2} fill="url(#valGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5: MAINTENANCE OVERVIEW
// ═══════════════════════════════════════════════════════════════════════

const MaintenanceOverview = ({ events }) => {
  const maintenance = events.filter(e => e.type === 'maintenance' || e.type === 'inspection' || e.type === 'repair');
  const overdue = maintenance.filter(e => e.status === 'overdue');
  const upcoming = maintenance.filter(e => e.status === 'upcoming');
  const ytdCost = maintenance.filter(e => e.status === 'completed').reduce((s, e) => s + (e.cost || 0), 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Maintenance Overview" subtitle={`${overdue.length} overdue · ${upcoming.length} upcoming`} action="Manage" actionHref="/maintenance-management" icon={Wrench} />
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Upcoming', value: upcoming.length, color: '#d97706', bg: '#fffbeb' },
          { label: 'Overdue', value: overdue.length, color: overdue.length > 0 ? '#dc2626' : '#059669', bg: overdue.length > 0 ? '#fef2f2' : '#ecfdf5' },
          { label: 'YTD Cost', value: `$${ytdCost.toLocaleString()}`, color: '#1e3a5f', bg: '#eef2f8' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl text-center" style={{ padding: '10px', background: s.bg }}>
            <p className="font-extrabold" style={{ fontSize: '18px', color: s.color }}>{s.value}</p>
            <p className="text-slate-500" style={{ fontSize: '11px', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[...overdue, ...upcoming].slice(0, 3).map(e => <EventRow key={e.id} event={e} />)}
        {maintenance.length === 0 && <p className="text-slate-400 text-center" style={{ fontSize: '13px', padding: '16px' }}>No maintenance events tracked yet.</p>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 6: INSURANCE SUMMARY
// ═══════════════════════════════════════════════════════════════════════

const InsuranceSummary = ({ policies }) => {
  const today = new Date();
  const renewingSoon = policies.filter(p => {
    const d = Math.ceil((new Date(p.renewalDate) - today) / 86400000);
    return d >= 0 && d <= 90;
  });
  const totalPremium = policies.reduce((s, p) => s + p.premium, 0);
  const totalCoverage = policies.reduce((s, p) => s + p.coverage, 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Insurance Summary" subtitle={`${policies.length} active policies · ${renewingSoon.length} renewing soon`} action="Manage" actionHref="/insurance-analyzer" icon={Shield} />
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '14px' }}>
        <div className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Annual Premiums</p>
          <p className="font-bold text-slate-900" style={{ fontSize: '16px', marginTop: '2px' }}>${totalPremium.toLocaleString()}/yr</p>
        </div>
        <div className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Total Coverage</p>
          <p className="font-bold text-slate-900" style={{ fontSize: '16px', marginTop: '2px' }}>${(totalCoverage / 1000000).toFixed(1)}M</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {policies.map(p => {
          const daysLeft = Math.ceil((new Date(p.renewalDate) - today) / 86400000);
          return (
            <div key={p.id} className="flex items-center gap-3" style={{ padding: '8px 10px', borderRadius: '10px', background: daysLeft <= 90 ? '#fffbeb' : '#f8fafc', border: `1px solid ${daysLeft <= 90 ? '#fde68a' : '#e2e8f0'}` }}>
              <Shield style={{ width: '14px', height: '14px', color: '#e8604c', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate" style={{ fontSize: '13px' }}>{p.provider} — {p.type}</p>
                <p className="text-slate-400" style={{ fontSize: '11px' }}>Renews {new Date(p.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <p className="font-semibold text-slate-700 flex-shrink-0" style={{ fontSize: '12px' }}>${p.premium.toLocaleString()}/yr</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 7: UTILITIES SUMMARY
// ═══════════════════════════════════════════════════════════════════════

const UtilitiesSummary = ({ utilities }) => {
  const typeIcons = { electric: Zap, gas: Flame, water: Droplets, internet: Wifi };
  const total = utilities.reduce((s, u) => s + u.monthlySpend, 0);
  const today = new Date();
  const dueSoon = utilities.filter(u => {
    const d = Math.ceil((new Date(u.nextBillDate) - today) / 86400000);
    return d >= 0 && d <= 7;
  });

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Utilities Summary" subtitle={`$${total}/mo · ${dueSoon.length} bills due soon`} action="Manage" actionHref="/utilities" icon={Zap} />
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '14px' }}>
        <div className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Monthly Total</p>
          <p className="font-bold text-slate-900" style={{ fontSize: '16px', marginTop: '2px' }}>${total}/mo</p>
        </div>
        <div className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Annual Forecast</p>
          <p className="font-bold text-slate-900" style={{ fontSize: '16px', marginTop: '2px' }}>${(total * 12).toLocaleString()}/yr</p>
        </div>
        <div className="rounded-xl" style={{ padding: '10px', background: dueSoon.length > 0 ? '#fffbeb' : '#ecfdf5' }}>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Bills Due</p>
          <p className="font-bold" style={{ fontSize: '16px', marginTop: '2px', color: dueSoon.length > 0 ? '#d97706' : '#059669' }}>{dueSoon.length} this week</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {utilities.map(u => {
          const Icon = typeIcons[u.type] || Zap;
          return (
            <div key={u.id} className="flex items-center gap-3" style={{ padding: '8px 10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Icon style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
              <div className="flex-1">
                <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{u.provider}</p>
                <p className="text-slate-400" style={{ fontSize: '11px' }}>Due {new Date(u.nextBillDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <p className="font-semibold text-slate-700" style={{ fontSize: '12px' }}>${u.monthlySpend}/mo</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 8: DOCUMENT VAULT PREVIEW
// ═══════════════════════════════════════════════════════════════════════

const DocumentVaultPreview = ({ documents, missingDocs }) => (
  <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <SectionHeader title="Document Vault" subtitle={`${documents.length} stored · ${missingDocs.length} missing`} action="Open Vault" actionHref="/documents" icon={FileText} />
    {missingDocs.length > 0 && (
      <div className="rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', marginBottom: '12px' }}>
        <p className="font-semibold text-amber-700" style={{ fontSize: '12px', marginBottom: '4px' }}>{missingDocs.length} documents missing from your home record</p>
        <div className="flex flex-wrap gap-1.5">
          {missingDocs.map((d, i) => (
            <span key={i} className="text-amber-600 bg-amber-100 rounded-full" style={{ fontSize: '11px', padding: '2px 8px' }}>{d}</span>
          ))}
        </div>
      </div>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {documents.slice(0, 4).map(doc => (
        <div key={doc.id} className="flex items-center gap-3" style={{ padding: '8px 10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <FileText style={{ width: '14px', height: '14px', color: '#7c3aed', flexShrink: 0 }} />
          <div className="flex-1">
            <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{doc.title}</p>
            <p className="text-slate-400" style={{ fontSize: '11px' }}>{doc.type} · {new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// SECTION 9: TIMELINE PREVIEW
// ═══════════════════════════════════════════════════════════════════════

const TimelinePreview = ({ events }) => {
  const recent = [...events].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const typeIcons = { maintenance: Wrench, inspection: CheckCircle2, financial: DollarSign, insurance: Shield, utility: Zap };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Timeline Preview" subtitle="Last 5 events" action="View Full Timeline" actionHref="/timeline" icon={Activity} />
      <div>
        {recent.map((event, i) => {
          const Icon = typeIcons[event.type] || Activity;
          return (
            <div key={event.id} className="flex gap-3 group">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="flex items-center justify-center border-2 border-white shadow-sm" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2f8', zIndex: 10 }}>
                  <Icon style={{ width: '13px', height: '13px', color: '#1e3a5f' }} />
                </div>
                {i < recent.length - 1 && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', marginTop: '4px', minHeight: '20px' }} />}
              </div>
              <div className="flex-1" style={{ paddingBottom: i < recent.length - 1 ? '16px' : '0' }}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{event.title}</p>
                  <AlertBadge status={event.status} />
                </div>
                <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {event.cost ? ` · $${event.cost.toLocaleString()}` : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeProfilePage = () => {
  const home = SAMPLE_HOME;
  const latest = home.valuation[home.valuation.length - 1];
  const equity = latest ? latest.value - (home.mortgage[0]?.balance || 0) : 0;
  const monthlyTotal = home.utilities.reduce((s, u) => s + u.monthlySpend, 0)
    + Math.round(home.mortgage[0]?.payment || 0);
  const overdueCount = home.events.filter(e => e.status === 'overdue').length;
  const upcomingCount = home.events.filter(e => e.status === 'upcoming').length;
  const appreciation = latest ? ((latest.value - home.purchasePrice) / home.purchasePrice * 100).toFixed(1) : 0;

  const MODULES = [
    { label: 'Maintenance', href: '/maintenance-management', icon: Wrench, color: '#f97316', bg: '#fff7ed' },
    { label: 'Bill Pay', href: '/bill-pay', icon: DollarSign, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Valuation', href: '/home-valuation', icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
    { label: 'Insurance', href: '/insurance-analyzer', icon: Shield, color: '#e8604c', bg: '#fdf0ee' },
    { label: 'Documents', href: '/documents', icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Utilities', href: '/utilities', icon: Zap, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Expenses', href: '/expenses', icon: BarChart2, color: '#64748b', bg: '#f8fafc' },
    { label: 'Timeline', href: '/timeline', icon: Activity, color: '#1e3a5f', bg: '#eef2f8' },
    { label: 'Warranties', href: '/warranty-tracker', icon: ShieldCheck, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Landscaping', href: '/plants', icon: Layers, color: '#15803d', bg: '#f0fdf4' },
    { label: 'Property Tax', href: '/property-tax', icon: BookOpen, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Learning Hub', href: '/home-learn', icon: Star, color: '#d97706', bg: '#fffbeb' },
  ];

  return (
    <>
      <Helmet><title>Home Profile — CasaCEO</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">

        {/* ═══ SECTION 1: HEADER ═══ */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center" style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#eef2f8', flexShrink: 0 }}>
                <Home style={{ width: '26px', height: '26px', color: '#1e3a5f' }} />
              </div>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                  <span className="font-semibold text-white rounded-full capitalize" style={{ fontSize: '11px', background: '#1e3a5f', padding: '2px 10px' }}>{home.type}</span>
                  {overdueCount > 0 && <span className="font-semibold text-red-600 bg-red-100 rounded-full" style={{ fontSize: '11px', padding: '2px 8px' }}>{overdueCount} overdue</span>}
                </div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: '1.2' }}>{home.address}</h1>
                <div className="flex items-center gap-3 text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>
                  <span>{home.bedrooms}bd · {home.bathrooms}ba · {home.squareFeet.toLocaleString()} sqft</span>
                  <span>Built {home.yearBuilt}</span>
                  <span className="flex items-center gap-1">
                    <Clock style={{ width: '12px', height: '12px' }} />
                    Updated {new Date(home.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/ready-to-sell" className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#e8604c', padding: '10px 18px', fontSize: '13px' }}>
                <Key style={{ width: '14px', height: '14px' }} /> Ready to Sell
              </Link>
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all" style={{ padding: '10px 14px', fontSize: '13px' }}>
                <Download style={{ width: '14px', height: '14px' }} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* ═══ SECTION 2: TOP METRICS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '32px' }}>
          <MetricCard title="Current Valuation" value={`$${(latest?.value / 1000).toFixed(0)}K`} trend={parseFloat(appreciation)} icon={TrendingUp} color="#059669" bg="#ecfdf5" border="#a7f3d0" sub={`+$${((latest?.value - home.purchasePrice) / 1000).toFixed(0)}K since purchase`} />
          <MetricCard title="Owner Equity" value={`$${(equity / 1000).toFixed(0)}K`} icon={Home} color="#1e3a5f" bg="#eef2f8" border="#c7d7eb" sub={`${((equity / latest?.value) * 100).toFixed(0)}% of home value`} />
          <MetricCard title="Monthly Cost" value={`$${monthlyTotal.toLocaleString()}`} icon={DollarSign} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" sub="mortgage + utilities" />
          <MetricCard title="Active Alerts" value={overdueCount + upcomingCount} icon={Bell} color={overdueCount > 0 ? '#dc2626' : '#d97706'} bg={overdueCount > 0 ? '#fef2f2' : '#fffbeb'} border={overdueCount > 0 ? '#fecaca' : '#fde68a'} sub={`${overdueCount} overdue · ${upcomingCount} upcoming`} />
        </div>

        {/* ═══ SECTION 3: QUICK ACTIONS ═══ */}
        <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '12px' }}>Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Log Event', href: '/timeline', icon: Plus, color: '#1e3a5f', bg: '#eef2f8' },
              { label: 'Upload Document', href: '/documents', icon: Upload, color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Add Utility', href: '/utilities', icon: Zap, color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Add Policy', href: '/insurance-analyzer', icon: Shield, color: '#e8604c', bg: '#fdf0ee' },
              { label: 'View Reports', href: '/reports', icon: BarChart2, color: '#059669', bg: '#ecfdf5' },
              { label: 'Find Vendor', href: '/vendors', icon: Settings, color: '#0891b2', bg: '#ecfeff' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} to={action.href} className="flex items-center gap-2 font-semibold rounded-xl hover:shadow-sm transition-all" style={{ background: action.bg, color: action.color, padding: '8px 14px', fontSize: '13px' }}>
                  <Icon style={{ width: '14px', height: '14px' }} /> {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ═══ SECTIONS 4–9: TWO-COLUMN LAYOUT ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '32px' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ValuationSnapshot home={home} />
            <MaintenanceOverview events={home.events} />
            <DocumentVaultPreview documents={home.documents} missingDocs={MISSING_DOCS} />
          </div>
          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <InsuranceSummary policies={home.insurancePolicies} />
            <UtilitiesSummary utilities={home.utilities} />
            <TimelinePreview events={home.events} />
          </div>
        </div>

        {/* ═══ MODULE GRID ═══ */}
        <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '16px' }}>All HomeOS Modules</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <Link key={i} to={mod.href} className="flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all rounded-xl" style={{ padding: '14px 8px', background: mod.bg, border: `1px solid ${mod.bg}` }}>
                  <Icon style={{ width: '20px', height: '20px', color: mod.color, marginBottom: '6px' }} />
                  <p className="font-semibold" style={{ fontSize: '12px', color: mod.color }}>{mod.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeProfilePage;
