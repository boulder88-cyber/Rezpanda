import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  Wrench, Plus, X, Check, Pencil, Trash2, Calendar, Clock,
  AlertTriangle, CheckCircle2, User, Search, ClipboardList,
  Leaf, Sun, Wind, Snowflake, ChevronRight, CloudRain,
  Thermometer, Droplets, Star, ArrowRight, Home as HomeIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// DESIGN TOKENS (locked design system — inline, no Tailwind palette)
// ═══════════════════════════════════════════════════════════════════════
const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_SOFT = '#5b6472';
const INK_MUTE = '#95a0ae';
const PAGE = '#faf8f4';
const SURFACE = '#ffffff';
const BORDER = '#e9e4db';
// Status family (4px left accent bar)
const RED = '#dc2626';      // overdue
const AMBER = '#f59e0b';    // due soon
const GREEN = '#059669';    // up to date / handled
const GREY = '#cbd5e1';     // neutral

// Soft tints for status fills (quiet signal, not a block of paint)
const RED_TINT = '#fdf2f2';
const AMBER_TINT = '#fef9ef';
const GREEN_TINT = '#f0faf6';
const NAVY_TINT = '#eef2f7';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════
// NOTE: category names below MUST exactly match the systemType select
// values in the maintenance_systems collection (case-sensitive).

const MAINTENANCE_CATEGORIES = [
  { name: 'HVAC', icon: Wind },
  { name: 'Plumbing', icon: Droplets },
  { name: 'Electrical', icon: Wrench },
  { name: 'Roofing', icon: HomeIcon },
  { name: 'Landscaping', icon: Leaf },
  { name: 'Pest Control', icon: Wrench },
  { name: 'Gutters', icon: CloudRain },
  { name: 'Insulation', icon: Thermometer },
  { name: 'Windows', icon: HomeIcon },
  { name: 'Doors', icon: HomeIcon },
  { name: 'Pool/Spa', icon: Droplets },
  { name: 'Security', icon: CheckCircle2 },
  { name: 'General', icon: Wrench },
];

const catIcon = (name) => {
  const c = MAINTENANCE_CATEGORIES.find((x) => x.name === name);
  return c ? c.icon : Wrench;
};

const RECOMMENDED_VENDORS = {
  'HVAC': ['Johnson & Miller HVAC', 'Comfort Pros', 'Climate Care'],
  'Plumbing': ['Roto-Rooter', 'Benjamin Franklin Plumbing', 'Mr. Rooter'],
  'Electrical': ['Mister Sparky', 'Local Electric Co.'],
  'Roofing': ['AtlantaRoof Pro', 'Peak Roofing'],
  'Landscaping': ['Green Thumb', 'TruGreen', 'Lawn Doctor'],
  'Pest Control': ['Terminix', 'Orkin', 'Aptive'],
  'General': ['Handyman Connection', 'Ace Handyman'],
};

const COMMON_ITEMS = {
  'HVAC': ['Filter Replacement', 'Annual Tune-Up', 'Coil Cleaning', 'Refrigerant Check'],
  'Plumbing': ['Water Heater Flush', 'Drain Cleaning', 'Leak Inspection', 'Sump Pump Test'],
  'Electrical': ['Panel Inspection', 'Outlet / GFCI Test', 'Surge Protection Check'],
  'Roofing': ['Roof Inspection', 'Shingle Check', 'Flashing Inspection'],
  'Landscaping': ['Lawn Fertilization', 'Tree Trimming', 'Irrigation Check', 'Mulching'],
  'Pest Control': ['Perimeter Treatment', 'Termite Inspection', 'Mosquito Treatment'],
  'Gutters': ['Gutter Cleaning', 'Downspout Check'],
  'Insulation': ['Attic Insulation Check', 'Weatherstripping', 'Air Leak Sealing', 'Pipe Insulation'],
  'Windows': ['Seal / Caulk Check', 'Glass / Screen Cleaning', 'Weatherstrip Replacement', 'Track Lubrication'],
  'Doors': ['Weatherstrip Check', 'Hinge / Lock Lubrication', 'Threshold Inspection', 'Garage Door Service'],
};

