import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Wrench, Plus, ChevronRight, ChevronLeft, Calendar,
  CheckCircle2, AlertCircle, Clock, DollarSign, Download,
  Star, Lightbulb, Bell, Filter, X, Edit2, Trash2,
  Zap, Droplets, Flame, TreePine, Shield, Home,
  BarChart2, ArrowRight, Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════
// DATA MODEL (spec-aligned)
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { key: 'hvac', label: 'HVAC', icon: Zap, color: '#2563eb', bg: '#eff6ff' },
  { key: 'plumbing', label: 'Plumbing', icon: Droplets, color: '#0891b2', bg: '#ecfeff' },
  { key: 'electrical', label: 'Electrical', icon: Zap, color: '#d97706', bg: '#fffbeb' },
  { key: 'roofing', label: 'Roofing', icon: Home, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'landscaping', label: 'Landscaping', icon: TreePine, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'appliances', label: 'Appliances', icon: Wrench, color: '#f97316', bg: '#fff7ed' },
  { key: 'safety', label: 'Safety', icon: Shield, color: '#dc2626', bg: '#fef2f2' },
  { key: 'exterior', label: 'Exterior', icon: Home, color: '#64748b', bg: '#f8fafc' },
  { key: 'general', label: 'General', icon: Wrench, color: '#94a3b8', bg: '#f8fafc' },
];

const getCat = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[8];

const TASKS = [
  { id: 1, title: 'HVAC Annual Service', category: 'hvac', property: 'Primary Home', date: '2026-06-10', cost: 150, status: 'upcoming', vendor: 'Johnson & Miller HVAC', notes: 'Filter change + coil cleaning', recurrence: 'annual' },
  { id: 2, title: 'Pest Control Quarterly', category: 'general', property: 'Primary Home', date: '2026-03-20', cost: 125, status: 'overdue', vendor: 'Terminix', notes: 'Perimeter treatment', recurrence: 'quarterly' },
  { id: 3, title: 'Gutter Cleaning', category: 'exterior', property: 'Primary Home', date: '2026-06-20', cost: 200, status: 'upcoming', vendor: null, notes: 'Spring clean after pollen season', recurrence: 'biannual' },
  { id: 4, title: 'Smoke Detector Battery Check', category: 'safety', property: 'Primary Home', date: '2026-06-01', cost: 20, status: 'upcoming', vendor: null, notes: 'Replace all batteries', recurrence: 'annual' },
  { id: 5, title: 'Water Heater Flush', category: 'plumbing', property: 'Primary Home', date: '2026-07-15', cost: 85, status: 'upcoming', vendor: null, notes: 'Annual sediment flush', recurrence: 'annual' },
  { id: 6, title: 'Roof Inspection', category: 'roofing', property: 'Lake House', date: '2026-06-15', cost: 175, status: 'upcoming', vendor: 'AtlantaRoof Pro', notes: 'Post-winter inspection', recurrence: 'annual' },
  { id: 7, title: 'Lawn Fertilization', category: 'landscaping', property: 'Primary Home', date: '2026-05-10', cost: 180, status: 'completed', vendor: 'Green Thumb', notes: 'Spring application', recurrence: 'seasonal' },
  { id: 8, title: 'HVAC Filter Change', category: 'hvac', property: 'Lake House', date: '2026-06-01', cost: 35, status: 'upcoming', vendor: null, notes: 'MERV-11 filter', recurrence: 'monthly' },
  { id: 9, title: 'Dryer Vent Cleaning', category: 'appliances', property: 'Primary Home', date: '2026-04-01', cost: 95, status: 'overdue', vendor: null, notes: 'Fire hazard if neglected', recurrence: 'annual' },
  { id: 10, title: 'Exterior Paint Touch-up', category: 'exterior', property: 'Lake House', date: '2026-08-01', cost: 450, status: 'upcoming', vendor: null, notes: 'South-facing trim', recurrence: 'asneeded' },
  { id: 11, title: 'Electrical Panel Inspection', category: 'electrical', property: 'Primary Home', date: '2026-09-01', cost: 200, status: 'upcoming', vendor: 'Bright Electric', notes: '5-year inspection cycle', recurrence: 'annual' },
  { id: 12, title: 'Plumbing Check', category: 'plumbing', property: 'Lake House', date: '2026-07-01', cost: 120, status: 'upcoming', vendor: null, notes: 'Check all shutoffs + fixtures', recurrence: 'annual' },
];

