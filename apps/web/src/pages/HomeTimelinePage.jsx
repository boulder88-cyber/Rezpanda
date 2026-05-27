import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useHome } from '@/contexts/HomeContext.jsx';
import {
  Clock, Search, Filter, Download, Plus, X,
  CreditCard, Wrench, FileText, TrendingUp, Shield,
  Users, TreePine, Bell, Home, Star, ChevronDown,
  CheckCircle2, AlertCircle, Zap, MoreHorizontal,
  Calendar, Tag, BookOpen, ShieldCheck, ChevronRight,
  Share2, BarChart2, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

// ═══════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════

const EVENT_TYPES = [
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#f97316', bg: '#fff7ed', emoji: '🔧' },
  { key: 'bill', label: 'Bill Paid', icon: CreditCard, color: '#2563eb', bg: '#eff6ff', emoji: '💳' },
  { key: 'document', label: 'Document', icon: FileText, color: '#7c3aed', bg: '#f5f3ff', emoji: '📁' },
  { key: 'valuation', label: 'Valuation', icon: TrendingUp, color: '#059669', bg: '#ecfdf5', emoji: '📈' },
  { key: 'insurance', label: 'Insurance', icon: Shield, color: '#e8604c', bg: '#fdf0ee', emoji: '🛡️' },
  { key: 'rental', label: 'Rental', icon: Users, color: '#0891b2', bg: '#ecfeff', emoji: '🔑' },
  { key: 'landscaping', label: 'Landscaping', icon: TreePine, color: '#16a34a', bg: '#f0fdf4', emoji: '🌿' },
  { key: 'upgrade', label: 'Upgrade', icon: Star, color: '#d97706', bg: '#fffbeb', emoji: '⭐' },
  { key: 'inspection', label: 'Inspection', icon: CheckCircle2, color: '#1e3a5f', bg: '#eef2f8', emoji: '✅' },
  { key: 'note', label: 'Note', icon: BookOpen, color: '#64748b', bg: '#f8fafc', emoji: '📝' },
  { key: 'utility', label: 'Utility', icon: Zap, color: '#f59e0b', bg: '#fffbeb', emoji: '⚡' },
  { key: 'other', label: 'Other', icon: MoreHorizontal, color: '#94a3b8', bg: '#f8fafc', emoji: '📦' },
];

const getEventType = (key) => EVENT_TYPES.find(t => t.key === key) || EVENT_TYPES[11];

// ═══════════════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════

const SAMPLE_EVENTS = [
  { id: 1, type: 'maintenance', property: 'Primary Home', title: 'HVAC Annual Service', description: 'Replaced filter, cleaned coils, recharged refrigerant. Unit in good condition.', date: '2026-05-15', vendor: 'Johnson & Miller HVAC', amount: 285, tags: ['HVAC', 'annual'], status: 'completed' },
  { id: 2, type: 'bill', property: 'Primary Home', title: 'Electric Bill Paid', description: 'Georgia Power — May billing cycle', date: '2026-05-12', vendor: 'Georgia Power', amount: 142, tags: ['utilities', 'electric'], status: 'completed' },
  { id: 3, type: 'document', property: 'Lake House', title: 'Homeowners Insurance Uploaded', description: 'State Farm policy HO-3. Coverage: $510,000 dwelling, $50K personal property.', date: '2026-05-10', vendor: 'State Farm', amount: null, tags: ['insurance', 'documents'], status: 'completed' },
  { id: 4, type: 'valuation', property: 'Lake House', title: 'Property Value Updated', description: 'Zillow estimate updated. Value increased $12,000 from last quarter.', date: '2026-05-08', vendor: null, amount: 310000, tags: ['valuation', 'equity'], status: 'new' },
  { id: 5, type: 'maintenance', property: 'Lake House', title: 'Roof Inspection Completed', description: 'Annual roof inspection. Found minor granule loss on south-facing slope. Monitor next year.', date: '2026-05-05', vendor: 'AtlantaRoof Pro', amount: 175, tags: ['roof', 'inspection'], status: 'completed' },
  { id: 6, type: 'bill', property: 'Primary Home', title: 'Internet Bill Paid', description: 'Comcast Xfinity — May', date: '2026-05-01', vendor: 'Comcast Xfinity', amount: 89, tags: ['utilities', 'internet'], status: 'completed' },
  { id: 7, type: 'upgrade', property: 'Primary Home', title: 'Smart Thermostat Installed', description: 'Nest Learning Thermostat installed. Estimated $180/year energy savings.', date: '2026-04-22', vendor: 'Best Buy + Self Install', amount: 249, tags: ['smart home', 'upgrade'], status: 'completed' },
  { id: 8, type: 'inspection', property: 'Primary Home', title: 'Annual Home Inspection', description: 'Full 200-point inspection. Minor caulking needed around master bath. No structural issues.', date: '2026-04-15', vendor: 'HomeCheck Atlanta', amount: 350, tags: ['inspection', 'annual'], status: 'completed' },
  { id: 9, type: 'insurance', property: 'Primary Home', title: 'Insurance Renewal Completed', description: 'State Farm HO-3 renewed for 2026-2027. Premium increased $240/year.', date: '2026-04-01', vendor: 'State Farm', amount: 1840, tags: ['insurance', 'renewal'], status: 'upcoming' },
  { id: 10, type: 'maintenance', property: 'Primary Home', title: 'Pest Control Service', description: 'Quarterly perimeter treatment. No active infestations found.', date: '2026-03-20', vendor: 'Terminix', amount: 125, tags: ['pest control', 'quarterly'], status: 'overdue' },
  { id: 11, type: 'landscaping', property: 'Lake House', title: 'Spring Landscaping', description: 'Mulch refresh, pruning, and new plantings. Front and back yard completed.', date: '2026-03-15', vendor: 'Green Thumb Landscaping', amount: 680, tags: ['landscaping', 'spring'], status: 'completed' },
  { id: 12, type: 'bill', property: 'Lake House', title: 'Property Tax Payment', description: 'Gwinnett County Q1 property tax installment paid.', date: '2026-03-01', vendor: 'Gwinnett County', amount: 1420, tags: ['tax', 'property tax'], status: 'completed' },
];

// ═══════════════════════════════════════════════════════════════════════
// EVENT BADGE
// ═══════════════════════════════════════════════════════════════════════

const EventBadge = ({ status }) => {
  if (!status || status === 'completed') return null;
  const styles = {
    new: { bg: '#ecfdf5', color: '#059669', label: 'New' },
    overdue: { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
    upcoming: { bg: '#fffbeb', color: '#d97706', label: 'Upcoming' },
  };
  const s = styles[status];
  if (!s) return null;
  return (
    <span className="font-bold rounded-full" style={{ fontSize: '11px', background: s.bg, color: s.color, padding: '2px 8px' }}>
      {s.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ADD EVENT MODAL
// ═══════════════════════════════════════════════════════════════════════

const AddEventModal = ({ open, onClose, onSave, properties }) => {
  const [form, setForm] = useState({
    type: 'maintenance', property: properties[0] || '',
    title: '', description: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '', amount: '', tags: '', status: 'completed'
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Log Home Event</DialogTitle>
          <p className="text-slate-500 text-sm">Every event you log becomes part of your home's permanent memory.</p>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Event Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.slice(0, 8).map(t => (
                <button key={t.key} type="button" onClick={() => set('type', t.key)}
                  className="p-2 rounded-xl border text-center transition-all"
                  style={form.type === t.key ? { background: t.color, borderColor: t.color, color: 'white' } : { background: t.bg, borderColor: '#e2e8f0', color: t.color }}>
                  <div style={{ fontSize: '18px', marginBottom: '2px' }}>{t.emoji}</div>
                  <span style={{ fontSize: '11px', fontWeight: 500 }}>{t.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Property</Label>
              <select value={form.property} onChange={e => set('property', e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white">
                {properties.map(p => <option key={p} value={p}>{p}</option>)}
                <option value="All Properties">All Properties</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Date</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Event Title *</Label>
            <Input placeholder="e.g. HVAC Annual Service, Electric Bill Paid" value={form.title} onChange={e => set('title', e.target.value)} className="h-11 rounded-xl" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Description</Label>
            <textarea placeholder="Details, notes, findings..." value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Vendor / Provider</Label>
              <Input placeholder="Georgia Power, Terminix..." value={form.vendor} onChange={e => set('vendor', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Amount (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Status</Label>
            <div className="flex gap-2">
              {['completed', 'upcoming', 'overdue'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className="flex-1 font-medium rounded-xl capitalize transition-all"
                  style={{ padding: '8px', fontSize: '12px', background: form.status === s ? '#1e3a5f' : '#f8fafc', color: form.status === s ? 'white' : '#64748b', border: `1px solid ${form.status === s ? '#1e3a5f' : '#e2e8f0'}` }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tags (comma separated)</Label>
            <Input placeholder="HVAC, annual, inspection..." value={form.tags} onChange={e => set('tags', e.target.value)} className="h-11 rounded-xl" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => {
              if (!form.title) return;
              onSave({ ...form, id: Date.now(), amount: parseFloat(form.amount) || null, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
              onClose();
            }} disabled={!form.title} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
              Add to Timeline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// EVENT CARD — with vertical spine + badges
// ═══════════════════════════════════════════════════════════════════════

const EventCard = ({ event, onDelete, isLast }) => {
  const et = getEventType(event.type);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-4 group">
      {/* Vertical memory spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="flex items-center justify-center z-10 border-2 border-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '50%', background: et.bg, fontSize: '18px' }}>
          {et.emoji}
        </div>
        {!isLast && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', marginTop: '8px', minHeight: '24px' }} />}
      </div>

      {/* Content */}
      <div className="flex-1" style={{ paddingBottom: isLast ? 0 : '20px' }}>
        <div className="bg-white hover:shadow-md transition-all cursor-pointer" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '6px' }}>
                <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: et.bg, color: et.color, padding: '2px 8px' }}>{et.label}</span>
                <span className="text-slate-400 font-medium" style={{ fontSize: '12px' }}>{event.property}</span>
                <EventBadge status={event.status} />
                {event.amount && (
                  <span className="font-bold text-slate-700 ml-auto" style={{ fontSize: '13px' }}>${event.amount.toLocaleString()}</span>
                )}
              </div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{event.title}</p>
              {event.vendor && <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{event.vendor}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-slate-400 whitespace-nowrap" style={{ fontSize: '12px' }}>
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <ChevronDown style={{ width: '14px', height: '14px', color: '#cbd5e1', marginTop: '4px', marginLeft: 'auto', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
          </div>

          {expanded && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {event.description && <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.6' }}>{event.description}</p>}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="font-medium text-slate-500 bg-slate-100 rounded-full" style={{ fontSize: '11px', padding: '2px 8px' }}>#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                <button className="font-semibold text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize: '12px' }}>Edit</button>
                <button className="font-semibold text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize: '12px' }}>Add Follow-Up</button>
                <Link to="/documents" className="font-semibold text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize: '12px' }}>View in Documents</Link>
                <button onClick={e => { e.stopPropagation(); onDelete(event.id); }} className="font-semibold text-red-400 hover:text-red-600 transition-colors ml-auto" style={{ fontSize: '12px' }}>Remove</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

const exportTimeline = (events, format = 'csv') => {
  const headers = ['Date', 'Property', 'Type', 'Title', 'Vendor', 'Amount', 'Status', 'Description', 'Tags'];
  const rows = events.map(e => [
    e.date, e.property, e.type, e.title,
    e.vendor || '', e.amount ? `$${e.amount}` : '',
    e.status || '', e.description || '', (e.tags || []).join('; ')
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `home-timeline-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

const groupByMonth = (events) => {
  const groups = {};
  events.forEach(e => {
    const key = new Date(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return groups;
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeTimelinePage = () => {
  const { selectedHome, homes } = useHome();
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const propertyNames = homes?.map(h => h.name) || ['Primary Home', 'Lake House'];

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = filterType === 'all' || e.type === filterType;
      const matchProperty = filterProperty === 'all' || e.property === filterProperty;
      return matchSearch && matchType && matchProperty;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, searchQuery, filterType, filterProperty]);

  const grouped = groupByMonth(filtered);
  const totalSpend = events.reduce((s, e) => s + (e.amount || 0), 0);
  const thisYear = events.filter(e => new Date(e.date).getFullYear() === new Date().getFullYear()).length;
  const overdueCount = events.filter(e => e.status === 'overdue').length;
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const newCount = events.filter(e => e.status === 'new').length;

  return (
    <>
      <Helmet><title>Home Timeline — CasaCEO</title></Helmet>
      <div className="max-w-4xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Home Timeline</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', flexShrink: 0 }}>
                <Clock style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Home Timeline</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px', maxWidth: '500px', lineHeight: '1.6' }}>
                  Your home's memory, beautifully organized. Every repair, upgrade, inspection, and milestone is automatically logged, searchable, and ready whenever you need it.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl"
                  style={{ padding: '10px 16px', fontSize: '13px' }}>
                  <Download style={{ width: '15px', height: '15px' }} /> Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden" style={{ minWidth: '200px' }}>
                    {[
                      { label: 'Export Timeline (CSV)', action: () => { exportTimeline(filtered); setShowExportMenu(false); } },
                      { label: 'Share with Agent', action: () => setShowExportMenu(false) },
                      { label: 'Add to Portfolio', action: () => setShowExportMenu(false) },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors font-medium text-slate-700" style={{ fontSize: '13px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Log Home Event
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom: '16px' }}>
          {[
            { label: 'Total Events Logged', value: events.length, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
            { label: 'Upcoming Items', value: upcomingCount, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Overdue Items', value: overdueCount, color: overdueCount > 0 ? '#dc2626' : '#059669', bg: overdueCount > 0 ? '#fef2f2' : '#ecfdf5', border: overdueCount > 0 ? '#fecaca' : '#a7f3d0' },
            { label: 'Total Tracked', value: `$${(totalSpend / 1000).toFixed(1)}K`, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
          ].map((s, i) => (
            <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="font-extrabold" style={{ fontSize: '22px', lineHeight: 1, color: s.color }}>{s.value}</p>
              <p className="font-medium text-slate-500" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Smart Insights Bar ── */}
        {(overdueCount > 0 || upcomingCount > 0 || newCount > 0) && (
          <div className="flex items-center gap-3 rounded-2xl" style={{ background: '#eef2f8', border: '1px solid #c7d7eb', padding: '12px 16px', marginBottom: '24px' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#1e3a5f', flexShrink: 0 }} />
            <p className="text-slate-700 font-medium" style={{ fontSize: '14px' }}>
              {[
                newCount > 0 && `${newCount} new valuation update${newCount > 1 ? 's' : ''} available`,
                overdueCount > 0 && `${overdueCount} maintenance item${overdueCount > 1 ? 's' : ''} overdue`,
                upcomingCount > 0 && `${upcomingCount} renewal${upcomingCount > 1 ? 's' : ''} approaching`,
              ].filter(Boolean).join(' · ')}
            </p>
            <Link to="/notifications" className="flex items-center gap-1 font-semibold ml-auto hover:opacity-70 transition-opacity whitespace-nowrap" style={{ color: '#1e3a5f', fontSize: '13px' }}>
              View All <ArrowRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '16px' }}>
          <div className="relative flex-1">
            <Search style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <Input placeholder='Search timeline… try "HVAC", "roof", "insurance"' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400"><X style={{ width: '15px', height: '15px' }} /></button>}
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
            <option value="all">All Types</option>
            {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>)}
          </select>
          <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
            <option value="all">All Properties</option>
            {propertyNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* ── Category Pills ── */}
        <div className="flex flex-wrap gap-2" style={{ marginBottom: '24px' }}>
          <button onClick={() => setFilterType('all')} className="font-semibold rounded-full border transition-all" style={{ padding: '5px 12px', fontSize: '12px', background: filterType === 'all' ? '#1e3a5f' : 'white', color: filterType === 'all' ? 'white' : '#64748b', borderColor: filterType === 'all' ? '#1e3a5f' : '#e2e8f0' }}>
            All
          </button>
          {EVENT_TYPES.slice(0, 7).map(t => (
            <button key={t.key} onClick={() => setFilterType(filterType === t.key ? 'all' : t.key)}
              className="font-semibold rounded-full border transition-all flex items-center gap-1"
              style={{ padding: '5px 12px', fontSize: '12px', background: filterType === t.key ? t.color : t.bg, color: filterType === t.key ? 'white' : t.color, borderColor: 'transparent' }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* ── Timeline ── */}
        {filtered.length === 0 ? (
          <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🕓</div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>
              Your home's story starts here.
            </p>
            <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '8px', maxWidth: '400px', margin: '0 auto 8px' }}>
              Log your first event to begin building your Home Timeline.
            </p>
            <p className="text-slate-300 italic" style={{ fontSize: '13px', marginBottom: '24px' }}>
              Every event you record becomes part of its permanent memory.
            </p>
            <button onClick={() => setShowAddModal(true)} className="font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '12px 28px', fontSize: '14px' }}>
              <Plus className="w-4 h-4 inline mr-2" /> Log Your First Event
            </button>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 font-medium" style={{ fontSize: '12px', marginBottom: '20px' }}>
              {filtered.length} events · click any event to expand
            </p>
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <div key={month} style={{ marginBottom: '32px' }}>
                {/* Month header */}
                <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl" style={{ padding: '6px 14px' }}>
                    <Calendar style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
                    <span className="font-semibold text-slate-600" style={{ fontSize: '12px' }}>{month}</span>
                    <span className="text-slate-400" style={{ fontSize: '12px' }}>· {monthEvents.length} events</span>
                  </div>
                  <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />
                  <span className="font-semibold text-slate-500" style={{ fontSize: '12px' }}>
                    ${monthEvents.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}
                  </span>
                </div>

                {monthEvents.map((event, i) => (
                  <EventCard key={event.id} event={event} isLast={i === monthEvents.length - 1} onDelete={id => setEvents(prev => prev.filter(e => e.id !== id))} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginTop: '32px' }}>
          <p className="text-slate-500 italic" style={{ fontSize: '14px' }}>
            HomeOS keeps your home's history alive — organized, searchable, and ready for every next chapter.
          </p>
        </div>
      </div>

      <AddEventModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={event => setEvents(prev => [event, ...prev])} properties={propertyNames} />
    </>
  );
};

export default HomeTimelinePage;
