import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useHome } from '@/contexts/HomeContext.jsx';
import {
  FileText, DollarSign, Calendar, AlertCircle, CheckCircle2,
  Plus, X, Edit2, Check, ShieldCheck, TrendingUp, TrendingDown,
  Download, Calculator, Lightbulb, Bell, ChevronDown, BarChart2,
  ArrowUpRight, ArrowDownRight, BookOpen, Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

// ─── Sample Data ──────────────────────────────────────────────────────
const SAMPLE_TAXES = [
  {
    id: 1, property: 'Primary Home',
    address: '884 Millbrae Ct, Atlanta, GA 30033',
    assessedValue: 320000, marketValue: 425000,
    annualTax: 4280, taxRate: 1.34,
    county: 'DeKalb County', taxYear: 2026,
    dueDate1: '2026-09-15', amount1: 2140,
    dueDate2: '2026-11-15', amount2: 2140,
    paid1: true, paid2: false,
    exemptions: ['Homestead Exemption', 'Senior Freeze'],
    exemptionSavings: 850,
    lastAssessed: '2025-01-01',
    appealDeadline: '2026-04-01',
    notes: 'Homestead exemption applied. Consider appeal — market value may be over-assessed.',
  },
  {
    id: 2, property: 'Lake House',
    address: '42 Lakeview Dr, Gainesville, GA 30501',
    assessedValue: 248000, marketValue: 310000,
    annualTax: 3100, taxRate: 1.25,
    county: 'Hall County', taxYear: 2026,
    dueDate1: '2026-10-01', amount1: 3100,
    dueDate2: null, amount2: null,
    paid1: false, paid2: false,
    exemptions: [],
    exemptionSavings: 0,
    lastAssessed: '2025-01-01',
    appealDeadline: '2026-05-01',
    notes: 'No homestead exemption — vacation property. Check Hall County appeal window.',
  },
];

// ─── Summary Cards ────────────────────────────────────────────────────
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Annual Tax Total', value: `$${totalAnnual.toLocaleString()}`, sub: 'across all properties', color: '#1e3a5f', bg: '#eef2f8', border: '#c7d5e8', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Amount Due', value: `$${totalDue.toLocaleString()}`, sub: 'remaining this year', color: totalDue > 0 ? '#dc2626' : '#059669', bg: totalDue > 0 ? '#fef2f2' : '#ecfdf5', border: totalDue > 0 ? '#fecaca' : '#a7f3d0', icon: <AlertCircle className="w-4 h-4" /> },
        { label: 'Upcoming Payments', value: upcoming, sub: 'installments pending', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <Bell className="w-4 h-4" /> },
        { label: 'Exemption Savings', value: `$${totalSavings.toLocaleString()}`, sub: 'saved via exemptions', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: <CheckCircle2 className="w-4 h-4" /> },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: stat.border }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg, color: stat.color }}>
            {stat.icon}
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">{stat.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Property Tax Card ────────────────────────────────────────────────
const TaxCard = ({ tax, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const now = new Date();
  const d1Due = tax.dueDate1 && new Date(tax.dueDate1);
  const d2Due = tax.dueDate2 && new Date(tax.dueDate2);
  const d1DaysLeft = d1Due ? Math.ceil((d1Due - now) / (1000 * 60 * 60 * 24)) : null;
  const d2DaysLeft = d2Due ? Math.ceil((d2Due - now) / (1000 * 60 * 60 * 24)) : null;
  const assessmentRatio = tax.assessedValue / tax.marketValue * 100;
  const overAssessed = assessmentRatio > 85;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: overAssessed ? '#dc2626' : '#1e3a5f' }}></div>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{tax.property}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{tax.county} · Tax Year {tax.taxYear}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-slate-900">${tax.annualTax.toLocaleString()}</p>
            <p className="text-xs text-slate-400">/year · {tax.taxRate}% rate</p>
          </div>
        </div>

        {/* Assessed vs Market */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-medium">Assessed Value</p>
            <p className="font-bold text-slate-900">${tax.assessedValue.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{assessmentRatio.toFixed(0)}% of market</p>
          </div>
          <div className={`rounded-xl p-3 ${overAssessed ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-xs text-slate-400 font-medium">Market Value</p>
            <p className="font-bold text-slate-900">${tax.marketValue.toLocaleString()}</p>
            {overAssessed && <p className="text-xs text-red-500 font-medium">⚠ May be over-assessed</p>}
          </div>
        </div>

        {/* Payment installments */}
        <div className="space-y-2 mb-4">
          {[
            { due: tax.dueDate1, amount: tax.amount1, paid: tax.paid1, daysLeft: d1DaysLeft, label: 'Installment 1' },
            tax.dueDate2 && { due: tax.dueDate2, amount: tax.amount2, paid: tax.paid2, daysLeft: d2DaysLeft, label: 'Installment 2' },
          ].filter(Boolean).map((inst, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
              inst.paid ? 'bg-green-50 border-green-100' :
              inst.daysLeft !== null && inst.daysLeft <= 30 ? 'bg-red-50 border-red-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                {inst.paid
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <Calendar className="w-4 h-4 text-slate-400" />
                }
                <div>
                  <p className="text-xs font-bold text-slate-700">{inst.label}</p>
                  <p className="text-xs text-slate-400">
                    Due {new Date(inst.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {!inst.paid && inst.daysLeft !== null && ` · ${inst.daysLeft > 0 ? `${inst.daysLeft} days` : 'Overdue'}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">${inst.amount.toLocaleString()}</p>
                {inst.paid && <p className="text-xs text-green-500 font-medium">Paid ✓</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Exemptions */}
        {tax.exemptions.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-green-700 mb-1.5">Active Exemptions — saving ${tax.exemptionSavings}/year</p>
            <div className="flex flex-wrap gap-1.5">
              {tax.exemptions.map((ex, i) => (
                <span key={i} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">{ex}</span>
              ))}
            </div>
          </div>
        )}

        {/* Appeal deadline */}
        {tax.appealDeadline && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${
            new Date(tax.appealDeadline) > now ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50 border border-slate-100'
          }`}>
            <Scale className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-700">Appeal Deadline</p>
              <p className="text-xs text-slate-500">
                {new Date(tax.appealDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {new Date(tax.appealDeadline) < now && ' — Passed'}
              </p>
            </div>
            {overAssessed && new Date(tax.appealDeadline) > now && (
              <span className="ml-auto text-xs font-bold text-amber-600">Consider appealing →</span>
            )}
          </div>
        )}

        {/* Notes */}
        {tax.notes && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-3">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide notes' : 'Show notes'}
          </button>
        )}
        {expanded && tax.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 mb-3 leading-relaxed">{tax.notes}</p>
        )}

        <button onClick={() => onEdit(tax)} className="w-full h-9 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5">
          <Edit2 className="w-3.5 h-3.5" /> Manage
        </button>
      </div>
    </div>
  );
};

// ─── Tax Savings Calculator ───────────────────────────────────────────
const TaxCalculator = ({ taxes }) => {
  const [inputs, setInputs] = useState({ assessedValue: '', taxRate: '', homestead: true, senior: false, veteran: false, disability: false });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const av = parseFloat(inputs.assessedValue) || 0;
    const rate = parseFloat(inputs.taxRate) / 100 || 0.0134;
    let exemptions = 0;
    let exemptionList = [];

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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Property Tax Calculator</h3>
          <p className="text-slate-500 text-sm">Estimate your tax and find exemption savings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
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

      <div className="mb-4">
        <Label className="text-xs font-semibold text-slate-600 mb-3 block">Georgia Exemptions (check all that apply)</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'homestead', label: 'Homestead Exemption', desc: 'Primary residence — $2,000 off assessed value' },
            { key: 'senior', label: 'Senior Exemption (65+)', desc: 'Additional $4,000 off assessed value' },
            { key: 'veteran', label: 'Disabled Veteran', desc: 'Up to full exemption on primary home' },
            { key: 'disability', label: 'Disability Exemption', desc: 'Additional $4,000 off assessed value' },
          ].map(ex => (
            <label key={ex.key} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${inputs[ex.key] ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <input type="checkbox" checked={inputs[ex.key]} onChange={e => setInputs(p => ({ ...p, [ex.key]: e.target.checked }))} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-700">{ex.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ex.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={calculate} className="w-full h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
        <Calculator className="w-4 h-4 mr-2" /> Calculate My Tax
      </Button>

      {result && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Without Exemptions</p>
              <p className="text-xl font-extrabold text-slate-900">${Math.round(result.withoutExemptions).toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Annual Savings</p>
              <p className="text-xl font-extrabold text-green-600">-${Math.round(result.savings).toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: '#eef2f8' }}>
              <p className="text-xs text-slate-400 mb-1">Your Tax Bill</p>
              <p className="text-xl font-extrabold" style={{ color: '#1e3a5f' }}>${Math.round(result.annualTax).toLocaleString()}</p>
            </div>
          </div>
          {result.exemptionList.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs font-bold text-green-700 mb-2">Applied Exemptions</p>
              {result.exemptionList.map((ex, i) => (
                <p key={i} className="text-xs text-green-600 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> {ex}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Appeal Guide ─────────────────────────────────────────────────────
const AppealGuide = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
        <Scale className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900">Georgia Property Tax Appeal Guide</h3>
        <p className="text-slate-500 text-sm">How to challenge your assessment and potentially save thousands</p>
      </div>
    </div>

    <div className="space-y-3 mb-4">
      {[
        { step: '1', title: 'Check Your Assessment Notice', desc: 'Compare your assessed value to recent comparable sales in your area. If assessed value exceeds market value, you have grounds to appeal.' },
        { step: '2', title: 'File an Appeal', desc: 'File with your county Board of Assessors within 45 days of receiving your assessment notice. Most counties accept appeals online.' },
        { step: '3', title: 'Gather Evidence', desc: 'Collect recent comparable sales (comps), photos of property condition issues, and any appraisals you have.' },
        { step: '4', title: 'Attend the Hearing', desc: 'Present your case to the Board of Equalization. Most hearings take 15-30 minutes. You can hire a property tax consultant on contingency.' },
        { step: '5', title: 'Accept or Escalate', desc: 'If unsatisfied, appeal to Superior Court within 30 days of the BOE decision. Most disputes settle before court.' },
      ].map((item, i) => (
        <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0" style={{ background: '#1e3a5f' }}>{item.step}</div>
          <div>
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700">Studies show 40-60% of appealed assessments result in a reduction. The average savings in Georgia is $1,200-$2,400 per year. Most appeals cost nothing to file.</p>
    </div>
  </div>
);

// ─── Add/Edit Tax Modal ───────────────────────────────────────────────
const TaxModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState(initial || {
    property: '', address: '', assessedValue: '', marketValue: '',
    annualTax: '', taxRate: '', county: '', taxYear: new Date().getFullYear(),
    dueDate1: '', amount1: '', dueDate2: '', amount2: '',
    paid1: false, paid2: false, notes: ''
  });

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initial ? 'Edit Property Tax' : 'Add Property Tax'}</DialogTitle>
          <p className="text-slate-500 text-sm">Track your property tax bill and payment schedule.</p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Property Name *</Label>
              <Input placeholder="Primary Home" value={form.property} onChange={e => set('property', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">County</Label>
              <Input placeholder="DeKalb County" value={form.county} onChange={e => set('county', e.target.value)} className="h-11 rounded-xl" />
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
            <textarea placeholder="Appeal status, exemptions applied, notes..." value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => { onSave({ ...form, id: form.id || Date.now(), assessedValue: parseFloat(form.assessedValue) || 0, marketValue: parseFloat(form.marketValue) || 0, annualTax: parseFloat(form.annualTax) || 0, taxRate: parseFloat(form.taxRate) || 0, amount1: parseFloat(form.amount1) || 0, amount2: parseFloat(form.amount2) || 0, taxYear: parseInt(form.taxYear) || new Date().getFullYear(), exemptions: form.exemptions || [], exemptionSavings: form.exemptionSavings || 0 }); onClose(); }} disabled={!form.property} className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: '#1e3a5f' }}>
              {initial ? 'Save Changes' : 'Add Property Tax'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Need useEffect for modal
import { useEffect } from 'react';

// ─── Main Page ────────────────────────────────────────────────────────
const PropertyTaxPage = () => {
  const { selectedHome } = useHome();
  const [taxes, setTaxes] = useState(SAMPLE_TAXES);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);

  const handleSave = (tax) => {
    if (editingTax) {
      setTaxes(prev => prev.map(t => t.id === tax.id ? tax : t));
    } else {
      setTaxes(prev => [...prev, tax]);
    }
    setEditingTax(null);
  };

  return (
    <>
      <Helmet><title>Property Tax — CasaOS Asset Layer</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Property Tax</h1>
              <p className="text-blue-200 text-base max-w-xl leading-relaxed">
                Track tax bills, payment schedules, exemptions, and appeal opportunities across all your properties.
              </p>
              <p className="text-blue-300 text-sm mt-2">CasaOS ensures you never miss a payment or overpay your assessment.</p>
              <div className="flex items-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-green-300" />
                <span className="text-blue-200 text-xs">Your tax data is encrypted and securely stored.</span>
              </div>
            </div>
            <Button onClick={() => { setEditingTax(null); setIsModalOpen(true); }} className="bg-[#e8604c] hover:bg-[#d4503c] text-white rounded-xl font-bold flex-shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Add Property Tax
            </Button>
          </div>
        </div>

        <SummaryCards taxes={taxes} />

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm mb-8">
          {[
            { key: 'overview', label: '🏠 My Properties' },
            { key: 'calculator', label: '🧮 Tax Calculator' },
            { key: 'appeal', label: '⚖️ Appeal Guide' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              style={activeTab === tab.key ? { background: '#1e3a5f', color: '#fff' } : { color: '#64748b' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {taxes.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No property taxes tracked yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Add your property tax bills to track payments, find exemptions, and never miss a due date.</p>
                <Button onClick={() => setIsModalOpen(true)} className="font-bold text-white px-8 h-12 rounded-xl" style={{ background: '#1e3a5f' }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Property Tax
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {taxes.map(tax => (
                  <TaxCard key={tax.id} tax={tax} onEdit={t => { setEditingTax(t); setIsModalOpen(true); }} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'calculator' && <TaxCalculator taxes={taxes} />}
        {activeTab === 'appeal' && <AppealGuide />}
      </div>

      <TaxModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTax(null); }}
        onSave={handleSave}
        initial={editingTax}
      />
    </>
  );
};

export default PropertyTaxPage;