const SMART_RECOMMENDATIONS = [
  { title: 'HVAC Filter — Change Overdue', category: 'hvac', reason: 'Filter was last changed 45 days ago. Recommend monthly check.', priority: 'High', estimatedCost: 35, seasonal: false },
  { title: 'Winterize Irrigation System', category: 'plumbing', reason: 'Fall approaching. Drain sprinkler lines to prevent freeze damage.', priority: 'Medium', estimatedCost: 120, seasonal: true, season: 'Fall' },
  { title: 'Chimney Sweep & Inspection', category: 'safety', reason: 'Pre-winter. Recommend annual inspection before first fire.', priority: 'Medium', estimatedCost: 175, seasonal: true, season: 'Fall' },
  { title: 'Attic Insulation Check', category: 'general', reason: 'Energy audit suggests attic insulation may be below R-38 standard. Could reduce bills 15-25%.', priority: 'Low', estimatedCost: 1200, seasonal: false },
  { title: 'Water Heater Age Alert', category: 'plumbing', reason: 'Water heater is 9 years old. Average lifespan is 8-12 years. Budget for replacement.', priority: 'Medium', estimatedCost: 1100, seasonal: false },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const SectionHeader = ({ title, subtitle, action, actionHref, icon: Icon }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
    <div className="flex items-center gap-2">
      {Icon && <Icon style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
      <div>
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '17px' }}>{title}</h2>
        {subtitle && <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '1px' }}>{subtitle}</p>}
      </div>
    </div>
    {action && (
      <Link to={actionHref || '#'} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: '12px', color: '#1e3a5f' }}>
        {action} <ChevronRight style={{ width: '13px', height: '13px' }} />
      </Link>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const s = {
    overdue: { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
    upcoming: { bg: '#fffbeb', color: '#d97706', label: 'Upcoming' },
    completed: { bg: '#ecfdf5', color: '#059669', label: 'Completed' },
  }[status] || { bg: '#f8fafc', color: '#94a3b8', label: status };
  return <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: s.bg, color: s.color, padding: '2px 8px' }}>{s.label}</span>;
};

// ═══════════════════════════════════════════════════════════════════════
// ADD TASK MODAL
// ═══════════════════════════════════════════════════════════════════════

