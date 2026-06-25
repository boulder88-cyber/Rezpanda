import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Search, Zap, Flame, Droplet, Wifi, Phone, Trash2,
  Building2, Bug, Shield, ExternalLink, AlertCircle,
  Loader2, Plus, ArrowLeft, X, ChevronRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROVIDER DIRECTORY (formerly "utility company listing")
//
// A browse-and-connect catalog. Two sources, merged and de-duped by name:
//   1. The global `utility_companies` directory (the shared national catalog).
//   2. This user's own `vendors` (their known billers — vendors is the stable
//      biller entity, one record per biller, so each appears once here).
//
// Tapping a provider offers to open its payment portal in a new tab. The "+"
// hands the provider up to the parent (onSelectCompany) to prefill the add-bill
// form. Both behaviours and the company-object shape are unchanged from the
// original — this pass only brought the file onto the navy/gold design system
// and fixed the leftover "Rezpanda" brand reference and "utility" labels.
// ═══════════════════════════════════════════════════════════════════════

// Design-system tokens (inline-style discipline — no Tailwind palette drift).
const NAVY = '#1e3a5f';
const INK = '#1f2733';
const INK_SOFT = '#5b6472';
const INK_MUTE = '#95a0ae';
const PAGE = '#faf8f4';
const BORDER = '#e9e4db';
const PALE_NAVY = '#eef4fb';
const NAVY_BORDER = '#cdddef';

