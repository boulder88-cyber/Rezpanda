import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { useHome } from '@/contexts/HomeContext.jsx';
import MaintenanceDashboard from '@/components/MaintenanceDashboard.jsx';
import HomeSystemsManager from '@/components/HomeSystemsManager.jsx';
import MaintenanceTaskScheduler from '@/components/MaintenanceTaskScheduler.jsx';
import DocumentStorage from '@/components/DocumentStorage.jsx';
import { Wrench, LayoutDashboard, Settings, CalendarCheck, FileText } from 'lucide-react';

const MaintenanceManagementPage = () => {
  const { currentHome } = useHome();

  if (!currentHome) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Please select a home to view maintenance management.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>Maintenance Management - CasaCEO</title>
      </Helmet>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Maintenance</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            Maintenance Management
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Track your home's systems, schedule routine maintenance, and store important warranties and service records.
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-8 bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <LayoutDashboard className="w-4 h-4 mr-2 hidden sm:inline-block" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="systems" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings className="w-4 h-4 mr-2 hidden sm:inline-block" /> Systems
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CalendarCheck className="w-4 h-4 mr-2 hidden sm:inline-block" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2 hidden sm:inline-block" /> Documents
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="dashboard" className="m-0 focus-visible:outline-none">
            <MaintenanceDashboard />
          </TabsContent>
          
          <TabsContent value="systems" className="m-0 focus-visible:outline-none">
            <HomeSystemsManager />
          </TabsContent>
          
          <TabsContent value="tasks" className="m-0 focus-visible:outline-none">
            <MaintenanceTaskScheduler />
          </TabsContent>
          
          <TabsContent value="documents" className="m-0 focus-visible:outline-none">
            <DocumentStorage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MaintenanceManagementPage;