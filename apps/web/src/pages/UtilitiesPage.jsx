import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
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
  TrendingUp, Bell, AlertCircle, CheckCircle2,
  BarChart2, Download, Search, X, Edit2, Phone,
  ArrowUpRight, Lightbulb, ChevronRight, Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const UTILITY_TYPES = [
  { key: 'electric', label: 'Electric', icon: Zap, color: '#f59e0b', bg: '#fffbeb', emoji: '⚡' },
  { key: 'gas', label: 'Gas', icon: Flame, color: '#f97316', bg: '#fff7ed', emoji: '🔥' },
  { key: 'water', label: 'Water', icon: Droplets, color: '#0ea5e9', bg: '#f0f9ff', emoji: '💧' },
  { key: 'internet', label: 'Internet', icon: Wifi, color: '#6366f1', bg: '#eef2ff', emoji: '🌐' },
  { key: 'trash', label: 'Waste', icon: Trash, color: '#64748b', bg: '#f8fafc', emoji: '🗑️' },
  { key: 'other', label: 'Other', icon: MoreHorizontal, color: '#94a3b8', bg: '#f8fafc', emoji: '📦' },
];

const QUICK_ADD = [
  { providerName: 'Georgia Power', utilityType: 'electric', payOnlineLink: 'https://www.georgiapower.com' },
  { providerName: 'Atlanta Gas Light', utilityType: 'gas', payOnlineLink: 'https://www.atlantagaslight.com' },
  { providerName: 'Atlanta Watershed', utilityType: 'water', payOnlineLink: 'https://www.atlantawatershed.org' },
  { providerName: 'Comcast Xfinity', utilityType: 'internet', payOnlineLink: 'https://www.xfinity.com' },
  { providerName: 'AT&T Internet', utilityType: 'internet', payOnlineLink: 'https://www.att.com' },
  { providerName: 'Republic Services', utilityType: 'trash', payOnlineLink: 'https://www.republicservices.com' },
];

const getType = (key) => UTILITY_TYPES.find(t => t.key === key) || UTILITY_TYPES[5];

// ═══════════════════════════════════════════════════════════════════════
// SPEND BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════

