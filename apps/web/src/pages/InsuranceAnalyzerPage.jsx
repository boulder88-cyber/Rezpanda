import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Shield, Plus, X, Edit2, AlertCircle, CheckCircle2,
  ChevronRight, Bell, DollarSign, Calendar, Building2,
  Car, Heart, Umbrella, Home, FileText, TrendingUp,
  AlertTriangle, Info, Star, Phone, BarChart2, Download,
  MessageCircle, ArrowRight, LayoutGrid, List, RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

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
    tips: ['Insure for full replacement cost — not market value', 'Include extended replacement cost endorsement (20-25% buffer)', 'Add scheduled personal property for jewelry, art, collectibles', 'Check inflation guard rider to keep up with construction costs'],
    redFlags: ['Actual cash value only (not replacement cost)', 'Coverage below current rebuild cost per sq ft', 'No loss of use coverage'],
  },
  landlord: {
    tips: ['Loss of rental income coverage — covers you if property is uninhabitable', 'Higher liability limits than standard homeowners', 'Consider requiring tenants to carry renters insurance', 'Fair rental value coverage for Airbnb or short-term rentals'],
    redFlags: ['No loss of rent coverage', 'Liability under $300,000', 'No vandalism coverage'],
  },
  flood: {
    tips: ['Standard homeowners does NOT cover flooding', 'FEMA flood maps change — check yours annually', 'Consider excess flood coverage above NFIP limits', 'Even low-risk zones can flood — 25% of claims come from outside high-risk zones'],
    redFlags: ['No flood policy in flood zone A or V', 'Relying only on NFIP without excess coverage for high-value homes'],
  },
  umbrella: {
    tips: ['Umbrella kicks in when auto or home liability limits are exhausted', 'Critical for rental property owners — tenant injuries are a real risk', 'Usually very affordable — $1M policy often under $300/year', "Make sure underlying policies meet umbrella's minimum requirements"],
    redFlags: ['No umbrella policy if you own rental properties', 'Coverage gap between underlying policies and umbrella'],
  },
  auto: {
    tips: ['100/300/100 is the minimum recommended — state minimums are usually inadequate', 'Uninsured/underinsured motorist coverage is often overlooked but critical', 'Comprehensive and collision if vehicle value justifies it', 'Review annually — vehicle depreciation may change needs'],
    redFlags: ['State minimum only liability limits', 'No uninsured motorist coverage', 'Gap between auto and umbrella policy'],
  },
  life: {
    tips: ['Term life is usually most cost effective for income replacement', 'Consider mortgage payoff amount when calculating coverage needs', 'Review after major life events — marriage, children, property purchase', "Don't forget coverage for non-working spouse"],
    redFlags: ['Coverage less than 5x annual income with dependents', 'No beneficiary update after divorce or death', 'Policies that lapse without notice'],
  },
  title: {
    tips: ["Owner's title insurance is a one-time purchase at closing", 'Protects against prior liens, forgeries, and ownership disputes', "Lender's title policy only protects the bank — not you", 'Consider enhanced coverage for additional protections'],
    redFlags: ["Only lender's policy — no owner's policy", 'No coverage on investment properties'],
  },
  earthquake: {
    tips: ['Standard homeowners does NOT cover earthquake damage', 'High deductibles are common (10-20% of dwelling value)', 'CEA offers policies in California — other states vary', 'Retrofitting older homes can lower premiums significantly'],
    redFlags: ['No earthquake policy if in seismic zone', 'Older home without seismic retrofit in high-risk area'],
  },
};

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
    const days = Math.ceil((new Date(p.renewalDate) - new Date()) / 86400000);
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

// ═══════════════════════════════════════════════════════════════════════
// POLICY MODAL
// ═══════════════════════════════════════════════════════════════════════

