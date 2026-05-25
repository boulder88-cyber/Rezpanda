import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useHome } from '@/contexts/HomeContext.jsx';
import {
  Clock, Search, Filter, Download, Plus, X,
  CreditCard, Wrench, FileText, TrendingUp, Shield,
  Users, TreePine, Bell, Home, Star, ChevronDown,
  CheckCircle2, AlertCircle, Zap, MoreHorizontal,
  Calendar, Tag, BookOpen, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

// ─── Event Type Config ────────────────────────────────────────────────
const EVENT_TYPES = [
  { key: 'bill', label: 'Bill Paid', icon: <CreditCard className="w-4 h-4" />, color: '#2563eb', bg: '#eff6ff', emoji: '💳' },
  { key: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" />, color: '#f97316', bg: '#fff7ed', emoji: '🔧' },
  { key: 'document', label: 'Document', icon: <FileText className="w-4 h-4" />, color: '#7c3aed', bg: '#f5f3ff', emoji: '📁' },
  { key: 'valuation', label: 'Valuation', icon: <TrendingUp className="w-4 h-4" />, color: '#059669', bg: '#ecfdf5', emoji: '📈' },
  { key: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" />, color: '#e8604c', bg: '#fdf0ee', emoji: '🛡️' },
  { key: 'rental', label: 'Rental', icon: <Users className="w-4 h-4" />, color: '#0891b2', bg: '#ecfeff', emoji: '🔑' },
  { key: 'landscaping', label: 'Landscaping', icon: <TreePine className="w-4 h-4" />, color: '#16a34a', bg: '#f0fdf4', emoji: '🌿' },
  { key: 'upgrade', label: 'Upgrade', icon: <Star className="w-4 h-4" />, color: '#d97706', bg: '#fffbeb', emoji: '⭐' },
  { key: 'inspection', label: 'Inspection', icon: <CheckCircle2 className="w-4 h-4" />, color: '#1e3a5f', bg: '#eef2f8', emoji: '✅' },
  { key: 'note', label: 'Note', icon: <BookOpen className="w-4 h-4" />, color: '#64748b', bg: '#f8fafc', emoji: '📝' },
  { key: 'utility', label: 'Utility', icon: <Zap className="w-4 h-4" />, color: '#f59e0b', bg: '#fffbeb', emoji: '⚡' },
  { key: 'other', label: 'Other', icon: <MoreHorizontal className="w-4 h-4" />, color: '#94a3b8', bg: '#f8fafc', emoji: '📦' },
];

const getEventType = (key) => EVENT_TYPES.find(t => t.key === key) || EVENT_TYPES[11];

// ─── Sample Events ────────────────────────────────────────────────────
const SAMPLE_EVENTS = [
  { id: 1, type: 'maintenance', property: 'Primary Home', title: 'HVAC Annual Service', description: 'Replaced filter, cleaned coils, recharged refrigerant. Unit in good condition.', date: '2026-05-15', vendor: 'Johnson & Miller HVAC', amount: 285, tags: ['HVAC', 'annual'] },
  { id: 2, type: 'bill', property: 'Primary Home', title: 'Electric Bill Paid', description: 'Georgia Power — May billing cycle', date: '2026-05-12', vendor: 'Georgia Power', amount: 142, tags: ['utilities', 'electric'] },
  { id: 3, type: 'document', property: 'Lake House', title: 'Homeowners Insurance Uploaded', description: 'State Farm policy HO-3. Coverage: $510,000 dwelling, $50K personal property.', date: '2026-05-10', vendor: 'State Farm', amount: null, tags: ['insurance', 'documents'] },
  { id: 4, type: 'valuation', property: 'Lake House', title: 'Property Value Updated', description: 'Zillow estimate updated. Value increased $12,000 from last quarter.', date: '2026-05-08', vendor: null, amount: 310000, tags: ['valuation', 'equity'] },
  { id: 5, type: 'maintenance', property: 'Lake House', title: 'Roof Inspection Completed', description: 'Annual roof inspection. Found minor granule loss on south-facing slope. Monitor next year.', date: '2026-05-05', vendor: 'AtlantaRoof Pro', amount: 175, tags: ['roof', 'inspection'] },
  { id: 6, type: 'bill', property: 'Primary Home', title: 'Internet Bill Paid', description: 'Comcast Xfinity — May', date: '2026-05-01', vendor: 'Comcast Xfinity', amount: 89, tags: ['utilities', 'internet'] },
  { id: 7, type: 'upgrade', property: 'Primary Home', title: 'Smart Thermostat Installed', description: 'Nest Learning Thermostat installed. Estimated $180/year energy savings.', date: '2026-04-22', vendor: 'Best Buy + Self Install', amount: 249, tags: ['smart home', 'upgrade'] },
  { id: 8, type: 'inspection', property: 'Primary Home', title: 'Annual Home Inspection', description: 'Full 200-point inspection. Minor caulking needed around master bath. No structural issues.', date: '2026-04-15', vendor: 'HomeCheck Atlanta', amount: 350, tags: ['inspection', 'annual'] },
  { id: 9, type: 'insurance', property: 'Primary Home', title: 'Insurance Renewal Completed', description: 'State Farm HO-3 renewed for 2026-2027. Premium increased $240/year.', date: '2026-04-01', vendor: 'State Farm', amount: 1840, tags: ['insurance', 'renewal'] },
  { id: 10, type: 'maintenance', property: 'Primary Home', title: 'Pest Control Service', description: 'Quarterly perimeter treatment. No active infestations found.', date: '2026-03-20', vendor: 'Terminix', amount: 125, tags: ['pest control', 'quarterly'] },
  { id: 11, type: 'landscaping', property: 'Lake House', title: 'Spring Landscaping', description: 'Mulch refresh, pruning, and new plantings. Front and back yard completed.', date: '2026-03-15', vendor: 'Green Thumb Landscaping', amount: 680, tags: ['landscaping', 'spring'] },
  { id: 12, type: 'bill', property: 'Lake House', title: 'Property Tax Payment', description: 'Gwinnett County Q1 property tax installment paid.', date: '2026-03-01', vendor: 'Gwinnett County', amount: 1420, tags: ['tax', 'property tax'] },
];

// ─── Add Event Modal ──────────────────────────────────────────────────
const AddEventModal = ({ open, onClose, onSave, properties }) => {
  const [form, setForm] = useState({
    type: 'maintenance', property: properties[0] || '', title: '',
    description: '', date: new Date().toISOString().split('T')[0],
    vendor: '', amount: '', tags: ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Timeline Event</DialogTitle>
          <p className="text-slate-500 text-sm">Every event you add becomes part of your home's permanent memory.</p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Event type grid */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Event Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.slice(0, 8).map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set('type', t.key)}
                  className="p-2 rounded-xl border text-center transition-all"
                  style={form.type === t.key
                    ? { background: t.color, borderColor: t.color, color: '#fff' }
                    : { background: t.bg, borderColor: '#e2e8f0', color: t.color }
                  }
                >
                  <div className="text-lg mb-0.5">{t.emoji}</div>
                  <span className="text-xs font-medium leading-tight block">{t.label.split(' ')[0]}</span>
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
            <textarea
              placeholder="Details, notes, findings..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
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
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tags (comma separated)</Label>
            <Input placeholder="HVAC, annual, inspection..." value={form.tags} onChange={e => set('tags', e.target.value)} className="h-11 rounded-xl" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => {
                if (!form.title) return;
                onSave({
                  ...form, id: Date.now(),
                  amount: parseFloat(form.amount) || null,
                  tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
                });
                onClose();
              }}
              disabled={!form.title}
              className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50"
              style={{ background: '#1e3a5f' }}
            >
              Add to Timeline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Timeline Event Card ──────────────────────────────────────────────
const EventCard = ({ event, onDelete }) => {
  const et = getEventType(event.type);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex gap-4 group">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm z-10" style={{ background: et.bg }}>
          {et.emoji}
        </div>
        <div className="w-0.5 flex-1 mt-2" style={{ background: '#e2e8f0', minHeight: '24px' }}></div>
      </div>

      {/* Event content */}
      <div className="flex-1 pb-6">
        <div
          className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-5"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: et.bg, color: et.color }}>
                  {et.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {event.property}
                </span>
                {event.amount && (
                  <span className="text-xs font-bold text-slate-600 ml-auto">
                    ${event.amount.toLocaleString()}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{event.title}</h3>
              {event.vendor && (
                <p className="text-xs text-slate-400 mt-0.5">{event.vendor}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-400 whitespace-nowrap">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <ChevronDown className={`w-4 h-4 text-slate-300 mt-1 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Expanded detail */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
              {event.description && (
                <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
              )}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Remove from timeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Export to CSV ────────────────────────────────────────────────────
const exportTimeline = (events) => {
  const headers = ['Date', 'Property', 'Type', 'Title', 'Vendor', 'Amount', 'Description', 'Tags'];
  const rows = events.map(e => [
    e.date, e.property, e.type, e.title,
    e.vendor || '', e.amount ? `$${e.amount}` : '',
    e.description || '', (e.tags || []).join('; ')
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `home-timeline-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

// ─── Group events by month ────────────────────────────────────────────
const groupByMonth = (events) => {
  const groups = {};
  events.forEach(e => {
    const key = new Date(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return groups;
};

// ─── Main Page ────────────────────────────────────────────────────────
const HomeTimelinePage = () => {
  const { selectedHome, homes } = useHome();
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const propertyNames = homes?.map(h => h.name) || ['Primary Home', 'Lake House'];

  const filtered = useMemo(() => {
    return events
      .filter(e => {
        const matchSearch = !searchQuery ||
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchType = filterType === 'all' || e.type === filterType;
        const matchProperty = filterProperty === 'all' || e.property === filterProperty;
        return matchSearch && matchType && matchProperty;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, searchQuery, filterType, filterProperty]);

  const grouped = groupByMonth(filtered);
  const totalSpend = events.reduce((s, e) => s + (e.amount || 0), 0);
  const thisYear = events.filter(e => new Date(e.date).getFullYear() === new Date().getFullYear()).length;

  return (
    <>
      <Helmet><title>Home Timeline — CasaOS Memory Layer</title></Helmet>

      <div className="max-w-4xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-white">Home Timeline</h1>
              </div>
              <p className="text-blue-200 text-base max-w-xl leading-relaxed">
                Every event your home experiences — captured, organized, and remembered automatically.
              </p>
              <p className="text-blue-300 text-sm mt-2 max-w-xl leading-relaxed">
                Bills, maintenance, valuations, documents, upgrades, inspections — every action becomes part of your home's permanent memory.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-green-300" />
                <span className="text-blue-200 text-xs">This is the layer no other home platform has. This is what makes CasaOS an operating system.</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-[#e8604c] hover:bg-[#d4503c] text-white rounded-xl font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Event
              </Button>
              <Button
                variant="outline"
                onClick={() => exportTimeline(filtered)}
                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" /> Export History
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Total Events', value: events.length, sub: 'in your timeline' },
              { label: 'This Year', value: thisYear, sub: 'events logged' },
              { label: 'Total Tracked', value: `$${(totalSpend/1000).toFixed(1)}K`, sub: 'in spending' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
                <p className="text-blue-300 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder='Search timeline... try "HVAC", "roof", "insurance"'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
          >
            <option value="all">All Types</option>
            {EVENT_TYPES.map(t => (
              <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
            ))}
          </select>
          <select
            value={filterProperty}
            onChange={e => setFilterProperty(e.target.value)}
            className="h-11 px-4 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700"
          >
            <option value="all">All Properties</option>
            {propertyNames.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Category quick filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilterType('all')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={filterType === 'all' ? { background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' } : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}
          >
            All
          </button>
          {EVENT_TYPES.slice(0, 6).map(t => (
            <button
              key={t.key}
              onClick={() => setFilterType(filterType === t.key ? 'all' : t.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5"
              style={filterType === t.key
                ? { background: t.color, color: '#fff', borderColor: t.color }
                : { background: t.bg, color: t.color, borderColor: 'transparent' }
              }
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="text-5xl mb-4">🕓</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Your home's story starts here</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-2 text-sm">
              As you pay bills, complete maintenance, and upload documents, CasaOS builds a living timeline of your home's history.
            </p>
            <p className="text-slate-400 text-xs mb-8">Every event you record becomes part of its permanent memory.</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="font-bold text-white px-8 h-12 rounded-xl"
              style={{ background: '#1e3a5f' }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Your First Event
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-400 mb-6 font-medium">{filtered.length} events · click any event to expand details</p>
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <div key={month} className="mb-8">
                {/* Month header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{month}</span>
                    <span className="text-xs text-slate-400">· {monthEvents.length} events</span>
                  </div>
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-xs font-bold text-slate-500">
                    ${monthEvents.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}
                  </span>
                </div>

                {/* Events */}
                <div>
                  {monthEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={id => setEvents(prev => prev.filter(e => e.id !== id))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer tagline */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
          <p className="text-slate-500 text-sm italic">
            "CasaOS turns your homes into a living portfolio — every property tracked, valued, and optimized automatically."
          </p>
        </div>
      </div>

      <AddEventModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={event => setEvents(prev => [event, ...prev])}
        properties={propertyNames}
      />
    </>
  );
};

export default HomeTimelinePage;