const SEASONAL_TASKS = {
  Spring: { icon: Leaf, tasks: [
    { name: 'Gutter Cleaning', category: 'Gutters', cadence: 'Semi-Annual' },
    { name: 'HVAC Tune-Up', category: 'HVAC', cadence: 'Semi-Annual' },
    { name: 'Exterior Inspection', category: 'General', cadence: 'Annually' },
    { name: 'Lawn Fertilization', category: 'Landscaping', cadence: 'Quarterly' },
    { name: 'Pest Control Check', category: 'Pest Control', cadence: 'Quarterly' },
  ] },
  Summer: { icon: Sun, tasks: [
    { name: 'AC Service', category: 'HVAC', cadence: 'Annually' },
    { name: 'Pool Maintenance', category: 'Pool/Spa', cadence: 'Monthly' },
    { name: 'Mosquito Treatment', category: 'Pest Control', cadence: 'Quarterly' },
    { name: 'Irrigation Check', category: 'Landscaping', cadence: 'Quarterly' },
    { name: 'Deck Inspection', category: 'General', cadence: 'Annually' },
  ] },
  Fall: { icon: Wind, tasks: [
    { name: 'Roof Inspection', category: 'Roofing', cadence: 'Annually' },
    { name: 'Heating Prep', category: 'HVAC', cadence: 'Annually' },
    { name: 'Gutter Cleaning', category: 'Gutters', cadence: 'Semi-Annual' },
    { name: 'Weatherization', category: 'Insulation', cadence: 'Annually' },
    { name: 'Chimney Sweep', category: 'General', cadence: 'Annually' },
  ] },
  Winter: { icon: Snowflake, tasks: [
    { name: 'Pipe Insulation', category: 'Insulation', cadence: 'Annually' },
    { name: 'Heating Check', category: 'HVAC', cadence: 'Annually' },
    { name: 'Storm Prep', category: 'General', cadence: 'Annually' },
    { name: 'Generator Test', category: 'Electrical', cadence: 'Quarterly' },
    { name: 'Smoke Detector Check', category: 'Security', cadence: 'Semi-Annual' },
  ] },
};

// Current season for the hemisphere (northern) — drives the coverage flag.
const currentSeason = () => {
  const m = new Date().getMonth(); // 0-11
  if (m >= 2 && m <= 4) return 'Spring';
  if (m >= 5 && m <= 7) return 'Summer';
  if (m >= 8 && m <= 10) return 'Fall';
  return 'Winter';
};

const CADENCE_LIST = ['Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annually', 'Custom'];
const CADENCE_DAYS = {
  'Weekly': 7, 'Monthly': 30, 'Quarterly': 90, 'Semi-Annual': 180, 'Annually': 365,
};

const daysToCadence = (days) => {
  if (!days) return 'Annually';
  for (const [label, d] of Object.entries(CADENCE_DAYS)) {
    if (d === days) return label;
  }
  return 'Custom';
};

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

