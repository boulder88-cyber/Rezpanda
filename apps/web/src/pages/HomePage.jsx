import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Plus, 
  ArrowRight,
  Building,
  CreditCard,
  Building2,
  FileText,
  LineChart,
  Shield,
  Wrench,
  Landmark,
  TreePine,
  Receipt,
  ArrowLeftRight
} from 'lucide-react';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const records = await pb.collection('properties').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setProperties(records.items);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast({
          title: "Error",
          description: "Failed to load properties. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentUser, toast]);

  const handleAddProperty = () => {
    toast({
      title: "Add Property",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const handlePropertyClick = (property) => {
    toast({
      title: "Property Selected",
      description: `Navigating to dashboard for ${property.address}... 🚧 (Routing to be implemented)`
    });
  };

  // Shared card styling for perfect consistency across all dashboard topic sections
  const dashboardCardClass = "bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full min-h-[320px] transition-all hover:shadow-md hover:border-[hsl(var(--primary-blue))/0.3]";

  return (
    <>
      <Helmet>
        <title>Dashboard - CasaCEO</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Select a property from your portfolio to view its dashboard, manage tenants, and track finances.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-0 overflow-hidden shadow-sm">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center shadow-sm max-w-3xl mx-auto mt-8">
              <div className="w-20 h-20 bg-[hsl(var(--primary-blue))/0.1] rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-10 h-10 text-[hsl(var(--primary-blue))]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">No properties found</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                You haven't added any properties to your portfolio yet. Add your first property to start managing it with CasaCEO.
              </p>
              <Button 
                onClick={handleAddProperty} 
                size="lg" 
                className="bg-[hsl(var(--primary-blue))] hover:bg-[hsl(var(--accent-blue))] text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <>
              {/* Everything You Need to Succeed Dashboard */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Everything You Need to Succeed</h2>
                
                {/* 11 Topics Grid in Alphabetical Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch mb-8">
                  
                  {/* 1. Centralized Bill Pay */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Centralized Bill Pay</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Manage and pay all your property-related bills, utilities, and services from a single, secure dashboard.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => navigate('/bills')}>
                      Manage Bills
                    </Button>
                  </div>

                  {/* 2. Centralized Property Management */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">Centralized Property Management</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">View and manage your entire real estate portfolio from a single, intuitive dashboard.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => toast({title: 'Properties', description: 'Scroll down to view your properties.'})}>
                      View Portfolio
                    </Button>
                  </div>

                  {/* 3. Document Management */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Document Management</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Organize and store all your property documents securely in one place.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => navigate('/documents')}>
                      View Documents
                    </Button>
                  </div>

                  {/* 4. Financial Insights */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <LineChart className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Financial Insights</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Monitor expenses, track utility bills, and generate comprehensive financial reports.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => navigate('/expenses')}>
                      View Finances
                    </Button>
                  </div>

                  {/* 5. Insurance Hawk */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Insurance Hawk</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Monitor insurance policies, track expiration dates, and ensure continuous coverage for all your assets.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => toast({title: 'Coming Soon', description: 'Insurance tracking will be available here.'})}>
                      Manage Insurance
                    </Button>
                  </div>

                  {/* 6. Maintenance Scheduling */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                        <Wrench className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Maintenance Scheduling</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Log maintenance requests, track progress, and schedule recurring system check-ups.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => navigate('/maintenance')}>
                      Schedule Maintenance
                    </Button>
                  </div>

                  {/* 7. Mortgage */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                        <Landmark className="w-6 h-6 text-rose-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Mortgage</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Track mortgage balances, interest rates, and payment schedules across your entire portfolio effortlessly.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => toast({title: 'Coming Soon', description: 'Mortgage tracking will be available here.'})}>
                      View Mortgages
                    </Button>
                  </div>

                  {/* 8. Next Home Finder */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-sky-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Next Home Finder</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Discover and evaluate potential new investment properties tailored to your portfolio strategy.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => toast({title: 'Coming Soon', description: 'Property finder will be available here.'})}>
                      Find Properties
                    </Button>
                  </div>

                  {/* 9. Scheduled Landscape */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                        <TreePine className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Scheduled Landscape</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Automate and track landscaping services to keep your properties looking pristine year-round.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => navigate('/plants')}>
                      Manage Landscaping
                    </Button>
                  </div>

                  {/* 10. Tax Reporting */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                        <Receipt className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Tax Reporting</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Easily manage property taxes, track deductible expenses, and generate comprehensive tax reports for tax season.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => toast({title: 'Coming Soon', description: 'Tax reporting will be available here.'})}>
                      Generate Reports
                    </Button>
                  </div>

                  {/* 11. Vendor Side by Side */}
                  <div className={dashboardCardClass}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <ArrowLeftRight className="w-6 h-6 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Vendor Side by Side</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <p className="text-slate-600 mb-4">Compare vendor quotes, services, and ratings side-by-side to make informed hiring decisions.</p>
                    </div>
                    <Button variant="outline" className="mt-6 w-full border-slate-200 hover:bg-slate-50" onClick={() => toast({title: 'Coming Soon', description: 'Vendor comparison will be available here.'})}>
                      Compare Vendors
                    </Button>
                  </div>

                </div>
              </div>

              {/* Properties Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Your Properties</h2>
                  <Button 
                    onClick={handleAddProperty}
                    variant="ghost"
                    className="text-[hsl(var(--primary-blue))] hover:text-[hsl(var(--accent-blue))] hover:bg-[hsl(var(--primary-blue))/0.1]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property) => (
                    <div 
                      key={property.id}
                      onClick={() => handlePropertyClick(property)}
                      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary-blue))/0.4] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                    >
                      {/* Property Image / Placeholder */}
                      <div className="h-52 bg-slate-100 relative overflow-hidden">
                        {property.photo ? (
                          <img 
                            src={pb.files.getUrl(property, property.photo)} 
                            alt={property.address}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                            <Home size={64} strokeWidth={1.5} />
                          </div>
                        )}
                        
                        {/* Status/Type Badge */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 shadow-sm capitalize tracking-wide">
                          {property.propertyType || 'Property'}
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-start gap-3 line-clamp-2 leading-tight">
                          <MapPin className="w-6 h-6 text-[hsl(var(--primary-blue))] shrink-0 mt-0.5" />
                          {property.address}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-slate-600 text-sm font-medium">
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <Bed className="w-4 h-4 text-slate-400" /> 
                            {property.bedrooms || 0} Beds
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <Bath className="w-4 h-4 text-slate-400" /> 
                            {property.bathrooms || 0} Baths
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <Square className="w-4 h-4 text-slate-400" /> 
                            {property.squareFootage || 0} sqft
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg text-slate-900 font-bold">
                            <DollarSign className="w-4 h-4 text-emerald-500" /> 
                            ${property.rentPrice?.toLocaleString() || 0}/mo
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[hsl(var(--primary-blue))] font-semibold group-hover:text-[hsl(var(--accent-blue))] transition-colors flex items-center gap-2">
                            Manage Property
                          </span>
                          <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary-blue))/0.1] flex items-center justify-center group-hover:bg-[hsl(var(--primary-blue))] group-hover:text-white text-[hsl(var(--primary-blue))] transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default HomePage;