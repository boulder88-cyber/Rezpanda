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
  AlertCircle, CheckCircle2, User, Star, Search,
  ClipboardList, TreePine, Wind, Sun,
  Snowflake, ArrowRight, ChevronRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════
// NOTE: category names below MUST exactly match the systemType select
// values in the maintenance_systems collection (case-sensitive).

const MAINTENANCE_CATEGORIES = [
  { name: 'HVAC', icon: '❄️', color: 'bg-blue-50 border-blue-100' },
  { name: 'Plumbing', icon: '🔧', color: 'bg-cyan-50 border-cyan-100' },
  { name: 'Electrical', icon: '⚡', color: 'bg-yellow-50 border-yellow-100' },
  { name: 'Roofing', icon: '🏠', color: 'bg-orange-50 border-orange-100' },
  { name: 'Landscaping', icon: '🌿', color: 'bg-green-50 border-green-100' },
  { name: 'Pest Control', icon: '🐛', color: 'bg-red-50 border-red-100' },
  { name: 'Appliances', icon: '🍳', color: 'bg-purple-50 border-purple-100' },
  { name: 'Pool/Spa', icon: '🏊', color: 'bg-sky-50 border-sky-100' },
  { name: 'Security', icon: '🔒', color: 'bg-slate-50 border-slate-200' },
  { name: 'Gutters', icon: '🍂', color: 'bg-amber-50 border-amber-100' },
  { name: 'Painting', icon: '🖌️', color: 'bg-pink-50 border-pink-100' },
  { name: 'Foundation', icon: '🧱', color: 'bg-stone-50 border-stone-200' },
  { name: 'Insulation', icon: '🧊', color: 'bg-indigo-50 border-indigo-100' },
  { name: 'Windows', icon: '🪟', color: 'bg-teal-50 border-teal-100' },
  { name: 'Doors', icon: '🚪', color: 'bg-rose-50 border-rose-100' },
  { name: 'General', icon: '🔨', color: 'bg-gray-50 border-gray-200' },
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
  'Foundation': ['Local Foundation Repair', 'Olshan'],
  'Insulation': ['Local Insulation Pro', 'USA Insulation'],
  'Windows': ['Local Window Pro', 'Renewal by Andersen'],
  'Doors': ['Local Door Installer', 'Home Depot Install'],
  'General': ['TaskRabbit', 'Angi', 'HomeAdvisor'],
};

const SEASONAL_TASKS = {
  Spring: { icon: TreePine, color: '#16a34a', bg: '#f0fdf4', tasks: ['Gutter cleaning', 'HVAC tune-up', 'Exterior inspection', 'Lawn fertilization', 'Pest control check'] },
  Summer: { icon: Sun, color: '#d97706', bg: '#fffbeb', tasks: ['AC service', 'Pool maintenance', 'Pest control', 'Irrigation check', 'Deck inspection'] },
  Fall: { icon: Wind, color: '#f97316', bg: '#fff7ed', tasks: ['Roof inspection', 'Heating prep', 'Gutter cleaning', 'Weatherization', 'Chimney sweep'] },
  Winter: { icon: Snowflake, color: '#2563eb', bg: '#eff6ff', tasks: ['Pipe insulation', 'Heating check', 'Storm prep', 'Generator test', 'Smoke detector check'] },
};

// One master cadence list used by every category.
const CADENCE_LIST = ['Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annually', 'Custom'];

const CADENCE_DAYS = {
  'Weekly': 7, 'Monthly': 30, 'Quarterly': 90, 'Semi-Annual': 180, 'Annually': 365,
};

// Map a number of days back to a cadence label (for display/editing).
// Exact matches return the named cadence; anything else is treated as Custom.
const daysToCadence = (days) => {
  if (!days) return 'Annually';
  for (const [label, d] of Object.entries(CADENCE_DAYS)) {
    if (d === days) return label;
  }
  return 'Custom';
};

// Human-friendly label for cards/lists: shows the day count for custom intervals.
const cadenceDisplay = (days) => {
  const label = daysToCadence(days);
  return label === 'Custom' ? `Every ${days}d` : label;
};

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

