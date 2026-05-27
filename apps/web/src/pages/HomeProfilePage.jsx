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

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════
const HOME_DATA = {
  home: {
    address: '123 Oakwood Lane',
    cityStateZip: 'St. Simons Island, GA 31522',
    photoUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
    beds: 4, baths: 3.5, sqft: '2,850', lotSize: '0.35 acres',
    yearBuilt: 2008, homeType: 'Single-Family Home',
    lastUpdated: 'Last Updated 2 Days Ago',
  },
  value: {
    estimatedValue: 1245000, confidence: 'High',
    purchasePrice: 850000, purchaseDate: 'Jun 2018',
    trend1Y: [
      { label: 'Jun', value: 1180 }, { label: 'Aug', value: 1195 },
      { label: 'Oct', value: 1210 }, { label: 'Dec', value: 1220 },
      { label: 'Feb', value: 1235 }, { label: 'Now', value: 1245 },
    ],
    trend5Y: [
      { label: '2021', value: 980 }, { label: '2022', value: 1050 },
      { label: '2023', value: 1120 }, { label: '2024', value: 1190 },
      { label: '2025', value: 1225 }, { label: 'Now', value: 1245 },
    ],
    trendAll: [
      { label: '2018', value: 850 }, { label: '2019', value: 890 },
      { label: '2020', value: 930 }, { label: '2022', value: 1050 },
      { label: '2024', value: 1190 }, { label: 'Now', value: 1245 },
    ],
  },
  equity: {
    equity: 615000, equityPct: 49,
    mortgageBalance: 630000, interestRate: 3.10,
    lender: 'First Coastal Bank', monthlyPayment: 3250, loanType: '30-year fixed',
  },
  alerts: [
    { severity: 'High', title: 'Roof nearing end of expected lifespan', sub: 'Installed 2008 · Typical lifespan 20 years · Est. replacement: $18,000', due: 'Within 12 months', action: 'Schedule Vendor', module: '/maintenance-management', icon: Home },
    { severity: 'High', title: 'Water heater past typical lifespan', sub: 'Age: 13 years · Expected: 12 years · Est. replacement: $1,500', due: 'Immediate', action: 'Schedule Vendor', module: '/maintenance-management', icon: Flame },
    { severity: 'Medium', title: 'HVAC filter overdue by 30 days', sub: 'Last serviced: Feb 2026 · Filter replacement recommended', due: 'This week', action: 'View Details', module: '/maintenance-management', icon: Wind },
    { severity: 'Medium', title: 'Homeowner insurance renews in 45 days', sub: 'Policy expires Jul 10, 2026 · Review for coverage gaps', due: 'Jul 10, 2026', action: 'View Details', module: '/documents', icon: ShieldCheck },
    { severity: 'Low', title: 'Property tax payment due next month', sub: 'Glynn County · Est. $6,200 due Q3 2026', due: 'Jun 30, 2026', action: 'View Details', module: '/property-tax', icon: FileText },
  ],
  activity: [
    { date: 'May 22', type: 'Maintenance', description: 'Annual HVAC inspection completed', sub: 'Completed by Coastal Cooling · Logged 3 days ago', icon: Wrench, color: '#f97316' },
    { date: 'May 18', type: 'Document', description: 'Homeowner insurance policy uploaded', sub: 'Policy #HO-2847 · Expires Jul 2026', icon: FileText, color: '#7c3aed' },
    { date: 'May 10', type: 'Bill', description: 'Mortgage payment logged — $3,250', sub: 'First Coastal Bank · Auto-pay confirmed', icon: CreditCard, color: '#2563eb' },
    { date: 'Apr 30', type: 'Valuation', description: 'Home value updated to $1,245,000', sub: 'Automated valuation · High confidence', icon: TrendingUp, color: '#059669' },
    { date: 'Apr 15', type: 'Expense', description: 'Landscaping service — $320', sub: 'Island Lawn & Garden · Recurring monthly', icon: TreePine, color: '#16a34a' },
    { date: 'Apr 2', type: 'Maintenance', description: 'Exterior paint touch-up completed', sub: 'Golden Isles Painting · Receipt uploaded', icon: Wrench, color: '#f97316' },
  ],
  modules: [
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
  ],
  systems: [
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
  ],
  snapshots: {
    annualCost: '$32,400',
    riskCounts: { high: 3, medium: 2, low: 4 },
    upcomingItems: [
      { text: '2 upcoming bills' },
      { text: '1 scheduled service' },
      { text: 'Property tax due in 18 days', urgent: true },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════
// ATOMIC COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const Tooltip = ({ text, children }) => (
  <div className="relative group/tip inline-flex">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white rounded-xl px-3 py-2 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed" style={{ fontSize: '12px' }}>
      {text}
    </div>
  </div>
);

const Card = ({ children, className = '', style = {} }) => (
  <div className={`bg-white border border-slate-100 shadow-sm ${className}`} style={{ borderRadius: '12px', padding: '20px', ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, right }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
    <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>{title}</h3>
    {right && <div>{right}</div>}
  </div>
);

const Pill = ({ label, variant }) => {
  const variants = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-blue-100 text-blue-600',
    Good: 'bg-green-100 text-green-700',
    Fair: 'bg-amber-100 text-amber-700',
    'Needs Attention': 'bg-red-100 text-red-600',
  };
  return (
    <span className={`font-medium rounded-full px-2 py-0.5 ${variants[variant || label]}`} style={{ fontSize: '12px' }}>
      {label}
    </span>
  );
};

const TextLink = ({ children, to, onClick, style = {} }) =>
  to ? (
    <Link to={to} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px', ...style }}>
      {children} <ArrowRight className="w-3 h-3" />
    </Link>
  ) : (
    <button onClick={onClick} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px', ...style }}>
      {children} <ArrowRight className="w-3 h-3" />
    </button>
  );

const EmptyState = ({ icon: Icon, message, sub }) => (
  <div className="text-center" style={{ padding: '32px 0' }}>
    {Icon && <Icon className="w-10 h-10 text-slate-300 mx-auto" style={{ marginBottom: '8px' }} />}
    <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{message}</p>
    {sub && <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>{sub}</p>}
  </div>
);

const HealthBar = ({ age, lifespan }) => {
  const pct = Math.min((age / lifespan) * 100, 100);
  const color = pct > 90 ? '#dc2626' : pct > 65 ? '#d97706' : '#059669';
  return (
    <div className="w-full bg-slate-100 rounded-full" style={{ height: '6px', marginTop: '4px' }}>
      <div className="rounded-full" style={{ width: `${pct}%`, height: '6px', background: color }} />
    </div>
  );
};

const ValueTrendChart = ({ data }) => {
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

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════
// PAGE HEADER
// ═══════════════════════════════════════════════════════════════════════

const AddressBlock = ({ address, cityStateZip }) => (
  <div>
    <span className="font-medium uppercase tracking-widest text-blue-200 block" style={{ fontSize: '12px', marginBottom: '8px' }}>
      System of Record for This Home
    </span>
    <h1 className="text-white font-semibold leading-tight" style={{ fontSize: '30px', lineHeight: '1.2', marginBottom: '4px' }}>{address}</h1>
    <p className="text-blue-200" style={{ fontSize: '14px' }}>{cityStateZip}</p>
  </div>
);

const HeaderActions = ({ onShare, onEdit, onChangePhoto }) => (
  <div className="flex flex-col justify-center" style={{ gap: '12px' }}>
    <Tooltip text="Generate a secure, read-only version of this home's profile.">
      <button onClick={onShare} className="flex items-center justify-center gap-2 w-full font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '12px 16px', fontSize: '15px' }}>
        <Share2 className="w-4 h-4" /> Share Home Profile
      </button>
    </Tooltip>
    <Tooltip text="Update the home's core information and attributes.">
      <button onClick={onEdit} className="flex items-center justify-center gap-2 w-full font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '12px 16px', fontSize: '15px' }}>
        <Edit3 className="w-4 h-4" /> Edit Home Details
      </button>
    </Tooltip>
    <Tooltip text="Upload a new primary photo for this home.">
      <button onClick={onChangePhoto} className="font-medium text-slate-400 hover:text-slate-600 transition-colors w-full text-center" style={{ fontSize: '13px' }}>
        <Camera className="w-3.5 h-3.5 inline mr-1" /> Add / Change Photo
      </button>
    </Tooltip>
  </div>
);

const PageHeader = ({ home }) => (
  <div className="bg-white border-b border-slate-200">
    <div className="max-w-7xl mx-auto" style={{ padding: '32px 32px 0 32px' }}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* HomePhoto — 16:9, radius 16px */}
        <div className="lg:w-[70%] relative overflow-hidden" style={{ borderRadius: '16px', aspectRatio: '16/9' }}>
          <img src={home.photoUrl} alt={home.address} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.82) 0%, transparent 55%)' }} />
          <div className="absolute bottom-0 left-0" style={{ padding: '24px' }}>
            <AddressBlock address={home.address} cityStateZip={home.cityStateZip} />
          </div>
        </div>
        <div className="lg:w-[30%]">
          <HeaderActions onShare={() => {}} onEdit={() => {}} onChangePhoto={() => {}} />
        </div>
      </div>

      {/* KeyStatsStrip — 16px below photo, 32px below strip */}
      <KeyStatsStrip home={home} />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// KEY STATS STRIP
// ═══════════════════════════════════════════════════════════════════════

const StatItem = ({ label, value, tip, isLast }) => (
  <Tooltip text={tip}>
    <div className={`flex-1 min-w-0 text-center cursor-default flex-shrink-0 ${!isLast ? 'border-r border-slate-200' : ''}`} style={{ padding: '0 24px' }}>
      <p className="font-medium text-slate-900 whitespace-nowrap" style={{ fontSize: '15px' }}>{value}</p>
      <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{label}</p>
    </div>
  </Tooltip>
);

const KeyStatsStrip = ({ home }) => {
  const stats = [
    { label: 'Beds', value: `${home.beds} bd`, tip: 'Number of bedrooms recorded for this home.' },
    { label: 'Baths', value: `${home.baths} ba`, tip: 'Full and half bathrooms combined.' },
    { label: 'Size', value: `${home.sqft} Sq Ft`, tip: 'Total heated and cooled living space.' },
    { label: 'Lot', value: home.lotSize, tip: 'Total property size as recorded in public data.' },
    { label: 'Year Built', value: `Built ${home.yearBuilt}`, tip: 'Original construction year.' },
    { label: 'Home Type', value: home.homeType, tip: 'Classification based on public records.' },
    { label: 'Last Updated', value: home.lastUpdated, tip: 'Most recent sync of home data.' },
  ];
  return (
    <div className="flex items-center overflow-x-auto" style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 20px', marginTop: '16px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
      {stats.map((s, i) => <StatItem key={i} {...s} isLast={i === stats.length - 1} />)}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// LEFT COLUMN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const ChartTabs = ({ active, onChange }) => (
  <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
    {['1Y', '5Y', 'Since Purchase'].map(tab => (
      <button key={tab} onClick={() => onChange(tab)}
        className={`rounded-lg font-medium transition-all ${active === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        style={{ padding: '6px 12px', fontSize: '12px' }}>
        {tab}
      </button>
    ))}
  </div>
);

const ValueEquityCard = ({ value, equity }) => {
  const [chartTab, setChartTab] = useState('1Y');
  const chartData = chartTab === '1Y' ? value.trend1Y : chartTab === '5Y' ? value.trend5Y : value.trendAll;
  const gain = value.estimatedValue - value.purchasePrice;
  const gainPct = ((gain / value.purchasePrice) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader title="Home Value & Equity" />

      {/* ValueBlock + EquityBlock */}
      <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div>
          <Tooltip text="Automated valuation based on market data and comparable homes.">
            <p className="text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 cursor-default" style={{ fontSize: '12px', marginBottom: '8px' }}>
              Estimated Value <Info className="w-3 h-3" />
            </p>
          </Tooltip>
          <p className="font-semibold text-slate-900" style={{ fontSize: '30px', lineHeight: '1.2' }}>${value.estimatedValue.toLocaleString()}</p>
          <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>
            Automated valuation · Confidence: <span className="text-green-600 font-medium">{value.confidence}</span>
          </p>
          <p className="text-green-600 font-medium flex items-center gap-1" style={{ fontSize: '13px', marginTop: '4px' }}>
            <TrendingUp className="w-3 h-3" /> +${gain.toLocaleString()} ({gainPct}%) since purchase
          </p>
        </div>
        <div>
          <Tooltip text="Estimated value minus current mortgage balance.">
            <p className="text-slate-400 font-medium uppercase tracking-wide flex items-center gap-1 cursor-default" style={{ fontSize: '12px', marginBottom: '8px' }}>
              Owner Equity <Info className="w-3 h-3" />
            </p>
          </Tooltip>
          <p className="font-semibold" style={{ fontSize: '30px', lineHeight: '1.2', color: '#1e3a5f' }}>${equity.equity.toLocaleString()}</p>
          <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>
            Mortgage balance: ${equity.mortgageBalance.toLocaleString()} at {equity.interestRate}%
          </p>
        </div>
      </div>

      {/* ValueTrendChart */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px' }}>Value Trend</p>
          <ChartTabs active={chartTab} onChange={setChartTab} />
        </div>
        <ValueTrendChart data={chartData} />
      </div>

      {/* MortgageDetailsInline */}
      <div className="border-t border-slate-100" style={{ paddingTop: '16px' }}>
        <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '12px' }}>
          {[
            { label: 'Lender', value: equity.lender },
            { label: 'Monthly Payment', value: `$${equity.monthlyPayment.toLocaleString()}` },
            { label: 'Loan Type', value: equity.loanType },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{item.value}</p>
            </div>
          ))}
        </div>
        <TextLink>View full mortgage details</TextLink>
      </div>
    </Card>
  );
};

const AlertItem = ({ alert }) => {
  const Icon = alert.icon;
  const colors = {
    High: { bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', iconColor: '#ef4444', btnBg: '#ef4444' },
    Medium: { bg: '#fffbeb', border: '#fde68a', iconBg: '#fef3c7', iconColor: '#f59e0b', btnBg: '#f59e0b' },
    Low: { bg: '#eff6ff', border: '#bfdbfe', iconBg: '#dbeafe', iconColor: '#3b82f6', btnBg: '#3b82f6' },
  }[alert.severity];
  return (
    <div className="flex items-start gap-4" style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '10px', background: colors.iconBg, marginTop: '2px' }}>
        <Icon style={{ width: '16px', height: '16px', color: colors.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ marginBottom: '8px' }}><Pill label={alert.severity} /></div>
        <p className="font-semibold text-slate-800" style={{ fontSize: '15px' }}>{alert.title}</p>
        <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '4px' }}>{alert.sub}</p>
        <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px' }}>Due: {alert.due}</p>
      </div>
      <Link to={alert.module} className="flex-shrink-0 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: colors.btnBg, padding: '8px 12px', fontSize: '12px' }}>
        {alert.action}
      </Link>
    </div>
  );
};

const SeverityFilter = ({ active, onChange }) => (
  <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
    {['All', 'High', 'Medium', 'Low'].map(f => (
      <button key={f} onClick={() => onChange(f)}
        className={`rounded-lg font-medium transition-all ${active === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        style={{ padding: '6px 10px', fontSize: '12px' }}>
        {f}
      </button>
    ))}
  </div>
);

const AlertsCard = ({ alerts }) => {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter);
  return (
    <Card>
      <CardHeader
        title={<span className="flex items-center gap-2"><Activity className="w-4 h-4" style={{ color: '#e8604c' }} /> Alerts & Risks</span>}
        right={<SeverityFilter active={filter} onChange={setFilter} />}
      />
      {filtered.length === 0 ? (
        <EmptyState icon={CheckCircle2} message="No active alerts. This home is fully up to date." sub="New alerts will appear here as the system monitors your home." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((alert, i) => <AlertItem key={i} alert={alert} />)}
        </div>
      )}
      <div style={{ marginTop: '16px' }}>
        <TextLink>View all alerts & history</TextLink>
      </div>
    </Card>
  );
};

const ActivityItem = ({ item }) => {
  const Icon = item.icon;
  return (
    <div className="flex items-start group hover:bg-slate-50 rounded-xl transition-colors" style={{ gap: '12px', padding: '8px' }}>
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
          View maintenance record
        </button>
      </div>
    </div>
  );
};

const ActivityFeedCard = ({ activity }) => (
  <Card>
    <CardHeader title="Recent Activity" />
    {activity.length === 0 ? (
      <EmptyState message="No recent activity." sub="Updates will appear here as you add maintenance, documents, or expenses." />
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activity.map((item, i) => <ActivityItem key={i} item={item} />)}
      </div>
    )}
    <div style={{ marginTop: '16px' }}>
      <TextLink to="/timeline">View full home timeline</TextLink>
    </div>
  </Card>
);

const ModuleCard = ({ module }) => {
  const Icon = module.icon;
  return (
    <div className="border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group" style={{ borderRadius: '12px', padding: '16px' }}>
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '4px' }}>
        <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ width: '36px', height: '36px', borderRadius: '10px', background: module.bg }}>
          <Icon style={{ width: '16px', height: '16px', color: module.color }} />
        </div>
        <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{module.title}</p>
      </div>
      <p className="text-slate-400" style={{ fontSize: '12px', marginBottom: '16px', lineHeight: '1.4', marginLeft: '48px' }}>{module.desc}</p>
      <div className="flex gap-2">
        <Link to={module.link} className="flex-1 text-center font-semibold text-white rounded-lg hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '6px 12px', fontSize: '12px' }}>
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
};

