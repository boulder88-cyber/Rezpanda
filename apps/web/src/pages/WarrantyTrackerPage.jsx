import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  ShieldCheck, Plus, X, Edit2, AlertCircle, CheckCircle2,
  Clock, Calendar, DollarSign, Phone, Mail, FileText,
  Search, ChevronRight, Bell, Wrench, Home, Star,
  AlertTriangle, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

// ─── Warranty Categories ──────────────────────────────────────────────
const CATEGORIES = [
  { key: 'appliances', label: 'Appliances', icon: '🍳', color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'hvac', label: 'HVAC', icon: '❄️', color: '#2563eb', bg: '#eff6ff' },
  { key: 'roofing', label: 'Roofing', icon: '🏠', color: '#f97316', bg: '#fff7ed' },
  { key: 'plumbing', label: 'Plumbing', icon: '🔧', color: '#0891b2', bg: '#ecfeff' },
  { key: 'electrical', label: 'Electrical', icon: '⚡', color: '#d97706', bg: '#fffbeb' },
  { key: 'windows', label: 'Windows & Doors', icon: '🪟', color: '#059669', bg: '#ecfdf5' },
  { key: 'flooring', label: 'Flooring', icon: '🏡', color: '#dc2626', bg: '#fef2f2' },
  { key: 'electronics', label: 'Electronics', icon: '📺', color: '#1e3a5f', bg: '#eef2f8' },
  { key: 'outdoor', label: 'Outdoor/Lawn', icon: '🌿', color: '#16a34a', bg: '#f0fdf4' },
  { key: 'other', label: 'Other', icon: '📦', color: '#94a3b8', bg: '#f8fafc' },
];

