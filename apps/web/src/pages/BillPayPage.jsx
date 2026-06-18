import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useHome } from '@/contexts/HomeContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import {
  Plus, CreditCard, LayoutGrid, Search, BookOpen,
  AlertCircle, CheckCircle2, Clock, DollarSign, Zap,
  Bell, ChevronRight, Download, BarChart2,
  Droplets, Wifi, Car, Shield, TrendingDown, Repeat
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

import AddServiceCompanyForm from '@/components/AddServiceCompanyForm.jsx';
import ServiceCompanyCard from '@/components/ServiceCompanyCard.jsx';
import PaymentHistoryTab from '@/components/PaymentHistoryTab.jsx';
import UtilityCompanyListing from '@/components/UtilityCompanyListing.jsx';
import PendingReviewSection from '@/components/PendingReviewSection.jsx';
import AddBillButton from '@/components/AddBillButton.jsx';

// Time-frame options for how far back the paid/history section reaches.
const TIMEFRAMES = [
  { label: '45 days', days: 45 },
  { label: '90 days', days: 90 },
  { label: '180 days', days: 180 },
  { label: 'All', days: null },
];

// ═══════════════════════════════════════════════════════════════════════
// CONDENSED SUMMARY STRIP
// Slim, single row: Total Due, Overdue, Providers, Quick Pay Ready.
// ═══════════════════════════════════════════════════════════════════════

