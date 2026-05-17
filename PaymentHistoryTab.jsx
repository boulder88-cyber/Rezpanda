import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { 
  Search, Zap, Flame, Droplet, Wifi, Phone, Trash2, 
  Building2, Bug, Shield, ExternalLink, AlertCircle, 
  Loader2, Info, Plus, ArrowLeft
} from 'lucide-react';

const CATEGORY_CONFIG = {
  'Electric': { icon: Zap, tileClass: 'category-tile-electric', textClass: 'text-yellow-600 dark:text-yellow-500' },
  'Gas': { icon: Flame, tileClass: 'category-tile-gas', textClass: 'text-orange-600 dark:text-orange-500' },
  'Water': { icon: Droplet, tileClass: 'category-tile-water', textClass: 'text-blue-600 dark:text-blue-500' },
  'Internet/Cable': { icon: Wifi, tileClass: 'category-tile-internet', textClass: 'text-purple-600 dark:text-purple-500' },
  'Phone': { icon: Phone, tileClass: 'category-tile-phone', textClass: 'text-pink-600 dark:text-pink-500' },
  'Trash/Recycling': { icon: Trash2, tileClass: 'category-tile-trash', textClass: 'text-green-600 dark:text-green-500' },
  'Pest Control': { icon: Bug, tileClass: 'category-tile-pest', textClass: 'text-amber-800 dark:text-amber-600' },
  'Security': { icon: Shield, tileClass: 'category-tile-security', textClass: 'text-slate-600 dark:text-slate-400' },
  'Other': { icon: Building2, tileClass: 'category-tile-other', textClass: 'text-slate-500 dark:text-slate-400' }
};