// ─── Add/Edit Warranty Modal ──────────────────────────────────────────
const WarrantyModal = ({ warranty, onSave, onClose }) => {
  const [form, setForm] = useState({
    itemName: warranty?.itemName || '',
    brand: warranty?.brand || '',
    modelNumber: warranty?.modelNumber || '',
    serialNumber: warranty?.serialNumber || '',
    category: warranty?.category || 'appliances',
    purchaseDate: warranty?.purchaseDate || '',
    expiryDate: warranty?.expiryDate || '',
    warrantyLength: warranty?.warrantyLength || '',
    purchasePrice: warranty?.purchasePrice || '',
    retailer: warranty?.retailer || '',
    vendorName: warranty?.vendorName || '',
    vendorPhone: warranty?.vendorPhone || '',
    vendorEmail: warranty?.vendorEmail || '',
    claimNumber: warranty?.claimNumber || '',
    property: warranty?.property || '',
    notes: warranty?.notes || '',
    hasExtendedWarranty: warranty?.hasExtendedWarranty || false,
    extendedExpiryDate: warranty?.extendedExpiryDate || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto calculate expiry from purchase date + warranty length
  const calcExpiry = (purchaseDate, months) => {
    if (!purchaseDate || !months) return '';
    const d = new Date(purchaseDate);
    d.setMonth(d.getMonth() + parseInt(months));
    return d.toISOString().split('T')[0];
  };

  const handlePurchaseDateChange = (val) => {
    const expiry = calcExpiry(val, form.warrantyLength);
    setForm(p => ({ ...p, purchaseDate: val, expiryDate: expiry || p.expiryDate }));
  };

  const handleWarrantyLengthChange = (val) => {
    const expiry = calcExpiry(form.purchaseDate, val);
    setForm(p => ({ ...p, warrantyLength: val, expiryDate: expiry || p.expiryDate }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4">
        <div className="rounded-t-3xl px-8 py-6 flex items-center justify-between" style={{ background: '#1e3a5f' }}>
          <div>
            <h2 className="text-xl font-bold text-white">{warranty ? 'Edit Coverage' : 'Add Coverage'}</h2>
            <p className="text-blue-200 text-sm">Track your coverage and never miss an expiry</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Category */}
          <div>
            <Label className="text-sm font-bold text-slate-700 mb-3 block">Category</Label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => set('category', cat.key)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    form.category === cat.key ? 'border-2 text-white' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={form.category === cat.key ? { background: cat.color, borderColor: cat.color } : {}}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  <span className="text-xs font-medium leading-tight block">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Item Name *</Label>
              <Input placeholder="e.g. Samsung Refrigerator" value={form.itemName} onChange={e => set('itemName', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Brand</Label>
              <Input placeholder="Samsung, LG, Carrier..." value={form.brand} onChange={e => set('brand', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Model Number</Label>
              <Input placeholder="RF28R7351SR" value={form.modelNumber} onChange={e => set('modelNumber', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Serial Number</Label>
              <Input placeholder="SN123456789" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Property</Label>
              <Input placeholder="Primary Home, Lake House..." value={form.property} onChange={e => set('property', e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Purchase Date</Label>
              <Input type="date" value={form.purchaseDate} onChange={e => handlePurchaseDateChange(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Warranty Length (months)</Label>
              <Input type="number" placeholder="12" value={form.warrantyLength} onChange={e => handleWarrantyLengthChange(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} className="h-11 rounded-xl" />
              {form.purchaseDate && form.warrantyLength && (
                <p className="text-xs text-blue-500 mt-1">Auto-calculated</p>
              )}
            </div>
          </div>

          {/* Extended Warranty */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="extendedWarranty"
                checked={form.hasExtendedWarranty}
                onChange={e => set('hasExtendedWarranty', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="extendedWarranty" className="text-sm font-semibold text-slate-700">Has Extended Warranty</label>
            </div>
            {form.hasExtendedWarranty && (
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Extended Warranty Expiry</Label>
                <Input type="date" value={form.extendedExpiryDate} onChange={e => set('extendedExpiryDate', e.target.value)} className="h-11 rounded-xl bg-white" />
              </div>
            )}
          </div>

          {/* Purchase Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Purchase Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="1299" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Retailer</Label>
              <Input placeholder="Home Depot, Best Buy..." value={form.retailer} onChange={e => set('retailer', e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          {/* Vendor/Service Contact */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-slate-700">Service / Warranty Contact</p>
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Contact name" value={form.vendorName} onChange={e => set('vendorName', e.target.value)} className="h-10 rounded-xl bg-white text-sm" />
              <Input placeholder="Phone" value={form.vendorPhone} onChange={e => set('vendorPhone', e.target.value)} className="h-10 rounded-xl bg-white text-sm" />
              <Input placeholder="Email" value={form.vendorEmail} onChange={e => set('vendorEmail', e.target.value)} className="h-10 rounded-xl bg-white text-sm" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Notes / Claim Number</Label>
            <textarea
              placeholder="Claim numbers, coverage details, service history..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onSave({ ...form, id: warranty?.id || Date.now() })}
              disabled={!form.itemName}
              className="flex-1 h-12 rounded-xl text-white font-bold disabled:opacity-50"
              style={{ background: '#1e3a5f' }}
            >
              {warranty ? 'Save Changes' : 'Add Coverage'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Warranty Card ────────────────────────────────────────────────────
const WarrantyCard = ({ warranty, onEdit, onDelete }) => {
  const cat = CATEGORIES.find(c => c.key === warranty.category) || CATEGORIES[9];
  const today = new Date();
  const expiryDate = warranty.expiryDate ? new Date(warranty.expiryDate) : null;
  const extendedExpiry = warranty.extendedExpiryDate ? new Date(warranty.extendedExpiryDate) : null;
  const effectiveExpiry = extendedExpiry || expiryDate;
  const daysLeft = effectiveExpiry ? Math.ceil((effectiveExpiry - today) / (1000 * 60 * 60 * 24)) : null;

  const getStatus = () => {
    if (!daysLeft) return { label: 'No expiry set', color: '#94a3b8', bg: '#f8fafc', urgent: false };
    if (daysLeft < 0) return { label: 'Coverage Ended', color: '#dc2626', bg: '#fef2f2', urgent: true };
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: '#dc2626', bg: '#fef2f2', urgent: true };
    if (daysLeft <= 90) return { label: `${daysLeft}d left`, color: '#f97316', bg: '#fff7ed', urgent: false };
    if (daysLeft <= 365) return { label: `${daysLeft}d left`, color: '#d97706', bg: '#fffbeb', urgent: false };
    return { label: `${Math.round(daysLeft / 365 * 10) / 10}yr left`, color: '#059669', bg: '#ecfdf5', urgent: false };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${status.urgent ? 'border-red-200' : 'border-slate-100'}`}>
      {status.urgent && <div className="h-1 w-full rounded-t-2xl" style={{ background: '#dc2626' }}></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: cat.bg }}>
              {cat.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{warranty.itemName}</h3>
              <p className="text-slate-400 text-xs">{warranty.brand} {warranty.modelNumber && `· ${warranty.modelNumber}`}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>

        {warranty.property && (
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
            <Home className="w-3 h-3" /> {warranty.property}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          {warranty.purchaseDate && (
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-xs text-slate-400">Purchased</p>
              <p className="font-semibold text-slate-900 text-xs">{new Date(warranty.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {effectiveExpiry && (
            <div className="rounded-xl p-2.5" style={{ background: status.bg }}>
              <p className="text-xs text-slate-400">{extendedExpiry ? 'Extended Expiry' : 'Expires'}</p>
              <p className="font-semibold text-xs" style={{ color: status.color }}>{effectiveExpiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {warranty.hasExtendedWarranty && extendedExpiry && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-amber-600 font-medium">Extended warranty active</span>
          </div>
        )}

        {warranty.vendorPhone && (
          <a href={`tel:${warranty.vendorPhone}`} className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600 mb-3">
            <Phone className="w-3 h-3" /> {warranty.vendorName || warranty.vendorPhone}
          </a>
        )}

        {warranty.purchasePrice && (
          <p className="text-xs text-slate-400 mb-3">
            <DollarSign className="w-3 h-3 inline" />${parseFloat(warranty.purchasePrice).toLocaleString()}
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={() => onEdit(warranty)} className="flex-1 h-9 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(warranty.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-300 hover:bg-red-100 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ warranties }) => {
  const today = new Date();
  const expired = warranties.filter(w => w.expiryDate && new Date(w.expiryDate) < today).length;
  const expiringSoon = warranties.filter(w => {
    if (!w.expiryDate) return false;
    const d = Math.ceil((new Date(w.expiryDate) - today) / (1000 * 60 * 60 * 24));
    return d >= 0 && d <= 90;
  }).length;
  const active = warranties.filter(w => {
    if (!w.expiryDate) return false;
    return new Date(w.expiryDate) > today;
  }).length;
  const totalValue = warranties.reduce((s, w) => s + (parseFloat(w.purchasePrice) || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Active Coverage', value: active, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-100', hint: 'All warranties currently in effect' },
        { label: 'Renewal Window', value: expiringSoon, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 border-orange-100', hint: 'Stay ahead of expiration' },
        { label: 'Coverage Ended', value: expired, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 border-red-100', hint: 'Review for renewal or replacement' },
        { label: 'Items Tracked', value: warranties.length, icon: <Package className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 border-blue-100' },
      ].map((s, i) => (
        <div key={i} className={`${s.color} border rounded-2xl p-4 flex flex-col items-center text-center`}>
          <div className="mb-2">{s.icon}</div>
          <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const WarrantyTrackerPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const handleSave = (warranty) => {
    if (editingWarranty) {
      setWarranties(prev => prev.map(w => w.id === warranty.id ? warranty : w));
    } else {
      setWarranties(prev => [...prev, warranty]);
    }
    setShowModal(false);
    setEditingWarranty(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this warranty?')) return;
    setWarranties(prev => prev.filter(w => w.id !== id));
  };

  const handleEdit = (warranty) => {
    setEditingWarranty(warranty);
    setShowModal(true);
  };

  const today = new Date();
  const filtered = warranties.filter(w => {
    const matchesSearch = !searchQuery ||
      w.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.property?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || w.category === filterCategory;
    const daysLeft = w.expiryDate ? Math.ceil((new Date(w.expiryDate) - today) / (1000 * 60 * 60 * 24)) : null;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && daysLeft !== null && daysLeft > 0) ||
      (filterStatus === 'expiring' && daysLeft !== null && daysLeft >= 0 && daysLeft <= 90) ||
      (filterStatus === 'expired' && daysLeft !== null && daysLeft < 0);
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Expiring soon alerts
  const expiringAlerts = warranties.filter(w => {
    if (!w.expiryDate) return false;
    const d = Math.ceil((new Date(w.expiryDate) - today) / (1000 * 60 * 60 * 24));
    return d >= 0 && d <= 30;
  });

  return (
    <>
      <Helmet><title>Warranty Tracker — CasaOS Protection Layer</title></Helmet>

      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#c9a96e', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Warranty Tracker</h1>
              <p className="text-blue-200 text-base max-w-xl leading-relaxed">
                Never let a warranty expire without knowing. Track every appliance, system, and purchase across all your properties.
              </p>
              {expiringAlerts.length > 0 && (
                <div className="flex items-center gap-2 mt-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 w-fit">
                  <Bell className="w-4 h-4 text-red-300" />
                  <span className="text-red-200 text-sm font-medium">{expiringAlerts.length} warrant{expiringAlerts.length > 1 ? 'ies' : 'y'} expiring within 30 days</span>
                </div>
              )}
            </div>
            <button
              onClick={() => { setEditingWarranty(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors flex-shrink-0"
              style={{ color: '#1e3a5f' }}
            >
              <Plus className="w-4 h-4" /> Add Coverage
            </button>
          </div>
        </div>

        {/* Stats */}
        <QuickStats warranties={warranties} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search warranties..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl border-slate-200"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Coverage</option>
            <option value="expiring">Renewal Window</option>
            <option value="expired">Coverage Ended</option>
          </select>
        </div>

        {/* Content */}
        {warranties.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: '#eef2f8' }}>
              🛡️
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No warranties tracked yet 🛡️</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
              Add your appliances, systems, and purchases to track warranties and get alerted before they expire.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: '#1e3a5f' }}
            >
              <Plus className="w-4 h-4" /> Add Your First Warranty
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 font-medium">No warranties match your search</p>
            <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); }} className="mt-3 text-xs text-blue-500">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered
              .sort((a, b) => {
                const dA = a.expiryDate ? new Date(a.expiryDate) - today : Infinity;
                const dB = b.expiryDate ? new Date(b.expiryDate) - today : Infinity;
                return dA - dB;
              })
              .map(w => (
                <WarrantyCard key={w.id} warranty={w} onEdit={handleEdit} onDelete={handleDelete} />
              ))
            }
          </div>
        )}

        {/* Pro Tips */}
        <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Warranty Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { tip: 'Register your appliances with manufacturers for extended coverage and recall notices' },
              { tip: 'Keep receipts and serial numbers — they\'re required for most warranty claims' },
              { tip: 'Extended warranties often cost 10-20% of purchase price — factor that into buying decisions' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <WarrantyModal
          warranty={editingWarranty}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingWarranty(null); }}
        />
      )}
    </>
  );
};

export default WarrantyTrackerPage;
