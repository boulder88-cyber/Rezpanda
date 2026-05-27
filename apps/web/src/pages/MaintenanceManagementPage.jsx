import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  Wrench, Plus, X, Check, Edit2, Trash2, Calendar, Clock,
  AlertCircle, CheckCircle2, User, Phone, Mail, Star, Search,
  ClipboardList, DollarSign, Download, TreePine, Wind, Sun,
  Snowflake, ArrowRight, ChevronRight, BarChart2, Home
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const MAINTENANCE_CATEGORIES = [
  { name: 'HVAC', icon: '❄️', color: 'bg-blue-50 border-blue-100', cadences: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'] },
  { name: 'Plumbing', icon: '🔧', color: 'bg-cyan-50 border-cyan-100', cadences: ['Monthly', 'Quarterly', 'Annual'] },
  { name: 'Electrical', icon: '⚡', color: 'bg-yellow-50 border-yellow-100', cadences: ['Annual', 'Every 3 Years', 'Every 5 Years'] },
  { name: 'Roofing', icon: '🏠', color: 'bg-orange-50 border-orange-100', cadences: ['Semi-Annual', 'Annual', 'Every 3 Years'] },
  { name: 'Landscaping', icon: '🌿', color: 'bg-green-50 border-green-100', cadences: ['Weekly', 'Bi-Weekly', 'Monthly', 'Seasonal'] },
  { name: 'Pest Control', icon: '🐛', color: 'bg-red-50 border-red-100', cadences: ['Monthly', 'Quarterly', 'Semi-Annual'] },
  { name: 'Appliances', icon: '🍳', color: 'bg-purple-50 border-purple-100', cadences: ['Semi-Annual', 'Annual'] },
  { name: 'Pool/Spa', icon: '🏊', color: 'bg-sky-50 border-sky-100', cadences: ['Weekly', 'Monthly', 'Seasonal'] },
  { name: 'Security', icon: '🔒', color: 'bg-slate-50 border-slate-200', cadences: ['Monthly', 'Semi-Annual', 'Annual'] },
  { name: 'Gutters', icon: '🍂', color: 'bg-amber-50 border-amber-100', cadences: ['Semi-Annual', 'Annual'] },
  { name: 'Painting', icon: '🖌️', color: 'bg-pink-50 border-pink-100', cadences: ['Every 3 Years', 'Every 5 Years', 'Every 10 Years'] },
  { name: 'General', icon: '🔨', color: 'bg-gray-50 border-gray-200', cadences: ['Monthly', 'Quarterly', 'Annual'] },
];

const RECOMMENDED_VENDORS = {
  'HVAC': ['Local HVAC Pro', 'One Hour Heating & Air', 'Service Experts'],
  'Plumbing': ['Roto-Rooter', 'Mr. Rooter', 'Local Plumber'],
  'Electrical': ['Mr. Electric', 'Local Electrician'],
  'Roofing': ['Local Roofer', 'CertainTeed', 'GAF Certified'],
  'Landscaping': ['TruGreen', 'Local Landscaper', 'BrightView'],
  'Pest Control': ['Orkin', 'Terminix', 'Rentokil'],
  'Appliances': ['Appliance Repair Pro', 'Sears Home Services'],
  'Pool/Spa': ['Pool Corp', 'Local Pool Service'],
  'Security': ['ADT', 'Vivint', 'Ring'],
  'Gutters': ['LeafGuard', 'Local Gutter Service'],
  'Painting': ['Five Star Painting', 'CertaPro Painters'],
  'General': ['TaskRabbit', 'Angi', 'HomeAdvisor'],
};

const SEASONAL_TASKS = {
  Spring: { icon: TreePine, color: '#16a34a', bg: '#f0fdf4', tasks: ['Gutter cleaning', 'HVAC tune-up', 'Exterior inspection', 'Lawn fertilization', 'Pest control check'] },
  Summer: { icon: Sun, color: '#d97706', bg: '#fffbeb', tasks: ['AC service', 'Pool maintenance', 'Pest control', 'Irrigation check', 'Deck inspection'] },
  Fall: { icon: Wind, color: '#f97316', bg: '#fff7ed', tasks: ['Roof inspection', 'Heating prep', 'Gutter cleaning', 'Weatherization', 'Chimney sweep'] },
  Winter: { icon: Snowflake, color: '#2563eb', bg: '#eff6ff', tasks: ['Pipe insulation', 'Heating check', 'Storm prep', 'Generator test', 'Smoke detector check'] },
};

const CADENCE_DAYS = {
  'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30, 'Quarterly': 90,
  'Semi-Annual': 180, 'Annual': 365, 'Every 3 Years': 365 * 3,
  'Every 5 Years': 365 * 5, 'Every 10 Years': 365 * 10, 'Seasonal': 90,
};

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

const calcNextDate = (lastDate, cadence) => {
  if (!lastDate) return '';
  const d = new Date(lastDate);
  d.setDate(d.getDate() + (CADENCE_DAYS[cadence] || 365));
  return d.toISOString().split('T')[0];
};

const getTaskStatus = (task) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
  if (daysUntil === null) return { label: 'No date set', color: 'bg-slate-100 text-slate-500', urgent: false, days: null };
  if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, color: 'bg-red-100 text-red-600', urgent: true, days: daysUntil };
  if (daysUntil <= 14) return { label: `Due in ${daysUntil}d`, color: 'bg-orange-100 text-orange-600', urgent: true, days: daysUntil };
  if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: 'bg-yellow-100 text-yellow-600', urgent: false, days: daysUntil };
  return { label: `Due in ${daysUntil}d`, color: 'bg-green-100 text-green-600', urgent: false, days: daysUntil };
};

