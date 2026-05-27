import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Search, Star, MapPin, Phone, ExternalLink, X,
  Wind, Droplets, Zap, Shield, TreePine, Sparkles,
  Wrench, Bug, Refrigerator, Paintbrush, Grid, Waves,
  CheckCircle2, ArrowRight, BookOpen, AlertTriangle,
  Calendar, DollarSign, Clock, ChevronDown, Filter
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { name: 'HVAC', icon: Wind, color: '#0891b2', bg: '#ecfeff', sub: 'View vendors' },
  { name: 'Plumbing', icon: Droplets, color: '#2563eb', bg: '#eff6ff', sub: 'View vendors' },
  { name: 'Electrical', icon: Zap, color: '#d97706', bg: '#fffbeb', sub: 'View vendors' },
  { name: 'Roofing', icon: Home, color: '#dc2626', bg: '#fef2f2', sub: 'View vendors' },
  { name: 'Landscaping', icon: TreePine, color: '#16a34a', bg: '#f0fdf4', sub: 'View vendors' },
  { name: 'Cleaning', icon: Sparkles, color: '#7c3aed', bg: '#f5f3ff', sub: 'View vendors' },
  { name: 'Handyman', icon: Wrench, color: '#f97316', bg: '#fff7ed', sub: 'View vendors' },
  { name: 'Pest Control', icon: Bug, color: '#65a30d', bg: '#f7fee7', sub: 'View vendors' },
  { name: 'Appliance Repair', icon: Refrigerator, color: '#0369a1', bg: '#f0f9ff', sub: 'View vendors' },
  { name: 'Painting', icon: Paintbrush, color: '#db2777', bg: '#fdf2f8', sub: 'View vendors' },
  { name: 'Flooring', icon: Grid, color: '#92400e', bg: '#fef3c7', sub: 'View vendors' },
  { name: 'Windows & Doors', icon: Home, color: '#4f46e5', bg: '#eef2ff', sub: 'View vendors' },
  { name: 'Septic', icon: Droplets, color: '#059669', bg: '#ecfdf5', sub: 'View vendors' },
  { name: 'Pool Services', icon: Waves, color: '#0284c7', bg: '#f0f9ff', sub: 'View vendors' },
  { name: 'General Contractor', icon: Shield, color: '#1e3a5f', bg: '#eef2f8', sub: 'View vendors' },
];

const VENDORS = [
  {
    id: 1, name: 'Coastal Cooling & Heating', category: 'HVAC', rating: 4.9, reviews: 127,
    area: 'St. Simons Island, GA', licensed: true, insured: true,
    about: 'Serving the Golden Isles since 2003. Specializing in residential HVAC installation, repair, and seasonal maintenance.',
    services: ['AC Installation', 'Heating Repair', 'Duct Cleaning', 'Filter Replacement', 'Annual Tune-up'],
    featured: true, recommended: true, alertMatch: 'HVAC filter overdue by 30 days',
    phone: '(912) 555-0142', price: '$$',
  },
  {
    id: 2, name: 'Golden Isles Roofing', category: 'Roofing', rating: 4.8, reviews: 89,
    area: 'Brunswick, GA', licensed: true, insured: true,
    about: 'Expert residential roofing with 20+ years of experience. Free inspections and estimates.',
    services: ['Roof Inspection', 'Shingle Replacement', 'Full Roof Install', 'Storm Damage Repair', 'Gutter Installation'],
    featured: true, recommended: true, alertMatch: 'Roof nearing end of expected lifespan',
    phone: '(912) 555-0198', price: '$$$',
  },
  {
    id: 3, name: 'Island Lawn & Garden', category: 'Landscaping', rating: 4.7, reviews: 203,
    area: 'St. Simons Island, GA', licensed: true, insured: true,
    about: 'Full-service landscaping and lawn care for residential properties across the Golden Isles.',
    services: ['Weekly Mowing', 'Landscape Design', 'Irrigation', 'Tree Trimming', 'Seasonal Planting'],
    featured: true, recommended: false, alertMatch: null,
    phone: '(912) 555-0167', price: '$',
  },
  {
    id: 4, name: 'SSI Plumbing Pros', category: 'Plumbing', rating: 4.6, reviews: 74,
    area: 'St. Simons Island, GA', licensed: true, insured: true,
    about: 'Licensed master plumbers serving residential and light commercial clients.',
    services: ['Water Heater Install', 'Leak Repair', 'Pipe Replacement', 'Drain Cleaning', 'Fixture Install'],
    featured: false, recommended: true, alertMatch: 'Water heater past typical lifespan',
    phone: '(912) 555-0211', price: '$$',
  },
  {
    id: 5, name: 'Golden Isles Painting', category: 'Painting', rating: 4.8, reviews: 56,
    area: 'Brunswick, GA', licensed: true, insured: true,
    about: 'Interior and exterior painting with premium materials. No job too large or small.',
    services: ['Interior Painting', 'Exterior Painting', 'Deck Staining', 'Cabinet Refinishing', 'Touch-ups'],
    featured: false, recommended: false, alertMatch: null,
    phone: '(912) 555-0183', price: '$$',
  },
  {
    id: 6, name: 'Island Electric', category: 'Electrical', rating: 4.9, reviews: 112,
    area: 'St. Simons Island, GA', licensed: true, insured: true,
    about: 'Licensed electricians for residential work. Panel upgrades, EV chargers, and more.',
    services: ['Panel Upgrades', 'Outlet Installation', 'Lighting', 'EV Charger Install', 'Safety Inspection'],
    featured: true, recommended: false, alertMatch: null,
    phone: '(912) 555-0155', price: '$$',
  },
  {
    id: 7, name: 'Clean Sweep Pros', category: 'Cleaning', rating: 4.7, reviews: 318,
    area: 'St. Simons Island, GA', licensed: false, insured: true,
    about: 'Professional home cleaning with eco-friendly products. Regular and deep clean options.',
    services: ['Weekly Cleaning', 'Deep Clean', 'Move-in/out Clean', 'Post-renovation', 'Window Washing'],
    featured: false, recommended: false, alertMatch: null,
    phone: '(912) 555-0174', price: '$',
  },
  {
    id: 8, name: 'Coastal Handyman Services', category: 'Handyman', rating: 4.5, reviews: 91,
    area: 'Brunswick, GA', licensed: false, insured: true,
    about: 'Reliable handyman for small to medium repairs and home improvement projects.',
    services: ['Drywall Repair', 'Door Repairs', 'Furniture Assembly', 'Caulking', 'Gutter Cleaning'],
    featured: false, recommended: true, alertMatch: null,
    phone: '(912) 555-0199', price: '$',
  },
];