const SummaryStrip = ({ companies }) => {
  const today = new Date();
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const totalDue = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const overdue = companies.filter(c => c.dueDate && new Date(c.dueDate) < today).length;
  const providers = companies.length;
  const dueThisWeek = companies.filter(c => {
    if (!c.dueDate) return false;
    const d = new Date(c.dueDate);
    return d >= today && d <= in7;
  }).length;

  const stats = [
    { label: 'Total Due', value: `$${totalDue.toFixed(0)}`, color: '#1e3a5f' },
    { label: 'Overdue', value: overdue, color: overdue > 0 ? '#dc2626' : '#059669' },
    { label: 'Due This Week', value: dueThisWeek, color: dueThisWeek > 0 ? '#f59e0b' : '#059669' },
    { label: 'Providers', value: providers, color: '#5b6472' },
  ];

  return (
    <div className="bg-white grid grid-cols-2 sm:grid-cols-4" style={{ borderRadius: '12px', border: '1px solid #e9e4db', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: '14px 18px', borderRight: i < 3 ? '1px solid #f1f5f9' : 'none', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }} className="sm:border-b-0">
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '10px', marginBottom: '2px' }}>{s.label}</p>
          <p className="font-extrabold" style={{ fontSize: '20px', lineHeight: 1, color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// UPCOMING DRAFTS / DUE STRIP
// Cashflow heads-up: everything leaving the accounts in the next 30 days,
// with a running total. Autopay items are flagged because they pull whether
// or not the account is ready — the user needs to ensure funds are available.
// ═══════════════════════════════════════════════════════════════════════

const UpcomingStrip = ({ companies }) => {
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isAuto = (c) => c.paymentType === 'Autopay (card)' || c.paymentType === 'Autopay (bank)';

  const upcoming = companies
    .filter(c => c.dueDate && new Date(c.dueDate) >= today && new Date(c.dueDate) <= in30)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (upcoming.length === 0) return null;

  const total = upcoming.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const autoTotal = upcoming.filter(isAuto).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #ddd6fe', padding: '16px 18px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <TrendingDown style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
          <h3 className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>Leaving your accounts — next 30 days</h3>
        </div>
        <div className="text-right">
          <span className="font-extrabold text-slate-900" style={{ fontSize: '18px' }}>${total.toFixed(2)}</span>
          {autoTotal > 0 && (
            <span className="text-slate-400" style={{ fontSize: '12px', marginLeft: '6px' }}>
              (${autoTotal.toFixed(2)} autopay)
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {upcoming.map(c => {
          const auto = isAuto(c);
          const d = new Date(c.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div key={c.id} className="flex items-center justify-between" style={{ fontSize: '13px', padding: '3px 0' }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium flex items-center gap-1 flex-shrink-0" style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  borderRadius: '5px',
                  padding: '1px 6px',
                  color: auto ? '#7c3aed' : '#475569',
                  background: auto ? '#f5f3ff' : '#f1f5f9',
                  minWidth: '54px',
                  justifyContent: 'center',
                }}>
                  {auto ? <><Repeat style={{ width: '10px', height: '10px' }} /> Auto</> : 'Manual'}
                </span>
                <span className="text-slate-700 truncate">{c.companyName}</span>
                <span className="text-slate-400 flex-shrink-0">{auto ? `drafts ~${d}` : `due ${d}`}</span>
              </div>
              <span className="font-semibold text-slate-900 flex-shrink-0">
                {typeof c.amount === 'number' ? `$${c.amount.toFixed(2)}` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// One compact line for overdue / due-soon, or an all-clear line.
// ═══════════════════════════════════════════════════════════════════════

const AttentionStrip = ({ companies }) => {
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const overdue = companies.filter(c => c.dueDate && new Date(c.dueDate) < today);
  const dueSoon = companies.filter(c => {
    if (!c.dueDate) return false;
    const d = new Date(c.dueDate);
    return d >= today && d <= in7Days;
  });

  if (overdue.length === 0 && dueSoon.length === 0) {
    return (
      <div className="flex items-center gap-2" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px' }}>
        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669' }} />
        <p className="font-medium text-green-800" style={{ fontSize: '13px' }}>All caught up — nothing due in the next 7 days.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px' }}>
      <div className="flex items-center gap-2">
        <Bell style={{ width: '16px', height: '16px', color: '#f97316' }} />
        <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>Needs attention:</p>
      </div>
      {overdue.length > 0 && (
        <span className="font-medium text-red-600" style={{ fontSize: '13px' }}>
          {overdue.length} overdue
        </span>
      )}
      {dueSoon.length > 0 && (
        <span className="font-medium text-amber-700" style={{ fontSize: '13px' }}>
          {dueSoon.length} due within 7 days
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// NEXT BILL DUE — slim line
// ═══════════════════════════════════════════════════════════════════════

const NextBillDue = ({ companies }) => {
  const today = new Date();
  const upcoming = companies
    .filter(c => c.dueDate && new Date(c.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const daysUntil = Math.ceil((new Date(next.dueDate) - today) / 86400000);

  return (
    <div className="flex items-center gap-3 bg-white" style={{ borderRadius: '10px', border: '1px solid #bfdbfe', padding: '10px 16px', marginBottom: '24px' }}>
      <Clock style={{ width: '16px', height: '16px', color: '#2563eb', flexShrink: 0 }} />
      <p className="text-slate-600" style={{ fontSize: '13px' }}>
        <span className="text-slate-400">Next due:</span>{' '}
        <span className="font-semibold text-slate-900">{next.companyName}</span>
        {' '}in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
        {next.amount && ` · $${parseFloat(next.amount).toFixed(2)}`}
      </p>
      {next.paymentLink && (
        <button className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-auto" style={{ fontSize: '13px' }}
          onClick={() => window.open(next.paymentLink, '_blank', 'noopener,noreferrer')}>
          Pay →
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ANALYSIS — Category Breakdown + Annual Spend (lives in its own tab)
// ═══════════════════════════════════════════════════════════════════════

const CategoryBreakdown = ({ companies }) => {
  const categories = [
    { name: 'Electric', icon: Zap, color: '#d97706', bg: '#fffbeb', keywords: ['electric', 'power', 'energy', 'utility'] },
    { name: 'Water', icon: Droplets, color: '#0891b2', bg: '#ecfeff', keywords: ['water', 'sewer', 'waste'] },
    { name: 'Internet', icon: Wifi, color: '#7c3aed', bg: '#f5f3ff', keywords: ['internet', 'cable', 'comcast', 'att', 'verizon', 'xfinity'] },
    { name: 'Insurance', icon: Shield, color: '#059669', bg: '#ecfdf5', keywords: ['insurance', 'allstate', 'state farm', 'geico', 'progressive'] },
    { name: 'Auto', icon: Car, color: '#2563eb', bg: '#eff6ff', keywords: ['auto', 'car', 'vehicle', 'loan'] },
    { name: 'Other', icon: CreditCard, color: '#64748b', bg: '#faf8f4', keywords: [] },
  ];

  const getCategoryTotal = (cat) => {
    return companies.filter(c => {
      const name = c.companyName?.toLowerCase() || '';
      if (cat.name === 'Other') {
        return !categories.slice(0, -1).some(other => other.keywords.some(k => name.includes(k)));
      }
      return cat.keywords.some(k => name.includes(k));
    }).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  };

  const total = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '16px' }}>Spending by Category</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const amount = getCategoryTotal(cat);
          if (amount === 0) return null;
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: cat.bg }}>
                <Icon style={{ width: '15px', height: '15px', color: cat.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                  <p className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{cat.name}</p>
                  <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>${amount.toFixed(0)} <span className="text-slate-400 font-normal">({pct}%)</span></p>
                </div>
                <div className="bg-slate-100 rounded-full" style={{ height: '6px' }}>
                  <div className="rounded-full transition-all" style={{ width: `${pct}%`, height: '6px', background: cat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnnualSpendSummary = ({ companies }) => {
  const monthly = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const annual = monthly * 12;

  return (
    <div className="flex flex-col gap-4">
      {[
        { label: 'Monthly Total', value: `$${monthly.toFixed(0)}`, sub: 'Current month estimate', color: '#1e3a5f' },
        { label: 'Annual Projection', value: `$${annual.toLocaleString()}`, sub: 'Based on current bills', color: '#059669' },
        { label: 'Avg per Bill', value: companies.length > 0 ? `$${(monthly / companies.length).toFixed(0)}` : '$0', sub: `Across ${companies.length} providers`, color: '#7c3aed' },
      ].map((s, i) => (
        <div key={i} className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '6px' }}>{s.label}</p>
          <p className="font-extrabold" style={{ fontSize: '26px', lineHeight: 1, color: s.color }}>{s.value}</p>
          <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY GROUP — used in All-Properties mode to batch a flat bill list
// under per-property headers with a subtotal, instead of one long list.
// Keeps the all-properties view legible (sectional > convenient).
// ═══════════════════════════════════════════════════════════════════════

const PropertyGroupedList = ({ companies, homeName, renderCard }) => {
  // Bucket bills by homeId; undated/unassigned go under a clear catch-all.
  const groups = {};
  for (const c of companies) {
    const key = c.homeId || '__unassigned__';
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }
  const keys = Object.keys(groups);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {keys.map(key => {
        const bills = groups[key];
        const subtotal = bills.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        const label = key === '__unassigned__'
          ? 'Unassigned'
          : (homeName(key) || 'Property');
        return (
          <div key={key}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <span className="font-semibold text-slate-700" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {label} <span className="text-slate-400 font-normal">({bills.length})</span>
              </span>
              <span className="font-bold text-slate-900" style={{ fontSize: '13px' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bills.map(renderCard)}
            </div>
          </div>
        );
      })}
    </div>
  );
};


const BillPayPage = () => {
  const { currentUser } = useAuth();
  const { selectedHome, homes, allProperties } = useHome();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [timeframeDays, setTimeframeDays] = useState(90); // default 90; null = All
  const utilityListingRef = useRef(null);

  // Quick lookup: homeId → home name, for property tags on rows.
  const homeName = (id) => {
    const h = (homes || []).find(x => x.id === id);
    return h ? (h.name || h.address || 'Property') : null;
  };

  const fetchCompanies = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const records = await pb.collection('service_companies').getFullList({
        batch: 500, filter: `ownerId="${currentUser.id}"`, sort: 'companyName', $autoCancel: false
      });
      const uniqueRecords = [];
      const seenNames = new Set();
      for (const record of records) {
        if (!seenNames.has(record.companyName)) { seenNames.add(record.companyName); uniqueRecords.push(record); }
      }
      setCompanies(uniqueRecords);
    } catch {
      toast({ title: 'Failed to load bills', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [currentUser]);

  const handleLogPayment = async (company) => {
    if (!currentUser) return;
    try {
      await pb.collection('payment_history').create({
        companyName: company.companyName, datePaid: new Date().toISOString(),
        amount: company.amount || null, accountUsed: selectedHome?.name || 'Default Account', ownerId: currentUser.id
      }, { $autoCancel: false });
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch {
      // non-fatal: bill is still marked paid even if history logging fails
    }
  };

  const handleOpenAddCustom = () => { setPrefillData(null); setIsAddModalOpen(true); };
  const handleSelectDirectoryCompany = (company) => { setPrefillData(company); setIsAddModalOpen(true); };

  // ── Split bills by status ──
  const isPaid = (c) => c.status === 'paid';
  const isAuto = (c) => c.paymentType === 'Autopay (card)' || c.paymentType === 'Autopay (bank)';

  // Property scope: in all-properties mode, show every bill. Otherwise show
  // only the selected home's bills — plus any bill with no homeId yet.
  const propertyFiltered = companies.filter(c => {
    if (allProperties) return true;
    if (!selectedHome) return true;
    return c.homeId === selectedHome.id || !c.homeId;
  });

  // Not-yet-closed bills (excludes pending_review and paid).
  const openBills = propertyFiltered.filter(c => !isPaid(c) && c.status !== 'pending_review');

  // Manual bills needing payment, sorted soonest-due first.
  const readyToPay = openBills
    .filter(c => !isAuto(c))
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

  // Autopay bills awaiting human review (drafts on their own; review only).
  const autopayToReview = openBills
    .filter(c => isAuto(c))
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

  const paidBills = propertyFiltered
    .filter(c => {
      if (!isPaid(c)) return false;
      if (timeframeDays == null) return true;
      // use whichever close-date exists (paid for manual, reviewed for autopay)
      const closeDate = c.paidDate || c.reviewedDate;
      if (!closeDate) return true;
      const days = (Date.now() - new Date(closeDate).getTime()) / 86400000;
      return days <= timeframeDays;
    })
    .sort((a, b) => {
      const da = new Date(a.paidDate || a.reviewedDate || 0).getTime();
      const db = new Date(b.paidDate || b.reviewedDate || 0).getTime();
      return db - da;
    });

  // For the dashboard/strips: all open money-out (manual + autopay).
  const openCompanies = openBills;

  // Split manual ready-to-pay into past-due vs the rest.
  const now = new Date();
  const pastDue = readyToPay.filter(c => c.dueDate && new Date(c.dueDate) < now);
  const upcomingToPay = readyToPay.filter(c => !(c.dueDate && new Date(c.dueDate) < now));

  // Show property tags on rows when viewing all properties (and >1 home).
  const showPropertyTags = allProperties && (homes || []).length > 1;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet><title>Bill Pay — CasaCEO</title></Helmet>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '20px 32px', marginBottom: '24px' }}>
        <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
          <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight style={{ width: '14px', height: '14px' }} />
          <span className="text-slate-700 font-medium">Bill Pay</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff' }}>
              <CreditCard style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '24px', lineHeight: '1.2' }}>Bill Pay</h1>
              <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '2px' }}>
                {allProperties
                  ? `All properties · `
                  : (selectedHome?.name ? `${selectedHome.name} · ` : '')}
                Stay ahead of every due date.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AddBillButton onUploaded={fetchCompanies} onAddManual={handleOpenAddCustom} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{ padding: '0 32px' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab Bar */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '24px' }}>
            {[
              { key: 'dashboard', label: 'My Bills', icon: LayoutGrid },
              { key: 'analysis', label: 'Analysis', icon: BarChart2 },
              { key: 'directory', label: 'Directory', icon: BookOpen },
              { key: 'history', label: 'History', icon: CreditCard },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 rounded-xl transition-all font-medium"
                  style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
                  <Icon style={{ width: '14px', height: '14px' }} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── My Bills Tab ── */}
          <TabsContent value="dashboard" className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e9e4db', padding: '48px 20px' }}>
                <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eff6ff', marginBottom: '16px' }}>
                  <CreditCard style={{ width: '28px', height: '28px', color: '#2563eb' }} />
                </div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No bills added yet.</p>
                <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                  Stay ahead of due dates — add your first bill and never miss a payment again.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button onClick={() => setActiveTab('directory')} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                    style={{ background: '#1e3a5f', padding: '12px 24px', fontSize: '14px' }}>
                    <Search style={{ width: '16px', height: '16px' }} /> Browse Directory
                  </button>
                  <button onClick={handleOpenAddCustom} className="flex items-center gap-2 font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl"
                    style={{ padding: '12px 24px', fontSize: '14px' }}>
                    <Plus style={{ width: '16px', height: '16px' }} /> Add Manually
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Quick glance: the four stats. */}
                <SummaryStrip companies={openCompanies} />

                {/* Upcoming cashflow — what's leaving the accounts in 30 days */}
                <UpcomingStrip companies={openCompanies} />

                {/* ── 1. PAST DUE — top priority, loud ── */}
                {pastDue.length > 0 && (
                  <>
                    <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                      <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
                      <h2 className="font-semibold" style={{ fontSize: '18px', color: '#dc2626' }}>
                        Past Due <span className="font-normal" style={{ color: '#f87171' }}>({pastDue.length})</span>
                      </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                      {pastDue.map(company => (
                        <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                      ))}
                    </div>
                  </>
                )}

                {/* ── 2. READY TO PAY (upcoming / undated) ── */}
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>
                    Ready to Pay <span className="text-slate-400 font-normal">({upcomingToPay.length})</span>
                  </h2>
                  <button onClick={handleOpenAddCustom} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                    <Plus style={{ width: '14px', height: '14px' }} /> Add Bill
                  </button>
                </div>
                {upcomingToPay.length === 0 ? (
                  <div className="bg-white text-center text-slate-400" style={{ borderRadius: '10px', border: '1px solid #e9e4db', padding: '24px', fontSize: '14px', marginBottom: '32px' }}>
                    Nothing upcoming to pay. You're all caught up.
                  </div>
                ) : showPropertyTags ? (
                  <div style={{ marginBottom: '32px' }}>
                    <PropertyGroupedList
                      companies={upcomingToPay}
                      homeName={homeName}
                      renderCard={(company) => (
                        <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={null} homes={homes} />
                      )}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {upcomingToPay.map(company => (
                      <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                    ))}
                  </div>
                )}

                {/* ── 3. ON AUTOPAY — needs review (drafts on its own) ── */}
                {autopayToReview.length > 0 && (
                  <>
                    <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                      <Repeat style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
                      <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>
                        On Autopay — needs review <span className="text-slate-400 font-normal">({autopayToReview.length})</span>
                      </h2>
                    </div>
                    <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
                      These draft automatically. Reviewing just confirms someone checked the charge — it doesn't change processing.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                      {autopayToReview.map(company => (
                        <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                      ))}
                    </div>
                  </>
                )}

                {/* ── 4. BILLS TO CONFIRM (email-ingested) ── */}
                <PendingReviewSection onConfirmed={fetchCompanies} />

                {/* ── 5. ALL SET — paid (manual) + reviewed (autopay) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ marginBottom: '12px' }}>
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>
                    All Set <span className="text-slate-400 font-normal">({paidBills.length})</span>
                  </h2>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl" style={{ padding: '4px' }}>
                    {TIMEFRAMES.map(tf => (
                      <button key={tf.label} onClick={() => setTimeframeDays(tf.days)}
                        className="rounded-lg transition-all font-medium"
                        style={{ padding: '5px 12px', fontSize: '12px',
                          background: timeframeDays === tf.days ? '#1e3a5f' : 'transparent',
                          color: timeframeDays === tf.days ? '#fff' : '#64748b' }}>
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>
                {paidBills.length === 0 ? (
                  <div className="bg-white text-center text-slate-400" style={{ borderRadius: '10px', border: '1px solid #e9e4db', padding: '24px', fontSize: '14px' }}>
                    Nothing here yet for this period.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {paidBills.map(company => (
                      <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Analysis Tab ── */}
          <TabsContent value="analysis" className="mt-0">
            {companies.length === 0 ? (
              <div className="bg-white text-center text-slate-400" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '40px', fontSize: '14px' }}>
                Add some bills to see your spending analysis.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryBreakdown companies={openCompanies} />
                <AnnualSpendSummary companies={openCompanies} />
              </div>
            )}
          </TabsContent>

          {/* ── Directory Tab ── */}
          <TabsContent value="directory" className="mt-0">
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '4px' }}>Provider Directory</h2>
                <p className="text-slate-400" style={{ fontSize: '14px' }}>Find common providers and link them instantly — electric, water, internet, insurance, and more.</p>
              </div>
              <UtilityCompanyListing ref={utilityListingRef} onSelectCompany={handleSelectDirectoryCompany} />
            </div>
          </TabsContent>

          {/* ── History Tab ── */}
          <TabsContent value="history" className="mt-0">
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <PaymentHistoryTab refreshTrigger={historyRefreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Bill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{prefillData?.id ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm
            initialData={prefillData}
            onSuccess={() => { setIsAddModalOpen(false); fetchCompanies(); setActiveTab('dashboard'); toast({ title: '✅ Bill added successfully!' }); }}
            onCompanyAdded={() => { if (utilityListingRef.current) utilityListingRef.current.refresh(); }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillPayPage;