// ═══════════════════════════════════════════════════════════════════════
// TASK MODAL
// ═══════════════════════════════════════════════════════════════════════

const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || '', category: task?.category || 'HVAC',
    cadence: task?.cadence || 'Annual', lastServiceDate: task?.lastServiceDate || '',
    nextServiceDate: task?.nextServiceDate || '', vendorName: task?.vendorName || '',
    vendorPhone: task?.vendorPhone || '', vendorEmail: task?.vendorEmail || '',
    estimatedCost: task?.estimatedCost || '', notes: task?.notes || '',
  });

  const selectedCategory = MAINTENANCE_CATEGORIES.find(c => c.name === form.category);
  const suggestedVendors = RECOMMENDED_VENDORS[form.category] || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg my-4" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
          <h2 className="font-semibold text-white" style={{ fontSize: '18px' }}>{task ? 'Edit Task' : 'Add Maintenance Task'}</h2>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Task Name</Label>
            <Input placeholder="e.g. HVAC Filter Change" value={form.taskName} onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))} className="h-11 rounded-xl" />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${form.category === cat.name ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                  style={form.category === cat.name ? { background: '#1e3a5f' } : {}}>
                  <div className="text-lg mb-0.5">{cat.icon}</div>{cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {(selectedCategory?.cadences || ['Annual']).map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, cadence: c, nextServiceDate: calcNextDate(p.lastServiceDate, c) }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${form.cadence === c ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input type="date" value={form.lastServiceDate}
                onChange={e => setForm(p => ({ ...p, lastServiceDate: e.target.value, nextServiceDate: calcNextDate(e.target.value, p.cadence) }))}
                className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input type="date" value={form.nextServiceDate} onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))} className="h-11 rounded-xl" />
              {form.lastServiceDate && <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl" style={{ padding: '16px' }}>
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-12px">
              <User className="w-4 h-4" /> Vendor Information
            </p>
            {suggestedVendors.length > 0 && (
              <div style={{ marginBottom: '12px', marginTop: '12px' }}>
                <p className="text-xs text-slate-400 mb-2">Suggested for {form.category}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button key={v} onClick={() => setForm(p => ({ ...p, vendorName: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.vendorName === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <Input placeholder="Vendor name" value={form.vendorName} onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))} className="h-10 rounded-xl bg-white" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Phone number" value={form.vendorPhone} onChange={e => setForm(p => ({ ...p, vendorPhone: e.target.value }))} className="h-10 rounded-xl bg-white" />
                <Input placeholder="Email" value={form.vendorEmail} onChange={e => setForm(p => ({ ...p, vendorEmail: e.target.value }))} className="h-10 rounded-xl bg-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Est. Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="150" value={form.estimatedCost} onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
              <Input placeholder="Any notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => onSave(form)} disabled={!form.taskName} className="flex-1 h-12 rounded-xl text-white font-bold" style={{ background: '#1e3a5f' }}>
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SERVICE LOG MODAL
// ═══════════════════════════════════════════════════════════════════════

const ServiceLogModal = ({ task, logs, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendorName: task?.vendorName || '', cost: '', notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ background: '#059669', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
          <div>
            <h2 className="font-semibold text-white" style={{ fontSize: '18px' }}>Log Service</h2>
            <p className="text-green-100" style={{ fontSize: '13px' }}>{task?.taskName}</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
              <Input type="date" value={form.serviceDate} onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))} className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cost Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                <Input type="number" placeholder="150" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} className="h-11 rounded-xl pl-7" />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input placeholder="Who did the work?" value={form.vendorName} onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea placeholder="What was done? Any issues found?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          {logs && logs.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Past Service History</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{log.vendorName || 'Unknown vendor'}</p>
                      <p className="text-xs text-slate-400">{new Date(log.serviceDate).toLocaleDateString()}</p>
                    </div>
                    {log.cost && <p className="text-sm font-bold text-slate-900">${parseFloat(log.cost).toFixed(0)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => onAddLog(form)} className="flex-1 h-12 rounded-xl text-white font-bold bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" /> Log Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TASK CARD
// ═══════════════════════════════════════════════════════════════════════

const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const status = getTaskStatus(task);
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.category);

  return (
    <div className="bg-white hover:shadow-md transition-all" style={{
      borderRadius: '12px',
      border: `1px solid ${status.urgent ? '#fecaca' : '#e2e8f0'}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {status.urgent && <div style={{ height: '3px', background: '#ef4444' }} />}
      <div style={{ padding: '20px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '24px' }}>{cat?.icon || '🔨'}</span>
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{task.taskName}</p>
              <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{task.category} · {task.cadence}</p>
            </div>
          </div>
          <span className={`font-medium rounded-full px-2 py-0.5 ${status.color}`} style={{ fontSize: '12px', flexShrink: 0 }}>{status.label}</span>
        </div>

        {task.vendorName && (
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl" style={{ padding: '10px 12px', marginBottom: '12px' }}>
            <User style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="font-semibold text-slate-700 truncate" style={{ fontSize: '13px' }}>{task.vendorName}</p>
              {task.vendorPhone && <p className="text-slate-400" style={{ fontSize: '12px' }}>{task.vendorPhone}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '12px' }}>
          {task.lastServiceDate && (
            <div className="bg-slate-50 rounded-lg text-center" style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Last Service</p>
              <p className="font-semibold text-slate-700" style={{ fontSize: '12px', marginTop: '2px' }}>
                {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
          {task.nextServiceDate && (
            <div className={`rounded-lg text-center ${status.urgent ? 'bg-red-50' : 'bg-blue-50'}`} style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Next Due</p>
              <p className={`font-semibold ${status.urgent ? 'text-red-600' : 'text-blue-600'}`} style={{ fontSize: '12px', marginTop: '2px' }}>
                {new Date(task.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {task.estimatedCost && (
          <p className="text-slate-400 flex items-center gap-1" style={{ fontSize: '12px', marginBottom: '12px' }}>
            <DollarSign style={{ width: '12px', height: '12px' }} /> Est. ${parseFloat(task.estimatedCost).toFixed(0)}
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={() => onLogService(task)} className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#059669', padding: '8px', fontSize: '13px' }}>
            <Check style={{ width: '14px', height: '14px' }} /> Log Service
          </button>
          <button onClick={() => onEdit(task)} className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" style={{ width: '36px', height: '36px' }}>
            <Edit2 style={{ width: '14px', height: '14px', color: '#64748b' }} />
          </button>
          <button onClick={() => onDelete(task.id)} className="flex items-center justify-center rounded-xl hover:bg-red-100 transition-colors" style={{ width: '36px', height: '36px', background: '#fef2f2' }}>
            <Trash2 style={{ width: '14px', height: '14px', color: '#f87171' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY STATS
// ═══════════════════════════════════════════════════════════════════════

const SummaryStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = Math.ceil((new Date(t.nextServiceDate) - today) / 86400000);
    return d >= 0 && d <= 30;
  }).length;
  const upToDate = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) > today).length;
  const totalCost = tasks.reduce((sum, t) => sum + (parseFloat(t.estimatedCost) || 0), 0);
  const total = tasks.length;
  const health = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Overdue', value: overdue, icon: AlertCircle, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', filter: 'Overdue' },
          { label: 'Due This Month', value: dueSoon, icon: Clock, color: '#d97706', bg: '#fffbeb', border: '#fde68a', filter: 'Upcoming' },
          { label: 'Up to Date', value: upToDate, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', filter: 'Up To Date' },
          { label: 'Annual Est. Cost', value: `$${totalCost.toLocaleString()}`, icon: DollarSign, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb', filter: null },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} onClick={() => s.filter && onFilter(s.filter)}
              className={`text-left hover:shadow-md transition-all ${s.filter ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ background: 'white', borderRadius: '12px', padding: '16px', border: `1px solid ${s.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg }}>
                  <Icon style={{ width: '16px', height: '16px', color: s.color }} />
                </div>
              </div>
              <p className="font-extrabold text-slate-900" style={{ fontSize: '24px', lineHeight: 1 }}>{s.value}</p>
              <p className="text-slate-400 font-medium" style={{ fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {total > 0 && (
        <div className="bg-white" style={{ borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
            <p className="font-semibold text-slate-700" style={{ fontSize: '13px' }}>Maintenance Health</p>
            <p className="font-bold text-slate-900" style={{ fontSize: '13px' }}>{health}% up to date</p>
          </div>
          <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '8px' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${health}%`,
              background: health >= 80 ? '#059669' : health >= 50 ? '#d97706' : '#dc2626'
            }} />
          </div>
          <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '6px' }}>{upToDate} of {total} tasks current · {overdue} overdue</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SEASONAL GUIDE
// ═══════════════════════════════════════════════════════════════════════

const SeasonalGuide = () => (
  <div style={{ marginBottom: '32px' }}>
    <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>Seasonal Task Guide</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(SEASONAL_TASKS).map(([season, data]) => {
        const Icon = data.icon;
        return (
          <div key={season} className="bg-white" style={{ borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '8px', background: data.bg }}>
                <Icon style={{ width: '15px', height: '15px', color: data.color }} />
              </div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{season}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 style={{ width: '12px', height: '12px', color: data.color, flexShrink: 0 }} />
                  <p className="text-slate-600" style={{ fontSize: '12px' }}>{task}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const MaintenanceManagementPage = () => {
  const { selectedHome, currentHome } = useHome();
  const home = selectedHome || currentHome;
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loggingTask, setLoggingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    if (home && currentUser) loadTasks();
  }, [home, currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`, sort: 'nextServiceDate', $autoCancel: false
      });
      setTasks(records);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogsForTask = async (taskId) => {
    try {
      const records = await pb.collection('service_logs').getFullList({
        filter: `taskId="${taskId}"`, sort: '-serviceDate', $autoCancel: false
      });
      setLogs(prev => ({ ...prev, [taskId]: records }));
      return records;
    } catch { return []; }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, form, { $autoCancel: false });
        toast({ title: '✅ Task updated' });
      } else {
        await pb.collection('maintenance_systems').create({ ...form, homeId: home.id, ownerId: currentUser.id }, { $autoCancel: false });
        toast({ title: '✅ Task added' });
      }
      setShowTaskModal(false); setEditingTask(null); loadTasks();
    } catch { toast({ title: 'Error saving task', variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance task?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ Task deleted' }); loadTasks();
    } catch { toast({ title: 'Error deleting task', variant: 'destructive' }); }
  };

  const handleLogService = async (form) => {
    try {
      await pb.collection('service_logs').create({ taskId: loggingTask.id, homeId: home.id, ownerId: currentUser.id, ...form }, { $autoCancel: false }).catch(() => {});
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (CADENCE_DAYS[loggingTask.cadence] || 365));
      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendorName: form.vendorName || loggingTask.vendorName,
      }, { $autoCancel: false });
      toast({ title: '✅ Service logged!' }); setLoggingTask(null); loadTasks();
    } catch { toast({ title: 'Error logging service', variant: 'destructive' }); }
  };

  const handleOpenLog = async (task) => {
    const taskLogs = await loadLogsForTask(task.id);
    setLoggingTask({ ...task, logs: taskLogs });
  };

  const today = new Date();
  const overdueTasks = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today);
  const upcomingTasks = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = Math.ceil((new Date(t.nextServiceDate) - today) / 86400000);
    return d >= 0 && d <= 60;
  });
  const scheduledTasks = tasks.filter(t => {
    if (!t.nextServiceDate) return true;
    return Math.ceil((new Date(t.nextServiceDate) - today) / 86400000) > 60;
  });

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) || t.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const nextDate = t.nextServiceDate ? new Date(t.nextServiceDate) : null;
    const daysUntil = nextDate ? Math.ceil((nextDate - today) / 86400000) : null;
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Overdue' && daysUntil !== null && daysUntil < 0) ||
      (filterStatus === 'Upcoming' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30) ||
      (filterStatus === 'Up To Date' && daysUntil !== null && daysUntil > 30);
    return matchSearch && matchCat && matchStatus;
  });

  if (!home) {
    return (
      <div className="text-center" style={{ padding: '48px 20px' }}>
        <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fff7ed', marginBottom: '16px' }}>
          <Wrench style={{ width: '28px', height: '28px', color: '#f97316' }} />
        </div>
        <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No property selected.</p>
        <p className="text-slate-400" style={{ fontSize: '14px' }}>Select a property from the top menu to view maintenance tasks.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Maintenance — CasaCEO</title></Helmet>
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Maintenance</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed' }}>
                <Wrench style={{ width: '24px', height: '24px', color: '#f97316' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Maintenance</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>{home.name} · {tasks.length} tasks tracked</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Task
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '32px' }}>
          {[
            { key: 'schedule', label: 'Schedule', icon: Calendar },
            { key: 'log', label: 'Service Log', icon: ClipboardList },
            { key: 'seasonal', label: 'Seasonal Guide', icon: TreePine },
            { key: 'vendors', label: 'Vendors', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 rounded-xl transition-all font-medium"
                style={{
                  padding: '8px 16px', fontSize: '13px',
                  background: activeTab === tab.key ? '#1e3a5f' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#64748b',
                }}>
                <Icon style={{ width: '14px', height: '14px' }} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Schedule Tab ── */}
        {activeTab === 'schedule' && (
          <>
            <SummaryStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '24px' }}>
              <div className="relative flex-1">
                <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <Input placeholder="Search tasks or vendors…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200" />
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
                <option value="All">All Categories</option>
                {MAINTENANCE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due Soon</option>
                <option value="Up To Date">Up To Date</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', padding: '48px 20px', border: '2px dashed #e2e8f0' }}>
                <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#fff7ed', marginBottom: '16px' }}>
                  <Wrench style={{ width: '28px', height: '28px', color: '#f97316' }} />
                </div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No maintenance tasks yet.</p>
                <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px' }}>Stay ahead of costly repairs — start building your home's maintenance history today.</p>
                <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="font-semibold text-white rounded-xl hover:opacity-90 transition-all"
                  style={{ background: '#1e3a5f', padding: '12px 24px', fontSize: '14px' }}>
                  <Plus className="w-4 h-4 inline mr-2" /> Add First Task
                </button>
              </div>
            ) : (
              <>
                {/* Overdue section */}
                {overdueTasks.length > 0 && filterStatus === 'All' && (
                  <div style={{ marginBottom: '24px' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                      <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                      <h2 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Overdue <span className="text-red-500">({overdueTasks.length})</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {overdueTasks.map(task => <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={handleOpenLog} />)}
                    </div>
                  </div>
                )}

                {/* Upcoming section */}
                {upcomingTasks.length > 0 && filterStatus === 'All' && (
                  <div style={{ marginBottom: '24px' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                      <Clock style={{ width: '16px', height: '16px', color: '#d97706' }} />
                      <h2 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Due in the Next 60 Days <span className="text-amber-500">({upcomingTasks.length})</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingTasks.map(task => <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={handleOpenLog} />)}
                    </div>
                  </div>
                )}

                {/* All / Scheduled section */}
                {(filterStatus !== 'All' || scheduledTasks.length > 0) && (
                  <div>
                    {filterStatus === 'All' && (
                      <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669' }} />
                        <h2 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Scheduled <span className="text-green-600">({scheduledTasks.length})</span></h2>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(filterStatus === 'All' ? scheduledTasks : filteredTasks).map(task => (
                        <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={handleOpenLog} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Service Log Tab ── */}
        {activeTab === 'log' && (
          <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="border-b border-slate-100" style={{ padding: '20px 24px' }}>
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Service History</h2>
              <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Complete log of all maintenance performed on this home.</p>
            </div>
            <div style={{ padding: '24px' }}>
              {tasks.filter(t => t.lastServiceDate).length === 0 ? (
                <div className="text-center" style={{ padding: '32px 0' }}>
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" style={{ marginBottom: '12px' }} />
                  <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>No service history yet.</p>
                  <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Log your first service from the Schedule tab.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) => new Date(b.lastServiceDate) - new Date(a.lastServiceDate)).map(task => (
                    <div key={task.id} className="flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '20px' }}>{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{task.taskName}</p>
                        <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '2px' }}>
                          {task.vendorName && `${task.vendorName} · `}{task.cadence}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {task.estimatedCost && <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>${parseFloat(task.estimatedCost).toFixed(0)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Seasonal Guide Tab ── */}
        {activeTab === 'seasonal' && <SeasonalGuide />}

        {/* ── Vendors Tab ── */}
        {activeTab === 'vendors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div className="border-b border-slate-100" style={{ padding: '20px 24px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Your Vendors</h2>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Vendors saved from your maintenance tasks.</p>
              </div>
              <div style={{ padding: '24px' }}>
                {tasks.filter(t => t.vendorName).length === 0 ? (
                  <div className="text-center" style={{ padding: '32px 0' }}>
                    <User className="w-10 h-10 text-slate-300 mx-auto" style={{ marginBottom: '12px' }} />
                    <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>No vendors saved yet.</p>
                    <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Add vendor info when creating maintenance tasks.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendorName).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl" style={{ padding: '16px' }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '20px' }}>{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{task.vendorName}</p>
                            <p className="text-slate-400" style={{ fontSize: '12px' }}>{task.category}</p>
                          </div>
                        </div>
                        {task.vendorPhone && (
                          <a href={`tel:${task.vendorPhone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700" style={{ fontSize: '12px', marginBottom: '4px' }}>
                            <Phone style={{ width: '12px', height: '12px' }} /> {task.vendorPhone}
                          </a>
                        )}
                        {task.vendorEmail && (
                          <a href={`mailto:${task.vendorEmail}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700" style={{ fontSize: '12px' }}>
                            <Mail style={{ width: '12px', height: '12px' }} /> {task.vendorEmail}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div className="border-b border-slate-100 flex items-center justify-between" style={{ padding: '20px 24px' }}>
                <div>
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Recommended Vendors</h2>
                  <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Trusted vendors by category.</p>
                </div>
                <Link to="/vendors" className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                  Full Directory <ArrowRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </div>
              <div style={{ padding: '24px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const cat = MAINTENANCE_CATEGORIES.find(c => c.name === category);
                    return (
                      <div key={category} className={`rounded-xl border ${cat?.color || 'bg-slate-50 border-slate-200'}`} style={{ padding: '14px' }}>
                        <p className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '13px', marginBottom: '8px' }}>
                          <span>{cat?.icon}</span> {category}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {vendors.map(v => (
                            <p key={v} className="text-slate-600 flex items-center gap-1.5" style={{ fontSize: '12px' }}>
                              <Star style={{ width: '11px', height: '11px', color: '#f59e0b' }} /> {v}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTaskModal && <TaskModal task={editingTask} onSave={handleSaveTask} onClose={() => { setShowTaskModal(false); setEditingTask(null); }} />}
      {loggingTask && <ServiceLogModal task={loggingTask} logs={logs[loggingTask.id] || []} onAddLog={handleLogService} onClose={() => setLoggingTask(null)} />}
    </>
  );
};

export default MaintenanceManagementPage;
