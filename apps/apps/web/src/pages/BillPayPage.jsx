import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Plus, CreditCard, LayoutGrid, Search, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

import AccountSelector from '@/components/AccountSelector.jsx';
import AddServiceCompanyForm from '@/components/AddServiceCompanyForm.jsx';
import ServiceCompanyCard from '@/components/ServiceCompanyCard.jsx';
import PaymentHistoryTab from '@/components/PaymentHistoryTab.jsx';
import UtilityCompanyListing from '@/components/UtilityCompanyListing.jsx';

const BillPayPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccountName, setSelectedAccountName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  
  // Ref for UtilityCompanyListing to trigger refresh
  const utilityListingRef = useRef(null);

  const fetchCompanies = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      // Use getFullList with a high batch size to ensure ALL records are fetched without pagination limits
      const records = await pb.collection('service_companies').getFullList({
        batch: 500,
        filter: `ownerId="${currentUser.id}"`,
        sort: 'companyName',
        $autoCancel: false
      });

      // Deduplicate service companies by name to prevent UI duplicates
      const uniqueRecords = [];
      const seenNames = new Set();
      
      for (const record of records) {
        if (!seenNames.has(record.companyName)) {
          seenNames.add(record.companyName);
          uniqueRecords.push(record);
        }
      }

      console.log(`[BillPayPage] Fetched ${records.length} service companies, displaying ${uniqueRecords.length} unique records.`);
      setCompanies(uniqueRecords);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({ title: "Failed to load service companies", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentUser]);

  // Update account name when ID changes
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
        title: "Payment Logged", 
        description: `Recorded payment to ${company.companyName}` 
      });
      
      // Trigger history tab refresh
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error logging payment:', error);
      toast({ 
        title: "Failed to log payment", 
        description: "The payment link opened, but we couldn't save it to your history.",
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      <Helmet>
        <title>Bill Pay Dashboard - RezPanda</title>
      </Helmet>

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-10 pb-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Centralized Bill Pay
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                Manage all your service providers, discover utility companies, and track payments from one secure dashboard.
              </p>
            </div>
            
            <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
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
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 h-auto rounded-2xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-xl px-6 py-3 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <LayoutGrid className="w-5 h-5 mr-2.5" />
                My Providers
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-xl px-6 py-3 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <BookOpen className="w-5 h-5 mr-2.5" />
                Directory
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-6 py-3 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                <CreditCard className="w-5 h-5 mr-2.5" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                className="rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex-1 sm:flex-none py-6 px-6 text-base"
                onClick={handleOpenAddCustom}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Provider
              </Button>
            </div>
          </div>

          <TabsContent value="dashboard" className="mt-0 outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-56 rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse"></div>
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 border-dashed dark:border-slate-800 p-16 text-center shadow-sm max-w-3xl mx-auto mt-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CreditCard className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">No providers added yet</h3>
                <p className="text-slate-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                  Start centralizing your bills by adding your first service company. You can browse our directory or add one manually.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={() => setActiveTab('directory')} size="lg" className="rounded-xl w-full sm:w-auto text-base py-6 px-8 shadow-md hover:shadow-lg transition-all">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Directory
                  </Button>
                  <Button variant="outline" onClick={handleOpenAddCustom} size="lg" className="rounded-xl w-full sm:w-auto text-base py-6 px-8 bg-white dark:bg-slate-900">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Manually
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="directory" className="mt-0 outline-none focus-visible:ring-0">
            <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-2 sm:p-6">
              <UtilityCompanyListing 
                ref={utilityListingRef} 
                onSelectCompany={handleSelectDirectoryCompany} 
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none focus-visible:ring-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <PaymentHistoryTab refreshTrigger={historyRefreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Company Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {prefillData?.id ? 'Edit Provider' : 'Add New Provider'}
            </DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm 
            initialData={prefillData}
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchCompanies();
              setActiveTab('dashboard'); // Switch back to dashboard to see the new provider
            }}
            onCompanyAdded={() => {
              // Trigger refresh in the directory listing
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