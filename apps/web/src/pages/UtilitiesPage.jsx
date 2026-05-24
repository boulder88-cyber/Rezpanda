import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  Plus, Trash2, Zap, ExternalLink, Calendar, ShieldCheck,
  Droplets, Wifi, Flame, Trash, MoreHorizontal, DollarSign,
  TrendingUp, TrendingDown, Bell, AlertCircle, CheckCircle2,
  BarChart2, Download, Search, X, Edit2, Phone, Clock,
  ArrowUpRight, ArrowDownRight, Lightbulb
} from 'lucide-react';

// ─── Utility Type Config ──────────────────────────────────────────────
const UTILITY_TYPES = [
  { key: 'electric', label: 'Electric', icon: <Zap className="w-5 h-5" />, color: '#f59e0b', bg: '#fffbeb', emoji: '⚡' },
  { key: 'gas', label: 'Gas', icon: <Flame className="w-5 h-5" />, color: '#f97316', bg: '#fff7ed', emoji: '🔥' },
  { key: 'water', label: 'Water', icon: <Droplets className="w-5 h-5" />, color: '#0ea5e9', bg: '#f0f9ff', emoji: '💧' },
  { key: 'internet', label: 'Internet', icon: <Wifi className="w-5 h-5" />, color: '#6366f1', bg: '#eef2ff', emoji: '📶' },
  { key: 'trash', label: 'Trash', icon: <Trash className="w-5 h-5" />, color: '#64748b', bg: '#f8fafc', emoji: '🗑️' },
  { key: 'other', label: 'Other', icon: <MoreHorizontal className="w-5 h-5" />, color: '#94a3b8', bg: '#f8fafc', emoji: '📦' },
];

const getType = (key) => UTILITY_TYPES.find(t => t.key === key) || UTILITY_TYPES[5];

// ─── Smart Defaults Directory ─────────────────────────────────────────
const QUICK_ADD = [
  { providerName: 'Georgia Power', utilityType: 'electric', payOnlineLink: 'https://www.georgiapower.com' },
  { providerName: 'Atlanta Gas Light', utilityType: 'gas', payOnlineLink: 'https://www.atlantagaslight.com' },
  { providerName: 'Atlanta Watershed', utilityType: 'water', payOnlineLink: 'https://www.atlantawatershed.org' },
  { providerName: 'Comcast Xfinity', utilityType: 'internet', payOnlineLink: 'https://www.xfinity.com' },
  { providerName: 'AT&T Internet', utilityType: 'internet', payOnlineLink: 'https://www.att.com' },
  { providerName: 'Republic Services', utilityType: 'trash', payOnlineLink: 'https://www.republicservices.com' },
];

// ─── Summary Cards ────────────────────────────────────────────────────
const SummaryCards = ({ utilities }) => {
  const totalMonthly = utilities.reduce((s, u) => s + (parseFloat(u.monthlyAmount) || 0), 0);
  const withPayLinks = utilities.filter(u => u.payOnlineLink).length;

  const now = new Date();
  const upcoming = utilities.filter(u => {
    if (!u.billingCycleDay) return false;
    const daysUntil = u.billingCycleDay - now.getDate();
    return daysUntil >= 0 && daysUntil <= 7;
  });

  const overBudget = utilities.filter(u =>
    u.monthlyBudget && u.monthlyAmount && parseFloat(u.monthlyAmount) > parseFloat(u.monthlyBudget)
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#c7d5e8' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#eef2f8' }}>
          <DollarSign className="w-4 h-4" style={{ color: '#1e3a5f' }} />
        </div>
        <p className="text-2xl font-extrabold text-slate-900">${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">Est. Monthly Total</p>
        <p className="text-xs text-slate-400 mt-0.5">across {utilities.length} providers</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: upcoming.length > 0 ? '#fde68a' : '#e2e8f0' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: upcoming.length > 0 ? '#fffbeb' : '#f8fafc' }}>
          <Bell className="w-4 h-4" style={{ color: upcoming.length > 0 ? '#d97706' : '#94a3b8' }} />
        </div>
        <p className="text-2xl font-extrabold text-slate-900">{upcoming.length}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">Due This Week</p>
        <p className="text-xs text-slate-400 mt-0.5">{upcoming.length > 0 ? 'Bills coming up soon' : 'Nothing due this week'}</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: overBudget.length > 0 ? '#fecaca' : '#a7f3d0' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: overBudget.length > 0 ? '#fef2f2' : '#ecfdf5' }}>
          {overBudget.length > 0
            ? <TrendingUp className="w-4 h-4 text-red-500" />
            : <CheckCircle2 className="w-4 h-4 text-green-500" />}
        </div>
        <p className="text-2xl font-extrabold text-slate-900">{overBudget.length}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">Over Budget</p>
        <p className="text-xs text-slate-400 mt-0.5">{overBudget.length > 0 ? 'Needs attention' : 'All within budget'}</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#a7f3d0' }}>
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-3">
          <Zap className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-2xl font-extrabold text-slate-900">{withPayLinks}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">Quick Pay Ready</p>
        <p className="text-xs text-slate-400 mt-0.5">one-click payment</p>
      </div>
    </div>
  );
};

