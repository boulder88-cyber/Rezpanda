import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { TrendingUp, RefreshCw, ChevronRight, DollarSign, Home, BarChart2 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DAILY_VALUES = [
  { day: 'May 20', value: 1238000 }, { day: 'May 21', value: 1240000 },
  { day: 'May 22', value: 1241000 }, { day: 'May 23', value: 1242500 },
  { day: 'May 24', value: 1243000 }, { day: 'May 25', value: 1244000 },
  { day: 'May 26', value: 1245000 }, { day: 'May 27', value: 1245000 },
];

const COMPS = [
  { address: '145 Sea Island Pkwy', sqft: 3100, beds: 4, baths: 3, sold: '$1,198,000', date: 'Apr 2026' },
  { address: '89 Neptune Dr', sqft: 3300, beds: 4, baths: 3.5, sold: '$1,255,000', date: 'Mar 2026' },
  { address: '220 Ocean Blvd', sqft: 3050, beds: 3, baths: 3, sold: '$1,185,000', date: 'Feb 2026' },
];

const SCENARIOS = [
  { label: 'Refinance Now', rate: '6.75%', monthly: 3180, totalInterest: '$465K', equity5yr: '$780K', rec: 'Rates elevated — consider waiting' },
  { label: 'Sell in 1 Year', value: '$1,296K', gain: '+$51K', netAfterCosts: '$1,208K', rec: 'Strong market in your area' },
  { label: 'Hold 5 Years', projected: '$1,498K', equity: '$980K', totalReturn: '$253K', rec: 'Best long-term outcome' },
];

const ValueEnginePage = () => {
  const currentValue = 1245000;
  const mortgageBalance = 630000;
  const equity = currentValue - mortgageBalance;
  const equityPct = ((equity / currentValue) * 100).toFixed(0);
  const [lastUpdated] = useState('Just now');

  return (
    <>
      <Helmet><title>Value Engine — HomeOS Automated Valuation</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/valuation-equity" className="hover:text-slate-600">Valuation</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Value Engine</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: '#059669' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Value Engine</h1>
                <div className="flex items-center gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Auto-updating · Last refreshed: {lastUpdated}</p>
                </div>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 600, color: '#1e3a5f', cursor: 'pointer' }}>
              <RefreshCw style={{ width: '14px', height: '14px' }} /> Refresh
            </button>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Current Value', value: `$${(currentValue / 1000).toFixed(0)}K`, sub: '+$7K this week', color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
            { label: 'Owner Equity', value: `$${(equity / 1000).toFixed(0)}K`, sub: `${equityPct}% ownership`, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
            { label: 'Mortgage Balance', value: `$${(mortgageBalance / 1000).toFixed(0)}K`, sub: '$3,106 paid this month', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
            { label: '12mo Appreciation', value: '+5.5%', sub: 'vs +4.2% neighborhood', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map((s, i) => (
            <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>{s.label}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 7-day chart */}
          <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <p className="font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '16px' }}>7-Day Value Trend</p>
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_VALUES}>
                  <defs>
                    <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Value']} />
                  <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} fill="url(#vGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Equity meter */}
          <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <p className="font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '16px' }}>Equity Meter</p>
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Equity: ${(equity / 1000).toFixed(0)}K ({equityPct}%)</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#7c3aed' }}>Mortgage: ${(mortgageBalance / 1000).toFixed(0)}K</span>
              </div>
              <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${equityPct}%`, background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: '999px' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Purchase Price', value: '$850K' }, { label: 'Total Appreciation', value: '+$395K' },
                { label: 'LTV Ratio', value: '50.6%' }, { label: 'Refinance Readiness', value: 'Strong' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: '9px', background: '#f8fafc' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market comps */}
          <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <p className="font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '14px' }}>Recent Market Comps</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COMPS.map((comp, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <Home style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />
                  <div className="flex-1">
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{comp.address}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{comp.sqft.toLocaleString()} sqft · {comp.beds}bd · {comp.baths}ba · {comp.date}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>{comp.sold}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sell vs hold */}
          <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <p className="font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '14px' }}>Sell vs Hold Analysis</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SCENARIOS.map((s, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: i === 2 ? '#eef2f8' : '#f8fafc', border: `1px solid ${i === 2 ? '#c7d7eb' : '#f1f5f9'}` }}>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{s.label}</p>
                    {i === 2 && <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e3a5f', background: '#c7d7eb', padding: '1px 6px', borderRadius: '999px' }}>Recommended</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{s.rec}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ValueEnginePage;
