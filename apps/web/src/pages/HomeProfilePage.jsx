import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Bed, Bath, Square, Calendar, Edit3, Camera, Share2,
  TrendingUp, DollarSign, Clock, Wrench, FileText, CreditCard,
  FolderOpen, Building2, TreePine, ShieldCheck, BookOpen, Key,
  LineChart, ArrowRight, Zap, Droplets, Wind, Flame, Activity,
  Star, Bell, ChevronDown, Download, AlertTriangle, CheckCircle2,
  LayoutGrid, Info
} from 'lucide-react';

// ─── Design Tokens ────────────────────────────────────────────────────
// spacing: 4 | 8 | 16 | 24 | 32 | 48px
// typography: H1 30px/600 | H2 20px/600 | H3 18px/600 | body 15px | sub 13px | pill 12px
// cards: p-5 (20px) | rounded-xl (12px) | shadow-sm

// ─── Mock Data ────────────────────────────────────────────────────────
const HOME = {
  address: '123 Oakwood Lane',
  city: 'St. Simons Island, GA 31522',
  photo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
  beds: 4, baths: 3.5, sqft: '2,850', lot: '0.35 acres',
  yearBuilt: 2008, type: 'Single-Family Home', lastUpdated: 'Last Updated 2 Days Ago',
  purchasePrice: 850000, purchaseDate: 'Jun 2018',
  estimatedValue: 1245000, valueConfidence: 'High',
  mortgageBalance: 630000, interestRate: 3.10,
  lender: 'First Coastal Bank', monthlyPayment: 3250, loanType: '30-year fixed',
  equity: 615000, equityPct: 49,
  valueTrend1Y: [
    { label: 'Jun', value: 1180 }, { label: 'Aug', value: 1195 },
    { label: 'Oct', value: 1210 }, { label: 'Dec', value: 1220 },
    { label: 'Feb', value: 1235 }, { label: 'Now', value: 1245 },
  ],
  valueTrend5Y: [
    { label: '2021', value: 980 }, { label: '2022', value: 1050 },
    { label: '2023', value: 1120 }, { label: '2024', value: 1190 },
    { label: '2025', value: 1225 }, { label: 'Now', value: 1245 },
  ],
  valueTrendAll: [
    { label: '2018', value: 850 }, { label: '2019', value: 890 },
    { label: '2020', value: 930 }, { label: '2022', value: 1050 },
    { label: '2024', value: 1190 }, { label: 'Now', value: 1245 },
  ],
};

const SYSTEMS = [
  { name: 'Roof', icon: Home, age: 17, lifespan: 20, condition: 'Fair', cost: '$18,000', color: '#d97706', bg: '#fffbeb' },
  { name: 'HVAC', icon: Wind, age: 11, lifespan: 15, condition: 'Fair', cost: '$8,000', color: '#d97706', bg: '#fffbeb' },
  { name: 'Water Heater', icon: Flame, age: 13, lifespan: 12, condition: 'Needs Attention', cost: '$1,500', color: '#dc2626', bg: '#fef2f2' },
  { name: 'Plumbing', icon: Droplets, age: 16, lifespan: 50, condition: 'Good', cost: 'Varies', color: '#059669', bg: '#ecfdf5' },
  { name: 'Electrical', icon: Zap, age: 16, lifespan: 40, condition: 'Good', cost: 'Varies', color: '#059669', bg: '#ecfdf5' },
  { name: 'Appliances', icon: Zap, age: 5, lifespan: 15, condition: 'Good', cost: 'Varies', color: '#059669', bg: '#ecfdf5' },
  { name: 'Foundation', icon: Square, age: 16, lifespan: 100, condition: 'Good', cost: '$5,000+', color: '#059669', bg: '#ecfdf5' },
  { name: 'Windows', icon: Building2, age: 16, lifespan: 30, condition: 'Good', cost: '$10,000', color: '#059669', bg: '#ecfdf5' },
  { name: 'Exterior', icon: Home, age: 16, lifespan: 20, condition: 'Fair', cost: '$6,000', color: '#d97706', bg: '#fffbeb' },
  { name: 'Septic/Sewer', icon: Droplets, age: 16, lifespan: 30, condition: 'Good', cost: '$8,000', color: '#059669', bg: '#ecfdf5' },
];