// ─── Spend Breakdown Chart ────────────────────────────────────────────
const SpendBreakdown = ({ utilities }) => {
  const withAmounts = utilities.filter(u => u.monthlyAmount);
  if (withAmounts.length === 0) return null;

  const total = withAmounts.reduce((s, u) => s + parseFloat(u.monthlyAmount || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-slate-400" /> Monthly Cost Breakdown
      </h3>
      <div className="space-y-3">
        {withAmounts
          .sort((a, b) => parseFloat(b.monthlyAmount) - parseFloat(a.monthlyAmount))
          .map(u => {
            const cfg = getType(u.utilityType);
            const amt = parseFloat(u.monthlyAmount);
            const pct = total > 0 ? (amt / total * 100) : 0;
            const budget = parseFloat(u.monthlyBudget);
            const overBudget = budget > 0 && amt > budget;
            return (
              <div key={u.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: cfg.bg }}>
                      {cfg.emoji}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{u.providerName}</span>
                    {overBudget && (
                      <span className="text-xs font-bold text-red-500 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> over budget
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">${amt.toLocaleString(undefined, { minimumFractionDigits: 0 })}/mo</span>
                    {budget > 0 && (
                      <span className={`text-xs ml-2 ${overBudget ? 'text-red-400' : 'text-green-500'}`}>
                        budget: ${budget.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: overBudget ? '#dc2626' : cfg.color }}></div>
                </div>
              </div>
            );
          })
        }
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Total Monthly</span>
        <span className="text-lg font-extrabold text-slate-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};

// ─── Utility Provider Card ────────────────────────────────────────────
const UtilityCard = ({ util, onDelete, onEdit }) => {
  const cfg = getType(util.utilityType);
  const now = new Date();
  const daysUntilBill = util.billingCycleDay ? util.billingCycleDay - now.getDate() : null;
  const billSoon = daysUntilBill !== null && daysUntilBill >= 0 && daysUntilBill <= 7;
  const budget = parseFloat(util.monthlyBudget);
  const amount = parseFloat(util.monthlyAmount);
  const overBudget = budget > 0 && amount > budget;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${billSoon ? 'border-amber-200' : overBudget ? 'border-red-200' : 'border-slate-100'}`}>
      {billSoon && <div className="h-1 rounded-t-2xl" style={{ background: '#f59e0b' }}></div>}
      {overBudget && !billSoon && <div className="h-1 rounded-t-2xl bg-red-400"></div>}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: cfg.bg }}>
              {cfg.emoji}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{util.providerName}</h3>
              <p className="text-xs font-semibold capitalize" style={{ color: cfg.color }}>{cfg.label}</p>
            </div>
          </div>
          {amount > 0 && (
            <div className="text-right">
              <p className="text-lg font-extrabold text-slate-900">${amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
              <p className="text-xs text-slate-400">/month</p>
            </div>
          )}
        </div>

        {/* Budget indicator */}
        {budget > 0 && amount > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Budget: ${budget.toFixed(0)}/mo</span>
              <span className={`text-xs font-bold ${overBudget ? 'text-red-500' : 'text-green-600'}`}>
                {overBudget ? `$${(amount - budget).toFixed(0)} over` : `$${(budget - amount).toFixed(0)} under`}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${Math.min((amount / budget) * 100, 100)}%`,
                background: overBudget ? '#dc2626' : '#059669'
              }}></div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {util.accountNumber && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold">Acct:</span> {util.accountNumber}
            </div>
          )}
          {util.billingCycleDay && (
            <div className={`flex items-center gap-2 text-xs font-medium ${billSoon ? 'text-amber-600' : 'text-slate-500'}`}>
              <Calendar className="w-3.5 h-3.5" />
              Due day {util.billingCycleDay} each month
              {billSoon && ` · Due in ${daysUntilBill} day${daysUntilBill !== 1 ? 's' : ''}!`}
            </div>
          )}
          {util.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5" /> {util.phone}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          {util.payOnlineLink ? (
            <a
              href={util.payOnlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#1e3a5f' }}
            >
              Pay Online <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <div className="flex-1" />
          )}
          <button onClick={() => onEdit(util)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(util.id)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-300 hover:bg-red-100 hover:text-red-500 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add/Edit Modal ───────────────────────────────────────────────────
const UtilityModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState(initial || {
    providerName: '', utilityType: 'electric', accountNumber: '',
    payOnlineLink: '', billingCycleDay: '', monthlyAmount: '',
    monthlyBudget: '', phone: '', notes: ''
  });

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ providerName: '', utilityType: 'electric', accountNumber: '', payOnlineLink: '', billingCycleDay: '', monthlyAmount: '', monthlyBudget: '', phone: '', notes: '' });
  }, [initial, open]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{initial ? 'Edit Provider' : 'Add Utility Provider'}</DialogTitle>
          <p className="text-slate-500 text-sm">Link your accounts or add manually to start monitoring costs.</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick add buttons */}
          {!initial && (
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-2 block">Quick Add Common Providers</Label>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_ADD.map((qa, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, ...qa }))}
                    className="p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                  >
                    {getType(qa.utilityType).emoji} {qa.providerName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Utility Type */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Service Type</Label>
            <div className="grid grid-cols-6 gap-2">
              {UTILITY_TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set('utilityType', t.key)}
                  className="p-2 rounded-xl border text-center transition-all"
                  style={form.utilityType === t.key
                    ? { background: t.color, borderColor: t.color, color: '#fff' }
                    : { background: t.bg, borderColor: '#e2e8f0', color: t.color }
                  }
                >
                  <div className="text-lg mb-0.5">{t.emoji}</div>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Provider Name *</Label>
            <Input placeholder="e.g. Georgia Power, Comcast Xfinity" value={form.providerName} onChange={e => set('providerName', e.target.value)} className="h-11 rounded-xl" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Monthly Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" step="0.01" placeholder="120.00" value={form.monthlyAmount} onChange={e => set('monthlyAmount', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" step="0.01" placeholder="150.00" value={form.monthlyBudget} onChange={e => set('monthlyBudget', e.target.value)} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Billing Day (1-31)</Label>
              <Input type="number" min="1" max="31" placeholder="15" value={form.billingCycleDay} onChange={e => set('billingCycleDay', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Account Number</Label>
              <Input placeholder="123456789" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Pay Online URL</Label>
              <Input type="url" placeholder="https://..." value={form.payOnlineLink} onChange={e => set('payOnlineLink', e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Service Phone</Label>
              <Input placeholder="1-800-555-0000" value={form.phone} onChange={e => set('phone', e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              type="button"
              onClick={() => { onSave(form); }}
              disabled={!form.providerName}
              className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50"
              style={{ background: '#1e3a5f' }}
            >
              {initial ? 'Save Changes' : 'Add Provider'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const UtilitiesPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUtil, setEditingUtil] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (selectedHome) loadUtilities();
  }, [selectedHome]);

  const loadUtilities = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('utilities').getFullList({
        filter: `homeId = "${selectedHome.id}"`,
        sort: 'providerName',
        $autoCancel: false
      });
      setUtilities(records);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load utilities', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (editingUtil) {
        await pb.collection('utilities').update(editingUtil.id, form, { $autoCancel: false });
        toast({ title: '✅ Provider updated!' });
      } else {
        await pb.collection('utilities').create({ ...form, homeId: selectedHome.id, ownerId: currentUser.id }, { $autoCancel: false });
        toast({ title: '✅ Provider added successfully!' });
      }
      setIsModalOpen(false);
      setEditingUtil(null);
      loadUtilities();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save provider', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this utility provider?')) return;
    try {
      await pb.collection('utilities').delete(id, { $autoCancel: false });
      toast({ title: 'Provider removed' });
      loadUtilities();
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleEdit = (util) => {
    setEditingUtil(util);
    setIsModalOpen(true);
  };

  const filtered = useMemo(() => utilities.filter(u => {
    const matchSearch = !searchQuery || u.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || u.utilityType === filterType;
    return matchSearch && matchType;
  }), [utilities, searchQuery, filterType]);

  if (!selectedHome) {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center max-w-lg mx-auto mt-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#eef2f8' }}>
          <span className="text-2xl">🏠</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No property selected</h3>
        <p className="text-slate-500 text-sm mb-4">Select a property from the top menu to get started.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          <span className="text-amber-600 text-xs font-medium">👆 Use the property selector in the top right</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Utilities — CasaCEO</title></Helmet>

      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Utilities</h1>
              <p className="text-blue-200 text-base leading-relaxed max-w-xl">
                Manage providers, track bills, monitor budgets, and forecast costs for all your properties.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <ShieldCheck className="w-4 h-4 text-green-300" />
                <span className="text-blue-200 text-xs">Your billing data is encrypted and securely stored.</span>
              </div>
            </div>
            <Button
              onClick={() => { setEditingUtil(null); setIsModalOpen(true); }}
              className="bg-[#e8604c] hover:bg-[#d4503c] text-white rounded-xl font-bold shadow-lg flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Provider
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : utilities.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="flex justify-center gap-3 mb-6 text-4xl">⚡ 💧 📶</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No utility providers added yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-2">
              Stay on top of your home's essential services — add your first provider and start tracking bills and usage.
            </p>
            <p className="text-slate-400 text-sm mb-8">Link your accounts or add manually to start monitoring costs.</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="font-bold text-white px-8 h-12 rounded-xl"
              style={{ background: '#1e3a5f' }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Your First Provider
            </Button>
          </div>
        ) : (
          <>
            <SummaryCards utilities={utilities} />

            {/* Insight Banner */}
            {utilities.some(u => u.monthlyAmount && u.monthlyBudget && parseFloat(u.monthlyAmount) > parseFloat(u.monthlyBudget)) && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700 text-sm">Some utilities are over budget</p>
                  <p className="text-red-500 text-xs mt-0.5">Review your usage or update your budget targets below.</p>
                </div>
              </div>
            )}

            <SpendBreakdown utilities={utilities} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input placeholder="Search providers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400"><X className="w-4 h-4" /></button>}
              </div>
              <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setFilterType('all')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={filterType === 'all' ? { background: '#1e3a5f', color: '#fff' } : { color: '#64748b' }}
                >
                  All
                </button>
                {UTILITY_TYPES.slice(0, 4).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setFilterType(t.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={filterType === t.key ? { background: t.color, color: '#fff' } : { color: '#64748b' }}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(util => (
                <UtilityCard key={util.id} util={util} onDelete={handleDelete} onEdit={handleEdit} />
              ))}
            </div>

            {/* Tip */}
            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 text-sm">Pro Tip</p>
                <p className="text-amber-600 text-xs mt-1">Add a monthly budget for each utility to track overspending at a glance. Set a budget in the edit screen of any provider.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <UtilityModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUtil(null); }}
        onSave={handleSave}
        initial={editingUtil}
      />
    </>
  );
};

export default UtilitiesPage;
