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
  Plus, Trash2, Download, Receipt, DollarSign,
  TrendingUp, TrendingDown, BarChart2, PieChart,
  Filter, Search, X, ShieldCheck, AlertCircle,
  CheckCircle2, Calendar, Tag, ArrowUpRight,
  ArrowDownRight, Minus, FileText, Wrench,
  Zap, Shield, TreePine, Home, MoreHorizontal
} from 'lucide-react';

// ─── Category Config ──────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" />, color: '#f97316', bg: '#fff7ed' },
  { key: 'utilities', label: 'Utilities', icon: <Zap className="w-4 h-4" />, color: '#2563eb', bg: '#eff6ff' },
  { key: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" />, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'tax', label: 'Property Tax', icon: <FileText className="w-4 h-4" />, color: '#dc2626', bg: '#fef2f2' },
  { key: 'landscaping', label: 'Landscaping', icon: <TreePine className="w-4 h-4" />, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'mortgage', label: 'Mortgage', icon: <Home className="w-4 h-4" />, color: '#1e3a5f', bg: '#eef2f8' },
  { key: 'repairs', label: 'Repairs', icon: <Receipt className="w-4 h-4" />, color: '#d97706', bg: '#fffbeb' },
  { key: 'other', label: 'Other', icon: <MoreHorizontal className="w-4 h-4" />, color: '#64748b', bg: '#f8fafc' },
];

const getCat = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[7];

// ─── Summary Cards ────────────────────────────────────────────────────
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
  const changePositive = change <= 0;

  // Top category this month
  const catTotals = {};
  thisMonth.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount || 0); });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatConfig = topCat ? getCat(topCat[0]) : null;

  const ytdTotal = expenses.filter(e => new Date(e.expenseDate).getFullYear() === now.getFullYear())
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* This Month */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2f8' }}>
            <DollarSign className="w-4 h-4" style={{ color: '#1e3a5f' }} />
          </div>
          <span className={`flex items-center gap-1 text-xs font-bold ${changePositive ? 'text-green-600' : 'text-red-500'}`}>
            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(change).toFixed(0)}%
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-900">${thisTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
        <p className="text-xs text-slate-500 mt-1">This month</p>
        <p className="text-xs text-slate-400 mt-0.5">vs ${lastTotal.toLocaleString()} last month</p>
      </div>

      {/* YTD */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-slate-900">${ytdTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
        <p className="text-xs text-slate-500 mt-1">Year to date</p>
        <p className="text-xs text-slate-400 mt-0.5">{now.getFullYear()} total</p>
      </div>

      {/* Top Category */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: topCatConfig?.bg || '#f8fafc' }}>
            <span style={{ color: topCatConfig?.color || '#64748b' }}>{topCatConfig?.icon || <Tag className="w-4 h-4" />}</span>
          </div>
        </div>
        <p className="text-2xl font-extrabold text-slate-900 capitalize">{topCat ? topCat[0] : '—'}</p>
        <p className="text-xs text-slate-500 mt-1">Top category</p>
        <p className="text-xs text-slate-400 mt-0.5">{topCat ? `$${parseFloat(topCat[1]).toLocaleString(undefined, { minimumFractionDigits: 0 })} this month` : 'No expenses yet'}</p>
      </div>

      {/* Total Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-slate-900">{expenses.length}</p>
        <p className="text-xs text-slate-500 mt-1">Total expenses</p>
        <p className="text-xs text-slate-400 mt-0.5">{thisMonth.length} this month</p>
      </div>
    </div>
  );
};

// ─── Category Breakdown Chart ─────────────────────────────────────────
const CategoryBreakdown = ({ expenses }) => {
  const totals = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + parseFloat(e.amount || 0);
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = sorted.reduce((s, [, v]) => s + v, 0);

  if (sorted.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
        <PieChart className="w-4 h-4 text-slate-400" /> Spending by Category
      </h3>
      <div className="space-y-3">
        {sorted.map(([cat, total]) => {
          const cfg = getCat(cat);
          const pct = grandTotal > 0 ? (total / grandTotal * 100) : 0;
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700 capitalize">{cfg.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">${total.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                  <span className="text-xs text-slate-400 ml-2">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: cfg.color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Monthly Trend ────────────────────────────────────────────────────
const MonthlyTrend = ({ expenses }) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    const total = expenses.filter(e => {
      const ed = new Date(e.expenseDate);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    }).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    months.push({ label, total });
  }

  const max = Math.max(...months.map(m => m.total), 1);

  if (months.every(m => m.total === 0)) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-slate-400" /> 6-Month Trend
      </h3>
      <div className="flex items-end gap-3 h-32">
        {months.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {m.total > 0 ? `$${m.total >= 1000 ? (m.total/1000).toFixed(1)+'k' : m.total.toFixed(0)}` : ''}
            </span>
            <div className="w-full rounded-t-lg transition-all duration-700" style={{
              height: `${Math.max((m.total / max) * 80, m.total > 0 ? 4 : 0)}px`,
              background: i === months.length - 1 ? '#1e3a5f' : '#c7d5e8',
              minHeight: m.total > 0 ? '4px' : '0'
            }}></div>
            <span className="text-xs text-slate-400">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Export CSV ───────────────────────────────────────────────────────
const exportToCSV = (expenses, propertyName) => {
  const headers = ['Date', 'Category', 'Vendor', 'Description', 'Amount'];
  const rows = expenses.map(e => [
    new Date(e.expenseDate).toLocaleDateString(),
    e.category,
    e.vendor || '',
    e.description || '',
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

// ─── Add Expense Modal ────────────────────────────────────────────────
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Quick category buttons */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                  className="p-2 rounded-xl border text-center transition-all text-xs font-medium"
                  style={form.category === cat.key
                    ? { background: cat.color, borderColor: cat.color, color: '#fff' }
                    : { background: cat.bg, borderColor: '#e2e8f0', color: cat.color }
                  }
                >
                  <div className="flex justify-center mb-1">{cat.icon}</div>
                  {cat.label.split(' ')[0]}
                </button>
              ))}
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
            <Input placeholder="e.g. Home Depot, Georgia Power, Plumber Bob" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} className="h-11 rounded-xl" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-600 mb-1 block">Description (optional)</Label>
            <Input placeholder="What was this for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-11 rounded-xl" />
          </div>

          <div className="flex gap-3 pt-2">
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

