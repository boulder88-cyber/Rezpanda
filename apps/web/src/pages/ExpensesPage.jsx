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
  Plus, Trash2, Download, Receipt, DollarSign,
  TrendingUp, TrendingDown, BarChart2, PieChart,
  Search, X, ShieldCheck, Calendar, Tag,
  ArrowUpRight, ArrowDownRight, Minus, FileText, Wrench,
  Zap, Shield, TreePine, Home, MoreHorizontal,
  ChevronRight, Users, ArrowRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#f97316', bg: '#fff7ed' },
  { key: 'utilities', label: 'Utilities', icon: Zap, color: '#2563eb', bg: '#eff6ff' },
  { key: 'insurance', label: 'Insurance', icon: Shield, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'tax', label: 'Property Tax', icon: FileText, color: '#dc2626', bg: '#fef2f2' },
  { key: 'landscaping', label: 'Landscaping', icon: TreePine, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'mortgage', label: 'Mortgage', icon: Home, color: '#1e3a5f', bg: '#eef2f8' },
  { key: 'repairs', label: 'Repairs', icon: Receipt, color: '#d97706', bg: '#fffbeb' },
  { key: 'other', label: 'Other', icon: MoreHorizontal, color: '#64748b', bg: '#f8fafc' },
];

const getCat = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[7];

