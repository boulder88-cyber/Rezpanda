import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  TrendingUp, TrendingDown, Home, DollarSign, BarChart2,
  ArrowUpRight, ArrowDownRight, Plus, Edit2, Check, X,
  AlertCircle, CheckCircle2, Minus, ShieldCheck, Target,
  Star, Lightbulb, Calculator, MapPin, Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// ─── Portfolio Summary ────────────────────────────────────────────────
const PortfolioSummary = ({ properties }) => {
  const totalValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalPurchased = properties.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  const totalGain = totalValue - totalPurchased;
  const totalGainPct = totalPurchased > 0 ? ((totalGain / totalPurchased) * 100).toFixed(1) : 0;
  const projectedNextYear = properties.reduce((s, p) => s + ((p.currentValue || 0) * 1.04), 0);
  const avgAppreciation = properties.length > 0
    ? (properties.reduce((s, p) => {
        if (!p.purchasePrice || !p.currentValue || !p.purchaseYear) return s;
        const yrs = new Date().getFullYear() - p.purchaseYear;
        if (yrs <= 0) return s;
        return s + (Math.pow(p.currentValue / p.purchasePrice, 1 / yrs) - 1) * 100;
      }, 0) / properties.filter(p => p.purchaseYear).length).toFixed(1)
    : 0;

  const totalEquity = properties.reduce((s, p) => s + ((p.currentValue || 0) - (p.mortgageBalance || 0)), 0);

  return (
    <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Home Valuations</h1>
            <p className="text-blue-200 text-base max-w-xl">Your real-estate portfolio, visualized and optimized.</p>
            <div className="flex items-center gap-2 mt-3">
              <ShieldCheck className="w-4 h-4 text-green-300" />
              <span className="text-blue-200 text-xs">Your property data is encrypted and securely synced.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Portfolio Value', value: `$${(totalValue/1000).toFixed(0)}K`, sub: `${properties.length} properties`, highlight: true },
              { label: 'Total Gain', value: `${totalGain >= 0 ? '+' : ''}$${Math.abs(Math.round(totalGain/1000))}K`, sub: `${totalGainPct}% appreciation`, positive: totalGain >= 0 },
              { label: 'Total Equity', value: `$${(totalEquity/1000).toFixed(0)}K`, sub: 'after mortgages', positive: true },
              { label: 'Proj. Next Year', value: `$${(projectedNextYear/1000).toFixed(0)}K`, sub: 'at 4% growth', positive: true },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl p-4 ${stat.highlight ? 'bg-white/15' : 'bg-white/8'} border border-white/10`}>
                <p className="text-blue-200 text-xs font-medium mb-1">{stat.label}</p>
                <p className={`text-xl font-extrabold ${stat.positive === false ? 'text-red-300' : stat.positive ? 'text-green-300' : 'text-white'}`}>
                  {stat.value}
                </p>
                <p className="text-blue-300 text-xs mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insight banner */}
        {totalGain > 0 && (
          <div className="mt-6 bg-white/10 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <Star className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <p className="text-blue-100 text-sm">
              You've built <span className="font-bold text-white">${Math.round(totalGain).toLocaleString()}</span> in equity across your portfolio — that's financial freedom in motion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Property Card ────────────────────────────────────────────────────
const PropertyCard = ({ property, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(property.currentValue || '');

  const gain = (property.currentValue || 0) - (property.purchasePrice || 0);
  const gainPct = property.purchasePrice > 0 ? ((gain / property.purchasePrice) * 100).toFixed(1) : 0;
  const isUp = gain >= 0;

  const yrs = property.purchaseYear ? new Date().getFullYear() - property.purchaseYear : 0;
  const annualRate = yrs > 0 && property.purchasePrice > 0
    ? ((Math.pow(property.currentValue / property.purchasePrice, 1 / yrs) - 1) * 100).toFixed(1)
    : null;

  const sparkData = Array.from({ length: 8 }, (_, i) => ({
    month: i,
    value: property.purchasePrice * Math.pow(1 + (gainPct / 100 / 7), i)
  }));

  const equity = (property.currentValue || 0) - (property.mortgageBalance || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
      <div className={`h-1.5 w-full ${isUp ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{property.name}</h3>
            {property.address && (
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {property.address}
              </p>
            )}
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {gainPct}%
          </div>
        </div>

        {/* Current Value */}
        <div className="mb-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Current Value</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <Input type="number" value={newValue} onChange={e => setNewValue(e.target.value)} className="h-10 rounded-xl pl-7" autoFocus />
              </div>
              <button onClick={() => { onUpdate(property.id, parseFloat(newValue)); setEditing(false); }} className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing(false)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-extrabold text-slate-900">${(property.currentValue || 0).toLocaleString()}</p>
              <button onClick={() => setEditing(true)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="h-14 mb-4 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="value" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium">Purchased</p>
            <p className="font-bold text-slate-900 text-sm">${(property.purchasePrice || 0).toLocaleString()}</p>
            {property.purchaseYear && <p className="text-xs text-slate-400">{property.purchaseYear}</p>}
          </div>
          <div className={`rounded-xl p-3 ${isUp ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-xs text-slate-400 font-medium">Total Gain</p>
            <p className={`font-bold text-sm ${isUp ? 'text-green-600' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{gain >= 0 ? '$' : '-$'}{Math.abs(Math.round(gain)).toLocaleString()}
            </p>
            {annualRate && <p className="text-xs text-slate-400">{annualRate}%/yr avg</p>}
          </div>
          {property.mortgageBalance > 0 && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium">Mortgage Balance</p>
              <p className="font-bold text-blue-700 text-sm">${property.mortgageBalance.toLocaleString()}</p>
            </div>
          )}
          {equity > 0 && (
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium">Equity</p>
              <p className="font-bold text-purple-700 text-sm">${equity.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Insight */}
        {annualRate && parseFloat(annualRate) > 4 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">{property.name} is outperforming the national average</p>
          </div>
        )}

        <a
          href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || property.name)}_rb/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#eef2f8', color: '#1e3a5f' }}
        >
          <Home className="w-4 h-4" /> Check Zillow Estimate <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

// ─── Market Comparison ────────────────────────────────────────────────
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
    <div className="space-y-6">
      {isOutperforming && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-start gap-3">
          <Star className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-800">Your portfolio is outperforming the national real estate average!</p>
            <p className="text-green-600 text-sm mt-0.5">At {totalGainPct}% appreciation, you're ahead of the national 4% average. Keep building equity.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-2">Portfolio vs Market Benchmarks</h3>
        <p className="text-slate-500 text-sm mb-6">How your real estate stacks up against alternative investments</p>

        <div className="space-y-4">
          {benchmarks.map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.emoji}</span>
                  <span className="text-sm font-semibold text-slate-700">{b.name}</span>
                  {i === 0 && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">You</span>}
                </div>
                <span className="text-sm font-bold" style={{ color: b.color }}>+{b.pct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(b.pct / max) * 100}%`, background: b.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property comparison */}
      {properties.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-5">Property Appreciation Comparison</h3>
          <div className="space-y-3">
            {properties.map(p => {
              const pct = p.purchasePrice > 0 ? ((p.currentValue - p.purchasePrice) / p.purchasePrice * 100).toFixed(1) : 0;
              const isTop = properties.reduce((max, prop) => {
                const pp = prop.purchasePrice > 0 ? (prop.currentValue - prop.purchasePrice) / prop.purchasePrice * 100 : 0;
                return pp > max ? pp : max;
              }, 0) === parseFloat(pct);

              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                      {isTop && <span className="text-xs bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">Top performer</span>}
                    </div>
                    <span className={`text-sm font-bold ${parseFloat(pct) >= 0 ? 'text-green-600' : 'text-red-500'}`}>+{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(parseFloat(pct)) * 3, 100)}%`, background: '#1e3a5f' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">Benchmarks are for illustrative purposes. Past performance doesn't guarantee future results. Consult a financial advisor for investment decisions.</p>
      </div>
    </div>
  );
};

// ─── Sell or Stay Analyzer ────────────────────────────────────────────
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
    const mm = parseFloat(inputs.monthlyMortgage) || 0;
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
    <div className="space-y-6">
      {/* Property selector */}
      {properties.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {properties.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={selectedId === p.id ? { background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' } : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-400" /> Sell or Stay? — {property?.name}
        </h3>
        <p className="text-slate-500 text-sm mb-6">Enter your numbers to see what makes more financial sense</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Current Value</p>
              <p className="font-bold text-slate-900">${(property?.currentValue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Purchase Price</p>
              <p className="font-bold text-slate-900">${(property?.purchasePrice || 0).toLocaleString()}</p>
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
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</Label>
              <div className="relative">
                {f.prefix && <span className="absolute left-3 top-3 text-slate-400 text-sm">{f.prefix}</span>}
                <Input type="number" placeholder={f.placeholder} value={inputs[f.key]}
                  onChange={e => setInputs(p => ({ ...p, [f.key]: e.target.value }))}
                  className={`h-11 rounded-xl ${f.prefix ? 'pl-7' : ''} ${f.suffix ? 'pr-8' : ''}`}
                />
                {f.suffix && <span className="absolute right-3 top-3 text-slate-400 text-sm">{f.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={analyze} className="w-full h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
          <BarChart2 className="w-4 h-4 mr-2" /> Analyze My Options
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            {/* Winner */}
            <div className={`rounded-2xl p-6 text-center ${result.winner === 'stay' ? 'bg-blue-50 border border-blue-100' : 'bg-green-50 border border-green-100'}`}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Based on your numbers</p>
              <p className={`text-3xl font-extrabold mb-2 ${result.winner === 'stay' ? 'text-blue-700' : 'text-green-700'}`}>
                {result.winner === 'stay' ? '🏠 Stay Put' : '🔑 Consider Selling'}
              </p>
              <p className="text-slate-600 text-sm">
                {result.winner === 'stay'
                  ? `Staying could be worth ${fmt(result.difference)} more than selling right now`
                  : `Selling now could put ${fmt(result.difference)} more in your pocket`
                }
              </p>
            </div>

            {/* Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-2xl border p-5 ${result.winner === 'sell' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  {result.winner === 'sell' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
                  If You Sell
                </h4>
                {[
                  ['Net Proceeds', fmt(result.sell.netProceeds)],
                  ['Selling Costs (6%)', `-${fmt(result.sell.sellingCosts)}`],
                  ['Capital Gains', fmt(result.sell.capitalGains)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-slate-900">{val}</span>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border p-5 ${result.winner === 'stay' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  {result.winner === 'stay' ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
                  If You Stay
                </h4>
                {[
                  [`Future Value (${inputs.yearsToAnalyze} yrs)`, fmt(result.stay.futureValue)],
                  ['Future Equity', fmt(result.stay.futureEquity)],
                  ['Net Benefit', fmt(result.stay.netBenefit)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projection Chart */}
            {result.projData && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">Value Projection Over {inputs.yearsToAnalyze} Years</p>
                <div className="h-48">
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
                <div className="flex items-center gap-4 mt-2 justify-center text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#1e3a5f] inline-block"></span> Stay (projected)</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#e8604c] border-dashed inline-block"></span> Sell & invest (7% return)</span>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">* Estimates for planning purposes only. Consult a real estate professional before making decisions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Add Property Modal ───────────────────────────────────────────────
const AddPropertyModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({ name: '', address: '', purchasePrice: '', currentValue: '', purchaseYear: '', mortgageBalance: '' });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Property</h2>
            <p className="text-slate-400 text-sm mt-0.5">Add your next investment to the portfolio</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
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
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => { onAdd({ ...form, id: Date.now(), purchasePrice: parseFloat(form.purchasePrice) || 0, currentValue: parseFloat(form.currentValue) || 0, mortgageBalance: parseFloat(form.mortgageBalance) || 0, purchaseYear: parseInt(form.purchaseYear) || new Date().getFullYear() }); onClose(); }} disabled={!form.name} className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: '#1e3a5f' }}>
              Add Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const HomeValuationPage = () => {
  const [properties, setProperties] = useState([
    { id: 1, name: 'Primary Home', address: '', purchasePrice: 350000, currentValue: 425000, purchaseYear: 2019, mortgageBalance: 280000 },
    { id: 2, name: 'Lake House', address: '', purchasePrice: 280000, currentValue: 310000, purchaseYear: 2021, mortgageBalance: 230000 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleUpdateValue = (id, newValue) => setProperties(prev => prev.map(p => p.id === id ? { ...p, currentValue: newValue } : p));
  const handleAddProperty = (property) => setProperties(prev => [...prev, property]);

  return (
    <div className="pb-20">
      <Helmet><title>Home Valuations — CasaCEO</title></Helmet>

      <PortfolioSummary properties={properties} />

      {/* Tabs + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm">
          {[
            { key: 'overview', label: '🏠 My Properties' },
            { key: 'market', label: '📊 Market Compare' },
            { key: 'analyzer', label: '🔑 Sell or Stay?' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab.key ? { background: '#1e3a5f', color: '#fff' } : { color: '#64748b' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-xl font-bold text-white" style={{ background: '#e8604c' }}>
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => <PropertyCard key={p.id} property={p} onUpdate={handleUpdateValue} />)}
          <button onClick={() => setShowAddModal(true)}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all min-h-64 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <p className="font-semibold">Add Property</p>
            <p className="text-sm mt-1 text-slate-300">Add your next investment</p>
          </button>
        </div>
      )}

      {activeTab === 'market' && <MarketComparison properties={properties} />}

      {activeTab === 'analyzer' && <SellOrStayAnalyzer properties={properties} />}

      {showAddModal && <AddPropertyModal onAdd={handleAddProperty} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default HomeValuationPage;