// ─── Main Page ────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (selectedHome) loadExpenses();
  }, [selectedHome]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('expenses').getFullList({
        filter: `propertyId = "${selectedHome.id}"`,
        sort: '-expenseDate',
        $autoCancel: false
      });
      setExpenses(records);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load expenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (form) => {
    try {
      await pb.collection('expenses').create({
        ...form,
        propertyId: selectedHome.id,
        ownerId: currentUser.id
      }, { $autoCancel: false });
      toast({ title: '✅ Expense added successfully!' });
      setIsAddOpen(false);
      loadExpenses();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast({ title: 'Expense deleted' });
      loadExpenses();
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
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
      if (filterDateRange === 'month') {
        const d = new Date(e.expenseDate);
        matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (filterDateRange === 'quarter') {
        const d = new Date(e.expenseDate);
        const q = Math.floor(now.getMonth() / 3);
        matchDate = Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
      } else if (filterDateRange === 'year') {
        matchDate = new Date(e.expenseDate).getFullYear() === now.getFullYear();
      }
      return matchSearch && matchCat && matchDate;
    });
  }, [expenses, searchQuery, filterCategory, filterDateRange]);

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
      <Helmet><title>Expenses — CasaCEO</title></Helmet>

      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">Expenses</h1>
              <p className="text-blue-200 text-base leading-relaxed max-w-xl">
                Track spending across all your properties — utilities, maintenance, insurance, and more.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <ShieldCheck className="w-4 h-4 text-green-300" />
                <span className="text-blue-200 text-xs">Your financial data is encrypted and securely stored.</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => exportToCSV(filtered, selectedHome.name)}
                className="border-white/20 text-white hover:bg-white/10 rounded-xl font-semibold"
              >
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-[#e8604c] hover:bg-[#d4503c] text-white rounded-xl font-bold shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </div>
          </div>
        </div>

        {expenses.length === 0 && !loading ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#eef2f8' }}>
              <Receipt className="w-8 h-8" style={{ color: '#1e3a5f' }} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No expenses yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-2">
              Stay on top of your property finances — add your first expense and see where your money goes.
            </p>
            <p className="text-slate-400 text-sm mb-8">Log utilities, maintenance, insurance, and any property-related cost.</p>
            <Button onClick={() => setIsAddOpen(true)} className="font-bold text-white px-8 h-12 rounded-xl" style={{ background: '#1e3a5f' }}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Expense
            </Button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <>
            {/* View Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                {[
                  { key: 'dashboard', label: '📊 Overview' },
                  { key: 'list', label: '📋 All Expenses' },
                ].map(v => (
                  <button
                    key={v.key}
                    onClick={() => setActiveView(v.key)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={activeView === v.key ? { background: '#1e3a5f', color: '#fff' } : { color: '#64748b' }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 ml-auto">{filtered.length} expenses · ${filtered.reduce((s,e) => s + parseFloat(e.amount||0), 0).toLocaleString(undefined,{minimumFractionDigits:0})} total</span>
            </div>

            {activeView === 'dashboard' ? (
              <>
                <SummaryCards expenses={expenses} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CategoryBreakdown expenses={expenses} />
                  <MonthlyTrend expenses={expenses} />
                </div>

                {/* Recent Expenses */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Recent Expenses</h3>
                    <button onClick={() => setActiveView('list')} className="text-xs font-semibold hover:opacity-70" style={{ color: '#1e3a5f' }}>View all →</button>
                  </div>
                  <div className="space-y-2">
                    {expenses.slice(0, 5).map(exp => {
                      const cfg = getCat(exp.category);
                      return (
                        <div key={exp.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{exp.vendor || cfg.label}</p>
                            <p className="text-xs text-slate-400">{new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <span className="font-bold text-slate-900 text-sm">${parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search vendor, description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400"><X className="w-4 h-4" /></button>}
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

                {/* Expense Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-slate-400 font-medium">No expenses match your filters</p>
                      <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterDateRange('all'); }} className="mt-2 text-xs text-blue-500">Clear filters</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendor</th>
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                            <th className="px-5 py-3.5"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filtered.map(exp => {
                            const cfg = getCat(exp.category);
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                                  {new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>
                                      {cfg.icon}
                                    </div>
                                    <span className="text-xs font-semibold capitalize" style={{ color: cfg.color }}>{cfg.label}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-slate-900 font-medium">{exp.vendor || '—'}</td>
                                <td className="px-5 py-4 text-slate-400 truncate max-w-[180px]">{exp.description || '—'}</td>
                                <td className="px-5 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                                  ${parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <button onClick={() => handleDelete(exp.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-100">
                          <tr>
                            <td colSpan={4} className="px-5 py-3 text-xs font-semibold text-slate-500">{filtered.length} expenses</td>
                            <td className="px-5 py-3 text-right font-extrabold text-slate-900">
                              ${filtered.reduce((s,e) => s + parseFloat(e.amount||0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td></td>
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