const ALERTS = [
  { severity: 'High', title: 'Roof nearing end of expected lifespan', sub: 'Installed 2008 · Typical lifespan 20 years · Est. replacement: $18,000', due: 'Within 12 months', action: 'Schedule Vendor', module: '/maintenance-management', icon: Home },
  { severity: 'High', title: 'Water heater past typical lifespan', sub: 'Age: 13 years · Expected: 12 years · Est. replacement: $1,500', due: 'Immediate', action: 'Schedule Vendor', module: '/maintenance-management', icon: Flame },
  { severity: 'Medium', title: 'HVAC filter overdue by 30 days', sub: 'Last serviced: Feb 2026 · Filter replacement recommended', due: 'This week', action: 'View Details', module: '/maintenance-management', icon: Wind },
  { severity: 'Medium', title: 'Homeowner insurance renews in 45 days', sub: 'Policy expires Jul 10, 2026 · Review for coverage gaps', due: 'Jul 10, 2026', action: 'View Details', module: '/documents', icon: ShieldCheck },
  { severity: 'Low', title: 'Property tax payment due next month', sub: 'Glynn County · Est. $6,200 due Q3 2026', due: 'Jun 30, 2026', action: 'View Details', module: '/property-tax', icon: FileText },
];

const ACTIVITY = [
  { date: 'May 22', type: 'Maintenance', description: 'Annual HVAC inspection completed', sub: 'Completed by Coastal Cooling · Logged 3 days ago', icon: Wrench, color: '#f97316' },
  { date: 'May 18', type: 'Document', description: 'Homeowner insurance policy uploaded', sub: 'Policy #HO-2847 · Expires Jul 2026', icon: FileText, color: '#7c3aed' },
  { date: 'May 10', type: 'Bill', description: 'Mortgage payment logged — $3,250', sub: 'First Coastal Bank · Auto-pay confirmed', icon: CreditCard, color: '#2563eb' },
  { date: 'Apr 30', type: 'Valuation', description: 'Home value updated to $1,245,000', sub: 'Automated valuation · High confidence', icon: TrendingUp, color: '#059669' },
  { date: 'Apr 15', type: 'Expense', description: 'Landscaping service — $320', sub: 'Island Lawn & Garden · Recurring monthly', icon: TreePine, color: '#16a34a' },
  { date: 'Apr 2', type: 'Maintenance', description: 'Exterior paint touch-up completed', sub: 'Golden Isles Painting · Receipt uploaded', icon: Wrench, color: '#f97316' },
];