const ModulesGrid = ({ modules }) => (
  <Card>
    <CardHeader title="Home Modules" />
    <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: '12px' }}>
      {modules.map((mod, i) => <ModuleCard key={i} module={mod} />)}
    </div>
  </Card>
);

// ═══════════════════════════════════════════════════════════════════════
// RIGHT COLUMN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const SystemTile = ({ system }) => {
  const Icon = system.icon;
  return (
    <div className="flex items-start" style={{ gap: '12px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: system.bg }}>
        <Icon style={{ width: '14px', height: '14px', color: system.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{system.name}</p>
          <Pill label={system.condition} />
        </div>
        <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>
          Age: {system.age} yrs · Expected: {system.lifespan} yrs · Est. {system.cost}
        </p>
        <HealthBar age={system.age} lifespan={system.lifespan} />
        <button className="font-medium hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '12px', marginTop: '4px' }}>
          View details
        </button>
      </div>
    </div>
  );
};

const SystemsHealthCard = ({ systems }) => (
  <Card>
    <CardHeader title="Systems & Structure Health" />
    <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '16px', marginTop: '-12px' }}>Digital snapshot of major components</p>
    {systems.length === 0 ? (
      <EmptyState message="No system data added yet." sub="Add system ages and details to generate a full health report." />
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {systems.map((sys, i) => <SystemTile key={i} system={sys} />)}
      </div>
    )}
    <div className="flex items-center justify-between border-t border-slate-100" style={{ paddingTop: '16px', marginTop: '24px' }}>
      <button className="font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl" style={{ padding: '8px 14px', fontSize: '12px' }}>
        Update system details
      </button>
      <TextLink>View full system report</TextLink>
    </div>
  </Card>
);

const ReadyToSellCard = ({ onPrepare, onPreview }) => (
  <div className="relative overflow-hidden" style={{ background: '#1e3a5f', borderRadius: '12px', padding: '20px' }}>
    <div className="absolute top-0 right-0 rounded-full opacity-5" style={{ width: '120px', height: '120px', background: '#c9a96e', transform: 'translate(30%, -30%)' }} />
    <div className="relative z-10">
      <p className="text-blue-200 font-medium uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '8px' }}>Thinking About Selling?</p>
      <h3 className="text-white font-semibold leading-snug" style={{ fontSize: '18px', marginBottom: '8px' }}>
        Turn this profile into a Compass-ready seller packet in seconds.
      </h3>
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
      <button onClick={onPreview} className="w-full text-center text-blue-300 hover:text-white transition-colors" style={{ fontSize: '13px' }}>
        Preview sample seller report →
      </button>
    </div>
  </div>
);

const AnnualCostWidget = ({ annualCost }) => (
  <Tooltip text="Total of taxes, insurance, utilities, and maintenance.">
    <Link to="/expenses" className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block" style={{ borderRadius: '12px', padding: '16px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5' }}>
        <DollarSign style={{ width: '20px', height: '20px', color: '#059669' }} />
      </div>
      <div className="flex-1">
        <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '4px' }}>Total Annual Home Spend</p>
        <p className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: '1.2' }}>{annualCost}</p>
        <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>Taxes · Insurance · Utilities · Maintenance</p>
      </div>
      <ArrowRight style={{ width: '16px', height: '16px', color: '#cbd5e1', flexShrink: 0, marginTop: '4px' }} />
    </Link>
  </Tooltip>
);