const UtilityCompanyListing = forwardRef(({ onSelectCompany }, ref) => {
  const { currentUser } = useAuth();
  
  const [allCompanies, setAllCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [externalCompany, setExternalCompany] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch all from global utility_companies directory
      const utilResult = await pb.collection('utility_companies').getFullList({
        batch: 500,
        sort: 'name',
        $autoCancel: false
      });

      // 2. Fetch all from user's personal service_companies
      let serviceResult = { items: [] };
      if (currentUser) {
        serviceResult = await pb.collection('service_companies').getList(1, 500, {
          filter: `ownerId="${currentUser.id}"`,
          sort: 'companyName',
          $autoCancel: false
        });
      }

      // Combine and deduplicate
      const uniqueCompanies = [];
      const seenNames = new Set();

      // Add user's custom service companies first
      for (const company of serviceResult.items) {
        if (!seenNames.has(company.companyName)) {
          seenNames.add(company.companyName);
          uniqueCompanies.push({
            id: company.id,
            name: company.companyName,
            category: 'Other', // Fallback category for custom entries
            payment_portal_url: company.paymentLink,
            isCustom: true
          });
        }
      }

      // Add global utility companies
      for (const company of utilResult) {
        if (!seenNames.has(company.name)) {
          seenNames.add(company.name);
          uniqueCompanies.push(company);
        }
      }

      setAllCompanies(uniqueCompanies);
    } catch (err) {
      console.error("Error fetching utility companies:", err);
      setError(err.message || "Failed to load providers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchCompanies();
    }
  }));

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts = {};
    Object.keys(CATEGORY_CONFIG).forEach(cat => counts[cat] = 0);
    
    allCompanies.forEach(company => {
      const cat = company.category || 'Other';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts['Other']++;
      }
    });
    
    return counts;
  }, [allCompanies]);

  // Filter companies based on selected category and search query
  const displayedCompanies = useMemo(() => {
    return allCompanies.filter(company => {
      const matchesCategory = selectedCategory 
        ? (company.category === selectedCategory || (!company.category && selectedCategory === 'Other'))
        : true;
        
      const matchesSearch = searchQuery.trim() === '' 
        ? true 
        : (company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (company.category || '').toLowerCase().includes(searchQuery.toLowerCase()));
           
      return matchesCategory && matchesSearch;
    });
  }, [allCompanies, selectedCategory, searchQuery]);

  const handleContinueToExternal = () => {
    if (externalCompany?.payment_portal_url) {
      let url = externalCompany.payment_portal_url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setExternalCompany(null);
  };

  const showCategories = !selectedCategory && !searchQuery;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-slate-50/50 dark:bg-slate-950 z-10 pb-6 space-y-4 backdrop-blur-md">
        <div className="relative max-w-2xl mx-auto w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder={selectedCategory ? `Search ${selectedCategory} providers...` : "Search by company name or category..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 text-lg rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div className="flex-1 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 max-w-2xl mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Connection Error</h3>
            <p className="text-red-600/80 dark:text-red-400/80 max-w-md mb-6">
              {error}
            </p>
            <Button onClick={fetchCompanies} variant="outline" className="bg-white dark:bg-slate-900 rounded-xl">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Try Again
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {showCategories ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {Object.entries(CATEGORY_CONFIG).map(([category, config], index) => {
                  const Icon = config.icon;
                  const count = categoryCounts[category] || 0;
                  
                  return (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex flex-col items-center justify-center p-8 rounded-3xl hover-card-effect group relative overflow-hidden ${config.tileClass}`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Icon className="w-16 h-16 mb-5 text-white drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" />
                      <span className="font-bold text-2xl text-white text-center mb-3 drop-shadow-sm tracking-tight">{category}</span>
                      <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1 text-sm font-medium">
                        {count} {count === 1 ? 'provider' : 'providers'}
                      </Badge>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="companies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {selectedCategory && (
                  <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setSelectedCategory(null);
                          setSearchQuery('');
                        }} 
                        className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                      </Button>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                      <div className="flex items-center gap-2">
                        {React.createElement(CATEGORY_CONFIG[selectedCategory]?.icon || Building2, {
                          className: `w-6 h-6 ${CATEGORY_CONFIG[selectedCategory]?.textClass || 'text-slate-500'}`
                        })}
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCategory}</h2>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 text-sm">
                      {displayedCompanies.length} found
                    </Badge>
                  </div>
                )}

                {displayedCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedCompanies.map((company, index) => {
                      const config = CATEGORY_CONFIG[company.category] || CATEGORY_CONFIG['Other'];
                      const Icon = config.icon;

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          key={company.id}
                          className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group text-left"
                        >
                          <div 
                            className="flex items-center gap-4 overflow-hidden flex-1 cursor-pointer"
                            onClick={() => setExternalCompany(company)}
                          >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${config.tileClass} shadow-inner`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors text-lg">
                                  {company.name}
                                </h4>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!selectedCategory && (
                                  <Badge variant="secondary" className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                    {company.category || 'Other'}
                                  </Badge>
                                )}
                                {company.isCustom && (
                                  <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary shrink-0">
                                    Custom
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors ml-auto">
                                  <ExternalLink className="w-4 h-4" />
                                  <span className="truncate font-medium">Portal</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 ml-4 pl-4 border-l border-slate-100 dark:border-slate-800">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="rounded-full w-10 h-10 bg-slate-50 hover:bg-primary hover:text-white dark:bg-slate-800 dark:hover:bg-primary text-slate-700 dark:text-slate-300 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCompany(company);
                              }}
                              title="Add to my providers"
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 border-dashed dark:border-slate-800 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No providers found</h3>
                    <p className="text-slate-500 text-lg max-w-md mb-8">
                      We couldn't find any utility companies matching your search. You can still add them manually.
                    </p>
                    <Button 
                      onClick={() => onSelectCompany({ category: selectedCategory || 'Other' })} 
                      size="lg" 
                      className="rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Custom Provider
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <Dialog open={!!externalCompany} onOpenChange={(open) => !open && setExternalCompany(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              Connecting...
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              You're now leaving Rezpanda and connecting directly to <strong className="text-slate-900 dark:text-white">{externalCompany?.name}</strong>. 
              You'll be able to log in, view your bills, download history, and make payments directly on their site.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button variant="outline" onClick={() => setExternalCompany(null)} className="w-full sm:w-auto rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleContinueToExternal} className="w-full sm:w-auto rounded-xl shadow-md">
              Continue to Portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

UtilityCompanyListing.displayName = 'UtilityCompanyListing';

export default UtilityCompanyListing;