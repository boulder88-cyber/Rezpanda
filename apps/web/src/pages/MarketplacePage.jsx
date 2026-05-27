import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Search, Star, MapPin, Phone, ChevronRight, X, Plus,
  Zap, Droplets, Flame, Home, TreePine, Sparkles,
  Wrench, Hammer, CheckCircle2, Clock, DollarSign,
  ArrowRight, Send, Package
} from 'lucide-react';

const CATEGORIES = [
  { key: 'hvac', label: 'HVAC', icon: Zap, color: '#2563eb', bg: '#eff6ff' },
  { key: 'plumbing', label: 'Plumbing', icon: Droplets, color: '#0891b2', bg: '#ecfeff' },
  { key: 'electrical', label: 'Electrical', icon: Flame, color: '#d97706', bg: '#fffbeb' },
  { key: 'roofing', label: 'Roofing', icon: Home, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'landscaping', label: 'Landscaping', icon: TreePine, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'cleaning', label: 'Cleaning', icon: Sparkles, color: '#0ea5e9', bg: '#f0f9ff' },
  { key: 'renovation', label: 'Renovation', icon: Hammer, color: '#e8604c', bg: '#fdf0ee' },
  { key: 'handyman', label: 'Handyman', icon: Wrench, color: '#64748b', bg: '#f8fafc' },
];

const VENDORS = [
  { id: 1, name: 'Johnson & Miller HVAC', category: 'hvac', rating: 4.9, reviews: 124, location: 'St. Simons Island, GA', phone: '(912) 555-0101', specialty: 'Residential HVAC Installation & Repair', badge: 'Top Rated', price: '$$', available: true },
  { id: 2, name: 'Coastal Plumbing Co.', category: 'plumbing', rating: 4.7, reviews: 89, location: 'Brunswick, GA', phone: '(912) 555-0202', specialty: 'Residential & Commercial Plumbing', badge: 'Verified', price: '$$', available: true },
  { id: 3, name: 'Bright Electric GA', category: 'electrical', rating: 4.8, reviews: 67, location: 'St. Simons Island, GA', phone: '(912) 555-0303', specialty: 'Licensed Residential Electricians', badge: 'Top Rated', price: '$$$', available: false },
  { id: 4, name: 'AtlantaRoof Pro', category: 'roofing', rating: 4.6, reviews: 43, location: 'Golden Isles, GA', phone: '(912) 555-0404', specialty: 'Roof Replacement & Inspection', badge: 'Verified', price: '$$$', available: true },
  { id: 5, name: 'Green Thumb Landscaping', category: 'landscaping', rating: 4.9, reviews: 201, location: 'St. Simons Island, GA', phone: '(912) 555-0505', specialty: 'Full Landscape Design & Maintenance', badge: 'Top Rated', price: '$$', available: true },
  { id: 6, name: 'Sparkling Clean Services', category: 'cleaning', rating: 4.8, reviews: 156, location: 'Golden Isles, GA', phone: '(912) 555-0606', specialty: 'Deep Clean & Regular Housekeeping', badge: 'Verified', price: '$', available: true },
  { id: 7, name: 'Golden Isles Renovation', category: 'renovation', rating: 4.7, reviews: 38, location: 'Brunswick, GA', phone: '(912) 555-0707', specialty: 'Kitchen & Bath Remodeling', badge: 'Verified', price: '$$$', available: true },
  { id: 8, name: 'Fix-It Fast Handyman', category: 'handyman', rating: 4.5, reviews: 92, location: 'St. Simons Island, GA', phone: '(912) 555-0808', specialty: 'General Repairs & Odd Jobs', badge: null, price: '$', available: true },
];

const JOBS = [
  { id: 1, vendor: 'Johnson & Miller HVAC', service: 'HVAC Annual Service', status: 'completed', date: 'May 15, 2026', cost: 285 },
  { id: 2, vendor: 'Green Thumb Landscaping', service: 'Spring Lawn Fertilization', status: 'completed', date: 'May 10, 2026', cost: 180 },
  { id: 3, vendor: 'AtlantaRoof Pro', service: 'Roof Inspection', status: 'scheduled', date: 'Jun 15, 2026', cost: 175 },
];

