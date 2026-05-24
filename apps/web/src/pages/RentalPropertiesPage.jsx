import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  Home, Users, DollarSign, FileText, Wrench, ShieldCheck,
  Plus, X, Edit2, Check, AlertCircle, CheckCircle2, Clock,
  Calendar, Phone, Mail, Key, TrendingUp, BarChart2,
  AlertTriangle, Star, Lightbulb, Download, ChevronRight,
  Building2, Receipt, Scale, BookOpen, Bell, ArrowUpRight,
  Percent, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

// ─── Status Config ────────────────────────────────────────────────────
const LEASE_STATUS = {
  active: { label: 'Active', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  expiring: { label: 'Expiring Soon', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  expired: { label: 'Expired', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  vacant: { label: 'Vacant', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

const PAYMENT_STATUS = {
  paid: { label: 'Paid', color: '#059669', bg: '#ecfdf5' },
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  overdue: { label: 'Overdue', color: '#dc2626', bg: '#fef2f2' },
  partial: { label: 'Partial', color: '#7c3aed', bg: '#f5f3ff' },
};

// ─── Sample Data ──────────────────────────────────────────────────────
const SAMPLE_PROPERTIES = [
  {
    id: 1,
    name: '884 Millbrae Ct.',
    address: '884 Millbrae Ct, Atlanta, GA 30033',
    bedrooms: 3, bathrooms: 2, sqft: 1850,
    monthlyRent: 2400, deposit: 2400,
    purchasePrice: 285000, currentValue: 340000,
    mortgagePayment: 1650,
    tenant: { name: 'Sarah & James Thompson', phone: '(404) 555-0182', email: 'sthompson@email.com' },
    leaseStart: '2024-02-01', leaseEnd: '2025-02-01',
    paymentStatus: 'paid', lastPayment: '2026-05-01',
    depositHeld: 2400, depositBank: 'BB&T Escrow',
    maintenanceOpen: 1,
    notes: 'Great tenants, always pay on time.',
  },
  {
    id: 2,
    name: 'Lake House',
    address: '42 Lakeview Dr, Gainesville, GA 30501',
    bedrooms: 4, bathrooms: 3, sqft: 2400,
    monthlyRent: 3200, deposit: 3200,
    purchasePrice: 420000, currentValue: 510000,
    mortgagePayment: 2100,
    tenant: null,
    leaseStart: null, leaseEnd: null,
    paymentStatus: null, lastPayment: null,
    depositHeld: 0, depositBank: '',
    maintenanceOpen: 0,
    notes: 'Currently vacant. Listed for rent.',
  },
];

// ─── Portfolio Summary ────────────────────────────────────────────────
const PortfolioSummary = ({ properties, onAdd }) => {
  const totalRent = properties.reduce((s, p) => s + (p.tenant ? p.monthlyRent : 0), 0);
  const totalExpenses = properties.reduce((s, p) => s + (p.mortgagePayment || 0), 0);
  const cashFlow = totalRent - totalExpenses;
  const occupied = properties.filter(p => p.tenant).length;
  const occupancyRate = properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0;
  const now = new Date();
  const expiringLeases = properties.filter(p => {
    if (!p.leaseEnd) return false;
    const daysLeft = Math.ceil((new Date(p.leaseEnd) - now) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 60;
  }).length;
  const overdueRent = properties.filter(p => p.paymentStatus === 'overdue').length;

  return (
    <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Rental Properties</h1>
            <p className="text-blue-200 text-base max-w-xl">Your rental portfolio, organized and optimized — from leases to tax filings.</p>
            <div className="flex items-center gap-2 mt-3">
              <ShieldCheck className="w-4 h-4 text-green-300" />
              <span className="text-blue-200 text-xs">Tenant and lease data encrypted and securely stored.</span>
            </div>
          </div>
          <Button onClick={onAdd} className="bg-[#e8604c] hover:bg-[#d4503c] text-white rounded-xl font-bold flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Add Rental Property
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Monthly Rent', value: `$${totalRent.toLocaleString()}`, sub: 'collected', color: 'text-green-300' },
            { label: 'Cash Flow', value: `${cashFlow >= 0 ? '+' : ''}$${cashFlow.toLocaleString()}`, sub: 'after mortgage', color: cashFlow >= 0 ? 'text-green-300' : 'text-red-300' },
            { label: 'Occupancy', value: `${occupancyRate}%`, sub: `${occupied}/${properties.length} occupied`, color: occupancyRate >= 90 ? 'text-green-300' : 'text-amber-300' },
            { label: 'Expiring Leases', value: expiringLeases, sub: 'within 60 days', color: expiringLeases > 0 ? 'text-amber-300' : 'text-blue-200' },
            { label: 'Overdue Rent', value: overdueRent, sub: overdueRent > 0 ? 'action needed' : 'all clear', color: overdueRent > 0 ? 'text-red-300' : 'text-green-300' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <p className="text-blue-200 text-xs font-medium mb-1">{stat.label}</p>
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-blue-300 text-xs mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {occupancyRate === 100 && (
          <div className="mt-4 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-300" />
            <p className="text-blue-100 text-sm">Your portfolio is 100% occupied — excellent landlord performance!</p>
          </div>
        )}
        {expiringLeases > 0 && (
          <div className="mt-4 bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-300" />
            <p className="text-amber-100 text-sm">{expiringLeases} lease{expiringLeases > 1 ? 's' : ''} expiring within 60 days — start renewal process now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Property Card ────────────────────────────────────────────────────
const PropertyCard = ({ property, onEdit, onDelete, onViewTenant }) => {
  const now = new Date();
  const daysLeft = property.leaseEnd ? Math.ceil((new Date(property.leaseEnd) - now) / (1000 * 60 * 60 * 24)) : null;
  const leaseStatus = !property.tenant ? 'vacant'
    : daysLeft !== null && daysLeft < 0 ? 'expired'
    : daysLeft !== null && daysLeft <= 60 ? 'expiring'
    : 'active';
  const ls = LEASE_STATUS[leaseStatus];
  const ps = property.paymentStatus ? PAYMENT_STATUS[property.paymentStatus] : null;
  const cashFlow = (property.tenant ? property.monthlyRent : 0) - (property.mortgagePayment || 0);
  const roi = property.purchasePrice > 0 ? ((property.monthlyRent * 12) / property.purchasePrice * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Status bar */}
      <div className="h-1.5 w-full" style={{ background: ls.color }}></div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{property.name}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{property.address}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: ls.bg, color: ls.color, border: `1px solid ${ls.border}` }}>
                {ls.label}
              </span>
              {ps && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: ps.bg, color: ps.color }}>
                  {ps.label}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-slate-900">${property.monthlyRent.toLocaleString()}</p>
            <p className="text-xs text-slate-400">/month</p>
          </div>
        </div>

        {/* Property specs */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span>{property.bedrooms}bd</span>
          <span>·</span>
          <span>{property.bathrooms}ba</span>
          <span>·</span>
          <span>{property.sqft?.toLocaleString()} sqft</span>
          <span>·</span>
          <span className={`font-bold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {cashFlow >= 0 ? '+' : ''}${cashFlow.toLocaleString()}/mo cash flow
          </span>
        </div>

        {/* Tenant info */}
        {property.tenant ? (
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-700">Tenant</p>
              {property.maintenanceOpen > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                  {property.maintenanceOpen} open request{property.maintenanceOpen > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="font-semibold text-slate-900 text-sm">{property.tenant.name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <a href={`tel:${property.tenant.phone}`} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                <Phone className="w-3 h-3" /> {property.tenant.phone}
              </a>
              <a href={`mailto:${property.tenant.email}`} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                <Mail className="w-3 h-3" /> Email
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">Vacant — no tenant assigned</p>
          </div>
        )}

        {/* Lease info */}
        {property.leaseEnd && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-xs text-slate-400">Lease Start</p>
              <p className="text-xs font-bold text-slate-700">{new Date(property.leaseStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: ls.bg }}>
              <p className="text-xs text-slate-400">Lease End</p>
              <p className="text-xs font-bold" style={{ color: ls.color }}>
                {new Date(property.leaseEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {daysLeft !== null && daysLeft >= 0 && ` · ${daysLeft}d`}
              </p>
            </div>
          </div>
        )}

        {/* Financial quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-xs text-slate-400">ROI</p>
            <p className="text-xs font-bold text-slate-900">{roi}%/yr</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-xs text-slate-400">Deposit</p>
            <p className="text-xs font-bold text-slate-900">${property.depositHeld?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2">
            <p className="text-xs text-slate-400">Equity</p>
            <p className="text-xs font-bold text-green-600">${((property.currentValue || 0) - (property.purchasePrice || 0)).toLocaleString()}</p>
          </div>
        </div>

        {/* Last payment */}
        {property.lastPayment && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            Last payment: {new Date(property.lastPayment).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onEdit(property)} className="flex-1 h-9 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Manage
          </button>
          {property.leaseEnd && daysLeft !== null && daysLeft <= 60 && (
            <button className="flex-1 h-9 rounded-xl text-xs font-bold text-white transition-colors" style={{ background: '#d97706' }}>
              <Bell className="w-3.5 h-3.5 inline mr-1" /> Send Renewal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tax & Compliance Section ─────────────────────────────────────────
const TaxCompliance = ({ properties }) => {
  const totalRentYTD = properties.reduce((s, p) => s + (p.tenant ? p.monthlyRent * 5 : 0), 0);
  const totalMortgageYTD = properties.reduce((s, p) => s + (p.mortgagePayment || 0) * 5, 0);
  const totalDeposits = properties.reduce((s, p) => s + (p.depositHeld || 0), 0);

  return (
    <div className="space-y-6">

      {/* Schedule E Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">IRS Schedule E Summary</h3>
            <p className="text-slate-500 text-sm">Rental income & expense tracker for tax filing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Gross Rental Income (YTD)', value: `$${totalRentYTD.toLocaleString()}`, note: 'Taxable rental income', color: '#059669', bg: '#ecfdf5' },
            { label: 'Deductible Expenses (YTD)', value: `$${totalMortgageYTD.toLocaleString()}`, note: 'Mortgage interest + expenses', color: '#1e3a5f', bg: '#eef2f8' },
            { label: 'Security Deposits Held', value: `$${totalDeposits.toLocaleString()}`, note: 'Not taxable until forfeited', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: item.bg }}>
              <p className="text-xs font-semibold text-slate-500 mb-1">{item.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Deductible Expense Categories</p>
          {[
            { label: 'Mortgage Interest', deductible: true, note: 'Deductible on Schedule E' },
            { label: 'Property Insurance', deductible: true, note: 'Fully deductible' },
            { label: 'Repairs & Maintenance', deductible: true, note: 'Deductible if under $2,500' },
            { label: 'Property Taxes', deductible: true, note: 'Deductible on Schedule E' },
            { label: 'Property Management Fees', deductible: true, note: 'Fully deductible' },
            { label: 'Depreciation (27.5 yrs)', deductible: true, note: `~$${properties.length > 0 ? Math.round(properties[0].purchasePrice * 0.8 / 27.5).toLocaleString() : '10,000'}/yr per property` },
            { label: 'Capital Improvements', deductible: false, note: 'Must be capitalized, not expensed' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                {item.deductible
                  ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                  : <AlertCircle className="w-4 h-4 text-amber-500" />
                }
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="text-xs text-slate-400">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Depreciation Calculator */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Depreciation Calculator</h3>
            <p className="text-slate-500 text-sm">IRS Pub 946 — Residential rental property depreciates over 27.5 years</p>
          </div>
        </div>

        <div className="space-y-4">
          {properties.filter(p => p.purchasePrice).map(property => {
            const costBasis = property.purchasePrice * 0.8; // Assume 80% building, 20% land
            const annualDepreciation = costBasis / 27.5;
            const totalDepreciation = annualDepreciation * (new Date().getFullYear() - (property.purchaseYear || 2020));

            return (
              <div key={property.id} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-900">{property.name}</p>
                  <span className="text-xs bg-purple-100 text-purple-600 font-bold px-2.5 py-1 rounded-full">
                    ${Math.round(annualDepreciation).toLocaleString()}/yr
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Purchase Price</p>
                    <p className="font-bold text-slate-900 text-sm">${property.purchasePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Cost Basis (80%)</p>
                    <p className="font-bold text-slate-900 text-sm">${Math.round(costBasis).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Annual Deduction</p>
                    <p className="font-bold text-purple-600 text-sm">${Math.round(annualDepreciation).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Depreciation recapture applies when you sell. Consult a tax professional before filing.</p>
        </div>
      </div>

      {/* State Compliance — Georgia */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Scale className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Georgia Landlord Compliance Guide</h3>
            <p className="text-slate-500 text-sm">Key legal requirements for Georgia rental properties</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Security Deposit', rule: 'Must be held in escrow or surety bond. Return within 30 days of move-out or provide written itemization.', law: 'O.C.G.A. § 44-7-30', status: totalDeposits > 0 ? 'action' : 'info' },
            { title: 'Lease Renewal Notice', rule: 'Provide 60 days written notice for renewal or termination of annual lease.', law: 'Georgia Landlord-Tenant Law', status: 'info' },
            { title: 'Habitability', rule: 'Maintain safe, sanitary, and habitable conditions. Respond to maintenance requests promptly.', law: 'O.C.G.A. § 44-7-13', status: 'info' },
            { title: 'Fair Housing', rule: 'Cannot discriminate based on race, color, religion, sex, national origin, disability, or familial status.', law: 'HUD Title VIII & Georgia FHA', status: 'info' },
            { title: 'Eviction Process', rule: 'Must file dispossessory warrant with Magistrate Court. Cannot self-help evict (change locks, remove belongings).', law: 'O.C.G.A. § 44-7-50', status: 'warning' },
            { title: 'Lead Paint Disclosure', rule: 'Required for properties built before 1978. Must provide EPA pamphlet.', law: 'Federal 42 U.S.C. § 4852d', status: 'action' },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-4 border ${item.status === 'warning' ? 'bg-red-50 border-red-100' : item.status === 'action' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm mb-1">{item.title}</p>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.rule}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                  item.status === 'warning' ? 'bg-red-100 text-red-600' :
                  item.status === 'action' ? 'bg-amber-100 text-amber-600' :
                  'bg-slate-200 text-slate-500'
                }`}>{item.law}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">This is general guidance only and not legal advice. Laws change frequently. Consult a Georgia real estate attorney for specific situations.</p>
        </div>
      </div>
    </div>
  );
};

// ─── Rent Tracker ─────────────────────────────────────────────────────
const RentTracker = ({ properties, onUpdatePayment }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      {/* Payment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.filter(p => p.tenant).map(property => {
          const ps = PAYMENT_STATUS[property.paymentStatus || 'pending'];
          return (
            <div key={property.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{property.name}</h3>
                  <p className="text-slate-400 text-sm">{property.tenant.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-slate-900">${property.monthlyRent.toLocaleString()}</p>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>
                </div>
              </div>

              {/* Payment status buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(PAYMENT_STATUS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => onUpdatePayment(property.id, key)}
                    className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={property.paymentStatus === key
                      ? { background: val.color, color: '#fff' }
                      : { background: val.bg, color: val.color }
                    }
                  >
                    {val.label}
                  </button>
                ))}
              </div>

              {/* Monthly payment grid */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">2026 Payment Tracker</p>
                <div className="grid grid-cols-12 gap-1">
                  {months.map((month, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-8 rounded-md flex items-center justify-center text-xs font-bold ${
                        i < currentMonth ? 'bg-green-100 text-green-600' :
                        i === currentMonth ? (property.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-600') :
                        'bg-slate-100 text-slate-300'
                      }`}>
                        {i < currentMonth ? '✓' : i === currentMonth ? (property.paymentStatus === 'paid' ? '✓' : '·') : '·'}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{month[0]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {property.lastPayment && (
                <p className="text-xs text-slate-400 mt-3">
                  Last payment: {new Date(property.lastPayment).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {properties.filter(p => !p.tenant).length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <p className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Vacant Properties
          </p>
          {properties.filter(p => !p.tenant).map(p => (
            <p key={p.id} className="text-amber-600 text-sm">• {p.name} — no tenant assigned. Add a tenant to start tracking rent.</p>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Add Property Modal ───────────────────────────────────────────────
const AddPropertyModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', address: '', bedrooms: '', bathrooms: '', sqft: '',
    monthlyRent: '', deposit: '', purchasePrice: '', currentValue: '',
    mortgagePayment: '', purchaseYear: '',
    tenantName: '', tenantPhone: '', tenantEmail: '',
    leaseStart: '', leaseEnd: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Rental Property</DialogTitle>
          <p className="text-slate-500 text-sm">Start by adding your first rental property. CasaCEO will guide you through tenants, leases, and payments.</p>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Property Details */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Property Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Property Name *</Label>
                <Input placeholder="884 Millbrae Ct." value={form.name} onChange={e => set('name', e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Address</Label>
                <Input placeholder="123 Main St, Atlanta, GA 30033" value={form.address} onChange={e => set('address', e.target.value)} className="h-11 rounded-xl" />
              </div>
              {[
                { key: 'bedrooms', label: 'Bedrooms', placeholder: '3' },
                { key: 'bathrooms', label: 'Bathrooms', placeholder: '2' },
                { key: 'sqft', label: 'Square Feet', placeholder: '1850' },
                { key: 'purchaseYear', label: 'Year Purchased', placeholder: '2020' },
              ].map(f => (
                <div key={f.key}>
                  <Label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</Label>
                  <Input type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} className="h-11 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Financial */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Financial Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'monthlyRent', label: 'Monthly Rent', prefix: '$' },
                { key: 'deposit', label: 'Security Deposit', prefix: '$' },
                { key: 'mortgagePayment', label: 'Mortgage Payment', prefix: '$' },
                { key: 'purchasePrice', label: 'Purchase Price', prefix: '$' },
                { key: 'currentValue', label: 'Current Value', prefix: '$' },
              ].map(f => (
                <div key={f.key}>
                  <Label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
                    <Input type="number" placeholder="0" value={form[f.key]} onChange={e => set(f.key, e.target.value)} className="h-11 rounded-xl pl-7" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Tenant Information (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Tenant Name</Label>
                <Input placeholder="John & Jane Smith" value={form.tenantName} onChange={e => set('tenantName', e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Phone</Label>
                <Input placeholder="(404) 555-0100" value={form.tenantPhone} onChange={e => set('tenantPhone', e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Email</Label>
                <Input placeholder="tenant@email.com" value={form.tenantEmail} onChange={e => set('tenantEmail', e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Lease Start</Label>
                <Input type="date" value={form.leaseStart} onChange={e => set('leaseStart', e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">Lease End</Label>
                <Input type="date" value={form.leaseEnd} onChange={e => set('leaseEnd', e.target.value)} className="h-11 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button
              onClick={() => {
                onSave({
                  ...form, id: Date.now(),
                  monthlyRent: parseFloat(form.monthlyRent) || 0,
                  deposit: parseFloat(form.deposit) || 0,
                  depositHeld: parseFloat(form.deposit) || 0,
                  mortgagePayment: parseFloat(form.mortgagePayment) || 0,
                  purchasePrice: parseFloat(form.purchasePrice) || 0,
                  currentValue: parseFloat(form.currentValue) || 0,
                  bedrooms: parseInt(form.bedrooms) || 0,
                  bathrooms: parseInt(form.bathrooms) || 0,
                  sqft: parseInt(form.sqft) || 0,
                  tenant: form.tenantName ? { name: form.tenantName, phone: form.tenantPhone, email: form.tenantEmail } : null,
                  paymentStatus: form.tenantName ? 'pending' : null,
                  maintenanceOpen: 0,
                });
                onClose();
              }}
              disabled={!form.name}
              className="flex-1 h-12 rounded-xl font-bold text-white disabled:opacity-50"
              style={{ background: '#1e3a5f' }}
            >
              Add Property
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const RentalPropertiesPage = () => {
  const [properties, setProperties] = useState(SAMPLE_PROPERTIES);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const handleUpdatePayment = (id, status) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, paymentStatus: status, lastPayment: status === 'paid' ? new Date().toISOString().split('T')[0] : p.lastPayment } : p));
  };

  return (
    <>
      <Helmet><title>Rental Properties — CasaCEO</title></Helmet>

      <div className="max-w-6xl mx-auto pb-20">
        <PortfolioSummary properties={properties} onAdd={() => setShowAddModal(true)} />

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm overflow-x-auto">
            {[
              { key: 'overview', label: '🏠 Properties' },
              { key: 'rent', label: '💰 Rent Tracker' },
              { key: 'tax', label: '📊 Tax & Compliance' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                style={activeTab === tab.key ? { background: '#1e3a5f', color: '#fff' } : { color: '#64748b' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} onEdit={setEditingProperty} onDelete={id => setProperties(prev => prev.filter(p => p.id !== id))} />
            ))}
            <button onClick={() => setShowAddModal(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all min-h-48 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-semibold">Add Rental Property</p>
              <p className="text-sm mt-1 text-slate-300">Track tenants, leases & payments</p>
            </button>
          </div>
        )}

        {/* Rent Tracker Tab */}
        {activeTab === 'rent' && <RentTracker properties={properties} onUpdatePayment={handleUpdatePayment} />}

        {/* Tax & Compliance Tab */}
        {activeTab === 'tax' && <TaxCompliance properties={properties} />}
      </div>

      <AddPropertyModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={p => setProperties(prev => [...prev, p])} />
    </>
  );
};

export default RentalPropertiesPage;
