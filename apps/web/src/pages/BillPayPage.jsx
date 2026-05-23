import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import {
  Plus, CreditCard, LayoutGrid, Search, BookOpen,
  AlertCircle, CheckCircle2, Clock, DollarSign, Zap,
  Bell, ShieldCheck, TrendingDown, TrendingUp, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

import AccountSelector from '@/components/AccountSelector.jsx';
import AddServiceCompanyForm from '@/components/AddServiceCompanyForm.jsx';
import ServiceCompanyCard from '@/components/ServiceCompanyCard.jsx';
import PaymentHistoryTab from '@/components/PaymentHistoryTab.jsx';
import UtilityCompanyListing from '@/components/UtilityCompanyListing.jsx';

// ─── Bills Due Summary Banner ─────────────────────────────────────────
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
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-green-800">You're all caught up!</p>
          <p className="text-green-600 text-sm">No bills due in the next 7 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" /> Bills Needing Attention
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {overdue.length > 0 && `${overdue.length} overdue · `}
              {dueSoon.length > 0 && `${dueSoon.length} due within 7 days`}
            </p>
          </div>
          {totalDue > 0 && (
            <div className="bg-slate-50 rounded-xl px-5 py-2.5 text-right border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Due</p>
              <p className="text-2xl font-extrabold text-slate-900">${totalDue.toFixed(2)}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {overdue.map(bill => (
            <div key={bill.id} className="flex items-center justify-between p-3.5 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{bill.companyName}</p>
                  <p className="text-red-500 text-xs font-bold uppercase">Overdue</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bill.amount && <span className="font-bold text-slate-900 text-sm">${parseFloat(bill.amount).toFixed(2)}</span>}
                {bill.paymentUrl && (
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 text-xs" onClick={() => { window.open(bill.paymentUrl, '_blank'); onPay(bill); }}>
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          ))}
          {dueSoon.map(bill => (
            <div key={bill.id} className="flex items-center justify-between p-3.5 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{bill.companyName}</p>
                  <p className="text-orange-500 text-xs font-medium">Due {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bill.amount && <span className="font-bold text-slate-900 text-sm">${parseFloat(bill.amount).toFixed(2)}</span>}
                {bill.paymentUrl && (
                  <Button size="sm" variant="outline" className="rounded-full px-4 border-orange-200 text-orange-600 hover:bg-orange-50 text-xs" onClick={() => { window.open(bill.paymentUrl, '_blank'); onPay(bill); }}>
                    Pay
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ companies }) => {
  const totalMonthly = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalProviders = companies.length;
  const withPayLinks = companies.filter(c => c.paymentUrl).length;
  const overdue = companies.filter(c => c.dueDate && new Date(c.dueDate) < new Date()).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Due This Month', value: `$${totalMonthly.toFixed(0)}`, icon: <DollarSign className="w-5 h-5" />, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d5e8', trend: '↕ vs last month' },
        { label: 'Overdue Bills', value: overdue, icon: <AlertCircle className="w-5 h-5" />, color: overdue > 0 ? '#dc2626' : '#059669', bg: overdue > 0 ? '#fef2f2' : '#ecfdf5', border: overdue > 0 ? '#fecaca' : '#a7f3d0', trend: overdue > 0 ? '⚠ Action needed' : '✓ All clear' },
        { label: 'Providers Tracked', value: totalProviders, icon: <LayoutGrid className="w-5 h-5" />, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', trend: 'across all properties' },
        { label: 'Quick Pay Ready', value: withPayLinks, icon: <Zap className="w-5 h-5" />, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', trend: 'one-click payment' },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: stat.border }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">{stat.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
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
        batch: 500,
        filter: `ownerId="${currentUser.id}"`,
        sort: 'companyName',
        $autoCancel: false
      });
      const uniqueRecords = [];
      const seenNames = new Set();
      for (const record of records) {
        if (!seenNames.has(record.companyName)) {
          seenNames.add(record.companyName);
          uniqueRecords.push(record);
        }
      }
      setCompanies(uniqueRecords);
    } catch (error) {
      toast({ title: "Failed to load bills", variant: "destructive" });
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
      } catch (e) {}
    };
    fetchAccountName();
  }, [selectedAccountId]);

  const handleLogPayment = async (company) => {
    if (!currentUser) return;
    try {
      await pb.collection('payment_history').create({
        companyName: company.companyName,
        datePaid: new Date().toISOString(),
        amount: company.amount || null,
        accountUsed: selectedAccountName || 'Default Account',
        ownerId: currentUser.id
      }, { $autoCancel: false });
      toast({ title: "✅ Payment Logged", description: `Recorded payment to ${company.companyName}` });
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast({ title: "Failed to log payment", variant: "destructive" });
    }
  };

  const handleOpenAddCustom = () => { setPrefillData(null); setIsAddModalOpen(true); };
  const handleSelectDirectoryCompany = (company) => { setPrefillData(company); setIsAddModalOpen(true); };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Helmet><title>Bill Pay — CasaCEO</title></Helmet>

      {/* Header — navy branded */}
      <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">Bill Pay</h1>
            </div>
            <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
              Stay ahead of every due date — all your bills, providers, and payment history in one place.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <ShieldCheck className="w-4 h-4 text-green-300" />
              <span className="text-blue-200 text-xs">Your payment data is encrypted and private — always.</span>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-2 rounded-2xl border border-white/10">
            <AccountSelector selectedAccount={selectedAccountId} onSelectAccount={setSelectedAccountId} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-2xl shadow-sm">
              <TabsTrigger
                value="dashboard"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:text-white"
                style={{ '--tw-bg-active': '#1e3a5f' }}
                onClick={() => {}}
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> My Bills
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all">
                <BookOpen className="w-4 h-4 mr-2" /> Directory
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all">
                <CreditCard className="w-4 h-4 mr-2" /> History
              </TabsTrigger>
            </TabsList>

            <Button
              className="rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-white"
              style={{ background: '#1e3a5f' }}
              onClick={handleOpenAddCustom}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Bill
            </Button>
          </div>

          {/* My Bills Tab */}
          <TabsContent value="dashboard" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-56 rounded-2xl bg-slate-200/50 animate-pulse"></div>
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#eef2f8' }}>
                  <CreditCard className="w-10 h-10" style={{ color: '#1e3a5f' }} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No bills added yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-2">
                  Stay ahead of due dates — add your first bill and never miss a payment again.
                </p>
                <p className="text-slate-400 text-sm mb-8">
                  Link common providers like electric, water, and internet in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => setActiveTab('directory')}
                    size="lg"
                    className="rounded-xl w-full sm:w-auto font-bold text-white"
                    style={{ background: '#1e3a5f' }}
                  >
                    <Search className="w-4 h-4 mr-2" /> Browse Directory
                    <span className="ml-2 text-xs opacity-70">— Find common providers</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleOpenAddCustom}
                    size="lg"
                    className="rounded-xl w-full sm:w-auto border-slate-200"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Manually
                    <span className="ml-2 text-xs text-slate-400">— Custom or one-time bills</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <BillsDueSummary companies={companies} onPay={handleLogPayment} />
                <QuickStats companies={companies} />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">All Bills</h2>
                  <button
                    onClick={handleOpenAddCustom}
                    className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
                    style={{ color: '#1e3a5f' }}
                  >
                    <Plus className="w-4 h-4" /> Add Bill
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {companies.map((company) => (
                    <ServiceCompanyCard
                      key={company.id}
                      company={company}
                      onRefresh={fetchCompanies}
                      onPay={handleLogPayment}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Directory Tab */}
          <TabsContent value="directory" className="mt-0">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500">Find common providers and link them instantly — electric, water, internet, insurance, and more.</p>
              </div>
              <UtilityCompanyListing ref={utilityListingRef} onSelectCompany={handleSelectDirectoryCompany} />
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <PaymentHistoryTab refreshTrigger={historyRefreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Bill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {prefillData?.id ? 'Edit Bill' : 'Add New Bill'}
            </DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm
            initialData={prefillData}
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchCompanies();
              setActiveTab('dashboard');
              toast({ title: "✅ Bill added successfully!" });
            }}
            onCompanyAdded={() => {
              if (utilityListingRef.current) utilityListingRef.current.refresh();
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillPayPage;
