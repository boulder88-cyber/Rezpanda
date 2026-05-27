import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  LayoutGrid, CheckSquare, ChevronRight, Download, Plus,
  Home, Calendar, Hammer, Shield, Zap, CheckCircle2, Circle
} from 'lucide-react';

const TEMPLATES = [
  { id: 1, name: 'Move-In Checklist', category: 'moving', icon: Home, color: '#1e3a5f', bg: '#eef2f8', items: 18, desc: 'Everything to do in your first 30 days of homeownership.' },
  { id: 2, name: 'Seasonal Maintenance', category: 'maintenance', icon: Calendar, color: '#059669', bg: '#ecfdf5', items: 24, desc: 'Spring, summer, fall, and winter home maintenance tasks.' },
  { id: 3, name: 'Renovation Planning', category: 'renovation', icon: Hammer, color: '#e8604c', bg: '#fdf0ee', items: 15, desc: 'Plan, budget, and execute a renovation project.' },
  { id: 4, name: 'Insurance Review', category: 'insurance', icon: Shield, color: '#7c3aed', bg: '#f5f3ff', items: 12, desc: 'Annual checklist to review and optimize your insurance coverage.' },
  { id: 5, name: 'Utility Optimization', category: 'utilities', icon: Zap, color: '#d97706', bg: '#fffbeb', items: 10, desc: 'Steps to reduce energy usage and lower monthly bills.' },
];

const SAMPLE_ITEMS = {
  1: [
    'Change all locks and garage door codes',
    'Locate main water shut-off valve',
    'Test all smoke and carbon monoxide detectors',
    'Document current utility meter readings',
    'Set up mail forwarding',
    'Register with local utility providers',
    'Walk through and document any existing damage',
    'Locate electrical panel and label circuits',
    'Test all GFCI outlets (bathrooms, kitchen, garage)',
    'Check water pressure and water heater temperature',
    'Identify HVAC filter location and size',
    'Find septic system / sewer access (if applicable)',
    'Upload all closing documents to HomeOS',
    'Set up home insurance in HomeOS',
    'Add all utility accounts to HomeOS',
    'Create first maintenance schedule',
    'Photograph every room for insurance documentation',
    'Create emergency contact list',
  ],
  2: [
    'Replace HVAC filters', 'Clean gutters', 'Test smoke detectors',
    'Service HVAC system', 'Check roof for damage', 'Inspect caulk around windows',
    'Clean dryer vent', 'Flush water heater', 'Check attic insulation',
    'Service lawn equipment', 'Fertilize lawn', 'Aerate soil',
    'Winterize irrigation system', 'Inspect fireplace/chimney', 'Check weather stripping',
    'Test carbon monoxide detectors', 'Inspect foundation for cracks',
    'Check sump pump operation', 'Clean refrigerator coils', 'Inspect deck/patio',
    'Check garage door springs and hardware', 'Inspect attic for leaks',
    'Reverse ceiling fan direction (seasonal)', 'Inspect exterior paint',
  ],
};

const TemplatesPage = () => {
  const [selected, setSelected] = useState(TEMPLATES[0]);
  const [checkedItems, setCheckedItems] = useState({});
  const items = SAMPLE_ITEMS[selected.id] || Array(selected.items).fill(null).map((_, i) => `Task ${i + 1}`);
  const toggleItem = (i) => setCheckedItems(p => ({ ...p, [i]: !p[i] }));
  const doneCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0;
  const Icon = selected.icon;

  return (
    <>
      <Helmet><title>HomeOS Templates — Checklists</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/dashboard" className="hover:text-slate-600">Dashboard</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Templates</span>
          </div>
          <div className="flex items-center gap-4">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutGrid style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>HomeOS Templates</h1>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Pre-built workflows for every homeowner need</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Templates</p>
            {TEMPLATES.map(t => {
              const TIcon = t.icon;
              return (
                <button key={t.id} onClick={() => { setSelected(t); setCheckedItems({}); }} className="w-full text-left hover:shadow-sm transition-all bg-white"
                  style={{ borderRadius: '12px', border: `2px solid ${selected.id === t.id ? t.color : '#e2e8f0'}`, padding: '14px 16px', cursor: 'pointer' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <TIcon style={{ width: '18px', height: '18px', color: t.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{t.name}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.items} items</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', background: selected.bg }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon style={{ width: '22px', height: '22px', color: selected.color }} />
                    <div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{selected.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{selected.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                      <Download style={{ width: '13px', height: '13px' }} /> Export
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '5px' }}>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{doneCount} of {items.length} complete</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: selected.color }}>{progress.toFixed(0)}%</p>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.6)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: selected.color, borderRadius: '999px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>
              <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {items.map((item, i) => (
                  <button key={i} onClick={() => toggleItem(i)} className="w-full flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                    style={{ padding: '12px 22px', borderBottom: '1px solid #f8fafc', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {checkedItems[i]
                      ? <CheckCircle2 style={{ width: '18px', height: '18px', color: selected.color, flexShrink: 0 }} />
                      : <Circle style={{ width: '18px', height: '18px', color: '#cbd5e1', flexShrink: 0 }} />
                    }
                    <p style={{ fontSize: '14px', color: checkedItems[i] ? '#94a3b8' : '#334155', textDecoration: checkedItems[i] ? 'line-through' : 'none' }}>
                      {item}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplatesPage;