const MODULES = [
  { title: 'Maintenance', desc: 'Track past and upcoming work.', icon: Wrench, link: '/maintenance-management', color: '#f97316', bg: '#fff7ed' },
  { title: 'Bills & Utilities', desc: 'See recurring costs and due dates.', icon: CreditCard, link: '/bill-pay', color: '#2563eb', bg: '#eff6ff' },
  { title: 'Expenses', desc: 'Categorize and export home spending.', icon: DollarSign, link: '/expenses', color: '#059669', bg: '#ecfdf5' },
  { title: 'Documents', desc: 'Store deeds, policies, inspections, and more.', icon: FolderOpen, link: '/documents', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Valuation', desc: 'Compare estimates and run scenarios.', icon: TrendingUp, link: '/home-valuation', color: '#1e3a5f', bg: '#eef2f8' },
  { title: 'Rentals', desc: 'Track rental income and tax items.', icon: Key, link: '/rental-properties', color: '#db2777', bg: '#fdf2f8' },
  { title: 'Warranty Tracker', desc: 'Never miss a coverage window.', icon: ShieldCheck, link: '/warranty-tracker', color: '#059669', bg: '#ecfdf5' },
  { title: 'Landscaping', desc: 'Log recurring outdoor services.', icon: TreePine, link: '/plants', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'Property Tax', desc: 'Track assessments and payments.', icon: FileText, link: '/property-tax', color: '#dc2626', bg: '#fef2f2' },
  { title: 'Learning Hub', desc: 'Guides for smarter home ownership.', icon: BookOpen, link: '/learn', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Ready to Sell', desc: 'Prepare this home for market.', icon: Star, link: '/ready-to-sell', color: '#1A1A1A', bg: '#f1f5f9' },
  { title: 'Reports', desc: 'Export data-ready home reports.', icon: LineChart, link: '/expenses', color: '#7c3aed', bg: '#faf5ff' },
];

// ─── Tooltip ──────────────────────────────────────────────────────────
const Tooltip = ({ text, children }) => (
  <div className="relative group/tip inline-flex">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white rounded-xl px-3 py-2 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed" style={{ fontSize: '12px' }}>
      {text}
    </div>
  </div>
);

// ─── Badges ───────────────────────────────────────────────────────────
const ConditionBadge = ({ condition }) => {
  const s = { 'Good': 'bg-green-100 text-green-700', 'Fair': 'bg-amber-100 text-amber-700', 'Needs Attention': 'bg-red-100 text-red-600' };
  return <span className={`font-medium rounded-full px-2 py-0.5 ${s[condition]}`} style={{ fontSize: '12px' }}>{condition}</span>;
};

const SeverityPill = ({ severity }) => {
  const s = { 'High': 'bg-red-100 text-red-600', 'Medium': 'bg-amber-100 text-amber-700', 'Low': 'bg-blue-100 text-blue-600' };
  return <span className={`font-medium rounded-full px-2 py-0.5 ${s[severity]}`} style={{ fontSize: '12px' }}>{severity}</span>;
};

// ─── Value Chart (120–160px height per spec) ──────────────────────────
const ValueChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height: '140px' }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t" style={{
            height: `${(d.value / max) * 112}px`,
            background: i === data.length - 1 ? '#1e3a5f' : '#e2e8f0',
            transition: 'height 0.3s ease',
          }} />
          <span className="text-slate-400" style={{ fontSize: '11px' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Health Bar ───────────────────────────────────────────────────────
const HealthBar = ({ age, lifespan }) => {
  const pct = Math.min((age / lifespan) * 100, 100);
  const color = pct > 90 ? '#dc2626' : pct > 65 ? '#d97706' : '#059669';
  return (
    <div className="w-full bg-slate-100 rounded-full" style={{ height: '6px', marginTop: '4px' }}>
      <div className="rounded-full" style={{ width: `${pct}%`, height: '6px', background: color }} />
    </div>
  );
};

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Card wrapper — enforces design system ────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-100 shadow-sm ${className}`} style={{ borderRadius: '12px', padding: '20px' }}>
    {children}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────
const HomeProfilePage = () => {
  const [chartTab, setChartTab] = useState('1Y');
  const [alertFilter, setAlertFilter] = useState('All');

  const chartData = chartTab === '1Y' ? HOME.valueTrend1Y : chartTab === '5Y' ? HOME.valueTrend5Y : HOME.valueTrendAll;
  const filteredAlerts = alertFilter === 'All' ? ALERTS : ALERTS.filter(a => a.severity === alertFilter);
  const gain = HOME.estimatedValue - HOME.purchasePrice;
  const gainPct = ((gain / HOME.purchasePrice) * 100).toFixed(1);

  return (
    <>
      <Helmet><title>Home Profile — CasaCEO</title></Helmet>
      <div className="min-h-screen bg-slate-50">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm" style={{ padding: '12px 32px' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block" style={{ color: '#1e3a5f', fontSize: '18px' }}>
                Casa<span style={{ color: '#c9a96e' }}>CEO</span>
              </span>
            </Link>

            <Tooltip text="Choose a home to view its full profile and activity.">
              <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all" style={{ padding: '8px 16px' }}>
                <MapPinIcon />
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-slate-900 leading-none" style={{ fontSize: '14px' }}>{HOME.address}</p>
                  <p className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>{HOME.city}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </Tooltip>

            <div className="flex items-center gap-4">
              <Tooltip text="See all your homes in a single dashboard.">
                <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-700 transition-colors" style={{ fontSize: '13px' }}>
                  <LayoutGrid className="w-3.5 h-3.5" /> Switch to Portfolio View
                </Link>
              </Tooltip>
              <Tooltip text="View alerts, reminders, and important updates.">
                <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors relative">
                  <Bell className="w-4 h-4 text-slate-500" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </Tooltip>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold" style={{ background: '#1e3a5f', fontSize: '14px' }}>D</div>
            </div>
          </div>
        </header>

        {/* ── Hero Band ── */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto" style={{ padding: '32px 32px 0 32px' }}>
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Photo — 16:9, radius 16px, 70% width */}
              <div className="lg:w-[70%] relative overflow-hidden" style={{ borderRadius: '16px', aspectRatio: '16/9' }}>
                <img src={HOME.photo} alt={HOME.address} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.82) 0%, transparent 55%)' }} />
                <div className="absolute bottom-0 left-0" style={{ padding: '24px' }}>
                  {/* Tagline pill */}
                  <span className="font-medium uppercase tracking-widest text-blue-200 block" style={{ fontSize: '12px', marginBottom: '8px' }}>
                    System of Record for This Home
                  </span>
                  {/* H1 — 30px/600 */}
                  <h1 className="text-white font-semibold leading-tight" style={{ fontSize: '30px', lineHeight: '1.2', marginBottom: '4px' }}>
                    {HOME.address}
                  </h1>
                  {/* Subline — 14px muted */}
                  <p className="text-blue-200" style={{ fontSize: '14px' }}>{HOME.city}</p>
                </div>
              </div>

              {/* Actions — 30% */}
              <div className="lg:w-[30%] flex flex-col justify-center" style={{ gap: '12px' }}>
                <Tooltip text="Generate a secure, read-only version of this home's profile.">
                  <button className="flex items-center justify-center gap-2 w-full font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '12px 16px', fontSize: '15px' }}>
                    <Share2 className="w-4 h-4" /> Share Home Profile
                  </button>
                </Tooltip>
                <Tooltip text="Update the home's core information and attributes.">
                  <button className="flex items-center justify-center gap-2 w-full font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '12px 16px', fontSize: '15px' }}>
                    <Edit3 className="w-4 h-4" /> Edit Home Details
                  </button>
                </Tooltip>
                <Tooltip text="Upload a new primary photo for this home.">
                  <button className="font-medium text-slate-400 hover:text-slate-600 transition-colors w-full text-center" style={{ fontSize: '13px' }}>
                    <Camera className="w-3.5 h-3.5 inline mr-1" /> Add / Change Photo
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Key Stats Strip — 16px below photo */}
            <div className="flex items-center overflow-x-auto" style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 20px', marginTop: '16px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
              {[
                { label: 'Beds', value: `${HOME.beds} bd`, tip: 'Number of bedrooms recorded for this home.' },
                { label: 'Baths', value: `${HOME.baths} ba`, tip: 'Full and half bathrooms combined.' },
                { label: 'Size', value: `${HOME.sqft} Sq Ft`, tip: 'Total heated and cooled living space.' },
                { label: 'Lot', value: HOME.lot, tip: 'Total property size as recorded in public data.' },
                { label: 'Year Built', value: `Built ${HOME.yearBuilt}`, tip: 'Original construction year.' },
                { label: 'Home Type', value: HOME.type, tip: 'Classification based on public records.' },
                { label: 'Last Updated', value: HOME.lastUpdated, tip: 'Most recent sync of home data.' },
              ].map((v, i, arr) => (
                <Tooltip key={i} text={v.tip}>
                  <div className={`flex-1 min-w-0 text-center cursor-default flex-shrink-0 ${i < arr.length - 1 ? 'border-r border-slate-200' : ''}`} style={{ padding: '0 24px' }}>
                    {/* Value — 16px/500 */}
                    <p className="font-medium text-slate-900 whitespace-nowrap" style={{ fontSize: '15px' }}>{v.value}</p>
                    {/* Label — 12px muted */}
                    <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{v.label}</p>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* ── Two Column Body — 60/40, 32px gutter ── */}
        <main className="max-w-7xl mx-auto" style={{ padding: '32px' }}>
          <div className="flex flex-col lg:flex-row" style={{ gap: '32px' }}>

            {/* ── LEFT 60% ── */}
            <div className="lg:w-[60%]" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Value & Equity */}
              <Card>
                {/* H3 — 18px/600 */}
                <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Home Value & Equity</h3>

                {/* Top row — value + equity */}
                <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div>
                    <Tooltip text="Automated valuation based on market data and comparable homes.">
                      <p className="text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 cursor-default" style={{ fontSize: '12px', marginBottom: '8px' }}>
                        Estimated Value <Info className="w-3 h-3" />
                      </p>
                    </Tooltip>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '30px', lineHeight: '1.2' }}>${HOME.estimatedValue.toLocaleString()}</p>
                    <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>Automated valuation · Confidence: <span className="text-green-600 font-medium">High</span></p>
                  </div>
                  <div>
                    <Tooltip text="Estimated value minus current mortgage balance.">
                      <p className="text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 cursor-default" style={{ fontSize: '12px', marginBottom: '8px' }}>
                        Owner Equity <Info className="w-3 h-3" />
                      </p>
                    </Tooltip>
                    <p className="font-semibold" style={{ fontSize: '30px', lineHeight: '1.2', color: '#1e3a5f' }}>${HOME.equity.toLocaleString()}</p>
                    <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>Mortgage balance: ${HOME.mortgageBalance.toLocaleString()} at {HOME.interestRate}%</p>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ marginBottom: '24px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                    <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px' }}>Value Trend</p>
                    <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                      {['1Y', '5Y', 'Since Purchase'].map(tab => (
                        <button key={tab} onClick={() => setChartTab(tab)}
                          className={`rounded-lg font-medium transition-all ${chartTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          style={{ padding: '6px 12px', fontSize: '12px' }}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ValueChart data={chartData} />
                </div>

                {/* Mortgage details */}
                <div className="border-t border-slate-100" style={{ paddingTop: '16px' }}>
                  <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '12px' }}>
                    {[
                      { label: 'Lender', value: HOME.lender },
                      { label: 'Monthly Payment', value: `$${HOME.monthlyPayment.toLocaleString()}` },
                      { label: 'Loan Type', value: HOME.loanType },
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
                        <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <Tooltip text="See lender, loan type, amortization, and payment schedule.">
                    <button className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                      View full mortgage details <ArrowRight className="w-3 h-3" />
                    </button>
                  </Tooltip>
                </div>
              </Card>

              {/* Alerts & Risks */}
              <Card>
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" style={{ color: '#e8604c' }} />
                    <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Alerts & Risks</h3>
                  </div>
                  <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                    {['All', 'High', 'Medium', 'Low'].map(f => (
                      <button key={f} onClick={() => setAlertFilter(f)}
                        className={`rounded-lg font-medium transition-all ${alertFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        style={{ padding: '6px 10px', fontSize: '12px' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredAlerts.length === 0 ? (
                  <div className="text-center" style={{ padding: '32px 0' }}>
                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" style={{ marginBottom: '8px' }} />
                    <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>No active alerts. This home is fully up to date.</p>
                    <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>New alerts will appear here as the system monitors your home.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredAlerts.map((alert, i) => {
                      const Icon = alert.icon;
                      const colors = {
                        High: { bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', iconColor: '#ef4444', btnBg: '#ef4444' },
                        Medium: { bg: '#fffbeb', border: '#fde68a', iconBg: '#fef3c7', iconColor: '#f59e0b', btnBg: '#f59e0b' },
                        Low: { bg: '#eff6ff', border: '#bfdbfe', iconBg: '#dbeafe', iconColor: '#3b82f6', btnBg: '#3b82f6' },
                      }[alert.severity];
                      return (
                        <div key={i} className="flex items-start gap-4" style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px' }}>
                          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.iconBg, marginTop: '2px' }}>
                            <Icon style={{ width: '16px', height: '16px', color: colors.iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ marginBottom: '8px' }}><SeverityPill severity={alert.severity} /></div>
                            <p className="font-semibold text-slate-800" style={{ fontSize: '15px' }}>{alert.title}</p>
                            <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '4px' }}>{alert.sub}</p>
                            <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>Due: {alert.due}</p>
                          </div>
                          <Link to={alert.module} className="flex-shrink-0 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: colors.btnBg, padding: '8px 12px', fontSize: '12px' }}>
                            {alert.action}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px', marginTop: '16px' }}>
                  View all alerts & history <ArrowRight className="w-3 h-3" />
                </button>
              </Card>

              {/* Recent Activity */}
              <Card>
                <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Activity</h3>
                {ACTIVITY.length === 0 ? (
                  <p className="text-slate-400 text-center" style={{ fontSize: '14px', padding: '32px 0' }}>
                    No recent activity. Updates will appear here as you add maintenance, documents, or expenses.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {ACTIVITY.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start group hover:bg-slate-50 rounded-xl transition-colors" style={{ gap: '12px', padding: '8px' }}>
                          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${item.color}18` }}>
                            <Icon style={{ width: '16px', height: '16px', color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800" style={{ fontSize: '15px' }}>{item.description}</p>
                            <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>{item.sub}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-slate-400" style={{ fontSize: '13px' }}>{item.date}</p>
                            <button className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#1e3a5f', fontSize: '12px', marginTop: '4px' }}>
                              View record
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link to="/timeline" className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px', marginTop: '16px' }}>
                  View full home timeline <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>

              {/* Modules Grid */}
              <Card>
                <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Home Modules</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: '12px' }}>
                  {MODULES.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                      <div key={i} className="border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group" style={{ borderRadius: '12px', padding: '16px' }}>
                        <div className="flex items-center" style={{ gap: '12px', marginBottom: '4px' }}>
                          <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ width: '36px', height: '36px', borderRadius: '10px', background: mod.bg }}>
                            <Icon style={{ width: '16px', height: '16px', color: mod.color }} />
                          </div>
                          <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{mod.title}</p>
                        </div>
                        <p className="text-slate-400" style={{ fontSize: '12px', marginBottom: '16px', lineHeight: '1.4', marginLeft: '48px' }}>{mod.desc}</p>
                        <div className="flex gap-2">
                          <Link to={mod.link} className="flex-1 text-center font-semibold text-white rounded-lg hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '6px 12px', fontSize: '12px' }}>
                            Open
                          </Link>
                          <Tooltip text="Add this module to your quick-access menu.">
                            <button className="border border-slate-200 hover:bg-slate-50 transition-colors rounded-lg" style={{ padding: '6px 10px' }}>
                              <Star style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* ── RIGHT 40% ── */}
            <div className="lg:w-[40%]" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Systems & Structure */}
              <Card>
                <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '4px' }}>Systems & Structure Health</h3>
                <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '16px' }}>Digital snapshot of major components</p>

                {SYSTEMS.length === 0 ? (
                  <p className="text-slate-400 text-center" style={{ fontSize: '14px', padding: '32px 0' }}>
                    No system data added yet. Add system ages and details to generate a full health report.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {SYSTEMS.map((sys, i) => {
                      const Icon = sys.icon;
                      return (
                        <div key={i} className="flex items-start" style={{ gap: '12px' }}>
                          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: sys.bg }}>
                            <Icon style={{ width: '14px', height: '14px', color: sys.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{sys.name}</p>
                              <ConditionBadge condition={sys.condition} />
                            </div>
                            <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>
                              Age: {sys.age} yrs · Expected: {sys.lifespan} yrs · Est. {sys.cost}
                            </p>
                            <HealthBar age={sys.age} lifespan={sys.lifespan} />
                            <button className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '12px', marginTop: '4px' }}>
                              View details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100" style={{ paddingTop: '16px', marginTop: '24px' }}>
                  <button className="font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl" style={{ padding: '8px 14px', fontSize: '12px' }}>
                    Update system details
                  </button>
                  <button className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '12px' }}>
                    View full system report <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Card>

              {/* Ready to Sell CTA */}
              <div className="relative overflow-hidden" style={{ background: '#1e3a5f', borderRadius: '12px', padding: '20px' }}>
                <div className="absolute top-0 right-0 rounded-full opacity-5" style={{ width: '120px', height: '120px', background: '#c9a96e', transform: 'translate(30%, -30%)' }} />
                <div className="relative z-10">
                  {/* H3 */}
                  <p className="text-blue-200 font-medium uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '8px' }}>Thinking About Selling?</p>
                  <h3 className="text-white font-semibold leading-snug" style={{ fontSize: '18px', marginBottom: '8px' }}>
                    Turn this profile into a Compass-ready seller packet in seconds.
                  </h3>
                  {/* Bullets — 8px gap */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {['Pre-listing checklist', 'Suggested repairs & vendors', 'Exportable valuation & cost summary'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#93c5fd', flexShrink: 0 }} />
                        <p className="text-blue-200" style={{ fontSize: '13px' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/ready-to-sell" className="flex items-center justify-center gap-2 w-full font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1A1A1A', padding: '12px 16px', fontSize: '14px', marginBottom: '8px' }}>
                    <Star className="w-4 h-4" /> Prepare This Home for Market
                  </Link>
                  <button className="w-full text-center text-blue-300 hover:text-white transition-colors" style={{ fontSize: '13px' }}>
                    Preview sample seller report →
                  </button>
                </div>
              </div>

              {/* Snapshot Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    tip: 'Total of taxes, insurance, utilities, and maintenance.',
                    link: '/expenses',
                    iconBg: '#ecfdf5', iconColor: '#059669', Icon: DollarSign,
                    label: 'Total Annual Home Spend',
                    value: '$32,400',
                    sub: 'Taxes · Insurance · Utilities · Maintenance',
                    extra: null,
                  },
                  {
                    tip: 'Summary of high, medium, and low-priority alerts.',
                    link: '/maintenance-management',
                    iconBg: '#fef2f2', iconColor: '#dc2626', Icon: AlertTriangle,
                    label: 'Risk Overview',
                    value: '3 High',
                    sub: '2 medium · 4 low priority items',
                    extra: null,
                  },
                  {
                    tip: 'Bills, services, and deadlines in the next 30 days.',
                    link: '/bill-pay',
                    iconBg: '#eff6ff', iconColor: '#2563eb', Icon: Clock,
                    label: 'Upcoming Items',
                    value: '3 Items',
                    sub: '2 upcoming bills · 1 scheduled service',
                    extra: 'Property tax due in 18 days',
                  },
                ].map((w, i) => (
                  <Tooltip key={i} text={w.tip}>
                    <Link to={w.link} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block" style={{ borderRadius: '12px', padding: '16px' }}>
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: w.iconBg }}>
                        <w.Icon style={{ width: '20px', height: '20px', color: w.iconColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '4px' }}>{w.label}</p>
                        <p className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: '1.2' }}>{w.value}</p>
                        <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>{w.sub}</p>
                        {w.extra && <p className="font-semibold text-red-500" style={{ fontSize: '12px', marginTop: '4px' }}>{w.extra}</p>}
                      </div>
                      <ArrowRight style={{ width: '16px', height: '16px', color: '#cbd5e1', flexShrink: 0, marginTop: '4px' }} />
                    </Link>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer — 24px padding, 24px link spacing ── */}
          <div className="flex items-center justify-between border-t border-slate-200" style={{ marginTop: '48px', paddingTop: '24px' }}>
            <div className="flex items-center" style={{ gap: '24px' }}>
              {['Home Profile', 'Timeline', 'Reports', 'Settings'].map((item, i) => (
                <button key={i} className="font-medium text-slate-500 hover:text-slate-800 transition-colors" style={{ fontSize: '14px' }}>{item}</button>
              ))}
            </div>
            <Tooltip text="Download a clean, formatted summary of this home.">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Download className="w-4 h-4" /> Export Home Profile as PDF
              </button>
            </Tooltip>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeProfilePage;