// Each category renders with a navy icon tile — one calm family, not a rainbow.
// (The icon distinguishes categories; color stays on-brand.)
const CATEGORY_CONFIG = {
  'Electric': { icon: Zap },
  'Gas': { icon: Flame },
  'Water': { icon: Droplet },
  'Internet/Cable': { icon: Wifi },
  'Phone': { icon: Phone },
  'Trash/Recycling': { icon: Trash2 },
  'Pest Control': { icon: Bug },
  'Security': { icon: Shield },
  'Other': { icon: Building2 },
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

      // 2. Fetch this user's known billers from their personal vendors.
      //    Vendors is the stable biller entity (one per biller), so each shows
      //    up once here — unlike invoices, which would repeat a biller monthly.
      let serviceResult = { items: [] };
      if (currentUser) {
        serviceResult = await pb.collection('vendors').getList(1, 500, {
          filter: `ownerId="${currentUser.id}"`,
          sort: 'name',
          $autoCancel: false
        });
      }

      // Combine and deduplicate
      const uniqueCompanies = [];
      const seenNames = new Set();

      // Add user's own vendors first
      for (const company of serviceResult.items) {
        if (!seenNames.has(company.name)) {
          seenNames.add(company.name);
          uniqueCompanies.push({
            id: company.id,
            name: company.name,
            category: 'Other', // Vendors carry no category; Other is the honest fallback
            payment_portal_url: company.payUrl,
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
      console.error("Error fetching providers:", err);
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

  // ── Shared inline styles ────────────────────────────────────────────────
  const iconTile = (size) => ({
    width: size, height: size, borderRadius: '12px', background: NAVY,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Search */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, paddingBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: INK_MUTE }} />
          <input
            type="text"
            placeholder={selectedCategory ? `Search ${selectedCategory} providers...` : "Search by company name or category..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px 12px 42px', fontSize: '15px', color: INK,
              background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '8px',
              outline: 'none', boxShadow: '0 1px 2px rgba(31,39,51,0.04)',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ height: '128px', background: '#f1ede6', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', maxWidth: '640px', margin: '0 auto' }}>
            <AlertCircle style={{ width: '40px', height: '40px', color: '#dc2626', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#b91c1c', marginBottom: '6px' }}>Connection error</h3>
            <p style={{ color: '#dc2626', maxWidth: '420px', marginBottom: '20px', fontSize: '14px' }}>{error}</p>
            <button onClick={fetchCompanies}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: 500, color: INK, cursor: 'pointer' }}>
              <Loader2 style={{ width: '15px', height: '15px' }} />
              Try again
            </button>
          </div>
        ) : showCategories ? (
          // ── Category list — compact rows, not a wall of tiles ──
          <div style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(31,39,51,0.06)' }}>
            {Object.entries(CATEGORY_CONFIG).map(([category, config], i, arr) => {
              const Icon = config.icon;
              const count = categoryCounts[category] || 0;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '12px 16px', background: '#fff', border: 'none', cursor: 'pointer',
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = PAGE; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: PALE_NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '18px', height: '18px', color: NAVY }} />
                  </div>
                  <span style={{ fontWeight: 500, fontSize: '15px', color: INK, flex: 1 }}>{category}</span>
                  <span style={{ fontSize: '13px', color: INK_MUTE }}>{count}</span>
                  <ChevronRight style={{ width: '16px', height: '16px', color: INK_MUTE, flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        ) : (
          // ── Company list (a category is selected, or a search is active) ──
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            {selectedCategory && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(31,39,51,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: INK_SOFT, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, padding: '4px' }}
                  >
                    <ArrowLeft style={{ width: '16px', height: '16px' }} />
                    Back
                  </button>
                  <div style={{ height: '24px', width: '1px', background: BORDER }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {React.createElement(CATEGORY_CONFIG[selectedCategory]?.icon || Building2, { style: { width: '20px', height: '20px', color: NAVY } })}
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: INK }}>{selectedCategory}</h2>
                  </div>
                </div>
                <span style={{ fontSize: '13px', color: INK_MUTE, background: PAGE, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '4px 10px' }}>
                  {displayedCompanies.length} found
                </span>
              </div>
            )}

            {displayedCompanies.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
                {displayedCompanies.map((company) => {
                  const config = CATEGORY_CONFIG[company.category] || CATEGORY_CONFIG['Other'];
                  const Icon = config.icon;
                  return (
                    <div
                      key={company.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: '#fff', boxShadow: '0 1px 3px rgba(31,39,51,0.06)', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(31,39,51,0.10)'; e.currentTarget.style.borderColor = NAVY_BORDER; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(31,39,51,0.06)'; e.currentTarget.style.borderColor = BORDER; }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden', flex: 1, cursor: 'pointer' }}
                        onClick={() => setExternalCompany(company)}
                      >
                        <div style={iconTile('48px')}>
                          <Icon style={{ width: '24px', height: '24px', color: '#fff' }} />
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <h4 style={{ fontWeight: 600, fontSize: '15px', color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                            {company.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!selectedCategory && (
                              <span style={{ fontSize: '11px', fontWeight: 500, background: PAGE, color: INK_SOFT, border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '2px 8px', flexShrink: 0 }}>
                                {company.category || 'Other'}
                              </span>
                            )}
                            {company.isCustom && (
                              <span style={{ fontSize: '11px', fontWeight: 500, background: PALE_NAVY, color: NAVY, border: `1px solid ${NAVY_BORDER}`, borderRadius: '6px', padding: '2px 8px', flexShrink: 0 }}>
                                Yours
                              </span>
                            )}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: INK_MUTE, marginLeft: 'auto' }}>
                              <ExternalLink style={{ width: '14px', height: '14px' }} />
                              Portal
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ flexShrink: 0, marginLeft: '14px', paddingLeft: '14px', borderLeft: `1px solid ${BORDER}` }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectCompany(company); }}
                          title="Add to my bills"
                          style={{ width: '38px', height: '38px', borderRadius: '50%', background: PAGE, border: `1px solid ${BORDER}`, color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = PAGE; e.currentTarget.style.color = NAVY; }}
                        >
                          <Plus style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: `1px dashed ${BORDER}` }}>
                <div style={{ width: '64px', height: '64px', background: PAGE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Search style={{ width: '30px', height: '30px', color: INK_MUTE }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: INK, marginBottom: '8px' }}>No providers found</h3>
                <p style={{ color: INK_SOFT, maxWidth: '380px', marginBottom: '24px', fontSize: '14px' }}>
                  We couldn't find a provider matching your search. You can still add it manually.
                </p>
                <button
                  onClick={() => onSelectCompany({ category: selectedCategory || 'Other' })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: NAVY, color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(31,39,51,0.10)' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Add custom provider
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaving-CasaCEO confirmation */}
      {externalCompany && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(31,39,51,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}
          onClick={() => setExternalCompany(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(31,39,51,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: PALE_NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExternalLink style={{ width: '20px', height: '20px', color: NAVY }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: INK }}>Opening {externalCompany?.name}</h3>
              </div>
              <button onClick={() => setExternalCompany(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: INK_MUTE, padding: '4px' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <p style={{ color: INK_SOFT, fontSize: '15px', lineHeight: 1.55, marginBottom: '24px' }}>
              You're leaving CasaCEO to connect directly with <strong style={{ color: INK }}>{externalCompany?.name}</strong>. On their site you can log in, view your bills, download history, and make payments.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setExternalCompany(null)}
                style={{ background: '#fff', border: `1px solid ${BORDER}`, color: INK_SOFT, borderRadius: '8px', padding: '9px 16px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleContinueToExternal}
                style={{ background: NAVY, color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(31,39,51,0.10)' }}
              >
                Continue to portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

UtilityCompanyListing.displayName = 'UtilityCompanyListing';

export default UtilityCompanyListing;