const calcNextDate = (lastDate, cadence, customDays) => {
  if (!lastDate) return '';
  const days = cadence === 'Custom' ? (parseInt(customDays, 10) || 0) : (CADENCE_DAYS[cadence] || 365);
  if (!days) return '';
  const d = new Date(lastDate);
  d.setDate(d.getDate() + days);
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
  const [form, setForm] = useState(() => {
    const cad = task ? daysToCadence(task.reminderFrequencyDays) : 'Annually';
    return {
      systemName: task?.systemName || '',
      systemType: task?.systemType || 'HVAC',
      cadence: cad,
      customDays: cad === 'Custom' ? String(task?.reminderFrequencyDays || '') : '',
      lastServiceDate: task?.lastServiceDate ? task.lastServiceDate.split(' ')[0] : '',
      nextServiceDate: task?.nextServiceDate ? task.nextServiceDate.split(' ')[0] : '',
      vendor: task?.vendor || '',
      serviceHistory: task?.serviceHistory || '',
    };
  });

  const suggestedVendors = RECOMMENDED_VENDORS[form.systemType] || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg my-4" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
          <h2 className="font-semibold text-white" style={{ fontSize: '18px' }}>{task ? 'Edit System' : 'Add Home System'}</h2>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">System Name</Label>
            <Input placeholder="e.g. HVAC Filter Change" value={form.systemName} onChange={e => setForm(p => ({ ...p, systemName: e.target.value }))} className="h-11 rounded-xl" />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button key={cat.name} onClick={() => setForm(p => ({ ...p, systemType: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${form.systemType === cat.name ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                  style={form.systemType === cat.name ? { background: '#1e3a5f' } : {}}>
                  <div className="text-lg mb-0.5">{cat.icon}</div>{cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {CADENCE_LIST.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, cadence: c, nextServiceDate: calcNextDate(p.lastServiceDate, c, p.customDays) }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${form.cadence === c ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                  {c}
                </button>
              ))}
            </div>
            {form.cadence === 'Custom' && (
              <div style={{ marginTop: '12px' }}>
                <Label className="text-xs font-medium text-slate-500 mb-1 block">Every how many days?</Label>
                <Input type="number" min="1" placeholder="e.g. 45" value={form.customDays}
                  onChange={e => setForm(p => ({ ...p, customDays: e.target.value, nextServiceDate: calcNextDate(p.lastServiceDate, 'Custom', e.target.value) }))}
                  className="h-11 rounded-xl" style={{ maxWidth: '160px' }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input type="date" value={form.lastServiceDate}
                onChange={e => setForm(p => ({ ...p, lastServiceDate: e.target.value, nextServiceDate: calcNextDate(e.target.value, p.cadence, p.customDays) }))}
                className="h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input type="date" value={form.nextServiceDate} onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))} className="h-11 rounded-xl" />
              {form.lastServiceDate && <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl" style={{ padding: '16px' }}>
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2" style={{ marginBottom: '12px' }}>
              <User className="w-4 h-4" /> Vendor
            </p>
            {suggestedVendors.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <p className="text-xs text-slate-400 mb-2">Suggested for {form.systemType}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button key={v} onClick={() => setForm(p => ({ ...p, vendor: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.vendor === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Input placeholder="Vendor name" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} className="h-10 rounded-xl bg-white" />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea placeholder="Filter size, model #, any notes…" value={form.serviceHistory} onChange={e => setForm(p => ({ ...p, serviceHistory: e.target.value }))}
              className="w-full h-20 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={() => onSave(form)} disabled={!form.systemName} className="flex-1 h-12 rounded-xl text-white font-bold" style={{ background: '#1e3a5f' }}>
              {task ? 'Save Changes' : 'Add System'}
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

const ServiceLogModal = ({ task, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendor: task?.vendor || '', notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between" style={{ background: '#059669', borderRadius: '16px 16px 0 0', padding: '20px 24px' }}>
          <div>
            <h2 className="font-semibold text-white" style={{ fontSize: '18px' }}>Log Service</h2>
            <p className="text-green-100" style={{ fontSize: '13px' }}>{task?.systemName}</p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
            <Input type="date" value={form.serviceDate} onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input placeholder="Who did the work?" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea placeholder="What was done? Any issues found?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
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
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.systemType);
  const cadenceLabel = cadenceDisplay(task.reminderFrequencyDays);

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
              <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{task.systemName}</p>
              <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{task.systemType} · {cadenceLabel}</p>
            </div>
          </div>
          <span className={`font-medium rounded-full px-2 py-0.5 ${status.color}`} style={{ fontSize: '12px', flexShrink: 0 }}>{status.label}</span>
        </div>

        {task.vendor && (
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl" style={{ padding: '10px 12px', marginBottom: '12px' }}>
            <User style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} />
            <p className="font-semibold text-slate-700 truncate" style={{ fontSize: '13px' }}>{task.vendor}</p>
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
  const total = tasks.length;
  const health = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Overdue', value: overdue, icon: AlertCircle, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', filter: 'Overdue' },
          { label: 'Due This Month', value: dueSoon, icon: Clock, color: '#d97706', bg: '#fffbeb', border: '#fde68a', filter: 'Upcoming' },
          { label: 'Up to Date', value: upToDate, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', filter: 'Up To Date' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} onClick={() => s.filter && onFilter(s.filter)}
              className="text-left hover:shadow-md transition-all cursor-pointer"
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
          <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '6px' }}>{upToDate} of {total} systems current · {overdue} overdue</p>
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
      console.error('Failed to load systems:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build the DB payload from the modal form. Maps cadence -> reminderFrequencyDays.
  const buildPayload = (form) => ({
    systemName: form.systemName,
    systemType: form.systemType,
    reminderFrequencyDays: form.cadence === 'Custom' ? (parseInt(form.customDays, 10) || 0) : (CADENCE_DAYS[form.cadence] || 365),
    recurringReminder: true,
    lastServiceDate: form.lastServiceDate || '',
    nextServiceDate: form.nextServiceDate || '',
    vendor: form.vendor || '',
    serviceHistory: form.serviceHistory || '',
  });

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, buildPayload(form), { $autoCancel: false });
        toast({ title: '✅ System updated' });
      } else {
        await pb.collection('maintenance_systems').create(
          { ...buildPayload(form), homeId: home.id, ownerId: currentUser.id },
          { $autoCancel: false }
        );
        toast({ title: '✅ System added' });
      }
      setShowTaskModal(false); setEditingTask(null); loadTasks();
    } catch (e) {
      console.error('Save failed:', e);
      toast({ title: 'Error saving system', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this home system?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ System deleted' }); loadTasks();
    } catch { toast({ title: 'Error deleting system', variant: 'destructive' }); }
  };

  // Logging a service updates the system's dates + appends to its notes/history.
  const handleLogService = async (form) => {
    try {
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (loggingTask.reminderFrequencyDays || 365));
      const stamp = `${form.serviceDate}${form.vendor ? ` · ${form.vendor}` : ''}${form.notes ? ` — ${form.notes}` : ''}`;
      const newHistory = loggingTask.serviceHistory
        ? `${stamp}\n${loggingTask.serviceHistory}`
        : stamp;
      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendor: form.vendor || loggingTask.vendor || '',
        serviceHistory: newHistory,
      }, { $autoCancel: false });
      toast({ title: '✅ Service logged!' }); setLoggingTask(null); loadTasks();
    } catch (e) {
      console.error('Log failed:', e);
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
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
    const matchSearch = t.systemName?.toLowerCase().includes(searchQuery.toLowerCase()) || t.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'All' || t.systemType === filterCategory;
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
        <p className="text-slate-400" style={{ fontSize: '14px' }}>Select a property from the top menu to view maintenance.</p>
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
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>{home.name} · {tasks.length} systems tracked</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add System
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '32px' }}>
          {[
            { key: 'schedule', label: 'Home Systems', icon: Calendar },
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

        {/* ── Home Systems Tab ── */}
        {activeTab === 'schedule' && (
          <>
            <SummaryStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '24px' }}>
              <div className="relative flex-1">
                <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <Input placeholder="Search systems or vendors…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200" />
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
                <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No home systems yet.</p>
                <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px' }}>Stay ahead of costly repairs — start building your home's maintenance history today.</p>
                <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="font-semibold text-white rounded-xl hover:opacity-90 transition-all"
                  style={{ background: '#1e3a5f', padding: '12px 24px', fontSize: '14px' }}>
                  <Plus className="w-4 h-4 inline mr-2" /> Add First System
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
                      {overdueTasks.map(task => <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={setLoggingTask} />)}
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
                      {upcomingTasks.map(task => <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={setLoggingTask} />)}
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
                        <TaskCard key={task.id} task={task} onEdit={t => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={setLoggingTask} />
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
                  <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Log your first service from the Home Systems tab.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) => new Date(b.lastServiceDate) - new Date(a.lastServiceDate)).map(task => (
                    <div key={task.id} className="flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '20px' }}>{MAINTENANCE_CATEGORIES.find(c => c.name === task.systemType)?.icon || '🔨'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{task.systemName}</p>
                        <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '2px' }}>
                          {task.vendor && `${task.vendor} · `}{cadenceDisplay(task.reminderFrequencyDays)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
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
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Vendors saved from your home systems.</p>
              </div>
              <div style={{ padding: '24px' }}>
                {tasks.filter(t => t.vendor).length === 0 ? (
                  <div className="text-center" style={{ padding: '32px 0' }}>
                    <User className="w-10 h-10 text-slate-300 mx-auto" style={{ marginBottom: '12px' }} />
                    <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>No vendors saved yet.</p>
                    <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px' }}>Add vendor info when creating a home system.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendor).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl" style={{ padding: '16px' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '20px' }}>{MAINTENANCE_CATEGORIES.find(c => c.name === task.systemType)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{task.vendor}</p>
                            <p className="text-slate-400" style={{ fontSize: '12px' }}>{task.systemType} · {task.systemName}</p>
                          </div>
                        </div>
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
      {loggingTask && <ServiceLogModal task={loggingTask} onAddLog={handleLogService} onClose={() => setLoggingTask(null)} />}
    </>
  );
};

export default MaintenanceManagementPage;
