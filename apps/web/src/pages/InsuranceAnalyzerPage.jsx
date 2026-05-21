import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Shield, Plus, X, Edit2, Check, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, ArrowRight, Bell, DollarSign,
  Calendar, Building2, Car, Heart, Umbrella, Home,
  FileText, TrendingUp, AlertTriangle, Info, Star,
  Phone, Mail, ExternalLink, BarChart2, Eye
} from 'lucide-react';

// ─── Insurance Types ──────────────────────────────────────────────────
const INSURANCE_TYPES = [
  { key: 'homeowners', label: 'Homeowners', icon: Home, color: '#2563eb', bg: '#eff6ff', desc: 'Dwelling, personal property, liability' },
  { key: 'landlord', label: 'Landlord / Rental', icon: Building2, color: '#7c3aed', bg: '#f5f3ff', desc: 'Loss of rent, tenant liability' },
  { key: 'flood', label: 'Flood', icon: Shield, color: '#0891b2', bg: '#ecfeff', desc: 'Flood damage not in standard policies' },
  { key: 'umbrella', label: 'Umbrella', icon: Umbrella, color: '#1e3a5f', bg: '#eef2f8', desc: 'Extra liability above other policies' },
  { key: 'auto', label: 'Auto', icon: Car, color: '#f97316', bg: '#fff7ed', desc: 'Vehicle coverage and liability' },
  { key: 'life', label: 'Life', icon: Heart, color: '#dc2626', bg: '#fef2f2', desc: 'Term, whole, or universal life' },
  { key: 'title', label: 'Title', icon: FileText, color: '#059669', bg: '#ecfdf5', desc: 'Protects ownership rights' },
  { key: 'earthquake', label: 'Earthquake', icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', desc: 'Seismic damage not in standard policies' },
];

const COVERAGE_RECOMMENDATIONS = {
  homeowners: {
    minCoverage: 'Full replacement cost of structure',
    liability: '$300,000 minimum personal liability',
    tips: [
      'Insure for full replacement cost — not market value',
      'Include extended replacement cost endorsement (20-25% buffer)',
      'Add scheduled personal property for jewelry, art, collectibles',
      'Check inflation guard rider to keep up with construction costs',
    ],
    redFlags: [
      'Actual cash value only (not replacement cost)',
      'Coverage below current rebuild cost per sq ft',
      'No loss of use coverage',
    ]
  },
  landlord: {
    minCoverage: 'Full dwelling replacement cost',
    liability: '$500,000+ liability recommended for rentals',
    tips: [
      'Loss of rental income coverage — covers you if property is uninhabitable',
      'Higher liability limits than standard homeowners',
      'Consider requiring tenants to carry renters insurance',
      'Fair rental value coverage for Airbnb or short-term rentals',
    ],
    redFlags: [
      'No loss of rent coverage',
      'Liability under $300,000',
      'No vandalism coverage',
    ]
  },
  flood: {
    minCoverage: '$250,000 building / $100,000 contents (NFIP max)',
    liability: 'N/A — flood insurance does not include liability',
    tips: [
      'Standard homeowners does NOT cover flooding',
      'FEMA flood maps change — check yours annually',
      'Consider excess flood coverage above NFIP limits',
      'Even low-risk zones can flood — 25% of claims come from outside high-risk zones',
    ],
    redFlags: [
      'No flood policy in flood zone A or V',
      'Relying only on NFIP without excess coverage for high-value homes',
    ]
  },
  umbrella: {
    minCoverage: '$1M minimum — $2M+ for multi-property owners',
    liability: 'This IS the liability coverage',
    tips: [
      'Umbrella kicks in when auto or home liability limits are exhausted',
      'Critical for rental property owners — tenant injuries are a real risk',
      'Usually very affordable — $1M policy often under $300/year',
      'Make sure underlying policies meet umbrella\'s minimum requirements',
    ],
    redFlags: [
      'No umbrella policy if you own rental properties',
      'Coverage gap between underlying policies and umbrella',
    ]
  },
  auto: {
    minCoverage: '100/300/100 liability minimum recommended',
    liability: '$100k per person / $300k per accident / $100k property',
    tips: [
      '100/300/100 is the minimum recommended — state minimums are usually inadequate',
      'Uninsured/underinsured motorist coverage is often overlooked but critical',
      'Comprehensive and collision if vehicle value justifies it',
      'Review annually — vehicle depreciation may change needs',
    ],
    redFlags: [
      'State minimum only liability limits',
      'No uninsured motorist coverage',
      'Gap between auto and umbrella policy',
    ]
  },
  life: {
    minCoverage: '10-12x annual income recommended',
    liability: 'N/A',
    tips: [
      'Term life is usually most cost effective for income replacement',
      'Consider mortgage payoff amount when calculating coverage needs',
      'Review after major life events — marriage, children, property purchase',
      'Don\'t forget coverage for non-working spouse',
    ],
    redFlags: [
      'Coverage less than 5x annual income with dependents',
      'No beneficiary update after divorce or death',
      'Policies that lapse without notice',
    ]
  },
  title: {
    minCoverage: 'Purchase price of property',
    liability: 'N/A',
    tips: [
      'Owner\'s title insurance is a one-time purchase at closing',
      'Protects against prior liens, forgeries, and ownership disputes',
      'Lender\'s title policy only protects the bank — not you',
      'Consider enhanced coverage for additional protections',
    ],
    redFlags: [
      'Only lender\'s policy — no owner\'s policy',
      'No coverage on investment properties',
    ]
  },
  earthquake: {
    minCoverage: 'Dwelling replacement cost',
    liability: 'N/A',
    tips: [
      'Standard homeowners does NOT cover earthquake damage',
      'High deductibles are common (10-20% of dwelling value)',
      'CEA offers policies in California — other states vary',
      'Retrofitting older homes can lower premiums significantly',
    ],
    redFlags: [
      'No earthquake policy if in seismic zone',
      'Older home without seismic retrofit in high-risk area',
    ]
  },
};

// ─── Coverage Score ───────────────────────────────────────────────────
const getCoverageScore = (policies) => {
  if (policies.length === 0) return { score: 0, grade: 'F', color: '#dc2626' };
  let score = 0;
  const hasType = (key) => policies.some(p => p.type === key && p.status === 'active');

  if (hasType('homeowners')) score += 25;
  if (hasType('umbrella')) score += 20;
  if (hasType('auto')) score += 15;
  if (hasType('life')) score += 15;
  if (hasType('landlord') || policies.some(p => p.isRental)) score += 10;
  if (hasType('flood')) score += 10;
  if (hasType('title')) score += 5;

  const expiringSoon = policies.filter(p => {
    if (!p.renewalDate) return false;
    const days = Math.ceil((new Date(p.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0;
  }).length;
  score -= expiringSoon * 5;
  score = Math.max(0, Math.min(100, score));

  if (score >= 85) return { score, grade: 'A', color: '#059669' };
  if (score >= 70) return { score, grade: 'B', color: '#16a34a' };
  if (score >= 55) return { score, grade: 'C', color: '#d97706' };
  if (score >= 40) return { score, grade: 'D', color: '#ea580c' };
  return { score, grade: 'F', color: '#dc2626' };
};

// ─── Add/Edit Policy Modal ────────────────────────────────────────────
const PolicyModal = ({ policy, onSave, onClose }) => {
  const [form, setForm] = useState({
    type: policy?.type || 'homeowners',
    insurer: policy?.insurer || '',
    policyNumber: policy?.policyNumber || '',
    premium: policy?.premium || '',
    premiumFrequency: policy?.premiumFrequency || 'annual',
    coverageAmount: policy?.coverageAmount || '',
    deductible: policy?.deductible || '',
    renewalDate: policy?.renewalDate || '',
    startDate: policy?.startDate || '',
    agentName: policy?.agentName || '',
    agentPhone: policy?.agentPhone || '',
    agentEmail: policy?.agentEmail || '',
    property: policy?.property || '',
    notes: policy?.notes || '',
    status: policy?.status || 'active',
    isRental: policy?.isRental || false,
  });

  const selectedType = INSURANCE_TYPES.find(t => t.key === form.type);

  const daysToRenewal = form.renewalDate
    ? Math.ceil((new Date(form.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4">
        <div className="rounded-t-3xl px-8 py-6 flex items-center justify-between" style={{ background: '#1e3a5f' }}>
          <div>
            <h2 className="text-xl font-bold text-white">{policy ? 'Edit Policy' : 'Add Insurance Policy'}</h2>
            <p className="text-blue-200 text-sm">Keep all your coverage in one place</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Insurance Type */}
          <div>
            <label className="text-sm font-bold text-slate-700 mb-3 block">Insurance Type</label>
            <div className="grid grid-cols-4 gap-2">
              {INSURANCE_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    onClick={() => setForm(p => ({ ...p, type: type.key }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      form.type === type.key
                        ? 'border-2 text-white'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    style={form.type === type.key ? { background: type.color, borderColor: type.color } : {}}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" style={form.type !== type.key ? { color: type.color } : {}} />
                    <span className="text-xs font-semibold">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Insurance Company</label>
              <input
                placeholder="State Farm, Allstate..."
                value={form.insurer}
                onChange={e => setForm(p => ({ ...p, insurer: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Policy Number</label>
              <input
                placeholder="HO-123456789"
                value={form.policyNumber}
                onChange={e => setForm(p => ({ ...p, policyNumber: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Coverage Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="500000"
                  value={form.coverageAmount}
                  onChange={e => setForm(p => ({ ...p, coverageAmount: e.target.value }))}
                  className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Deductible</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="1000"
                  value={form.deductible}
                  onChange={e => setForm(p => ({ ...p, deductible: e.target.value }))}
                  className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Annual Premium</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  placeholder="1200"
                  value={form.premium}
                  onChange={e => setForm(p => ({ ...p, premium: e.target.value }))}
                  className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Property / Vehicle</label>
              <input
                placeholder="Primary Home, Lake House..."
                value={form.property}
                onChange={e => setForm(p => ({ ...p, property: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Renewal Date</label>
              <input
                type="date"
                value={form.renewalDate}
                onChange={e => setForm(p => ({ ...p, renewalDate: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {daysToRenewal !== null && daysToRenewal <= 30 && daysToRenewal >= 0 && (
                <p className="text-xs text-orange-500 mt-1 font-medium">⚠️ Renews in {daysToRenewal} days</p>
              )}
              {daysToRenewal !== null && daysToRenewal < 0 && (
                <p className="text-xs text-red-500 mt-1 font-medium">🔴 Expired {Math.abs(daysToRenewal)} days ago</p>
              )}
            </div>
          </div>

          {/* Agent Info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-bold text-slate-700">Agent / Contact Info</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="Agent name"
                value={form.agentName}
                onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
              />
              <input
                placeholder="Phone"
                value={form.agentPhone}
                onChange={e => setForm(p => ({ ...p, agentPhone: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
              />
              <input
                placeholder="Email"
                value={form.agentEmail}
                onChange={e => setForm(p => ({ ...p, agentEmail: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
            <textarea
              placeholder="Special endorsements, riders, coverage notes..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={() => onSave({ ...form, id: policy?.id || Date.now() })}
              disabled={!form.insurer}
              className="flex-1 h-12 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: '#1e3a5f' }}
            >
              {policy ? 'Save Changes' : 'Add Policy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Policy Card ──────────────────────────────────────────────────────
const PolicyCard = ({ policy, onEdit, onDelete }) => {
  const typeInfo = INSURANCE_TYPES.find(t => t.key === policy.type);
  const Icon = typeInfo?.icon || Shield;

  const today = new Date();
  const renewalDate = policy.renewalDate ? new Date(policy.renewalDate) : null;
  const daysToRenewal = renewalDate ? Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24)) : null;

  const getStatusInfo = () => {
    if (!renewalDate) return { label: 'Active', color: '#059669', bg: '#ecfdf5' };
    if (daysToRenewal < 0) return { label: 'Expired', color: '#dc2626', bg: '#fef2f2' };
    if (daysToRenewal <= 30) return { label: `Renews in ${daysToRenewal}d`, color: '#f97316', bg: '#fff7ed' };
    if (daysToRenewal <= 60) return { label: `Renews in ${daysToRenewal}d`, color: '#d97706', bg: '#fffbeb' };
    return { label: 'Active', color: '#059669', bg: '#ecfdf5' };
  };

  const status = getStatusInfo();
  const isUrgent = daysToRenewal !== null && daysToRenewal <= 30;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${isUrgent ? 'border-orange-200' : 'border-slate-100'}`}>
      {isUrgent && <div className="h-1 w-full rounded-t-2xl" style={{ background: daysToRenewal < 0 ? '#dc2626' : '#f97316' }}></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: typeInfo?.bg }}>
              <Icon className="w-5 h-5" style={{ color: typeInfo?.color }} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{typeInfo?.label || policy.type}</p>
              <p className="text-slate-400 text-xs">{policy.insurer}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>

        {policy.property && (
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> {policy.property}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          {policy.coverageAmount && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">Coverage</p>
              <p className="font-bold text-slate-900 text-sm">${parseFloat(policy.coverageAmount).toLocaleString()}</p>
            </div>
          )}
          {policy.premium && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">Premium/yr</p>
              <p className="font-bold text-slate-900 text-sm">${parseFloat(policy.premium).toLocaleString()}</p>
            </div>
          )}
          {policy.deductible && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">Deductible</p>
              <p className="font-bold text-slate-900 text-sm">${parseFloat(policy.deductible).toLocaleString()}</p>
            </div>
          )}
          {policy.renewalDate && (
            <div className={`rounded-xl p-3 ${isUrgent ? 'bg-orange-50' : 'bg-slate-50'}`}>
              <p className="text-xs text-slate-400 mb-0.5">Renewal</p>
              <p className={`font-bold text-sm ${isUrgent ? 'text-orange-600' : 'text-slate-900'}`}>
                {new Date(policy.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {policy.agentName && (
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-400 mb-1">Agent</p>
            <p className="font-semibold text-slate-900 text-sm">{policy.agentName}</p>
            {policy.agentPhone && (
              <a href={`tel:${policy.agentPhone}`} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {policy.agentPhone}
              </a>
            )}
          </div>
        )}

        {policy.policyNumber && (
          <p className="text-xs text-slate-300 mb-3">Policy # {policy.policyNumber}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(policy)}
            className="flex-1 h-9 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(policy.id)}
            className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-300 hover:bg-red-100 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Coverage Analyzer ────────────────────────────────────────────────
const CoverageAnalyzer = ({ policies }) => {
  const scoreInfo = getCoverageScore(policies);
  const hasType = (key) => policies.some(p => p.type === key && p.status !== 'cancelled');

  const gaps = [];
  if (!hasType('homeowners') && !hasType('landlord')) gaps.push({ type: 'homeowners', priority: 'Critical', msg: 'No homeowners or landlord insurance found' });
  if (!hasType('umbrella')) gaps.push({ type: 'umbrella', priority: 'High', msg: 'No umbrella liability policy — high risk for property owners' });
  if (!hasType('auto')) gaps.push({ type: 'auto', priority: 'High', msg: 'No auto insurance on file' });
  if (!hasType('life')) gaps.push({ type: 'life', priority: 'Medium', msg: 'No life insurance tracked' });
  if (!hasType('flood')) gaps.push({ type: 'flood', priority: 'Consider', msg: 'No flood insurance — check if your area requires it' });

  const totalAnnualPremium = policies.reduce((s, p) => s + (parseFloat(p.premium) || 0), 0);
  const totalCoverage = policies.reduce((s, p) => s + (parseFloat(p.coverageAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Coverage Score */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-extrabold text-slate-900 mb-6">Coverage Score</h2>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={scoreInfo.color}
                strokeWidth="10"
                strokeDasharray={`${scoreInfo.score * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold" style={{ color: scoreInfo.color }}>{scoreInfo.grade}</span>
              <span className="text-xs text-slate-400">{scoreInfo.score}/100</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 text-lg mb-2">
              {scoreInfo.grade === 'A' ? 'Excellent Coverage' :
               scoreInfo.grade === 'B' ? 'Good Coverage' :
               scoreInfo.grade === 'C' ? 'Average Coverage' :
               scoreInfo.grade === 'D' ? 'Below Average' : 'Significant Gaps'}
            </p>
            <p className="text-slate-500 text-sm mb-4">
              {scoreInfo.grade === 'A' ? 'You\'re well protected across all major risk areas.' :
               scoreInfo.grade === 'B' ? 'Good coverage with a few areas to consider.' :
               'There are meaningful gaps in your insurance coverage.'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Total Annual Premiums</p>
                <p className="font-bold text-slate-900">${totalAnnualPremium.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400">Total Coverage</p>
                <p className="font-bold text-slate-900">${(totalCoverage / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Checklist */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Coverage Checklist</h2>
        <div className="space-y-3">
          {INSURANCE_TYPES.map(type => {
            const Icon = type.icon;
            const covered = hasType(type.key);
            const policy = policies.find(p => p.type === type.key);
            return (
              <div key={type.key} className={`flex items-center gap-4 p-4 rounded-xl ${covered ? 'bg-green-50' : 'bg-slate-50'}`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: type.bg }}>
                  <Icon className="w-5 h-5" style={{ color: type.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{type.label}</p>
                  <p className="text-xs text-slate-400">{type.desc}</p>
                </div>
                {covered ? (
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Covered</span>
                    </div>
                    {policy?.coverageAmount && (
                      <p className="text-xs text-slate-400">${parseFloat(policy.coverageAmount).toLocaleString()}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                    <X className="w-4 h-4" /> Not tracked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Coverage Gaps */}
      {gaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" /> Coverage Gaps & Recommendations
          </h2>
          <div className="space-y-3">
            {gaps.map((gap, i) => {
              const rec = COVERAGE_RECOMMENDATIONS[gap.type];
              const typeInfo = INSURANCE_TYPES.find(t => t.key === gap.type);
              return (
                <div key={i} className={`rounded-xl p-4 border ${
                  gap.priority === 'Critical' ? 'bg-red-50 border-red-100' :
                  gap.priority === 'High' ? 'bg-orange-50 border-orange-100' :
                  'bg-amber-50 border-amber-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      gap.priority === 'Critical' ? 'bg-red-200 text-red-700' :
                      gap.priority === 'High' ? 'bg-orange-200 text-orange-700' :
                      'bg-amber-200 text-amber-700'
                    }`}>
                      {gap.priority}
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{gap.msg}</p>
                  </div>
                  {rec && (
                    <div className="space-y-1 mt-3">
                      {rec.tips.slice(0, 2).map((tip, ti) => (
                        <p key={ti} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <Star className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" /> {tip}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips by Policy Type */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Coverage Tips by Type</h2>
        <div className="space-y-3">
          {policies.map(policy => {
            const rec = COVERAGE_RECOMMENDATIONS[policy.type];
            const typeInfo = INSURANCE_TYPES.find(t => t.key === policy.type);
            if (!rec) return null;
            return (
              <div key={policy.id} className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: typeInfo?.bg }}>
                  <span className="font-bold text-sm" style={{ color: typeInfo?.color }}>
                    {typeInfo?.label} — {policy.insurer}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Recommendations</p>
                  {rec.tips.map((tip, ti) => (
                    <p key={ti} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" /> {tip}
                    </p>
                  ))}
                  {rec.redFlags.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-3 mb-2">Watch Out For</p>
                      {rec.redFlags.map((flag, fi) => (
                        <p key={fi} className="text-xs text-red-600 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {flag}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {policies.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Add policies to see personalized tips</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const InsuranceAnalyzerPage = () => {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('policies');
  const [filterType, setFilterType] = useState('all');

  const handleSave = (policy) => {
    if (editingPolicy) {
      setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
    } else {
      setPolicies(prev => [...prev, { ...policy, id: Date.now(), status: 'active' }]);
    }
    setShowModal(false);
    setEditingPolicy(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this policy?')) return;
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setShowModal(true);
  };

  const expiringCount = policies.filter(p => {
    if (!p.renewalDate) return false;
    const days = Math.ceil((new Date(p.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0;
  }).length;

  const expiredCount = policies.filter(p => {
    if (!p.renewalDate) return false;
    return new Date(p.renewalDate) < new Date();
  }).length;

  const filteredPolicies = filterType === 'all'
    ? policies
    : policies.filter(p => p.type === filterType);

  const scoreInfo = getCoverageScore(policies);
  const totalPremium = policies.reduce((s, p) => s + (parseFloat(p.premium) || 0), 0);

  return (
    <>
      <Helmet>
        <title>Insurance Analyzer — CasaCEO</title>
      </Helmet>

      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#c9a96e', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Insurance Analyzer</h1>
              <p className="text-blue-200 text-base leading-relaxed max-w-xl">
                Track all your policies, analyze coverage gaps, and make sure you're protected across every property and risk.
              </p>
              {(expiringCount > 0 || expiredCount > 0) && (
                <div className="flex gap-3 mt-4">
                  {expiredCount > 0 && (
                    <span className="bg-red-500/20 text-red-200 border border-red-400/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> {expiredCount} expired
                    </span>
                  )}
                  {expiringCount > 0 && (
                    <span className="bg-orange-500/20 text-orange-200 border border-orange-400/30 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" /> {expiringCount} renewing soon
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {policies.length > 0 && (
                <div className="bg-white/10 rounded-2xl px-5 py-4 text-center border border-white/10">
                  <p className="text-3xl font-extrabold" style={{ color: scoreInfo.color === '#059669' ? '#6ee7b7' : '#fbbf24' }}>{scoreInfo.grade}</p>
                  <p className="text-blue-200 text-xs">Coverage Score</p>
                  <p className="text-blue-300 text-xs">${totalPremium.toLocaleString()}/yr</p>
                </div>
              )}
              <button
                onClick={() => { setEditingPolicy(null); setShowModal(true); }}
                className="flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors"
                style={{ color: '#1e3a5f' }}
              >
                <Plus className="w-4 h-4" /> Add Policy
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'policies', label: 'My Policies', icon: <Shield className="w-4 h-4" /> },
            { key: 'analyzer', label: 'Coverage Analyzer', icon: <BarChart2 className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
              }`}
              style={activeTab === tab.key ? { background: '#1e3a5f' } : {}}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <>
            {/* Type Filter */}
            {policies.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${filterType === 'all' ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                  style={filterType === 'all' ? { background: '#1e3a5f' } : {}}
                >
                  All ({policies.length})
                </button>
                {INSURANCE_TYPES.filter(t => policies.some(p => p.type === t.key)).map(type => (
                  <button
                    key={type.key}
                    onClick={() => setFilterType(type.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${filterType === type.key ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                    style={filterType === type.key ? { background: type.color } : {}}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}

            {/* Policy Grid */}
            {policies.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#eef2f8' }}>
                  <Shield className="w-8 h-8" style={{ color: '#1e3a5f' }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No policies tracked yet</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                  Add your insurance policies to track renewals, analyze coverage gaps, and make sure you're fully protected.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#1e3a5f' }}
                >
                  <Plus className="w-4 h-4" /> Add Your First Policy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPolicies.map(policy => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                <button
                  onClick={() => { setEditingPolicy(null); setShowModal(true); }}
                  className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all group min-h-48"
                >
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-50 rounded-xl flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm">Add Policy</p>
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-8 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">
                CasaCEO helps you organize and track your insurance information. For coverage advice, always consult a licensed insurance professional. Coverage recommendations are general guidelines only.
              </p>
            </div>
          </>
        )}

        {/* Analyzer Tab */}
        {activeTab === 'analyzer' && (
          <CoverageAnalyzer policies={policies} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PolicyModal
          policy={editingPolicy}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingPolicy(null); }}
        />
      )}
    </>
  );
};

export default InsuranceAnalyzerPage;
