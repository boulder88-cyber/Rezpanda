import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useHome } from '@/contexts/HomeContext.jsx';
import {
  FileText, DollarSign, Calendar, AlertCircle, CheckCircle2,
  Plus, X, Edit2, Check, ShieldCheck, TrendingUp, TrendingDown,
  Download, Calculator, Lightbulb, Bell, ChevronDown, BarChart2,
  ArrowUpRight, ArrowDownRight, BookOpen, Scale, ChevronRight,
  Clock, FolderOpen, History
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

// ═══════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════

const SAMPLE_TAXES = [
  {
    id: 1, property: 'Primary Home',
    address: '123 Oakwood Lane, St. Simons Island, GA 31522',
    assessedValue: 620000, marketValue: 1245000,
    annualTax: 6200, taxRate: 1.00,
    county: 'Glynn County', taxYear: 2026,
    dueDate1: '2026-09-15', amount1: 3100,
    dueDate2: '2026-11-15', amount2: 3100,
    paid1: true, paid2: false,
    exemptions: ['Homestead Exemption'],
    exemptionSavings: 850,
    lastAssessed: '2025-01-01',
    appealDeadline: '2026-08-01',
    notes: 'Homestead exemption applied. Market value may be over-assessed — consider appeal.',
    history: [
      { year: 2022, assessed: 540000, tax: 5400 },
      { year: 2023, assessed: 570000, tax: 5700 },
      { year: 2024, assessed: 595000, tax: 5950 },
      { year: 2025, assessed: 610000, tax: 6100 },
      { year: 2026, assessed: 620000, tax: 6200 },
    ],
  },
  {
    id: 2, property: 'Lake House',
    address: '47 Harbour View Dr, Gainesville, GA 30501',
    assessedValue: 248000, marketValue: 445000,
    annualTax: 3100, taxRate: 1.25,
    county: 'Hall County', taxYear: 2026,
    dueDate1: '2026-10-01', amount1: 3100,
    dueDate2: null, amount2: null,
    paid1: false, paid2: false,
    exemptions: [],
    exemptionSavings: 0,
    lastAssessed: '2025-01-01',
    appealDeadline: '2026-09-01',
    notes: 'No homestead exemption — vacation property. Check Hall County appeal window.',
    history: [
      { year: 2022, assessed: 210000, tax: 2625 },
      { year: 2023, assessed: 225000, tax: 2813 },
      { year: 2024, assessed: 238000, tax: 2975 },
      { year: 2025, assessed: 244000, tax: 3050 },
      { year: 2026, assessed: 248000, tax: 3100 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY CARDS
// ═══════════════════════════════════════════════════════════════════════

const SummaryCards = ({ taxes }) => {
  const totalAnnual = taxes.reduce((s, t) => s + t.annualTax, 0);
  const totalPaid = taxes.reduce((s, t) => s + (t.paid1 ? t.amount1 : 0) + (t.paid2 && t.amount2 ? t.amount2 : 0), 0);
  const totalDue = totalAnnual - totalPaid;
  const totalSavings = taxes.reduce((s, t) => s + t.exemptionSavings, 0);
  const now = new Date();
  const upcoming = taxes.filter(t => {
    const d1 = t.dueDate1 && !t.paid1 && new Date(t.dueDate1) > now;
    const d2 = t.dueDate2 && !t.paid2 && new Date(t.dueDate2) > now;
    return d1 || d2;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
      {[
        { label: 'Annual Tax Total', value: `$${totalAnnual.toLocaleString()}`, sub: 'across all properties', color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb', icon: DollarSign },
        { label: 'Amount Due', value: `$${totalDue.toLocaleString()}`, sub: 'remaining this year', color: totalDue > 0 ? '#dc2626' : '#059669', bg: totalDue > 0 ? '#fef2f2' : '#ecfdf5', border: totalDue > 0 ? '#fecaca' : '#a7f3d0', icon: AlertCircle },
        { label: 'Upcoming Payments', value: upcoming, sub: 'installments pending', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Bell },
        { label: 'Exemption Savings', value: `$${totalSavings.toLocaleString()}`, sub: 'saved via exemptions', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: CheckCircle2 },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${stat.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: stat.bg, marginBottom: '8px' }}>
              <Icon style={{ width: '16px', height: '16px', color: stat.color }} />
            </div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>{stat.value}</p>
            <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{stat.label}</p>
            <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ASSESSMENT HISTORY CHART
// ═══════════════════════════════════════════════════════════════════════

const AssessmentHistory = ({ taxes }) => {
  if (taxes.length === 0) return null;
  const tax = taxes[0];
  const history = tax.history || [];
  const max = Math.max(...history.map(h => h.assessed), 1);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <h3 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px' }}>
          <History style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> Assessment History
        </h3>
        <span className="text-slate-400 font-medium" style={{ fontSize: '12px' }}>{tax.property}</span>
      </div>
      <div className="flex items-end gap-3" style={{ height: '100px' }}>
        {history.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-slate-500 font-medium" style={{ fontSize: '10px' }}>
              ${(h.assessed / 1000).toFixed(0)}K
            </span>
            <div className="w-full rounded-t-md transition-all" style={{
              height: `${(h.assessed / max) * 70}px`,
              background: i === history.length - 1 ? '#1e3a5f' : '#c7d7eb',
            }} />
            <span className="text-slate-400" style={{ fontSize: '10px' }}>{h.year}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <div>
          <p className="text-slate-400 font-medium" style={{ fontSize: '11px', marginBottom: '2px' }}>5-Year Change</p>
          <p className="font-semibold" style={{ fontSize: '14px', color: '#dc2626' }}>
            +${((history[history.length - 1]?.assessed || 0) - (history[0]?.assessed || 0)).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-slate-400 font-medium" style={{ fontSize: '11px', marginBottom: '2px' }}>Tax Increase (5yr)</p>
          <p className="font-semibold" style={{ fontSize: '14px', color: '#dc2626' }}>
            +${((history[history.length - 1]?.tax || 0) - (history[0]?.tax || 0)).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PAYMENT REMINDERS
// ═══════════════════════════════════════════════════════════════════════

const PaymentReminders = ({ taxes }) => {
  const now = new Date();
  const upcoming = [];
  taxes.forEach(tax => {
    if (tax.dueDate1 && !tax.paid1) {
      const d = new Date(tax.dueDate1);
      const days = Math.ceil((d - now) / 86400000);
      upcoming.push({ property: tax.property, due: tax.dueDate1, amount: tax.amount1, days, overdue: days < 0 });
    }
    if (tax.dueDate2 && !tax.paid2) {
      const d = new Date(tax.dueDate2);
      const days = Math.ceil((d - now) / 86400000);
      upcoming.push({ property: tax.property, due: tax.dueDate2, amount: tax.amount2, days, overdue: days < 0 });
    }
  });
  if (upcoming.length === 0) return null;
  upcoming.sort((a, b) => a.days - b.days);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px', marginBottom: '16px' }}>
        <Clock style={{ width: '16px', height: '16px', color: '#d97706' }} /> Upcoming Payments
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {upcoming.map((item, i) => (
          <div key={i} className="flex items-center gap-3" style={{
            background: item.overdue ? '#fef2f2' : item.days <= 30 ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${item.overdue ? '#fecaca' : item.days <= 30 ? '#fde68a' : '#e2e8f0'}`,
            borderRadius: '10px', padding: '12px 14px',
          }}>
            <Calendar style={{ width: '16px', height: '16px', color: item.overdue ? '#ef4444' : item.days <= 30 ? '#f59e0b' : '#94a3b8', flexShrink: 0 }} />
            <div className="flex-1">
              <p className="font-semibold text-slate-800" style={{ fontSize: '14px' }}>{item.property}</p>
              <p className="text-slate-400" style={{ fontSize: '12px' }}>
                Due {new Date(item.due).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {item.overdue ? ' — Overdue' : ` · ${item.days} days`}
              </p>
            </div>
            <p className="font-bold text-slate-900 flex-shrink-0" style={{ fontSize: '15px' }}>${item.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TAX CARD
// ═══════════════════════════════════════════════════════════════════════

const TaxCard = ({ tax, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const now = new Date();
  const d1Due = tax.dueDate1 && new Date(tax.dueDate1);
  const d2Due = tax.dueDate2 && new Date(tax.dueDate2);
  const d1DaysLeft = d1Due ? Math.ceil((d1Due - now) / 86400000) : null;
  const d2DaysLeft = d2Due ? Math.ceil((d2Due - now) / 86400000) : null;
  const assessmentRatio = tax.assessedValue / tax.marketValue * 100;
  const overAssessed = assessmentRatio > 85;

  return (
    <div className="bg-white overflow-hidden" style={{ borderRadius: '12px', border: `1px solid ${overAssessed ? '#fecaca' : '#e2e8f0'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '4px', background: overAssessed ? '#ef4444' : '#1e3a5f' }} />
      <div style={{ padding: '20px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '17px' }}>{tax.property}</h3>
            <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{tax.county} · Tax Year {tax.taxYear}</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-slate-900" style={{ fontSize: '24px', lineHeight: 1 }}>${tax.annualTax.toLocaleString()}</p>
            <p className="text-slate-400" style={{ fontSize: '12px' }}>/year · {tax.taxRate}% rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '16px' }}>
          <div className="bg-slate-50 rounded-xl" style={{ padding: '12px' }}>
            <p className="text-slate-400 font-medium" style={{ fontSize: '11px' }}>Assessed Value</p>
            <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>${tax.assessedValue.toLocaleString()}</p>
            <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{assessmentRatio.toFixed(0)}% of market</p>
          </div>
          <div className="rounded-xl" style={{ padding: '12px', background: overAssessed ? '#fef2f2' : '#ecfdf5' }}>
            <p className="text-slate-400 font-medium" style={{ fontSize: '11px' }}>Market Value</p>
            <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>${tax.marketValue.toLocaleString()}</p>
            {overAssessed && <p className="font-medium text-red-500" style={{ fontSize: '11px', marginTop: '2px' }}>⚠ May be over-assessed</p>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {[
            { due: tax.dueDate1, amount: tax.amount1, paid: tax.paid1, daysLeft: d1DaysLeft, label: 'Installment 1' },
            tax.dueDate2 && { due: tax.dueDate2, amount: tax.amount2, paid: tax.paid2, daysLeft: d2DaysLeft, label: 'Installment 2' },
          ].filter(Boolean).map((inst, i) => (
            <div key={i} className="flex items-center justify-between" style={{
              padding: '10px 12px', borderRadius: '10px',
              background: inst.paid ? '#ecfdf5' : inst.daysLeft !== null && inst.daysLeft <= 30 ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${inst.paid ? '#a7f3d0' : inst.daysLeft !== null && inst.daysLeft <= 30 ? '#fecaca' : '#e2e8f0'}`,
            }}>
              <div className="flex items-center gap-2">
                {inst.paid ? <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669' }} /> : <Calendar style={{ width: '14px', height: '14px', color: '#94a3b8' }} />}
                <div>
                  <p className="font-semibold text-slate-700" style={{ fontSize: '12px' }}>{inst.label}</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>
                    Due {new Date(inst.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {!inst.paid && inst.daysLeft !== null && ` · ${inst.daysLeft > 0 ? `${inst.daysLeft} days` : 'Overdue'}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900" style={{ fontSize: '14px' }}>${inst.amount.toLocaleString()}</p>
                {inst.paid && <p className="font-medium text-green-500" style={{ fontSize: '11px' }}>Paid ✓</p>}
              </div>
            </div>
          ))}
        </div>

        {tax.exemptions.length > 0 && (
          <div className="rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', marginBottom: '12px' }}>
            <p className="font-bold text-green-700" style={{ fontSize: '12px', marginBottom: '6px' }}>Active Exemptions — saving ${tax.exemptionSavings}/year</p>
            <div className="flex flex-wrap gap-1.5">
              {tax.exemptions.map((ex, i) => (
                <span key={i} className="font-medium text-green-700 bg-green-100 rounded-full" style={{ fontSize: '11px', padding: '2px 8px' }}>{ex}</span>
              ))}
            </div>
          </div>
        )}

        {tax.appealDeadline && (
          <div className="flex items-center gap-2 rounded-xl" style={{
            background: new Date(tax.appealDeadline) > new Date() ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${new Date(tax.appealDeadline) > new Date() ? '#fde68a' : '#e2e8f0'}`,
            padding: '10px 12px', marginBottom: '12px',
          }}>
            <Scale style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
            <div className="flex-1">
              <p className="font-semibold text-slate-700" style={{ fontSize: '12px' }}>Appeal Deadline</p>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>
                {new Date(tax.appealDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {new Date(tax.appealDeadline) < new Date() && ' — Passed'}
              </p>
            </div>
            {overAssessed && new Date(tax.appealDeadline) > new Date() && (
              <span className="font-bold text-amber-600" style={{ fontSize: '12px' }}>Consider appealing →</span>
            )}
          </div>
        )}

        {/* Document link */}
        <Link to="/documents" className="flex items-center gap-2 rounded-xl hover:bg-slate-100 transition-colors" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', marginBottom: '12px' }}>
          <FolderOpen style={{ width: '14px', height: '14px', color: '#1e3a5f', flexShrink: 0 }} />
          <p className="font-medium text-slate-700" style={{ fontSize: '12px' }}>View tax documents in Document Vault</p>
          <ChevronRight style={{ width: '13px', height: '13px', color: '#94a3b8', marginLeft: 'auto' }} />
        </Link>

        {tax.notes && (
          <>
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize: '12px', marginBottom: expanded ? '8px' : '12px' }}>
              <ChevronDown style={{ width: '13px', height: '13px', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {expanded ? 'Hide notes' : 'Show notes'}
            </button>
            {expanded && <p className="text-slate-500 rounded-xl" style={{ fontSize: '12px', background: '#f8fafc', padding: '10px', lineHeight: '1.6', marginBottom: '12px' }}>{tax.notes}</p>}
          </>
        )}

        <button onClick={() => onEdit(tax)} className="w-full flex items-center justify-center gap-1.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" style={{ height: '36px', fontSize: '13px' }}>
          <Edit2 style={{ width: '13px', height: '13px' }} /> Manage
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TAX CALCULATOR — preserved, design tokens updated
// ═══════════════════════════════════════════════════════════════════════

const TaxCalculator = ({ taxes }) => {
  const [inputs, setInputs] = useState({ assessedValue: '', taxRate: '', homestead: true, senior: false, veteran: false, disability: false });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const av = parseFloat(inputs.assessedValue) || 0;
    const rate = parseFloat(inputs.taxRate) / 100 || 0.0134;
    let exemptions = 0; let exemptionList = [];
    if (inputs.homestead) { exemptions += 2000; exemptionList.push('Basic Homestead ($2,000)'); }
    if (inputs.senior) { exemptions += 4000; exemptionList.push('Senior Exemption ($4,000)'); }
    if (inputs.veteran) { exemptions += 109986; exemptionList.push('Disabled Veteran (up to $109,986)'); }
    if (inputs.disability) { exemptions += 4000; exemptionList.push('Disability Exemption ($4,000)'); }
    const taxableValue = Math.max(0, av - exemptions);
    const annualTax = taxableValue * rate;
    const withoutExemptions = av * rate;
    const savings = withoutExemptions - annualTax;
    setResult({ annualTax, withoutExemptions, savings, taxableValue, exemptions, exemptionList });
  };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
        <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff' }}>
          <Calculator style={{ width: '20px', height: '20px', color: '#2563eb' }} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Property Tax Calculator</h3>
          <p className="text-slate-400" style={{ fontSize: '13px' }}>Estimate your tax and find exemption savings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
        <div>
          <Label className="text-xs font-semibold text-slate-600 mb-1 block">Assessed Value</Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
            <Input type="number" placeholder="320000" value={inputs.assessedValue} onChange={e => setInputs(p => ({ ...p, assessedValue: e.target.value }))} className="h-11 rounded-xl pl-7" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tax Rate (%)</Label>
          <Input type="number" step="0.01" placeholder="1.34" value={inputs.taxRate} onChange={e => setInputs(p => ({ ...p, taxRate: e.target.value }))} className="h-11 rounded-xl" />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Label className="text-xs font-semibold text-slate-600 mb-3 block">Georgia Exemptions</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'homestead', label: 'Homestead Exemption', desc: 'Primary residence — $2,000 off assessed value' },
            { key: 'senior', label: 'Senior Exemption (65+)', desc: 'Additional $4,000 off assessed value' },
            { key: 'veteran', label: 'Disabled Veteran', desc: 'Up to full exemption on primary home' },
            { key: 'disability', label: 'Disability Exemption', desc: 'Additional $4,000 off assessed value' },
          ].map(ex => (
            <label key={ex.key} className="flex items-start gap-3 cursor-pointer transition-all" style={{ padding: '10px', borderRadius: '10px', background: inputs[ex.key] ? '#ecfdf5' : '#f8fafc', border: `1px solid ${inputs[ex.key] ? '#a7f3d0' : '#e2e8f0'}` }}>
              <input type="checkbox" checked={inputs[ex.key]} onChange={e => setInputs(p => ({ ...p, [ex.key]: e.target.checked }))} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700" style={{ fontSize: '12px' }}>{ex.label}</p>
                <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{ex.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button onClick={calculate} className="w-full flex items-center justify-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', height: '48px', fontSize: '15px' }}>
        <Calculator style={{ width: '16px', height: '16px' }} /> Calculate My Tax
      </button>

      {result && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Without Exemptions', value: `$${Math.round(result.withoutExemptions).toLocaleString()}`, bg: '#f8fafc', color: '#1e3a5f' },
              { label: 'Annual Savings', value: `-$${Math.round(result.savings).toLocaleString()}`, bg: '#ecfdf5', color: '#059669' },
              { label: 'Your Tax Bill', value: `$${Math.round(result.annualTax).toLocaleString()}`, bg: '#eef2f8', color: '#1e3a5f' },
            ].map((s, i) => (
              <div key={i} className="text-center rounded-xl" style={{ background: s.bg, padding: '14px' }}>
                <p className="text-slate-400" style={{ fontSize: '11px', marginBottom: '4px' }}>{s.label}</p>
                <p className="font-extrabold" style={{ fontSize: '18px', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          {result.exemptionList.length > 0 && (
            <div className="rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px' }}>
              <p className="font-bold text-green-700" style={{ fontSize: '12px', marginBottom: '6px' }}>Applied Exemptions</p>
              {result.exemptionList.map((ex, i) => (
                <p key={i} className="flex items-center gap-1.5 text-green-600" style={{ fontSize: '12px' }}>
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} /> {ex}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// APPEAL GUIDE — design tokens updated
// ═══════════════════════════════════════════════════════════════════════

const AppealGuide = () => (
  <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
      <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fffbeb' }}>
        <Scale style={{ width: '20px', height: '20px', color: '#d97706' }} />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Georgia Property Tax Appeal Guide</h3>
        <p className="text-slate-400" style={{ fontSize: '13px' }}>How to challenge your assessment and potentially save thousands</p>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      {[
        { step: '1', title: 'Check Your Assessment Notice', desc: 'Compare your assessed value to recent comparable sales. If assessed value exceeds market value, you have grounds to appeal.' },
        { step: '2', title: 'File an Appeal', desc: 'File with your county Board of Assessors within 45 days of receiving your assessment notice. Most counties accept appeals online.' },
        { step: '3', title: 'Gather Evidence', desc: 'Collect recent comparable sales (comps), photos of property condition issues, and any appraisals you have.' },
        { step: '4', title: 'Attend the Hearing', desc: 'Present your case to the Board of Equalization. Most hearings take 15–30 minutes.' },
        { step: '5', title: 'Accept or Escalate', desc: 'If unsatisfied, appeal to Superior Court within 30 days of the BOE decision.' },
      ].map((item, i) => (
        <div key={i} className="flex gap-3 bg-slate-50 rounded-xl" style={{ padding: '12px' }}>
          <div className="flex items-center justify-center font-extrabold text-white flex-shrink-0" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e3a5f', fontSize: '12px' }}>{item.step}</div>
          <div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{item.title}</p>
            <p className="text-slate-500" style={{ fontSize: '12px', marginTop: '2px', lineHeight: '1.6' }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-start gap-3 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px' }}>
      <Lightbulb style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
      <p className="text-amber-700" style={{ fontSize: '12px', lineHeight: '1.6' }}>Studies show 40–60% of appealed assessments result in a reduction. The average savings in Georgia is $1,200–$2,400 per year. Most appeals cost nothing to file.</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// TAX MODAL — design tokens updated
// ═══════════════════════════════════════════════════════════════════════

const TaxModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState(initial || {
    property: '', address: '', assessedValue: '', marketValue: '',
    annualTax: '', taxRate: '', county: '', taxYear: new Date().getFullYear(),
    dueDate1: '', amount1: '', dueDate2: '', amount2: '',
    paid1: false, paid2: false, notes: ''
  });

  useEffect(() => { if (initial) setForm(initial); }, [initial, open]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initial ? 'Edit Property Tax' : 'Add Property Tax'}</DialogTitle>
          <p className="text-slate-500 text-sm">Track your property tax bill and payment schedule.</p>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Property Name *</Label>
            <Input placeholder="Primary Home" value={form.property} onChange={e => set('property', e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">County</Label>
              <Input placeholder="Glynn County" value={form.county} onChange={e => set('county', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tax Year</Label>
              <Input type="number" placeholder="2026" value={form.taxYear} onChange={e => set('taxYear', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Assessed Value</Label>
              <div className="relative"><span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="320000" value={form.assessedValue} onChange={e => set('assessedValue', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Market Value</Label>
              <div className="relative"><span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="425000" value={form.marketValue} onChange={e => set('marketValue', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Annual Tax</Label>
              <div className="relative"><span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="4280" value={form.annualTax} onChange={e => set('annualTax', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tax Rate (%)</Label>
              <Input type="number" step="0.01" placeholder="1.34" value={form.taxRate} onChange={e => set('taxRate', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Due Date 1</Label>
              <Input type="date" value={form.dueDate1} onChange={e => set('dueDate1', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Amount 1</Label>
              <div className="relative"><span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="2140" value={form.amount1} onChange={e => set('amount1', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Due Date 2 (optional)</Label>
              <Input type="date" value={form.dueDate2} onChange={e => set('dueDate2', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Amount 2 (optional)</Label>
              <div className="relative"><span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="2140" value={form.amount2} onChange={e => set('amount2', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</Label>
            <textarea placeholder="Appeal status, exemptions, notes..." value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => { onSave({ ...form, id: form.id || Date.now(), assessedValue: parseFloat(form.assessedValue) || 0, marketValue: parseFloat(form.marketValue) || 0, annualTax: parseFloat(form.annualTax) || 0, taxRate: parseFloat(form.taxRate) || 0, amount1: parseFloat(form.amount1) || 0, amount2: parseFloat(form.amount2) || 0, taxYear: parseInt(form.taxYear) || new Date().getFullYear(), exemptions: form.exemptions || [], exemptionSavings: form.exemptionSavings || 0, history: form.history || [] }); onClose(); }}
              disabled={!form.property} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
              {initial ? 'Save Changes' : 'Add Property Tax'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const PropertyTaxPage = () => {
  const { selectedHome } = useHome();
  const [taxes, setTaxes] = useState(SAMPLE_TAXES);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);

  const handleSave = (tax) => {
    if (editingTax) setTaxes(prev => prev.map(t => t.id === tax.id ? tax : t));
    else setTaxes(prev => [...prev, tax]);
    setEditingTax(null);
  };

  return (
    <>
      <Helmet><title>Property Tax — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Property Tax</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2' }}>
                <FileText style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Property Tax</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {taxes.length} {taxes.length === 1 ? 'property' : 'properties'} tracked · Never miss a payment
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <button onClick={() => { setEditingTax(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Property Tax
              </button>
            </div>
          </div>
        </div>

        <SummaryCards taxes={taxes} />
        <PaymentReminders taxes={taxes} />

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '32px' }}>
          {[
            { key: 'overview', label: '🏠 My Properties' },
            { key: 'history', label: '📊 Assessment History' },
            { key: 'calculator', label: '🧮 Tax Calculator' },
            { key: 'appeal', label: '⚖️ Appeal Guide' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="font-medium rounded-xl transition-all whitespace-nowrap"
              style={{ padding: '8px 14px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          taxes.length === 0 ? (
            <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
              <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fef2f2', marginBottom: '16px' }}>
                <FileText style={{ width: '28px', height: '28px', color: '#dc2626' }} />
              </div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No property taxes tracked yet.</p>
              <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px' }}>Add your property tax bills to track payments, find exemptions, and never miss a due date.</p>
              <button onClick={() => setIsModalOpen(true)} className="font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '12px 28px', fontSize: '14px' }}>
                <Plus className="w-4 h-4 inline mr-2" /> Add Your First Property Tax
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taxes.map(tax => <TaxCard key={tax.id} tax={tax} onEdit={t => { setEditingTax(t); setIsModalOpen(true); }} />)}
            </div>
          )
        )}

        {activeTab === 'history' && <AssessmentHistory taxes={taxes} />}
        {activeTab === 'calculator' && <TaxCalculator taxes={taxes} />}
        {activeTab === 'appeal' && <AppealGuide />}
      </div>

      <TaxModal open={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTax(null); }} onSave={handleSave} initial={editingTax} />
    </>
  );
};

export default PropertyTaxPage;
