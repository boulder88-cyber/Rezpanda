import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Plus, CreditCard, LayoutGrid, Search, BookOpen, AlertCircle, CheckCircle2, Clock, DollarSign, Zap, Bell } from 'lucide-react';
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
    const due = new Date(c.dueDate);
    return due < today;
  });

  const totalDue = [...dueSoon, ...overdue].reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  if (dueSoon.length === 0 && overdue.length === 0) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-green-800 text-lg">You're all caught up!</p>
          <p className="text-green-600 text-sm">No bills due in the next 7 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Bills Needing Attention
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {overdue.length > 0 && `${overdue.length} overdue · `}
              {dueSoon.length > 0 && `${dueSoon.length} due within 7 days`}
            </p>
          </div>
          {totalDue > 0 && (
            <div className="bg-slate-50 rounded-xl px-6 py-3 text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Due</p>
              <p className="text-2xl font-extrabold text-slate-900">${totalDue.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Overdue Bills */}
          {overdue.map(bill => (
            <div key={bill.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{bill.companyName}</p>
                  <p className="text-red-500 text-xs font-medium">OVERDUE</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bill.amount && <span className="font-bold text-slate-900">${parseFloat(bill.amount).toFixed(2)}</span>}
                {bill.paymentUrl && (
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4"
                    onClick={() => {
                      window.open(bill.paymentUrl, '_blank');
                      onPay(bill);
                    }}
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Due Soon Bills */}
          {dueSoon.map(bill => (
            <div key={bill.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{bill.companyName}</p>
                  <p className="text-orange-500 text-xs font-medium">
                    Due {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bill.amount && <span className="font-bold text-slate-900">${parseFloat(bill.amount).toFixed(2)}</span>}
                {bill.paymentUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-4 border-orange-200 text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      window.open(bill.paymentUrl, '_blank');
                      onPay(bill);
                    }}
                  >
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

// ─── Quick Stats Bar ──────────────────────────────────────────────────
const QuickStats = ({ companies }) => {
  const totalMonthly = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalProviders = companies.length;
  const withAutoPayLinks = companies.filter(c => c.paymentUrl).length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: "Monthly Bills", value: `$${totalMonthly.toFixed(0)}`, icon: <DollarSign className="w-5 h-5 text-blue-600" />, color: "bg-blue-50 border-blue-100" },
        { label: "Providers", value: totalProviders, icon: <LayoutGrid className="w-5 h-5 text-purple-600" />, color: "bg-purple-50 border-purple-100" },
        { label: "Quick Pay Ready", value: withAutoPayLinks, icon: <Zap className="w-5 h-5 text-green-600" />, color: "bg-green-50 border-green-100" },
      ].map((stat, i) => (
        <div key={i} className={`${stat.color} border rounded-2xl p-4 flex flex-col items-center text-center`}>
          <div className="mb-2">{stat.icon}</div>
          <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
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
      console.error('Error fetching companies:', error);
      toast({ title: "Failed to load service companies", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [currentUser]);

  useEffect(() => {
    const fetchAccountName = async () => {
      if (!selectedAccountId || selectedAccountId === 'none') {
        setSelectedAccountName('');
        return;
      }
      try {
        const account = await pb.collection('homes').getOne(selectedAccountId, { $autoCancel: false });
        setSelectedAccountName(account.name);
      } catch (e) {
        console.error("Could not fetch account name", e);
      }
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
      toast({
        title: "✅ Payment Logged",
        description: `Recorded payment to ${company.companyName}`
      });
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Failed to log payment",
        variant: "destructive"
      });
    }
  };

  const handleOpenAddCustom = () => {
    setPrefillData(null);
    setIsAddModalOpen(true);
  };

  const handleSelectDirectoryCompany = (company) => {
    setPrefillData(company);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Helmet>
        <title>Bill Pay — CasaCEO</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                Bill Pay
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                All your bills in one place. See what's due, pay with one click, and track your history.
              </p>
            </div>
            <div className="flex-shrink-0 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <AccountSelector
                selectedAccount={selectedAccountId}
                onSelectAccount={setSelectedAccountId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <TabsList className="bg-white border border-slate-200 p-1.5 h-auto rounded-2xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-xl px-6 py-3 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <LayoutGrid className="w-5 h-5 mr-2.5" /> My Bills
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-xl px-6 py-3 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <BookOpen className="w-5 h-5 mr-2.5" /> Directory
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-6 py-3 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <CreditCard className="w-5 h-5 mr-2.5" /> History
              </TabsTrigger>
            </TabsList>

            <Button
              className="rounded-xl shadow-md hover:shadow-lg transition-all py-6 px-6 text-base"
              onClick={handleOpenAddCustom}
            >
              <Plus className="w-5 h-5 mr-2" /> Add Bill
            </Button>
          </div>

          <TabsContent value="dashboard" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-56 rounded-3xl bg-slate-200/50 animate-pulse"></div>
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center shadow-sm max-w-3xl mx-auto mt-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CreditCard className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">No bills added yet</h3>
                <p className="text-slate-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                  Add your first bill to start tracking due dates and payments across all your properties.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={() => setActiveTab('directory')} size="lg" className="rounded-xl w-full sm:w-auto text-base py-6 px-8">
                    <Search className="w-5 h-5 mr-2" /> Browse Directory
                  </Button>
                  <Button variant="outline" onClick={handleOpenAddCustom} size="lg" className="rounded-xl w-full sm:w-auto text-base py-6 px-8">
                    <Plus className="w-5 h-5 mr-2" /> Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Bills Due Summary */}
                <BillsDueSummary companies={companies} onPay={handleLogPayment} />

                {/* Quick Stats */}
                <QuickStats companies={companies} />

                {/* All Providers Grid */}
                <h2 className="text-xl font-bold text-slate-900 mb-4">All Bills</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          <TabsContent value="directory" className="mt-0">
            <div className="bg-white/50 rounded-3xl p-2 sm:p-6">
              <UtilityCompanyListing
                ref={utilityListingRef}
                onSelectCompany={handleSelectDirectoryCompany}
              />
            </div>
          </TabsContent>

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
            <DialogTitle className="text-2xl font-bold">
              {prefillData?.id ? 'Edit Bill' : 'Add New Bill'}
            </DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm
            initialData={prefillData}
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchCompanies();
              setActiveTab('dashboard');
            }}
            onCompanyAdded={() => {
              if (utilityListingRef.current) {
                utilityListingRef.current.refresh();
              }
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillPayPage;