const AddTaskModal = ({ open, onClose, onSave, editTask }) => {
  const [form, setForm] = useState(editTask || {
    title: '', category: 'hvac', property: 'Primary Home',
    date: new Date().toISOString().split('T')[0],
    cost: '', vendor: '', notes: '', recurrence: 'annual', status: 'upcoming',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (editTask) setForm(editTask);
    else setForm({ title: '', category: 'hvac', property: 'Primary Home', date: new Date().toISOString().split('T')[0], cost: '', vendor: '', notes: '', recurrence: 'annual', status: 'upcoming' });
  }, [editTask, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-lg" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between" style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '18px 24px' }}>
          <div>
            <h2 className="font-semibold text-white" style={{ fontSize: '17px' }}>{editTask ? 'Edit Task' : 'Add Maintenance Task'}</h2>
            <p className="text-blue-200" style={{ fontSize: '12px' }}>Schedule a new maintenance item</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '30px', height: '30px' }}>
            <X style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Category grid */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.slice(0, 10).map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.key} onClick={() => set('category', cat.key)}
                    className="p-2 rounded-xl border text-center transition-all"
                    style={form.category === cat.key ? { background: cat.color, borderColor: cat.color, color: 'white' } : { background: cat.bg, borderColor: '#e2e8f0', color: cat.color }}>
                    <Icon style={{ width: '14px', height: '14px', margin: '0 auto 2px' }} />
                    <span style={{ fontSize: '10px', fontWeight: 500, display: 'block' }}>{cat.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Task Title *</label>
            <input placeholder="e.g. HVAC Annual Service" value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Property</label>
              <select value={form.property} onChange={e => set('property', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white">
                <option>Primary Home</option>
                <option>Lake House</option>
                <option>All Properties</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Due Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Estimated Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <input type="number" placeholder="150" value={form.cost} onChange={e => set('cost', e.target.value)}
                  className="w-full h-11 pl-7 pr-3 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Recurrence</label>
              <select value={form.recurrence} onChange={e => set('recurrence', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Bi-Annual</option>
                <option value="seasonal">Seasonal</option>
                <option value="annual">Annual</option>
                <option value="asneeded">As Needed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Vendor / Service Provider</label>
            <input placeholder="e.g. Johnson & Miller HVAC" value={form.vendor} onChange={e => set('vendor', e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
            <textarea placeholder="Scope of work, special requirements..." value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full h-16 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-500 font-medium hover:bg-slate-50" style={{ fontSize: '14px' }}>Cancel</button>
            <button onClick={() => { if (!form.title) return; onSave({ ...form, id: editTask?.id || Date.now(), cost: parseFloat(form.cost) || 0 }); onClose(); }}
              disabled={!form.title} className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: '#1e3a5f', fontSize: '14px' }}>
              {editTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════════════

const CalendarView = ({ tasks, currentMonth, currentYear }) => {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  const getTasksForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.date === dateStr);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Day headers */}
      <div className="grid grid-cols-7" style={{ marginBottom: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-slate-400 font-semibold" style={{ fontSize: '11px', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dayTasks = getTasksForDay(day);
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
          const hasOverdue = dayTasks.some(t => t.status === 'overdue');
          const hasUpcoming = dayTasks.some(t => t.status === 'upcoming');

          return (
            <div key={day} className="relative" style={{ minHeight: '52px', padding: '4px', borderRadius: '8px', background: isToday ? '#eef2f8' : 'transparent', border: isToday ? '1px solid #c7d7eb' : '1px solid transparent' }}>
              <p className="font-semibold" style={{ fontSize: '12px', color: isToday ? '#1e3a5f' : '#64748b', marginBottom: '2px' }}>{day}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {dayTasks.slice(0, 2).map(t => {
                  const cat = getCat(t.category);
                  return (
                    <div key={t.id} className="rounded truncate" style={{ fontSize: '10px', fontWeight: 600, padding: '1px 4px', background: t.status === 'overdue' ? '#fef2f2' : cat.bg, color: t.status === 'overdue' ? '#dc2626' : cat.color }}>
                      {t.title.split(' ')[0]}
                    </div>
                  );
                })}
                {dayTasks.length > 2 && <div style={{ fontSize: '9px', color: '#94a3b8', paddingLeft: '4px' }}>+{dayTasks.length - 2} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TASK ROW
// ═══════════════════════════════════════════════════════════════════════

const TaskRow = ({ task, onEdit, onDelete, onComplete }) => {
  const cat = getCat(task.category);
  const Icon = cat.icon;
  const today = new Date();
  const daysUntil = Math.ceil((new Date(task.date) - today) / 86400000);

  return (
    <div className="flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '12px 14px', borderBottom: '1px solid #f8fafc' }}>
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '8px', background: cat.bg }}>
        <Icon style={{ width: '16px', height: '16px', color: cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
          <p className="font-semibold text-slate-900 truncate" style={{ fontSize: '14px' }}>{task.title}</p>
          <StatusBadge status={task.status} />
        </div>
        <p className="text-slate-400" style={{ fontSize: '12px' }}>
          {task.property} · {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {task.status === 'upcoming' && daysUntil >= 0 && ` · ${daysUntil}d away`}
          {task.status === 'overdue' && ` · ${Math.abs(daysUntil)}d overdue`}
          {task.vendor && ` · ${task.vendor}`}
        </p>
      </div>
      {task.cost > 0 && (
        <p className="font-semibold text-slate-700 flex-shrink-0" style={{ fontSize: '13px' }}>${task.cost.toLocaleString()}</p>
      )}
      <div className="flex items-center gap-1 flex-shrink-0">
        {task.status !== 'completed' && (
          <button onClick={() => onComplete(task.id)} className="flex items-center justify-center rounded-lg hover:bg-green-100 transition-colors" style={{ width: '30px', height: '30px' }} title="Mark complete">
            <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669' }} />
          </button>
        )}
        <button onClick={() => onEdit(task)} className="flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors" style={{ width: '30px', height: '30px' }}>
          <Edit2 style={{ width: '13px', height: '13px', color: '#64748b' }} />
        </button>
        <button onClick={() => onDelete(task.id)} className="flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors" style={{ width: '30px', height: '30px' }}>
          <Trash2 style={{ width: '13px', height: '13px', color: '#f87171' }} />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SMART RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

const SmartRecommendations = ({ recommendations, onAdd }) => {
  const priorityStyles = {
    High: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', pillBg: '#fee2e2' },
    Medium: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', pillBg: '#fef3c7' },
    Low: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', pillBg: '#f1f5f9' },
  };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Smart Recommendations" subtitle="Seasonal tasks, predictive replacements, and efficiency alerts" icon={Lightbulb} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recommendations.map((rec, i) => {
          const ps = priorityStyles[rec.priority];
          const cat = getCat(rec.category);
          const Icon = cat.icon;
          return (
            <div key={i} className="flex items-start gap-3" style={{ background: ps.bg, border: `1px solid ${ps.border}`, borderRadius: '10px', padding: '14px' }}>
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: cat.bg }}>
                <Icon style={{ width: '14px', height: '14px', color: cat.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                  <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{rec.title}</p>
                  <span className="font-bold rounded-full" style={{ fontSize: '10px', background: ps.pillBg, color: ps.color, padding: '1px 6px' }}>{rec.priority}</span>
                  {rec.seasonal && <span className="font-medium text-blue-600 bg-blue-100 rounded-full" style={{ fontSize: '10px', padding: '1px 6px' }}>🍂 {rec.season}</span>}
                </div>
                <p className="text-slate-500" style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '6px' }}>{rec.reason}</p>
                <p className="text-slate-400" style={{ fontSize: '11px' }}>Est. cost: ${rec.estimatedCost.toLocaleString()}</p>
              </div>
              <button onClick={() => onAdd(rec)} className="flex-shrink-0 font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '6px 12px', fontSize: '11px' }}>
                + Add
              </button>
            </div>
          );
        })}
      </div>

      {/* Vendor link */}
      <div className="flex items-center gap-3 rounded-xl" style={{ background: '#eef2f8', border: '1px solid #c7d7eb', padding: '12px 14px', marginTop: '14px' }}>
        <Users style={{ width: '15px', height: '15px', color: '#1e3a5f', flexShrink: 0 }} />
        <p className="text-slate-700 font-medium" style={{ fontSize: '13px' }}>Need a vendor for any of these tasks?</p>
        <Link to="/vendors" className="flex items-center gap-1 font-semibold ml-auto hover:opacity-70 transition-opacity whitespace-nowrap" style={{ color: '#1e3a5f', fontSize: '12px' }}>
          Vendor Directory <ArrowRight style={{ width: '12px', height: '12px' }} />
        </Link>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ANNUAL COST CHART
// ═══════════════════════════════════════════════════════════════════════

const AnnualCostChart = ({ tasks }) => {
  const monthlyData = MONTHS.map((month, i) => {
    const monthTasks = tasks.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === i && d.getFullYear() === new Date().getFullYear();
    });
    return { month, cost: monthTasks.reduce((s, t) => s + (t.cost || 0), 0), count: monthTasks.length };
  });

  const currentMonth = new Date().getMonth();

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SectionHeader title="Annual Cost Forecast" subtitle="Scheduled maintenance spend by month" icon={BarChart2} />
      <div style={{ height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} barSize={18}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => [`$${v}`, 'Cost']} />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell key={index} fill={index === currentMonth ? '#1e3a5f' : index < currentMonth ? '#a7f3d0' : '#c7d7eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4" style={{ marginTop: '8px' }}>
        {[['#a7f3d0', 'Completed'], ['#1e3a5f', 'Current Month'], ['#c7d7eb', 'Scheduled']].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: '11px' }}>
            <span style={{ width: '10px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const MaintenanceSchedulerPage = () => {
  const today = new Date();
  const [tasks, setTasks] = useState(TASKS);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [activeTab, setActiveTab] = useState('list');

  const overdue = tasks.filter(t => t.status === 'overdue');
  const upcoming = tasks.filter(t => t.status === 'upcoming');
  const completed = tasks.filter(t => t.status === 'completed');
  const annualCost = tasks.reduce((s, t) => s + (t.cost || 0), 0);
  const ytdCost = completed.reduce((s, t) => s + (t.cost || 0), 0);

  const filtered = useMemo(() => tasks.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    const matchProp = filterProperty === 'all' || t.property === filterProperty;
    return matchStatus && matchCat && matchProp;
  }).sort((a, b) => new Date(a.date) - new Date(b.date)), [tasks, filterStatus, filterCategory, filterProperty]);

  const handleSave = (task) => {
    if (editingTask) setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    else setTasks(prev => [...prev, task]);
    setEditingTask(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleComplete = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const handleAddRecommendation = (rec) => {
    const newTask = {
      id: Date.now(), title: rec.title, category: rec.category,
      property: 'Primary Home', date: new Date().toISOString().split('T')[0],
      cost: rec.estimatedCost, status: 'upcoming', vendor: null,
      notes: rec.reason, recurrence: 'annual',
    };
    setTasks(prev => [...prev, newTask]);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <>
      <Helmet><title>Maintenance Scheduler — CasaCEO</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Maintenance Scheduler</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', flexShrink: 0 }}>
                <Wrench style={{ width: '24px', height: '24px', color: '#f97316' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Maintenance Scheduler</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  Predictive maintenance engine · {tasks.length} tasks tracked
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 rounded-xl transition-all" style={{ background: '#f97316', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Task
              </button>
            </div>
          </div>
        </div>

        {/* ═══ HEADER METRICS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Upcoming Tasks', value: upcoming.length, icon: Clock, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Overdue', value: overdue.length, icon: AlertCircle, color: overdue.length > 0 ? '#dc2626' : '#059669', bg: overdue.length > 0 ? '#fef2f2' : '#ecfdf5', border: overdue.length > 0 ? '#fecaca' : '#a7f3d0' },
            { label: 'YTD Spend', value: `$${ytdCost.toLocaleString()}`, icon: DollarSign, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
            { label: 'Annual Forecast', value: `$${annualCost.toLocaleString()}`, icon: BarChart2, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, marginBottom: '8px' }}>
                  <Icon style={{ width: '16px', height: '16px', color: s.color }} />
                </div>
                <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>{s.value}</p>
                <p className="font-medium text-slate-600" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div className="flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
            <div className="flex-1">
              <p className="font-semibold text-red-700" style={{ fontSize: '14px' }}>{overdue.length} task{overdue.length > 1 ? 's' : ''} overdue — action required</p>
              <p className="text-red-500" style={{ fontSize: '12px', marginTop: '2px' }}>{overdue.map(t => t.title).join(', ')}</p>
            </div>
          </div>
        )}

        {/* ═══ VIEW TABS + CALENDAR NAV ═══ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ marginBottom: '20px' }}>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl shadow-sm" style={{ padding: '6px' }}>
            {[{ key: 'list', label: '📋 Task List' }, { key: 'calendar', label: '📅 Calendar' }, { key: 'recommendations', label: '💡 Smart Picks' }, { key: 'cost', label: '📊 Cost Forecast' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="font-medium rounded-xl transition-all whitespace-nowrap"
                style={{ padding: '7px 14px', fontSize: '12px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'calendar' && (
            <div className="flex items-center gap-3 ml-auto">
              <button onClick={prevMonth} className="flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" style={{ width: '36px', height: '36px' }}>
                <ChevronLeft style={{ width: '16px', height: '16px', color: '#64748b' }} />
              </button>
              <p className="font-semibold text-slate-900" style={{ fontSize: '14px', minWidth: '120px', textAlign: 'center' }}>
                {MONTHS[currentMonth]} {currentYear}
              </p>
              <button onClick={nextMonth} className="flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" style={{ width: '36px', height: '36px' }}>
                <ChevronRight style={{ width: '16px', height: '16px', color: '#64748b' }} />
              </button>
            </div>
          )}
        </div>

        {/* ═══ TAB: TASK LIST ═══ */}
        {activeTab === 'list' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3" style={{ marginBottom: '16px' }}>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
                <option value="all">All Statuses</option>
                <option value="overdue">Overdue</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700">
                <option value="all">All Properties</option>
                <option value="Primary Home">Primary Home</option>
                <option value="Lake House">Lake House</option>
              </select>
              <span className="text-slate-400 self-center ml-auto" style={{ fontSize: '12px' }}>{filtered.length} tasks</span>
            </div>

            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {filtered.length === 0 ? (
                <div className="text-center" style={{ padding: '40px 20px' }}>
                  <p className="font-medium text-slate-400" style={{ fontSize: '15px' }}>No tasks match your filters.</p>
                  <button onClick={() => { setFilterStatus('all'); setFilterCategory('all'); setFilterProperty('all'); }} className="text-blue-500 hover:text-blue-700" style={{ fontSize: '13px', marginTop: '8px' }}>
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map(task => (
                  <TaskRow key={task.id} task={task}
                    onEdit={t => { setEditingTask(t); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* ═══ TAB: CALENDAR ═══ */}
        {activeTab === 'calendar' && (
          <CalendarView tasks={tasks} currentMonth={currentMonth} currentYear={currentYear} />
        )}

        {/* ═══ TAB: SMART RECOMMENDATIONS ═══ */}
        {activeTab === 'recommendations' && (
          <SmartRecommendations recommendations={SMART_RECOMMENDATIONS} onAdd={handleAddRecommendation} />
        )}

        {/* ═══ TAB: COST FORECAST ═══ */}
        {activeTab === 'cost' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnnualCostChart tasks={tasks} />
            {/* Category breakdown */}
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <SectionHeader title="Cost by Category" icon={DollarSign} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CATEGORIES.map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat.key);
                  const total = catTasks.reduce((s, t) => s + (t.cost || 0), 0);
                  if (total === 0) return null;
                  const max = Math.max(...CATEGORIES.map(c => tasks.filter(t => t.category === c.key).reduce((s, t) => s + (t.cost || 0), 0)));
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '28px', height: '28px', borderRadius: '6px', background: cat.bg }}>
                        <Icon style={{ width: '13px', height: '13px', color: cat.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                          <p className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{cat.label}</p>
                          <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>${total.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '5px' }}>
                          <div style={{ width: `${(total / max) * 100}%`, height: '5px', background: cat.color, borderRadius: '9999px' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <AddTaskModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editTask={editingTask}
      />
    </>
  );
};

export default MaintenanceSchedulerPage;
