import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Bed, Bath, Square, Calendar, Edit3, Camera, Share2,
  TrendingUp, DollarSign, Clock, Wrench, FileText, CreditCard,
  FolderOpen, Building2, TreePine, ShieldCheck, BookOpen, Key,
  LineChart, ArrowRight, Zap, Droplets, Wind, Flame, Activity,
  Star, Bell, ChevronDown, Download, AlertTriangle, CheckCircle2,
  LayoutGrid, Pin, Info
} from 'lucide-react';

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
  lender: 'First Coastal Bank', monthlyPayment: 3250,
  loanType: '30-year fixed',
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
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed">
      {text}
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────
const ConditionBadge = ({ condition }) => {
  const s = { 'Good': 'bg-green-100 text-green-700', 'Fair': 'bg-amber-100 text-amber-700', 'Needs Attention': 'bg-red-100 text-red-600' };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s[condition]}`}>{condition}</span>;
};

const SeverityPill = ({ severity }) => {
  const s = { 'High': 'bg-red-100 text-red-600', 'Medium': 'bg-amber-100 text-amber-700', 'Low': 'bg-blue-100 text-blue-600' };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s[severity]}`}>{severity}</span>;
};

const ValueChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-14">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-sm" style={{ height: `${(d.value / max) * 46}px`, background: i === data.length - 1 ? '#1e3a5f' : '#cbd5e1' }} />
          <span className="text-slate-400 text-[9px] font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const HealthBar = ({ age, lifespan }) => {
  const pct = Math.min((age / lifespan) * 100, 100);
  const color = pct > 90 ? '#dc2626' : pct > 65 ? '#d97706' : '#059669';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
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
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm">
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>Casa<span style={{ color: '#c9a96e' }}>CEO</span></span>
          </Link>

          <Tooltip text="Choose a home to view its full profile and activity.">
            <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 hover:shadow-sm transition-all">
              <MapPinIcon />
              <div className="text-left hidden sm:block">
                <p className="font-bold text-slate-900 text-sm leading-none">{HOME.address}</p>
                <p className="text-slate-400 text-xs mt-0.5">{HOME.city}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </Tooltip>

          <div className="flex items-center gap-3">
            <Tooltip text="See all your homes in a single dashboard.">
              <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                <LayoutGrid className="w-3.5 h-3.5" /> Switch to Portfolio View
              </Link>
            </Tooltip>
            <Tooltip text="View alerts, reminders, and important updates.">
              <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors relative">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </Tooltip>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: '#1e3a5f' }} title="Account">D</button>
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Photo 70% */}
              <div className="lg:w-[70%] relative rounded-2xl overflow-hidden h-56 sm:h-72">
                <img src={HOME.photo} alt={HOME.address} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest block mb-1">System of Record for This Home</span>
                  <h1 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight">{HOME.address}</h1>
                  <p className="text-blue-200 text-sm mt-1">{HOME.city}</p>
                </div>
              </div>

              {/* Actions 30% */}
              <div className="lg:w-[30%] flex flex-col justify-center gap-3">
                <Tooltip text="Generate a secure, read-only version of this home's profile.">
                  <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-white text-sm hover:opacity-90 transition-all" style={{ background: '#1e3a5f' }}>
                    <Share2 className="w-4 h-4" /> Share Home Profile
                  </button>
                </Tooltip>
                <Tooltip text="Update the home's core information and attributes.">
                  <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-slate-700 text-sm border border-slate-200 hover:bg-slate-50 transition-all">
                    <Edit3 className="w-4 h-4" /> Edit Home Details
                  </button>
                </Tooltip>
                <Tooltip text="Upload a new primary photo for this home.">
                  <button className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors text-center w-full">
                    <Camera className="w-3.5 h-3.5 inline mr-1" /> Add / Change Photo
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="flex items-center mt-5 bg-slate-50 rounded-2xl border border-slate-100 overflow-x-auto">
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
                  <div className={`flex-1 min-w-0 px-4 py-3 text-center flex-shrink-0 cursor-default ${i < arr.length - 1 ? 'border-r border-slate-200' : ''}`}>
                    <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{v.value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{v.label}</p>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* ── Two Column Body ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── LEFT COLUMN 60% ── */}
            <div className="lg:w-[60%] space-y-6">

              {/* Value & Equity */}
              <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                <h2 className="font-extrabold text-slate-900 text-base mb-5">Home Value & Equity</h2>
                <div className="grid grid-cols-2 gap-6 mb-5">
                  <div>
                    <Tooltip text="Automated valuation based on market data and comparable homes.">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1 flex items-center gap-1 cursor-default">
                        Estimated Value <Info className="w-3 h-3" />
                      </p>
                    </Tooltip>
                    <p className="text-3xl font-extrabold text-slate-900">${HOME.estimatedValue.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-1">Source: Automated valuation · Confidence: <span className="text-green-600 font-semibold">High</span></p>
                  </div>
                  <div>
                    <Tooltip text="Estimated value minus current mortgage balance.">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1 flex items-center gap-1 cursor-default">
                        Owner Equity <Info className="w-3 h-3" />
                      </p>
                    </Tooltip>
                    <p className="text-3xl font-extrabold" style={{ color: '#1e3a5f' }}>${HOME.equity.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-1">Mortgage balance: ${HOME.mortgageBalance.toLocaleString()} at {HOME.interestRate}%</p>
                  </div>
                </div>

                <div className="mb-5">
                  <Tooltip text="View how the home's value has changed over time.">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1 cursor-default">
                      Value Trend <Info className="w-3 h-3" />
                    </p>
                  </Tooltip>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                      {['1Y', '5Y', 'Since Purchase'].map(tab => (
                        <button key={tab} onClick={() => setChartTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ValueChart data={chartData} />
                </div>

                <div className="border-t border-slate-100 pt-5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Lender</p>
                    <p className="font-bold text-slate-900 text-sm">{HOME.lender}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Monthly Payment</p>
                    <p className="font-bold text-slate-900 text-sm">${HOME.monthlyPayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Loan Type</p>
                    <p className="font-bold text-slate-900 text-sm">{HOME.loanType}</p>
                  </div>
                </div>
                <Tooltip text="See lender, loan type, amortization, and payment schedule.">
                  <button className="mt-3 text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f' }}>
                    View full mortgage details <ArrowRight className="w-3 h-3" />
                  </button>
                </Tooltip>
              </div>

              {/* Alerts & Risks */}
              <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" style={{ color: '#e8604c' }} />
                    <h2 className="font-extrabold text-slate-900 text-base">Alerts & Risks</h2>
                  </div>
                  <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                    {['All', 'High', 'Medium', 'Low'].map(f => (
                      <button key={f} onClick={() => setAlertFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${alertFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <p className="font-bold text-slate-900 text-sm">No active alerts. This home is fully up to date.</p>
                    <p className="text-slate-400 text-xs mt-1">New alerts will appear here as the system monitors your home.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAlerts.map((alert, i) => {
                      const Icon = alert.icon;
                      return (
                        <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.severity === 'High' ? 'bg-red-50 border-red-100' : alert.severity === 'Medium' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${alert.severity === 'High' ? 'bg-red-100' : alert.severity === 'Medium' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            <Icon className={`w-4 h-4 ${alert.severity === 'High' ? 'text-red-500' : alert.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1"><SeverityPill severity={alert.severity} /></div>
                            <p className="text-slate-800 font-semibold text-sm">{alert.title}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{alert.sub}</p>
                            <p className="text-slate-400 text-xs mt-1">Due: {alert.due}</p>
                          </div>
                          <Tooltip text={alert.action === 'Schedule Vendor' ? 'Book a qualified professional to handle this issue.' : 'View more details about this alert.'}>
                            <Link to={alert.module} className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white hover:opacity-90 transition-all whitespace-nowrap ${alert.severity === 'High' ? 'bg-red-500' : alert.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                              {alert.action}
                            </Link>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button className="mt-4 text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f' }}>
                  View all alerts & history <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                <h2 className="font-extrabold text-slate-900 text-base mb-5">Recent Activity</h2>
                {ACTIVITY.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No recent activity. Updates will appear here as you add maintenance, documents, or expenses.</p>
                ) : (
                  <div className="space-y-1">
                    {ACTIVITY.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                          <Tooltip text="This entry shows a logged event, update, or completed task for the home.">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                              <Icon className="w-4 h-4" style={{ color: item.color }} />
                            </div>
                          </Tooltip>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 text-sm font-semibold">{item.description}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-slate-400 text-xs">{item.date}</p>
                            <button className="text-xs font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#1e3a5f' }}>
                              View maintenance record
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Tooltip text="See a complete history of everything that has happened to this home.">
                  <Link to="/timeline" className="mt-4 text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f' }}>
                    View full home timeline <ArrowRight className="w-3 h-3" />
                  </Link>
                </Tooltip>
              </div>

              {/* Modules Grid */}
              <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                <h2 className="font-extrabold text-slate-900 text-base mb-5">Home Modules</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MODULES.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                      <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl border border-slate-100 hover:shadow-sm hover:border-slate-200 transition-all group">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: mod.bg }}>
                            <Icon className="w-4 h-4" style={{ color: mod.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs">{mod.title}</p>
                            <p className="text-slate-400 text-xs mt-0.5 leading-tight">{mod.desc}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Tooltip text="Go to this module.">
                            <Link to={mod.link} className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg text-white hover:opacity-90 transition-all" style={{ background: mod.color === '#1A1A1A' ? '#1A1A1A' : '#1e3a5f' }}>
                              Open
                            </Link>
                          </Tooltip>
                          <Tooltip text="Add this module to your quick-access menu.">
                            <button className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                              <Star className="w-3 h-3 text-slate-400" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN 40% ── */}
            <div className="lg:w-[40%] space-y-6">

              {/* Systems & Structure */}
              <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                <h2 className="font-extrabold text-slate-900 text-base mb-1">Systems & Structure Health</h2>
                <p className="text-slate-400 text-xs mb-5">Digital snapshot of major components</p>

                {SYSTEMS.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No system data added yet. Add system ages and details to generate a full health report.</p>
                ) : (
                  <div className="space-y-4">
                    {SYSTEMS.map((sys, i) => {
                      const Icon = sys.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <Tooltip text={`Age: ${sys.age} yrs · Expected lifespan: ${sys.lifespan} yrs · Est. replacement: ${sys.cost}`}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: sys.bg }}>
                              <Icon className="w-4 h-4" style={{ color: sys.color }} />
                            </div>
                          </Tooltip>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-900 text-sm">{sys.name}</p>
                              <ConditionBadge condition={sys.condition} />
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5">
                              Age: {sys.age} yrs · Expected: {sys.lifespan} yrs · Est. {sys.cost}
                            </p>
                            <HealthBar age={sys.age} lifespan={sys.lifespan} />
                            <button className="text-xs font-semibold mt-1 hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f' }}>
                              View details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Update system details
                  </button>
                  <button className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f' }}>
                    View full system report <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Ready to Sell CTA */}
              <div className="rounded-3xl p-7 relative overflow-hidden" style={{ background: '#1e3a5f' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: '#c9a96e', transform: 'translate(30%, -30%)' }} />
                <div className="relative z-10">
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Thinking About Selling?</p>
                  <h3 className="text-white font-extrabold text-lg mb-3 leading-tight">
                    Turn this profile into a Compass-ready seller packet in seconds.
                  </h3>
                  <div className="space-y-2 mb-5">
                    {['Pre-listing checklist', 'Suggested repairs & vendors', 'Exportable valuation & cost summary'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
                        <p className="text-blue-200 text-xs">{item}</p>
                      </div>
                    ))}
                  </div>
                  <Tooltip text="Generate a full pre-listing package with insights and recommendations.">
                    <Link to="/ready-to-sell" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-white text-sm hover:opacity-90 transition-all mb-3" style={{ background: '#1A1A1A' }}>
                      <Star className="w-4 h-4" /> Prepare This Home for Market
                    </Link>
                  </Tooltip>
                  <button className="w-full text-xs font-semibold text-blue-300 hover:text-white transition-colors text-center">
                    Preview sample seller report →
                  </button>
                </div>
              </div>

              {/* Snapshot Widgets */}
              <div className="space-y-3">
                <Tooltip text="Total of taxes, insurance, utilities, and maintenance.">
                  <Link to="/expenses" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ecfdf5' }}>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Total Annual Home Spend</p>
                      <p className="text-2xl font-extrabold text-slate-900">$32,400</p>
                      <p className="text-slate-400 text-xs mt-0.5">Taxes · Insurance · Utilities · Maintenance</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                  </Link>
                </Tooltip>

                <Tooltip text="Summary of high, medium, and low-priority alerts.">
                  <Link to="/maintenance-management" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef2f2' }}>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Risk Overview</p>
                      <p className="text-2xl font-extrabold text-slate-900">3 High</p>
                      <p className="text-slate-400 text-xs mt-0.5">2 medium · 4 low priority items</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                  </Link>
                </Tooltip>

                <Tooltip text="Bills, services, and deadlines in the next 30 days.">
                  <Link to="/bill-pay" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff' }}>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-0.5">Upcoming Items</p>
                      <p className="text-2xl font-extrabold text-slate-900">3 Items</p>
                      <p className="text-slate-400 text-xs mt-0.5">2 upcoming bills · 1 scheduled service</p>
                      <p className="text-red-500 text-xs font-semibold mt-1">Property tax due in 18 days</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                  </Link>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {['Home Profile', 'Timeline', 'Reports', 'Settings'].map((item, i) => (
                <button key={i} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">{item}</button>
              ))}
            </div>
            <Tooltip text="Download a clean, formatted summary of this home.">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
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
