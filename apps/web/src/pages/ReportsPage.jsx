import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, FileText, TrendingUp, DollarSign, ShieldCheck,
  Wrench, Clock, BarChart2, Download, Share2, Eye,
  CheckCircle2, Star, ArrowRight, X, Calendar,
  Zap, Building2, Receipt, BookOpen, AlertTriangle,
  PieChart, LineChart, ClipboardList, Search
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  {
    name: 'Home Summary', icon: Home, color: '#1e3a5f', bg: '#eef2f8',
    sub: 'Profile, value & equity',
    reports: ['Home Profile Summary', 'Home Value Report', 'Equity & Financing Summary'],
  },
  {
    name: 'Maintenance', icon: Wrench, color: '#f97316', bg: '#fff7ed',
    sub: 'History & schedules',
    reports: ['Maintenance History', 'Upcoming Maintenance Schedule', 'Systems & Structure Health Report'],
  },
  {
    name: 'Financial', icon: DollarSign, color: '#059669', bg: '#ecfdf5',
    sub: 'Expenses & taxes',
    reports: ['Annual Home Expenses', 'Utility Cost Summary', 'Property Tax Summary'],
  },
  {
    name: 'Documents', icon: FileText, color: '#7c3aed', bg: '#f5f3ff',
    sub: 'Warranties & insurance',
    reports: ['Warranty Summary', 'Insurance Summary', 'Document Checklist'],
  },
  {
    name: 'Selling & Market', icon: TrendingUp, color: '#e8604c', bg: '#fdf1ef',
    sub: 'Pre-listing & comps',
    reports: ['Pre-Listing Packet', 'Market Readiness Report', 'Comparable Sales Summary'],
  },
];

