import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Zap, Droplets, Utensils, Wind, Settings, Plus, X, Edit2,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Shield,
  FileText, Bell, Calendar
} from 'lucide-react';

const APPLIANCE_CATEGORIES = [
  { key: 'hvac', label: 'HVAC', icon: Wind, color: '#2563eb', bg: '#eff6ff' },
  { key: 'water-heater', label: 'Water Heater', icon: Droplets, color: '#0891b2', bg: '#ecfeff' },
  { key: 'refrigerator', label: 'Refrigerator', icon: Settings, color: '#64748b', bg: '#f8fafc' },
  { key: 'washer-dryer', label: 'Washer/Dryer', icon: Settings, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'dishwasher', label: 'Dishwasher', icon: Utensils, color: '#f97316', bg: '#fff7ed' },
  { key: 'oven', label: 'Oven/Range', icon: Utensils, color: '#dc2626', bg: '#fef2f2' },
  { key: 'electrical', label: 'Electrical', icon: Zap, color: '#d97706', bg: '#fffbeb' },
];

const APPLIANCES = [
  {
    id: 1, name: 'Carrier HVAC System', category: 'hvac', model: '24ACC636A003',
    purchaseDate: '2022-03-10', cost: 8400, warrantyYears: 10,
    expectedLifeYears: 15, notes: 'Installed by Johnson & Miller HVAC',
    hasReceipt: true, hasManual: true,
  },
  {
    id: 2, name: 'Rheem Water Heater', category: 'water-heater', model: 'XE50T10HS45U0',
    purchaseDate: '2017-06-01', cost: 1200, warrantyYears: 6,
    expectedLifeYears: 12, notes: '50 gallon tank',
    hasReceipt: false, hasManual: false,
  },
  {
    id: 3, name: 'Samsung Refrigerator', category: 'refrigerator', model: 'RF28R7351SR',
    purchaseDate: '2021-06-15', cost: 2100, warrantyYears: 1,
    expectedLifeYears: 15, notes: 'French door, 28 cu ft',
    hasReceipt: true, hasManual: false,
  },
  {
    id: 4, name: 'LG Washer & Dryer', category: 'washer-dryer', model: 'WM4200HWA / DLEX4200W',
    purchaseDate: '2023-01-20', cost: 1850, warrantyYears: 3,
    expectedLifeYears: 13, notes: 'Front-load pair',
    hasReceipt: true, hasManual: true,
  },
];

const getWarrantyStatus = (app) => {
  const purchaseYear = new Date(app.purchaseDate).getFullYear();
  const expiryYear = purchaseYear + app.warrantyYears;
  const currentYear = new Date().getFullYear();
  const yearsLeft = expiryYear - currentYear;
  if (yearsLeft < 0) return { label: 'Expired', color: '#dc2626', bg: '#fef2f2' };
  if (yearsLeft === 0) return { label: 'Expires this year', color: '#f97316', bg: '#fff7ed' };
  if (yearsLeft <= 2) return { label: `${yearsLeft}yr left`, color: '#d97706', bg: '#fffbeb' };
  return { label: `${yearsLeft}yr left`, color: '#059669', bg: '#ecfdf5' };
};

const getAgeStatus = (app) => {
  const ageYears = (new Date() - new Date(app.purchaseDate)) / (365.25 * 86400000);
  const pctLife = (ageYears / app.expectedLifeYears) * 100;
  if (pctLife >= 85) return { label: 'Replace Soon', color: '#dc2626', pct: Math.min(pctLife, 100) };
  if (pctLife >= 65) return { label: 'Monitor', color: '#d97706', pct: pctLife };
  return { label: 'Good', color: '#059669', pct: pctLife };
};

const ApplianceCard = ({ appliance, onEdit }) => {
  const cat = APPLIANCE_CATEGORIES.find(c => c.key === appliance.category);
  const Icon = cat?.icon || Settings;
  const warranty = getWarrantyStatus(appliance);
  const age = getAgeStatus(appliance);
  const ageYears = ((new Date() - new Date(appliance.purchaseDate)) / (365.25 * 86400000)).toFixed(1);

  return (
    <div className="bg-white hover:shadow-md transition-all" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: cat?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: '20px', height: '20px', color: cat?.color }} />
          </div>
          <div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{appliance.name}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{appliance.model}</p>
          </div>
        </div>
        <button onClick={() => onEdit(appliance)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Edit2 style={{ width: '13px', height: '13px', color: '#64748b' }} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '12px' }}>
        <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Age</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{ageYears} years</p>
        </div>
        <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Cost</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>${appliance.cost.toLocaleString()}</p>
        </div>
      </div>

      {/* Life expectancy bar */}
      <div style={{ marginBottom: '12px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>Lifecycle ({age.label})</p>
          <p style={{ fontSize: '11px', fontWeight: 600, color: age.color }}>{age.pct.toFixed(0)}% of {appliance.expectedLifeYears}yr life</p>
        </div>
        <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${age.pct}%`, background: age.color, borderRadius: '999px' }} />
        </div>
      </div>

      {/* Warranty badge */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: warranty.color, background: warranty.bg, padding: '3px 8px', borderRadius: '999px' }}>
          🛡️ Warranty: {warranty.label}
        </span>
        <div className="flex items-center gap-1">
          {appliance.hasReceipt && <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '999px' }}>Receipt</span>}
          {appliance.hasManual && <span style={{ fontSize: '11px', color: '#7c3aed', background: '#f5f3ff', padding: '2px 6px', borderRadius: '999px' }}>Manual</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <button style={{ flex: 1, height: '32px', borderRadius: '8px', background: '#eef2f8', color: '#1e3a5f', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>View Details</button>
        <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <Bell style={{ width: '13px', height: '13px', color: '#d97706' }} />
        </button>
      </div>
    </div>
  );
};

const ApplianceTrackerPage = () => {
  const [appliances] = useState(APPLIANCES);
  const expiredWarranties = appliances.filter(a => getWarrantyStatus(a).label === 'Expired').length;
  const replaceSoon = appliances.filter(a => getAgeStatus(a).label === 'Replace Soon').length;
  const totalValue = appliances.reduce((s, a) => s + a.cost, 0);

  return (
    <>
      <Helmet><title>Appliance & Warranty Tracker — HomeOS</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/warranty-tracker" className="hover:text-slate-600">Warranty Tracker</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Appliance Tracker</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Appliance & Warranty Tracker</h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Track every appliance, warranty, and replacement cycle</p>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              <Plus style={{ width: '15px', height: '15px' }} /> Add Appliance
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Total Appliances', value: appliances.length, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
            { label: 'Total Value', value: `$${(totalValue / 1000).toFixed(1)}K`, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
            { label: 'Expired Warranties', value: expiredWarranties, color: expiredWarranties > 0 ? '#dc2626' : '#059669', bg: expiredWarranties > 0 ? '#fef2f2' : '#ecfdf5', border: expiredWarranties > 0 ? '#fecaca' : '#a7f3d0' },
            { label: 'Replace Soon', value: replaceSoon, color: replaceSoon > 0 ? '#f97316' : '#059669', bg: replaceSoon > 0 ? '#fff7ed' : '#ecfdf5', border: replaceSoon > 0 ? '#fed7aa' : '#a7f3d0' },
          ].map((s, i) => (
            <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <p className="font-extrabold" style={{ fontSize: '22px', lineHeight: 1, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appliances.map(app => <ApplianceCard key={app.id} appliance={app} onEdit={() => {}} />)}
        </div>
      </div>
    </>
  );
};

export default ApplianceTrackerPage;
