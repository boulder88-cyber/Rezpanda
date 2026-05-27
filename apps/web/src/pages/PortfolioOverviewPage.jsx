import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, TrendingUp, TrendingDown, DollarSign, Shield,
  Zap, FileText, Wrench, Bell, AlertCircle, CheckCircle2,
  ChevronRight, Plus, Download, BarChart2, Activity,
  ArrowUpRight, ArrowDownRight, MapPin, Star, AlertTriangle,
  Key, ShieldCheck, Layers, Clock, Eye
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════
// PORTFOLIO DATA MODEL
// ═══════════════════════════════════════════════════════════════════════

const PORTFOLIO = [
  {
    id: '1',
    name: 'Primary Home',
    address: '123 Oakwood Lane, St. Simons Island, GA 31522',
    type: 'primary',
    purchaseDate: '2018-06-15',
    purchasePrice: 850000,
    currentValue: 1245000,
    squareFeet: 3240,
    bedrooms: 4,
    bathrooms: 3.5,
    yearBuilt: 2008,
    mortgage: { lender: 'Wells Fargo', balance: 630000, rate: 3.25, payment: 3280, nextPaymentDate: '2026-06-01' },
    insurance: [
      { provider: 'State Farm', type: 'homeowners', premium: 1840, renewalDate: '2026-09-01' },
      { provider: 'USAA', type: 'umbrella', premium: 285, renewalDate: '2026-11-15' },
    ],
    utilities: [
      { type: 'electric', provider: 'Georgia Power', monthlySpend: 142 },
      { type: 'gas', provider: 'Atlanta Gas Light', monthlySpend: 68 },
      { type: 'internet', provider: 'Comcast Xfinity', monthlySpend: 89 },
    ],
    events: [
      { id: 'e1', type: 'maintenance', title: 'HVAC Service', date: '2026-05-15', cost: 285, status: 'completed' },
      { id: 'e2', type: 'maintenance', title: 'Roof Inspection', date: '2026-06-10', cost: 175, status: 'upcoming' },
      { id: 'e3', type: 'maintenance', title: 'Pest Control', date: '2026-03-20', cost: 125, status: 'overdue' },
    ],
    documents: ['Deed', 'Insurance Policy', 'HVAC Warranty'],
    missingDocs: ['Closing Disclosure', 'Survey'],
    valuationHistory: [
      { month: 'Nov', value: 1210000 }, { month: 'Dec', value: 1225000 },
      { month: 'Jan', value: 1228000 }, { month: 'Feb', value: 1230000 },
      { month: 'Mar', value: 1238000 }, { month: 'Apr', value: 1245000 },
    ],
  },
  {
    id: '2',
    name: 'Lake House',
    address: '47 Harbour View Dr, Gainesville, GA 30501',
    type: 'rental',
    purchaseDate: '2021-03-10',
    purchasePrice: 380000,
    currentValue: 445000,
    squareFeet: 2180,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2001,
    mortgage: { lender: 'Chase', balance: 310000, rate: 3.75, payment: 1890, nextPaymentDate: '2026-06-01' },
    insurance: [
      { provider: 'Allstate', type: 'landlord', premium: 1240, renewalDate: '2026-07-01' },
    ],
    utilities: [
      { type: 'electric', provider: 'GA Power', monthlySpend: 98 },
      { type: 'internet', provider: 'AT&T', monthlySpend: 75 },
    ],
    events: [
      { id: 'e4', type: 'maintenance', title: 'Plumbing Repair', date: '2026-04-22', cost: 420, status: 'completed' },
      { id: 'e5', type: 'inspection', title: 'Annual Inspection', date: '2026-06-20', cost: 350, status: 'upcoming' },
    ],
    documents: ['Deed', 'Lease Agreement'],
    missingDocs: ['Flood Certificate', 'Lien Waiver'],
    valuationHistory: [
      { month: 'Nov', value: 420000 }, { month: 'Dec', value: 425000 },
      { month: 'Jan', value: 430000 }, { month: 'Feb', value: 435000 },
      { month: 'Mar', value: 440000 }, { month: 'Apr', value: 445000 },
    ],
  },
];