const ALL_REPORTS = [
  // Home Summary
  {
    id: 1, category: 'Home Summary', title: 'Home Profile Summary',
    sub: 'Key stats, value, equity, systems overview, alerts, and recent activity.',
    icon: Home, color: '#1e3a5f', bg: '#eef2f8',
    recommended: true, recommendReason: 'Last generated 30+ days ago',
    includes: ['Key stats', 'Current value', 'Owner equity', 'Systems overview', 'Active alerts', 'Recent activity'],
  },
  {
    id: 2, category: 'Home Summary', title: 'Home Value Report',
    sub: 'Current valuation, confidence level, trend charts, comparable sales, and equity analysis.',
    icon: TrendingUp, color: '#1e3a5f', bg: '#eef2f8',
    recommended: true, recommendReason: 'New valuation data available',
    includes: ['Current valuation', 'Confidence indicator', 'Value trend charts', 'Comparable sales', 'Equity analysis'],
  },
  {
    id: 3, category: 'Home Summary', title: 'Equity & Financing Summary',
    sub: 'Mortgage details, amortization schedule, equity timeline, and refinance opportunities.',
    icon: PieChart, color: '#1e3a5f', bg: '#eef2f8',
    recommended: false, recommendReason: null,
    includes: ['Mortgage details', 'Amortization schedule', 'Equity timeline', 'Refinance opportunities'],
  },
  // Maintenance
  {
    id: 4, category: 'Maintenance', title: 'Maintenance History',
    sub: 'All completed tasks with costs, vendors, dates, and documentation.',
    icon: Wrench, color: '#f97316', bg: '#fff7ed',
    recommended: false, recommendReason: null,
    includes: ['Completed tasks', 'Costs', 'Vendor details', 'Dates', 'Photos & receipts'],
  },
  {
    id: 5, category: 'Maintenance', title: 'Upcoming Maintenance Schedule',
    sub: 'Seasonal tasks, system-based recommendations, and active alerts.',
    icon: Clock, color: '#f97316', bg: '#fff7ed',
    recommended: true, recommendReason: '3 overdue items detected',
    includes: ['Seasonal tasks', 'System-based tasks', 'Active alerts', 'Vendor suggestions'],
  },
  {
    id: 6, category: 'Maintenance', title: 'Systems & Structure Health Report',
    sub: 'Age, expected lifespan, condition ratings, and replacement cost estimates for all systems.',
    icon: BarChart2, color: '#f97316', bg: '#fff7ed',
    recommended: true, recommendReason: 'Water heater past expected lifespan',
    includes: ['System ages', 'Expected lifespan', 'Condition ratings', 'Replacement estimates', 'Priority ranking'],
  },
  // Financial
  {
    id: 7, category: 'Financial', title: 'Annual Home Expenses',
    sub: 'Bills, utilities, maintenance, and repairs organized by category with totals.',
    icon: DollarSign, color: '#059669', bg: '#ecfdf5',
    recommended: false, recommendReason: null,
    includes: ['Bills', 'Utilities', 'Maintenance costs', 'Repair costs', 'Category totals', 'Year-over-year'],
  },
  {
    id: 8, category: 'Financial', title: 'Utility Cost Summary',
    sub: 'Electricity, water, and gas usage with cost trends and efficiency insights.',
    icon: Zap, color: '#059669', bg: '#ecfdf5',
    recommended: true, recommendReason: 'Electricity 18% above seasonal average',
    includes: ['Electricity usage', 'Water usage', 'Gas usage', 'Cost trends', 'Efficiency insights'],
  },
  {
    id: 9, category: 'Financial', title: 'Property Tax Summary',
    sub: 'Assessments, payments, due dates, and historical changes for tax records.',
    icon: Receipt, color: '#059669', bg: '#ecfdf5',
    recommended: true, recommendReason: 'Property tax due in 30 days',
    includes: ['Current assessment', 'Payment history', 'Due dates', 'Exemptions', 'Historical changes'],
  },
  // Documents
  {
    id: 10, category: 'Documents', title: 'Warranty Summary',
    sub: 'All appliance and system warranties with expiration dates and coverage details.',
    icon: ShieldCheck, color: '#7c3aed', bg: '#f5f3ff',
    recommended: true, recommendReason: 'Appliance warranty expiring in 60 days',
    includes: ['Appliance warranties', 'System warranties', 'Expiration dates', 'Coverage details', 'Vendor contacts'],
  },
  {
    id: 11, category: 'Documents', title: 'Insurance Summary',
    sub: 'Policy details, renewal dates, and coverage overview for all home insurance.',
    icon: ShieldCheck, color: '#7c3aed', bg: '#f5f3ff',
    recommended: true, recommendReason: 'Insurance renewal in 45 days',
    includes: ['Policy details', 'Coverage amounts', 'Renewal dates', 'Exclusions', 'Claims history'],
  },
  {
    id: 12, category: 'Documents', title: 'Document Checklist',
    sub: 'Required documents, missing items, and upload prompts for a complete home record.',
    icon: ClipboardList, color: '#7c3aed', bg: '#f5f3ff',
    recommended: false, recommendReason: null,
    includes: ['Required documents', 'Missing documents', 'Upload prompts', 'Completion score'],
  },
  // Selling & Market
  {
    id: 13, category: 'Selling & Market', title: 'Pre-Listing Packet',
    sub: 'Complete seller-ready package with home summary, maintenance history, systems, and valuation.',
    icon: Star, color: '#e8604c', bg: '#fdf1ef',
    recommended: true, recommendReason: 'Roof alert — resolve before listing',
    includes: ['Home summary', 'Systems health', 'Maintenance history', 'Recommended updates', 'Vendor suggestions', 'Valuation', 'Market trends'],
    featured: true,
  },
  {
    id: 14, category: 'Selling & Market', title: 'Market Readiness Report',
    sub: 'Readiness score, recommended improvements, and estimated cost to list.',
    icon: TrendingUp, color: '#e8604c', bg: '#fdf1ef',
    recommended: false, recommendReason: null,
    includes: ['Readiness score', 'Recommended improvements', 'Cost estimates', 'Priority ranking'],
  },
  {
    id: 15, category: 'Selling & Market', title: 'Comparable Sales Summary',
    sub: 'Nearby comparable sales with price per sq ft, sale dates, and market trends.',
    icon: BarChart2, color: '#e8604c', bg: '#fdf1ef',
    recommended: false, recommendReason: null,
    includes: ['Nearby comps', 'Price per sq ft', 'Sale dates', 'Market trends', 'Value positioning'],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// GENERATE REPORT MODAL
// ═══════════════════════════════════════════════════════════════════════

const GenerateReportModal = ({ report, onClose }) => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('Last 12 months');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeVendors, setIncludeVendors] = useState(true);
  const Icon = report.icon;

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md overflow-hidden" style={{ borderRadius: '16px' }}>

        {/* Header */}
        <div className="relative flex items-center gap-3" style={{ background: '#1e3a5f', padding: '24px' }}>
          <button onClick={onClose} className="absolute top-4 right-4 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)' }}>
            <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <p className="text-blue-200 font-medium" style={{ fontSize: '12px', marginBottom: '2px' }}>Generate Report</p>
            <h2 className="text-white font-semibold" style={{ fontSize: '18px' }}>{report.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {!generated ? (
            <>
              <p className="text-slate-500" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>{report.sub}</p>

              {/* Includes */}
              <div style={{ marginBottom: '20px' }}>
                <p className="font-semibold text-slate-900" style={{ fontSize: '13px', marginBottom: '10px' }}>This report includes:</p>
                <div className="grid grid-cols-2" style={{ gap: '6px' }}>
                  {report.includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 style={{ width: '13px', height: '13px', color: '#059669', flexShrink: 0 }} />
                      <p className="text-slate-600" style={{ fontSize: '13px' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="bg-slate-50 rounded-xl" style={{ padding: '16px', marginBottom: '20px' }}>
                <p className="font-semibold text-slate-900" style={{ fontSize: '13px', marginBottom: '12px' }}>Report Options</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600" style={{ fontSize: '13px' }}>Date Range</p>
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      {['Last 12 months', 'Last 24 months', 'All time', 'Custom'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600" style={{ fontSize: '13px' }}>Include Photos</p>
                    <button onClick={() => setIncludePhotos(!includePhotos)} className="flex items-center justify-center rounded-full transition-all" style={{ width: '40px', height: '22px', background: includePhotos ? '#1e3a5f' : '#e2e8f0' }}>
                      <div className="rounded-full bg-white transition-all" style={{ width: '16px', height: '16px', transform: includePhotos ? 'translateX(8px)' : 'translateX(-8px)' }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600" style={{ fontSize: '13px' }}>Include Vendor History</p>
                    <button onClick={() => setIncludeVendors(!includeVendors)} className="flex items-center justify-center rounded-full transition-all" style={{ width: '40px', height: '22px', background: includeVendors ? '#1e3a5f' : '#e2e8f0' }}>
                      <div className="rounded-full bg-white transition-all" style={{ width: '16px', height: '16px', transform: includeVendors ? 'translateX(8px)' : 'translateX(-8px)' }} />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={handleGenerate} disabled={loading} className="w-full font-semibold text-white hover:opacity-90 transition-all rounded-xl disabled:opacity-70" style={{ background: '#1e3a5f', padding: '14px', fontSize: '15px' }}>
                {loading ? 'Generating…' : 'Generate Report'}
              </button>
            </>
          ) : (
            <div className="text-center" style={{ padding: '16px 0' }}>
              <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ecfdf5', marginBottom: '16px' }}>
                <CheckCircle2 style={{ width: '32px', height: '32px', color: '#059669' }} />
              </div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>Your report is ready.</p>
              <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px' }}>{report.title} has been generated successfully.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="w-full flex items-center justify-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '14px', fontSize: '15px' }}>
                  <Download style={{ width: '16px', height: '16px' }} /> Download PDF
                </button>
                <button className="w-full flex items-center justify-center gap-2 font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '12px', fontSize: '14px' }}>
                  <Share2 style={{ width: '15px', height: '15px' }} /> Share Report
                </button>
                <button className="w-full flex items-center justify-center gap-2 font-semibold text-slate-500 hover:text-slate-700 transition-colors" style={{ padding: '10px', fontSize: '14px' }}>
                  <Eye style={{ width: '15px', height: '15px' }} /> View Online
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// REPORT CARD
// ═══════════════════════════════════════════════════════════════════════

const ReportCard = ({ report, onGenerate }) => {
  const Icon = report.icon;
  return (
    <div className="bg-white hover:shadow-md transition-all relative overflow-hidden" style={{ borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
      {report.featured && (
        <span className="absolute top-3 right-3 font-bold text-white rounded-full" style={{ background: '#e8604c', padding: '2px 8px', fontSize: '11px' }}>Featured</span>
      )}
      {report.recommended && (
        <div className="flex items-center gap-1.5 rounded-lg" style={{ background: '#fffbeb', padding: '6px 10px', marginBottom: '12px' }}>
          <AlertTriangle style={{ width: '12px', height: '12px', color: '#f59e0b', flexShrink: 0 }} />
          <p className="text-amber-700 font-medium" style={{ fontSize: '11px' }}>{report.recommendReason}</p>
        </div>
      )}
      <div className="flex items-start gap-3" style={{ marginBottom: '12px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: report.bg }}>
          <Icon style={{ width: '18px', height: '18px', color: report.color }} />
        </div>
        <div>
          <p className="font-semibold text-slate-900" style={{ fontSize: '15px', lineHeight: '1.3' }}>{report.title}</p>
          <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{report.category}</p>
        </div>
      </div>
      <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{report.sub}</p>
      <div className="flex gap-2">
        <button onClick={() => onGenerate(report)} className="flex-1 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '9px', fontSize: '13px' }}>
          Generate Report
        </button>
        <button className="font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '9px 14px', fontSize: '13px' }}>
          Preview
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// REPORT ROW
// ═══════════════════════════════════════════════════════════════════════

const ReportRow = ({ report, onGenerate }) => {
  const Icon = report.icon;
  return (
    <div className="bg-white flex items-center gap-4 hover:shadow-sm transition-all" style={{ borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: report.bg }}>
        <Icon style={{ width: '18px', height: '18px', color: report.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{report.title}</p>
        <p className="text-slate-400 truncate" style={{ fontSize: '12px', marginTop: '3px' }}>{report.sub}</p>
      </div>
      {report.recommended && (
        <span className="font-medium text-amber-700 bg-amber-100 rounded-full flex-shrink-0 hidden sm:block" style={{ padding: '3px 8px', fontSize: '11px' }}>Recommended</span>
      )}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onGenerate(report)} className="font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '8px 16px', fontSize: '13px' }}>
          Generate
        </button>
        <button className="font-semibold text-slate-500 hover:text-slate-700 transition-colors" style={{ fontSize: '13px' }}>Preview</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY CARD
// ═══════════════════════════════════════════════════════════════════════

const CategoryCard = ({ category, isActive, onClick }) => {
  const Icon = category.icon;
  return (
    <button onClick={onClick} className="text-left hover:shadow-md transition-all" style={{
      background: isActive ? category.color : 'white',
      borderRadius: '12px', padding: '16px',
      border: `1px solid ${isActive ? category.color : '#e2e8f0'}`,
    }}>
      <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: isActive ? 'rgba(255,255,255,0.2)' : category.bg, marginBottom: '10px' }}>
        <Icon style={{ width: '18px', height: '18px', color: isActive ? 'white' : category.color }} />
      </div>
      <p className="font-semibold" style={{ fontSize: '14px', color: isActive ? 'white' : '#0f172a', marginBottom: '2px' }}>{category.name}</p>
      <p style={{ fontSize: '12px', color: isActive ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>{category.sub}</p>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const ReportsPage = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState('');

  const recommended = ALL_REPORTS.filter(r => r.recommended);
  const filtered = ALL_REPORTS.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <Helmet><title>Reports — CasaCEO</title></Helmet>
      <div className="min-h-screen bg-slate-50">

        {/* ── Nav ── */}
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
            <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Dashboard</Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto" style={{ padding: '32px' }}>

          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2', marginBottom: '8px' }}>Reports</h1>
            <p className="text-slate-500" style={{ fontSize: '15px', marginBottom: '16px' }}>Generate detailed, export-ready reports for your home.</p>
            <div className="relative max-w-xl">
              <Search style={{ width: '18px', height: '18px', color: '#94a3b8', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reports…"
                className="w-full bg-white border border-slate-200 rounded-2xl focus:outline-none text-slate-900"
                style={{ padding: '12px 14px 12px 44px', fontSize: '15px' }}
              />
            </div>
          </div>

          {/* Category Grid */}
          {!search && (
            <div style={{ marginBottom: '40px' }}>
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '16px' }}>Report Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: '12px' }}>
                {CATEGORIES.map((cat, i) => (
                  <CategoryCard key={i} category={cat} isActive={activeCategory === cat.name} onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)} />
                ))}
              </div>
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)} className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-700 transition-colors" style={{ fontSize: '13px', marginTop: '12px' }}>
                  <X style={{ width: '13px', height: '13px' }} /> Clear filter
                </button>
              )}
            </div>
          )}

          {/* Recommended Reports */}
          {!search && !activeCategory && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '4px' }}>Recommended for Your Home</h2>
                <p className="text-slate-500" style={{ fontSize: '14px' }}>Based on your home's age, systems, and recent activity.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
                {recommended.map(r => <ReportCard key={r.id} report={r} onGenerate={setSelectedReport} />)}
              </div>
            </div>
          )}

          {/* All Reports */}
          <div>
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '16px' }}>
              {search || activeCategory ? `Results (${filtered.length})` : 'All Reports'}
            </h2>
            {filtered.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', padding: '48px 20px', border: '1px solid #e2e8f0' }}>
                <FileText className="w-10 h-10 text-slate-300 mx-auto" style={{ marginBottom: '16px' }} />
                <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No reports match your search.</p>
                <p className="text-slate-400" style={{ fontSize: '14px' }}>Try a different search term or browse by category.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(r => <ReportRow key={r.id} report={r} onGenerate={setSelectedReport} />)}
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl gap-4" style={{ background: '#1e3a5f', padding: '20px 24px', marginTop: '40px' }}>
            <div>
              <p className="font-semibold text-white" style={{ fontSize: '15px' }}>Ready to prepare your home for market?</p>
              <p className="text-blue-200" style={{ fontSize: '13px', marginTop: '4px' }}>Generate a Pre-Listing Packet — your agent-ready seller document in one tap.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => setSelectedReport(ALL_REPORTS.find(r => r.title === 'Pre-Listing Packet'))} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#e8604c', padding: '10px 18px', fontSize: '13px' }}>
                <FileText style={{ width: '14px', height: '14px' }} /> Generate Pre-Listing Packet
              </button>
              <Link to="/ready-to-sell" className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1A1A1A', padding: '10px 18px', fontSize: '13px' }}>
                <Star style={{ width: '14px', height: '14px' }} /> Ready to Sell
              </Link>
            </div>
          </div>

        </main>
      </div>

      {selectedReport && <GenerateReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </>
  );
};

export default ReportsPage;