const PolicyModal = ({ policy, onSave, onClose }) => {
  const [form, setForm] = useState({
    type: policy?.type || 'homeowners', insurer: policy?.insurer || '',
    policyNumber: policy?.policyNumber || '', premium: policy?.premium || '',
    coverageAmount: policy?.coverageAmount || '', deductible: policy?.deductible || '',
    renewalDate: policy?.renewalDate || '', startDate: policy?.startDate || '',
    agentName: policy?.agentName || '', agentPhone: policy?.agentPhone || '',
    agentEmail: policy?.agentEmail || '', property: policy?.property || '',
    notes: policy?.notes || '', status: policy?.status || 'active', isRental: policy?.isRental || false,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const daysToRenewal = form.renewalDate ? Math.ceil((new Date(form.renewalDate) - new Date()) / 86400000) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-2xl my-4" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
          <div>
            <h2 className="font-semibold text-white" style={{ fontSize: '18px' }}>{policy ? 'Edit Coverage' : 'Add Insurance Policy'}</h2>
            <p className="text-blue-200" style={{ fontSize: '13px' }}>Keep all your coverage in one place</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Insurance Type</label>
            <div className="grid grid-cols-4 gap-2">
              {INSURANCE_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button key={type.key} onClick={() => set('type', type.key)}
                    className="p-2.5 rounded-xl border text-center transition-all"
                    style={form.type === type.key ? { background: type.color, borderColor: type.color, color: 'white' } : { borderColor: '#e2e8f0' }}>
                    <Icon style={{ width: '18px', height: '18px', margin: '0 auto 4px', color: form.type === type.key ? 'white' : type.color }} />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'insurer', label: 'Insurance Company', placeholder: 'State Farm, Allstate…' },
              { key: 'policyNumber', label: 'Policy Number', placeholder: 'HO-123456789' },
              { key: 'property', label: 'Property / Vehicle', placeholder: 'Primary Home, Lake House…' },
            ].map(f => (
              <div key={f.key} className={f.key === 'insurer' ? 'col-span-2' : ''}>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                <input placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
            ))}
            {[
              { key: 'coverageAmount', label: 'Coverage Amount', placeholder: '500000' },
              { key: 'deductible', label: 'Deductible', placeholder: '1000' },
              { key: 'premium', label: 'Annual Premium', placeholder: '1200' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                  <input type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                    className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Renewal Date</label>
              <input type="date" value={form.renewalDate} onChange={e => set('renewalDate', e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm" />
              {daysToRenewal !== null && daysToRenewal <= 30 && daysToRenewal >= 0 && (
                <p className="text-orange-500 font-medium" style={{ fontSize: '11px', marginTop: '4px' }}>⚠️ Renews in {daysToRenewal} days</p>
              )}
              {daysToRenewal !== null && daysToRenewal < 0 && (
                <p className="text-red-500 font-medium" style={{ fontSize: '11px', marginTop: '4px' }}>🔴 Expired {Math.abs(daysToRenewal)} days ago</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl" style={{ padding: '14px' }}>
            <p className="font-semibold text-slate-700" style={{ fontSize: '13px', marginBottom: '10px' }}>Agent / Contact Info</p>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Agent name" value={form.agentName} onChange={e => set('agentName', e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white" />
              <input placeholder="Phone" value={form.agentPhone} onChange={e => set('agentPhone', e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white" />
              <input placeholder="Email" value={form.agentEmail} onChange={e => set('agentEmail', e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
            <textarea placeholder="Special endorsements, riders, coverage notes…" value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-500 font-medium hover:bg-slate-50" style={{ fontSize: '14px' }}>Cancel</button>
            <button onClick={() => onSave({ ...form, id: policy?.id || Date.now() })} disabled={!form.insurer}
              className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: '#1e3a5f', fontSize: '14px' }}>
              {policy ? 'Save Changes' : 'Add Policy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// POLICY CARD
// ═══════════════════════════════════════════════════════════════════════

const PolicyCard = ({ policy, onEdit, onDelete }) => {
  const typeInfo = INSURANCE_TYPES.find(t => t.key === policy.type);
  const Icon = typeInfo?.icon || Shield;
  const today = new Date();
  const renewalDate = policy.renewalDate ? new Date(policy.renewalDate) : null;
  const daysToRenewal = renewalDate ? Math.ceil((renewalDate - today) / 86400000) : null;

  const getStatus = () => {
    if (!renewalDate) return { label: 'Active', color: '#059669', bg: '#ecfdf5' };
    if (daysToRenewal < 0) return { label: 'Expired', color: '#dc2626', bg: '#fef2f2' };
    if (daysToRenewal <= 30) return { label: `Renews in ${daysToRenewal}d`, color: '#f97316', bg: '#fff7ed' };
    if (daysToRenewal <= 60) return { label: `Renews in ${daysToRenewal}d`, color: '#d97706', bg: '#fffbeb' };
    return { label: 'Active', color: '#059669', bg: '#ecfdf5' };
  };

  const status = getStatus();
  const isUrgent = daysToRenewal !== null && daysToRenewal <= 30;

  return (
    <div className="bg-white hover:shadow-md transition-all overflow-hidden" style={{ borderRadius: '12px', border: `1px solid ${isUrgent ? '#fecaca' : '#e2e8f0'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {isUrgent && <div style={{ height: '3px', background: daysToRenewal < 0 ? '#dc2626' : '#f97316' }} />}
      <div style={{ padding: '16px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: typeInfo?.bg }}>
              <Icon style={{ width: '18px', height: '18px', color: typeInfo?.color }} />
            </div>
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{typeInfo?.label || policy.type}</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>{policy.insurer}</p>
            </div>
          </div>
          <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: status.bg, color: status.color, padding: '3px 8px' }}>{status.label}</span>
        </div>

        {policy.property && (
          <p className="text-slate-400 flex items-center gap-1" style={{ fontSize: '12px', marginBottom: '10px' }}>
            <Building2 style={{ width: '11px', height: '11px' }} /> {policy.property}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '12px' }}>
          {policy.coverageAmount && (
            <div className="bg-slate-50 rounded-xl" style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Coverage</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>${parseFloat(policy.coverageAmount).toLocaleString()}</p>
            </div>
          )}
          {policy.premium && (
            <div className="bg-slate-50 rounded-xl" style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Premium/yr</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>${parseFloat(policy.premium).toLocaleString()}</p>
            </div>
          )}
          {policy.deductible && (
            <div className="bg-slate-50 rounded-xl" style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Deductible</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>${parseFloat(policy.deductible).toLocaleString()}</p>
            </div>
          )}
          {policy.renewalDate && (
            <div className="rounded-xl" style={{ padding: '8px', background: isUrgent ? '#fff7ed' : '#f8fafc' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Renewal</p>
              <p className="font-semibold" style={{ fontSize: '12px', color: isUrgent ? '#f97316' : '#0f172a' }}>
                {new Date(policy.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {policy.agentName && (
          <div className="bg-slate-50 rounded-xl" style={{ padding: '10px', marginBottom: '10px' }}>
            <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '3px' }}>Agent</p>
            <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{policy.agentName}</p>
            {policy.agentPhone && (
              <a href={`tel:${policy.agentPhone}`} className="text-blue-500 hover:text-blue-600 flex items-center gap-1" style={{ fontSize: '12px', marginTop: '2px' }}>
                <Phone style={{ width: '11px', height: '11px' }} /> {policy.agentPhone}
              </a>
            )}
          </div>
        )}

        {policy.policyNumber && <p className="text-slate-300" style={{ fontSize: '11px', marginBottom: '10px' }}>Policy # {policy.policyNumber}</p>}

        <div className="flex gap-2">
          <button onClick={() => onEdit(policy)} className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" style={{ height: '34px', fontSize: '12px' }}>
            <Edit2 style={{ width: '12px', height: '12px' }} /> Edit
          </button>
          <button className="flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" style={{ width: '34px', height: '34px' }}>
            <Download style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
          </button>
          <button onClick={() => onDelete(policy.id)} className="flex items-center justify-center rounded-xl hover:bg-red-100 transition-colors" style={{ width: '34px', height: '34px', background: '#fef2f2' }}>
            <X style={{ width: '13px', height: '13px', color: '#f87171' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// COVERAGE ANALYZER
// ═══════════════════════════════════════════════════════════════════════

const CoverageAnalyzer = ({ policies }) => {
  const [showCompare, setShowCompare] = useState(false);
  const scoreInfo = getCoverageScore(policies);
  const hasType = (key) => policies.some(p => p.type === key && p.status !== 'cancelled');
  const totalAnnualPremium = policies.reduce((s, p) => s + (parseFloat(p.premium) || 0), 0);
  const totalCoverage = policies.reduce((s, p) => s + (parseFloat(p.coverageAmount) || 0), 0);

  const gaps = [];
  if (!hasType('homeowners') && !hasType('landlord')) gaps.push({ type: 'homeowners', priority: 'Critical', msg: 'No homeowners or landlord insurance found' });
  if (!hasType('umbrella')) gaps.push({ type: 'umbrella', priority: 'High', msg: 'No umbrella liability policy — high risk for property owners' });
  if (!hasType('auto')) gaps.push({ type: 'auto', priority: 'High', msg: 'No auto insurance on file' });
  if (!hasType('life')) gaps.push({ type: 'life', priority: 'Medium', msg: 'No life insurance tracked' });
  if (!hasType('flood')) gaps.push({ type: 'flood', priority: 'Consider', msg: 'No flood insurance — check if your area requires it' });

  const COMPARE_FIELDS = [
    { label: 'Dwelling', key: 'dwelling' },
    { label: 'Liability', key: 'liability' },
    { label: 'Flood', key: 'flood' },
    { label: 'Contents', key: 'contents' },
    { label: 'Deductible', key: 'deductible' },
    { label: 'Premium/yr', key: 'premium' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Protection Score */}
      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '20px' }}>Protection Score</h2>
        <div className="flex items-center gap-8">
          <div className="relative flex-shrink-0" style={{ width: '110px', height: '110px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={scoreInfo.color} strokeWidth="10"
                strokeDasharray={`${scoreInfo.score * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-extrabold" style={{ fontSize: '28px', color: scoreInfo.color }}>{scoreInfo.grade}</span>
              <span className="text-slate-400" style={{ fontSize: '11px' }}>{scoreInfo.score}/100</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '6px' }}>
              {scoreInfo.grade === 'A' ? 'Excellent Coverage' : scoreInfo.grade === 'B' ? 'Good Coverage' : scoreInfo.grade === 'C' ? 'Average Coverage' : scoreInfo.grade === 'D' ? 'Below Average' : 'Significant Gaps'}
            </p>
            <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '14px' }}>
              {scoreInfo.grade === 'A' ? "You're well protected across all major risk areas." : scoreInfo.grade === 'B' ? 'Good coverage with a few areas to consider.' : 'There are meaningful gaps in your insurance coverage.'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Annual Premiums', value: `$${totalAnnualPremium.toLocaleString()}` },
                { label: 'Total Coverage', value: `$${(totalCoverage / 1000000).toFixed(1)}M` },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>{s.label}</p>
                  <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Checklist */}
      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Coverage Checklist</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INSURANCE_TYPES.map(type => {
            const Icon = type.icon;
            const covered = hasType(type.key);
            const pol = policies.find(p => p.type === type.key);
            return (
              <div key={type.key} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: '10px', background: covered ? '#ecfdf5' : '#f8fafc' }}>
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: type.bg }}>
                  <Icon style={{ width: '15px', height: '15px', color: type.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{type.label}</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>{type.desc}</p>
                </div>
                {covered ? (
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                      <span className="font-semibold" style={{ fontSize: '12px' }}>Covered</span>
                    </div>
                    {pol?.coverageAmount && <p className="text-slate-400" style={{ fontSize: '11px' }}>${parseFloat(pol.coverageAmount).toLocaleString()}</p>}
                  </div>
                ) : (
                  <span className="font-semibold text-slate-300 flex items-center gap-1 flex-shrink-0" style={{ fontSize: '12px' }}>
                    <X style={{ width: '13px', height: '13px' }} /> Not tracked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '18px', marginBottom: '16px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#f97316' }} /> Coverage Gaps Detected
            <span className="font-bold text-orange-600 bg-orange-100 rounded-full" style={{ fontSize: '12px', padding: '2px 8px' }}>{gaps.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gaps.map((gap, i) => {
              const rec = COVERAGE_RECOMMENDATIONS[gap.type];
              return (
                <div key={i} className="rounded-xl" style={{
                  padding: '14px', border: `1px solid ${gap.priority === 'Critical' ? '#fecaca' : gap.priority === 'High' ? '#fed7aa' : '#fde68a'}`,
                  background: gap.priority === 'Critical' ? '#fef2f2' : gap.priority === 'High' ? '#fff7ed' : '#fffbeb',
                }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                    <span className="font-bold rounded-full" style={{ fontSize: '11px', padding: '2px 8px', background: gap.priority === 'Critical' ? '#fee2e2' : gap.priority === 'High' ? '#fed7aa' : '#fef3c7', color: gap.priority === 'Critical' ? '#dc2626' : gap.priority === 'High' ? '#f97316' : '#d97706' }}>{gap.priority}</span>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{gap.msg}</p>
                  </div>
                  {rec && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {rec.tips.slice(0, 2).map((tip, ti) => (
                        <p key={ti} className="flex items-start gap-1.5 text-slate-600" style={{ fontSize: '12px' }}>
                          <Star style={{ width: '11px', height: '11px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} /> {tip}
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

      {/* Compare Policies Toggle */}
      {policies.length >= 2 && (
        <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: showCompare ? '16px' : 0 }}>
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Compare Policies</h2>
            <button onClick={() => setShowCompare(!showCompare)} className="font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all" style={{ padding: '6px 14px', fontSize: '13px', color: '#1e3a5f' }}>
              {showCompare ? 'Hide' : 'Compare'}
            </button>
          </div>
          {showCompare && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide rounded-l-lg">Coverage Area</th>
                    {policies.slice(0, 3).map(p => (
                      <th key={p.id} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: INSURANCE_TYPES.find(t => t.key === p.type)?.color || '#1e3a5f' }}>
                        {p.insurer}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {COMPARE_FIELDS.map(f => (
                    <tr key={f.key} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-medium text-slate-600" style={{ fontSize: '13px' }}>{f.label}</td>
                      {policies.slice(0, 3).map(p => (
                        <td key={p.id} className="px-3 py-2.5 text-slate-500" style={{ fontSize: '13px' }}>
                          {p[f.key] ? `$${parseFloat(p[f.key]).toLocaleString()}` : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tips by Policy */}
      {policies.length > 0 && (
        <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Coverage Tips by Type</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {policies.map(policy => {
              const rec = COVERAGE_RECOMMENDATIONS[policy.type];
              const typeInfo = INSURANCE_TYPES.find(t => t.key === policy.type);
              if (!rec) return null;
              return (
                <div key={policy.id} className="border border-slate-100 overflow-hidden rounded-xl">
                  <div className="px-4 py-3" style={{ background: typeInfo?.bg }}>
                    <span className="font-semibold" style={{ fontSize: '13px', color: typeInfo?.color }}>{typeInfo?.label} — {policy.insurer}</span>
                  </div>
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '4px' }}>Recommendations</p>
                    {rec.tips.map((tip, ti) => (
                      <p key={ti} className="flex items-start gap-1.5 text-slate-600" style={{ fontSize: '12px' }}>
                        <CheckCircle2 style={{ width: '12px', height: '12px', color: '#059669', flexShrink: 0, marginTop: '1px' }} /> {tip}
                      </p>
                    ))}
                    {rec.redFlags.length > 0 && (
                      <>
                        <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginTop: '8px', marginBottom: '4px' }}>Watch Out For</p>
                        {rec.redFlags.map((flag, fi) => (
                          <p key={fi} className="flex items-start gap-1.5 text-red-600" style={{ fontSize: '12px' }}>
                            <AlertTriangle style={{ width: '12px', height: '12px', flexShrink: 0, marginTop: '1px' }} /> {flag}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const InsuranceAnalyzerPage = () => {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('policies');
  const [filterType, setFilterType] = useState('all');

  const handleSave = (policy) => {
    if (editingPolicy) setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
    else setPolicies(prev => [...prev, { ...policy, id: Date.now(), status: 'active' }]);
    setShowModal(false); setEditingPolicy(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this policy?')) return;
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  const scoreInfo = getCoverageScore(policies);
  const totalPremium = policies.reduce((s, p) => s + (parseFloat(p.premium) || 0), 0);
  const expiringCount = policies.filter(p => {
    if (!p.renewalDate) return false;
    const days = Math.ceil((new Date(p.renewalDate) - new Date()) / 86400000);
    return days <= 30 && days >= 0;
  }).length;
  const expiredCount = policies.filter(p => p.renewalDate && new Date(p.renewalDate) < new Date()).length;
  const gapsCount = policies.length === 0 ? 0 : (['homeowners', 'landlord'].some(k => policies.some(p => p.type === k)) ? 0 : 1) + (policies.some(p => p.type === 'umbrella') ? 0 : 1);

  const filteredPolicies = filterType === 'all' ? policies : policies.filter(p => p.type === filterType);

  return (
    <>
      <Helmet><title>Insurance Analyzer — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Insurance</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf0ee' }}>
                <Shield style={{ width: '24px', height: '24px', color: '#e8604c' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Insurance Analyzer</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  Understand your coverage, identify gaps, and optimize protection for every property.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export Summary
              </button>
              <button onClick={() => { setEditingPolicy(null); setShowModal(true); }} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Policy
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom: '16px' }}>
          {[
            { label: 'Active Policies', value: policies.filter(p => !expiredCount || p.renewalDate > new Date().toISOString()).length || policies.length, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
            { label: 'Coverage Gaps', value: gapsCount, color: gapsCount > 0 ? '#dc2626' : '#059669', bg: gapsCount > 0 ? '#fef2f2' : '#ecfdf5', border: gapsCount > 0 ? '#fecaca' : '#a7f3d0' },
            { label: 'Renewals Due', value: expiringCount, color: expiringCount > 0 ? '#f97316' : '#059669', bg: expiringCount > 0 ? '#fff7ed' : '#ecfdf5', border: expiringCount > 0 ? '#fed7aa' : '#a7f3d0' },
            { label: 'Annual Premiums', value: `$${totalPremium.toLocaleString()}`, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
          ].map((s, i) => (
            <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="font-extrabold" style={{ fontSize: '22px', lineHeight: 1, color: s.color }}>{s.value}</p>
              <p className="font-medium text-slate-500" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Smart Insights ── */}
        {(expiringCount > 0 || expiredCount > 0 || gapsCount > 0) && (
          <div className="flex items-center gap-3 rounded-2xl" style={{ background: '#eef2f8', border: '1px solid #c7d7eb', padding: '12px 16px', marginBottom: '24px' }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#1e3a5f', flexShrink: 0 }} />
            <p className="text-slate-700 font-medium" style={{ fontSize: '14px' }}>
              {[
                expiringCount > 0 && `${expiringCount} renewal${expiringCount > 1 ? 's' : ''} due soon`,
                expiredCount > 0 && `${expiredCount} expired`,
                gapsCount > 0 && `${gapsCount} coverage gap${gapsCount > 1 ? 's' : ''} detected`,
              ].filter(Boolean).join(' · ')}
            </p>
            <button onClick={() => setActiveTab('analyzer')} className="flex items-center gap-1 font-semibold ml-auto hover:opacity-70 transition-opacity whitespace-nowrap" style={{ color: '#1e3a5f', fontSize: '13px' }}>
              View Analysis <ArrowRight style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '24px' }}>
          {[
            { key: 'policies', label: '🛡️ My Policies', icon: Shield },
            { key: 'analyzer', label: '📊 Coverage Analyzer', icon: BarChart2 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="font-medium rounded-xl transition-all"
              style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Policies Tab ── */}
        {activeTab === 'policies' && (
          <>
            {policies.length > 0 && (
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: '20px' }}>
                <button onClick={() => setFilterType('all')} className="font-semibold rounded-xl border transition-all" style={{ padding: '6px 14px', fontSize: '12px', background: filterType === 'all' ? '#1e3a5f' : 'white', color: filterType === 'all' ? 'white' : '#64748b', borderColor: filterType === 'all' ? '#1e3a5f' : '#e2e8f0' }}>
                  All ({policies.length})
                </button>
                {INSURANCE_TYPES.filter(t => policies.some(p => p.type === t.key)).map(type => (
                  <button key={type.key} onClick={() => setFilterType(type.key)} className="font-semibold rounded-xl border transition-all" style={{ padding: '6px 14px', fontSize: '12px', background: filterType === type.key ? type.color : 'white', color: filterType === type.key ? 'white' : '#64748b', borderColor: filterType === type.key ? type.color : '#e2e8f0' }}>
                    {type.label}
                  </button>
                ))}
              </div>
            )}

            {policies.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
                <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fdf0ee', marginBottom: '16px' }}>
                  <Shield style={{ width: '28px', height: '28px', color: '#e8604c' }} />
                </div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No policies tracked yet.</p>
                <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                  Add your insurance policies to track renewals, analyze coverage gaps, and make sure you're fully protected.
                </p>
                <button onClick={() => setShowModal(true)} className="font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '12px 28px', fontSize: '14px' }}>
                  <Plus className="w-4 h-4 inline mr-2" /> Add Your First Policy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPolicies.map(policy => (
                  <PolicyCard key={policy.id} policy={policy} onEdit={p => { setEditingPolicy(p); setShowModal(true); }} onDelete={handleDelete} />
                ))}
                <button onClick={() => { setEditingPolicy(null); setShowModal(true); }} className="bg-white flex flex-col items-center justify-center text-slate-400 hover:shadow-sm hover:text-slate-600 transition-all group" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', minHeight: '160px' }}>
                  <div className="flex items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-slate-200 transition-colors" style={{ width: '40px', height: '40px', marginBottom: '10px' }}>
                    <Plus style={{ width: '18px', height: '18px' }} />
                  </div>
                  <p className="font-semibold" style={{ fontSize: '14px' }}>Add Policy</p>
                </button>
              </div>
            )}

            {/* Agent Integration */}
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl" style={{ background: '#1e3a5f', padding: '16px 20px', marginTop: '24px' }}>
              <MessageCircle style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
              <p className="text-blue-200 font-medium" style={{ fontSize: '14px' }}>
                Sync with your Compass agent or preferred insurance provider to review renewal options.
              </p>
              <button className="font-semibold text-white border border-white/20 hover:bg-white/10 rounded-xl flex-shrink-0 transition-all" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Connect Provider <ArrowRight className="inline w-3 h-3 ml-1" />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px 16px', marginTop: '12px' }}>
              <Info style={{ width: '15px', height: '15px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
              <p className="text-amber-700" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                HomeOS Insurance Analyzer helps homeowners maintain complete protection across every property. All recommendations are informational and should be verified with licensed professionals.
              </p>
            </div>
          </>
        )}

        {activeTab === 'analyzer' && <CoverageAnalyzer policies={policies} />}
      </div>

      {showModal && <PolicyModal policy={editingPolicy} onSave={handleSave} onClose={() => { setShowModal(false); setEditingPolicy(null); }} />}
    </>
  );
};

export default InsuranceAnalyzerPage;
