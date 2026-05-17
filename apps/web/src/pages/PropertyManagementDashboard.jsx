import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Building2, Wrench, Users, FileText, DollarSign, BarChart3 } from 'lucide-react';

// Import all sub-components
import PropertyOverviewCards from '@/components/PropertyOverviewCards.jsx';
import MaintenanceRequestTracker from '@/components/MaintenanceRequestTracker.jsx';
import TenantManagementSection from '@/components/TenantManagementSection.jsx';
import LeaseManagementPanel from '@/components/LeaseManagementPanel.jsx';
import PropertyDocumentsStorage from '@/components/PropertyDocumentsStorage.jsx';
import InspectionHistoryScheduler from '@/components/InspectionHistoryScheduler.jsx';
import UtilityTrackingAnalysis from '@/components/UtilityTrackingAnalysis.jsx';
import PropertyPhotosGallery from '@/components/PropertyPhotosGallery.jsx';
import RepairImprovementLog from '@/components/RepairImprovementLog.jsx';
import InsuranceInformationDisplay from '@/components/InsuranceInformationDisplay.jsx';
import MortgageFinancingPanel from '@/components/MortgageFinancingPanel.jsx';
import RentalIncomeTracker from '@/components/RentalIncomeTracker.jsx';
import ExpenseBreakdownAnalysis from '@/components/ExpenseBreakdownAnalysis.jsx';
import PropertyComparisonTool from '@/components/PropertyComparisonTool.jsx';
import QuickActionButtons from '@/components/QuickActionButtons.jsx';

const PropertyManagementDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ properties: 0, value: 0, occupancy: 0, maintenance: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      try {
        const props = await pb.collection('properties').getList(1, 100, { filter: `ownerId = "${currentUser.id}"`, $autoCancel: false });
        const maint = await pb.collection('maintenance').getList(1, 1, { filter: `ownerId = "${currentUser.id}" && status != "completed"`, $autoCancel: false });
        
        const occupied = props.items.filter(p => p.status === 'occupied').length;
        const occRate = props.items.length > 0 ? Math.round((occupied / props.items.length) * 100) : 0;
        
        setStats({
          properties: props.items.length,
          value: props.items.reduce((sum, p) => sum + (p.rentPrice || 0) * 120, 0), // Rough estimate for display
          occupancy: occRate,
          maintenance: maint.totalItems
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet>
        <title>Property Management Dashboard - CasaCEO</title>
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2070&auto=format&fit=crop" 
            alt="Property Management" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Property Management Command Center
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Oversee your entire portfolio, track financials, and manage tenants from one unified dashboard.
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white">
              <p className="text-sm text-slate-300 mb-1">Total Properties</p>
              <p className="text-3xl font-bold">{stats.properties}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white">
              <p className="text-sm text-slate-300 mb-1">Est. Portfolio Value</p>
              <p className="text-3xl font-bold">${(stats.value / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white">
              <p className="text-sm text-slate-300 mb-1">Occupancy Rate</p>
              <p className="text-3xl font-bold">{stats.occupancy}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white">
              <p className="text-sm text-slate-300 mb-1">Active Issues</p>
              <p className="text-3xl font-bold text-amber-400">{stats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
          <QuickActionButtons />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto justify-start gap-2 bg-transparent p-0 mb-8 border-b border-slate-200 pb-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"><Building2 className="w-4 h-4 mr-2"/> Overview</TabsTrigger>
              <TabsTrigger value="financials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"><DollarSign className="w-4 h-4 mr-2"/> Financials</TabsTrigger>
              <TabsTrigger value="tenants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"><Users className="w-4 h-4 mr-2"/> Tenants & Leases</TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"><Wrench className="w-4 h-4 mr-2"/> Maintenance</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"><FileText className="w-4 h-4 mr-2"/> Documents</TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"><BarChart3 className="w-4 h-4 mr-2"/> Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-12 animate-in fade-in duration-500">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Portfolio</h2>
                <PropertyOverviewCards />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Gallery</h2>
                <PropertyPhotosGallery />
              </section>
            </TabsContent>

            <TabsContent value="financials" className="space-y-12 animate-in fade-in duration-500">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Income Tracking</h2>
                <RentalIncomeTracker />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Expense Breakdown</h2>
                <ExpenseBreakdownAnalysis />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Mortgage & Financing</h2>
                <MortgageFinancingPanel />
              </section>
            </TabsContent>

            <TabsContent value="tenants" className="space-y-12 animate-in fade-in duration-500">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Tenant Management</h2>
                <TenantManagementSection />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Lease Renewals</h2>
                <LeaseManagementPanel />
              </section>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-12 animate-in fade-in duration-500">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Requests</h2>
                <MaintenanceRequestTracker />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Inspections</h2>
                <InspectionHistoryScheduler />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Repair Log</h2>
                <RepairImprovementLog />
              </section>
            </TabsContent>

            <TabsContent value="documents" className="space-y-12 animate-in fade-in duration-500">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Document Vault</h2>
                <PropertyDocumentsStorage />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Insurance Policies</h2>
                <InsuranceInformationDisplay />
              </section>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-12 animate-in fade-in duration-500">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Utility Tracking</h2>
                <UtilityTrackingAnalysis />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Comparison</h2>
                <PropertyComparisonTool />
              </section>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagementDashboard;