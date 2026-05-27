import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Users, DollarSign, FileText, Wrench, ShieldCheck,
  Plus, X, Edit2, Check, AlertCircle, CheckCircle2, Clock,
  Calendar, Phone, Mail, Key, TrendingUp, BarChart2,
  AlertTriangle, Star, Lightbulb, Download, ChevronRight,
  Building2, Receipt, Scale, BookOpen, Bell, ArrowUpRight,
  Percent, Lock, Search, Filter, LayoutGrid, List,
  ArrowDownUp, FolderOpen, UserPlus, SortAsc
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

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

const SAMPLE_PROPERTIES = [
  {
    id: 1, name: '884 Millbrae Ct.', address: '884 Millbrae Ct, Atlanta, GA 30033',
    bedrooms: 3, bathrooms: 2, sqft: 1850,
    monthlyRent: 2400, deposit: 2400, purchasePrice: 285000, currentValue: 340000, mortgagePayment: 1650,
    tenant: { name: 'Sarah & James Thompson', phone: '(404) 555-0182', email: 'sthompson@email.com' },
    leaseStart: '2024-02-01', leaseEnd: '2025-02-01',
    paymentStatus: 'paid', lastPayment: '2026-05-01',
    depositHeld: 2400, depositBank: 'BB&T Escrow', maintenanceOpen: 1,
    notes: 'Great tenants, always pay on time.',
  },
  {
    id: 2, name: 'Lake House', address: '42 Lakeview Dr, Gainesville, GA 30501',
    bedrooms: 4, bathrooms: 3, sqft: 2400,
    monthlyRent: 3200, deposit: 3200, purchasePrice: 420000, currentValue: 510000, mortgagePayment: 2100,
    tenant: null, leaseStart: null, leaseEnd: null,
    paymentStatus: null, lastPayment: null,
    depositHeld: 0, depositBank: '', maintenanceOpen: 0,
    notes: 'Currently vacant. Listed for rent.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

const getLeaseStatus = (property) => {
  const now = new Date();
  const daysLeft = property.leaseEnd ? Math.ceil((new Date(property.leaseEnd) - now) / 86400000) : null;
  if (!property.tenant) return 'vacant';
  if (daysLeft !== null && daysLeft < 0) return 'expired';
  if (daysLeft !== null && daysLeft <= 60) return 'expiring';
  return 'active';
};

// ═══════════════════════════════════════════════════════════════════════
// PORTFOLIO SUMMARY — scalable stats
// ═══════════════════════════════════════════════════════════════════════

const PortfolioSummary = ({ properties }) => {
  const totalRent = properties.reduce((s, p) => s + (p.tenant ? p.monthlyRent : 0), 0);
  const totalExpenses = properties.reduce((s, p) => s + (p.mortgagePayment || 0), 0);
  const cashFlow = totalRent - totalExpenses;
  const occupied = properties.filter(p => p.tenant).length;
  const occupancyRate = properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0;
  const now = new Date();
  const expiringLeases = properties.filter(p => {
    if (!p.leaseEnd) return false;
    const d = Math.ceil((new Date(p.leaseEnd) - now) / 86400000);
    return d >= 0 && d <= 60;
  }).length;
  const overdueRent = properties.filter(p => p.paymentStatus === 'overdue').length;
  const totalPortfolioValue = properties.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalEquity = properties.reduce((s, p) => s + ((p.currentValue || 0) - (p.purchasePrice || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Rent', value: `$${totalRent.toLocaleString()}`, sub: `${occupied}/${properties.length} occupied`, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
          { label: 'Monthly Cash Flow', value: `${cashFlow >= 0 ? '+' : ''}$${cashFlow.toLocaleString()}`, sub: 'after mortgages', color: cashFlow >= 0 ? '#059669' : '#dc2626', bg: cashFlow >= 0 ? '#ecfdf5' : '#fef2f2', border: cashFlow >= 0 ? '#a7f3d0' : '#fecaca' },
          { label: 'Occupancy Rate', value: `${occupancyRate}%`, sub: `${properties.length} properties total`, color: occupancyRate >= 90 ? '#059669' : '#d97706', bg: occupancyRate >= 90 ? '#ecfdf5' : '#fffbeb', border: occupancyRate >= 90 ? '#a7f3d0' : '#fde68a' },
          { label: 'Portfolio Value', value: `$${(totalPortfolioValue / 1000).toFixed(0)}K`, sub: `+$${(totalEquity / 1000).toFixed(0)}K equity`, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
        ].map((s, i) => (
          <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p className="font-extrabold" style={{ fontSize: '24px', lineHeight: 1, color: s.color }}>{s.value}</p>
            <p className="font-semibold text-slate-700" style={{ fontSize: '13px', marginTop: '4px' }}>{s.label}</p>
            <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(expiringLeases > 0 || overdueRent > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {overdueRent > 0 && (
            <div className="flex items-center gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />
              <p className="font-medium text-red-700" style={{ fontSize: '14px' }}>{overdueRent} propert{overdueRent > 1 ? 'ies have' : 'y has'} overdue rent — action needed.</p>
            </div>
          )}
          {expiringLeases > 0 && (
            <div className="flex items-center gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 16px' }}>
              <Bell style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0 }} />
              <p className="font-medium text-amber-700" style={{ fontSize: '14px' }}>{expiringLeases} lease{expiringLeases > 1 ? 's' : ''} expiring within 60 days — start renewal process now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY CARD — grid view
// ═══════════════════════════════════════════════════════════════════════

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const now = new Date();
  const daysLeft = property.leaseEnd ? Math.ceil((new Date(property.leaseEnd) - now) / 86400000) : null;
  const leaseStatus = getLeaseStatus(property);
  const ls = LEASE_STATUS[leaseStatus];
  const ps = property.paymentStatus ? PAYMENT_STATUS[property.paymentStatus] : null;
  const cashFlow = (property.tenant ? property.monthlyRent : 0) - (property.mortgagePayment || 0);
  const roi = property.purchasePrice > 0 ? ((property.monthlyRent * 12) / property.purchasePrice * 100).toFixed(1) : 0;

  return (
    <div className="bg-white hover:shadow-md transition-all overflow-hidden" style={{ borderRadius: '12px', border: `1px solid ${leaseStatus === 'vacant' ? '#e2e8f0' : ls.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '4px', background: ls.color }} />
      <div style={{ padding: '20px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{property.name}</h3>
            <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{property.address}</p>
            <div className="flex items-center gap-2" style={{ marginTop: '6px' }}>
              <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: ls.bg, color: ls.color, padding: '2px 8px', border: `1px solid ${ls.border}` }}>{ls.label}</span>
              {ps && <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: ps.bg, color: ps.color, padding: '2px 8px' }}>{ps.label}</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>${property.monthlyRent.toLocaleString()}</p>
            <p className="text-slate-400" style={{ fontSize: '11px' }}>/month</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '12px', marginBottom: '12px' }}>
          <span>{property.bedrooms}bd · {property.bathrooms}ba · {property.sqft?.toLocaleString()} sqft</span>
          <span className="ml-auto font-semibold" style={{ color: cashFlow >= 0 ? '#059669' : '#dc2626' }}>
            {cashFlow >= 0 ? '+' : ''}${cashFlow.toLocaleString()}/mo
          </span>
        </div>

        {property.tenant ? (
          <div className="bg-slate-50 rounded-xl" style={{ padding: '10px 12px', marginBottom: '12px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{property.tenant.name}</p>
              {property.maintenanceOpen > 0 && (
                <span className="font-bold text-orange-600 bg-orange-100 rounded-full" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {property.maintenanceOpen} request{property.maintenanceOpen > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <a href={`tel:${property.tenant.phone}`} className="flex items-center gap-1 text-blue-500 hover:text-blue-700" style={{ fontSize: '12px' }}>
                <Phone style={{ width: '11px', height: '11px' }} /> {property.tenant.phone}
              </a>
              <a href={`mailto:${property.tenant.email}`} className="flex items-center gap-1 text-blue-500 hover:text-blue-700" style={{ fontSize: '12px' }}>
                <Mail style={{ width: '11px', height: '11px' }} /> Email
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', marginBottom: '12px' }}>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
            <p className="font-medium text-amber-700" style={{ fontSize: '12px' }}>Vacant — no tenant assigned</p>
          </div>
        )}

        {property.leaseEnd && (
          <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '12px' }}>
            <div className="bg-slate-50 rounded-xl" style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Lease Start</p>
              <p className="font-semibold text-slate-700" style={{ fontSize: '12px' }}>
                {new Date(property.leaseStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="rounded-xl" style={{ padding: '8px', background: ls.bg }}>
              <p className="text-slate-400" style={{ fontSize: '11px' }}>Lease End</p>
              <p className="font-semibold" style={{ fontSize: '12px', color: ls.color }}>
                {new Date(property.leaseEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {daysLeft !== null && daysLeft >= 0 && ` · ${daysLeft}d`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2" style={{ marginBottom: '12px' }}>
          {[
            { label: 'ROI', value: `${roi}%/yr` },
            { label: 'Deposit', value: `$${(property.depositHeld || 0).toLocaleString()}` },
            { label: 'Equity', value: `$${((property.currentValue || 0) - (property.purchasePrice || 0)).toLocaleString()}`, color: '#059669' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-xl text-center" style={{ padding: '8px' }}>
              <p className="text-slate-400" style={{ fontSize: '10px' }}>{s.label}</p>
              <p className="font-semibold" style={{ fontSize: '12px', color: s.color || '#0f172a' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick action links */}
        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '12px' }}>
          <Link to="/documents" className="flex items-center gap-1.5 hover:bg-slate-100 rounded-lg transition-colors" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '7px 10px', fontSize: '12px', color: '#64748b' }}>
            <FolderOpen style={{ width: '12px', height: '12px', color: '#1e3a5f', flexShrink: 0 }} />
            <span className="font-medium">Lease Docs</span>
          </Link>
          <Link to="/maintenance-management" className="flex items-center gap-1.5 hover:bg-slate-100 rounded-lg transition-colors" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '7px 10px', fontSize: '12px', color: '#64748b' }}>
            <Wrench style={{ width: '12px', height: '12px', color: '#f97316', flexShrink: 0 }} />
            <span className="font-medium">Maintenance</span>
          </Link>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(property)} className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" style={{ height: '36px', fontSize: '13px' }}>
            <Edit2 style={{ width: '13px', height: '13px' }} /> Manage
          </button>
          {property.leaseEnd && daysLeft !== null && daysLeft <= 60 && (
            <button className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#d97706', height: '36px', fontSize: '12px' }}>
              <Bell style={{ width: '12px', height: '12px' }} /> Send Renewal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY ROW — list view for many properties
// ═══════════════════════════════════════════════════════════════════════

const PropertyRow = ({ property, onEdit }) => {
  const leaseStatus = getLeaseStatus(property);
  const ls = LEASE_STATUS[leaseStatus];
  const ps = property.paymentStatus ? PAYMENT_STATUS[property.paymentStatus] : null;
  const cashFlow = (property.tenant ? property.monthlyRent : 0) - (property.mortgagePayment || 0);
  const now = new Date();
  const daysLeft = property.leaseEnd ? Math.ceil((new Date(property.leaseEnd) - now) / 86400000) : null;

  return (
    <div className="bg-white flex items-center gap-4 hover:shadow-sm transition-all" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex-shrink-0" style={{ width: '4px', height: '40px', borderRadius: '2px', background: ls.color }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{property.name}</p>
        <p className="text-slate-400 truncate" style={{ fontSize: '12px' }}>{property.address}</p>
      </div>
      <div className="hidden md:block flex-shrink-0 text-center" style={{ minWidth: '80px' }}>
        <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>${property.monthlyRent.toLocaleString()}</p>
        <p className="text-slate-400" style={{ fontSize: '11px' }}>/mo</p>
      </div>
      <div className="hidden lg:block flex-shrink-0 text-center" style={{ minWidth: '80px' }}>
        <p className="font-semibold" style={{ fontSize: '14px', color: cashFlow >= 0 ? '#059669' : '#dc2626' }}>{cashFlow >= 0 ? '+' : ''}${cashFlow.toLocaleString()}</p>
        <p className="text-slate-400" style={{ fontSize: '11px' }}>cash flow</p>
      </div>
      <div className="flex-shrink-0">
        <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: ls.bg, color: ls.color, padding: '3px 10px', border: `1px solid ${ls.border}` }}>{ls.label}</span>
      </div>
      {ps && (
        <div className="hidden sm:block flex-shrink-0">
          <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: ps.bg, color: ps.color, padding: '3px 10px' }}>{ps.label}</span>
        </div>
      )}
      <div className="hidden lg:block flex-shrink-0 text-slate-400" style={{ fontSize: '12px', minWidth: '100px' }}>
        {property.tenant ? property.tenant.name.split(' ')[0] : 'Vacant'}
      </div>
      {daysLeft !== null && daysLeft <= 60 && daysLeft >= 0 && (
        <div className="hidden xl:block flex-shrink-0">
          <span className="font-semibold text-amber-600 bg-amber-100 rounded-full" style={{ fontSize: '11px', padding: '3px 8px' }}>{daysLeft}d left</span>
        </div>
      )}
      <button onClick={() => onEdit(property)} className="flex-shrink-0 font-semibold text-white rounded-xl hover:opacity-90 transition-all" style={{ background: '#1e3a5f', padding: '6px 14px', fontSize: '12px' }}>
        Manage
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// RENT TRACKER
// ═══════════════════════════════════════════════════════════════════════

const RentTracker = ({ properties, onUpdatePayment }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {properties.filter(p => p.tenant).map(property => {
        const ps = PAYMENT_STATUS[property.paymentStatus || 'pending'];
        return (
          <div key={property.id} className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
              <div>
                <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{property.name}</h3>
                <p className="text-slate-400" style={{ fontSize: '13px' }}>{property.tenant.name}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-900" style={{ fontSize: '22px', lineHeight: 1 }}>${property.monthlyRent.toLocaleString()}</p>
                <span className="font-semibold rounded-full" style={{ fontSize: '12px', background: ps.bg, color: ps.color, padding: '3px 10px' }}>{ps.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2" style={{ marginBottom: '16px' }}>
              {Object.entries(PAYMENT_STATUS).map(([key, val]) => (
                <button key={key} onClick={() => onUpdatePayment(property.id, key)}
                  className="font-semibold rounded-xl transition-all" style={{ padding: '8px', fontSize: '12px', background: property.paymentStatus === key ? val.color : val.bg, color: property.paymentStatus === key ? 'white' : val.color }}>
                  {val.label}
                </button>
              ))}
            </div>

            <div>
              <p className="font-medium text-slate-500" style={{ fontSize: '12px', marginBottom: '8px' }}>2026 Payment Tracker</p>
              <div className="grid grid-cols-12 gap-1">
                {months.map((month, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center rounded-md font-bold" style={{
                      height: '32px', fontSize: '11px',
                      background: i < currentMonth ? '#ecfdf5' : i === currentMonth ? (property.paymentStatus === 'paid' ? '#059669' : '#fffbeb') : '#f8fafc',
                      color: i < currentMonth ? '#059669' : i === currentMonth ? (property.paymentStatus === 'paid' ? 'white' : '#f59e0b') : '#cbd5e1',
                    }}>
                      {i < currentMonth ? '✓' : i === currentMonth ? (property.paymentStatus === 'paid' ? '✓' : '·') : '·'}
                    </div>
                    <p className="text-slate-300" style={{ fontSize: '10px', marginTop: '2px' }}>{month[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {property.lastPayment && (
              <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '10px' }}>
                Last payment: {new Date(property.lastPayment).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        );
      })}

      {properties.filter(p => !p.tenant).length > 0 && (
        <div className="rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px' }}>
          <p className="font-semibold text-amber-800 flex items-center gap-2" style={{ fontSize: '14px', marginBottom: '8px' }}>
            <AlertCircle style={{ width: '15px', height: '15px' }} /> Vacant Properties
          </p>
          {properties.filter(p => !p.tenant).map(p => (
            <p key={p.id} className="text-amber-600" style={{ fontSize: '13px' }}>• {p.name} — no tenant assigned. Add a tenant to start tracking rent.</p>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// TAX & COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════

const TaxCompliance = ({ properties }) => {
  const totalRentYTD = properties.reduce((s, p) => s + (p.tenant ? p.monthlyRent * 5 : 0), 0);
  const totalMortgageYTD = properties.reduce((s, p) => s + (p.mortgagePayment || 0) * 5, 0);
  const totalDeposits = properties.reduce((s, p) => s + (p.depositHeld || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Schedule E */}
      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
          <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff' }}>
            <Receipt style={{ width: '20px', height: '20px', color: '#2563eb' }} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>IRS Schedule E Summary</h3>
            <p className="text-slate-400" style={{ fontSize: '13px' }}>Rental income & expense tracker for tax filing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '20px' }}>
          {[
            { label: 'Gross Rental Income (YTD)', value: `$${totalRentYTD.toLocaleString()}`, note: 'Taxable rental income', color: '#059669', bg: '#ecfdf5' },
            { label: 'Deductible Expenses (YTD)', value: `$${totalMortgageYTD.toLocaleString()}`, note: 'Mortgage interest + expenses', color: '#1e3a5f', bg: '#eef2f8' },
            { label: 'Security Deposits Held', value: `$${totalDeposits.toLocaleString()}`, note: 'Not taxable until forfeited', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl" style={{ background: item.bg, padding: '14px' }}>
              <p className="font-medium text-slate-500" style={{ fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
              <p className="font-extrabold" style={{ fontSize: '22px', color: item.color }}>{item.value}</p>
              <p className="text-slate-400" style={{ fontSize: '11px', marginTop: '2px' }}>{item.note}</p>
            </div>
          ))}
        </div>

        <p className="font-semibold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '12px' }}>Deductible Expense Categories</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'Mortgage Interest', note: 'Deductible on Schedule E', ok: true },
            { label: 'Property Insurance', note: 'Fully deductible', ok: true },
            { label: 'Repairs & Maintenance', note: 'Deductible if under $2,500', ok: true },
            { label: 'Property Taxes', note: 'Deductible on Schedule E', ok: true },
            { label: 'Property Management Fees', note: 'Fully deductible', ok: true },
            { label: `Depreciation (27.5 yrs)`, note: `~$${properties.length > 0 ? Math.round(properties[0].purchasePrice * 0.8 / 27.5).toLocaleString() : '10,000'}/yr per property`, ok: true },
            { label: 'Capital Improvements', note: 'Must be capitalized, not expensed', ok: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl" style={{ padding: '10px 14px' }}>
              <div className="flex items-center gap-2">
                {item.ok ? <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669' }} /> : <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b' }} />}
                <span className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{item.label}</span>
              </div>
              <span className="text-slate-400" style={{ fontSize: '12px' }}>{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Depreciation Calculator */}
      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff' }}>
            <BarChart2 style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Depreciation Calculator</h3>
            <p className="text-slate-400" style={{ fontSize: '13px' }}>IRS Pub 946 — Residential rental depreciates over 27.5 years</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {properties.filter(p => p.purchasePrice).map(property => {
            const costBasis = property.purchasePrice * 0.8;
            const annualDepreciation = costBasis / 27.5;
            return (
              <div key={property.id} className="bg-slate-50 rounded-xl" style={{ padding: '14px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                  <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{property.name}</p>
                  <span className="font-bold text-purple-600 bg-purple-100 rounded-full" style={{ fontSize: '12px', padding: '3px 10px' }}>
                    ${Math.round(annualDepreciation).toLocaleString()}/yr
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Purchase Price', value: `$${property.purchasePrice.toLocaleString()}` },
                    { label: 'Cost Basis (80%)', value: `$${Math.round(costBasis).toLocaleString()}` },
                    { label: 'Annual Deduction', value: `$${Math.round(annualDepreciation).toLocaleString()}`, color: '#7c3aed' },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-slate-400" style={{ fontSize: '11px' }}>{s.label}</p>
                      <p className="font-semibold" style={{ fontSize: '13px', color: s.color || '#0f172a', marginTop: '2px' }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-start gap-2 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', marginTop: '12px' }}>
          <AlertTriangle style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
          <p className="text-amber-700" style={{ fontSize: '12px' }}>Depreciation recapture applies when you sell. Consult a tax professional before filing.</p>
        </div>
      </div>

      {/* Georgia Compliance */}
      <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2' }}>
            <Scale style={{ width: '20px', height: '20px', color: '#dc2626' }} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Georgia Landlord Compliance Guide</h3>
            <p className="text-slate-400" style={{ fontSize: '13px' }}>Key legal requirements for Georgia rental properties</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { title: 'Security Deposit', rule: 'Must be held in escrow or surety bond. Return within 30 days of move-out or provide written itemization.', law: 'O.C.G.A. § 44-7-30', status: 'action' },
            { title: 'Lease Renewal Notice', rule: 'Provide 60 days written notice for renewal or termination of annual lease.', law: 'Georgia Landlord-Tenant Law', status: 'info' },
            { title: 'Habitability', rule: 'Maintain safe, sanitary, and habitable conditions. Respond to maintenance requests promptly.', law: 'O.C.G.A. § 44-7-13', status: 'info' },
            { title: 'Fair Housing', rule: 'Cannot discriminate based on race, color, religion, sex, national origin, disability, or familial status.', law: 'HUD Title VIII', status: 'info' },
            { title: 'Eviction Process', rule: "Must file dispossessory warrant with Magistrate Court. Cannot self-help evict.", law: 'O.C.G.A. § 44-7-50', status: 'warning' },
            { title: 'Lead Paint Disclosure', rule: 'Required for properties built before 1978. Must provide EPA pamphlet.', law: 'Federal 42 U.S.C. § 4852d', status: 'action' },
          ].map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-4 rounded-xl" style={{
              padding: '12px 14px',
              background: item.status === 'warning' ? '#fef2f2' : item.status === 'action' ? '#fffbeb' : '#f8fafc',
              border: `1px solid ${item.status === 'warning' ? '#fecaca' : item.status === 'action' ? '#fde68a' : '#e2e8f0'}`,
            }}>
              <div className="flex-1">
                <p className="font-semibold text-slate-900" style={{ fontSize: '13px', marginBottom: '3px' }}>{item.title}</p>
                <p className="text-slate-500" style={{ fontSize: '12px', lineHeight: '1.5' }}>{item.rule}</p>
              </div>
              <span className="font-semibold rounded-lg flex-shrink-0" style={{
                fontSize: '11px', padding: '3px 8px',
                background: item.status === 'warning' ? '#fee2e2' : item.status === 'action' ? '#fef3c7' : '#e2e8f0',
                color: item.status === 'warning' ? '#dc2626' : item.status === 'action' ? '#d97706' : '#64748b',
              }}>{item.law}</span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 12px', marginTop: '12px' }}>
          <BookOpen style={{ width: '13px', height: '13px', color: '#2563eb', flexShrink: 0, marginTop: '1px' }} />
          <p className="text-blue-700" style={{ fontSize: '12px' }}>This is general guidance only and not legal advice. Laws change frequently. Consult a Georgia real estate attorney for specific situations.</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ADD PROPERTY MODAL
// ═══════════════════════════════════════════════════════════════════════

const AddPropertyModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', address: '', bedrooms: '', bathrooms: '', sqft: '',
    monthlyRent: '', deposit: '', purchasePrice: '', currentValue: '', mortgagePayment: '', purchaseYear: '',
    tenantName: '', tenantPhone: '', tenantEmail: '', leaseStart: '', leaseEnd: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Rental Property</DialogTitle>
          <p className="text-slate-500 text-sm">Track tenants, leases, rent payments, and tax info in one place.</p>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Property Details</p>
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

          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Financial Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'monthlyRent', label: 'Monthly Rent' },
                { key: 'deposit', label: 'Security Deposit' },
                { key: 'mortgagePayment', label: 'Mortgage Payment' },
                { key: 'purchasePrice', label: 'Purchase Price' },
                { key: 'currentValue', label: 'Current Value' },
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

          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '10px' }}>Tenant Information (optional)</p>
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
            <Button onClick={() => {
              onSave({ ...form, id: Date.now(), monthlyRent: parseFloat(form.monthlyRent) || 0, deposit: parseFloat(form.deposit) || 0, depositHeld: parseFloat(form.deposit) || 0, mortgagePayment: parseFloat(form.mortgagePayment) || 0, purchasePrice: parseFloat(form.purchasePrice) || 0, currentValue: parseFloat(form.currentValue) || 0, bedrooms: parseInt(form.bedrooms) || 0, bathrooms: parseInt(form.bathrooms) || 0, sqft: parseInt(form.sqft) || 0, tenant: form.tenantName ? { name: form.tenantName, phone: form.tenantPhone, email: form.tenantEmail } : null, paymentStatus: form.tenantName ? 'pending' : null, maintenanceOpen: 0 });
              onClose();
            }} disabled={!form.name} className="flex-1 h-12 rounded-xl font-bold text-white" style={{ background: '#1e3a5f' }}>
              Add Property
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const RentalPropertiesPage = () => {
  const [properties, setProperties] = useState(SAMPLE_PROPERTIES);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const handleUpdatePayment = (id, status) => {
    setProperties(prev => prev.map(p => p.id === id ? {
      ...p, paymentStatus: status,
      lastPayment: status === 'paid' ? new Date().toISOString().split('T')[0] : p.lastPayment
    } : p));
  };

  const filtered = useMemo(() => {
    let list = properties.filter(p => {
      const matchSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tenant?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const status = getLeaseStatus(p);
      const matchStatus = filterStatus === 'all' || status === filterStatus ||
        (filterStatus === 'overdue' && p.paymentStatus === 'overdue');
      return matchSearch && matchStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'rent') return b.monthlyRent - a.monthlyRent;
      if (sortBy === 'cashflow') return ((b.tenant ? b.monthlyRent : 0) - b.mortgagePayment) - ((a.tenant ? a.monthlyRent : 0) - a.mortgagePayment);
      if (sortBy === 'status') return getLeaseStatus(a).localeCompare(getLeaseStatus(b));
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [properties, searchQuery, filterStatus, sortBy]);

  // Auto switch to list view for many properties
  const effectiveView = properties.length >= 6 ? viewMode : viewMode;

  return (
    <>
      <Helmet><title>Rental Properties — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Rental Properties</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf2f8' }}>
                <Key style={{ width: '24px', height: '24px', color: '#db2777' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Rental Properties</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} · {properties.filter(p => p.tenant).length} occupied
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '10px 16px', fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} /> Export
              </button>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px' }}>
                <Plus style={{ width: '16px', height: '16px' }} /> Add Property
              </button>
            </div>
          </div>
        </div>

        <PortfolioSummary properties={properties} />

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px', marginBottom: '24px' }}>
          {[
            { key: 'overview', label: '🏠 Properties' },
            { key: 'rent', label: '💰 Rent Tracker' },
            { key: 'tax', label: '📊 Tax & Compliance' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="font-medium rounded-xl transition-all whitespace-nowrap"
              style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Search + Filter + View + Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '20px' }}>
              <div className="relative flex-1">
                <Search style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <Input placeholder="Search by name, address, or tenant…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-11 rounded-xl" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
                <option value="all">All Properties</option>
                <option value="active">Active Leases</option>
                <option value="expiring">Expiring Soon</option>
                <option value="vacant">Vacant</option>
                <option value="overdue">Overdue Rent</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white">
                <option value="name">Sort: Name</option>
                <option value="rent">Sort: Highest Rent</option>
                <option value="cashflow">Sort: Cash Flow</option>
                <option value="status">Sort: Status</option>
              </select>
              {/* Grid / List toggle */}
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className="flex items-center justify-center rounded-lg transition-all" style={{ width: '36px', height: '36px', background: viewMode === 'grid' ? 'white' : 'transparent' }}>
                  <LayoutGrid style={{ width: '15px', height: '15px', color: viewMode === 'grid' ? '#1e3a5f' : '#94a3b8' }} />
                </button>
                <button onClick={() => setViewMode('list')} className="flex items-center justify-center rounded-lg transition-all" style={{ width: '36px', height: '36px', background: viewMode === 'list' ? 'white' : 'transparent' }}>
                  <List style={{ width: '15px', height: '15px', color: viewMode === 'list' ? '#1e3a5f' : '#94a3b8' }} />
                </button>
              </div>
            </div>

            {/* Results count */}
            <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '16px' }}>
              {filtered.length} of {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              {searchQuery || filterStatus !== 'all' ? ' matching filters' : ''}
            </p>

            {filtered.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
                <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No properties match your filters.</p>
                <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="text-blue-500 hover:text-blue-700 transition-colors" style={{ fontSize: '13px' }}>Clear filters</button>
              </div>
            ) : effectiveView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map(p => <PropertyCard key={p.id} property={p} onEdit={setEditingProperty} onDelete={id => setProperties(prev => prev.filter(p => p.id !== id))} />)}
                <button onClick={() => setShowAddModal(true)} className="bg-white flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-md transition-all group" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', minHeight: '200px' }}>
                  <div className="flex items-center justify-center rounded-2xl bg-slate-100 group-hover:bg-slate-200 transition-colors" style={{ width: '48px', height: '48px', marginBottom: '12px' }}>
                    <Plus style={{ width: '22px', height: '22px' }} />
                  </div>
                  <p className="font-semibold" style={{ fontSize: '15px' }}>Add Rental Property</p>
                  <p className="text-slate-300" style={{ fontSize: '13px', marginTop: '4px' }}>Track tenants, leases & payments</p>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* List header */}
                <div className="grid items-center text-slate-400 font-semibold uppercase tracking-wide" style={{ padding: '0 16px', fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 80px 80px 120px 120px 100px 100px', gap: '16px' }}>
                  <span>Property</span>
                  <span className="hidden md:block text-right">Rent</span>
                  <span className="hidden lg:block text-right">Cash Flow</span>
                  <span>Status</span>
                  <span className="hidden sm:block">Rent Status</span>
                  <span className="hidden lg:block">Tenant</span>
                  <span />
                </div>
                {filtered.map(p => <PropertyRow key={p.id} property={p} onEdit={setEditingProperty} />)}
                <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 font-semibold text-slate-400 hover:text-slate-600 bg-white hover:shadow-sm transition-all rounded-xl" style={{ border: '2px dashed #e2e8f0', padding: '14px', fontSize: '14px' }}>
                  <Plus style={{ width: '16px', height: '16px' }} /> Add Rental Property
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'rent' && <RentTracker properties={properties} onUpdatePayment={handleUpdatePayment} />}
        {activeTab === 'tax' && <TaxCompliance properties={properties} />}
      </div>

      <AddPropertyModal open={showAddModal} onClose={() => setShowAddModal(false)} onSave={p => setProperties(prev => [...prev, p])} />
    </>
  );
};

export default RentalPropertiesPage;