const SpendBreakdown = ({ utilities }) => {
  const withAmounts = utilities.filter(u => u.monthlyAmount);
  if (withAmounts.length === 0) return null;

  const total = withAmounts.reduce((s, u) => s + parseFloat(u.monthlyAmount || 0), 0);
  const annual = total * 12;

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <h3 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px' }}>
          <BarChart2 style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> Monthly Cost Breakdown
        </h3>
        <div className="text-right">
          <p className="text-slate-400" style={{ fontSize: '11px' }}>Annual Projection</p>
          <p className="font-bold text-slate-900" style={{ fontSize: '15px' }}>${annual.toLocaleString(undefined, { minimumFractionDigits: 0 })}/yr</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {withAmounts.sort((a, b) => parseFloat(b.monthlyAmount) - parseFloat(a.monthlyAmount)).map(u => {
          const cfg = getType(u.utilityType);
          const amt = parseFloat(u.monthlyAmount);
          const pct = total > 0 ? (amt / total * 100) : 0;
          const budget = parseFloat(u.monthlyBudget);
          const overBudget = budget > 0 && amt > budget;
          return (
            <div key={u.id}>
              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '16px' }}>{cfg.emoji}</span>
                  <span className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{u.providerName}</span>
                  {overBudget && (
                    <span className="font-bold text-red-500 flex items-center gap-0.5" style={{ fontSize: '11px' }}>
                      <ArrowUpRight style={{ width: '11px', height: '11px' }} /> over budget
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900" style={{ fontSize: '13px' }}>${amt.toLocaleString(undefined, { minimumFractionDigits: 0 })}/mo</span>
                  {budget > 0 && (
                    <span className={`ml-2`} style={{ fontSize: '11px', color: overBudget ? '#ef4444' : '#059669' }}>
                      budget: ${budget.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '7px' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: overBudget ? '#dc2626' : cfg.color }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px' }}>
        <span className="font-semibold text-slate-500" style={{ fontSize: '12px' }}>Total Monthly</span>
        <span className="font-extrabold text-slate-900" style={{ fontSize: '18px' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// UTILITY CARD
// ═══════════════════════════════════════════════════════════════════════

const UtilityCard = ({ util, onDelete, onEdit }) => {
  const cfg = getType(util.utilityType);
  const now = new Date();
  const daysUntilBill = util.billingCycleDay ? util.billingCycleDay - now.getDate() : null;
  const billSoon = daysUntilBill !== null && daysUntilBill >= 0 && daysUntilBill <= 7;
  const budget = parseFloat(util.monthlyBudget);
  const amount = parseFloat(util.monthlyAmount);
  const overBudget = budget > 0 && amount > budget;

  return (
    <div className="bg-white hover:shadow-md transition-all overflow-hidden" style={{
      borderRadius: '12px',
      border: `1px solid ${billSoon ? '#fde68a' : overBudget ? '#fecaca' : '#e2e8f0'}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {(billSoon || overBudget) && <div style={{ height: '3px', background: billSoon ? '#f59e0b' : '#ef4444' }} />}
      <div style={{ padding: '16px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '10px', background: cfg.bg, fontSize: '20px' }}>
              {cfg.emoji}
            </div>
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{util.providerName}</p>
              <p className="font-semibold capitalize" style={{ fontSize: '12px', color: cfg.color }}>{cfg.label}</p>
            </div>
          </div>
          {amount > 0 && (
            <div className="text-right">
              <p className="font-extrabold text-slate-900" style={{ fontSize: '18px', lineHeight: 1 }}>${amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>/month</p>
            </div>
          )}
        </div>

        {budget > 0 && amount > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <span className="text-slate-400" style={{ fontSize: '11px' }}>Budget: ${budget.toFixed(0)}/mo</span>
              <span className="font-semibold" style={{ fontSize: '11px', color: overBudget ? '#ef4444' : '#059669' }}>
                {overBudget ? `$${(amount - budget).toFixed(0)} over` : `$${(budget - amount).toFixed(0)} under`}
              </span>
            </div>
            <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '5px' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min((amount / budget) * 100, 100)}%`, background: overBudget ? '#dc2626' : '#059669' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
          {util.accountNumber && (
            <p className="text-slate-400" style={{ fontSize: '12px' }}>Acct: {util.accountNumber}</p>
          )}
          {util.billingCycleDay && (
            <p className="flex items-center gap-1.5 font-medium" style={{ fontSize: '12px', color: billSoon ? '#f59e0b' : '#94a3b8' }}>
              <Calendar style={{ width: '12px', height: '12px' }} />
              Day {util.billingCycleDay} each month
              {billSoon && ` · Due in ${daysUntilBill}d!`}
            </p>
          )}
          {util.phone && (
            <p className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '12px' }}>
              <Phone style={{ width: '12px', height: '12px' }} /> {util.phone}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          {util.payOnlineLink ? (
            <a href={util.payOnlineLink} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 font-bold text-white hover:opacity-90 transition-all rounded-xl"
              style={{ height: '34px', fontSize: '12px', background: '#1e3a5f' }}>
              Pay Online <ExternalLink style={{ width: '11px', height: '11px' }} />
            </a>
          ) : <div className="flex-1" />}
          <button onClick={() => onEdit(util)} className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" style={{ width: '34px', height: '34px' }}>
            <Edit2 style={{ width: '13px', height: '13px', color: '#64748b' }} />
          </button>
          <button onClick={() => onDelete(util.id)} className="flex items-center justify-center rounded-xl hover:bg-red-100 transition-colors" style={{ width: '34px', height: '34px', background: '#fef2f2' }}>
            <Trash2 style={{ width: '13px', height: '13px', color: '#f87171' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          {!initial && (
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-2 block">Quick Add Common Providers</Label>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_ADD.map((qa, i) => (
                  <button key={i} type="button" onClick={() => setForm(f => ({ ...f, ...qa }))}
                    className="p-2 rounded-xl border border-slate-200 text-left hover:border-slate-400 hover:bg-slate-50 transition-all"
                    style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                    {getType(qa.utilityType).emoji} {qa.providerName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Service Type</Label>
            <div className="grid grid-cols-6 gap-2">
              {UTILITY_TYPES.map(t => (
                <button key={t.key} type="button" onClick={() => set('utilityType', t.key)}
                  className="p-2 rounded-xl border text-center transition-all"
                  style={form.utilityType === t.key ? { background: t.color, borderColor: t.color, color: 'white' } : { background: t.bg, borderColor: '#e2e8f0', color: t.color }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>{t.emoji}</div>
                  <span style={{ fontSize: '10px', fontWeight: 500 }}>{t.label}</span>
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

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button type="button" onClick={() => onSave(form)} disabled={!form.providerName} className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: '#1e3a5f' }}>
              {initial ? 'Save Changes' : 'Add Provider'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

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

  useEffect(() => { if (selectedHome) loadUtilities(); }, [selectedHome]);

  const loadUtilities = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('utilities').getFullList({ filter: `homeId = "${selectedHome.id}"`, sort: 'providerName', $autoCancel: false });
      setUtilities(records);
    } catch { toast({ title: 'Error', description: 'Failed to load utilities', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    try {
      if (editingUtil) {
        await pb.collection('utilities').update(editingUtil.id, form, { $autoCancel: false });
        toast({ title: '✅ Provider updated!' });
      } else {
        await pb.collection('utilities').create({ ...form, homeId: selectedHome.id, ownerId: currentUser.id }, { $autoCancel: false });
        toast({ title: '✅ Provider added!' });
      }
      setIsModalOpen(false); setEditingUtil(null); loadUtilities();
    } catch { toast({ title: 'Error', description: 'Failed to save provider', variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this utility provider?')) return;
    try {
      await pb.collection('utilities').delete(id, { $autoCancel: false });
      toast({ title: 'Provider removed' }); loadUtilities();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filtered = useMemo(() => utilities.filter(u => {
    const matchSearch = !searchQuery || u.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || u.utilityType === filterType;
    return matchSearch && matchType;
  }), [utilities, searchQuery, filterType]);

  // Stats
  const totalMonthly = utilities.reduce((s, u) => s + (parseFloat(u.monthlyAmount) || 0), 0);
  const annualForecast = totalMonthly * 12;
  const overBudgetCount = utilities.filter(u => u.monthlyBudget && u.monthlyAmount && parseFloat(u.monthlyAmount) > parseFloat(u.monthlyBudget)).length;
  const now = new Date();
  const dueSoonCount = utilities.filter(u => {
    if (!u.billingCycleDay) return false;
    const d = u.billingCycleDay - now.getDate();
    return d >= 0 && d <= 7;
  }).length;
  const efficiencyScore = utilities.length === 0 ? 0 : Math.max(0, 100 - (overBudgetCount * 15));

  if (!selectedHome) {
    return (
      <div className="bg-white text-center max-w-lg mx-auto" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px', marginTop: '32px' }}>
        <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eef2f8', marginBottom: '16px', fontSize: '28px' }}>🏠</div>
        <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No property selected.</p>
        <p className="text-slate-400" style={{ fontSize: '14px' }}>Select a property from the top menu to get started.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Utilities — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Utilities</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', flexShrink: 0 }}>
                <Zap style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Utilities</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px', maxWidth: '520px', lineHeight: '1.6' }}>
                  Manage essential services across all your properties — electricity, water, gas, internet, and waste. Track bills, monitor usage, and identify savings opportunities.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <button onClick={() => { setEditingUtil(null); setIsModalOpen(true); }} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Provider
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : utilities.length === 0 ? (
          <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
            <div className="flex justify-center gap-4" style={{ fontSize: '36px', marginBottom: '20px' }}>⚡ 💧 🌐 🔥 🗑️</div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No utility providers added yet.</p>
            <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '6px' }}>
              Stay on top of your home's essential services — add your first provider and start tracking bills and usage.
            </p>
            <p className="text-slate-300 italic" style={{ fontSize: '13px', marginBottom: '24px' }}>
              Link your accounts automatically or add them manually to begin monitoring costs and efficiency.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '12px 28px', fontSize: '14px' }}>
              <Plus className="w-4 h-4 inline mr-2" /> Add Your First Provider
            </button>
          </div>
        ) : (
          <>
            {/* Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '16px' }}>
              {[
                { label: 'Active Providers', value: utilities.length, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
                { label: 'Monthly Spend', value: `$${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, color: dueSoonCount > 0 ? '#d97706' : '#1e3a5f', bg: dueSoonCount > 0 ? '#fffbeb' : '#eef2f8', border: dueSoonCount > 0 ? '#fde68a' : '#c7d7eb' },
                { label: 'Annual Forecast', value: `$${(annualForecast / 1000).toFixed(1)}K`, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                { label: 'Efficiency Score', value: utilities.length > 0 ? `${efficiencyScore}%` : '—', color: efficiencyScore >= 80 ? '#059669' : efficiencyScore >= 60 ? '#d97706' : '#dc2626', bg: efficiencyScore >= 80 ? '#ecfdf5' : '#fffbeb', border: efficiencyScore >= 80 ? '#a7f3d0' : '#fde68a' },
              ].map((s, i) => (
                <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <p className="font-extrabold" style={{ fontSize: '22px', lineHeight: 1, color: s.color }}>{s.value}</p>
                  <p className="font-medium text-slate-500" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Smart Insights */}
            {(dueSoonCount > 0 || overBudgetCount > 0) && (
              <div className="flex items-center gap-3 rounded-2xl" style={{ background: '#eef2f8', border: '1px solid #c7d7eb', padding: '12px 16px', marginBottom: '24px' }}>
                <Sparkles style={{ width: '16px', height: '16px', color: '#1e3a5f', flexShrink: 0 }} />
                <p className="text-slate-700 font-medium" style={{ fontSize: '14px' }}>
                  {[
                    dueSoonCount > 0 && `${dueSoonCount} bill${dueSoonCount > 1 ? 's' : ''} due this week`,
                    overBudgetCount > 0 && `${overBudgetCount} provider${overBudgetCount > 1 ? 's' : ''} over budget`,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}

            {/* Over budget alert */}
            {overBudgetCount > 0 && (
              <div className="flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <p className="font-semibold text-red-700" style={{ fontSize: '14px' }}>Some utilities are over budget</p>
                  <p className="text-red-500" style={{ fontSize: '12px', marginTop: '2px' }}>Review your usage or update your budget targets below.</p>
                </div>
              </div>
            )}

            <SpendBreakdown utilities={utilities} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '20px' }}>
              <div className="relative flex-1">
                <Search style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <Input placeholder="Search providers…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400"><X style={{ width: '15px', height: '15px' }} /></button>}
              </div>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-xl shadow-sm" style={{ padding: '4px' }}>
                <button onClick={() => setFilterType('all')} className="font-semibold rounded-lg transition-all" style={{ padding: '6px 12px', fontSize: '12px', background: filterType === 'all' ? '#1e3a5f' : 'transparent', color: filterType === 'all' ? 'white' : '#64748b' }}>
                  All
                </button>
                {UTILITY_TYPES.slice(0, 5).map(t => (
                  <button key={t.key} onClick={() => setFilterType(t.key)} className="font-semibold rounded-lg transition-all" style={{ padding: '6px 10px', fontSize: '12px', background: filterType === t.key ? t.color : 'transparent', color: filterType === t.key ? 'white' : '#64748b' }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(util => <UtilityCard key={util.id} util={util} onDelete={handleDelete} onEdit={u => { setEditingUtil(u); setIsModalOpen(true); }} />)}
            </div>

            {/* Tip */}
            <div className="flex items-start gap-3 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px 16px', marginTop: '24px' }}>
              <Lightbulb style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p className="font-semibold text-amber-800" style={{ fontSize: '13px' }}>Set monthly budgets for each provider</p>
                <p className="text-amber-600" style={{ fontSize: '12px', marginTop: '2px' }}>Add a budget in the edit screen of any provider to track overspending at a glance and improve your efficiency score.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginTop: '16px' }}>
              <p className="text-slate-400 italic" style={{ fontSize: '13px', lineHeight: '1.7' }}>
                HomeOS Utilities keeps every property's essential services organized, monitored, and optimized. Your billing data is encrypted, securely stored, and ready for enterprise reporting.
              </p>
            </div>
          </>
        )}
      </div>

      <UtilityModal open={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUtil(null); }} onSave={handleSave} initial={editingUtil} />
    </>
  );
};

export default UtilitiesPage;