const SEASONAL = [
  { season: 'Spring', icon: TreePine, color: '#16a34a', bg: '#f0fdf4', tasks: ['Gutter cleaning', 'HVAC tune-up', 'Exterior inspection', 'Lawn fertilization'] },
  { season: 'Summer', icon: Wind, color: '#0891b2', bg: '#ecfeff', tasks: ['AC service', 'Pool maintenance', 'Pest control', 'Irrigation check'] },
  { season: 'Fall', icon: Home, color: '#d97706', bg: '#fffbeb', tasks: ['Roof inspection', 'Heating prep', 'Weatherization', 'Gutter cleaning'] },
  { season: 'Winter', icon: Zap, color: '#4f46e5', bg: '#eef2ff', tasks: ['Pipe insulation', 'Heating check', 'Storm prep', 'Generator test'] },
];

// ═══════════════════════════════════════════════════════════════════════
// ATOMIC COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const RatingStars = ({ rating, reviews }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <Star key={i} style={{ width: '12px', height: '12px', fill: i <= Math.round(rating) ? '#f59e0b' : 'none', color: i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1' }} />
    ))}
    <span className="font-semibold text-slate-900" style={{ fontSize: '13px', marginLeft: '2px' }}>{rating}</span>
    <span className="text-slate-400" style={{ fontSize: '12px' }}>({reviews})</span>
  </div>
);

const BookButton = ({ vendorName }) => (
  <button className="font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '8px 16px', fontSize: '13px' }}>
    Book Now
  </button>
);

// ═══════════════════════════════════════════════════════════════════════
// VENDOR PROFILE MODAL
// ═══════════════════════════════════════════════════════════════════════

