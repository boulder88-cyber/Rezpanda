import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Plus, X, Edit2, AlertCircle, CheckCircle2,
  Clock, Calendar, DollarSign, Phone, Mail, FileText,
  Search, ChevronRight, Bell, Wrench, Home, Star,
  AlertTriangle, Package, Download, FolderOpen, Users, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

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

const getCat = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[9];

// ═══════════════════════════════════════════════════════════════════════
// WARRANTY MODAL
// ═══════════════════════════════════════════════════════════════════════

const WarrantyModal = ({ warranty, onSave, onClose }) => {
  const [form, setForm] = useState({
    itemName: warranty?.itemName || '', brand: warranty?.brand || '',
    modelNumber: warranty?.modelNumber || '', serialNumber: warranty?.serialNumber || '',
    category: warranty?.category || 'appliances', purchaseDate: warranty?.purchaseDate || '',
    expiryDate: warranty?.expiryDate || '', warrantyLength: warranty?.warrantyLength || '',
    purchasePrice: warranty?.purchasePrice || '', retailer: warranty?.retailer || '',
    vendorName: warranty?.vendorName || '', vendorPhone: warranty?.vendorPhone || '',
    vendorEmail: warranty?.vendorEmail || '', property: warranty?.property || '',
    notes: warranty?.notes || '', hasExtendedWarranty: warranty?.hasExtendedWarranty || false,
    extendedExpiryDate: warranty?.extendedExpiryDate || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const calcExpiry = (purchaseDate, months) => {
    if (!purchaseDate || !months) return '';
    const d = new Date(purchaseDate);
    d.setMonth(d.getMonth() + parseInt(months));
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-2xl my-4" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
          <div>
            <h2 className="font-semibold text-white" style={{ fontSize: '18px' }}>{warranty ? 'Edit Coverage' : 'Add Coverage'}</h2>
            <p className="text-blue-200" style={{ fontSize: '13px' }}>Track your coverage and never miss an expiry</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Category</Label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => set('category', cat.key)}
                  className="p-2 rounded-xl border text-center transition-all"
                  style={form.category === cat.key ? { background: cat.color, borderColor: cat.color, color: 'white' } : { borderColor: '#e2e8f0' }}>
                  <div style={{ fontSize: '18px', marginBottom: '2px' }}>{cat.icon}</div>
                  <span style={{ fontSize: '11px', fontWeight: 500 }}>{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Purchase Date</Label>
              <Input type="date" value={form.purchaseDate}
                onChange={e => { const expiry = calcExpiry(e.target.value, form.warrantyLength); setForm(p => ({ ...p, purchaseDate: e.target.value, expiryDate: expiry || p.expiryDate })); }}
                className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Warranty Length (months)</Label>
              <Input type="number" placeholder="12" value={form.warrantyLength}
                onChange={e => { const expiry = calcExpiry(form.purchaseDate, e.target.value); setForm(p => ({ ...p, warrantyLength: e.target.value, expiryDate: expiry || p.expiryDate })); }}
                className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} className="h-11 rounded-xl" />
              {form.purchaseDate && form.warrantyLength && <p className="text-blue-500" style={{ fontSize: '11px', marginTop: '4px' }}>Auto-calculated</p>}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl" style={{ padding: '14px' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: form.hasExtendedWarranty ? '12px' : '0' }}>
              <input type="checkbox" id="extendedWarranty" checked={form.hasExtendedWarranty} onChange={e => set('hasExtendedWarranty', e.target.checked)} className="w-4 h-4 rounded" />
              <label htmlFor="extendedWarranty" className="text-sm font-semibold text-slate-700">Has Extended Warranty</label>
            </div>
            {form.hasExtendedWarranty && (
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Extended Warranty Expiry</Label>
                <Input type="date" value={form.extendedExpiryDate} onChange={e => set('extendedExpiryDate', e.target.value)} className="h-11 rounded-xl bg-white" />
              </div>
            )}
          </div>

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

          <div className="bg-slate-50 rounded-xl" style={{ padding: '14px' }}>
            <p className="text-sm font-semibold text-slate-700" style={{ marginBottom: '10px' }}>Service / Warranty Contact</p>
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Contact name" value={form.vendorName} onChange={e => set('vendorName', e.target.value)} className="h-10 rounded-xl bg-white text-sm" />
              <Input placeholder="Phone" value={form.vendorPhone} onChange={e => set('vendorPhone', e.target.value)} className="h-10 rounded-xl bg-white text-sm" />
              <Input placeholder="Email" value={form.vendorEmail} onChange={e => set('vendorEmail', e.target.value)} className="h-10 rounded-xl bg-white text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Notes / Claim Number</Label>
            <textarea placeholder="Claim numbers, coverage details, service history..." value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => onSave({ ...form, id: warranty?.id || Date.now() })} disabled={!form.itemName}
              className="flex-1 h-12 rounded-xl text-white font-bold" style={{ background: '#1e3a5f' }}>
              {warranty ? 'Save Changes' : 'Add Coverage'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// EXPIRATION ALERTS
// ═══════════════════════════════════════════════════════════════════════

const ExpirationAlerts = ({ warranties }) => {
  const today = new Date();
  const expiring = warranties.filter(w => {
    if (!w.expiryDate) return false;
    const d = Math.ceil((new Date(w.expiryDate) - today) / 86400000);
    return d >= 0 && d <= 60;
  });
  const expired = warranties.filter(w => w.expiryDate && new Date(w.expiryDate) < today);
  if (expiring.length === 0 && expired.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
      {expired.length > 0 && (
        <div className="flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px' }}>
          <AlertCircle style={{ width: '18px', height: '18px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="font-semibold text-red-700" style={{ fontSize: '14px' }}>{expired.length} warrant{expired.length > 1 ? 'ies' : 'y'} expired</p>
            <p className="text-red-500" style={{ fontSize: '12px', marginTop: '2px' }}>{expired.map(w => w.itemName).join(', ')}</p>
          </div>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="flex items-start gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px' }}>
          <Clock style={{ width: '18px', height: '18px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="font-semibold text-amber-700" style={{ fontSize: '14px' }}>{expiring.length} warrant{expiring.length > 1 ? 'ies' : 'y'} expiring within 60 days</p>
            <p className="text-amber-600" style={{ fontSize: '12px', marginTop: '2px' }}>{expiring.map(w => w.itemName).join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// QUICK STATS
// ═══════════════════════════════════════════════════════════════════════

const QuickStats = ({ warranties }) => {
  const today = new Date();
  const expired = warranties.filter(w => w.expiryDate && new Date(w.expiryDate) < today).length;
  const expiringSoon = warranties.filter(w => {
    if (!w.expiryDate) return false;
    const d = Math.ceil((new Date(w.expiryDate) - today) / 86400000);
    return d >= 0 && d <= 90;
  }).length;
  const active = warranties.filter(w => w.expiryDate && new Date(w.expiryDate) > today).length;
  const totalValue = warranties.reduce((s, w) => s + (parseFloat(w.purchasePrice) || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
      {[
        { label: 'Active Coverage', value: active, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
        { label: 'Renewal Window', value: expiringSoon, icon: Clock, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        { label: 'Coverage Ended', value: expired, icon: AlertCircle, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
        { label: 'Items Tracked', value: warranties.length, icon: Package, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
      ].map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, marginBottom: '8px' }}>
              <Icon style={{ width: '16px', height: '16px', color: s.color }} />
            </div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: '24px', lineHeight: 1 }}>{s.value}</p>
            <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// WARRANTY CARD
// ═══════════════════════════════════════════════════════════════════════

const WarrantyCard = ({ warranty, onEdit, onDelete }) => {
  const cat = getCat(warranty.category);
  const today = new Date();
  const expiryDate = warranty.expiryDate ? new Date(warranty.expiryDate) : null;
  const extendedExpiry = warranty.extendedExpiryDate ? new Date(warranty.extendedExpiryDate) : null;
  const effectiveExpiry = extendedExpiry || expiryDate;
  const daysLeft = effectiveExpiry ? Math.ceil((effectiveExpiry - today) / 86400000) : null;

  const getStatus = () => {
    if (!daysLeft) return { label: 'No expiry set', color: '#94a3b8', bg: '#f8fafc', urgent: false };
    if (daysLeft < 0) return { label: 'Coverage Ended', color: '#dc2626', bg: '#fef2f2', urgent: true };
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: '#dc2626', bg: '#fef2f2', urgent: true };
    if (daysLeft <= 90) return { label: `${daysLeft}d left`, color: '#f97316', bg: '#fff7ed', urgent: false };
    if (daysLeft <= 365) return { label: `${daysLeft}d left`, color: '#d97706', bg: '#fffbeb', urgent: false };
    return { label: `${(daysLeft / 365).toFixed(1)}yr left`, color: '#059669', bg: '#ecfdf5', urgent: false };
  };

  const status = getStatus();

  return (
    <div className="bg-white hover:shadow-md transition-all overflow-hidden" style={{
      borderRadius: '12px',
      border: `1px solid ${status.urgent ? '#fecaca' : '#e2e8f0'}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {status.urgent && <div style={{ height: '3px', background: '#ef4444' }} />}
      <div style={{ padding: '20px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '10px', background: cat.bg, fontSize: '20px' }}>
              {cat.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900" style={{ fontSize: '15px', lineHeight: '1.3' }}>{warranty.itemName}</h3>
              <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>
                {warranty.brand}{warranty.modelNumber ? ` · ${warranty.modelNumber}` : ''}
              </p>
            </div>
          </div>
          <span className="font-medium rounded-full flex-shrink-0" style={{ background: status.bg, color: status.color, fontSize: '12px', padding: '3px 10px' }}>
            {status.label}
          </span>
        </div>

        {warranty.property && (
          <p className="text-slate-400 flex items-center gap-1" style={{ fontSize: '12px', marginBottom: '12px' }}>
            <Home style={{ width: '12px', height: '12px' }} /> {warranty.property}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '12px' }}>
          {warranty.purchaseDate && (
            <div className="bg-slate-50 rounded-xl" style={{ padding: '10px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Purchased</p>
              <p className="font-semibold text-slate-900" style={{ fontSize: '12px', marginTop: '2px' }}>
                {new Date(warranty.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
          {effectiveExpiry && (
            <div className="rounded-xl" style={{ padding: '10px', background: status.bg }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>{extendedExpiry ? 'Extended Expiry' : 'Expires'}</p>
              <p className="font-semibold" style={{ fontSize: '12px', marginTop: '2px', color: status.color }}>
                {effectiveExpiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {warranty.hasExtendedWarranty && extendedExpiry && (
          <div className="flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
            <Star style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
            <span className="font-medium text-amber-600" style={{ fontSize: '12px' }}>Extended warranty active</span>
          </div>
        )}

        {warranty.vendorPhone && (
          <a href={`tel:${warranty.vendorPhone}`} className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors" style={{ fontSize: '12px', marginBottom: '10px' }}>
            <Phone style={{ width: '12px', height: '12px' }} /> {warranty.vendorName || warranty.vendorPhone}
          </a>
        )}

        {warranty.purchasePrice && (
          <p className="text-slate-400 flex items-center gap-0.5" style={{ fontSize: '12px', marginBottom: '12px' }}>
            <DollarSign style={{ width: '12px', height: '12px' }} />${parseFloat(warranty.purchasePrice).toLocaleString()}
          </p>
        )}

        {/* Document + Vendor links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <Link to="/documents" className="flex items-center gap-2 hover:bg-slate-100 transition-colors rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '7px 10px', fontSize: '12px', color: '#64748b' }}>
            <FolderOpen style={{ width: '12px', height: '12px', color: '#1e3a5f', flexShrink: 0 }} />
            <span className="font-medium">View warranty docs</span>
            <ChevronRight style={{ width: '12px', height: '12px', marginLeft: 'auto', color: '#94a3b8' }} />
          </Link>
          <Link to="/vendors" className="flex items-center gap-2 hover:bg-slate-100 transition-colors rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '7px 10px', fontSize: '12px', color: '#64748b' }}>
            <Users style={{ width: '12px', height: '12px', color: '#1e3a5f', flexShrink: 0 }} />
            <span className="font-medium">Find service vendor</span>
            <ChevronRight style={{ width: '12px', height: '12px', marginLeft: 'auto', color: '#94a3b8' }} />
          </Link>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(warranty)} className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" style={{ height: '36px', fontSize: '13px' }}>
            <Edit2 style={{ width: '13px', height: '13px' }} /> Edit
          </button>
          <button onClick={() => onDelete(warranty.id)} className="flex items-center justify-center rounded-xl hover:bg-red-100 transition-colors" style={{ width: '36px', height: '36px', background: '#fef2f2' }}>
            <X style={{ width: '14px', height: '14px', color: '#f87171' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const WarrantyTrackerPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSave = (warranty) => {
    if (editingWarranty) setWarranties(prev => prev.map(w => w.id === warranty.id ? warranty : w));
    else setWarranties(prev => [...prev, warranty]);
    setShowModal(false); setEditingWarranty(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this warranty?')) return;
    setWarranties(prev => prev.filter(w => w.id !== id));
  };

  const today = new Date();
  const filtered = warranties.filter(w => {
    const matchSearch = !searchQuery ||
      w.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.property?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || w.category === filterCategory;
    const daysLeft = w.expiryDate ? Math.ceil((new Date(w.expiryDate) - today) / 86400000) : null;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && daysLeft !== null && daysLeft > 0) ||
      (filterStatus === 'expiring' && daysLeft !== null && daysLeft >= 0 && daysLeft <= 90) ||
      (filterStatus === 'expired' && daysLeft !== null && daysLeft < 0);
    return matchSearch && matchCat && matchStatus;
  }).sort((a, b) => {
    const dA = a.expiryDate ? new Date(a.expiryDate) - today : Infinity;
    const dB = b.expiryDate ? new Date(b.expiryDate) - today : Infinity;
    return dA - dB;
  });

  return (
    <>
      <Helmet><title>Warranty Tracker — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Warranty Tracker</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5' }}>
                <ShieldCheck style={{ width: '24px', height: '24px', color: '#059669' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Warranty Tracker</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {warranties.length} items tracked · Never miss a coverage window
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <button onClick={() => { setEditingWarranty(null); setShowModal(true); }}
                className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Coverage
              </button>
            </div>
          </div>
        </div>

        <ExpirationAlerts warranties={warranties} />
        <QuickStats warranties={warranties} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '24px' }}>
          <div className="relative flex-1">
            <Search style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <Input placeholder="Search warranties…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
            <option value="all">All Statuses</option>
            <option value="active">Active Coverage</option>
            <option value="expiring">Renewal Window</option>
            <option value="expired">Coverage Ended</option>
          </select>
        </div>

        {warranties.length === 0 ? (
          <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
            <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ecfdf5', marginBottom: '16px', fontSize: '28px' }}>
              🛡️
            </div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No warranties tracked yet.</p>
            <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Add your appliances, systems, and purchases to track warranties and get alerted before they expire.
            </p>
            <button onClick={() => setShowModal(true)} className="font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '12px 28px', fontSize: '14px' }}>
              <Plus className="w-4 h-4 inline mr-2" /> Add Your First Warranty
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center" style={{ padding: '48px 0' }}>
            <p className="font-medium text-slate-400" style={{ fontSize: '15px' }}>No warranties match your search.</p>
            <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); }} className="text-blue-500 hover:text-blue-700 transition-colors" style={{ fontSize: '13px', marginTop: '8px' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(w => <WarrantyCard key={w.id} warranty={w} onEdit={w => { setEditingWarranty(w); setShowModal(true); }} onDelete={handleDelete} />)}
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '20px', marginTop: '32px' }}>
          <h3 className="font-semibold text-amber-800 flex items-center gap-2" style={{ fontSize: '15px', marginBottom: '12px' }}>
            <Star style={{ width: '15px', height: '15px', color: '#f59e0b' }} /> Warranty Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              'Register appliances with manufacturers for extended coverage and recall notices.',
              "Keep receipts and serial numbers — they're required for most warranty claims.",
              'Extended warranties often cost 10–20% of purchase price — factor that into buying decisions.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                <p className="text-amber-700" style={{ fontSize: '12px', lineHeight: '1.6' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <WarrantyModal warranty={editingWarranty} onSave={handleSave} onClose={() => { setShowModal(false); setEditingWarranty(null); }} />}
    </>
  );
};

export default WarrantyTrackerPage;
