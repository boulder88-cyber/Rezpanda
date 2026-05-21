import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  DollarSign, CheckCircle2, XCircle, AlertCircle, ChevronDown, Clock,
  ChevronUp, FileText, Home, Calculator, BookOpen, ArrowRight,
  Info, TrendingDown, Building2, Calendar, Receipt, Lightbulb, Plus,
  ExternalLink, Shield, HelpCircle
} from 'lucide-react';

// ─── Expandable Section ───────────────────────────────────────────────
const ExpandableSection = ({ title, icon, children, defaultOpen = false, accent = '#1e3a5f' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base text-left">{title}</h3>
        </div>
        {isOpen
          ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        }
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-slate-50">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Simple Tip Card ──────────────────────────────────────────────────
const TipCard = ({ icon, title, description, color = '#1e3a5f' }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
    <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
  </div>
);

// ─── Deduction Item ───────────────────────────────────────────────────
const DeductionItem = ({ label, example, isDeductible = true }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl mb-2 ${isDeductible ? 'bg-green-50' : 'bg-red-50'}`}>
    {isDeductible
      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
    }
    <div>
      <p className={`font-semibold text-sm ${isDeductible ? 'text-green-800' : 'text-red-700'}`}>{label}</p>
      {example && <p className="text-xs mt-0.5 text-slate-500">{example}</p>}
    </div>
  </div>
);

// ─── Depreciation Calculator ──────────────────────────────────────────
const DepreciationCalculator = () => {
  const [propertyValue, setPropertyValue] = useState('');
  const [landValue, setLandValue] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const pv = parseFloat(propertyValue) || 0;
    const lv = parseFloat(landValue) || 0;
    const depreciableBase = pv - lv;
    const annual = depreciableBase / 27.5;
    const monthly = annual / 12;
    const over10 = annual * 10;
    setResult({ depreciableBase, annual, monthly, over10 });
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 mt-4">
      <p className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4" /> Quick Depreciation Calculator
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Property Purchase Price</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
            <input
              type="number"
              placeholder="350,000"
              value={propertyValue}
              onChange={e => setPropertyValue(e.target.value)}
              className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Land Value (not depreciable)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
            <input
              type="number"
              placeholder="50,000"
              value={landValue}
              onChange={e => setLandValue(e.target.value)}
              className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>
      </div>
      <button
        onClick={calculate}
        className="w-full h-10 rounded-xl text-white text-sm font-bold mb-4"
        style={{ background: '#1e3a5f' }}
      >
        Calculate My Depreciation
      </button>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Depreciable Base', value: `$${Math.round(result.depreciableBase).toLocaleString()}` },
            { label: 'Annual Deduction', value: `$${Math.round(result.annual).toLocaleString()}`, highlight: true },
            { label: 'Monthly Equivalent', value: `$${Math.round(result.monthly).toLocaleString()}` },
            { label: 'Over 10 Years', value: `$${Math.round(result.over10).toLocaleString()}` },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-3 text-center ${item.highlight ? 'bg-green-100 border border-green-200' : 'bg-white border border-slate-100'}`}>
              <p className={`text-lg font-extrabold ${item.highlight ? 'text-green-700' : 'text-slate-900'}`}>{item.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-400 mt-3 text-center">
        * For estimation only. Consult a tax professional for your actual return.
      </p>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const RentalTaxGuidePage = () => {
  const [activeTab, setActiveTab] = useState('guide');

  return (
    <>
      <Helmet>
        <title>Rental Tax Guide — CasaCEO</title>
      </Helmet>

      <div className="max-w-4xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#c9a96e', transform: 'translate(30%, -30%)' }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
                IRS Topic 414 — Simplified
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Rental Property Tax Guide</h1>
            <p className="text-blue-200 text-lg leading-relaxed max-w-2xl">
              Everything you need to know about rental income and deductions — explained in plain English, no accountant degree required.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {['What counts as income', 'What you can deduct', 'Depreciation', 'How to report it'].map((tag, i) => (
                <span key={i} className="bg-white/10 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">For Information Only</p>
            <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
              This guide is based on IRS Topic 414 and is meant to help you understand rental taxes generally. Always consult a qualified tax professional for your specific situation. Tax laws change — verify with the IRS or your accountant.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'guide', label: 'Tax Guide', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'deductions', label: 'Deductions Checklist', icon: <CheckCircle2 className="w-4 h-4" /> },
            { key: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
            { key: 'timelog', label: 'Time & Usage Log', icon: <Clock className="w-4 h-4" /> },
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

        {/* ── TAX GUIDE TAB ── */}
        {activeTab === 'guide' && (
          <div>
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <TipCard
                icon={<DollarSign className="w-5 h-5" />}
                title="All rent must be reported"
                description="Cash, services, or goods received for renting your property all count as taxable income."
                color="#059669"
              />
              <TipCard
                icon={<TrendingDown className="w-5 h-5" />}
                title="Deduct your expenses"
                description="Most ordinary and necessary expenses to manage and maintain your rental are deductible."
                color="#2563eb"
              />
              <TipCard
                icon={<Building2 className="w-5 h-5" />}
                title="Depreciate over 27.5 years"
                description="You can deduct the cost of your rental building over 27.5 years — even if it's gaining value."
                color="#7c3aed"
              />
            </div>

            {/* Section 1: What is Rental Income */}
            <ExpandableSection
              title="What counts as rental income?"
              icon={<DollarSign className="w-5 h-5" />}
              defaultOpen={true}
              accent="#059669"
            >
              <div className="mt-4 space-y-3">
                <p className="text-slate-600 text-sm leading-relaxed">
                  The IRS says rental income is <strong>any amount you receive for the use of your property.</strong> This is broader than most people think. Here's what counts:
                </p>
                {[
                  { item: 'Monthly rent payments', detail: 'The regular checks or transfers from your tenant' },
                  { item: 'Advance rent', detail: 'First and last month paid upfront — taxable when received, not when it covers' },
                  { item: 'Tenant-paid expenses', detail: 'If your tenant pays your water bill as part of the deal, that counts as income to you' },
                  { item: 'Services in lieu of rent', detail: 'Tenant paints your house instead of paying rent — the fair value of that work is income' },
                  { item: 'Lease cancellation fees', detail: 'If a tenant pays you to break their lease early, that\'s rental income' },
                  { item: 'Security deposits kept', detail: 'If you keep a deposit because of damage, that becomes income in the year you keep it' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">{item.item}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                  <p className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4" /> Security Deposits — Not Income (Usually)
                  </p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    A refundable security deposit is <strong>not</strong> rental income — it's a liability. You plan to return it. But the moment you keep any of it (for damage, unpaid rent, etc.), that amount becomes taxable income.
                  </p>
                </div>
              </div>
            </ExpandableSection>

            {/* Section 2: Deductible Expenses */}
            <ExpandableSection
              title="What expenses can I deduct?"
              icon={<Receipt className="w-5 h-5" />}
              defaultOpen={true}
              accent="#2563eb"
            >
              <div className="mt-4">
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  The rule is simple: you can deduct expenses that are <strong>ordinary</strong> (common for rental properties) and <strong>necessary</strong> (helpful for your rental business). Here are the big ones:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Mortgage interest', example: 'Interest portion of your monthly payment' },
                    { label: 'Property taxes', example: 'Annual real estate taxes on the rental' },
                    { label: 'Insurance premiums', example: 'Landlord insurance, liability coverage' },
                    { label: 'Repairs & maintenance', example: 'Fixing a leak, replacing broken fixtures' },
                    { label: 'Property management fees', example: 'What you pay a management company' },
                    { label: 'Advertising', example: 'Zillow listing, Craigslist ads, signs' },
                    { label: 'Utilities you pay', example: 'Water, trash if you cover them' },
                    { label: 'Professional fees', example: 'Accountant, attorney related to rental' },
                    { label: 'Travel to the property', example: 'Driving to check on or repair the rental' },
                    { label: 'Office expenses', example: 'Software, supplies for managing rentals' },
                    { label: 'Depreciation', example: 'Building cost spread over 27.5 years' },
                    { label: 'HOA fees', example: 'If the rental is in an HOA community' },
                  ].map((item, i) => (
                    <DeductionItem key={i} label={item.label} example={item.example} isDeductible={true} />
                  ))}
                </div>

                <div className="mt-4">
                  <p className="font-bold text-slate-900 text-sm mb-3">❌ What you CANNOT deduct:</p>
                  {[
                    { label: 'Personal use days', example: 'Days you or family stay at the rental are not deductible' },
                    { label: 'Improvements (immediately)', example: 'Adding a new bathroom must be depreciated, not expensed' },
                    { label: 'Lost rent from vacant periods', example: 'If you could have rented but didn\'t, no deduction for that' },
                  ].map((item, i) => (
                    <DeductionItem key={i} label={item.label} example={item.example} isDeductible={false} />
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-4">
                  <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4" /> Repairs vs. Improvements — Know the Difference
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Repairs</strong> (fixing what's broken) are fully deductible this year. <strong>Improvements</strong> (adding value or extending life) must be depreciated over time. Replacing a broken window = repair. Adding a new deck = improvement.
                  </p>
                </div>
              </div>
            </ExpandableSection>

            {/* Section 3: Depreciation */}
            <ExpandableSection
              title="Depreciation — your biggest hidden deduction"
              icon={<TrendingDown className="w-5 h-5" />}
              defaultOpen={false}
              accent="#7c3aed"
            >
              <div className="mt-4">
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Depreciation is one of the best tax benefits of owning rental property. The IRS allows you to deduct the cost of your building over <strong>27.5 years</strong> — even while the property is going up in value.
                </p>

                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-4">
                  <p className="font-bold text-purple-800 text-sm mb-3">How it works — simple example:</p>
                  <div className="space-y-2">
                    {[
                      { step: '1', text: 'You buy a rental for $350,000' },
                      { step: '2', text: 'Land is worth $50,000 (land doesn\'t depreciate)' },
                      { step: '3', text: 'Depreciable basis = $300,000' },
                      { step: '4', text: '$300,000 ÷ 27.5 years = $10,909/year deduction' },
                      { step: '5', text: 'That\'s $10,909 OFF your taxable rental income every year' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {item.step}
                        </div>
                        <p className="text-sm text-purple-800">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" /> Important: Depreciation Recapture
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    When you sell the property, the IRS will "recapture" the depreciation you took at a 25% tax rate. This is something to plan for with your accountant before you sell.
                  </p>
                </div>

                <DepreciationCalculator />
              </div>
            </ExpandableSection>

            {/* Section 4: Passive Loss Rules */}
            <ExpandableSection
              title="What if my expenses are more than my income?"
              icon={<Shield className="w-5 h-5" />}
              defaultOpen={false}
              accent="#dc2626"
            >
              <div className="mt-4 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  If your rental expenses exceed your rental income, you have a <strong>rental loss</strong>. What you can do with that loss depends on your income.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Income under $100,000',
                      desc: 'You may be able to deduct up to $25,000 of rental losses against your regular income — if you actively participate in managing the property.',
                      color: '#059669',
                      bg: '#ecfdf5'
                    },
                    {
                      title: 'Income $100,000 – $150,000',
                      desc: 'The $25,000 allowance phases out gradually. You can still deduct some losses.',
                      color: '#d97706',
                      bg: '#fffbeb'
                    },
                    {
                      title: 'Income over $150,000',
                      desc: 'Rental losses are generally suspended (carried forward) until you sell the property or have future rental income to offset.',
                      color: '#dc2626',
                      bg: '#fef2f2'
                    },
                    {
                      title: 'Real Estate Professional',
                      desc: 'If you spend 750+ hours per year in real estate activities, different rules apply and losses may be fully deductible.',
                      color: '#7c3aed',
                      bg: '#f5f3ff'
                    },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-4 border" style={{ background: item.bg, borderColor: `${item.color}30` }}>
                      <p className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.title}</p>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ExpandableSection>

            {/* Section 5: How to Report */}
            <ExpandableSection
              title="How do I report rental income on my taxes?"
              icon={<FileText className="w-5 h-5" />}
              defaultOpen={false}
              accent="#1e3a5f"
            >
              <div className="mt-4 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Rental income and expenses are reported on <strong>Schedule E (Form 1040)</strong> — Supplemental Income and Loss. You file one Schedule E per property (up to 3 per page).
                </p>

                <div className="space-y-3">
                  {[
                    { form: 'Schedule E (Form 1040)', purpose: 'Report rental income and expenses for each property', required: true },
                    { form: 'Form 4562', purpose: 'Calculate depreciation for your rental property', required: true },
                    { form: 'Form 8582', purpose: 'Calculate passive activity loss limitations', required: false },
                    { form: 'Form 4797', purpose: 'Report gain or loss when you sell rental property', required: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1e3a5f15' }}>
                        <FileText className="w-4 h-4" style={{ color: '#1e3a5f' }} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.form}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{item.purpose}</p>
                      </div>
                      <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${item.required ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {item.required ? 'Required' : 'If needed'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" /> Cash vs. Accrual Method
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Most landlords use the <strong>cash method</strong> — you report income when you receive it and deduct expenses when you pay them. This is the simpler approach and what the IRS assumes unless you specify otherwise.
                  </p>
                </div>
              </div>
            </ExpandableSection>

            {/* CasaCEO Tip */}
            <div className="rounded-2xl p-6 text-white mt-6" style={{ background: '#1e3a5f' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg mb-2">CasaCEO makes this easier</p>
                  <p className="text-blue-200 text-sm leading-relaxed mb-4">
                    Track every rental expense, store receipts, log maintenance costs, and generate a ready-to-hand-to-your-accountant report — all organized by property, all year long.
                  </p>
                  <Link to="/expenses">
                    <button className="flex items-center gap-2 bg-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors" style={{ color: '#1e3a5f' }}>
                      Go to Expense Tracker <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DEDUCTIONS CHECKLIST TAB ── */}
        {activeTab === 'deductions' && (
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Your Deduction Checklist</h2>
              <p className="text-slate-500 text-sm">Save this list and review it before tax season every year. These are all legitimate deductions for rental property owners.</p>
            </div>

            {[
              {
                category: 'Operating Expenses',
                color: '#2563eb',
                items: [
                  { item: 'Property management fees', tip: 'If you use a management company' },
                  { item: 'Advertising & marketing', tip: 'Listing fees, signs, photos' },
                  { item: 'Leasing commissions', tip: 'Paid to find a tenant' },
                  { item: 'Tenant screening fees', tip: 'Background and credit checks' },
                  { item: 'Legal fees', tip: 'Lease preparation, eviction costs' },
                  { item: 'Accounting fees', tip: 'Tax prep, bookkeeping for the rental' },
                ]
              },
              {
                category: 'Property Expenses',
                color: '#059669',
                items: [
                  { item: 'Mortgage interest', tip: 'Interest portion only — not principal' },
                  { item: 'Property taxes', tip: 'Annual real estate taxes' },
                  { item: 'HOA dues', tip: 'If property is in an HOA' },
                  { item: 'Landlord insurance', tip: 'Homeowners policy for rentals' },
                  { item: 'Flood or earthquake insurance', tip: 'If required or elected' },
                  { item: 'Utilities you pay', tip: 'Water, trash, gas, electric' },
                ]
              },
              {
                category: 'Maintenance & Repairs',
                color: '#f97316',
                items: [
                  { item: 'Plumbing repairs', tip: 'Fixing leaks, clogs, broken fixtures' },
                  { item: 'HVAC service', tip: 'Filter changes, tune-ups, repairs' },
                  { item: 'Appliance repairs', tip: 'Not replacement — that\'s an improvement' },
                  { item: 'Pest control', tip: 'Regular and emergency treatments' },
                  { item: 'Landscaping', tip: 'Lawn care, snow removal' },
                  { item: 'Cleaning between tenants', tip: 'Professional cleaning costs' },
                ]
              },
              {
                category: 'Depreciation',
                color: '#7c3aed',
                items: [
                  { item: 'Building depreciation (27.5 yrs)', tip: 'Your biggest and most often missed deduction' },
                  { item: 'Appliance depreciation', tip: 'Fridge, washer/dryer — different schedule' },
                  { item: 'Capital improvements', tip: 'New roof, addition — depreciated over time' },
                ]
              },
              {
                category: 'Travel & Other',
                color: '#0891b2',
                items: [
                  { item: 'Mileage to rental property', tip: 'IRS standard rate per mile for visits' },
                  { item: 'Office supplies', tip: 'For managing the rental' },
                  { item: 'Software & apps', tip: 'Property management software like CasaCEO' },
                  { item: 'Safe deposit box', tip: 'For storing property documents' },
                ]
              },
            ].map((section, si) => (
              <div key={si} className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: section.color }}></div>
                  <h3 className="font-bold text-slate-900">{section.category}</h3>
                </div>
                <div className="p-4">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <div className="w-5 h-5 rounded border-2 border-slate-200 flex-shrink-0 mt-0.5"></div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{item.item}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mt-2">
              <p className="font-bold text-amber-800 text-sm flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4" /> Keep Your Receipts!
              </p>
              <p className="text-amber-600 text-xs leading-relaxed">
                The IRS can audit up to 3 years back (6 if they suspect major underreporting). Store receipts, invoices, and records for every deduction you claim. CasaCEO's Document Vault is perfect for this.
              </p>
              <Link to="/documents">
                <button className="mt-3 text-xs font-bold flex items-center gap-1" style={{ color: '#1e3a5f' }}>
                  Open Document Vault <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── TIME LOG TAB ── */}
        {activeTab === 'timelog' && (
          <TimeAndUsageLog />
        )}

        {/* ── CALCULATOR TAB ── */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">Rental Income Estimator</h2>
              <p className="text-slate-500 text-sm mb-6">Estimate your taxable rental income after deductions</p>

              <RentalIncomeCalculator />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">Depreciation Calculator</h2>
              <p className="text-slate-500 text-sm mb-2">Estimate your annual depreciation deduction</p>
              <DepreciationCalculator />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Rental Income Calculator ─────────────────────────────────────────
const RentalIncomeCalculator = () => {
  const [inputs, setInputs] = useState({
    monthlyRent: '', otherIncome: '', mortgageInterest: '',
    propertyTax: '', insurance: '', repairs: '', management: '',
    utilities: '', depreciation: '', other: ''
  });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const income = (parseFloat(inputs.monthlyRent) || 0) * 12 + (parseFloat(inputs.otherIncome) || 0);
    const expenses = [
      inputs.mortgageInterest, inputs.propertyTax, inputs.insurance,
      inputs.repairs, inputs.management, inputs.utilities,
      inputs.depreciation, inputs.other
    ].reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const net = income - expenses;
    setResult({ income, expenses, net });
  };

  const set = (key, val) => setInputs(p => ({ ...p, [key]: val }));

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Income
          </p>
          {[
            { key: 'monthlyRent', label: 'Monthly Rent' },
            { key: 'otherIncome', label: 'Other Rental Income (annual)' },
          ].map(f => (
            <div key={f.key} className="mb-3">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={inputs[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Annual Expenses
          </p>
          {[
            { key: 'mortgageInterest', label: 'Mortgage Interest' },
            { key: 'propertyTax', label: 'Property Taxes' },
            { key: 'insurance', label: 'Insurance' },
            { key: 'repairs', label: 'Repairs & Maintenance' },
            { key: 'management', label: 'Property Management' },
            { key: 'utilities', label: 'Utilities' },
            { key: 'depreciation', label: 'Depreciation' },
            { key: 'other', label: 'Other Deductions' },
          ].map(f => (
            <div key={f.key} className="mb-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={inputs[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full h-9 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full h-12 rounded-xl text-white text-sm font-bold mb-5"
        style={{ background: '#1e3a5f' }}
      >
        Calculate My Taxable Rental Income
      </button>

      {result && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Gross Income</p>
            <p className="text-xl font-extrabold text-green-700">${Math.round(result.income).toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Expenses</p>
            <p className="text-xl font-extrabold text-red-600">${Math.round(result.expenses).toLocaleString()}</p>
          </div>
          <div className={`rounded-2xl p-4 text-center border ${result.net >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Taxable Income</p>
            <p className={`text-xl font-extrabold ${result.net >= 0 ? 'text-blue-700' : 'text-amber-600'}`}>
              {result.net >= 0 ? '$' : '-$'}{Math.abs(Math.round(result.net)).toLocaleString()}
            </p>
            <p className="text-xs mt-1 text-slate-400">{result.net < 0 ? 'Rental Loss' : 'Net Profit'}</p>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400 text-center mt-4">
        * Estimate only. Actual taxable income depends on passive activity rules and your full tax situation.
      </p>
    </div>
  );
};


// ─── Time & Usage Log Component ──────────────────────────────────────
const TimeAndUsageLog = () => {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'rental',
    hours: '',
    activity: '',
    property: '',
    notes: '',
  });
  const [showForm, setShowForm] = useState(false);

  const ACTIVITY_TYPES = {
    rental: { label: 'Rental Day', color: '#059669', bg: '#ecfdf5', desc: 'Day property was rented to a tenant' },
    personal: { label: 'Personal Use Day', color: '#dc2626', bg: '#fef2f2', desc: 'Day you or family used the property' },
    repair: { label: 'Repair/Maintenance', color: '#f97316', bg: '#fff7ed', desc: 'Time spent on repairs or maintenance' },
    management: { label: 'Management Activity', color: '#2563eb', bg: '#eff6ff', desc: 'Bookkeeping, tenant communication, etc.' },
    travel: { label: 'Travel to Property', color: '#7c3aed', bg: '#f5f3ff', desc: 'Travel time for rental purposes' },
  };

  const addLog = () => {
    if (!form.date || !form.type) return;
    const newLog = { ...form, id: Date.now(), hours: parseFloat(form.hours) || 0 };
    setLogs(prev => [newLog, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setForm({ date: new Date().toISOString().split('T')[0], type: 'rental', hours: '', activity: '', property: '', notes: '' });
    setShowForm(false);
  };

  const deleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));

  // Totals
  const totalHours = logs.reduce((s, l) => s + (l.hours || 0), 0);
  const rentalDays = logs.filter(l => l.type === 'rental').length;
  const personalDays = logs.filter(l => l.type === 'personal').length;
  const managementHours = logs.filter(l => l.type === 'management' || l.type === 'repair' || l.type === 'travel')
    .reduce((s, l) => s + (l.hours || 0), 0);
  const totalDays = rentalDays + personalDays;
  const rentalPct = totalDays > 0 ? Math.round((rentalDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Why This Matters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Time & Usage Log</h2>
        <p className="text-slate-500 text-sm mb-5">Track rental days, personal use days, and management hours. Required for mixed-use properties and Real Estate Professional status.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            {
              title: 'Mixed-Use Properties',
              desc: 'If you use the rental personally AND rent it out, the IRS limits your deductions based on the ratio of rental days to total days used.',
              color: '#f97316',
              icon: <Home className="w-5 h-5" />
            },
            {
              title: 'Real Estate Professional',
              desc: 'To qualify for unlimited rental loss deductions, you must log 750+ hours per year in real estate activities. This log is your proof.',
              color: '#7c3aed',
              icon: <Building2 className="w-5 h-5" />
            },
            {
              title: 'IRS Audit Protection',
              desc: 'If the IRS questions your deductions, a detailed time log is your best defense. Courts have sided with taxpayers who kept good records.',
              color: '#059669',
              icon: <Shield className="w-5 h-5" />
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-4 border" style={{ background: `${item.color}0d`, borderColor: `${item.color}25` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${item.color}15` }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm mb-1">{item.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Year-to-Date Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Rental Days', value: rentalDays, color: '#059669', bg: '#ecfdf5' },
              { label: 'Personal Days', value: personalDays, color: '#dc2626', bg: '#fef2f2' },
              { label: 'Management Hours', value: `${Math.round(managementHours)}h`, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Rental Use %', value: `${rentalPct}%`, color: '#7c3aed', bg: '#f5f3ff' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-4 text-center border" style={{ background: stat.bg, borderColor: `${stat.color}20` }}>
                <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Real Estate Professional Progress */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-purple-800">Real Estate Professional Hours</p>
              <p className="text-sm font-bold text-purple-600">{Math.round(managementHours)} / 750 hrs</p>
            </div>
            <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min((managementHours / 750) * 100, 100)}%`, background: '#7c3aed' }}
              ></div>
            </div>
            <p className="text-xs text-purple-500 mt-2">
              {managementHours >= 750
                ? '✅ You may qualify as a Real Estate Professional — consult your tax advisor'
                : `${Math.round(750 - managementHours)} more hours needed to potentially qualify`
              }
            </p>
          </div>

          {/* Rental Use Warning */}
          {personalDays > 14 && personalDays > rentalDays * 0.1 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-3">
              <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" /> Mixed-Use Property Alert
              </p>
              <p className="text-xs text-amber-600 leading-relaxed">
                You have {personalDays} personal use days. The IRS considers this a personal residence and limits your rental deductions to the rental use percentage ({rentalPct}%). Consult your tax advisor.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Log Entries */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Activity Log</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: '#1e3a5f' }}
          >
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Activity Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Hours (if applicable)</label>
                <input
                  type="number"
                  placeholder="2.5"
                  value={form.hours}
                  onChange={e => setForm(p => ({ ...p, hours: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Property</label>
                <input
                  type="text"
                  placeholder="Lake House"
                  value={form.property}
                  onChange={e => setForm(p => ({ ...p, property: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Activity Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fixed leaking faucet in bathroom"
                  value={form.activity}
                  onChange={e => setForm(p => ({ ...p, activity: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={addLog}
                disabled={!form.date || !form.type}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: '#1e3a5f' }}
              >
                Save Entry
              </button>
            </div>
          </div>
        )}

        {/* Log List */}
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-slate-400 text-sm">No entries yet</p>
            <p className="text-slate-300 text-xs mt-1">Click "Add Entry" to start logging your time and usage</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map(log => {
              const type = ACTIVITY_TYPES[log.type];
              return (
                <div key={log.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: type.bg }}>
                    <Clock className="w-5 h-5" style={{ color: type.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: type.bg, color: type.color }}>
                        {type.label}
                      </span>
                      {log.property && (
                        <span className="text-xs text-slate-400">{log.property}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">{log.activity || type.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {log.hours > 0 && (
                      <p className="text-xs text-slate-400">{log.hours}h</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-300 hover:bg-red-100 hover:text-red-500 flex-shrink-0 ml-2"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700 text-sm">Give this log to your accountant</p>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            Print or screenshot this log at year end and include it with your tax documents. For mixed-use properties, your accountant will use the rental vs personal day ratio to calculate your allowable deductions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentalTaxGuidePage;