const RiskWidget = ({ riskCounts }) => (
  <Tooltip text="Summary of high, medium, and low-priority alerts.">
    <Link to="/maintenance-management" className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block" style={{ borderRadius: '12px', padding: '16px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2' }}>
        <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
      </div>
      <div className="flex-1">
        <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '4px' }}>Risk Overview</p>
        <p className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: '1.2' }}>{riskCounts.high} High</p>
        <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>{riskCounts.medium} medium · {riskCounts.low} low priority items</p>
      </div>
      <ArrowRight style={{ width: '16px', height: '16px', color: '#cbd5e1', flexShrink: 0, marginTop: '4px' }} />
    </Link>
  </Tooltip>
);

const UpcomingWidget = ({ upcomingItems }) => (
  <Tooltip text="Bills, services, and deadlines in the next 30 days.">
    <Link to="/bill-pay" className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 block" style={{ borderRadius: '12px', padding: '16px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff' }}>
        <Clock style={{ width: '20px', height: '20px', color: '#2563eb' }} />
      </div>
      <div className="flex-1">
        <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '12px', marginBottom: '4px' }}>Upcoming Items</p>
        <p className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: '1.2' }}>{upcomingItems.length} Items</p>
        {upcomingItems.map((item, i) => (
          <p key={i} className={item.urgent ? 'font-semibold text-red-500' : 'text-slate-400'} style={{ fontSize: '12px', marginTop: '4px' }}>{item.text}</p>
        ))}
      </div>
      <ArrowRight style={{ width: '16px', height: '16px', color: '#cbd5e1', flexShrink: 0, marginTop: '4px' }} />
    </Link>
  </Tooltip>
);

