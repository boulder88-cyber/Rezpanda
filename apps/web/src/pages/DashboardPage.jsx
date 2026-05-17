import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

import DashboardSidebar from '@/components/DashboardSidebar.jsx';
import PropertySelector from '@/components/PropertySelector.jsx';
import DashboardOverview from '@/components/DashboardOverview.jsx';
import OfferingCard from '@/components/OfferingCard.jsx';

// Icons for offerings
import { 
  Building2, Wrench, FileText, CreditCard, 
  TreePine, Home, ShieldCheck, Eye, 
  Users, Search, FolderOpen
} from 'lucide-react';

const offeringsData = [
  {
    title: "Property Management",
    description: "Centralized hub for all your property details, tenants, and leases.",
    icon: Building2,
    link: "/property-management",
    colorClass: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    title: "Maintenance",
    description: "Schedule, track, and manage repair requests and routine upkeep.",
    icon: Wrench,
    link: "/maintenance",
    colorClass: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
  },
  {
    title: "Tax Reporting",
    description: "Automated expense tracking and tax document generation.",
    icon: FileText,
    link: "/expenses",
    colorClass: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  {
    title: "Bill Pay",
    description: "Centralized dashboard to manage and pay all service providers.",
    icon: CreditCard,
    link: "/bill-pay",
    colorClass: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400"
  },
  {
    title: "Landscape",
    description: "Schedule and track landscaping, gardening, and exterior care.",
    icon: TreePine,
    link: "/plants",
    colorClass: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
  },
  {
    title: "Mortgage",
    description: "Track mortgage payments, rates, and financing documents.",
    icon: Home,
    link: "/documents",
    colorClass: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
  },
  {
    title: "Insurance",
    description: "Manage policies, claims, and coverage details securely.",
    icon: ShieldCheck,
    link: "/documents",
    colorClass: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400"
  },
  {
    title: "Hawk Monitoring",
    description: "Integrate security cameras and property monitoring systems.",
    icon: Eye,
    link: "/image-gallery",
    colorClass: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400"
  },
  {
    title: "Vendor Management",
    description: "Directory of trusted contractors, plumbers, and electricians.",
    icon: Users,
    link: "/bills",
    colorClass: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
  },
  {
    title: "Next Home Finder",
    description: "Analyze markets and find your next investment property.",
    icon: Search,
    link: "/properties",
    colorClass: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400"
  },
  {
    title: "Document Vault",
    description: "Secure cloud storage for leases, deeds, and warranties.",
    icon: FolderOpen,
    link: "/documents",
    colorClass: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
  }
];

const DashboardPage = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Dashboard - CasaCEO</title>
      </Helmet>

      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        
        <DashboardSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-slate-600"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
                Command Center
              </h2>
            </div>
            
            <div className="flex-shrink-0">
              <PropertySelector 
                selectedPropertyId={selectedPropertyId}
                onSelectProperty={setSelectedPropertyId}
              />
            </div>
          </header>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              
              <DashboardOverview selectedPropertyId={selectedPropertyId} />

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Platform Offerings</h2>
                <p className="text-slate-500 dark:text-slate-400">Select a module to manage specific aspects of your portfolio.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                {offeringsData.map((offering, index) => (
                  <OfferingCard 
                    key={index}
                    title={offering.title}
                    description={offering.description}
                    icon={offering.icon}
                    link={offering.link}
                    colorClass={offering.colorClass}
                  />
                ))}
              </div>

            </div>
          </div>
        </main>

      </div>
    </>
  );
};

export default DashboardPage;