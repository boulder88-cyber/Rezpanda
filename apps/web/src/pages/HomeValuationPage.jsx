import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  TrendingUp, TrendingDown, Home, DollarSign, BarChart2,
  ArrowUpRight, ArrowDownRight, Plus, Edit2, Check, X,
  AlertCircle, CheckCircle2, Minus, ShieldCheck, Target,
  Star, Lightbulb, Calculator, MapPin, Calendar, ChevronRight,
  Download, RefreshCw, Info, Hammer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════
// PORTFOLIO SUMMARY — polished
// ═══════════════════════════════════════════════════════════════════════

const PortfolioSummary = ({ properties }) => {
  const totalValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalPurchased = properties.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  const totalGain = totalValue - totalPurchased;
  const totalGainPct = totalPurchased > 0 ? ((totalGain / totalPurchased) * 100).toFixed(1) : 0;
  const projectedNextYear = properties.reduce((s, p) => s + ((p.currentValue || 0) * 1.04), 0);
  const totalEquity = properties.reduce((s, p) => s + ((p.currentValue || 0) - (p.mortgageBalance || 0)), 0);

  return (
    <div className="relative overflow-hidden" style={{ background: '#1e3a5f', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
      <div className="absolute top-0 right-0 rounded-full opacity-5" style={{ width: '300px', height: '300px', background: '#e8604c', transform: 'translate(30%,-30%)' }} />
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div>
            <p className="text-blue-200 font-medium uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '8px' }}>Portfolio Overview</p>
            <h1 className="font-semibold text-white" style={{ fontSize: '28px', lineHeight: '1.2', marginBottom: '8px' }}>Home Valuations</h1>
            <p className="text-blue-200" style={{ fontSize: '15px', maxWidth: '400px', lineHeight: '1.6' }}>
              Your real estate portfolio — visualized, optimized, and tracked automatically.
            </p>
            <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#86efac' }} />
              <p className="text-blue-200" style={{ fontSize: '12px' }}>Your homes as a living balance sheet.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Portfolio', value: `$${(totalValue/1000).toFixed(0)}K`, sub: `${properties.length} properties` },
              { label: 'Total Appreciation', value: `${totalGain >= 0 ? '+' : ''}$${Math.abs(Math.round(totalGain/1000))}K`, sub: `${totalGainPct}% gain`, positive: totalGain >= 0 },
              { label: 'Owner Equity', value: `$${(totalEquity/1000).toFixed(0)}K`, sub: 'after mortgages', positive: true },
              { label: '1yr Projection', value: `$${(projectedNextYear/1000).toFixed(0)}K`, sub: 'at 4% growth', positive: true },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', padding: '16px' }}>
                <p className="text-blue-200 font-medium" style={{ fontSize: '11px', marginBottom: '6px' }}>{stat.label}</p>
                <p className="font-extrabold" style={{ fontSize: '20px', color: stat.positive === false ? '#fca5a5' : stat.positive ? '#86efac' : 'white' }}>
                  {stat.value}
                </p>
                <p className="text-blue-300" style={{ fontSize: '11px', marginTop: '2px' }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {totalGain > 0 && (
          <div className="flex items-center gap-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', marginTop: '24px' }}>
            <Star style={{ width: '16px', height: '16px', color: '#fbbf24', flexShrink: 0 }} />
            <p className="text-blue-100" style={{ fontSize: '14px' }}>
              CasaCEO has tracked <span className="font-bold text-white">${Math.round(totalGain).toLocaleString()}</span> in appreciation across your portfolio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CONFIDENCE METER
// ═══════════════════════════════════════════════════════════════════════

const ConfidenceMeter = ({ confidence = 'High' }) => {
  const levels = { High: { pct: 85, color: '#059669', bg: '#ecfdf5', label: 'High Confidence' }, Medium: { pct: 55, color: '#d97706', bg: '#fffbeb', label: 'Medium Confidence' }, Low: { pct: 25, color: '#dc2626', bg: '#fef2f2', label: 'Low Confidence' } };
  const c = levels[confidence] || levels.High;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full" style={{ height: '6px' }}>
        <div className="rounded-full" style={{ width: `${c.pct}%`, height: '6px', background: c.color }} />
      </div>
      <span className="font-medium rounded-full" style={{ fontSize: '11px', color: c.color, background: c.bg, padding: '2px 8px' }}>{c.label}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// COMPARABLE SALES
// ═══════════════════════════════════════════════════════════════════════

const ComparableSales = ({ property }) => {
  const comps = [
    { address: '118 Magnolia Dr', beds: 4, baths: 3, sqft: '2,810', price: 1228000, daysAgo: 12, diff: -17000 },
    { address: '245 Harbour View', beds: 4, baths: 3.5, sqft: '3,100', price: 1275000, daysAgo: 28, diff: 30000 },
    { address: '73 Seaside Blvd', beds: 3, baths: 2, sqft: '2,640', price: 1195000, daysAgo: 45, diff: -50000 },
    { address: '512 Oak Ridge Ln', beds: 4, baths: 3, sqft: '2,950', price: 1260000, daysAgo: 61, diff: 15000 },
  ];

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Comparable Sales</h3>
        <span className="text-slate-400 font-medium" style={{ fontSize: '12px' }}>Last 90 days · {property.address || 'Your area'}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {comps.map((comp, i) => (
          <div key={i} className="flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '10px 12px' }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2f8' }}>
              <Home style={{ width: '14px', height: '14px', color: '#1e3a5f' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate" style={{ fontSize: '13px' }}>{comp.address}</p>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>{comp.beds}bd · {comp.baths}ba · {comp.sqft} sqft · {comp.daysAgo}d ago</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>${comp.price.toLocaleString()}</p>
              <p className={`font-medium`} style={{ fontSize: '11px', color: comp.diff >= 0 ? '#059669' : '#dc2626' }}>
                {comp.diff >= 0 ? '+' : ''}{(comp.diff/1000).toFixed(0)}K vs yours
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl" style={{ background: '#f8fafc', padding: '10px 12px', marginTop: '12px' }}>
        <Info style={{ width: '13px', height: '13px', color: '#94a3b8', flexShrink: 0 }} />
        <p className="text-slate-400" style={{ fontSize: '12px' }}>Comparable sales are illustrative estimates. Consult a local agent for a full CMA.</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// RENOVATION SCENARIO
// ═══════════════════════════════════════════════════════════════════════

const RenovationScenario = ({ property }) => {
  const renovations = [
    { name: 'Kitchen Remodel', cost: 45000, roiPct: 72, valueAdd: 32400, icon: '🍳' },
    { name: 'Bathroom Remodel', cost: 25000, roiPct: 65, valueAdd: 16250, icon: '🚿' },
    { name: 'New Roof', cost: 18000, roiPct: 68, valueAdd: 12240, icon: '🏠' },
    { name: 'HVAC Replacement', cost: 9000, roiPct: 85, valueAdd: 7650, icon: '❄️' },
    { name: 'Exterior Paint', cost: 6000, roiPct: 55, valueAdd: 3300, icon: '🖌️' },
    { name: 'Deck/Patio Add', cost: 20000, roiPct: 60, valueAdd: 12000, icon: '🌿' },
  ];

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
        <Hammer style={{ width: '16px', height: '16px', color: '#f97316' }} />
        <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>What If I Renovate?</h3>
      </div>
      <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '16px' }}>Estimated ROI for common renovations based on national averages.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {renovations.map((r, i) => (
          <div key={i} className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: i < renovations.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                <p className="font-medium text-slate-800" style={{ fontSize: '13px' }}>{r.name}</p>
                <span className="font-semibold text-green-600" style={{ fontSize: '12px' }}>+${r.valueAdd.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full" style={{ height: '5px' }}>
                  <div className="rounded-full" style={{ width: `${r.roiPct}%`, height: '5px', background: r.roiPct >= 70 ? '#059669' : r.roiPct >= 55 ? '#d97706' : '#dc2626' }} />
                </div>
                <span className="text-slate-400 flex-shrink-0" style={{ fontSize: '11px' }}>{r.roiPct}% ROI · Cost: ${r.cost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-xl" style={{ background: '#fffbeb', padding: '10px 12px', marginTop: '12px' }}>
        <Lightbulb style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
        <p className="text-amber-700" style={{ fontSize: '12px' }}>HVAC and kitchen renovations offer the strongest returns based on national averages. ROI varies by location and condition.</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY CARD — polished with confidence meter + update CTA
// ═══════════════════════════════════════════════════════════════════════

const PropertyCard = ({ property, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(property.currentValue || '');

  const gain = (property.currentValue || 0) - (property.purchasePrice || 0);
  const gainPct = property.purchasePrice > 0 ? ((gain / property.purchasePrice) * 100).toFixed(1) : 0;
  const isUp = gain >= 0;
  const yrs = property.purchaseYear ? new Date().getFullYear() - property.purchaseYear : 0;
  const annualRate = yrs > 0 && property.purchasePrice > 0
    ? ((Math.pow(property.currentValue / property.purchasePrice, 1 / yrs) - 1) * 100).toFixed(1) : null;
  const equity = (property.currentValue || 0) - (property.mortgageBalance || 0);

  const sparkData = Array.from({ length: 8 }, (_, i) => ({
    month: i,
    value: property.purchasePrice * Math.pow(1 + (gainPct / 100 / 7), i)
  }));

  return (
    <div className="bg-white hover:shadow-md transition-all overflow-hidden" style={{ borderRadius: '12px', border: `1px solid ${isUp ? '#a7f3d0' : '#fecaca'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '4px', background: isUp ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
      <div style={{ padding: '20px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '17px' }}>{property.name}</h3>
            {property.address && (
              <p className="text-slate-400 flex items-center gap-1" style={{ fontSize: '12px', marginTop: '2px' }}>
                <MapPin style={{ width: '11px', height: '11px' }} /> {property.address}
              </p>
            )}
          </div>
          <div className={`flex items-center gap-1 rounded-full font-bold`} style={{ padding: '4px 10px', fontSize: '13px', background: isUp ? '#ecfdf5' : '#fef2f2', color: isUp ? '#059669' : '#dc2626' }}>
            {isUp ? <ArrowUpRight style={{ width: '14px', height: '14px' }} /> : <ArrowDownRight style={{ width: '14px', height: '14px' }} />}
            {gainPct}%
          </div>
        </div>

        {/* Current Value */}
        <div style={{ marginBottom: '8px' }}>
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '6px' }}>Estimated Value</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <Input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} className="h-10 rounded-xl pl-7" autoFocus />
              </div>
              <button onClick={() => { onUpdate(property.id, parseFloat(newValue)); setEditing(false); }} className="flex items-center justify-center rounded-xl" style={{ width: '36px', height: '36px', background: '#059669' }}>
                <Check style={{ width: '15px', height: '15px', color: 'white' }} />
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center justify-center rounded-xl bg-slate-100">
                <X style={{ width: '15px', height: '15px', color: '#64748b' }} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-slate-900" style={{ fontSize: '28px', lineHeight: 1 }}>${(property.currentValue || 0).toLocaleString()}</p>
              <button onClick={() => setEditing(true)} className="flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" style={{ width: '30px', height: '30px' }}>
                <Edit2 style={{ width: '13px', height: '13px', color: '#64748b' }} />
              </button>
            </div>
          )}
        </div>

        {/* Confidence Meter */}
        <div style={{ marginBottom: '16px' }}>
          <ConfidenceMeter confidence="High" />
        </div>

        {/* Sparkline */}
        <div style={{ height: '52px', marginBottom: '16px', marginLeft: '-4px', marginRight: '-4px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="value" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '16px' }}>
          <div className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
            <p className="text-slate-400" style={{ fontSize: '11px' }}>Purchased</p>
            <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>${(property.purchasePrice || 0).toLocaleString()}</p>
            {property.purchaseYear && <p className="text-slate-400" style={{ fontSize: '11px' }}>{property.purchaseYear}</p>}
          </div>
          <div className="rounded-xl" style={{ padding: '10px', background: isUp ? '#ecfdf5' : '#fef2f2' }}>
            <p className="text-slate-400" style={{ fontSize: '11px' }}>Total Gain</p>
            <p className="font-semibold" style={{ fontSize: '14px', color: isUp ? '#059669' : '#dc2626' }}>
              {isUp ? '+' : ''}${Math.abs(Math.round(gain)).toLocaleString()}
            </p>
            {annualRate && <p className="text-slate-400" style={{ fontSize: '11px' }}>{annualRate}%/yr avg</p>}
          </div>
          {property.mortgageBalance > 0 && (
            <div className="rounded-xl" style={{ padding: '10px', background: '#eff6ff' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Mortgage</p>
              <p className="font-semibold text-blue-700" style={{ fontSize: '14px' }}>${property.mortgageBalance.toLocaleString()}</p>
            </div>
          )}
          {equity > 0 && (
            <div className="rounded-xl" style={{ padding: '10px', background: '#f5f3ff' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Equity</p>
              <p className="font-semibold text-purple-700" style={{ fontSize: '14px' }}>${equity.toLocaleString()}</p>
            </div>
          )}
        </div>

        {annualRate && parseFloat(annualRate) > 4 && (
          <div className="flex items-center gap-2 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 10px', marginBottom: '12px' }}>
            <Star style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0 }} />
            <p className="text-amber-700 font-medium" style={{ fontSize: '12px' }}>{property.name} is outperforming the national average</p>
          </div>
        )}

        <a href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || property.name)}_rb/`} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full font-semibold hover:opacity-90 transition-all rounded-xl"
          style={{ background: '#eef2f8', color: '#1e3a5f', padding: '10px', fontSize: '13px' }}>
          <RefreshCw style={{ width: '14px', height: '14px' }} /> Update Valuation <ArrowUpRight style={{ width: '13px', height: '13px' }} />
        </a>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MARKET COMPARISON — preserved exactly, design tokens updated
// ═══════════════════════════════════════════════════════════════════════

const MarketComparison = ({ properties }) => {
  const totalValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalPurchased = properties.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  const totalGainPct = totalPurchased > 0 ? ((totalValue / totalPurchased - 1) * 100).toFixed(1) : 0;

  const benchmarks = [
    { name: 'Your Portfolio', pct: parseFloat(totalGainPct), color: '#1e3a5f', emoji: '🏠' },
    { name: 'S&P 500 (10yr avg)', pct: 10.5, color: '#7c3aed', emoji: '📈' },
    { name: 'National RE (4% avg)', pct: 4.0, color: '#059669', emoji: '🌎' },
    { name: 'Savings Account', pct: 0.5, color: '#94a3b8', emoji: '🏦' },
  ];
  const max = Math.max(...benchmarks.map(b => Math.abs(b.pct)), 1);
  const isOutperforming = parseFloat(totalGainPct) > 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {isOutperforming && (
        <div className="flex items-start gap-3" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
          <Star style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="font-semibold text-green-800" style={{ fontSize: '15px' }}>Your portfolio is outperforming the national average!</p>
            <p className="text-green-600" style={{ fontSize: '13px', marginTop: '2px' }}>At {totalGainPct}% appreciation, you're ahead of the 4% national average.</p>
          </div>
        </div>
      )}

      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '4px' }}>Portfolio vs Market Benchmarks</h3>
        <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px' }}>How your real estate stacks up against alternative investments.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {benchmarks.map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '18px' }}>{b.emoji}</span>
                  <span className="font-semibold text-slate-700" style={{ fontSize: '14px' }}>{b.name}</span>
                  {i === 0 && <span className="font-medium text-slate-500 bg-slate-100 rounded-full" style={{ padding: '2px 8px', fontSize: '11px' }}>You</span>}
                </div>
                <span className="font-bold" style={{ fontSize: '14px', color: b.color }}>+{b.pct}%</span>
              </div>
              <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '10px' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(b.pct / max) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {properties.length > 1 && (
        <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '20px' }}>Property Appreciation Comparison</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {properties.map(p => {
              const pct = p.purchasePrice > 0 ? ((p.currentValue - p.purchasePrice) / p.purchasePrice * 100).toFixed(1) : 0;
              const maxPct = Math.max(...properties.map(pp => pp.purchasePrice > 0 ? (pp.currentValue - pp.purchasePrice) / pp.purchasePrice * 100 : 0));
              const isTop = Math.abs(parseFloat(pct) - maxPct) < 0.01;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700" style={{ fontSize: '14px' }}>{p.name}</span>
                      {isTop && <span className="font-bold text-green-600 bg-green-100 rounded-full" style={{ padding: '2px 8px', fontSize: '11px' }}>Top performer</span>}
                    </div>
                    <span className="font-bold" style={{ fontSize: '14px', color: parseFloat(pct) >= 0 ? '#059669' : '#dc2626' }}>+{pct}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '8px' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(parseFloat(pct)) * 3, 100)}%`, background: '#1e3a5f' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px' }}>
        <Lightbulb style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
        <p className="text-amber-700" style={{ fontSize: '12px' }}>Benchmarks are for illustrative purposes. Past performance doesn't guarantee future results.</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SELL OR STAY ANALYZER — preserved exactly, design tokens updated
// ═══════════════════════════════════════════════════════════════════════

const SellOrStayAnalyzer = ({ properties }) => {
  const [selectedId, setSelectedId] = useState(properties[0]?.id);
  const [inputs, setInputs] = useState({ mortgageBalance: '', monthlyMortgage: '', monthlyRent: '', appreciationRate: '4', yearsToAnalyze: '5' });
  const [result, setResult] = useState(null);

  const property = properties.find(p => p.id === selectedId) || properties[0];
  const fmt = (n) => n < 0 ? `-$${Math.abs(Math.round(n)).toLocaleString()}` : `$${Math.round(n).toLocaleString()}`;

  const analyze = () => {
    const cv = parseFloat(property?.currentValue) || 0;
    const pp = parseFloat(property?.purchasePrice) || 0;
    const mb = parseFloat(inputs.mortgageBalance) || 0;
    const mr = parseFloat(inputs.monthlyRent) || 0;
    const ar = parseFloat(inputs.appreciationRate) / 100 || 0.04;
    const yrs = parseFloat(inputs.yearsToAnalyze) || 5;
    const sellingCosts = cv * 0.06;
    const netProceeds = cv - mb - sellingCosts;
    const capitalGains = cv - pp;
    const futureValue = cv * Math.pow(1 + ar, yrs);
    const futureEquity = futureValue - (mb * 0.85);
    const rentalIncome = mr * 12 * yrs;
    const netStayBenefit = futureEquity - (mb || cv * 0.5) + rentalIncome;
    const projData = Array.from({ length: yrs + 1 }, (_, i) => ({
      year: `Year ${i}`,
      'Stay Value': Math.round(cv * Math.pow(1 + ar, i)),
      'Sell Invested': Math.round(netProceeds * Math.pow(1.07, i)),
    }));
    setResult({ sell: { netProceeds, sellingCosts, capitalGains }, stay: { futureValue, futureEquity, netBenefit: netStayBenefit }, winner: netProceeds > netStayBenefit ? 'sell' : 'stay', difference: Math.abs(netProceeds - netStayBenefit), projData });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {properties.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {properties.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className="font-semibold rounded-xl border transition-all"
              style={{ padding: '8px 20px', fontSize: '13px', background: selectedId === p.id ? '#1e3a5f' : 'white', color: selectedId === p.id ? 'white' : '#64748b', borderColor: selectedId === p.id ? '#1e3a5f' : '#e2e8f0' }}>
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
          <Calculator style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Sell or Stay? — {property?.name}</h3>
        </div>
        <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px' }}>Enter your numbers to see what makes more financial sense.</p>

        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '20px' }}>
          <div className="col-span-2 grid grid-cols-2 gap-4 rounded-xl" style={{ background: '#f8fafc', padding: '16px' }}>
            <div>
              <p className="text-slate-400 font-medium" style={{ fontSize: '12px', marginBottom: '4px' }}>Current Value</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>${(property?.currentValue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium" style={{ fontSize: '12px', marginBottom: '4px' }}>Purchase Price</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>${(property?.purchasePrice || 0).toLocaleString()}</p>
            </div>
          </div>
          {[
            { key: 'mortgageBalance', label: 'Mortgage Balance Remaining', prefix: '$', placeholder: '280000' },
            { key: 'monthlyMortgage', label: 'Monthly Mortgage Payment', prefix: '$', placeholder: '2100' },
            { key: 'monthlyRent', label: 'Monthly Rental Income (if any)', prefix: '$', placeholder: '0' },
            { key: 'yearsToAnalyze', label: 'Years to Analyze', placeholder: '5' },
            { key: 'appreciationRate', label: 'Expected Annual Appreciation', suffix: '%', placeholder: '4' },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block" style={{ fontSize: '12px' }}>{f.label}</Label>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-3 text-slate-400 text-sm">{f.prefix}</span>}
                <Input type="number" placeholder={f.placeholder} value={inputs[f.key]}
                  onChange={e => setInputs(p => ({ ...p, [f.key]: e.target.value }))}
                  className={`h-11 rounded-xl ${f.prefix ? 'pl-7' : ''}`} />
                {f.suffix && <span className="absolute right-3 top-3 text-slate-400 text-sm">{f.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={analyze} className="w-full flex items-center justify-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '14px', fontSize: '15px' }}>
          <BarChart2 style={{ width: '16px', height: '16px' }} /> Analyze My Options
        </button>

        {result && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="text-center rounded-xl" style={{ padding: '24px', background: result.winner === 'stay' ? '#eff6ff' : '#ecfdf5', border: `1px solid ${result.winner === 'stay' ? '#bfdbfe' : '#a7f3d0'}` }}>
              <p className="font-medium text-slate-500 uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '8px' }}>Based on your numbers</p>
              <p className="font-extrabold" style={{ fontSize: '28px', marginBottom: '8px', color: result.winner === 'stay' ? '#1d4ed8' : '#059669' }}>
                {result.winner === 'stay' ? '🏠 Stay Put' : '🔑 Consider Selling'}
              </p>
              <p className="text-slate-600" style={{ fontSize: '14px' }}>
                {result.winner === 'stay'
                  ? `Staying could be worth ${fmt(result.difference)} more than selling right now`
                  : `Selling now could put ${fmt(result.difference)} more in your pocket`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'If You Sell', winner: result.winner === 'sell', data: [['Net Proceeds', fmt(result.sell.netProceeds)], ['Selling Costs (6%)', `-${fmt(result.sell.sellingCosts)}`], ['Capital Gains', fmt(result.sell.capitalGains)]] },
                { label: 'If You Stay', winner: result.winner === 'stay', data: [[`Future Value (${inputs.yearsToAnalyze} yrs)`, fmt(result.stay.futureValue)], ['Future Equity', fmt(result.stay.futureEquity)], ['Net Benefit', fmt(result.stay.netBenefit)]] },
              ].map((side, i) => (
                <div key={i} className="rounded-xl" style={{ padding: '16px', border: `1px solid ${side.winner ? '#a7f3d0' : '#e2e8f0'}`, background: side.winner ? '#ecfdf5' : '#f8fafc' }}>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '14px', marginBottom: '12px' }}>
                    {side.winner ? <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669' }} /> : <Minus style={{ width: '14px', height: '14px', color: '#94a3b8' }} />}
                    {side.label}
                  </h4>
                  {side.data.map(([label, val]) => (
                    <div key={label} className="flex justify-between" style={{ fontSize: '13px', paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {result.projData && (
              <div>
                <p className="font-medium text-slate-500" style={{ fontSize: '13px', marginBottom: '12px' }}>Value Projection Over {inputs.yearsToAnalyze} Years</p>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.projData}>
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} />
                      <Line type="monotone" dataKey="Stay Value" stroke="#1e3a5f" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Sell Invested" stroke="#e8604c" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <p className="text-slate-400 text-center" style={{ fontSize: '12px' }}>Consult a real estate professional before major decisions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ADD PROPERTY MODAL — design tokens updated
// ═══════════════════════════════════════════════════════════════════════

const AddPropertyModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ name: '', address: '', purchasePrice: '', currentValue: '', purchaseYear: '', mortgageBalance: '' });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md" style={{ borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px' }}>Add Property</h2>
            <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '2px' }}>Add your next investment to the portfolio.</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" style={{ width: '36px', height: '36px' }}>
            <X style={{ width: '15px', height: '15px', color: '#64748b' }} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { key: 'name', label: 'Property Name', placeholder: 'Lake House', prefix: null },
            { key: 'address', label: 'Address', placeholder: '123 Main St, Atlanta GA', prefix: null },
            { key: 'purchasePrice', label: 'Purchase Price', placeholder: '350000', prefix: '$' },
            { key: 'currentValue', label: 'Current Estimated Value', placeholder: '425000', prefix: '$' },
            { key: 'mortgageBalance', label: 'Mortgage Balance (optional)', placeholder: '280000', prefix: '$' },
            { key: 'purchaseYear', label: 'Year Purchased', placeholder: '2018', prefix: null },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</Label>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-3 text-slate-400 text-sm">{f.prefix}</span>}
                <Input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={`h-11 rounded-xl ${f.prefix ? 'pl-7' : ''}`} />
              </div>
            </div>
          ))}
          <div className="flex gap-3" style={{ marginTop: '4px' }}>
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => { onAdd({ ...form, id: Date.now(), purchasePrice: parseFloat(form.purchasePrice) || 0, currentValue: parseFloat(form.currentValue) || 0, mortgageBalance: parseFloat(form.mortgageBalance) || 0, purchaseYear: parseInt(form.purchaseYear) || new Date().getFullYear() }); onClose(); }} disabled={!form.name} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
              Add Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeValuationPage = () => {
  const [properties, setProperties] = useState([
    { id: 1, name: 'Primary Home', address: '123 Oakwood Lane, St. Simons Island, GA', purchasePrice: 850000, currentValue: 1245000, purchaseYear: 2018, mortgageBalance: 630000 },
    { id: 2, name: 'Lake House', address: '47 Harbour View Dr, Gainesville, GA', purchasePrice: 380000, currentValue: 445000, purchaseYear: 2021, mortgageBalance: 310000 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleUpdateValue = (id, newValue) => setProperties(prev => prev.map(p => p.id === id ? { ...p, currentValue: newValue } : p));
  const handleAddProperty = (property) => setProperties(prev => [...prev, property]);

  return (
    <div className="pb-20">
      <Helmet><title>Home Valuation — CasaCEO</title></Helmet>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
        <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
          <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
          <ChevronRight style={{ width: '14px', height: '14px' }} />
          <span className="text-slate-700 font-medium">Home Valuation</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8' }}>
              <TrendingUp style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Home Valuation</h1>
              <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>{properties.length} properties tracked · Living balance sheet</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
              <Download style={{ width: '15px', height: '15px' }} /> Export
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#e8604c', padding: '10px 20px', fontSize: '14px' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Property
            </button>
          </div>
        </div>
      </div>

      <PortfolioSummary properties={properties} />

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ marginBottom: '32px' }}>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px' }}>
          {[
            { key: 'overview', label: '🏠 Asset Layer' },
            { key: 'comps', label: '🏘️ Comps & Renovations' },
            { key: 'market', label: '📊 Market Intelligence' },
            { key: 'analyzer', label: '🔑 Decision Insights' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="font-medium rounded-xl transition-all"
              style={{ padding: '8px 14px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => <PropertyCard key={p.id} property={p} onUpdate={handleUpdateValue} />)}
          <button onClick={() => setShowAddModal(true)}
            className="bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all group"
            style={{ minHeight: '240px' }}>
            <div className="flex items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-slate-200 transition-colors" style={{ width: '48px', height: '48px', marginBottom: '12px' }}>
              <Plus style={{ width: '22px', height: '22px' }} />
            </div>
            <p className="font-semibold" style={{ fontSize: '15px' }}>Add Your Next Asset</p>
            <p className="text-slate-300" style={{ fontSize: '13px', marginTop: '4px' }}>CasaCEO tracks it automatically</p>
          </button>
        </div>
      )}

      {activeTab === 'comps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ComparableSales property={properties[0]} />
          <RenovationScenario property={properties[0]} />
        </div>
      )}

      {activeTab === 'market' && <MarketComparison properties={properties} />}
      {activeTab === 'analyzer' && <SellOrStayAnalyzer properties={properties} />}

      {showAddModal && <AddPropertyModal onAdd={handleAddProperty} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default HomeValuationPage;