const exportToCSV = (expenses, propertyName) => {
  const headers = ['Date', 'Category', 'Vendor', 'Description', 'Amount'];
  const rows = expenses.map(e => [
    new Date(e.expenseDate).toLocaleDateString(),
    e.category, e.vendor || '', e.description || '',
    `$${parseFloat(e.amount).toFixed(2)}`
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${propertyName}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY CARDS
// ═══════════════════════════════════════════════════════════════════════

const SummaryCards = ({ expenses }) => {
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter(e => {
    const d = new Date(e.expenseDate);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const thisTotal = thisMonth.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const lastTotal = lastMonth.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const change = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal * 100) : 0;
  const catTotals = {};
  thisMonth.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount || 0); });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatConfig = topCat ? getCat(topCat[0]) : null;
  const TopIcon = topCatConfig?.icon || Tag;
  const ytdTotal = expenses.filter(e => new Date(e.expenseDate).getFullYear() === now.getFullYear())
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
      {[
        {
          label: 'This Month', value: `$${thisTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
          sub: `vs $${lastTotal.toLocaleString()} last month`,
          icon: DollarSign, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb',
          trend: change, trendLabel: `${Math.abs(change).toFixed(0)}%`,
        },
        {
          label: 'Year to Date', value: `$${ytdTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
          sub: `${now.getFullYear()} total`,
          icon: BarChart2, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
        },
        {
          label: 'Top Category', value: topCatConfig?.label || '—',
          sub: topCat ? `$${parseFloat(topCat[1]).toLocaleString(undefined, { minimumFractionDigits: 0 })} this month` : 'No expenses yet',
          iconComponent: topCatConfig ? <TopIcon style={{ width: '16px', height: '16px', color: topCatConfig.color }} /> : null,
          customBg: topCatConfig?.bg, customColor: topCatConfig?.color,
          border: '#e2e8f0',
        },
        {
          label: 'Total Expenses', value: expenses.length,
          sub: `${thisMonth.length} this month`,
          icon: Receipt, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
        },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${stat.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: stat.customBg || stat.bg }}>
                {stat.iconComponent || (Icon && <Icon style={{ width: '16px', height: '16px', color: stat.customColor || stat.color }} />)}
              </div>
              {stat.trend !== undefined && (
                <span className="flex items-center gap-0.5 font-bold" style={{ fontSize: '12px', color: stat.trend <= 0 ? '#059669' : '#dc2626' }}>
                  {stat.trend > 0 ? <ArrowUpRight style={{ width: '12px', height: '12px' }} /> : stat.trend < 0 ? <ArrowDownRight style={{ width: '12px', height: '12px' }} /> : <Minus style={{ width: '12px', height: '12px' }} />}
                  {stat.trendLabel}
                </span>
              )}
            </div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>{stat.value}</p>
            <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{stat.label}</p>
            <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════

const CategoryBreakdown = ({ expenses }) => {
  const totals = {};
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + parseFloat(e.amount || 0); });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = sorted.reduce((s, [, v]) => s + v, 0);
  if (sorted.length === 0) return null;

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px', marginBottom: '20px' }}>
        <PieChart style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> Spending by Category
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map(([cat, total]) => {
          const cfg = getCat(cat);
          const Icon = cfg.icon;
          const pct = grandTotal > 0 ? (total / grandTotal * 100) : 0;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '6px', background: cfg.bg }}>
                    <Icon style={{ width: '13px', height: '13px', color: cfg.color }} />
                  </div>
                  <span className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{cfg.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900" style={{ fontSize: '13px' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                  <span className="text-slate-400" style={{ fontSize: '11px', marginLeft: '6px' }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '6px' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MONTHLY TREND
// ═══════════════════════════════════════════════════════════════════════

const MonthlyTrend = ({ expenses }) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const total = expenses.filter(e => {
      const ed = new Date(e.expenseDate);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    }).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    return { label: d.toLocaleString('default', { month: 'short' }), total };
  });

  const max = Math.max(...months.map(m => m.total), 1);
  if (months.every(m => m.total === 0)) return null;

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px', marginBottom: '20px' }}>
        <BarChart2 style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> 6-Month Trend
      </h3>
      <div className="flex items-end gap-3" style={{ height: '120px' }}>
        {months.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-slate-500 font-medium" style={{ fontSize: '11px' }}>
              {m.total > 0 ? `$${m.total >= 1000 ? (m.total / 1000).toFixed(1) + 'k' : m.total.toFixed(0)}` : ''}
            </span>
            <div className="w-full rounded-t-md transition-all duration-700" style={{
              height: `${Math.max((m.total / max) * 80, m.total > 0 ? 4 : 0)}px`,
              background: i === months.length - 1 ? '#1e3a5f' : '#c7d7eb',
              minHeight: m.total > 0 ? '4px' : '0',
            }} />
            <span className="text-slate-400" style={{ fontSize: '11px' }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ANNUAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════

const AnnualSummary = ({ expenses }) => {
  const now = new Date();
  const ytd = expenses.filter(e => new Date(e.expenseDate).getFullYear() === now.getFullYear());
  const ytdTotal = ytd.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const projected = ytdTotal > 0 ? (ytdTotal / (now.getMonth() + 1)) * 12 : 0;

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '16px' }}>Annual Snapshot</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'YTD Total', value: `$${ytdTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, sub: `${now.getFullYear()} so far`, color: '#1e3a5f' },
          { label: 'Projected Annual', value: `$${projected.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, sub: 'at current rate', color: '#059669' },
          { label: 'Monthly Average', value: `$${(ytdTotal / Math.max(now.getMonth() + 1, 1)).toLocaleString(undefined, { minimumFractionDigits: 0 })}`, sub: 'this year', color: '#7c3aed' },
          { label: 'Transactions', value: ytd.length, sub: 'this year', color: '#d97706' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-50 rounded-xl" style={{ padding: '12px' }}>
            <p className="text-slate-400 font-medium" style={{ fontSize: '11px', marginBottom: '4px' }}>{s.label}</p>
            <p className="font-extrabold" style={{ fontSize: '20px', lineHeight: 1, color: s.color }}>{s.value}</p>
            <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ADD EXPENSE MODAL
// ═══════════════════════════════════════════════════════════════════════

const AddExpenseModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({
    category: 'maintenance', vendor: '', amount: '',
    expenseDate: new Date().toISOString().split('T')[0], description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ category: 'maintenance', vendor: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Expense</DialogTitle>
          <p className="text-slate-500 text-sm">Log utilities, maintenance, or any property-related cost.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.key} type="button" onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                    className="p-2 rounded-xl border text-center transition-all"
                    style={form.category === cat.key
                      ? { background: cat.color, borderColor: cat.color, color: 'white' }
                      : { background: cat.bg, borderColor: '#e2e8f0', color: cat.color }
                    }>
                    <div className="flex justify-center" style={{ marginBottom: '4px' }}>
                      <Icon style={{ width: '16px', height: '16px' }} />
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: 500 }}>{cat.label.split(' ')[0]}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Date</Label>
              <Input type="date" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} className="h-11 rounded-xl" required />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="h-11 rounded-xl pl-7" required />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Vendor / Payee</Label>
            <Input placeholder="e.g. Home Depot, Georgia Power" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Description (optional)</Label>
            <Input placeholder="What was this for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={!form.amount} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
              Save Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const ExpensesPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => { if (selectedHome) loadExpenses(); }, [selectedHome]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('expenses').getFullList({
        filter: `propertyId = "${selectedHome.id}"`, sort: '-expenseDate', $autoCancel: false
      });
      setExpenses(records);
    } catch {
      toast({ title: 'Error', description: 'Failed to load expenses', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleAdd = async (form) => {
    try {
      await pb.collection('expenses').create({ ...form, propertyId: selectedHome.id, ownerId: currentUser.id }, { $autoCancel: false });
      toast({ title: '✅ Expense added!' });
      setIsAddOpen(false); loadExpenses();
    } catch { toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast({ title: 'Expense deleted' }); loadExpenses();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const matchSearch = !searchQuery ||
        (e.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      let matchDate = true;
      if (filterDateRange === 'month') { const d = new Date(e.expenseDate); matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
      else if (filterDateRange === 'quarter') { const d = new Date(e.expenseDate); const q = Math.floor(now.getMonth() / 3); matchDate = Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear(); }
      else if (filterDateRange === 'year') { matchDate = new Date(e.expenseDate).getFullYear() === now.getFullYear(); }
      return matchSearch && matchCat && matchDate;
    });
  }, [expenses, searchQuery, filterCategory, filterDateRange]);

  if (!selectedHome) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px', marginTop: '32px' }}>
          <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eef2f8', marginBottom: '16px' }}>
            <Receipt style={{ width: '28px', height: '28px', color: '#1e3a5f' }} />
          </div>
          <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No property selected.</p>
          <p className="text-slate-400" style={{ fontSize: '14px' }}>Select a property from the top menu to view expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Expenses — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Expenses</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5' }}>
                <Receipt style={{ width: '24px', height: '24px', color: '#059669' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Expenses</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {selectedHome.name} · {expenses.length} expenses tracked
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => exportToCSV(filtered, selectedHome.name)}
                className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl"
                style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export CSV
              </button>
              <button onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Expense
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
            <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ecfdf5', marginBottom: '16px' }}>
              <Receipt style={{ width: '28px', height: '28px', color: '#059669' }} />
            </div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No expenses yet.</p>
            <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Stay on top of your property finances — log utilities, maintenance, insurance, and more.
            </p>
            <button onClick={() => setIsAddOpen(true)} className="font-semibold text-white rounded-xl hover:opacity-90 transition-all"
              style={{ background: '#1e3a5f', padding: '12px 28px', fontSize: '14px' }}>
              <Plus className="w-4 h-4 inline mr-2" /> Add First Expense
            </button>
          </div>
        ) : (
          <>
            {/* View Toggle */}
            <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl shadow-sm" style={{ padding: '6px' }}>
                {[{ key: 'dashboard', label: '📊 Overview' }, { key: 'list', label: '📋 All Expenses' }].map(v => (
                  <button key={v.key} onClick={() => setActiveView(v.key)}
                    className="font-medium rounded-xl transition-all"
                    style={{ padding: '8px 16px', fontSize: '13px', background: activeView === v.key ? '#1e3a5f' : 'transparent', color: activeView === v.key ? 'white' : '#64748b' }}>
                    {v.label}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 ml-auto" style={{ fontSize: '12px' }}>
                {filtered.length} expenses · ${filtered.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 0 })} total
              </span>
            </div>

            {activeView === 'dashboard' ? (
              <>
                <SummaryCards expenses={expenses} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                  <CategoryBreakdown expenses={expenses} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <MonthlyTrend expenses={expenses} />
                    <AnnualSummary expenses={expenses} />
                  </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                    <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Recent Expenses</h3>
                    <button onClick={() => setActiveView('list')} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                      View all <ArrowRight style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {expenses.slice(0, 6).map(exp => {
                      const cfg = getCat(exp.category);
                      const Icon = cfg.icon;
                      return (
                        <div key={exp.id} className="flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '10px 12px' }}>
                          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '8px', background: cfg.bg }}>
                            <Icon style={{ width: '16px', height: '16px', color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate" style={{ fontSize: '14px' }}>{exp.vendor || cfg.label}</p>
                            <p className="text-slate-400" style={{ fontSize: '12px' }}>
                              {new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {cfg.label}
                            </p>
                          </div>
                          <span className="font-bold text-slate-900 flex-shrink-0" style={{ fontSize: '14px' }}>
                            ${parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Vendor Directory Link */}
                <div className="flex items-center gap-4 rounded-2xl" style={{ background: '#eef2f8', border: '1px solid #c7d7eb', padding: '14px 20px', marginTop: '16px' }}>
                  <Users style={{ width: '18px', height: '18px', color: '#1e3a5f', flexShrink: 0 }} />
                  <p className="text-slate-700 font-medium" style={{ fontSize: '14px' }}>Need a vendor for a repair or service?</p>
                  <Link to="/vendors" className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity ml-auto whitespace-nowrap" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                    Vendor Directory <ArrowRight style={{ width: '13px', height: '13px' }} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '20px' }}>
                  <div className="relative flex-1">
                    <Search style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <Input placeholder="Search vendor, description…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400"><X style={{ width: '15px', height: '15px' }} /></button>}
                  </div>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  <select value={filterDateRange} onChange={e => setFilterDateRange(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {filtered.length === 0 ? (
                    <div className="text-center" style={{ padding: '48px 20px' }}>
                      <p className="font-medium text-slate-400" style={{ fontSize: '15px' }}>No expenses match your filters.</p>
                      <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterDateRange('all'); }} className="text-blue-500 hover:text-blue-700 transition-colors" style={{ fontSize: '13px', marginTop: '8px' }}>
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {['Date', 'Category', 'Vendor', 'Description', 'Amount', ''].map((h, i) => (
                              <th key={i} className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filtered.map(exp => {
                            const cfg = getCat(exp.category);
                            const Icon = cfg.icon;
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 text-slate-500 whitespace-nowrap" style={{ fontSize: '13px' }}>
                                  {new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '6px', background: cfg.bg }}>
                                      <Icon style={{ width: '12px', height: '12px', color: cfg.color }} />
                                    </div>
                                    <span className="font-semibold" style={{ fontSize: '12px', color: cfg.color }}>{cfg.label}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 font-medium text-slate-900" style={{ fontSize: '14px' }}>{exp.vendor || '—'}</td>
                                <td className="px-5 py-4 text-slate-400 truncate max-w-40" style={{ fontSize: '13px' }}>{exp.description || '—'}</td>
                                <td className="px-5 py-4 text-right font-bold text-slate-900 whitespace-nowrap" style={{ fontSize: '14px' }}>
                                  ${parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <button onClick={() => handleDelete(exp.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 style={{ width: '15px', height: '15px' }} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-100">
                          <tr>
                            <td colSpan={4} className="px-5 py-3 text-slate-500 font-semibold" style={{ fontSize: '12px' }}>{filtered.length} expenses</td>
                            <td className="px-5 py-3 text-right font-extrabold text-slate-900" style={{ fontSize: '15px' }}>
                              ${filtered.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AddExpenseModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAdd} />
    </>
  );
};

export default ExpensesPage;