// Status as design-system tokens (not Tailwind classes).
const getTaskStatus = (task) => {
  const today = new Date();
  const nextDate = task.nextServiceDate ? new Date(task.nextServiceDate) : null;
  const daysUntil = nextDate ? Math.ceil((nextDate - today) / 86400000) : null;
  if (daysUntil === null)
    return { label: 'No date set', accent: GREY, tint: '#f4f6f8', text: INK_MUTE, urgent: false, days: null };
  if (daysUntil < 0)
    return { label: `${Math.abs(daysUntil)}d overdue`, accent: RED, tint: RED_TINT, text: RED, urgent: true, days: daysUntil };
  if (daysUntil <= 30)
    return { label: `Due in ${daysUntil}d`, accent: AMBER, tint: AMBER_TINT, text: '#b45309', urgent: false, days: daysUntil };
  return { label: `Due in ${daysUntil}d`, accent: GREEN, tint: GREEN_TINT, text: GREEN, urgent: false, days: daysUntil };
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ═══════════════════════════════════════════════════════════════════════
// SHARED FIELD PRIMITIVES (design-system inputs — replace shadcn)
// ═══════════════════════════════════════════════════════════════════════

const fieldLabel = {
  fontSize: '13px', fontWeight: 600, color: INK_SOFT, marginBottom: '6px', display: 'block',
};
const inputBase = {
  width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px',
  border: `1px solid ${BORDER}`, background: SURFACE, fontSize: '14px', color: INK,
  outline: 'none', boxSizing: 'border-box',
};

const Chip = ({ active, onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
      whiteSpace: 'nowrap', cursor: disabled ? 'default' : 'pointer', transition: 'all .15s',
      border: `1px solid ${active ? NAVY : BORDER}`,
      background: active ? NAVY : SURFACE,
      color: active ? '#fff' : INK_SOFT,
    }}
  >
    {children}
  </button>
);

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
  const suggestedItems = COMMON_ITEMS[form.systemType] || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(31,39,51,0.45)', backdropFilter: 'blur(2px)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      overflowY: 'auto',
    }}>
      <div style={{
        background: SURFACE, width: '100%', maxWidth: '520px', margin: '16px 0',
        borderRadius: '16px', boxShadow: '0 25px 50px rgba(31,39,51,0.22)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: NAVY, borderRadius: '16px 16px 0 0', padding: '18px 22px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>
            {task?.id ? 'Edit maintenance' : 'Add maintenance'}
          </h2>
          <button onClick={onClose} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer',
          }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.75)' }} />
          </button>
        </div>

        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={fieldLabel}>Maintenance type</label>
            <input
              placeholder="e.g. Termite inspection, filter replacement"
              value={form.systemName}
              onChange={(e) => setForm((p) => ({ ...p, systemName: e.target.value }))}
              style={inputBase}
            />
          </div>

          <div>
            <label style={fieldLabel}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {MAINTENANCE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = form.systemType === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, systemType: cat.name }))}
                    style={{
                      padding: '8px 4px', borderRadius: '8px', textAlign: 'center', fontSize: '11px',
                      fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
                      border: `1px solid ${active ? NAVY : BORDER}`,
                      background: active ? NAVY : SURFACE,
                      color: active ? '#fff' : INK_SOFT,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <Icon style={{ width: '15px', height: '15px' }} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
            {suggestedItems.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '12px', color: INK_MUTE, marginBottom: '8px' }}>Common for {form.systemType}:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {suggestedItems.map((item) => (
                    <Chip key={item} active={form.systemName === item} onClick={() => setForm((p) => ({ ...p, systemName: item }))}>
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={fieldLabel}>Service cadence</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CADENCE_LIST.map((c) => (
                <Chip
                  key={c}
                  active={form.cadence === c}
                  onClick={() => setForm((p) => ({ ...p, cadence: c, nextServiceDate: calcNextDate(p.lastServiceDate, c, p.customDays) }))}
                >
                  {c}
                </Chip>
              ))}
            </div>
            {form.cadence === 'Custom' && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ ...fieldLabel, fontSize: '12px' }}>Every how many days?</label>
                <input
                  type="number" min="1" placeholder="e.g. 45"
                  value={form.customDays}
                  onChange={(e) => setForm((p) => ({ ...p, customDays: e.target.value, nextServiceDate: calcNextDate(p.lastServiceDate, 'Custom', e.target.value) }))}
                  style={{ ...inputBase, maxWidth: '160px' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={fieldLabel}>Last service date</label>
              <input
                type="date" value={form.lastServiceDate}
                onChange={(e) => setForm((p) => ({ ...p, lastServiceDate: e.target.value, nextServiceDate: calcNextDate(e.target.value, p.cadence, p.customDays) }))}
                style={inputBase}
              />
            </div>
            <div>
              <label style={fieldLabel}>Next due date</label>
              <input
                type="date" value={form.nextServiceDate}
                onChange={(e) => setForm((p) => ({ ...p, nextServiceDate: e.target.value }))}
                style={inputBase}
              />
              {form.lastServiceDate && (
                <p style={{ fontSize: '11px', color: GOLD, marginTop: '5px', fontWeight: 500 }}>Auto-calculated from cadence</p>
              )}
            </div>
          </div>

          <div style={{ background: PAGE, borderRadius: '10px', padding: '14px', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: INK_SOFT, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User style={{ width: '14px', height: '14px' }} /> Vendor
            </p>
            {suggestedVendors.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '12px', color: INK_MUTE, marginBottom: '8px' }}>Suggested for {form.systemType}:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {suggestedVendors.map((v) => (
                    <Chip key={v} active={form.vendor === v} onClick={() => setForm((p) => ({ ...p, vendor: v }))}>
                      {v}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <input
              placeholder="Vendor name" value={form.vendor}
              onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
              style={{ ...inputBase, height: '40px' }}
            />
          </div>

          <div>
            <label style={fieldLabel}>Notes</label>
            <textarea
              placeholder="Filter size, model #, any notes…"
              value={form.serviceHistory}
              onChange={(e) => setForm((p) => ({ ...p, serviceHistory: e.target.value }))}
              style={{ ...inputBase, height: '76px', padding: '10px 12px', resize: 'none', lineHeight: 1.4 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: '46px', borderRadius: '12px', border: `1px solid ${BORDER}`,
                background: SURFACE, color: INK_SOFT, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={!form.systemName}
              style={{
                flex: 1, height: '46px', borderRadius: '12px', border: 'none',
                background: form.systemName ? NAVY : '#aebccd', color: '#fff', fontWeight: 600, fontSize: '14px',
                cursor: form.systemName ? 'pointer' : 'default',
              }}
            >
              {task?.id ? 'Save changes' : 'Add maintenance'}
            </button>
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
    vendor: task?.vendor || '',
    notes: '',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(31,39,51,0.45)', backdropFilter: 'blur(2px)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{ background: SURFACE, width: '100%', maxWidth: '420px', borderRadius: '16px', boxShadow: '0 25px 50px rgba(31,39,51,0.22)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: NAVY, borderRadius: '16px 16px 0 0', padding: '18px 22px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>Log service</h2>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.75)' }} />
          </button>
        </div>
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: PAGE, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: INK }}>{task.systemName}</p>
            <p style={{ fontSize: '12px', color: INK_MUTE, marginTop: '2px' }}>{task.systemType} · {cadenceDisplay(task.reminderFrequencyDays)}</p>
          </div>
          <div>
            <label style={fieldLabel}>Service date</label>
            <input type="date" value={form.serviceDate} onChange={(e) => setForm((p) => ({ ...p, serviceDate: e.target.value }))} style={inputBase} />
          </div>
          <div>
            <label style={fieldLabel}>Vendor (optional)</label>
            <input placeholder="Who did the work?" value={form.vendor} onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))} style={inputBase} />
          </div>
          <div>
            <label style={fieldLabel}>Notes (optional)</label>
            <textarea placeholder="What was done, parts, cost…" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} style={{ ...inputBase, height: '70px', padding: '10px 12px', resize: 'none', lineHeight: 1.4 }} />
          </div>
          <p style={{ fontSize: '12px', color: INK_MUTE, lineHeight: 1.5 }}>
            Logging marks this serviced today and schedules the next due date from its cadence.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ flex: 1, height: '46px', borderRadius: '12px', border: `1px solid ${BORDER}`, background: SURFACE, color: INK_SOFT, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => onAddLog(form)} style={{ flex: 1, height: '46px', borderRadius: '12px', border: 'none', background: GREEN, color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Log service</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TASK CARD (4px left accent bar = status)
// ═══════════════════════════════════════════════════════════════════════

const TaskCard = ({ task, onEdit, onDelete, onLogService }) => {
  const status = getTaskStatus(task);
  const Icon = catIcon(task.systemType);
  const cadenceLabel = cadenceDisplay(task.reminderFrequencyDays);

  return (
    <div style={{
      background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`,
      borderLeft: `4px solid ${status.accent}`, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(31,39,51,0.05)',
    }}>
      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '18px', height: '18px', color: NAVY }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.systemName}</p>
              <p style={{ fontSize: '12px', color: INK_MUTE, marginTop: '2px' }}>{task.systemType} · {cadenceLabel}</p>
            </div>
          </div>
          <span style={{
            fontSize: '12px', fontWeight: 500, borderRadius: '999px', padding: '3px 9px',
            background: status.tint, color: status.text, flexShrink: 0,
          }}>
            {status.label}
          </span>
        </div>

        {task.vendor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: PAGE, borderRadius: '8px', padding: '9px 11px', marginBottom: '12px' }}>
            <User style={{ width: '13px', height: '13px', color: INK_MUTE, flexShrink: 0 }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: INK_SOFT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.vendor}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: PAGE, borderRadius: '8px', textAlign: 'center', padding: '8px' }}>
            <p style={{ fontSize: '11px', color: INK_MUTE }}>Last service</p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: INK_SOFT, marginTop: '2px' }}>
              {task.lastServiceDate ? fmtDate(task.lastServiceDate) : '—'}
            </p>
          </div>
          <div style={{ background: status.urgent ? status.tint : PAGE, borderRadius: '8px', textAlign: 'center', padding: '8px' }}>
            <p style={{ fontSize: '11px', color: INK_MUTE }}>Next due</p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: status.urgent ? status.text : INK_SOFT, marginTop: '2px' }}>
              {task.nextServiceDate ? fmtDate(task.nextServiceDate) : '—'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onLogService(task)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, color: '#fff', borderRadius: '10px', border: 'none', background: GREEN, padding: '9px', fontSize: '13px', cursor: 'pointer' }}
          >
            <Check style={{ width: '14px', height: '14px' }} /> Log service
          </button>
          <button
            onClick={() => onEdit(task)}
            style={{ width: '38px', height: '38px', borderRadius: '10px', background: NAVY_TINT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Pencil style={{ width: '14px', height: '14px', color: NAVY }} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ width: '38px', height: '38px', borderRadius: '10px', background: RED_TINT, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Trash2 style={{ width: '14px', height: '14px', color: RED }} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// WEATHER TRIGGER STRIP  (the on-thesis "alive" feature)
// ═══════════════════════════════════════════════════════════════════════
// Weather TRIGGERS maintenance: a freeze says "check pipes," a heat wave says
// "service the AC." Pure SEE — surfaces what the week implies, books nothing.
// Fails soft: no location or no triggers → renders nothing at all.

const sevStyle = (sev) =>
  sev === 'high'
    ? { accent: RED, tint: RED_TINT, text: RED }
    : { accent: AMBER, tint: AMBER_TINT, text: '#b45309' };

const triggerIcon = (key) => {
  if (key === 'freeze') return Snowflake;
  if (key === 'heat') return Thermometer;
  if (key === 'wind') return Wind;
  if (key === 'rain') return CloudRain;
  return AlertTriangle;
};

const WeatherTriggers = ({ triggers, place, onAddFromTrigger }) => {
  if (!triggers || triggers.length === 0) return null;
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <CloudRain style={{ width: '16px', height: '16px', color: NAVY }} />
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>
          Weather watch
          {place && <span style={{ fontWeight: 400, color: INK_MUTE }}> · {place}</span>}
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {triggers.map((t) => {
          const s = sevStyle(t.severity);
          const Icon = triggerIcon(t.key);
          return (
            <div key={t.key} style={{
              background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`,
              borderLeft: `4px solid ${s.accent}`, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: s.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '15px', height: '15px', color: s.accent }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: INK }}>{t.title}</p>
              </div>
              <p style={{ fontSize: '13px', color: INK_SOFT, lineHeight: 1.5, marginBottom: '10px' }}>{t.detail}</p>
              <button
                onClick={() => onAddFromTrigger(t)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent',
                  border: 'none', cursor: 'pointer', padding: 0, color: NAVY, fontSize: '13px', fontWeight: 600,
                }}
              >
                <Plus style={{ width: '13px', height: '13px' }} /> Add a {t.category} task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY STATS  (clickable filters + maintenance health bar)
// ═══════════════════════════════════════════════════════════════════════

const SummaryStats = ({ tasks, onFilter }) => {
  const today = new Date();
  const overdue = tasks.filter((t) => t.nextServiceDate && new Date(t.nextServiceDate) < today).length;
  const dueSoon = tasks.filter((t) => {
    if (!t.nextServiceDate) return false;
    const d = Math.ceil((new Date(t.nextServiceDate) - today) / 86400000);
    return d >= 0 && d <= 30;
  }).length;
  const upToDate = tasks.filter((t) => t.nextServiceDate && new Date(t.nextServiceDate) > today).length;
  const total = tasks.length;
  const health = total > 0 ? Math.round((upToDate / total) * 100) : 0;

  const cards = [
    { label: 'Overdue', value: overdue, icon: AlertTriangle, accent: RED, tint: RED_TINT, filter: 'Overdue' },
    { label: 'Due this month', value: dueSoon, icon: Clock, accent: AMBER, tint: AMBER_TINT, filter: 'Upcoming' },
    { label: 'Up to date', value: upToDate, icon: CheckCircle2, accent: GREEN, tint: GREEN_TINT, filter: 'Up To Date' },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        {cards.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => onFilter(s.filter)}
              style={{
                textAlign: 'left', cursor: 'pointer', background: SURFACE, borderRadius: '12px',
                padding: '16px', border: `1px solid ${BORDER}`, borderLeft: `4px solid ${s.accent}`,
                boxShadow: '0 1px 3px rgba(31,39,51,0.05)',
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Icon style={{ width: '16px', height: '16px', color: s.accent }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 800, color: INK, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: INK_MUTE, marginTop: '4px' }}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {total > 0 && (
        <div style={{ background: SURFACE, borderRadius: '12px', padding: '16px', border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(31,39,51,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: INK_SOFT }}>Maintenance health</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: INK }}>{health}% up to date</p>
          </div>
          <div style={{ background: '#eef0f2', borderRadius: '999px', overflow: 'hidden', height: '8px' }}>
            <div style={{ height: '100%', borderRadius: '999px', width: `${health}%`, transition: 'width .7s', background: health >= 80 ? GREEN : health >= 50 ? AMBER : RED }} />
          </div>
          <p style={{ fontSize: '12px', color: INK_MUTE, marginTop: '6px' }}>{upToDate} of {total} up to date · {overdue} overdue</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// HOME CARE SCHEDULE  (seasonal guide + coverage flag)
// ═══════════════════════════════════════════════════════════════════════
// Tapping an item pre-fills the Add modal. NEW: a coverage banner flags
// established seasonal tasks for the CURRENT season that aren't tracked —
// the bill-type-checklist pattern applied to maintenance ("you usually do
// gutter cleaning in fall — not tracked, add it?"). Set-once, no payee/
// vendor normalization. Pure SEE.

const HomeCareSchedule = ({ onPick, existingNames }) => {
  const season = currentSeason();
  const seasonTasks = SEASONAL_TASKS[season]?.tasks || [];
  const missing = seasonTasks.filter((t) => !existingNames.includes(t.name.toLowerCase()));

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: INK }}>Home care schedule</h2>
        <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '4px' }}>
          Your home's seasonal service guide — tap any item to add it to your tracked maintenance.
        </p>
      </div>

      {missing.length > 0 && (
        <div style={{
          background: AMBER_TINT, border: `1px solid #f3dca5`, borderLeft: `4px solid ${AMBER}`,
          borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle style={{ width: '15px', height: '15px', color: '#b45309' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>
              {missing.length} {season.toLowerCase()} task{missing.length > 1 ? 's' : ''} not tracked yet
            </p>
          </div>
          <p style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5, marginBottom: '10px' }}>
            These are typical for this time of year. Add the ones that apply to your home.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {missing.map((t) => (
              <button
                key={t.name}
                onClick={() => onPick(t)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px', background: SURFACE,
                  border: `1px solid #f3dca5`, borderRadius: '8px', padding: '6px 10px',
                  fontSize: '12px', fontWeight: 500, color: '#92400e', cursor: 'pointer',
                }}
              >
                <Plus style={{ width: '12px', height: '12px' }} /> {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {Object.entries(SEASONAL_TASKS).map(([seasonName, data]) => {
          const Icon = data.icon;
          const isCurrent = seasonName === season;
          return (
            <div
              key={seasonName}
              style={{
                background: SURFACE, borderRadius: '12px', padding: '16px',
                border: `1px solid ${isCurrent ? GOLD : BORDER}`,
                boxShadow: isCurrent ? `0 0 0 1px ${GOLD}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '15px', height: '15px', color: NAVY }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: INK }}>{seasonName}</p>
                {isCurrent && (
                  <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#8a6d2f', background: '#f6edda', borderRadius: '999px', padding: '2px 8px' }}>Now</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.tasks.map((task, i) => {
                  const added = existingNames.includes(task.name.toLowerCase());
                  return (
                    <button
                      key={i}
                      onClick={() => !added && onPick(task)}
                      disabled={added}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                        borderRadius: '8px', padding: '6px 8px', margin: '0 -8px', border: 'none',
                        background: 'transparent', cursor: added ? 'default' : 'pointer',
                      }}
                    >
                      {added
                        ? <CheckCircle2 style={{ width: '14px', height: '14px', color: GREEN, flexShrink: 0 }} />
                        : <Plus style={{ width: '14px', height: '14px', color: INK_MUTE, flexShrink: 0 }} />}
                      <span style={{ fontSize: '12px', color: added ? INK_MUTE : INK_SOFT, textDecoration: added ? 'line-through' : 'none' }}>
                        {task.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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

  // Weather triggers (fail-soft: empty by default, never blocks the page).
  const [weather, setWeather] = useState({ triggers: [], place: null });

  useEffect(() => {
    if (home && currentUser) loadTasks();
  }, [home, currentUser]);

  // Load weather triggers for the property's location. Fails soft — any error
  // leaves triggers empty and the strip renders nothing.
  useEffect(() => {
    let cancelled = false;
    const loadWeather = async () => {
      if (!home) return;
      const zip = (home.zip || '').toString().trim();
      const lat = home.lat, lng = home.lng;
      if (!zip && (lat == null || lng == null)) {
        setWeather({ triggers: [], place: null });
        return;
      }
      try {
        const params = new URLSearchParams();
        if (lat != null && lng != null) { params.set('lat', lat); params.set('lng', lng); }
        if (zip) params.set('zip', zip);
        if (home.city || home.state) params.set('place', [home.city, home.state].filter(Boolean).join(', '));
        const r = await fetch('/api/weather-maintenance?' + params.toString());
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled) setWeather({ triggers: data.triggers || [], place: data.location?.place || null });
      } catch {
        if (!cancelled) setWeather({ triggers: [], place: null });
      }
    };
    loadWeather();
    return () => { cancelled = true; };
  }, [home]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${home.id}"`, sort: 'nextServiceDate', $autoCancel: false,
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

  // Seed the Add modal from a Home Care Schedule item.
  const handlePickSeasonal = (item) => {
    setEditingTask({
      systemName: item.name,
      systemType: item.category,
      reminderFrequencyDays: CADENCE_DAYS[item.cadence] || 365,
    });
    setShowTaskModal(true);
  };

  // Seed the Add modal from a weather trigger (category only — user names it).
  const handleAddFromTrigger = (trigger) => {
    setEditingTask({
      systemName: '',
      systemType: trigger.category,
      reminderFrequencyDays: CADENCE_DAYS['Annually'],
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (form) => {
    try {
      if (editingTask && editingTask.id) {
        await pb.collection('maintenance_systems').update(editingTask.id, buildPayload(form), { $autoCancel: false });
        toast({ title: 'Maintenance updated' });
      } else {
        await pb.collection('maintenance_systems').create(
          { ...buildPayload(form), homeId: home.id, ownerId: currentUser.id },
          { $autoCancel: false }
        );
        toast({ title: 'Maintenance added' });
      }
      setShowTaskModal(false); setEditingTask(null); loadTasks();
    } catch (e) {
      console.error('Save failed:', e);
      toast({ title: 'Error saving maintenance', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance item?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: 'Maintenance deleted' }); loadTasks();
    } catch {
      toast({ title: 'Error deleting maintenance', variant: 'destructive' });
    }
  };

  // Logging a service updates the system's dates + prepends to its history.
  const handleLogService = async (form) => {
    try {
      const d = new Date(form.serviceDate);
      d.setDate(d.getDate() + (loggingTask.reminderFrequencyDays || 365));
      const stamp = `${form.serviceDate}${form.vendor ? ` · ${form.vendor}` : ''}${form.notes ? ` — ${form.notes}` : ''}`;
      const newHistory = loggingTask.serviceHistory ? `${stamp}\n${loggingTask.serviceHistory}` : stamp;
      await pb.collection('maintenance_systems').update(loggingTask.id, {
        lastServiceDate: form.serviceDate,
        nextServiceDate: d.toISOString().split('T')[0],
        vendor: form.vendor || loggingTask.vendor || '',
        serviceHistory: newHistory,
      }, { $autoCancel: false });
      toast({ title: 'Service logged' }); setLoggingTask(null); loadTasks();
    } catch (e) {
      console.error('Log failed:', e);
      toast({ title: 'Error logging service', variant: 'destructive' });
    }
  };

  const today = new Date();
  const overdueTasks = tasks.filter((t) => t.nextServiceDate && new Date(t.nextServiceDate) < today);
  const upcomingTasks = tasks.filter((t) => {
    if (!t.nextServiceDate) return false;
    const d = Math.ceil((new Date(t.nextServiceDate) - today) / 86400000);
    return d >= 0 && d <= 60;
  });
  const scheduledTasks = tasks.filter((t) => {
    if (!t.nextServiceDate) return true;
    return Math.ceil((new Date(t.nextServiceDate) - today) / 86400000) > 60;
  });

  const filteredTasks = tasks.filter((t) => {
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
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Wrench style={{ width: '28px', height: '28px', color: NAVY }} />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 600, color: INK, marginBottom: '8px' }}>No property selected.</p>
        <p style={{ fontSize: '14px', color: INK_MUTE }}>Select a property from the top menu to view maintenance.</p>
      </div>
    );
  }

  const TABS = [
    { key: 'schedule', label: 'Maintenance', icon: Wrench },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'log', label: 'Service log', icon: ClipboardList },
    { key: 'seasonal', label: 'Home care', icon: Leaf },
    { key: 'vendors', label: 'Vendors', icon: User },
  ];

  return (
    <>
      <Helmet><title>Maintenance — CasaCEO</title></Helmet>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, margin: '0 -16px 28px', padding: '24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: INK_MUTE, marginBottom: '12px' }}>
            <Link to="/dashboard" style={{ color: INK_MUTE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span style={{ color: INK_SOFT, fontWeight: 500 }}>Maintenance</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench style={{ width: '24px', height: '24px', color: NAVY }} />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 600, color: INK, lineHeight: 1.2 }}>Maintenance</h1>
                <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '2px' }}>{home.name} · {tasks.length} tracked</p>
              </div>
            </div>
            <button
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#fff', borderRadius: '12px', border: 'none', background: NAVY, padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} /> Add maintenance
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', width: 'fit-content', padding: '6px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(31,39,51,0.05)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px', borderRadius: '10px',
                  padding: '8px 15px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: active ? NAVY : 'transparent', color: active ? '#fff' : INK_SOFT,
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Maintenance tab ── */}
        {activeTab === 'schedule' && (
          <>
            <WeatherTriggers triggers={weather.triggers} place={weather.place} onAddFromTrigger={handleAddFromTrigger} />
            <SummaryStats tasks={tasks} onFilter={setFilterStatus} />

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search style={{ width: '16px', height: '16px', color: INK_MUTE, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder="Search maintenance or vendors…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputBase, paddingLeft: '36px' }}
                />
              </div>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ ...inputBase, width: 'auto', fontWeight: 500, color: INK_SOFT, cursor: 'pointer' }}>
                <option value="All">All categories</option>
                {MAINTENANCE_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputBase, width: 'auto', fontWeight: 500, color: INK_SOFT, cursor: 'pointer' }}>
                <option value="All">All statuses</option>
                <option value="Overdue">Overdue</option>
                <option value="Upcoming">Due soon</option>
                <option value="Up To Date">Up to date</option>
              </select>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ height: '210px', borderRadius: '12px', background: '#eef0f2' }} />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div style={{ background: SURFACE, textAlign: 'center', borderRadius: '12px', padding: '48px 20px', border: `1px dashed ${BORDER}` }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Wrench style={{ width: '28px', height: '28px', color: NAVY }} />
                </div>
                <p style={{ fontSize: '18px', fontWeight: 600, color: INK, marginBottom: '8px' }}>No maintenance yet.</p>
                <p style={{ fontSize: '14px', color: INK_MUTE, marginBottom: '24px' }}>Stay ahead of costly repairs — start building your home's maintenance history today.</p>
                <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} style={{ fontWeight: 600, color: '#fff', borderRadius: '12px', border: 'none', background: NAVY, padding: '12px 24px', fontSize: '14px', cursor: 'pointer' }}>
                  <Plus style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: '-2px', marginRight: '8px' }} /> Add first maintenance
                </button>
              </div>
            ) : (
              <>
                {overdueTasks.length > 0 && filterStatus === 'All' && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <AlertTriangle style={{ width: '16px', height: '16px', color: RED }} />
                      <h2 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>Overdue <span style={{ color: RED }}>({overdueTasks.length})</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {overdueTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={setLoggingTask} />)}
                    </div>
                  </div>
                )}

                {upcomingTasks.length > 0 && filterStatus === 'All' && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Clock style={{ width: '16px', height: '16px', color: AMBER }} />
                      <h2 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>Due in the next 60 days <span style={{ color: AMBER }}>({upcomingTasks.length})</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {upcomingTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={setLoggingTask} />)}
                    </div>
                  </div>
                )}

                {(filterStatus !== 'All' || scheduledTasks.length > 0) && (
                  <div>
                    {filterStatus === 'All' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <CheckCircle2 style={{ width: '16px', height: '16px', color: GREEN }} />
                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>Scheduled <span style={{ color: GREEN }}>({scheduledTasks.length})</span></h2>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {(filterStatus === 'All' ? scheduledTasks : filteredTasks).map((task) => (
                        <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }} onDelete={handleDelete} onLogService={setLoggingTask} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Calendar tab (agenda grouped by month) ── */}
        {activeTab === 'calendar' && (
          (() => {
            const dated = tasks
              .filter((t) => t.nextServiceDate)
              .sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));

            if (dated.length === 0) {
              return (
                <div style={{ background: SURFACE, textAlign: 'center', borderRadius: '12px', padding: '48px 20px', border: `1px dashed ${BORDER}` }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Calendar style={{ width: '28px', height: '28px', color: NAVY }} />
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: INK, marginBottom: '8px' }}>Nothing scheduled yet.</p>
                  <p style={{ fontSize: '14px', color: INK_MUTE }}>Add maintenance with a next due date to see it here.</p>
                </div>
              );
            }

            const groups = {};
            dated.forEach((t) => {
              const d = new Date(t.nextServiceDate);
              const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              if (!groups[key]) groups[key] = [];
              groups[key].push(t);
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(groups).map(([month, items]) => (
                  <div key={month}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Calendar style={{ width: '16px', height: '16px', color: NAVY }} />
                      <h2 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>{month} <span style={{ color: INK_MUTE, fontWeight: 400 }}>({items.length})</span></h2>
                    </div>
                    <div style={{ background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                      {items.map((t, i) => {
                        const status = getTaskStatus(t);
                        const Icon = catIcon(t.systemType);
                        const d = new Date(t.nextServiceDate);
                        return (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderTop: i === 0 ? 'none' : `1px solid ${PAGE}`, borderLeft: `4px solid ${status.accent}` }}>
                            <div style={{ textAlign: 'center', flexShrink: 0, width: '40px' }}>
                              <p style={{ fontSize: '18px', fontWeight: 800, color: INK, lineHeight: 1 }}>{d.getDate()}</p>
                              <p style={{ fontSize: '11px', color: INK_MUTE, marginTop: '2px' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            </div>
                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon style={{ width: '16px', height: '16px', color: NAVY }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '15px', fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.systemName}</p>
                              <p style={{ fontSize: '13px', color: INK_MUTE, marginTop: '2px' }}>{t.systemType}{t.vendor ? ` · ${t.vendor}` : ''}</p>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500, borderRadius: '999px', padding: '3px 9px', background: status.tint, color: status.text, flexShrink: 0 }}>{status.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}

        {/* ── Service log tab ── */}
        {activeTab === 'log' && (
          <div style={{ background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{ borderBottom: `1px solid ${PAGE}`, padding: '20px 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: INK }}>Service history</h2>
              <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '4px' }}>Complete log of all maintenance performed on this home.</p>
            </div>
            <div style={{ padding: '24px' }}>
              {tasks.filter((t) => t.lastServiceDate).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <ClipboardList style={{ width: '40px', height: '40px', color: GREY, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '16px', fontWeight: 600, color: INK }}>No service history yet.</p>
                  <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '4px' }}>Log your first service from the Maintenance tab.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tasks.filter((t) => t.lastServiceDate).sort((a, b) => new Date(b.lastServiceDate) - new Date(a.lastServiceDate)).map((task) => {
                    const Icon = catIcon(task.systemType);
                    return (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', borderRadius: '10px', padding: '14px 16px', border: `1px solid ${PAGE}` }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon style={{ width: '16px', height: '16px', color: NAVY }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: INK }}>{task.systemName}</p>
                          <p style={{ fontSize: '13px', color: INK_MUTE, marginTop: '2px' }}>{task.vendor && `${task.vendor} · `}{cadenceDisplay(task.reminderFrequencyDays)}</p>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: INK_SOFT, flexShrink: 0 }}>{fmtDate(task.lastServiceDate)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Home care schedule tab ── */}
        {activeTab === 'seasonal' && (
          <HomeCareSchedule
            onPick={handlePickSeasonal}
            existingNames={tasks.map((t) => (t.systemName || '').toLowerCase())}
          />
        )}

        {/* ── Vendors tab ── */}
        {activeTab === 'vendors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ borderBottom: `1px solid ${PAGE}`, padding: '20px 24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: INK }}>Your vendors</h2>
                <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '4px' }}>Vendors saved from your maintenance.</p>
              </div>
              <div style={{ padding: '24px' }}>
                {tasks.filter((t) => t.vendor).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <User style={{ width: '40px', height: '40px', color: GREY, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '16px', fontWeight: 600, color: INK }}>No vendors saved yet.</p>
                    <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '4px' }}>Add vendor info when creating maintenance.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                    {tasks.filter((t) => t.vendor).map((task) => {
                      const Icon = catIcon(task.systemType);
                      return (
                        <div key={task.id} style={{ background: PAGE, borderRadius: '10px', padding: '14px', border: `1px solid ${BORDER}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon style={{ width: '15px', height: '15px', color: NAVY }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.vendor}</p>
                              <p style={{ fontSize: '12px', color: INK_MUTE }}>{task.systemType} · {task.systemName}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ borderBottom: `1px solid ${PAGE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: INK }}>Recommended vendors</h2>
                  <p style={{ fontSize: '14px', color: INK_MUTE, marginTop: '4px' }}>Trusted vendors by category.</p>
                </div>
                <Link to="/vendors" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: NAVY, fontSize: '13px', textDecoration: 'none' }}>
                  Full directory <ArrowRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                  {Object.entries(RECOMMENDED_VENDORS).map(([category, vendors]) => {
                    const Icon = catIcon(category);
                    return (
                      <div key={category} style={{ borderRadius: '10px', border: `1px solid ${BORDER}`, background: PAGE, padding: '14px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: INK, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Icon style={{ width: '14px', height: '14px', color: NAVY }} /> {category}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {vendors.map((v) => (
                            <p key={v} style={{ fontSize: '12px', color: INK_SOFT, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Star style={{ width: '11px', height: '11px', color: GOLD }} /> {v}
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
