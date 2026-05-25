import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Wrench, Plus, X, Check, Edit2, Trash2, ChevronRight,
  Calendar, Clock, AlertCircle, CheckCircle2, User,
  Phone, Mail, Star, Search, Filter, ArrowLeft,
  ClipboardList, RotateCcw, Building2, ChevronDown,
  FileText, DollarSign, Bell
} from 'lucide-react';

// ─── Maintenance Categories ───────────────────────────────────────────
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

// ─── Add/Edit Task Modal ──────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || '',
    category: task?.category || 'HVAC',
    cadence: task?.cadence || 'Annual',
    lastServiceDate: task?.lastServiceDate || '',
    nextServiceDate: task?.nextServiceDate || '',
    vendorName: task?.vendorName || '',
    vendorPhone: task?.vendorPhone || '',
    vendorEmail: task?.vendorEmail || '',
    estimatedCost: task?.estimatedCost || '',
    notes: task?.notes || '',
  });

  const selectedCategory = MAINTENANCE_CATEGORIES.find(c => c.name === form.category);
  const suggestedVendors = RECOMMENDED_VENDORS[form.category] || [];

  const calcNextDate = (lastDate, cadence) => {
    if (!lastDate) return '';
    const d = new Date(lastDate);
    const map = {
      'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
      'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
      'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5, 'Every 10 Years': 365 * 10, 'Seasonal': 90
    };
    d.setDate(d.getDate() + (map[cadence] || 365));
    return d.toISOString().split('T')[0];
  };

  const handleLastDateChange = (val) => {
    setForm(prev => ({
      ...prev,
      lastServiceDate: val,
      nextServiceDate: calcNextDate(val, prev.cadence)
    }));
  };

  const handleCadenceChange = (val) => {
    setForm(prev => ({
      ...prev,
      cadence: val,
      nextServiceDate: calcNextDate(prev.lastServiceDate, val)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
        <div className="bg-slate-900 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Add Maintenance Task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Task Name */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Task Name</Label>
            <Input
              placeholder="e.g. HVAC Filter Change"
              value={form.taskName}
              onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                    form.category === cat.name
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {(selectedCategory?.cadences || ['Annual']).map(c => (
                <button
                  key={c}
                  onClick={() => handleCadenceChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.cadence === c
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input
                type="date"
                value={form.lastServiceDate}
                onChange={e => handleLastDateChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input
                type="date"
                value={form.nextServiceDate}
                onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
              {form.lastServiceDate && form.nextServiceDate && (
                <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>
              )}
            </div>
          </div>

          {/* Vendor Section */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Vendor Information
            </p>

            {/* Suggested Vendors */}
            {suggestedVendors.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested vendors for {form.category}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button
                      key={v}
                      onClick={() => setForm(p => ({ ...p, vendorName: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.vendorName === v
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Vendor name"
                value={form.vendorName}
                onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
                className="h-10 rounded-xl bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Phone number"
                  value={form.vendorPhone}
                  onChange={e => setForm(p => ({ ...p, vendorPhone: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
                <Input
                  placeholder="Email"
                  value={form.vendorEmail}
                  onChange={e => setForm(p => ({ ...p, vendorEmail: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Est. Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.estimatedCost}
                  onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
              <Input
                placeholder="Any notes..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={!form.taskName}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Service Log Modal ────────────────────────────────────────────────
const ServiceLogModal = ({ task, logs, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendorName: task?.vendorName || '',
    cost: '',
    notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-600 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Service</h2>
            <p className="text-green-100 text-sm">{task?.taskName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
              <Input
                type="date"
                value={form.serviceDate}
                onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cost Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.cost}
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input
              placeholder="Who did the work?"
              value={form.vendorName}
              onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea
              placeholder="What was done? Any issues found?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Past Logs */}
          {logs && logs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Past Service History</p>
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onAddLog(form)}
              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Check className="w-4 h-4 mr-2" /> Log Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.category);

  const getStatus = () => {
    if (!daysUntil) return { label: 'No date set', color: 'bg-slate-100 text-slate-500', urgent: false };
    if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, color: 'bg-red-100 text-red-600', urgent: true };
    if (daysUntil <= 14) return { label: `Due in ${daysUntil}d`, color: 'bg-orange-100 text-orange-600', urgent: true };
    if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: 'bg-yellow-100 text-yellow-600', urgent: false };
    return { label: `Due in ${daysUntil}d`, color: 'bg-green-100 text-green-600', urgent: false };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${status.urgent ? 'border-red-200' : 'border-slate-200'}`}>
      {status.urgent && <div className="h-1 w-full bg-red-400 rounded-t-2xl"></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat?.icon || '🔨'}</span>
            <div>
              <h3 className="font-bold text-slate-900">{task.taskName}</h3>
              <p className="text-slate-400 text-xs">{task.category} · {task.cadence}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Vendor */}
        {task.vendorName && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{task.vendorName}</p>
              {task.vendorPhone && <p className="text-xs text-slate-400">{task.vendorPhone}</p>}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.lastServiceDate && (
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Last Service</p>
              <p className="text-xs font-bold text-slate-700">{new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {task.nextServiceDate && (
            <div className={`rounded-lg p-2 text-center ${status.urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className="text-xs text-slate-400">Next Due</p>
              <p className={`text-xs font-bold ${status.urgent ? 'text-red-600' : 'text-blue-600'}`}>{new Date(task.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {task.estimatedCost && (
          <p className="text-xs text-slate-400 mb-3">
            <DollarSign className="w-3 h-3 inline mr-0.5" />
            Est. ${parseFloat(task.estimatedCost).toFixed(0)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onLogService(task)}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Log Service
          </Button>
          <button
            onClick={() => onEdit(task)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 flex-shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = new Date(t.nextServiceDate);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const upToDate = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    return new Date(t.nextServiceDate) > today;
  }).length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: overdue === 0 ? 'All Clear ✓' : 'Overdue', value: overdue, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 border-red-100', filter: 'Overdue', hover: 'hover:bg-red-100' },
          { label: 'Upcoming This Month', value: dueSoon, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 border-orange-100', filter: 'Due Soon', hover: 'hover:bg-orange-100', hint: 'Plan ahead to stay proactive' },
          { label: 'All Systems Go', value: upToDate, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-100', filter: 'Up To Date', hover: 'hover:bg-green-100' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onFilter && onFilter(s.filter)}
            className={`${s.color} ${s.hover} border rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:-translate-y-0.5 cursor-pointer w-full`}
            title={`Click to filter by ${s.label}`}
          >
            <div className="mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>
      {total > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">CasaOS Operations Health</p>
            <p className="text-xs font-bold text-slate-900">{completionRate}% up to date</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#059669' : completionRate >= 50 ? '#d97706' : '#dc2626'
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{upToDate} of {total} service records up to date</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
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
    if (home && currentUser) {
      loadTasks();
    }
  }, [home, currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`,
        sort: 'nextServiceDate',
        $autoCancel: false
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
        filter: `taskId="${taskId}"`,
        sort: '-serviceDate',
        $autoCancel: false
      });
      setLogs(prev => ({ ...prev, [taskId]: records }));
      return records;
    } catch {
      return [];
    }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, form, { $autoCancel: false });
        toast({ title: '✅ Task updated' });
      } else {
        await pb.collection('maintenance_systems').create({
          ...form,
          homeId: home.id,
          ownerId: currentUser.id
        }, { $autoCancel: false });
        toast({ title: '✅ Task added' });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error saving task', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance task?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ Task deleted' });
      loadTasks();
    } catch {
      toast({ title: 'Error deleting task', variant: 'destructive' });
    }
  };

  const handleLogService = async (form) => {
    try {
      // Save to service log
      await pb.collection('service_logs').create({
        taskId: loggingTask.id,
        homeId: home.id,
        ownerId: currentUser.id,
        ...form
      }, { $autoCancel: false }).catch(() => {}); // Graceful if collection doesn't exist yet

      // Update last service date and calculate next
      const cat = MAINTENANCE_CATEGORIES.find(c => c.name === loggingTask.category);
      const map = {
        'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
        'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
        'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5,
        'Every 10 Years': 365 * 10, 'Seasonal': 90
      };
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (map[loggingTask.cadence] || 365));

      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendorName: form.vendorName || loggingTask.vendorName,
      }, { $autoCancel: false });

      toast({ title: '✅ Service logged successfully!' });
      setLoggingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
  };

  const handleOpenLog = async (task) => {
    const taskLogs = await loadLogsForTask(task.id);
    setLoggingTask({ ...task, logs: taskLogs });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const today = new Date();
    const nextDate = t.nextServiceDate ? new Date(t.nextServiceDate) : null;
    const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Overdue' && daysUntil !== null && daysUntil < 0) ||
      (filterStatus === 'Upcoming' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30) ||
      (filterStatus === 'Up To Date' && daysUntil !== null && daysUntil > 30);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!home) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm mb-4">Select a property from the top menu to get started.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"><span className="text-amber-600 text-xs font-medium">👆 Use the property selector in the top right</span></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Maintenance — CasaCEO</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Maintenance</h1>
                <p className="text-slate-400 text-sm">{home.name} · {tasks.length} tasks tracked{tasks.length > 0 ? ` · Click a status card to filter` : ''}</p>
              </div>
            </div>
            <Button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { key: 'log', label: 'Service Log', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'vendors', label: 'Vendors', icon: <User className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <QuickStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tasks or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-slate-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Categories</option>
                {MAINTENANCE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due Soon</option>
                <option value="Up To Date">Up To Date</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No maintenance tasks yet 🔧</h3>
                <p className="text-slate-500 mb-2">Stay ahead of costly repairs — start building your home's maintenance memory today.</p><p className="text-slate-400 text-xs mb-6">Track HVAC filters, pest control, roof inspections, and more across all your properties.</p>
                <Button
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="rounded-xl bg-slate-900 text-white px-8"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Task
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDelete}
                    onLogService={handleOpenLog}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Service History</h2>
              <p className="text-slate-400 text-sm">Complete log of all maintenance performed</p>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No service history yet. Log your first service from the Schedule tab.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) =>
                    new Date(b.lastServiceDate) - new Date(a.lastServiceDate)
                  ).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{task.taskName}</p>
                          <p className="text-xs text-slate-400">{task.vendorName && `${task.vendorName} · `}{task.cadence}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {task.estimatedCost && <p className="text-xs text-slate-400">${parseFloat(task.estimatedCost).toFixed(0)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Saved Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Your Vendors</h2>
                <p className="text-slate-400 text-sm">Vendors saved from your maintenance tasks</p>
              </div>
              <div className="p-6">
                {tasks.filter(t => t.vendorName).length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No vendors saved yet. Add vendor info when creating tasks.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendorName).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{task.vendorName}</p>
                            <p className="text-xs text-slate-400">{task.category}</p>
                          </div>
                        </div>
                        {task.vendorPhone && (
                          <a href={`tel:${task.vendorPhone}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 mb-1">
                            <Phone className="w-3 h-3" /> {task.vendorPhone}
                          </a>
                        )}
                        {task.vendorEmail && (
                          <a href={`mailto:${task.vendorEmail}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                            <Mail className="w-3 h-3" /> {task.vendorEmail}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Recommended Vendors</h2>
                <p className="text-slate-400 text-sm">Trusted vendors by category — coming soon with CasaCEO verified contractors</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const cat = MAINTENANCE_CATEGORIES.find(c => c.name === category);
                    return (
                      <div key={category} className={`rounded-xl border p-4 ${cat?.color || 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <span>{cat?.icon}</span> {category}
                        </p>
                        <div className="space-y-1">
                          {vendors.map(v => (
                            <p key={v} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-400" /> {v}
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

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}

      {loggingTask && (
        <ServiceLogModal
          task={loggingTask}
          logs={logs[loggingTask.id] || []}
          onAddLog={handleLogService}
          onClose={() => setLoggingTask(null)}
        />
      )}
    </>
  );
};

export default MaintenanceManagementPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Wrench, Plus, X, Check, Edit2, Trash2, ChevronRight,
  Calendar, Clock, AlertCircle, CheckCircle2, User,
  Phone, Mail, Star, Search, Filter, ArrowLeft,
  ClipboardList, RotateCcw, Building2, ChevronDown,
  FileText, DollarSign, Bell
} from 'lucide-react';

// ─── Maintenance Categories ───────────────────────────────────────────
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

// ─── Add/Edit Task Modal ──────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || '',
    category: task?.category || 'HVAC',
    cadence: task?.cadence || 'Annual',
    lastServiceDate: task?.lastServiceDate || '',
    nextServiceDate: task?.nextServiceDate || '',
    vendorName: task?.vendorName || '',
    vendorPhone: task?.vendorPhone || '',
    vendorEmail: task?.vendorEmail || '',
    estimatedCost: task?.estimatedCost || '',
    notes: task?.notes || '',
  });

  const selectedCategory = MAINTENANCE_CATEGORIES.find(c => c.name === form.category);
  const suggestedVendors = RECOMMENDED_VENDORS[form.category] || [];

  const calcNextDate = (lastDate, cadence) => {
    if (!lastDate) return '';
    const d = new Date(lastDate);
    const map = {
      'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
      'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
      'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5, 'Every 10 Years': 365 * 10, 'Seasonal': 90
    };
    d.setDate(d.getDate() + (map[cadence] || 365));
    return d.toISOString().split('T')[0];
  };

  const handleLastDateChange = (val) => {
    setForm(prev => ({
      ...prev,
      lastServiceDate: val,
      nextServiceDate: calcNextDate(val, prev.cadence)
    }));
  };

  const handleCadenceChange = (val) => {
    setForm(prev => ({
      ...prev,
      cadence: val,
      nextServiceDate: calcNextDate(prev.lastServiceDate, val)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
        <div className="bg-slate-900 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Add Maintenance Task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Task Name */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Task Name</Label>
            <Input
              placeholder="e.g. HVAC Filter Change"
              value={form.taskName}
              onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                    form.category === cat.name
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {(selectedCategory?.cadences || ['Annual']).map(c => (
                <button
                  key={c}
                  onClick={() => handleCadenceChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.cadence === c
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input
                type="date"
                value={form.lastServiceDate}
                onChange={e => handleLastDateChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input
                type="date"
                value={form.nextServiceDate}
                onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
              {form.lastServiceDate && form.nextServiceDate && (
                <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>
              )}
            </div>
          </div>

          {/* Vendor Section */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Vendor Information
            </p>

            {/* Suggested Vendors */}
            {suggestedVendors.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested vendors for {form.category}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button
                      key={v}
                      onClick={() => setForm(p => ({ ...p, vendorName: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.vendorName === v
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Vendor name"
                value={form.vendorName}
                onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
                className="h-10 rounded-xl bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Phone number"
                  value={form.vendorPhone}
                  onChange={e => setForm(p => ({ ...p, vendorPhone: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
                <Input
                  placeholder="Email"
                  value={form.vendorEmail}
                  onChange={e => setForm(p => ({ ...p, vendorEmail: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Est. Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.estimatedCost}
                  onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
              <Input
                placeholder="Any notes..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={!form.taskName}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Service Log Modal ────────────────────────────────────────────────
const ServiceLogModal = ({ task, logs, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendorName: task?.vendorName || '',
    cost: '',
    notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-600 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Service</h2>
            <p className="text-green-100 text-sm">{task?.taskName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
              <Input
                type="date"
                value={form.serviceDate}
                onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cost Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.cost}
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input
              placeholder="Who did the work?"
              value={form.vendorName}
              onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea
              placeholder="What was done? Any issues found?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Past Logs */}
          {logs && logs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Past Service History</p>
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onAddLog(form)}
              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Check className="w-4 h-4 mr-2" /> Log Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.category);

  const getStatus = () => {
    if (!daysUntil) return { label: 'No date set', color: 'bg-slate-100 text-slate-500', urgent: false };
    if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, color: 'bg-red-100 text-red-600', urgent: true };
    if (daysUntil <= 14) return { label: `Due in ${daysUntil}d`, color: 'bg-orange-100 text-orange-600', urgent: true };
    if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: 'bg-yellow-100 text-yellow-600', urgent: false };
    return { label: `Due in ${daysUntil}d`, color: 'bg-green-100 text-green-600', urgent: false };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${status.urgent ? 'border-red-200' : 'border-slate-200'}`}>
      {status.urgent && <div className="h-1 w-full bg-red-400 rounded-t-2xl"></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat?.icon || '🔨'}</span>
            <div>
              <h3 className="font-bold text-slate-900">{task.taskName}</h3>
              <p className="text-slate-400 text-xs">{task.category} · {task.cadence}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Vendor */}
        {task.vendorName && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{task.vendorName}</p>
              {task.vendorPhone && <p className="text-xs text-slate-400">{task.vendorPhone}</p>}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.lastServiceDate && (
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Last Service</p>
              <p className="text-xs font-bold text-slate-700">{new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {task.nextServiceDate && (
            <div className={`rounded-lg p-2 text-center ${status.urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className="text-xs text-slate-400">Next Due</p>
              <p className={`text-xs font-bold ${status.urgent ? 'text-red-600' : 'text-blue-600'}`}>{new Date(task.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {task.estimatedCost && (
          <p className="text-xs text-slate-400 mb-3">
            <DollarSign className="w-3 h-3 inline mr-0.5" />
            Est. ${parseFloat(task.estimatedCost).toFixed(0)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onLogService(task)}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Log Service
          </Button>
          <button
            onClick={() => onEdit(task)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 flex-shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = new Date(t.nextServiceDate);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const upToDate = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    return new Date(t.nextServiceDate) > today;
  }).length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: overdue === 0 ? 'All Clear ✓' : 'Overdue', value: overdue, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 border-red-100', filter: 'Overdue', hover: 'hover:bg-red-100' },
          { label: 'Upcoming This Month', value: dueSoon, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 border-orange-100', filter: 'Due Soon', hover: 'hover:bg-orange-100', hint: 'Plan ahead to stay proactive' },
          { label: 'All Systems Go', value: upToDate, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-100', filter: 'Up To Date', hover: 'hover:bg-green-100' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onFilter && onFilter(s.filter)}
            className={`${s.color} ${s.hover} border rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:-translate-y-0.5 cursor-pointer w-full`}
            title={`Click to filter by ${s.label}`}
          >
            <div className="mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>
      {total > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">CasaOS Operations Health</p>
            <p className="text-xs font-bold text-slate-900">{completionRate}% up to date</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#059669' : completionRate >= 50 ? '#d97706' : '#dc2626'
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{upToDate} of {total} service records up to date</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
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
    if (home && currentUser) {
      loadTasks();
    }
  }, [home, currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`,
        sort: 'nextServiceDate',
        $autoCancel: false
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
        filter: `taskId="${taskId}"`,
        sort: '-serviceDate',
        $autoCancel: false
      });
      setLogs(prev => ({ ...prev, [taskId]: records }));
      return records;
    } catch {
      return [];
    }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, form, { $autoCancel: false });
        toast({ title: '✅ Task updated' });
      } else {
        await pb.collection('maintenance_systems').create({
          ...form,
          homeId: home.id,
          ownerId: currentUser.id
        }, { $autoCancel: false });
        toast({ title: '✅ Task added' });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error saving task', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance task?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ Task deleted' });
      loadTasks();
    } catch {
      toast({ title: 'Error deleting task', variant: 'destructive' });
    }
  };

  const handleLogService = async (form) => {
    try {
      // Save to service log
      await pb.collection('service_logs').create({
        taskId: loggingTask.id,
        homeId: home.id,
        ownerId: currentUser.id,
        ...form
      }, { $autoCancel: false }).catch(() => {}); // Graceful if collection doesn't exist yet

      // Update last service date and calculate next
      const cat = MAINTENANCE_CATEGORIES.find(c => c.name === loggingTask.category);
      const map = {
        'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
        'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
        'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5,
        'Every 10 Years': 365 * 10, 'Seasonal': 90
      };
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (map[loggingTask.cadence] || 365));

      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendorName: form.vendorName || loggingTask.vendorName,
      }, { $autoCancel: false });

      toast({ title: '✅ Service logged successfully!' });
      setLoggingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
  };

  const handleOpenLog = async (task) => {
    const taskLogs = await loadLogsForTask(task.id);
    setLoggingTask({ ...task, logs: taskLogs });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const today = new Date();
    const nextDate = t.nextServiceDate ? new Date(t.nextServiceDate) : null;
    const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Overdue' && daysUntil !== null && daysUntil < 0) ||
      (filterStatus === 'Upcoming' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30) ||
      (filterStatus === 'Up To Date' && daysUntil !== null && daysUntil > 30);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!home) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm mb-4">Select a property from the top menu to get started.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"><span className="text-amber-600 text-xs font-medium">👆 Use the property selector in the top right</span></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Maintenance — CasaCEO</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Maintenance</h1>
                <p className="text-slate-400 text-sm">{home.name} · {tasks.length} tasks tracked{tasks.length > 0 ? ` · Click a status card to filter` : ''}</p>
              </div>
            </div>
            <Button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { key: 'log', label: 'Service Log', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'vendors', label: 'Vendors', icon: <User className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <QuickStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tasks or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-slate-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Categories</option>
                {MAINTENANCE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due Soon</option>
                <option value="Up To Date">Up To Date</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No maintenance tasks yet 🔧</h3>
                <p className="text-slate-500 mb-2">Stay ahead of costly repairs — start building your home's maintenance memory today.</p><p className="text-slate-400 text-xs mb-6">Track HVAC filters, pest control, roof inspections, and more across all your properties.</p>
                <Button
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="rounded-xl bg-slate-900 text-white px-8"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Task
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDelete}
                    onLogService={handleOpenLog}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Service History</h2>
              <p className="text-slate-400 text-sm">Complete log of all maintenance performed</p>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No service history yet. Log your first service from the Schedule tab.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) =>
                    new Date(b.lastServiceDate) - new Date(a.lastServiceDate)
                  ).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{task.taskName}</p>
                          <p className="text-xs text-slate-400">{task.vendorName && `${task.vendorName} · `}{task.cadence}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {task.estimatedCost && <p className="text-xs text-slate-400">${parseFloat(task.estimatedCost).toFixed(0)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Saved Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Your Vendors</h2>
                <p className="text-slate-400 text-sm">Vendors saved from your maintenance tasks</p>
              </div>
              <div className="p-6">
                {tasks.filter(t => t.vendorName).length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No vendors saved yet. Add vendor info when creating tasks.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendorName).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{task.vendorName}</p>
                            <p className="text-xs text-slate-400">{task.category}</p>
                          </div>
                        </div>
                        {task.vendorPhone && (
                          <a href={`tel:${task.vendorPhone}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 mb-1">
                            <Phone className="w-3 h-3" /> {task.vendorPhone}
                          </a>
                        )}
                        {task.vendorEmail && (
                          <a href={`mailto:${task.vendorEmail}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                            <Mail className="w-3 h-3" /> {task.vendorEmail}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Recommended Vendors</h2>
                <p className="text-slate-400 text-sm">Trusted vendors by category — coming soon with CasaCEO verified contractors</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const cat = MAINTENANCE_CATEGORIES.find(c => c.name === category);
                    return (
                      <div key={category} className={`rounded-xl border p-4 ${cat?.color || 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <span>{cat?.icon}</span> {category}
                        </p>
                        <div className="space-y-1">
                          {vendors.map(v => (
                            <p key={v} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-400" /> {v}
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

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}

      {loggingTask && (
        <ServiceLogModal
          task={loggingTask}
          logs={logs[loggingTask.id] || []}
          onAddLog={handleLogService}
          onClose={() => setLoggingTask(null)}
        />
      )}
    </>
  );
};

export default MaintenanceManagementPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Wrench, Plus, X, Check, Edit2, Trash2, ChevronRight,
  Calendar, Clock, AlertCircle, CheckCircle2, User,
  Phone, Mail, Star, Search, Filter, ArrowLeft,
  ClipboardList, RotateCcw, Building2, ChevronDown,
  FileText, DollarSign, Bell
} from 'lucide-react';

// ─── Maintenance Categories ───────────────────────────────────────────
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

// ─── Add/Edit Task Modal ──────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || '',
    category: task?.category || 'HVAC',
    cadence: task?.cadence || 'Annual',
    lastServiceDate: task?.lastServiceDate || '',
    nextServiceDate: task?.nextServiceDate || '',
    vendorName: task?.vendorName || '',
    vendorPhone: task?.vendorPhone || '',
    vendorEmail: task?.vendorEmail || '',
    estimatedCost: task?.estimatedCost || '',
    notes: task?.notes || '',
  });

  const selectedCategory = MAINTENANCE_CATEGORIES.find(c => c.name === form.category);
  const suggestedVendors = RECOMMENDED_VENDORS[form.category] || [];

  const calcNextDate = (lastDate, cadence) => {
    if (!lastDate) return '';
    const d = new Date(lastDate);
    const map = {
      'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
      'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
      'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5, 'Every 10 Years': 365 * 10, 'Seasonal': 90
    };
    d.setDate(d.getDate() + (map[cadence] || 365));
    return d.toISOString().split('T')[0];
  };

  const handleLastDateChange = (val) => {
    setForm(prev => ({
      ...prev,
      lastServiceDate: val,
      nextServiceDate: calcNextDate(val, prev.cadence)
    }));
  };

  const handleCadenceChange = (val) => {
    setForm(prev => ({
      ...prev,
      cadence: val,
      nextServiceDate: calcNextDate(prev.lastServiceDate, val)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
        <div className="bg-slate-900 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Add Maintenance Task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Task Name */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Task Name</Label>
            <Input
              placeholder="e.g. HVAC Filter Change"
              value={form.taskName}
              onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                    form.category === cat.name
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {(selectedCategory?.cadences || ['Annual']).map(c => (
                <button
                  key={c}
                  onClick={() => handleCadenceChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.cadence === c
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input
                type="date"
                value={form.lastServiceDate}
                onChange={e => handleLastDateChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input
                type="date"
                value={form.nextServiceDate}
                onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
              {form.lastServiceDate && form.nextServiceDate && (
                <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>
              )}
            </div>
          </div>

          {/* Vendor Section */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Vendor Information
            </p>

            {/* Suggested Vendors */}
            {suggestedVendors.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested vendors for {form.category}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button
                      key={v}
                      onClick={() => setForm(p => ({ ...p, vendorName: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.vendorName === v
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Vendor name"
                value={form.vendorName}
                onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
                className="h-10 rounded-xl bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Phone number"
                  value={form.vendorPhone}
                  onChange={e => setForm(p => ({ ...p, vendorPhone: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
                <Input
                  placeholder="Email"
                  value={form.vendorEmail}
                  onChange={e => setForm(p => ({ ...p, vendorEmail: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Est. Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.estimatedCost}
                  onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
              <Input
                placeholder="Any notes..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={!form.taskName}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Service Log Modal ────────────────────────────────────────────────
const ServiceLogModal = ({ task, logs, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendorName: task?.vendorName || '',
    cost: '',
    notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-600 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Service</h2>
            <p className="text-green-100 text-sm">{task?.taskName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
              <Input
                type="date"
                value={form.serviceDate}
                onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cost Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.cost}
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input
              placeholder="Who did the work?"
              value={form.vendorName}
              onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea
              placeholder="What was done? Any issues found?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Past Logs */}
          {logs && logs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Past Service History</p>
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onAddLog(form)}
              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Check className="w-4 h-4 mr-2" /> Log Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.category);

  const getStatus = () => {
    if (!daysUntil) return { label: 'No date set', color: 'bg-slate-100 text-slate-500', urgent: false };
    if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, color: 'bg-red-100 text-red-600', urgent: true };
    if (daysUntil <= 14) return { label: `Due in ${daysUntil}d`, color: 'bg-orange-100 text-orange-600', urgent: true };
    if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: 'bg-yellow-100 text-yellow-600', urgent: false };
    return { label: `Due in ${daysUntil}d`, color: 'bg-green-100 text-green-600', urgent: false };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${status.urgent ? 'border-red-200' : 'border-slate-200'}`}>
      {status.urgent && <div className="h-1 w-full bg-red-400 rounded-t-2xl"></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat?.icon || '🔨'}</span>
            <div>
              <h3 className="font-bold text-slate-900">{task.taskName}</h3>
              <p className="text-slate-400 text-xs">{task.category} · {task.cadence}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Vendor */}
        {task.vendorName && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{task.vendorName}</p>
              {task.vendorPhone && <p className="text-xs text-slate-400">{task.vendorPhone}</p>}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.lastServiceDate && (
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Last Service</p>
              <p className="text-xs font-bold text-slate-700">{new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {task.nextServiceDate && (
            <div className={`rounded-lg p-2 text-center ${status.urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className="text-xs text-slate-400">Next Due</p>
              <p className={`text-xs font-bold ${status.urgent ? 'text-red-600' : 'text-blue-600'}`}>{new Date(task.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {task.estimatedCost && (
          <p className="text-xs text-slate-400 mb-3">
            <DollarSign className="w-3 h-3 inline mr-0.5" />
            Est. ${parseFloat(task.estimatedCost).toFixed(0)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onLogService(task)}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Log Service
          </Button>
          <button
            onClick={() => onEdit(task)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 flex-shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = new Date(t.nextServiceDate);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const upToDate = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    return new Date(t.nextServiceDate) > today;
  }).length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: overdue === 0 ? 'All Clear ✓' : 'Overdue', value: overdue, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 border-red-100', filter: 'Overdue', hover: 'hover:bg-red-100' },
          { label: 'Upcoming This Month', value: dueSoon, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 border-orange-100', filter: 'Due Soon', hover: 'hover:bg-orange-100', hint: 'Plan ahead to stay proactive' },
          { label: 'All Systems Go', value: upToDate, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-100', filter: 'Up To Date', hover: 'hover:bg-green-100' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onFilter && onFilter(s.filter)}
            className={`${s.color} ${s.hover} border rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:-translate-y-0.5 cursor-pointer w-full`}
            title={`Click to filter by ${s.label}`}
          >
            <div className="mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>
      {total > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">CasaOS Operations Health</p>
            <p className="text-xs font-bold text-slate-900">{completionRate}% up to date</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#059669' : completionRate >= 50 ? '#d97706' : '#dc2626'
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{upToDate} of {total} service records up to date</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
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
    if (home && currentUser) {
      loadTasks();
    }
  }, [home, currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`,
        sort: 'nextServiceDate',
        $autoCancel: false
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
        filter: `taskId="${taskId}"`,
        sort: '-serviceDate',
        $autoCancel: false
      });
      setLogs(prev => ({ ...prev, [taskId]: records }));
      return records;
    } catch {
      return [];
    }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, form, { $autoCancel: false });
        toast({ title: '✅ Task updated' });
      } else {
        await pb.collection('maintenance_systems').create({
          ...form,
          homeId: home.id,
          ownerId: currentUser.id
        }, { $autoCancel: false });
        toast({ title: '✅ Task added' });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error saving task', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance task?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ Task deleted' });
      loadTasks();
    } catch {
      toast({ title: 'Error deleting task', variant: 'destructive' });
    }
  };

  const handleLogService = async (form) => {
    try {
      // Save to service log
      await pb.collection('service_logs').create({
        taskId: loggingTask.id,
        homeId: home.id,
        ownerId: currentUser.id,
        ...form
      }, { $autoCancel: false }).catch(() => {}); // Graceful if collection doesn't exist yet

      // Update last service date and calculate next
      const cat = MAINTENANCE_CATEGORIES.find(c => c.name === loggingTask.category);
      const map = {
        'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
        'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
        'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5,
        'Every 10 Years': 365 * 10, 'Seasonal': 90
      };
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (map[loggingTask.cadence] || 365));

      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendorName: form.vendorName || loggingTask.vendorName,
      }, { $autoCancel: false });

      toast({ title: '✅ Service logged successfully!' });
      setLoggingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
  };

  const handleOpenLog = async (task) => {
    const taskLogs = await loadLogsForTask(task.id);
    setLoggingTask({ ...task, logs: taskLogs });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const today = new Date();
    const nextDate = t.nextServiceDate ? new Date(t.nextServiceDate) : null;
    const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Overdue' && daysUntil !== null && daysUntil < 0) ||
      (filterStatus === 'Upcoming' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30) ||
      (filterStatus === 'Up To Date' && daysUntil !== null && daysUntil > 30);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!home) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm mb-4">Select a property from the top menu to get started.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"><span className="text-amber-600 text-xs font-medium">👆 Use the property selector in the top right</span></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Maintenance — CasaCEO</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Maintenance</h1>
                <p className="text-slate-400 text-sm">{home.name} · {tasks.length} tasks tracked{tasks.length > 0 ? ` · Click a status card to filter` : ''}</p>
              </div>
            </div>
            <Button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { key: 'log', label: 'Service Log', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'vendors', label: 'Vendors', icon: <User className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <QuickStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tasks or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-slate-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Categories</option>
                {MAINTENANCE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due Soon</option>
                <option value="Up To Date">Up To Date</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No maintenance tasks yet 🔧</h3>
                <p className="text-slate-500 mb-2">Stay ahead of costly repairs — start building your home's maintenance memory today.</p><p className="text-slate-400 text-xs mb-6">Track HVAC filters, pest control, roof inspections, and more across all your properties.</p>
                <Button
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="rounded-xl bg-slate-900 text-white px-8"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Task
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDelete}
                    onLogService={handleOpenLog}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Service History</h2>
              <p className="text-slate-400 text-sm">Complete log of all maintenance performed</p>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No service history yet. Log your first service from the Schedule tab.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) =>
                    new Date(b.lastServiceDate) - new Date(a.lastServiceDate)
                  ).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{task.taskName}</p>
                          <p className="text-xs text-slate-400">{task.vendorName && `${task.vendorName} · `}{task.cadence}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {task.estimatedCost && <p className="text-xs text-slate-400">${parseFloat(task.estimatedCost).toFixed(0)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Saved Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Your Vendors</h2>
                <p className="text-slate-400 text-sm">Vendors saved from your maintenance tasks</p>
              </div>
              <div className="p-6">
                {tasks.filter(t => t.vendorName).length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No vendors saved yet. Add vendor info when creating tasks.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendorName).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{task.vendorName}</p>
                            <p className="text-xs text-slate-400">{task.category}</p>
                          </div>
                        </div>
                        {task.vendorPhone && (
                          <a href={`tel:${task.vendorPhone}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 mb-1">
                            <Phone className="w-3 h-3" /> {task.vendorPhone}
                          </a>
                        )}
                        {task.vendorEmail && (
                          <a href={`mailto:${task.vendorEmail}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                            <Mail className="w-3 h-3" /> {task.vendorEmail}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Recommended Vendors</h2>
                <p className="text-slate-400 text-sm">Trusted vendors by category — coming soon with CasaCEO verified contractors</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const cat = MAINTENANCE_CATEGORIES.find(c => c.name === category);
                    return (
                      <div key={category} className={`rounded-xl border p-4 ${cat?.color || 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <span>{cat?.icon}</span> {category}
                        </p>
                        <div className="space-y-1">
                          {vendors.map(v => (
                            <p key={v} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-400" /> {v}
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

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}

      {loggingTask && (
        <ServiceLogModal
          task={loggingTask}
          logs={logs[loggingTask.id] || []}
          onAddLog={handleLogService}
          onClose={() => setLoggingTask(null)}
        />
      )}
    </>
  );
};

export default MaintenanceManagementPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Wrench, Plus, X, Check, Edit2, Trash2, ChevronRight,
  Calendar, Clock, AlertCircle, CheckCircle2, User,
  Phone, Mail, Star, Search, Filter, ArrowLeft,
  ClipboardList, RotateCcw, Building2, ChevronDown,
  FileText, DollarSign, Bell
} from 'lucide-react';

// ─── Maintenance Categories ───────────────────────────────────────────
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

// ─── Add/Edit Task Modal ──────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || '',
    category: task?.category || 'HVAC',
    cadence: task?.cadence || 'Annual',
    lastServiceDate: task?.lastServiceDate || '',
    nextServiceDate: task?.nextServiceDate || '',
    vendorName: task?.vendorName || '',
    vendorPhone: task?.vendorPhone || '',
    vendorEmail: task?.vendorEmail || '',
    estimatedCost: task?.estimatedCost || '',
    notes: task?.notes || '',
  });

  const selectedCategory = MAINTENANCE_CATEGORIES.find(c => c.name === form.category);
  const suggestedVendors = RECOMMENDED_VENDORS[form.category] || [];

  const calcNextDate = (lastDate, cadence) => {
    if (!lastDate) return '';
    const d = new Date(lastDate);
    const map = {
      'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
      'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
      'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5, 'Every 10 Years': 365 * 10, 'Seasonal': 90
    };
    d.setDate(d.getDate() + (map[cadence] || 365));
    return d.toISOString().split('T')[0];
  };

  const handleLastDateChange = (val) => {
    setForm(prev => ({
      ...prev,
      lastServiceDate: val,
      nextServiceDate: calcNextDate(val, prev.cadence)
    }));
  };

  const handleCadenceChange = (val) => {
    setForm(prev => ({
      ...prev,
      cadence: val,
      nextServiceDate: calcNextDate(prev.lastServiceDate, val)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
        <div className="bg-slate-900 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Add Maintenance Task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Task Name */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Task Name</Label>
            <Input
              placeholder="e.g. HVAC Filter Change"
              value={form.taskName}
              onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                    form.category === cat.name
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {(selectedCategory?.cadences || ['Annual']).map(c => (
                <button
                  key={c}
                  onClick={() => handleCadenceChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.cadence === c
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input
                type="date"
                value={form.lastServiceDate}
                onChange={e => handleLastDateChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input
                type="date"
                value={form.nextServiceDate}
                onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
              {form.lastServiceDate && form.nextServiceDate && (
                <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>
              )}
            </div>
          </div>

          {/* Vendor Section */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Vendor Information
            </p>

            {/* Suggested Vendors */}
            {suggestedVendors.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested vendors for {form.category}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button
                      key={v}
                      onClick={() => setForm(p => ({ ...p, vendorName: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.vendorName === v
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Vendor name"
                value={form.vendorName}
                onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
                className="h-10 rounded-xl bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Phone number"
                  value={form.vendorPhone}
                  onChange={e => setForm(p => ({ ...p, vendorPhone: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
                <Input
                  placeholder="Email"
                  value={form.vendorEmail}
                  onChange={e => setForm(p => ({ ...p, vendorEmail: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Est. Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.estimatedCost}
                  onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
              <Input
                placeholder="Any notes..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={!form.taskName}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Service Log Modal ────────────────────────────────────────────────
const ServiceLogModal = ({ task, logs, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendorName: task?.vendorName || '',
    cost: '',
    notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-600 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Service</h2>
            <p className="text-green-100 text-sm">{task?.taskName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
              <Input
                type="date"
                value={form.serviceDate}
                onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cost Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.cost}
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input
              placeholder="Who did the work?"
              value={form.vendorName}
              onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea
              placeholder="What was done? Any issues found?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Past Logs */}
          {logs && logs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Past Service History</p>
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onAddLog(form)}
              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Check className="w-4 h-4 mr-2" /> Log Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.category);

  const getStatus = () => {
    if (!daysUntil) return { label: 'No date set', color: 'bg-slate-100 text-slate-500', urgent: false };
    if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, color: 'bg-red-100 text-red-600', urgent: true };
    if (daysUntil <= 14) return { label: `Due in ${daysUntil}d`, color: 'bg-orange-100 text-orange-600', urgent: true };
    if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: 'bg-yellow-100 text-yellow-600', urgent: false };
    return { label: `Due in ${daysUntil}d`, color: 'bg-green-100 text-green-600', urgent: false };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${status.urgent ? 'border-red-200' : 'border-slate-200'}`}>
      {status.urgent && <div className="h-1 w-full bg-red-400 rounded-t-2xl"></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat?.icon || '🔨'}</span>
            <div>
              <h3 className="font-bold text-slate-900">{task.taskName}</h3>
              <p className="text-slate-400 text-xs">{task.category} · {task.cadence}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Vendor */}
        {task.vendorName && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{task.vendorName}</p>
              {task.vendorPhone && <p className="text-xs text-slate-400">{task.vendorPhone}</p>}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.lastServiceDate && (
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Last Service</p>
              <p className="text-xs font-bold text-slate-700">{new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {task.nextServiceDate && (
            <div className={`rounded-lg p-2 text-center ${status.urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className="text-xs text-slate-400">Next Due</p>
              <p className={`text-xs font-bold ${status.urgent ? 'text-red-600' : 'text-blue-600'}`}>{new Date(task.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {task.estimatedCost && (
          <p className="text-xs text-slate-400 mb-3">
            <DollarSign className="w-3 h-3 inline mr-0.5" />
            Est. ${parseFloat(task.estimatedCost).toFixed(0)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onLogService(task)}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Log Service
          </Button>
          <button
            onClick={() => onEdit(task)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 flex-shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = new Date(t.nextServiceDate);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const upToDate = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    return new Date(t.nextServiceDate) > today;
  }).length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: overdue === 0 ? 'All Clear ✓' : 'Overdue', value: overdue, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 border-red-100', filter: 'Overdue', hover: 'hover:bg-red-100' },
          { label: 'Upcoming This Month', value: dueSoon, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 border-orange-100', filter: 'Due Soon', hover: 'hover:bg-orange-100', hint: 'Plan ahead to stay proactive' },
          { label: 'All Systems Go', value: upToDate, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-100', filter: 'Up To Date', hover: 'hover:bg-green-100' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onFilter && onFilter(s.filter)}
            className={`${s.color} ${s.hover} border rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:-translate-y-0.5 cursor-pointer w-full`}
            title={`Click to filter by ${s.label}`}
          >
            <div className="mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>
      {total > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">CasaOS Operations Health</p>
            <p className="text-xs font-bold text-slate-900">{completionRate}% up to date</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#059669' : completionRate >= 50 ? '#d97706' : '#dc2626'
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{upToDate} of {total} service records up to date</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
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
    if (home && currentUser) {
      loadTasks();
    }
  }, [home, currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`,
        sort: 'nextServiceDate',
        $autoCancel: false
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
        filter: `taskId="${taskId}"`,
        sort: '-serviceDate',
        $autoCancel: false
      });
      setLogs(prev => ({ ...prev, [taskId]: records }));
      return records;
    } catch {
      return [];
    }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, form, { $autoCancel: false });
        toast({ title: '✅ Task updated' });
      } else {
        await pb.collection('maintenance_systems').create({
          ...form,
          homeId: home.id,
          ownerId: currentUser.id
        }, { $autoCancel: false });
        toast({ title: '✅ Task added' });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error saving task', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance task?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ Task deleted' });
      loadTasks();
    } catch {
      toast({ title: 'Error deleting task', variant: 'destructive' });
    }
  };

  const handleLogService = async (form) => {
    try {
      // Save to service log
      await pb.collection('service_logs').create({
        taskId: loggingTask.id,
        homeId: home.id,
        ownerId: currentUser.id,
        ...form
      }, { $autoCancel: false }).catch(() => {}); // Graceful if collection doesn't exist yet

      // Update last service date and calculate next
      const cat = MAINTENANCE_CATEGORIES.find(c => c.name === loggingTask.category);
      const map = {
        'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
        'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
        'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5,
        'Every 10 Years': 365 * 10, 'Seasonal': 90
      };
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (map[loggingTask.cadence] || 365));

      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendorName: form.vendorName || loggingTask.vendorName,
      }, { $autoCancel: false });

      toast({ title: '✅ Service logged successfully!' });
      setLoggingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
  };

  const handleOpenLog = async (task) => {
    const taskLogs = await loadLogsForTask(task.id);
    setLoggingTask({ ...task, logs: taskLogs });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const today = new Date();
    const nextDate = t.nextServiceDate ? new Date(t.nextServiceDate) : null;
    const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Overdue' && daysUntil !== null && daysUntil < 0) ||
      (filterStatus === 'Upcoming' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30) ||
      (filterStatus === 'Up To Date' && daysUntil !== null && daysUntil > 30);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!home) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm mb-4">Select a property from the top menu to get started.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"><span className="text-amber-600 text-xs font-medium">👆 Use the property selector in the top right</span></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Maintenance — CasaCEO</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Maintenance</h1>
                <p className="text-slate-400 text-sm">{home.name} · {tasks.length} tasks tracked{tasks.length > 0 ? ` · Click a status card to filter` : ''}</p>
              </div>
            </div>
            <Button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { key: 'log', label: 'Service Log', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'vendors', label: 'Vendors', icon: <User className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <QuickStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tasks or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-slate-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Categories</option>
                {MAINTENANCE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due Soon</option>
                <option value="Up To Date">Up To Date</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No maintenance tasks yet 🔧</h3>
                <p className="text-slate-500 mb-2">Stay ahead of costly repairs — start building your home's maintenance memory today.</p><p className="text-slate-400 text-xs mb-6">Track HVAC filters, pest control, roof inspections, and more across all your properties.</p>
                <Button
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="rounded-xl bg-slate-900 text-white px-8"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Task
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDelete}
                    onLogService={handleOpenLog}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Service History</h2>
              <p className="text-slate-400 text-sm">Complete log of all maintenance performed</p>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No service history yet. Log your first service from the Schedule tab.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) =>
                    new Date(b.lastServiceDate) - new Date(a.lastServiceDate)
                  ).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{task.taskName}</p>
                          <p className="text-xs text-slate-400">{task.vendorName && `${task.vendorName} · `}{task.cadence}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {task.estimatedCost && <p className="text-xs text-slate-400">${parseFloat(task.estimatedCost).toFixed(0)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Saved Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Your Vendors</h2>
                <p className="text-slate-400 text-sm">Vendors saved from your maintenance tasks</p>
              </div>
              <div className="p-6">
                {tasks.filter(t => t.vendorName).length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No vendors saved yet. Add vendor info when creating tasks.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendorName).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{task.vendorName}</p>
                            <p className="text-xs text-slate-400">{task.category}</p>
                          </div>
                        </div>
                        {task.vendorPhone && (
                          <a href={`tel:${task.vendorPhone}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 mb-1">
                            <Phone className="w-3 h-3" /> {task.vendorPhone}
                          </a>
                        )}
                        {task.vendorEmail && (
                          <a href={`mailto:${task.vendorEmail}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                            <Mail className="w-3 h-3" /> {task.vendorEmail}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Recommended Vendors</h2>
                <p className="text-slate-400 text-sm">Trusted vendors by category — coming soon with CasaCEO verified contractors</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const cat = MAINTENANCE_CATEGORIES.find(c => c.name === category);
                    return (
                      <div key={category} className={`rounded-xl border p-4 ${cat?.color || 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <span>{cat?.icon}</span> {category}
                        </p>
                        <div className="space-y-1">
                          {vendors.map(v => (
                            <p key={v} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-400" /> {v}
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

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}

      {loggingTask && (
        <ServiceLogModal
          task={loggingTask}
          logs={logs[loggingTask.id] || []}
          onAddLog={handleLogService}
          onClose={() => setLoggingTask(null)}
        />
      )}
    </>
  );
};

export default MaintenanceManagementPage;
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Wrench, Plus, X, Check, Edit2, Trash2, ChevronRight,
  Calendar, Clock, AlertCircle, CheckCircle2, User,
  Phone, Mail, Star, Search, Filter, ArrowLeft,
  ClipboardList, RotateCcw, Building2, ChevronDown,
  FileText, DollarSign, Bell
} from 'lucide-react';

// ─── Maintenance Categories ───────────────────────────────────────────
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

// ─── Add/Edit Task Modal ──────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    taskName: task?.taskName || '',
    category: task?.category || 'HVAC',
    cadence: task?.cadence || 'Annual',
    lastServiceDate: task?.lastServiceDate || '',
    nextServiceDate: task?.nextServiceDate || '',
    vendorName: task?.vendorName || '',
    vendorPhone: task?.vendorPhone || '',
    vendorEmail: task?.vendorEmail || '',
    estimatedCost: task?.estimatedCost || '',
    notes: task?.notes || '',
  });

  const selectedCategory = MAINTENANCE_CATEGORIES.find(c => c.name === form.category);
  const suggestedVendors = RECOMMENDED_VENDORS[form.category] || [];

  const calcNextDate = (lastDate, cadence) => {
    if (!lastDate) return '';
    const d = new Date(lastDate);
    const map = {
      'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
      'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
      'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5, 'Every 10 Years': 365 * 10, 'Seasonal': 90
    };
    d.setDate(d.getDate() + (map[cadence] || 365));
    return d.toISOString().split('T')[0];
  };

  const handleLastDateChange = (val) => {
    setForm(prev => ({
      ...prev,
      lastServiceDate: val,
      nextServiceDate: calcNextDate(val, prev.cadence)
    }));
  };

  const handleCadenceChange = (val) => {
    setForm(prev => ({
      ...prev,
      cadence: val,
      nextServiceDate: calcNextDate(prev.lastServiceDate, val)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4">
        <div className="bg-slate-900 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Add Maintenance Task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Task Name */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Task Name</Label>
            <Input
              placeholder="e.g. HVAC Filter Change"
              value={form.taskName}
              onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {MAINTENANCE_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setForm(p => ({ ...p, category: cat.name }))}
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                    form.category === cat.name
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-lg mb-0.5">{cat.icon}</div>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cadence */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Cadence</Label>
            <div className="flex flex-wrap gap-2">
              {(selectedCategory?.cadences || ['Annual']).map(c => (
                <button
                  key={c}
                  onClick={() => handleCadenceChange(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.cadence === c
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Last Service Date</Label>
              <Input
                type="date"
                value={form.lastServiceDate}
                onChange={e => handleLastDateChange(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Next Due Date</Label>
              <Input
                type="date"
                value={form.nextServiceDate}
                onChange={e => setForm(p => ({ ...p, nextServiceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
              {form.lastServiceDate && form.nextServiceDate && (
                <p className="text-xs text-blue-500 mt-1">Auto-calculated from cadence</p>
              )}
            </div>
          </div>

          {/* Vendor Section */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Vendor Information
            </p>

            {/* Suggested Vendors */}
            {suggestedVendors.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Suggested vendors for {form.category}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedVendors.map(v => (
                    <button
                      key={v}
                      onClick={() => setForm(p => ({ ...p, vendorName: v }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.vendorName === v
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Vendor name"
                value={form.vendorName}
                onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
                className="h-10 rounded-xl bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Phone number"
                  value={form.vendorPhone}
                  onChange={e => setForm(p => ({ ...p, vendorPhone: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
                <Input
                  placeholder="Email"
                  value={form.vendorEmail}
                  onChange={e => setForm(p => ({ ...p, vendorEmail: e.target.value }))}
                  className="h-10 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Est. Cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.estimatedCost}
                  onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
              <Input
                placeholder="Any notes..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={!form.taskName}
              className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Service Log Modal ────────────────────────────────────────────────
const ServiceLogModal = ({ task, logs, onAddLog, onClose }) => {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    vendorName: task?.vendorName || '',
    cost: '',
    notes: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-600 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Service</h2>
            <p className="text-green-100 text-sm">{task?.taskName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Service Date</Label>
              <Input
                type="date"
                value={form.serviceDate}
                onChange={e => setForm(p => ({ ...p, serviceDate: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Cost Paid</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="150"
                  value={form.cost}
                  onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  className="h-11 rounded-xl pl-7"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Vendor</Label>
            <Input
              placeholder="Who did the work?"
              value={form.vendorName}
              onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))}
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Notes</Label>
            <textarea
              placeholder="What was done? Any issues found?"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Past Logs */}
          {logs && logs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Past Service History</p>
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => onAddLog(form)}
              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Check className="w-4 h-4 mr-2" /> Log Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
  const cat = MAINTENANCE_CATEGORIES.find(c => c.name === task.category);

  const getStatus = () => {
    if (!daysUntil) return { label: 'No date set', color: 'bg-slate-100 text-slate-500', urgent: false };
    if (daysUntil < 0) return { label: `${Math.abs(daysUntil)}d overdue`, color: 'bg-red-100 text-red-600', urgent: true };
    if (daysUntil <= 14) return { label: `Due in ${daysUntil}d`, color: 'bg-orange-100 text-orange-600', urgent: true };
    if (daysUntil <= 30) return { label: `Due in ${daysUntil}d`, color: 'bg-yellow-100 text-yellow-600', urgent: false };
    return { label: `Due in ${daysUntil}d`, color: 'bg-green-100 text-green-600', urgent: false };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${status.urgent ? 'border-red-200' : 'border-slate-200'}`}>
      {status.urgent && <div className="h-1 w-full bg-red-400 rounded-t-2xl"></div>}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat?.icon || '🔨'}</span>
            <div>
              <h3 className="font-bold text-slate-900">{task.taskName}</h3>
              <p className="text-slate-400 text-xs">{task.category} · {task.cadence}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Vendor */}
        {task.vendorName && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{task.vendorName}</p>
              {task.vendorPhone && <p className="text-xs text-slate-400">{task.vendorPhone}</p>}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.lastServiceDate && (
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-400">Last Service</p>
              <p className="text-xs font-bold text-slate-700">{new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
          {task.nextServiceDate && (
            <div className={`rounded-lg p-2 text-center ${status.urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
              <p className="text-xs text-slate-400">Next Due</p>
              <p className={`text-xs font-bold ${status.urgent ? 'text-red-600' : 'text-blue-600'}`}>{new Date(task.nextServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>

        {task.estimatedCost && (
          <p className="text-xs text-slate-400 mb-3">
            <DollarSign className="w-3 h-3 inline mr-0.5" />
            Est. ${parseFloat(task.estimatedCost).toFixed(0)}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onLogService(task)}
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs h-9"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Log Service
          </Button>
          <button
            onClick={() => onEdit(task)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 flex-shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────
const QuickStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter(t => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    const d = new Date(t.nextServiceDate);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const upToDate = tasks.filter(t => {
    if (!t.nextServiceDate) return false;
    return new Date(t.nextServiceDate) > today;
  }).length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: overdue === 0 ? 'All Clear ✓' : 'Overdue', value: overdue, icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'bg-red-50 border-red-100', filter: 'Overdue', hover: 'hover:bg-red-100' },
          { label: 'Upcoming This Month', value: dueSoon, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 border-orange-100', filter: 'Due Soon', hover: 'hover:bg-orange-100', hint: 'Plan ahead to stay proactive' },
          { label: 'All Systems Go', value: upToDate, icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, color: 'bg-green-50 border-green-100', filter: 'Up To Date', hover: 'hover:bg-green-100' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onFilter && onFilter(s.filter)}
            className={`${s.color} ${s.hover} border rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:-translate-y-0.5 cursor-pointer w-full`}
            title={`Click to filter by ${s.label}`}
          >
            <div className="mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>
      {total > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">CasaOS Operations Health</p>
            <p className="text-xs font-bold text-slate-900">{completionRate}% up to date</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#059669' : completionRate >= 50 ? '#d97706' : '#dc2626'
              }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{upToDate} of {total} service records up to date</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
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
    if (home && currentUser) {
      loadTasks();
    }
  }, [home, currentUser]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`,
        sort: 'nextServiceDate',
        $autoCancel: false
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
        filter: `taskId="${taskId}"`,
        sort: '-serviceDate',
        $autoCancel: false
      });
      setLogs(prev => ({ ...prev, [taskId]: records }));
      return records;
    } catch {
      return [];
    }
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        await pb.collection('maintenance_systems').update(editingTask.id, form, { $autoCancel: false });
        toast({ title: '✅ Task updated' });
      } else {
        await pb.collection('maintenance_systems').create({
          ...form,
          homeId: home.id,
          ownerId: currentUser.id
        }, { $autoCancel: false });
        toast({ title: '✅ Task added' });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error saving task', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance task?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: '✅ Task deleted' });
      loadTasks();
    } catch {
      toast({ title: 'Error deleting task', variant: 'destructive' });
    }
  };

  const handleLogService = async (form) => {
    try {
      // Save to service log
      await pb.collection('service_logs').create({
        taskId: loggingTask.id,
        homeId: home.id,
        ownerId: currentUser.id,
        ...form
      }, { $autoCancel: false }).catch(() => {}); // Graceful if collection doesn't exist yet

      // Update last service date and calculate next
      const cat = MAINTENANCE_CATEGORIES.find(c => c.name === loggingTask.category);
      const map = {
        'Weekly': 7, 'Bi-Weekly': 14, 'Monthly': 30,
        'Quarterly': 90, 'Semi-Annual': 180, 'Annual': 365,
        'Every 3 Years': 365 * 3, 'Every 5 Years': 365 * 5,
        'Every 10 Years': 365 * 10, 'Seasonal': 90
      };
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (map[loggingTask.cadence] || 365));

      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendorName: form.vendorName || loggingTask.vendorName,
      }, { $autoCancel: false });

      toast({ title: '✅ Service logged successfully!' });
      setLoggingTask(null);
      loadTasks();
    } catch (error) {
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
  };

  const handleOpenLog = async (task) => {
    const taskLogs = await loadLogsForTask(task.id);
    setLoggingTask({ ...task, logs: taskLogs });
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const today = new Date();
    const nextDate = t.nextServiceDate ? new Date(t.nextServiceDate) : null;
    const daysUntil = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Overdue' && daysUntil !== null && daysUntil < 0) ||
      (filterStatus === 'Upcoming' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30) ||
      (filterStatus === 'Up To Date' && daysUntil !== null && daysUntil > 30);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!home) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm mb-4">Select a property from the top menu to get started.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5"><span className="text-amber-600 text-xs font-medium">👆 Use the property selector in the top right</span></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Maintenance — CasaCEO</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Maintenance</h1>
                <p className="text-slate-400 text-sm">{home.name} · {tasks.length} tasks tracked{tasks.length > 0 ? ` · Click a status card to filter` : ''}</p>
              </div>
            </div>
            <Button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Task
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm">
          {[
            { key: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
            { key: 'log', label: 'Service Log', icon: <ClipboardList className="w-4 h-4" /> },
            { key: 'vendors', label: 'Vendors', icon: <User className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <QuickStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tasks or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl border-slate-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Categories</option>
                {MAINTENANCE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due Soon</option>
                <option value="Up To Date">Up To Date</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No maintenance tasks yet 🔧</h3>
                <p className="text-slate-500 mb-2">Stay ahead of costly repairs — start building your home's maintenance memory today.</p><p className="text-slate-400 text-xs mb-6">Track HVAC filters, pest control, roof inspections, and more across all your properties.</p>
                <Button
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="rounded-xl bg-slate-900 text-white px-8"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Task
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDelete}
                    onLogService={handleOpenLog}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Service History</h2>
              <p className="text-slate-400 text-sm">Complete log of all maintenance performed</p>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No service history yet. Log your first service from the Schedule tab.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(t => t.lastServiceDate).sort((a, b) =>
                    new Date(b.lastServiceDate) - new Date(a.lastServiceDate)
                  ).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{task.taskName}</p>
                          <p className="text-xs text-slate-400">{task.vendorName && `${task.vendorName} · `}{task.cadence}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(task.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {task.estimatedCost && <p className="text-xs text-slate-400">${parseFloat(task.estimatedCost).toFixed(0)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Saved Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Your Vendors</h2>
                <p className="text-slate-400 text-sm">Vendors saved from your maintenance tasks</p>
              </div>
              <div className="p-6">
                {tasks.filter(t => t.vendorName).length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No vendors saved yet. Add vendor info when creating tasks.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.filter(t => t.vendorName).map(task => (
                      <div key={task.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{MAINTENANCE_CATEGORIES.find(c => c.name === task.category)?.icon || '🔨'}</span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{task.vendorName}</p>
                            <p className="text-xs text-slate-400">{task.category}</p>
                          </div>
                        </div>
                        {task.vendorPhone && (
                          <a href={`tel:${task.vendorPhone}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 mb-1">
                            <Phone className="w-3 h-3" /> {task.vendorPhone}
                          </a>
                        )}
                        {task.vendorEmail && (
                          <a href={`mailto:${task.vendorEmail}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                            <Mail className="w-3 h-3" /> {task.vendorEmail}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Vendors */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Recommended Vendors</h2>
                <p className="text-slate-400 text-sm">Trusted vendors by category — coming soon with CasaCEO verified contractors</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const cat = MAINTENANCE_CATEGORIES.find(c => c.name === category);
                    return (
                      <div key={category} className={`rounded-xl border p-4 ${cat?.color || 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                          <span>{cat?.icon}</span> {category}
                        </p>
                        <div className="space-y-1">
                          {vendors.map(v => (
                            <p key={v} className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-400" /> {v}
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

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}

      {loggingTask && (
        <ServiceLogModal
          task={loggingTask}
          logs={logs[loggingTask.id] || []}
          onAddLog={handleLogService}
          onClose={() => setLoggingTask(null)}
        />
      )}
    </>
  );
};

export default MaintenanceManagementPage;