const VendorProfileModal = ({ vendor, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-white w-full max-w-lg overflow-hidden" style={{ borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>

      {/* Header */}
      <div className="relative" style={{ background: '#1e3a5f', padding: '24px' }}>
        <button onClick={onClose} className="absolute top-4 right-4 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
          <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
        </button>
        <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
          <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)' }}>
            <Wrench style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <div>
            <h2 className="text-white font-semibold" style={{ fontSize: '20px' }}>{vendor.name}</h2>
            <p className="text-blue-200" style={{ fontSize: '13px' }}>{vendor.category}</p>
          </div>
        </div>
        <RatingStars rating={vendor.rating} reviews={vendor.reviews} />
      </div>

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Alert Match */}
        {vendor.alertMatch && (
          <div className="flex items-start gap-3 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
            <p className="text-amber-700 font-medium" style={{ fontSize: '13px' }}>Recommended for: {vendor.alertMatch}</p>
          </div>
        )}

        {/* About */}
        <div>
          <p className="font-semibold text-slate-900" style={{ fontSize: '14px', marginBottom: '8px' }}>About</p>
          <p className="text-slate-500" style={{ fontSize: '14px', lineHeight: '1.6' }}>{vendor.about}</p>
        </div>

        {/* Services */}
        <div>
          <p className="font-semibold text-slate-900" style={{ fontSize: '14px', marginBottom: '8px' }}>Services Offered</p>
          <div className="flex flex-wrap gap-2">
            {vendor.services.map((s, i) => (
              <span key={i} className="font-medium text-slate-600 bg-slate-100 rounded-xl" style={{ padding: '4px 10px', fontSize: '12px' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Service Area', value: vendor.area, icon: MapPin },
            { label: 'Price Range', value: vendor.price, icon: DollarSign },
            { label: 'Licensed', value: vendor.licensed ? 'Yes' : 'Not listed', icon: CheckCircle2 },
            { label: 'Insured', value: vendor.insured ? 'Yes' : 'Not listed', icon: Shield },
          ].map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={i} className="bg-slate-50 rounded-xl" style={{ padding: '12px' }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
                  <Icon style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
                  <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px' }}>{d.label}</p>
                </div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{d.value}</p>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 rounded-xl" style={{ background: '#f8fafc', padding: '12px' }}>
          <Phone style={{ width: '16px', height: '16px', color: '#1e3a5f' }} />
          <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{vendor.phone}</p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="w-full font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '14px', fontSize: '15px' }}>
            Book Service
          </button>
          <button className="w-full font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '12px', fontSize: '14px' }}>
            Add to My Vendors
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// VENDOR CARD
// ═══════════════════════════════════════════════════════════════════════

const VendorCard = ({ vendor, onViewProfile }) => (
  <div className="bg-white hover:shadow-md transition-all" style={{ borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
    {vendor.alertMatch && (
      <div className="flex items-center gap-1.5 rounded-lg" style={{ background: '#fffbeb', padding: '6px 10px', marginBottom: '12px' }}>
        <AlertTriangle style={{ width: '12px', height: '12px', color: '#f59e0b', flexShrink: 0 }} />
        <p className="text-amber-700 font-medium truncate" style={{ fontSize: '11px' }}>Matches alert: {vendor.alertMatch}</p>
      </div>
    )}
    <div className="flex items-start gap-3" style={{ marginBottom: '12px' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2f8' }}>
        <Wrench style={{ width: '20px', height: '20px', color: '#1e3a5f' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate" style={{ fontSize: '15px' }}>{vendor.name}</p>
        <p className="text-slate-400 font-medium" style={{ fontSize: '12px', marginTop: '2px' }}>{vendor.category}</p>
      </div>
      {vendor.licensed && (
        <span className="font-medium text-green-600 bg-green-100 rounded-full flex-shrink-0" style={{ padding: '2px 8px', fontSize: '11px' }}>Licensed</span>
      )}
    </div>

    <RatingStars rating={vendor.rating} reviews={vendor.reviews} />

    <div className="flex items-center gap-1 text-slate-400" style={{ fontSize: '12px', marginTop: '8px' }}>
      <MapPin style={{ width: '12px', height: '12px' }} />
      {vendor.area}
    </div>

    <div className="flex gap-2" style={{ marginTop: '16px' }}>
      <BookButton vendorName={vendor.name} />
      <button onClick={() => onViewProfile(vendor)} className="flex-1 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '8px', fontSize: '13px' }}>
        View Profile
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// VENDOR ROW
// ═══════════════════════════════════════════════════════════════════════

const VendorRow = ({ vendor, onViewProfile }) => (
  <div className="bg-white flex items-center gap-4 hover:shadow-sm transition-all" style={{ borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2f8' }}>
      <Wrench style={{ width: '18px', height: '18px', color: '#1e3a5f' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{vendor.name}</p>
      <div className="flex items-center gap-3" style={{ marginTop: '4px' }}>
        <span className="text-slate-400 font-medium" style={{ fontSize: '12px' }}>{vendor.category}</span>
        <RatingStars rating={vendor.rating} reviews={vendor.reviews} />
        <span className="text-slate-400 flex items-center gap-0.5" style={{ fontSize: '12px' }}>
          <MapPin style={{ width: '11px', height: '11px' }} /> {vendor.area}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <BookButton vendorName={vendor.name} />
      <button onClick={() => onViewProfile(vendor)} className="font-semibold text-slate-500 hover:text-slate-700 transition-colors" style={{ fontSize: '13px' }}>
        View Profile
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY CARD
// ═══════════════════════════════════════════════════════════════════════

const CategoryCard = ({ category, isActive, onClick }) => {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-center hover:shadow-md transition-all"
      style={{
        background: isActive ? category.color : 'white',
        borderRadius: '12px',
        padding: '16px 12px',
        border: `1px solid ${isActive ? category.color : '#e2e8f0'}`,
      }}
    >
      <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: isActive ? 'rgba(255,255,255,0.2)' : category.bg, marginBottom: '8px' }}>
        <Icon style={{ width: '18px', height: '18px', color: isActive ? 'white' : category.color }} />
      </div>
      <p className="font-semibold" style={{ fontSize: '12px', color: isActive ? 'white' : '#0f172a', lineHeight: '1.3' }}>{category.name}</p>
      <p style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '2px' }}>{category.sub}</p>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const VendorDirectoryPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const featured = VENDORS.filter(v => v.featured);
  const recommended = VENDORS.filter(v => v.recommended);

  const filtered = VENDORS.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || v.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <>
      <Helmet><title>Vendors & Services — CasaCEO</title></Helmet>
      <div className="min-h-screen bg-slate-50">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm" style={{ padding: '12px 32px' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
                Casa<span style={{ color: '#c9a96e' }}>CEO</span>
              </span>
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">← Dashboard</Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto" style={{ padding: '32px' }}>

          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2', marginBottom: '8px' }}>
              Vendors & Services
            </h1>
            <p className="text-slate-500" style={{ fontSize: '15px', marginBottom: '16px' }}>
              Trusted professionals for every part of your home.
            </p>
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search style={{ width: '18px', height: '18px', color: '#94a3b8', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a service or vendor…"
                className="w-full bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 text-slate-900"
                style={{ padding: '12px 14px 12px 44px', fontSize: '15px', '--tw-ring-color': '#1e3a5f' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                </button>
              )}
            </div>
          </div>

          {/* Category Grid */}
          <div style={{ marginBottom: '40px' }}>
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '16px' }}>Browse by Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8" style={{ gap: '10px' }}>
              {CATEGORIES.map((cat, i) => (
                <CategoryCard
                  key={i}
                  category={cat}
                  isActive={activeCategory === cat.name}
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                />
              ))}
            </div>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-700 transition-colors" style={{ fontSize: '13px', marginTop: '12px' }}>
                <X style={{ width: '13px', height: '13px' }} /> Clear filter
              </button>
            )}
          </div>

          {/* Recommended for Your Home */}
          {!search && !activeCategory && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '4px' }}>Recommended for Your Home</h2>
                <p className="text-slate-500" style={{ fontSize: '14px' }}>Based on your home's age, systems, and upcoming needs.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
                {recommended.map(v => <VendorCard key={v.id} vendor={v} onViewProfile={setSelectedVendor} />)}
              </div>
            </div>
          )}

          {/* Featured Vendors */}
          {!search && !activeCategory && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '4px' }}>Featured Vendors</h2>
                <p className="text-slate-500" style={{ fontSize: '14px' }}>Highly rated professionals trusted by homeowners in your area.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
                {featured.map(v => <VendorCard key={v.id} vendor={v} onViewProfile={setSelectedVendor} />)}
              </div>
            </div>
          )}

          {/* Seasonal Tasks */}
          {!search && !activeCategory && (
            <div style={{ marginBottom: '40px' }}>
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '16px' }}>Seasonal Service Guide</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '12px' }}>
                {SEASONAL.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="bg-white" style={{ borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                        <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg }}>
                          <Icon style={{ width: '15px', height: '15px', color: s.color }} />
                        </div>
                        <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{s.season}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {s.tasks.map((task, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <CheckCircle2 style={{ width: '12px', height: '12px', color: s.color, flexShrink: 0 }} />
                            <p className="text-slate-600" style={{ fontSize: '12px' }}>{task}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Vendors List */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px' }}>
                {search || activeCategory ? `Results ${filtered.length > 0 ? `(${filtered.length})` : ''}` : 'All Vendors'}
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', padding: '48px 20px', border: '1px solid #e2e8f0' }}>
                <Search className="w-10 h-10 text-slate-300 mx-auto" style={{ marginBottom: '16px' }} />
                <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No vendors match your search.</p>
                <p className="text-slate-400" style={{ fontSize: '14px' }}>Try adjusting your filters or browsing by category.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(v => <VendorRow key={v.id} vendor={v} onViewProfile={setSelectedVendor} />)}
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="flex items-center justify-between rounded-2xl" style={{ background: '#1e3a5f', padding: '20px 24px', marginTop: '40px' }}>
            <div>
              <p className="font-semibold text-white" style={{ fontSize: '15px' }}>Ready to prepare your home for market?</p>
              <p className="text-blue-200" style={{ fontSize: '13px', marginTop: '4px' }}>We'll match you with pre-listing vendors instantly.</p>
            </div>
            <Link to="/ready-to-sell" className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1A1A1A', padding: '10px 18px', fontSize: '13px' }}>
              <Star style={{ width: '14px', height: '14px' }} /> Ready to Sell <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>
          </div>

        </main>
      </div>

      {/* Vendor Profile Modal */}
      {selectedVendor && <VendorProfileModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}
    </>
  );
};

export default VendorDirectoryPage;
