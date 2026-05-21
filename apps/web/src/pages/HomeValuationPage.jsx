import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  TrendingUp, TrendingDown, Home, DollarSign, BarChart2,
  ArrowUpRight, ArrowDownRight, Plus, Edit2, Check, X,
  AlertCircle, CheckCircle2, HelpCircle, Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// ─── Sell vs Stay Analyzer ────────────────────────────────────────────
const SellOrStayAnalyzer = ({ property }) => {
  const [inputs, setInputs] = useState({
    currentValue: property?.currentValue || '',
    purchasePrice: property?.purchasePrice || '',
    mortgageBalance: '',
    monthlyMortgage: '',
    monthlyRent: '',
    yearsOwned: '',
    appreciationRate: '4',
    yearsToAnalyze: '5',
  });

  const [result, setResult] = useState(null);

  const analyze = () => {
    const cv = parseFloat(inputs.currentValue) || 0;
    const pp = parseFloat(inputs.purchasePrice) || 0;
    const mb = parseFloat(inputs.mortgageBalance) || 0;
    const mm = parseFloat(inputs.monthlyMortgage) || 0;
    const mr = parseFloat(inputs.monthlyRent) || 0;
    const ar = parseFloat(inputs.appreciationRate) / 100 || 0.04;
    const yrs = parseFloat(inputs.yearsToAnalyze) || 5;

    // Sell scenario
    const sellingCosts = cv * 0.06; // 6% agent fees + closing costs
    const netProceeds = cv - mb - sellingCosts;
    const capitalGains = cv - pp;

    // Stay scenario
    const futureValue = cv * Math.pow(1 + ar, yrs);
    const futureEquity = futureValue - (mb * 0.85); // rough mortgage paydown
    const totalMortgageCost = mm * 12 * yrs;
    const rentalIncome = mr * 12 * yrs;
    const netStayBenefit = futureEquity - cv + rentalIncome - totalMortgageCost;

    // Breakeven
    const monthsToBreakeven = mb > 0 ? Math.round((sellingCosts / (futureValue - cv) * 12 * yrs)) : 0;

    setResult({
      sell: {
        netProceeds,
        sellingCosts,
        capitalGains,
        recommendation: netProceeds > netStayBenefit ? 'favorable' : 'unfavorable'
      },
      stay: {
        futureValue,
        futureEquity,
        netBenefit: netStayBenefit,
        recommendation: netStayBenefit > netProceeds ? 'favorable' : 'unfavorable'
      },
      winner: netProceeds > netStayBenefit ? 'sell' : 'stay',
      difference: Math.abs(netProceeds - netStayBenefit)
    });
  };

  const fmt = (n) => n < 0
    ? `-$${Math.abs(Math.round(n)).toLocaleString()}`
    : `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 px-8 py-6">
        <h2 className="text-2xl font-extrabold text-white mb-1">Sell or Stay Analyzer</h2>
        <p className="text-slate-400 text-sm">Enter your numbers to see what makes more financial sense</p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { key: 'currentValue', label: 'Current Home Value', placeholder: '450000' },
            { key: 'purchasePrice', label: 'Original Purchase Price', placeholder: '320000' },
            { key: 'mortgageBalance', label: 'Remaining Mortgage Balance', placeholder: '280000' },
            { key: 'monthlyMortgage', label: 'Monthly Mortgage Payment', placeholder: '2100' },
            { key: 'monthlyRent', label: 'Monthly Rental Income (if any)', placeholder: '0' },
            { key: 'yearsToAnalyze', label: 'Years to Analyze', placeholder: '5' },
            { key: 'appreciationRate', label: 'Expected Annual Appreciation %', placeholder: '4' },
          ].map(field => (
            <div key={field.key}>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">{field.label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-medium">
                  {field.key === 'appreciationRate' || field.key === 'yearsToAnalyze' || field.key === 'yearsOwned' ? '' : '$'}
                </span>
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  value={inputs[field.key]}
                  onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className={`h-12 ${field.key !== 'appreciationRate' && field.key !== 'yearsToAnalyze' ? 'pl-7' : ''} rounded-xl border-slate-200`}
                />
                {(field.key === 'appreciationRate') && (
                  <span className="absolute right-3 top-3 text-slate-400">%</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={analyze}
          className="w-full h-14 text-base font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white mb-8"
        >
          <BarChart2 className="w-5 h-5 mr-2" />
          Analyze My Options
        </Button>

        {result && (
          <div className="space-y-6">
            {/* Winner Banner */}
            <div className={`rounded-2xl p-6 text-center ${result.winner === 'stay' ? 'bg-blue-50 border border-blue-100' : 'bg-green-50 border border-green-100'}`}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Based on your numbers
              </p>
              <p className={`text-3xl font-extrabold mb-2 ${result.winner === 'stay' ? 'text-blue-700' : 'text-green-700'}`}>
                {result.winner === 'stay' ? '🏠 Stay Put' : '🔑 Consider Selling'}
              </p>
              <p className="text-slate-600 text-sm">
                {result.winner === 'stay'
                  ? `Staying could be worth ${fmt(result.difference)} more than selling right now`
                  : `Selling could put ${fmt(result.difference)} more in your pocket vs staying`
                }
              </p>
            </div>

            {/* Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sell Card */}
              <div className={`rounded-2xl border p-6 ${result.sell.recommendation === 'favorable' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.sell.recommendation === 'favorable' ? 'bg-green-500' : 'bg-slate-400'}`}>
                    {result.sell.recommendation === 'favorable'
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : <Minus className="w-4 h-4 text-white" />
                    }
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">If You Sell</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Net Proceeds</span>
                    <span className="font-bold text-slate-900">{fmt(result.sell.netProceeds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Selling Costs (6%)</span>
                    <span className="font-bold text-red-500">-{fmt(result.sell.sellingCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Capital Gains</span>
                    <span className="font-bold text-slate-900">{fmt(result.sell.capitalGains)}</span>
                  </div>
                </div>
              </div>

              {/* Stay Card */}
              <div className={`rounded-2xl border p-6 ${result.stay.recommendation === 'favorable' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.stay.recommendation === 'favorable' ? 'bg-blue-500' : 'bg-slate-400'}`}>
                    {result.stay.recommendation === 'favorable'
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : <Minus className="w-4 h-4 text-white" />
                    }
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">If You Stay</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Future Value ({inputs.yearsToAnalyze} yrs)</span>
                    <span className="font-bold text-slate-900">{fmt(result.stay.futureValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Future Equity</span>
                    <span className="font-bold text-blue-600">{fmt(result.stay.futureEquity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Net Benefit</span>
                    <span className={`font-bold ${result.stay.netBenefit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {fmt(result.stay.netBenefit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              * This is an estimate for planning purposes only. Consult a real estate professional before making decisions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Property Value Card ──────────────────────────────────────────────
const PropertyCard = ({ property, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(property.currentValue || '');

  const gain = property.currentValue - property.purchasePrice;
  const gainPct = property.purchasePrice > 0
    ? ((gain / property.purchasePrice) * 100).toFixed(1)
    : 0;
  const isUp = gain >= 0;

  const handleSave = () => {
    onUpdate(property.id, parseFloat(newValue));
    setEditing(false);
  };

  // Generate sparkline data
  const sparkData = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    value: property.purchasePrice * (1 + (gainPct / 100) * (i / 11))
  }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Top bar */}
      <div className={`h-1.5 w-full ${isUp ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{property.name}</h3>
            <p className="text-slate-400 text-sm">{property.address}</p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {gainPct}%
          </div>
        </div>

        {/* Current Value */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Current Value</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                className="h-10 rounded-xl text-2xl font-bold"
                autoFocus
              />
              <button onClick={handleSave} className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white hover:bg-green-600">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing(false)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-extrabold text-slate-900">
                ${property.currentValue?.toLocaleString() || '—'}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="h-16 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={isUp ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium mb-1">Purchased</p>
            <p className="font-bold text-slate-900 text-sm">${property.purchasePrice?.toLocaleString() || '—'}</p>
          </div>
          <div className={`rounded-xl p-3 ${isUp ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-xs text-slate-400 font-medium mb-1">Total Gain</p>
            <p className={`font-bold text-sm ${isUp ? 'text-green-600' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{gain > 0 ? '$' : '-$'}{Math.abs(Math.round(gain)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Zillow Link */}
        <a
          href={`https://www.zillow.com/homes/${encodeURIComponent(property.address || property.name)}_rb/`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          <Home className="w-4 h-4" />
          Check Zillow Estimate
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

// ─── Add Property Modal ───────────────────────────────────────────────
const AddPropertyModal = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    name: '', address: '', purchasePrice: '', currentValue: '', purchaseYear: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...form,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      currentValue: parseFloat(form.currentValue) || 0,
      purchaseYear: parseInt(form.purchaseYear) || new Date().getFullYear(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add Property</h2>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Property Name', placeholder: 'Lake House' },
            { key: 'address', label: 'Address', placeholder: '123 Main St, Atlanta GA' },
            { key: 'purchasePrice', label: 'Purchase Price', placeholder: '350000', prefix: '$' },
            { key: 'currentValue', label: 'Current Estimated Value', placeholder: '425000', prefix: '$' },
            { key: 'purchaseYear', label: 'Year Purchased', placeholder: '2018' },
          ].map(field => (
            <div key={field.key}>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">{field.label}</Label>
              <div className="relative">
                {field.prefix && <span className="absolute left-3 top-3 text-slate-400">{field.prefix}</span>}
                <Input
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className={`h-11 rounded-xl ${field.prefix ? 'pl-7' : ''}`}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold">Add Property</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Market Comparison ────────────────────────────────────────────────
const MarketComparison = ({ properties }) => {
  const totalValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalPurchased = properties.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  const totalGain = totalValue - totalPurchased;
  const totalGainPct = totalPurchased > 0 ? ((totalGain / totalPurchased) * 100).toFixed(1) : 0;

  // SP500 comparison (rough 10yr avg 10%)
  const sp500Value = totalPurchased * 1.10;
  const sp500Gain = sp500Value - totalPurchased;

  const chartData = [
    { name: 'Your Portfolio', value: totalValue, gain: totalGain, color: '#2563eb' },
    { name: 'S&P 500 (10% avg)', value: sp500Value, gain: sp500Gain, color: '#94a3b8' },
    { name: 'National RE (4% avg)', value: totalPurchased * 1.04, gain: totalPurchased * 0.04, color: '#10b981' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Portfolio vs Market</h2>
      <p className="text-slate-500 text-sm mb-8">How your real estate stacks up against other investments</p>

      {/* Total Portfolio */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-white">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Value</p>
            <p className="text-2xl font-extrabold">${totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Invested</p>
            <p className="text-2xl font-extrabold">${totalPurchased.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Gain</p>
            <p className={`text-2xl font-extrabold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}${Math.round(totalGain).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Bars */}
      <div className="space-y-4">
        {chartData.map((item, i) => {
          const pct = totalPurchased > 0 ? ((item.value / totalPurchased - 1) * 100).toFixed(1) : 0;
          const barWidth = Math.min(Math.abs(pct) * 2, 100);
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                <span className={`text-sm font-bold ${pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {pct >= 0 ? '+' : ''}{pct}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${barWidth}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const HomeValuationPage = () => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([
    { id: 1, name: 'Primary Home', address: '', purchasePrice: 350000, currentValue: 425000, purchaseYear: 2019 },
    { id: 2, name: 'Lake House', address: '', purchasePrice: 280000, currentValue: 310000, purchaseYear: 2021 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleUpdateValue = (id, newValue) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, currentValue: newValue } : p));
  };

  const handleAddProperty = (property) => {
    setProperties(prev => [...prev, { ...property, id: Date.now() }]);
  };

  const totalValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalGain = properties.reduce((s, p) => s + ((p.currentValue || 0) - (p.purchasePrice || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Helmet>
        <title>Home Valuations — CasaCEO</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                Home Valuations
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                Track your property values, compare to the market, and decide whether to sell or stay.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 px-6 py-4 text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Portfolio Value</p>
                <p className="text-2xl font-extrabold text-slate-900">${totalValue.toLocaleString()}</p>
                <p className={`text-sm font-bold ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalGain >= 0 ? '+' : ''}${Math.round(totalGain).toLocaleString()} total gain
                </p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="rounded-xl h-14 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: 'overview', label: 'My Properties' },
            { key: 'market', label: 'Market Compare' },
            { key: 'analyzer', label: 'Sell or Stay?' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onUpdate={handleUpdateValue}
              />
            ))}
            {/* Add Property Card */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all group min-h-64"
            >
              <div className="w-14 h-14 bg-slate-100 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-7 h-7" />
              </div>
              <p className="font-semibold text-base">Add Property</p>
              <p className="text-sm mt-1">Track another home's value</p>
            </button>
          </div>
        )}

        {/* Market Compare Tab */}
        {activeTab === 'market' && (
          <MarketComparison properties={properties} />
        )}

        {/* Sell or Stay Tab */}
        {activeTab === 'analyzer' && (
          <div className="max-w-3xl">
            {/* Property Selector */}
            {properties.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Select a Property to Analyze</Label>
                <div className="flex gap-3 flex-wrap">
                  {properties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProperty(p)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        selectedProperty?.id === p.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <SellOrStayAnalyzer property={selectedProperty || properties[0]} />
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPropertyModal
          onAdd={handleAddProperty}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default HomeValuationPage;