const TYPE_CONFIG = {
  primary: { label: 'Primary', color: '#1e3a5f', bg: '#eef2f8' },
  rental: { label: 'Rental', color: '#059669', bg: '#ecfdf5' },
  vacation: { label: 'Vacation', color: '#d97706', bg: '#fffbeb' },
  investment: { label: 'Investment', color: '#7c3aed', bg: '#f5f3ff' },
};

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS (spec: MetricCard, SectionHeader, AlertBadge)
// ═══════════════════════════════════════════════════════════════════════

const MetricCard = ({ title, value, trend, icon: Icon, color = '#1e3a5f', bg = '#eef2f8', border = '#c7d7eb', sub }) => (
  <div className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
      <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg }}>
        {Icon && <Icon style={{ width: '16px', height: '16px', color }} />}
      </div>
      {trend !== undefined && (
        <span className="flex items-center gap-0.5 font-semibold" style={{ fontSize: '12px', color: trend >= 0 ? '#059669' : '#dc2626' }}>
          {trend >= 0 ? <ArrowUpRight style={{ width: '12px', height: '12px' }} /> : <ArrowDownRight style={{ width: '12px', height: '12px' }} />}
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
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '17px' }}>{title}</h2>
        {subtitle && <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '1px' }}>{subtitle}</p>}
      </div>
    </div>
    {action && actionHref && (
      <Link to={actionHref} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: '12px', color: '#1e3a5f' }}>
        {action} <ChevronRight style={{ width: '13px', height: '13px' }} />
      </Link>
    )}
  </div>
);

const AlertBadge = ({ status }) => {
  const s = { overdue: ['#fef2f2','#dc2626','Overdue'], upcoming: ['#fffbeb','#d97706','Upcoming'], completed: ['#ecfdf5','#059669','Completed'], risk: ['#fef3c7','#f59e0b','Risk'] }[status] || ['#f8fafc','#94a3b8','—'];
  return <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: s[0], color: s[1], padding: '2px 8px' }}>{s[2]}</span>;
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2: PROPERTY CARD
// ═══════════════════════════════════════════════════════════════════════