const QuoteModal = ({ vendor, onClose }) => {
  const [form, setForm] = useState({ service: '', details: '', date: '', budget: '' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="font-semibold text-white" style={{ fontSize: '16px' }}>Request a Quote</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{vendor.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sent ? (
            <div className="text-center" style={{ padding: '28px 0' }}>
              <CheckCircle2 style={{ width: '40px', height: '40px', color: '#059669', margin: '0 auto 12px' }} />
              <p className="font-semibold text-slate-900" style={{ fontSize: '17px', marginBottom: '6px' }}>Quote request sent!</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>You'll hear back within 24 hours.</p>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Service Needed</label>
                <input value={form.service} onChange={e => set('service', e.target.value)} placeholder="e.g. HVAC filter change + inspection"
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Details</label>
                <textarea value={form.details} onChange={e => set('details', e.target.value)} placeholder="Any additional context..."
                  style={{ width: '100%', height: '80px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Preferred Date</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Budget</label>
                  <input placeholder="e.g. $200–$400" value={form.budget} onChange={e => set('budget', e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} style={{ flex: 1, height: '40px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setSent(true)} style={{ flex: 1, height: '40px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Send style={{ width: '13px', height: '13px' }} /> Send Request
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const VendorCard = ({ vendor, onQuote }) => {
  const cat = CATEGORIES.find(c => c.key === vendor.category);
  const Icon = cat?.icon || Wrench;
  return (
    <div className="bg-white hover:shadow-md transition-all" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: '20px', height: '20px', color: cat?.color }} />
          </div>
          <div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{vendor.name}</p>
            <p style={{ fontSize: '12px', color: cat?.color, fontWeight: 600 }}>{cat?.label}</p>
          </div>
        </div>
        {vendor.badge && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: vendor.badge === 'Top Rated' ? '#059669' : '#1e3a5f', background: vendor.badge === 'Top Rated' ? '#ecfdf5' : '#eef2f8', padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>
            {vendor.badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>{vendor.specialty}</p>
      <div className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
        <div className="flex items-center gap-1">
          <Star style={{ width: '13px', height: '13px', color: '#f59e0b', fill: '#f59e0b' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{vendor.rating}</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>({vendor.reviews})</span>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>·</span>
        <div className="flex items-center gap-1">
          <MapPin style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{vendor.location}</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginLeft: 'auto' }}>{vendor.price}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onQuote(vendor)} style={{ flex: 1, height: '34px', borderRadius: '9px', background: '#1e3a5f', color: 'white', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <Send style={{ width: '12px', height: '12px' }} /> Request Quote
        </button>
        <a href={`tel:${vendor.phone}`} style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Phone style={{ width: '13px', height: '13px', color: '#64748b' }} />
        </a>
      </div>
    </div>
  );
};

const MarketplacePage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [quotingVendor, setQuotingVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');

  const filtered = VENDORS.filter(v => {
    const matchCat = activeCategory === 'all' || v.category === activeCategory;
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.specialty.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <Helmet><title>HomeOS Marketplace — Find Service Providers</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/dashboard" className="hover:text-slate-600">Dashboard</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Marketplace</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>HomeOS Marketplace</h1>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Vetted service providers · Instant quotes · Receipts auto-saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '5px', marginBottom: '24px' }}>
          {[{ key: 'browse', label: '🔍 Browse Vendors' }, { key: 'jobs', label: '📋 My Jobs' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="font-medium rounded-xl transition-all"
              style={{ padding: '7px 16px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b', border: 'none', cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <>
            {/* Search */}
            <div className="relative" style={{ marginBottom: '20px' }}>
              <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors by name or specialty…"
                style={{ width: '100%', height: '44px', paddingLeft: '42px', paddingRight: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }} />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2" style={{ marginBottom: '24px' }}>
              <button onClick={() => setActiveCategory('all')} style={{ padding: '6px 14px', borderRadius: '999px', border: `1px solid ${activeCategory === 'all' ? '#1e3a5f' : '#e2e8f0'}`, background: activeCategory === 'all' ? '#1e3a5f' : 'white', color: activeCategory === 'all' ? 'white' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                All ({VENDORS.length})
              </button>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const count = VENDORS.filter(v => v.category === cat.key).length;
                return (
                  <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                    style={{ padding: '6px 14px', borderRadius: '999px', border: `1px solid ${activeCategory === cat.key ? cat.color : '#e2e8f0'}`, background: activeCategory === cat.key ? cat.color : 'white', color: activeCategory === cat.key ? 'white' : '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon style={{ width: '12px', height: '12px' }} /> {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(vendor => <VendorCard key={vendor.id} vendor={vendor} onQuote={setQuotingVendor} />)}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center" style={{ padding: '40px', color: '#94a3b8', fontSize: '15px' }}>
                  No vendors found. Try a different search or category.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {JOBS.map(job => (
              <div key={job.id} className="bg-white flex items-center gap-4" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: job.status === 'completed' ? '#ecfdf5' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {job.status === 'completed'
                    ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669' }} />
                    : <Clock style={{ width: '18px', height: '18px', color: '#d97706' }} />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{job.service}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{job.vendor} · {job.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800" style={{ fontSize: '14px' }}>${job.cost}</p>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: job.status === 'completed' ? '#059669' : '#d97706', background: job.status === 'completed' ? '#ecfdf5' : '#fffbeb', padding: '1px 7px', borderRadius: '999px' }}>
                    {job.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      {quotingVendor && <QuoteModal vendor={quotingVendor} onClose={() => setQuotingVendor(null)} />}
    </>
  );
};

export default MarketplacePage;
