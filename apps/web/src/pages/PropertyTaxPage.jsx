import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingDown, TrendingUp, AlertCircle,
  CheckCircle2, Info, Calculator, FileText, Search,
  ChevronDown, ChevronUp, Plus, X, Edit2, Home,
  ArrowRight, Lightbulb, Shield, BarChart2, Clock,
  ExternalLink, Star, AlertTriangle, Building2
} from 'lucide-react';

// ─── Expandable Section ───────────────────────────────────────────────
const Section = ({ title, icon, children, defaultOpen = false, accent = '#1e3a5f' }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base text-left">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-slate-50">{children}</div>}
    </div>
  );
};

// ─── Assessment Analyzer ─────────────────────────────────────────────
const AssessmentAnalyzer = () => {
  const [form, setForm] = useState({
    assessedValue: '',
    marketValue: '',
    taxRate: '',
    annualTax: '',
    state: '',
    comp1: '', comp2: '', comp3: '',
  });
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const analyze = () => {
    const av = parseFloat(form.assessedValue) || 0;
    const mv = parseFloat(form.marketValue) || 0;
    const rate = parseFloat(form.taxRate) / 100 || 0;
    const tax = parseFloat(form.annualTax) || 0;

    const assessmentRatio = mv > 0 ? (av / mv) * 100 : 0;
    const expectedTax = av * rate;
    const taxDiff = tax - expectedTax;
    const avgs = [form.comp1, form.comp2, form.comp3]
      .map(v => parseFloat(v) || 0).filter(v => v > 0);
    const avgComp = avgs.length > 0 ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
    const compRatio = avgComp > 0 ? (av / avgComp) * 100 : 0;

    let appealStrength = 'Weak';
    let appealColor = '#94a3b8';
    let savings = 0;
    const reasons = [];

    if (assessmentRatio > 100) {
      reasons.push(`Your assessed value ($${av.toLocaleString()}) exceeds market value ($${mv.toLocaleString()})`);
      appealStrength = 'Strong';
      appealColor = '#059669';
      savings = Math.max(savings, (av - mv) * rate);
    }
    if (compRatio > 110 && avgComp > 0) {
      reasons.push(`Your assessed value is ${(compRatio - 100).toFixed(1)}% higher than similar homes nearby`);
      if (appealStrength !== 'Strong') appealStrength = 'Moderate';
      appealColor = '#d97706';
      savings = Math.max(savings, (av - avgComp) * rate);
    }
    if (assessmentRatio > 90 && assessmentRatio <= 100) {
      reasons.push('Assessment is close to market value — may still be worth appealing');
      if (appealStrength === 'Weak') { appealStrength = 'Possible'; appealColor = '#d97706'; }
    }
    if (reasons.length === 0) {
      reasons.push('Assessment appears fair based on the data provided');
    }

    setResult({ assessmentRatio, expectedTax, taxDiff, compRatio, avgComp, appealStrength, appealColor, savings, reasons });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'assessedValue', label: 'Assessed Value (from tax bill)', prefix: '$', placeholder: '280000' },
          { key: 'marketValue', label: 'Actual Market Value (Zillow/Redfin)', prefix: '$', placeholder: '320000' },
          { key: 'annualTax', label: 'Annual Property Tax Bill', prefix: '$', placeholder: '4200' },
          { key: 'taxRate', label: 'Tax Rate (mill rate)', suffix: '%', placeholder: '1.5' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
            <div className="relative">
              {f.prefix && <span className="absolute left-3 top-3 text-slate-400 text-sm">{f.prefix}</span>}
              <input
                type="number"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className={`w-full h-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${f.prefix ? 'pl-7' : 'pl-3'} ${f.suffix ? 'pr-8' : 'pr-3'}`}
              />
              {f.suffix && <span className="absolute right-3 top-3 text-slate-400 text-sm">{f.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Comparable Properties */}
      <div className="bg-slate-50 rounded-2xl p-5">
        <p className="text-sm font-bold text-slate-700 mb-1">Comparable Properties (optional but powerful)</p>
        <p className="text-xs text-slate-400 mb-4">Enter assessed values of 2-3 similar homes in your neighborhood — find these on your county assessor's website</p>
        <div className="grid grid-cols-3 gap-3">
          {['comp1', 'comp2', 'comp3'].map((key, i) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Comp #{i + 1} Assessed Value</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="260000"
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={!form.assessedValue}
        className="w-full h-12 rounded-xl text-white text-sm font-bold disabled:opacity-50"
        style={{ background: '#1e3a5f' }}
      >
        <BarChart2 className="w-4 h-4 inline mr-2" /> Analyze My Assessment
      </button>

      {result && (
        <div className="space-y-4">
          {/* Appeal Strength Banner */}
          <div className="rounded-2xl p-5 border" style={{ background: `${result.appealColor}10`, borderColor: `${result.appealColor}30` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Appeal Strength</p>
                <p className="text-2xl font-extrabold" style={{ color: result.appealColor }}>{result.appealStrength}</p>
              </div>
              {result.savings > 0 && (
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Potential Annual Savings</p>
                  <p className="text-2xl font-extrabold text-green-600">${Math.round(result.savings).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {result.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: result.appealColor }} />
                  <p className="text-sm text-slate-700">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Assessment Ratio', value: `${result.assessmentRatio.toFixed(1)}%`, sub: 'vs market value', good: result.assessmentRatio <= 100 },
              { label: 'Expected Tax', value: `$${Math.round(result.expectedTax).toLocaleString()}`, sub: 'based on rate', good: true },
              result.avgComp > 0 && { label: 'vs Comparable Avg', value: `${result.compRatio.toFixed(1)}%`, sub: 'of nearby homes', good: result.compRatio <= 100 },
            ].filter(Boolean).map((stat, i) => (
              <div key={i} className={`rounded-xl p-4 text-center ${stat.good ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <p className={`text-xl font-extrabold ${stat.good ? 'text-green-700' : 'text-red-600'}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                <p className="text-xs text-slate-400">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Results are estimates for planning purposes. Consult a local tax professional or attorney before filing a formal appeal.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Property Tax Tracker ─────────────────────────────────────────────
const TaxTracker = () => {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', assessedValue: '', annualTax: '',
    dueDate1: '', dueDate2: '', lastPaid: '', taxYear: new Date().getFullYear().toString(),
    notes: '', county: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addProperty = () => {
    if (!form.name) return;
    setProperties(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: '', address: '', assessedValue: '', annualTax: '', dueDate1: '', dueDate2: '', lastPaid: '', taxYear: new Date().getFullYear().toString(), notes: '', county: '' });
    setShowForm(false);
  };

  const totalTax = properties.reduce((s, p) => s + (parseFloat(p.annualTax) || 0), 0);

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {properties.length > 0 && (
          <div className="bg-slate-50 rounded-xl px-4 py-2 text-sm">
            <span className="text-slate-500">Total annual property taxes: </span>
            <span className="font-extrabold text-slate-900">${totalTax.toLocaleString()}</span>
          </div>
        )}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white ml-auto"
          style={{ background: '#1e3a5f' }}
        >
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <p className="font-bold text-slate-900 text-sm mb-4">Add Property Tax Record</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { key: 'name', label: 'Property Name', placeholder: 'Primary Home' },
              { key: 'county', label: 'County / Jurisdiction', placeholder: 'Gwinnett County, GA' },
              { key: 'assessedValue', label: 'Assessed Value', placeholder: '280000', prefix: '$' },
              { key: 'annualTax', label: 'Annual Tax Amount', placeholder: '4200', prefix: '$' },
              { key: 'dueDate1', label: 'Due Date (1st installment)', type: 'date' },
              { key: 'dueDate2', label: 'Due Date (2nd installment)', type: 'date' },
              { key: 'lastPaid', label: 'Last Payment Date', type: 'date' },
              { key: 'taxYear', label: 'Tax Year', placeholder: '2024' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                <div className="relative">
                  {f.prefix && <span className="absolute left-3 top-2.5 text-slate-400 text-sm">{f.prefix}</span>}
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    className={`w-full h-10 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${f.prefix ? 'pl-7' : 'pl-3'} pr-3`}
                  />
                </div>
              </div>
            ))}
          </div>
          <input
            placeholder="Notes (exemptions, payment plan, appeal status...)"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white mb-3 focus:outline-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500">Cancel</button>
            <button onClick={addProperty} disabled={!form.name} className="flex-1 h-10 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: '#1e3a5f' }}>Save</button>
          </div>
        </div>
      )}

      {properties.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400 text-sm">No properties tracked yet</p>
          <p className="text-slate-300 text-xs mt-1">Add your properties to track tax bills and due dates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map(p => {
            const days1 = getDaysUntil(p.dueDate1);
            const days2 = getDaysUntil(p.dueDate2);
            const nextDue = [days1, days2].filter(d => d !== null && d >= 0).sort((a, b) => a - b)[0];
            const isUrgent = nextDue !== null && nextDue <= 30;
            return (
              <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isUrgent ? 'border-orange-200' : 'border-slate-100'}`}>
                {isUrgent && <div className="h-1 w-full rounded-t-2xl -mt-5 mb-4 rounded-t-2xl" style={{ background: '#f97316' }}></div>}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    {p.county && <p className="text-xs text-slate-400">{p.county}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-slate-900">${parseFloat(p.annualTax || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">per year · {p.taxYear}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {p.assessedValue && (
                    <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-slate-400">Assessed</p>
                      <p className="font-bold text-slate-900 text-sm">${parseFloat(p.assessedValue).toLocaleString()}</p>
                    </div>
                  )}
                  {p.dueDate1 && (
                    <div className={`rounded-xl p-2.5 text-center ${days1 !== null && days1 <= 30 ? 'bg-orange-50' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Due Date 1</p>
                      <p className={`font-bold text-sm ${days1 !== null && days1 <= 30 ? 'text-orange-600' : 'text-slate-900'}`}>
                        {new Date(p.dueDate1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {days1 !== null && days1 >= 0 && <p className="text-xs text-slate-400">{days1}d away</p>}
                    </div>
                  )}
                  {p.dueDate2 && (
                    <div className={`rounded-xl p-2.5 text-center ${days2 !== null && days2 <= 30 ? 'bg-orange-50' : 'bg-slate-50'}`}>
                      <p className="text-xs text-slate-400">Due Date 2</p>
                      <p className={`font-bold text-sm ${days2 !== null && days2 <= 30 ? 'text-orange-600' : 'text-slate-900'}`}>
                        {new Date(p.dueDate2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {days2 !== null && days2 >= 0 && <p className="text-xs text-slate-400">{days2}d away</p>}
                    </div>
                  )}
                </div>
                {p.notes && <p className="text-xs text-slate-400 italic">{p.notes}</p>}
                <button onClick={() => setProperties(prev => prev.filter(x => x.id !== p.id))} className="mt-3 text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const PropertyTaxPage = () => {
  const [activeTab, setActiveTab] = useState('analyzer');

  return (
    <>
      <Helmet><title>Property Tax Analyzer — CasaCEO</title></Helmet>

      <div className="max-w-4xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#c9a96e', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">Property Tax Analyzer</h1>
            <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
              Find out if you're being over-assessed, how to appeal, and track all your property tax bills in one place.
            </p>
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 mt-5 max-w-lg">
              <p className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-300" /> Did you know?
              </p>
              <p className="text-blue-200 text-xs leading-relaxed">
                Studies show 30-60% of properties are over-assessed. Successful appeals typically reduce taxes by $500-2,000 per year — and most counties make it easy to do yourself.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'analyzer', label: 'Appeal Analyzer', icon: <BarChart2 className="w-4 h-4" /> },
            { key: 'tracker', label: 'Tax Tracker', icon: <Building2 className="w-4 h-4" /> },
            { key: 'guide', label: 'How to Appeal', icon: <FileText className="w-4 h-4" /> },
            { key: 'exemptions', label: 'Exemptions', icon: <DollarSign className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              style={activeTab === tab.key ? { background: '#1e3a5f' } : {}}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── ANALYZER TAB ── */}
        {activeTab === 'analyzer' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Am I Over-Assessed?</h2>
            <p className="text-slate-500 text-sm mb-6">Enter your property details to find out if you're paying more than your fair share — and how strong your appeal case is.</p>
            <AssessmentAnalyzer />
          </div>
        )}

        {/* ── TRACKER TAB ── */}
        {activeTab === 'tracker' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Property Tax Tracker</h2>
            <p className="text-slate-500 text-sm mb-6">Track assessed values, annual bills, and due dates across all your properties so nothing gets missed.</p>
            <TaxTracker />
          </div>
        )}

        {/* ── HOW TO APPEAL TAB ── */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">How to Appeal Your Property Tax</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Most counties allow you to appeal your assessment — and it's easier than most people think. Here's the step-by-step process.
              </p>
            </div>

            {[
              {
                step: '01', title: 'Get Your Assessment Notice',
                desc: 'Your county assessor mails a notice of assessment — usually in spring. This shows your assessed value and the deadline to appeal (typically 30-90 days from notice date).',
                accent: '#2563eb',
                tips: ['Keep every assessment notice you receive', 'Deadline to appeal is strict — missing it means waiting another year', 'Check your county assessor website if you didn\'t receive one'],
              },
              {
                step: '02', title: 'Research Your Market Value',
                desc: 'Pull recent sales of comparable homes (comps) within 1 mile, built within 5 years of yours, similar size and condition. Zillow, Redfin, and your county records are free sources.',
                accent: '#059669',
                tips: ['Look for sales in the last 6-12 months', '3-5 comps is ideal', 'County assessor\'s website shows assessed values of all homes — use this to find neighbors paying less'],
              },
              {
                step: '03', title: 'File Your Appeal',
                desc: 'Most counties have a simple online or mail-in form. State that you believe your assessed value exceeds market value and list your evidence (comps, photos of property issues).',
                accent: '#7c3aed',
                tips: ['Filing is usually free or low cost', 'You don\'t need a lawyer for informal appeals', 'Include photos of any condition issues that reduce value (foundation cracks, roof damage, etc.)'],
              },
              {
                step: '04', title: 'Attend Your Hearing',
                desc: 'Most informal hearings are 15-20 minutes with an assessor\'s office representative. Present your comps calmly and factually. Most are settled at this stage.',
                accent: '#f97316',
                tips: ['Dress professionally — first impressions matter', 'Be polite and factual, not emotional', 'Bring printed copies of all your evidence', 'Ask for a reduction to a specific number, not just "lower it"'],
              },
              {
                step: '05', title: 'Formal Board Appeal (if needed)',
                desc: 'If the informal hearing doesn\'t resolve it, you can escalate to the Board of Equalization or equivalent. This is more formal but still DIY-able for most homeowners.',
                accent: '#dc2626',
                tips: ['Consider a property tax attorney or consultant for large potential savings (they work on contingency)', 'Success rates at formal hearings are still 50%+', 'Even a partial reduction is worth it'],
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-stretch">
                  <div className="w-16 flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xl" style={{ background: item.accent }}>
                    {item.step}
                  </div>
                  <div className="p-5 flex-1">
                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                    <div className="space-y-1.5">
                      {item.tips.map((tip, ti) => (
                        <div key={ti} className="flex items-start gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Find your county */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" /> Find Your County Assessor
              </h3>
              <p className="text-slate-500 text-sm mb-4">Search for your county's property tax appeal process and deadlines:</p>
              <a
                href="https://www.google.com/search?q=property+tax+appeal+my+county+assessor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Search for your county assessor's appeal process
              </a>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="font-bold text-amber-800 text-sm flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" /> Important Disclaimer
              </p>
              <p className="text-amber-600 text-xs leading-relaxed">
                Property tax laws and appeal processes vary significantly by state and county. This guide is general information only. For complex situations or large potential savings, consult a licensed property tax consultant or attorney in your area.
              </p>
            </div>
          </div>
        )}

        {/* ── EXEMPTIONS TAB ── */}
        {activeTab === 'exemptions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-2">
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Property Tax Exemptions</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Millions of homeowners miss exemptions they qualify for — leaving hundreds or thousands of dollars on the table every year. Check all that apply to you.
              </p>
            </div>

            {[
              {
                title: 'Homestead Exemption',
                savings: '$500 – $5,000+/year',
                who: 'Primary residence owners',
                color: '#059669', bg: '#ecfdf5',
                desc: 'The most common and valuable exemption. Reduces the assessed value of your primary home. Available in most states — but you must apply.',
                action: 'Apply through your county assessor\'s office. Usually a one-time application.',
                important: 'Must be your primary residence. Cannot apply to rental properties.',
              },
              {
                title: 'Senior Citizen Exemption',
                savings: '$500 – $3,000+/year',
                who: 'Homeowners 65+',
                color: '#2563eb', bg: '#eff6ff',
                desc: 'Many states offer additional reductions or freezes for seniors. Some programs freeze your assessment at current levels regardless of market increases.',
                action: 'Contact your county assessor or state revenue department. Usually requires proof of age and income limits.',
                important: 'Income limits vary by state. Apply every year in some jurisdictions.',
              },
              {
                title: 'Veteran / Disability Exemption',
                savings: 'Varies widely — up to full exemption',
                who: 'Veterans, disabled homeowners',
                color: '#7c3aed', bg: '#f5f3ff',
                desc: 'Veterans with service-connected disabilities and homeowners with qualifying disabilities often receive significant reductions or complete exemptions.',
                action: 'Apply through your county assessor with discharge papers (DD-214) or disability documentation.',
                important: 'Disability percentage affects exemption amount in many states.',
              },
              {
                title: 'Agricultural / Greenbelt',
                savings: 'Can reduce assessment by 50-90%',
                who: 'Properties with agricultural use',
                color: '#16a34a', bg: '#f0fdf4',
                desc: 'If any portion of your property is used for farming, timber, or qualifying agricultural purposes, you may qualify for a drastically reduced assessment.',
                action: 'Apply through county assessor. May require proof of agricultural use and minimum acreage.',
                important: 'Rollback taxes may apply if land use changes.',
              },
              {
                title: 'Historic Property Exemption',
                savings: 'Varies by state',
                who: 'Owners of historic buildings',
                color: '#d97706', bg: '#fffbeb',
                desc: 'Properties on historic registers may qualify for reduced assessments, especially if rehabilitated according to preservation standards.',
                action: 'Contact your state historic preservation office and county assessor.',
                important: 'Usually requires listing on National or State Register of Historic Places.',
              },
              {
                title: 'Energy Efficiency Exemption',
                savings: '$100 – $1,000+/year',
                who: 'Homes with solar or energy improvements',
                color: '#0891b2', bg: '#ecfeff',
                desc: 'Many states exclude the added value of solar panels, energy-efficient improvements, or green building features from your assessed value.',
                action: 'Check with your county assessor when filing permits for solar or major efficiency upgrades.',
                important: 'Availability varies significantly by state and county.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50" style={{ background: item.bg }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.who}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold" style={{ color: item.color }}>{item.savings}</p>
                      <p className="text-xs text-slate-400">typical savings</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> How to Apply
                    </p>
                    <p className="text-xs text-green-700">{item.action}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Important
                    </p>
                    <p className="text-xs text-amber-700">{item.important}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 text-sm">Exemptions vary by location</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Property tax exemptions are governed by state and local law and change frequently. Always verify current exemptions with your county assessor's office or a local tax professional.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyTaxPage;
