import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import {
  Plus, CreditCard, LayoutGrid, Search, BookOpen,
  AlertCircle, CheckCircle2, Clock, DollarSign, Zap,
  Bell, ShieldCheck, TrendingDown, TrendingUp, ArrowRight,
  ChevronRight, Home, Download, BarChart2, Lightbulb,
  Droplets, Wifi, Car, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

import AccountSelector from '@/components/AccountSelector.jsx';
import AddServiceCompanyForm from '@/components/AddServiceCompanyForm.jsx';
import ServiceCompanyCard from '@/components/ServiceCompanyCard.jsx';
import PaymentHistoryTab from '@/components/PaymentHistoryTab.jsx';
import UtilityCompanyListing from '@/components/UtilityCompanyListing.jsx';

// ═══════════════════════════════════════════════════════════════════════
// BILLS DUE SUMMARY BANNER — preserved exactly
// ═══════════════════════════════════════════════════════════════════════

const BillsDueSummary = ({ companies, onPay }) => {
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dueSoon = companies.filter(c => {
    if (!c.dueDate) return false;
    const due = new Date(c.dueDate);
    return due <= in7Days && due >= today;
  });

  const overdue = companies.filter(c => {
    if (!c.dueDate) return false;
    return new Date(c.dueDate) < today;
  });

  const totalDue = [...dueSoon, ...overdue].reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  if (dueSoon.length === 0 && overdue.length === 0) {
    return (
      <div className="flex items-center gap-4" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#d1fae5' }}>
          <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669' }} />
        </div>
        <div>
          <p className="font-semibold text-green-800" style={{ fontSize: '15px' }}>You're all caught up!</p>
          <p className="text-green-600" style={{ fontSize: '13px', marginTop: '2px' }}>No bills due in the next 7 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ marginBottom: '16px' }}>
        <div className="flex items-center gap-2">
          <Bell style={{ width: '18px', height: '18px', color: '#f97316' }} />
          <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Bills Needing Attention</h2>
          {overdue.length > 0 && (
            <span className="font-medium text-red-600 bg-red-100 rounded-full" style={{ padding: '2px 8px', fontSize: '12px' }}>
              {overdue.length} Overdue
            </span>
          )}
        </div>
        {totalDue > 0 && (
          <div className="text-right bg-slate-50 rounded-xl" style={{ padding: '10px 16px', border: '1px solid #e2e8f0' }}>
            <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px' }}>Total Due</p>
            <p className="font-extrabold text-slate-900" style={{ fontSize: '24px', lineHeight: 1 }}>${totalDue.toFixed(2)}</p>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {overdue.map(bill => (
          <div key={bill.id} className="flex items-center justify-between" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', flexShrink: 0 }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{bill.companyName}</p>
                <p className="font-bold text-red-500 uppercase" style={{ fontSize: '11px' }}>Overdue</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {bill.amount && <span className="font-bold text-slate-900" style={{ fontSize: '14px' }}>${parseFloat(bill.amount).toFixed(2)}</span>}
              {bill.paymentUrl && (
                <button className="font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#ef4444', padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => { window.open(bill.paymentUrl, '_blank'); onPay(bill); }}>
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}
        {dueSoon.map(bill => (
          <div key={bill.id} className="flex items-center justify-between" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', flexShrink: 0 }}>
                <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
              </div>
              <div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{bill.companyName}</p>
                <p className="text-amber-600" style={{ fontSize: '12px' }}>Due {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {bill.amount && <span className="font-bold text-slate-900" style={{ fontSize: '14px' }}>${parseFloat(bill.amount).toFixed(2)}</span>}
              {bill.paymentUrl && (
                <button className="font-semibold text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-50 transition-all" style={{ padding: '6px 14px', fontSize: '12px' }}
                  onClick={() => { window.open(bill.paymentUrl, '_blank'); onPay(bill); }}>
                  Pay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// QUICK STATS
// ═══════════════════════════════════════════════════════════════════════

const QuickStats = ({ companies }) => {
  const totalMonthly = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalProviders = companies.length;
  const withPayLinks = companies.filter(c => c.paymentUrl).length;
  const overdue = companies.filter(c => c.dueDate && new Date(c.dueDate) < new Date()).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
      {[
        { label: 'Total Due This Month', value: `$${totalMonthly.toFixed(0)}`, icon: DollarSign, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
        { label: 'Overdue Bills', value: overdue, icon: AlertCircle, color: overdue > 0 ? '#dc2626' : '#059669', bg: overdue > 0 ? '#fef2f2' : '#ecfdf5', border: overdue > 0 ? '#fecaca' : '#a7f3d0' },
        { label: 'Providers Tracked', value: totalProviders, icon: LayoutGrid, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
        { label: 'Quick Pay Ready', value: withPayLinks, icon: Zap, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${stat.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: stat.bg, marginBottom: '8px' }}>
              <Icon style={{ width: '16px', height: '16px', color: stat.color }} />
            </div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: '24px', lineHeight: 1 }}>{stat.value}</p>
            <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════

const CategoryBreakdown = ({ companies }) => {
  const categories = [
    { name: 'Electric', icon: Zap, color: '#d97706', bg: '#fffbeb', keywords: ['electric', 'power', 'energy', 'utility'] },
    { name: 'Water', icon: Droplets, color: '#0891b2', bg: '#ecfeff', keywords: ['water', 'sewer', 'waste'] },
    { name: 'Internet', icon: Wifi, color: '#7c3aed', bg: '#f5f3ff', keywords: ['internet', 'cable', 'comcast', 'att', 'verizon', 'xfinity'] },
    { name: 'Insurance', icon: Shield, color: '#059669', bg: '#ecfdf5', keywords: ['insurance', 'allstate', 'state farm', 'geico', 'progressive'] },
    { name: 'Auto', icon: Car, color: '#2563eb', bg: '#eff6ff', keywords: ['auto', 'car', 'vehicle', 'loan'] },
    { name: 'Other', icon: CreditCard, color: '#64748b', bg: '#f8fafc', keywords: [] },
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
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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

// ═══════════════════════════════════════════════════════════════════════
// ANNUAL SPEND SUMMARY
// ═══════════════════════════════════════════════════════════════════════

const AnnualSpendSummary = ({ companies }) => {
  const monthly = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const annual = monthly * 12;

  return (
    <div className="flex flex-col sm:flex-row gap-4" style={{ marginBottom: '24px' }}>
      {[
        { label: 'Monthly Total', value: `$${monthly.toFixed(0)}`, sub: 'Current month estimate', color: '#1e3a5f', bg: '#eef2f8' },
        { label: 'Annual Projection', value: `$${annual.toLocaleString()}`, sub: 'Based on current bills', color: '#059669', bg: '#ecfdf5' },
        { label: 'Avg per Bill', value: companies.length > 0 ? `$${(monthly / companies.length).toFixed(0)}` : '$0', sub: `Across ${companies.length} providers`, color: '#7c3aed', bg: '#f5f3ff' },
      ].map((s, i) => (
        <div key={i} className="flex-1 bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '6px' }}>{s.label}</p>
          <p className="font-extrabold" style={{ fontSize: '26px', lineHeight: 1, color: s.color }}>{s.value}</p>
          <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// NEXT BILL DUE WIDGET
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
    <div className="flex items-center gap-4 bg-white" style={{ borderRadius: '12px', border: '1px solid #bfdbfe', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff' }}>
        <Clock style={{ width: '20px', height: '20px', color: '#2563eb' }} />
      </div>
      <div className="flex-1">
        <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '2px' }}>Next Bill Due</p>
        <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{next.companyName}</p>
        <p className="text-slate-400" style={{ fontSize: '13px' }}>
          Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''} · {new Date(next.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          {next.amount && ` · $${parseFloat(next.amount).toFixed(2)}`}
        </p>
      </div>
      {next.paymentUrl && (
        <button className="font-semibold text-white hover:opacity-90 transition-all rounded-xl flex-shrink-0" style={{ background: '#2563eb', padding: '8px 16px', fontSize: '13px' }}
          onClick={() => window.open(next.paymentUrl, '_blank')}>
          Pay Now
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const BillPayPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccountName, setSelectedAccountName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const utilityListingRef = useRef(null);

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

  useEffect(() => {
    const fetchAccountName = async () => {
      if (!selectedAccountId || selectedAccountId === 'none') { setSelectedAccountName(''); return; }
      try {
        const account = await pb.collection('homes').getOne(selectedAccountId, { $autoCancel: false });
        setSelectedAccountName(account.name);
      } catch {}
    };
    fetchAccountName();
  }, [selectedAccountId]);

  const handleLogPayment = async (company) => {
    if (!currentUser) return;
    try {
      await pb.collection('payment_history').create({
        companyName: company.companyName, datePaid: new Date().toISOString(),
        amount: company.amount || null, accountUsed: selectedAccountName || 'Default Account', ownerId: currentUser.id
      }, { $autoCancel: false });
      toast({ title: '✅ Payment Logged', description: `Recorded payment to ${company.companyName}` });
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch {
      toast({ title: 'Failed to log payment', variant: 'destructive' });
    }
  };

  const handleOpenAddCustom = () => { setPrefillData(null); setIsAddModalOpen(true); };
  const handleSelectDirectoryCompany = (company) => { setPrefillData(company); setIsAddModalOpen(true); };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet><title>Bill Pay — CasaCEO</title></Helmet>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
        <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
          <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
          <ChevronRight style={{ width: '14px', height: '14px' }} />
          <span className="text-slate-700 font-medium">Bill Pay</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff' }}>
              <CreditCard style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Bill Pay</h1>
              <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                Stay ahead of every due date — all your bills in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl" style={{ padding: '8px 12px' }}>
              <AccountSelector selectedAccount={selectedAccountId} onSelectAccount={setSelectedAccountId} />
            </div>
            <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
              <Download style={{ width: '15px', height: '15px' }} /> Export
            </button>
            <button onClick={handleOpenAddCustom} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Bill
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{ padding: '0 32px' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab Bar */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '32px' }}>
            {[
              { key: 'dashboard', label: 'My Bills', icon: LayoutGrid },
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
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
                {/* Next Bill Due */}
                <NextBillDue companies={companies} />

                {/* Bills Due Banner */}
                <BillsDueSummary companies={companies} onPay={handleLogPayment} />

                {/* Quick Stats */}
                <QuickStats companies={companies} />

                {/* Two column: Category Breakdown + Annual Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                  <CategoryBreakdown companies={companies} />
                  <AnnualSpendSummary companies={companies} />
                </div>

                {/* All Bills */}
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>All Bills</h2>
                  <button onClick={handleOpenAddCustom} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                    <Plus style={{ width: '14px', height: '14px' }} /> Add Bill
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {companies.map(company => (
                    <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Directory Tab ── */}
          <TabsContent value="directory" className="mt-0">
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '4px' }}>Provider Directory</h2>
                <p className="text-slate-400" style={{ fontSize: '14px' }}>Find common providers and link them instantly — electric, water, internet, insurance, and more.</p>
              </div>
              <UtilityCompanyListing ref={utilityListingRef} onSelectCompany={handleSelectDirectoryCompany} />
            </div>
          </TabsContent>

          {/* ── History Tab ── */}
          <TabsContent value="history" className="mt-0">
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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