const SnapshotWidgets = ({ snapshots }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <AnnualCostWidget annualCost={snapshots.annualCost} />
    <RiskWidget riskCounts={snapshots.riskCounts} />
    <UpcomingWidget upcomingItems={snapshots.upcomingItems} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// TWO COLUMN LAYOUT
// ═══════════════════════════════════════════════════════════════════════

const LeftColumn = ({ data }) => (
  <div className="lg:w-[60%]" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <ValueEquityCard value={data.value} equity={data.equity} />
    <AlertsCard alerts={data.alerts} />
    <ActivityFeedCard activity={data.activity} />
    <ModulesGrid modules={data.modules} />
  </div>
);

const RightColumn = ({ data }) => (
  <div className="lg:w-[40%]" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <SystemsHealthCard systems={data.systems} />
    <ReadyToSellCard onPrepare={() => {}} onPreview={() => {}} />
    <SnapshotWidgets snapshots={data.snapshots} />
  </div>
);

const TwoColumnLayout = ({ data }) => (
  <div className="flex flex-col lg:flex-row" style={{ gap: '32px' }}>
    <LeftColumn data={data} />
    <RightColumn data={data} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// PAGE FOOTER
// ═══════════════════════════════════════════════════════════════════════

const PageFooter = () => (
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
);

// ═══════════════════════════════════════════════════════════════════════
// TOP NAV
// ═══════════════════════════════════════════════════════════════════════

const TopNav = ({ home }) => (
  <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm" style={{ padding: '12px 32px' }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
          Casa<span style={{ color: '#c9a96e' }}>CEO</span>
        </span>
      </Link>

      <Tooltip text="Choose a home to view its full profile and activity.">
        <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all" style={{ padding: '8px 16px' }}>
          <MapPinIcon />
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-slate-900 leading-none" style={{ fontSize: '14px' }}>{home.address}</p>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>{home.cityStateZip}</p>
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
);

// ═══════════════════════════════════════════════════════════════════════
// HOME PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeProfilePage = () => {
  const data = HOME_DATA;

  return (
    <>
      <Helmet><title>Home Profile — CasaCEO</title></Helmet>
      <div className="min-h-screen bg-slate-50">
        <TopNav home={data.home} />
        <PageHeader home={data.home} />
        <main className="max-w-7xl mx-auto" style={{ padding: '32px' }}>
          <TwoColumnLayout data={data} />
          <PageFooter />
        </main>
      </div>
    </>
  );
};

export default HomeProfilePage;
