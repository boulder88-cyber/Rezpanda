import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, Home, BarChart2,
  ChevronRight, Download, Plus, Star, Lightbulb, ArrowUpRight,
  ArrowDownRight, RefreshCw, Calendar, Shield, Hammer,
  Target, Activity, Info, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, CartesianGrid
} from 'recharts';

// ═══════════════════════════════════════════════════════════════════════
// DATA MODEL (spec-aligned)
// ═══════════════════════════════════════════════════════════════════════

const PROPERTIES = [
  {
    id: '1',
    name: 'Primary Home',
    address: '123 Oakwood Lane, St. Simons Island, GA',
    purchaseDate: '2018-06-15',
    purchasePrice: 850000,
    currentValue: 1245000,
    mortgageBalance: 630000,
    mortgageRate: 3.25,
    monthlyPayment: 3280,
    valuationHistory: [
      { month: 'Jun 25', value: 1180000, source: 'AVM' },
      { month: 'Jul 25', value: 1188000, source: 'AVM' },
      { month: 'Aug 25', value: 1195000, source: 'AVM' },
      { month: 'Sep 25', value: 1202000, source: 'HomeOS' },
      { month: 'Oct 25', value: 1210000, source: 'MLS' },
      { month: 'Nov 25', value: 1218000, source: 'AVM' },
      { month: 'Dec 25', value: 1225000, source: 'MLS' },
      { month: 'Jan 26', value: 1228000, source: 'AVM' },
      { month: 'Feb 26', value: 1230000, source: 'HomeOS' },
      { month: 'Mar 26', value: 1235000, source: 'AVM' },
      { month: 'Apr 26', value: 1240000, source: 'AVM' },
      { month: 'May 26', value: 1245000, source: 'HomeOS' },
    ],
    amortization: (() => {
      const schedule = [];
      let balance = 630000;
      const rate = 3.25 / 100 / 12;
      const payment = 3280;
      for (let i = 1; i <= 12; i++) {
        const interest = balance * rate;
        const principal = payment - interest;
        balance -= principal;
        schedule.push({ month: `Mo ${i}`, principal: Math.round(principal), interest: Math.round(interest), balance: Math.round(balance) });
      }
      return schedule;
    })(),
    renovations: [
      { year: 2019, name: 'Kitchen Remodel', cost: 45000, valueAdded: 38000, roi: 84 },
      { year: 2021, name: 'Master Bath Update', cost: 28000, valueAdded: 20000, roi: 71 },
      { year: 2022, name: 'New HVAC System', cost: 12000, valueAdded: 10800, roi: 90 },
      { year: 2023, name: 'Deck Addition', cost: 22000, valueAdded: 14000, roi: 64 },
      { year: 2024, name: 'Smart Home Upgrade', cost: 8500, valueAdded: 6000, roi: 71 },
    ],
    neighborhoodTrend: [
      { month: 'Jun 25', neighborhood: 1100000, subject: 1180000, benchmark: 1050000 },
      { month: 'Sep 25', neighborhood: 1115000, subject: 1202000, benchmark: 1065000 },
      { month: 'Dec 25', neighborhood: 1130000, subject: 1225000, benchmark: 1080000 },
      { month: 'Mar 26', neighborhood: 1145000, subject: 1235000, benchmark: 1095000 },
      { month: 'May 26', neighborhood: 1158000, subject: 1245000, benchmark: 1108000 },
    ],
    confidenceScore: 88,
    sources: [
      { name: 'Zillow AVM', value: 1238000, confidence: 82 },
      { name: 'Redfin AVM', value: 1251000, confidence: 79 },
      { name: 'HomeOS Model', value: 1245000, confidence: 88 },
      { name: 'Last MLS Sale (comps)', value: 1249000, confidence: 91 },
    ],
  },
  {
    id: '2',
    name: 'Lake House',
    address: '47 Harbour View Dr, Gainesville, GA',
    purchaseDate: '2021-03-10',
    purchasePrice: 380000,
    currentValue: 445000,
    mortgageBalance: 310000,
    mortgageRate: 3.75,
    monthlyPayment: 1890,
    valuationHistory: [
      { month: 'Jun 25', value: 418000 }, { month: 'Aug 25', value: 425000 },
      { month: 'Oct 25', value: 430000 }, { month: 'Dec 25', value: 436000 },
      { month: 'Feb 26', value: 440000 }, { month: 'Apr 26', value: 445000 },
    ],
    amortization: (() => {
      const schedule = [];
      let balance = 310000;
      const rate = 3.75 / 100 / 12;
      const payment = 1890;
      for (let i = 1; i <= 12; i++) {
        const interest = balance * rate;
        const principal = payment - interest;
        balance -= principal;
        schedule.push({ month: `Mo ${i}`, principal: Math.round(principal), interest: Math.round(interest), balance: Math.round(balance) });
      }
      return schedule;
    })(),
    renovations: [
      { year: 2022, name: 'Dock Rebuild', cost: 18000, valueAdded: 20000, roi: 111 },
      { year: 2024, name: 'Interior Refresh', cost: 12000, valueAdded: 9000, roi: 75 },
    ],
    neighborhoodTrend: [
      { month: 'Jun 25', neighborhood: 400000, subject: 418000, benchmark: 380000 },
      { month: 'Dec 25', neighborhood: 420000, subject: 436000, benchmark: 400000 },
      { month: 'May 26', neighborhood: 435000, subject: 445000, benchmark: 415000 },
    ],
    confidenceScore: 81,
    sources: [
      { name: 'Zillow AVM', value: 442000, confidence: 77 },
      { name: 'HomeOS Model', value: 445000, confidence: 81 },
      { name: 'Last MLS Sale (comps)', value: 448000, confidence: 86 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const SectionHeader = ({ title, subtitle, icon: Icon, action, actionHref }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
    <div className="flex items-center gap-2">
      {Icon && <Icon style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
      <div>
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '17px' }}>{title}</h2>
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

const ConfidenceMeter = ({ score, source }) => {
  const color = score >= 85 ? '#059669' : score >= 70 ? '#d97706' : '#dc2626';
  const bg = score >= 85 ? '#ecfdf5' : score >= 70 ? '#fffbeb' : '#fef2f2';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full overflow-hidden" style={{ height: '6px' }}>
        <div className="rounded-full" style={{ width: `${score}%`, height: '6px', background: color }} />
      </div>
      <span className="font-semibold rounded-full flex-shrink-0" style={{ fontSize: '11px', color, background: bg, padding: '2px 8px' }}>
        {score}% Confidence
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 1: VALUATION TREND
// ═══════════════════════════════════════════════════════════════════════

const ValuationTrend = ({ property }) => {
  const latest = property.valuationHistory[property.valuationHistory.length - 1];
  const first = property.valuationHistory[0];
  const change = ((latest.value - first.value) / first.value * 100).toFixed(1);
  const changeAmt = latest.value - first.value;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-100" style={{ padding: '10px 14px' }}>
        <p className="font-semibold text-slate-500" style={{ fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        <p className="font-bold text-slate-900" style={{ fontSize: '15px' }}>${payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="12-Month Valuation Trend" subtitle={`${property.name} · Updated May 2026`} icon={TrendingUp} action="Full History" actionHref="/home-valuation" />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '16px' }}>
        <div className="bg-slate-50 rounded-xl" style={{ padding: '12px' }}>
          <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>Current Value</p>
          <p className="font-extrabold text-slate-900" style={{ fontSize: '20px', lineHeight: 1 }}>${(latest.value / 1000).toFixed(0)}K</p>
          <p className="font-semibold" style={{ fontSize: '11px', color: parseFloat(change) >= 0 ? '#059669' : '#dc2626', marginTop: '3px' }}>
            {parseFloat(change) >= 0 ? '+' : ''}{change}% (12mo)
          </p>
        </div>
        <div className="rounded-xl" style={{ padding: '12px', background: '#ecfdf5' }}>
          <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>12mo Gain</p>
          <p className="font-extrabold text-green-700" style={{ fontSize: '20px', lineHeight: 1 }}>+${(changeAmt / 1000).toFixed(0)}K</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '3px' }}>unrealized</p>
        </div>
        <div className="rounded-xl" style={{ padding: '12px', background: '#eef2f8' }}>
          <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>Purchase Price</p>
          <p className="font-extrabold" style={{ fontSize: '20px', lineHeight: 1, color: '#1e3a5f' }}>${(property.purchasePrice / 1000).toFixed(0)}K</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '3px' }}>{new Date(property.purchaseDate).getFullYear()}</p>
        </div>
      </div>

      {/* Confidence */}
      <div style={{ marginBottom: '16px' }}>
        <ConfidenceMeter score={property.confidenceScore} />
      </div>

      {/* Chart */}
      <div style={{ height: '160px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={property.valuationHistory}>
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#valGrad)" dot={false} activeDot={{ r: 4, fill: '#1e3a5f' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Source comparison */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Source Comparison</p>
        <div className="grid grid-cols-2 gap-2">
          {property.sources.map((src, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl" style={{ padding: '8px 10px' }}>
              <div>
                <p className="font-medium text-slate-700" style={{ fontSize: '12px' }}>{src.name}</p>
                <p className="text-slate-400" style={{ fontSize: '11px' }}>{src.confidence}% confidence</p>
              </div>
              <p className="font-bold text-slate-900" style={{ fontSize: '13px' }}>${(src.value / 1000).toFixed(0)}K</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2: EQUITY BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════

const EquityBreakdown = ({ property }) => {
  const equity = property.currentValue - property.mortgageBalance;
  const equityPct = ((equity / property.currentValue) * 100).toFixed(0);
  const ltv = ((property.mortgageBalance / property.currentValue) * 100).toFixed(0);
  const totalInterestPaid = property.amortization.reduce((s, m) => s + m.interest, 0);
  const totalPrincipalPaid = property.amortization.reduce((s, m) => s + m.principal, 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Equity Breakdown" subtitle="Ownership stake · Mortgage structure" icon={Home} />

      {/* Equity visual */}
      <div style={{ marginBottom: '20px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
          <span className="font-semibold text-slate-700" style={{ fontSize: '13px' }}>Owner Equity</span>
          <span className="font-bold text-green-600" style={{ fontSize: '13px' }}>${(equity / 1000).toFixed(0)}K ({equityPct}%)</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: '12px', background: '#e2e8f0' }}>
          <div className="rounded-full h-full" style={{ width: `${equityPct}%`, background: 'linear-gradient(90deg, #059669, #34d399)' }} />
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
          <span className="text-slate-400" style={{ fontSize: '11px' }}>Mortgage Balance: ${(property.mortgageBalance / 1000).toFixed(0)}K</span>
          <span className="text-slate-400" style={{ fontSize: '11px' }}>LTV: {ltv}%</span>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Home Value', value: `$${(property.currentValue / 1000).toFixed(0)}K`, color: '#1e3a5f', bg: '#eef2f8' },
          { label: 'Owner Equity', value: `$${(equity / 1000).toFixed(0)}K`, color: '#059669', bg: '#ecfdf5' },
          { label: 'Mortgage Balance', value: `$${(property.mortgageBalance / 1000).toFixed(0)}K`, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Monthly Payment', value: `$${property.monthlyPayment.toLocaleString()}`, color: '#d97706', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl" style={{ padding: '12px', background: s.bg }}>
            <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>{s.label}</p>
            <p className="font-extrabold" style={{ fontSize: '18px', lineHeight: 1, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Principal vs Interest chart */}
      <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Principal vs Interest — Next 12 Payments</p>
      <div style={{ height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={property.amortization} barSize={14}>
            <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
            <Bar dataKey="principal" fill="#059669" radius={[3, 3, 0, 0]} name="Principal" stackId="a" />
            <Bar dataKey="interest" fill="#e2e8f0" radius={[3, 3, 0, 0]} name="Interest" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4" style={{ marginTop: '8px' }}>
        {[['#059669', 'Principal'], ['#e2e8f0', 'Interest']].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '11px' }}>
            <span style={{ width: '10px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3: MARKET COMPARISON
// ═══════════════════════════════════════════════════════════════════════

const MarketComparison = ({ property }) => {
  const benchmarks = [
    { name: 'Your Property', pct: 5.5, color: '#1e3a5f', emoji: '🏠' },
    { name: 'Neighborhood Avg', pct: 4.2, color: '#059669', emoji: '🏘️' },
    { name: 'National RE Index', pct: 4.0, color: '#7c3aed', emoji: '🌎' },
    { name: 'S&P 500 (1yr)', pct: 11.2, color: '#d97706', emoji: '📈' },
    { name: 'Savings Account', pct: 0.5, color: '#94a3b8', emoji: '🏦' },
  ];
  const max = Math.max(...benchmarks.map(b => b.pct));
  const outperforming = benchmarks[0].pct > benchmarks[2].pct;

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Market Comparison" subtitle="Your property vs neighborhood and national benchmarks" icon={BarChart2} />

      {outperforming && (
        <div className="flex items-center gap-2 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 12px', marginBottom: '16px' }}>
          <Star style={{ width: '14px', height: '14px', color: '#059669', flexShrink: 0 }} />
          <p className="font-medium text-green-700" style={{ fontSize: '13px' }}>Your property is outperforming the national real estate average.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {benchmarks.map((b, i) => (
          <div key={i}>
            <div className="flex items-center justify-between" style={{ marginBottom: '5px' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '16px' }}>{b.emoji}</span>
                <span className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{b.name}</span>
                {i === 0 && <span className="font-semibold text-slate-500 bg-slate-100 rounded-full" style={{ fontSize: '11px', padding: '1px 6px' }}>You</span>}
              </div>
              <span className="font-bold" style={{ fontSize: '13px', color: b.color }}>+{b.pct}%</span>
            </div>
            <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '8px' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(b.pct / max) * 100}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Neighborhood trend chart */}
      <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Property vs Neighborhood Trend</p>
      <div style={{ height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={property.neighborhoodTrend}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} />
            <Line type="monotone" dataKey="subject" stroke="#1e3a5f" strokeWidth={2.5} dot={false} name="Your Property" />
            <Line type="monotone" dataKey="neighborhood" stroke="#059669" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Neighborhood Avg" />
            <Line type="monotone" dataKey="benchmark" stroke="#e2e8f0" strokeWidth={1.5} dot={false} name="National Index" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4" style={{ marginTop: '8px' }}>
        {[['#1e3a5f', 'Your Property', '—'], ['#059669', 'Neighborhood', '- -'], ['#e2e8f0', 'National', '- -']].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '11px' }}>
            <span style={{ width: '12px', height: '2px', background: color, display: 'inline-block' }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4: RENOVATION ROI
// ═══════════════════════════════════════════════════════════════════════

const RenovationROI = ({ property }) => {
  const totalSpent = property.renovations.reduce((s, r) => s + r.cost, 0);
  const totalAdded = property.renovations.reduce((s, r) => s + r.valueAdded, 0);
  const avgRoi = Math.round(property.renovations.reduce((s, r) => s + r.roi, 0) / property.renovations.length);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Renovation ROI" subtitle="Past improvements and their value impact" icon={Hammer} />

      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Total Invested', value: `$${(totalSpent / 1000).toFixed(0)}K`, color: '#1e3a5f', bg: '#eef2f8' },
          { label: 'Value Added', value: `+$${(totalAdded / 1000).toFixed(0)}K`, color: '#059669', bg: '#ecfdf5' },
          { label: 'Avg ROI', value: `${avgRoi}%`, color: '#d97706', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl text-center" style={{ padding: '12px', background: s.bg }}>
            <p className="font-extrabold" style={{ fontSize: '18px', color: s.color }}>{s.value}</p>
            <p className="text-slate-500" style={{ fontSize: '11px', marginTop: '3px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {property.renovations.map((r, i) => (
          <div key={i} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="flex-shrink-0 font-bold text-slate-400" style={{ fontSize: '12px', width: '32px' }}>{r.year}</div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{r.name}</p>
              <div className="flex items-center gap-3 text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>
                <span>Cost: ${r.cost.toLocaleString()}</span>
                <span className="text-green-600">+${r.valueAdded.toLocaleString()} added</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-slate-100 rounded-full overflow-hidden" style={{ width: '48px', height: '5px' }}>
                <div style={{ width: `${Math.min(r.roi, 100)}%`, height: '5px', background: r.roi >= 80 ? '#059669' : r.roi >= 60 ? '#d97706' : '#dc2626', borderRadius: '9999px' }} />
              </div>
              <span className="font-bold" style={{ fontSize: '12px', color: r.roi >= 80 ? '#059669' : r.roi >= 60 ? '#d97706' : '#dc2626', minWidth: '36px', textAlign: 'right' }}>{r.roi}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', marginTop: '12px' }}>
        <Lightbulb style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
        <p className="text-amber-700" style={{ fontSize: '12px' }}>Kitchen and HVAC renovations delivered the strongest returns. Consider bathroom updates as the next high-ROI investment.</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5: FORECASTING
// ═══════════════════════════════════════════════════════════════════════

const Forecasting = ({ property }) => {
  const current = property.currentValue;
  const rates = [
    { label: 'Conservative (2%)', rate: 0.02, color: '#94a3b8' },
    { label: 'Base Case (4%)', rate: 0.04, color: '#1e3a5f' },
    { label: 'Optimistic (7%)', rate: 0.07, color: '#059669' },
  ];

  const years = [0, 1, 2, 3, 5];
  const forecastData = years.map(yr => {
    const row = { year: yr === 0 ? 'Now' : `${yr}yr` };
    rates.forEach(r => { row[r.label] = Math.round(current * Math.pow(1 + r.rate, yr)); });
    return row;
  });

  const equity1yr = rates[1].rate;
  const projectedValue1yr = Math.round(current * (1 + equity1yr));
  const projectedEquity1yr = projectedValue1yr - property.mortgageBalance;
  const confidenceRange = { low: Math.round(projectedValue1yr * 0.96), high: Math.round(projectedValue1yr * 1.04) };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="1-Year Forecast" subtitle="Value projection with confidence range" icon={Target} />

      {/* Projected summary */}
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '20px' }}>
        <div className="rounded-xl" style={{ padding: '12px', background: '#eef2f8' }}>
          <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>Projected Value</p>
          <p className="font-extrabold" style={{ fontSize: '18px', lineHeight: 1, color: '#1e3a5f' }}>${(projectedValue1yr / 1000).toFixed(0)}K</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '3px' }}>at 4% growth</p>
        </div>
        <div className="rounded-xl" style={{ padding: '12px', background: '#ecfdf5' }}>
          <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>Projected Equity</p>
          <p className="font-extrabold text-green-700" style={{ fontSize: '18px', lineHeight: 1 }}>${(projectedEquity1yr / 1000).toFixed(0)}K</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '3px' }}>after mortgage</p>
        </div>
        <div className="rounded-xl" style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>Confidence Range</p>
          <p className="font-bold text-slate-700" style={{ fontSize: '14px', lineHeight: 1 }}>${(confidenceRange.low / 1000).toFixed(0)}K – ${(confidenceRange.high / 1000).toFixed(0)}K</p>
          <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '3px' }}>±4% band</p>
        </div>
      </div>

      {/* Scenario chart */}
      <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>5-Year Scenario Projection</p>
      <div style={{ height: '150px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n.split(' ')[0]]} />
            {rates.map(r => (
              <Line key={r.label} type="monotone" dataKey={r.label} stroke={r.color} strokeWidth={r.label.includes('Base') ? 2.5 : 1.5}
                strokeDasharray={r.label.includes('Base') ? '0' : '5 5'} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4" style={{ marginTop: '8px' }}>
        {rates.map(r => (
          <span key={r.label} className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '11px' }}>
            <span style={{ width: '12px', height: '2px', background: r.color, display: 'inline-block' }} /> {r.label.split(' ')[0]}
          </span>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', marginTop: '12px' }}>
        <Info style={{ width: '13px', height: '13px', color: '#94a3b8', flexShrink: 0, marginTop: '1px' }} />
        <p className="text-slate-400" style={{ fontSize: '12px' }}>Projections are illustrative only. Past appreciation does not guarantee future results. Consult a real estate professional before major decisions.</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const ValuationEquityPage = () => {
  const [selectedId, setSelectedId] = useState('1');
  const property = PROPERTIES.find(p => p.id === selectedId) || PROPERTIES[0];

  const equity = property.currentValue - property.mortgageBalance;
  const totalGain = property.currentValue - property.purchasePrice;
  const gainPct = ((totalGain / property.purchasePrice) * 100).toFixed(1);
  const yrsOwned = ((new Date() - new Date(property.purchaseDate)) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
  const annualRate = (Math.pow(property.currentValue / property.purchasePrice, 1 / parseFloat(yrsOwned)) - 1) * 100;

  return (
    <>
      <Helmet><title>Valuation & Equity — CasaCEO</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Valuation & Equity</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', flexShrink: 0 }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: '#059669' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Valuation & Equity</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>Financial intelligence layer · {PROPERTIES.length} properties</p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Property selector */}
              <div className="flex gap-1 bg-slate-100 rounded-xl" style={{ padding: '4px' }}>
                {PROPERTIES.map(p => (
                  <button key={p.id} onClick={() => setSelectedId(p.id)}
                    className="font-medium rounded-lg transition-all"
                    style={{ padding: '6px 14px', fontSize: '13px', background: selectedId === p.id ? 'white' : 'transparent', color: selectedId === p.id ? '#1e3a5f' : '#64748b', boxShadow: selectedId === p.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                    {p.name}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* ── TOP METRICS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '32px' }}>
          {[
            { label: 'Current Value', value: `$${(property.currentValue / 1000).toFixed(0)}K`, sub: `${property.confidenceScore}% confidence`, icon: Home, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
            { label: 'Owner Equity', value: `$${(equity / 1000).toFixed(0)}K`, sub: `${((equity / property.currentValue) * 100).toFixed(0)}% of value`, icon: TrendingUp, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', trend: parseFloat(gainPct) },
            { label: 'Total Appreciation', value: `+$${(totalGain / 1000).toFixed(0)}K`, sub: `${gainPct}% since purchase`, icon: ArrowUpRight, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
            { label: 'Annual Rate', value: `${annualRate.toFixed(1)}%/yr`, sub: `over ${yrsOwned} years`, icon: Activity, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg }}>
                    <Icon style={{ width: '16px', height: '16px', color: s.color }} />
                  </div>
                  {s.trend !== undefined && (
                    <span className="flex items-center gap-0.5 font-semibold" style={{ fontSize: '12px', color: s.trend >= 0 ? '#059669' : '#dc2626' }}>
                      {s.trend >= 0 ? <ArrowUpRight style={{ width: '12px', height: '12px' }} /> : <ArrowDownRight style={{ width: '12px', height: '12px' }} />}
                      {Math.abs(s.trend)}%
                    </span>
                  )}
                </div>
                <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>{s.value}</p>
                <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
                <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ═══ SECTIONS 1–5: TWO-COLUMN LAYOUT ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Valuation Trend */}
            <ValuationTrend property={property} />
            {/* Section 3: Market Comparison */}
            <MarketComparison property={property} />
          </div>
          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 2: Equity Breakdown */}
            <EquityBreakdown property={property} />
            {/* Section 4: Renovation ROI */}
            <RenovationROI property={property} />
            {/* Section 5: Forecasting */}
            <Forecasting property={property} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ValuationEquityPage;