const PropertyCard = ({ property }) => {
  const gain = property.currentValue - property.purchasePrice;
  const gainPct = ((gain / property.purchasePrice) * 100).toFixed(1);
  const equity = property.currentValue - property.mortgage.balance;
  const cashFlow = property.type === 'rental'
    ? property.utilities.reduce((s, u) => s + u.monthlySpend, 0) - property.mortgage.payment
    : null;
  const overdue = property.events.filter(e => e.status === 'overdue').length;
  const upcoming = property.events.filter(e => e.status === 'upcoming').length;
  const tc = TYPE_CONFIG[property.type] || TYPE_CONFIG.primary;

  return (
    <div className="bg-white hover:shadow-md transition-all overflow-hidden" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '4px', background: parseFloat(gainPct) >= 0 ? '#059669' : '#dc2626' }} />
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
              <span className="font-semibold rounded-full capitalize" style={{ fontSize: '11px', background: tc.bg, color: tc.color, padding: '2px 8px' }}>{tc.label}</span>
              {overdue > 0 && <span className="font-semibold text-red-600 bg-red-100 rounded-full" style={{ fontSize: '11px', padding: '2px 6px' }}>{overdue} overdue</span>}
            </div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{property.name}</p>
            <p className="text-slate-400 flex items-center gap-1 truncate" style={{ fontSize: '12px', marginTop: '2px' }}>
              <MapPin style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {property.address}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="font-extrabold text-slate-900" style={{ fontSize: '20px', lineHeight: 1 }}>${(property.currentValue / 1000).toFixed(0)}K</p>
            <p className="font-semibold" style={{ fontSize: '12px', color: parseFloat(gainPct) >= 0 ? '#059669' : '#dc2626', marginTop: '2px' }}>
              {parseFloat(gainPct) >= 0 ? '+' : ''}{gainPct}%
            </p>
          </div>
        </div>

        {/* Specs */}
        <p className="text-slate-400" style={{ fontSize: '12px', marginBottom: '12px' }}>
          {property.bedrooms}bd · {property.bathrooms}ba · {property.squareFeet.toLocaleString()} sqft · Built {property.yearBuilt}
        </p>

        {/* Sparkline */}
        <div style={{ height: '50px', marginBottom: '12px', marginLeft: '-4px', marginRight: '-4px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={property.valuationHistory}>
              <defs>
                <linearGradient id={`grad-${property.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#1e3a5f" strokeWidth={2} fill={`url(#grad-${property.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2" style={{ marginBottom: '14px' }}>
          {[
            { label: 'Equity', value: `$${(equity / 1000).toFixed(0)}K`, color: '#059669' },
            { label: 'Mortgage', value: `$${(property.mortgage.balance / 1000).toFixed(0)}K`, color: '#1e3a5f' },
            { label: cashFlow !== null ? 'Cash Flow' : 'Gain', value: cashFlow !== null ? `${cashFlow >= 0 ? '+' : ''}$${cashFlow}/mo` : `+$${(gain / 1000).toFixed(0)}K`, color: '#7c3aed' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-xl text-center" style={{ padding: '8px' }}>
              <p className="font-bold" style={{ fontSize: '13px', color: s.color }}>{s.value}</p>
              <p className="text-slate-400" style={{ fontSize: '10px', marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts row */}
        <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
          {overdue > 0 && <span className="flex items-center gap-1 font-medium text-red-600 bg-red-50 rounded-full" style={{ fontSize: '11px', padding: '3px 8px' }}><AlertCircle style={{ width: '11px', height: '11px' }} /> {overdue} overdue</span>}
          {upcoming > 0 && <span className="flex items-center gap-1 font-medium text-amber-600 bg-amber-50 rounded-full" style={{ fontSize: '11px', padding: '3px 8px' }}><Clock style={{ width: '11px', height: '11px' }} /> {upcoming} upcoming</span>}
          {property.missingDocs.length > 0 && <span className="flex items-center gap-1 font-medium text-slate-500 bg-slate-100 rounded-full" style={{ fontSize: '11px', padding: '3px 8px' }}><FileText style={{ width: '11px', height: '11px' }} /> {property.missingDocs.length} docs missing</span>}
        </div>

        <Link to="/home-profile" className="flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-all rounded-xl" style={{ background: '#eef2f8', color: '#1e3a5f', padding: '10px', fontSize: '13px' }}>
          <Eye style={{ width: '14px', height: '14px' }} /> View Home Profile
        </Link>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3: FINANCIAL OVERVIEW
// ═══════════════════════════════════════════════════════════════════════

const FinancialOverview = ({ portfolio }) => {
  const totalMortgages = portfolio.reduce((s, p) => s + p.mortgage.balance, 0);
  const totalPayments = portfolio.reduce((s, p) => s + p.mortgage.payment, 0);
  const totalPremiums = portfolio.reduce((s, p) => p.insurance.reduce((is, i) => is + i.premium, s), 0);
  const totalUtilities = portfolio.reduce((s, p) => p.utilities.reduce((us, u) => us + u.monthlySpend, s), 0);
  const totalMonthly = totalPayments + totalUtilities + Math.round(totalPremiums / 12);

  const mortgageData = portfolio.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    balance: p.mortgage.balance,
    payment: p.mortgage.payment,
    rate: p.mortgage.rate,
  }));

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Financial Overview" subtitle="Mortgages · Insurance · Utilities" icon={DollarSign} />

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Total Mortgage Debt', value: `$${(totalMortgages / 1000).toFixed(0)}K`, color: '#1e3a5f', bg: '#eef2f8' },
          { label: 'Monthly Payments', value: `$${totalPayments.toLocaleString()}`, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Annual Premiums', value: `$${totalPremiums.toLocaleString()}`, color: '#e8604c', bg: '#fdf0ee' },
          { label: 'Monthly Utilities', value: `$${totalUtilities}/mo`, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl" style={{ padding: '12px', background: s.bg }}>
            <p className="font-extrabold" style={{ fontSize: '18px', color: s.color }}>{s.value}</p>
            <p className="text-slate-500" style={{ fontSize: '11px', marginTop: '3px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mortgage details */}
      <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Mortgage Details</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {portfolio.map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-slate-50 rounded-xl" style={{ padding: '12px 14px' }}>
            <div className="flex-1">
              <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{p.name}</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>{p.mortgage.lender} · {p.mortgage.rate}% rate</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900" style={{ fontSize: '14px' }}>${p.mortgage.balance.toLocaleString()}</p>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>${p.mortgage.payment.toLocaleString()}/mo</p>
            </div>
            <div className="text-right flex-shrink-0" style={{ minWidth: '80px' }}>
              <p className="font-semibold text-slate-500" style={{ fontSize: '12px' }}>Next due</p>
              <p className="text-slate-700" style={{ fontSize: '12px' }}>
                {new Date(p.mortgage.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly spend bar chart */}
      <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Monthly Cost by Property</p>
      <div style={{ height: '100px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={portfolio.map(p => ({
            name: p.name.split(' ')[0],
            mortgage: p.mortgage.payment,
            utilities: p.utilities.reduce((s, u) => s + u.monthlySpend, 0),
          }))} barSize={28}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
            <Bar dataKey="mortgage" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="utilities" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 justify-center" style={{ marginTop: '8px' }}>
        <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '11px' }}><span className="inline-block rounded-sm" style={{ width: '12px', height: '8px', background: '#1e3a5f' }} /> Mortgage</span>
        <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '11px' }}><span className="inline-block rounded-sm" style={{ width: '12px', height: '8px', background: '#f59e0b' }} /> Utilities</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4: MAINTENANCE LOAD
// ═══════════════════════════════════════════════════════════════════════

const MaintenanceLoad = ({ portfolio }) => {
  const allEvents = portfolio.flatMap(p => p.events.map(e => ({ ...e, propertyName: p.name })));
  const overdue = allEvents.filter(e => e.status === 'overdue');
  const upcoming = allEvents.filter(e => e.status === 'upcoming');
  const ytdCost = allEvents.filter(e => e.status === 'completed').reduce((s, e) => s + (e.cost || 0), 0);
  const annualForecast = ytdCost * 2.4; // rough annual projection from YTD

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Maintenance Load" subtitle={`${overdue.length} overdue · ${upcoming.length} upcoming · $${ytdCost.toLocaleString()} YTD`} action="Manage" actionHref="/maintenance-management" icon={Wrench} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Overdue', value: overdue.length, color: overdue.length > 0 ? '#dc2626' : '#059669', bg: overdue.length > 0 ? '#fef2f2' : '#ecfdf5' },
          { label: 'Upcoming', value: upcoming.length, color: '#d97706', bg: '#fffbeb' },
          { label: 'Annual Forecast', value: `$${(annualForecast / 1000).toFixed(1)}K`, color: '#1e3a5f', bg: '#eef2f8' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl text-center" style={{ padding: '12px', background: s.bg }}>
            <p className="font-extrabold" style={{ fontSize: '20px', color: s.color }}>{s.value}</p>
            <p className="text-slate-500" style={{ fontSize: '11px', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overdue items */}
      {overdue.length > 0 && (
        <>
          <p className="font-semibold text-red-600 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '8px' }}>Overdue — Action Required</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            {overdue.map(e => (
              <div key={e.id} className="flex items-center gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 12px' }}>
                <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{e.title}</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>{e.propertyName} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {e.cost && <p className="font-semibold text-slate-700 flex-shrink-0" style={{ fontSize: '12px' }}>${e.cost}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upcoming items */}
      {upcoming.length > 0 && (
        <>
          <p className="font-semibold text-amber-600 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '8px' }}>Upcoming</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {upcoming.map(e => (
              <div key={e.id} className="flex items-center gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px' }}>
                <Clock style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{e.title}</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>{e.propertyName} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {e.cost && <p className="font-semibold text-slate-700 flex-shrink-0" style={{ fontSize: '12px' }}>${e.cost}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5: RISK INDICATORS
// ═══════════════════════════════════════════════════════════════════════

const RiskIndicators = ({ portfolio }) => {
  const risks = [];

  portfolio.forEach(p => {
    // Insurance gaps
    const hasHomeowners = p.insurance.some(i => i.type === 'homeowners' || i.type === 'landlord');
    const hasUmbrella = p.insurance.some(i => i.type === 'umbrella');
    if (!hasHomeowners) risks.push({ type: 'insurance', priority: 'Critical', property: p.name, msg: 'No homeowners or landlord policy found', action: '/insurance-analyzer' });
    if (!hasUmbrella && p.type === 'rental') risks.push({ type: 'insurance', priority: 'High', property: p.name, msg: 'No umbrella liability policy — rental properties need higher limits', action: '/insurance-analyzer' });

    // Expiring policies
    const today = new Date();
    p.insurance.forEach(i => {
      const days = Math.ceil((new Date(i.renewalDate) - today) / 86400000);
      if (days >= 0 && days <= 60) risks.push({ type: 'renewal', priority: 'High', property: p.name, msg: `${i.provider} ${i.type} policy renews in ${days} days`, action: '/insurance-analyzer' });
    });

    // Missing docs
    if (p.missingDocs.length > 0) risks.push({ type: 'documents', priority: 'Medium', property: p.name, msg: `${p.missingDocs.length} missing documents: ${p.missingDocs.join(', ')}`, action: '/documents' });

    // Overdue maintenance
    const overdue = p.events.filter(e => e.status === 'overdue');
    if (overdue.length > 0) risks.push({ type: 'maintenance', priority: 'Medium', property: p.name, msg: `${overdue.length} overdue maintenance item${overdue.length > 1 ? 's' : ''}`, action: '/maintenance-management' });
  });

  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const sorted = risks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const priorityStyles = {
    Critical: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', pillBg: '#fee2e2' },
    High: { bg: '#fff7ed', border: '#fed7aa', color: '#f97316', pillBg: '#ffedd5' },
    Medium: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', pillBg: '#fef3c7' },
    Low: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', pillBg: '#f1f5f9' },
  };

  const typeIcons = { insurance: Shield, renewal: Bell, documents: FileText, maintenance: Wrench };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Risk Indicators" subtitle={`${sorted.length} items across ${portfolio.length} properties`} icon={AlertTriangle} />

      {sorted.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px' }}>
          <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
          <p className="font-semibold text-green-700" style={{ fontSize: '14px' }}>No active risks detected across your portfolio.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map((risk, i) => {
            const ps = priorityStyles[risk.priority];
            const Icon = typeIcons[risk.type] || AlertCircle;
            return (
              <div key={i} className="flex items-start gap-3" style={{ background: ps.bg, border: `1px solid ${ps.border}`, borderRadius: '10px', padding: '12px 14px' }}>
                <Icon style={{ width: '14px', height: '14px', color: ps.color, flexShrink: 0, marginTop: '1px' }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                    <span className="font-bold rounded-full" style={{ fontSize: '11px', background: ps.pillBg, color: ps.color, padding: '2px 7px' }}>{risk.priority}</span>
                    <span className="text-slate-400" style={{ fontSize: '12px' }}>{risk.property}</span>
                  </div>
                  <p className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{risk.msg}</p>
                </div>
                <Link to={risk.action} className="font-semibold rounded-lg hover:opacity-80 transition-opacity flex-shrink-0" style={{ fontSize: '11px', color: ps.color, background: ps.pillBg, padding: '4px 10px' }}>
                  Fix →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Risk score */}
      <div className="flex items-center gap-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', marginTop: '16px' }}>
        <div>
          <p className="font-semibold text-slate-600" style={{ fontSize: '13px' }}>Portfolio Risk Score</p>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Based on insurance, docs, and maintenance gaps</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-extrabold" style={{ fontSize: '24px', lineHeight: 1, color: sorted.length === 0 ? '#059669' : sorted.some(r => r.priority === 'Critical') ? '#dc2626' : '#d97706' }}>
            {sorted.length === 0 ? 'A' : sorted.some(r => r.priority === 'Critical') ? 'D' : sorted.some(r => r.priority === 'High') ? 'C' : 'B'}
          </p>
          <p className="text-slate-400" style={{ fontSize: '11px' }}>{sorted.length} issues</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const PortfolioOverviewPage = () => {
  const portfolio = PORTFOLIO;

  // Section 1: Portfolio Metrics
  const totalValue = portfolio.reduce((s, p) => s + p.currentValue, 0);
  const totalPurchased = portfolio.reduce((s, p) => s + p.purchasePrice, 0);
  const totalEquity = portfolio.reduce((s, p) => s + (p.currentValue - p.mortgage.balance), 0);
  const totalMonthly = portfolio.reduce((s, p) => s + p.mortgage.payment + p.utilities.reduce((us, u) => us + u.monthlySpend, 0), 0);
  const totalAlerts = portfolio.reduce((s, p) => s + p.events.filter(e => e.status === 'overdue' || e.status === 'upcoming').length, 0);
  const appreciation = ((totalValue - totalPurchased) / totalPurchased * 100).toFixed(1);

  return (
    <>
      <Helmet><title>Portfolio Overview — CasaCEO</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Portfolio Overview</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', flexShrink: 0 }}>
                <Layers style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Portfolio Overview</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {portfolio.length} properties · Multi-property intelligence
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white hover:opacity-90 rounded-xl transition-all" style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Property
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ SECTION 1: PORTFOLIO METRICS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '32px' }}>
          <MetricCard title="Total Portfolio Value" value={`$${(totalValue / 1000000).toFixed(2)}M`} trend={parseFloat(appreciation)} icon={TrendingUp} color="#059669" bg="#ecfdf5" border="#a7f3d0" sub={`+$${((totalValue - totalPurchased) / 1000).toFixed(0)}K appreciation`} />
          <MetricCard title="Total Owner Equity" value={`$${(totalEquity / 1000).toFixed(0)}K`} icon={Home} color="#1e3a5f" bg="#eef2f8" border="#c7d7eb" sub={`${((totalEquity / totalValue) * 100).toFixed(0)}% of total value`} />
          <MetricCard title="Monthly Cost" value={`$${totalMonthly.toLocaleString()}`} icon={DollarSign} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" sub={`across ${portfolio.length} properties`} />
          <MetricCard title="Active Alerts" value={totalAlerts} icon={Bell} color={totalAlerts > 0 ? '#dc2626' : '#059669'} bg={totalAlerts > 0 ? '#fef2f2' : '#ecfdf5'} border={totalAlerts > 0 ? '#fecaca' : '#a7f3d0'} sub={portfolio.reduce((s, p) => s + p.events.filter(e => e.status === 'overdue').length, 0) + ' overdue'} />
        </div>

        {/* ═══ SECTION 2: PROPERTY GRID ═══ */}
        <div style={{ marginBottom: '32px' }}>
          <SectionHeader title="Your Properties" subtitle={`${portfolio.length} properties tracked`} icon={Home} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolio.map(p => <PropertyCard key={p.id} property={p} />)}
            <Link to="/home-profile" className="bg-white flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-md transition-all group" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', minHeight: '280px' }}>
              <div className="flex items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-slate-200 transition-colors" style={{ width: '48px', height: '48px', marginBottom: '12px' }}>
                <Plus style={{ width: '22px', height: '22px' }} />
              </div>
              <p className="font-semibold" style={{ fontSize: '15px' }}>Add Property</p>
              <p className="text-slate-300" style={{ fontSize: '12px', marginTop: '4px' }}>Expand your portfolio</p>
            </Link>
          </div>
        </div>

        {/* ═══ SECTIONS 3–5: TWO-COLUMN LAYOUT ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 3: Financial Overview */}
            <FinancialOverview portfolio={portfolio} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 4: Maintenance Load */}
            <MaintenanceLoad portfolio={portfolio} />
            {/* Section 5: Risk Indicators */}
            <RiskIndicators portfolio={portfolio} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioOverviewPage;
