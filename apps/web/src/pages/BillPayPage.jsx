import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useHome } from '@/contexts/HomeContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import {
  Plus, CreditCard, LayoutGrid, Search, BookOpen,
  AlertCircle, CheckCircle2, Clock, DollarSign, Zap,
  Bell, ChevronRight, Download, BarChart2,
  Droplets, Wifi, Car, Shield, TrendingDown, Repeat, Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

import AddServiceCompanyForm from '@/components/AddServiceCompanyForm.jsx';
import ServiceCompanyCard from '@/components/ServiceCompanyCard.jsx';
import PaymentHistoryTab from '@/components/PaymentHistoryTab.jsx';
import UtilityCompanyListing from '@/components/UtilityCompanyListing.jsx';
import PendingReviewSection from '@/components/PendingReviewSection.jsx';
import AddBillButton from '@/components/AddBillButton.jsx';
import CashNeedsTab from '@/components/CashNeedsTab.jsx';
import BillerConnectChecklist from '@/components/BillerConnectChecklist.jsx';

// The label for the no-property bucket. Bills that aren't tied to any home
// (car, phone, subscriptions) live here so they still get tracked, grouped,
// and counted. This is a BILL-PAY-LOCAL concept — deliberately NOT a home in
// the global HomeSwitcher, which stays purely about properties.
const OTHER_BILLS_LABEL = 'Other bills';
const NEEDS_PLACEMENT_LABEL = 'Needs placement';

// Money formatters with thousands separators (1,604 — never 1604).
// Money rule: summaries/aggregates round to whole dollars; individual bill
// amounts keep two decimals. Both always comma-grouped.
const dollars0 = (n) => `$${Math.round(parseFloat(n) || 0).toLocaleString('en-US')}`;
const dollars2 = (n) => `$${(parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// placement distinguishes three states, two of which carry an empty homeId:
//   'property'   → tied to a real home (homeId set)
//   'other'      → deliberately not a property bill — settled, lives under
//                  "Other bills", no nag
//   'unassigned' → confirmed but not yet placed — a real to-do, lives under
//                  "Needs placement" and shows the amber reassign control
// LEGACY FALLBACK: bills written before this field existed have no placement.
// Infer it from homeId so old data behaves exactly as before until touched:
// a home → 'property'; no home → 'unassigned' (the old amber-flag behavior).
const placementOf = (c) => {
  if (c && c.placement) return c.placement;
  return c && c.homeId ? 'property' : 'unassigned';
};

// Time-frame options for how far back the paid/history section reaches.
const TIMEFRAMES = [
  { label: '45 days', days: 45 },
  { label: '90 days', days: 90 },
  { label: '180 days', days: 180 },
  { label: 'All', days: null },
];

// ═══════════════════════════════════════════════════════════════════════
// CONDENSED SUMMARY STRIP
// Slim, single row: Total Due, Overdue, Providers, Quick Pay Ready.
// ═══════════════════════════════════════════════════════════════════════

const SummaryStrip = ({ companies, allInScope }) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Every stat derives from the all-open set (not paid, not cleared, incl. in
  // review) so My Bills ties to the dashboard and Cash Needs. Falls back to the
  // confirmed list if the wider set wasn't passed.
  const src = allInScope || companies;
  const totalDue = src.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const overdue = src.filter(c => {
    if (!c.dueDate) return false;
    const due = new Date(c.dueDate); due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
  const providers = src.length;
  const dueThisWeek = src.filter(c => {
    if (!c.dueDate) return false;
    const d = new Date(c.dueDate);
    return d >= today && d <= in7;
  }).length;

  const stats = [
    { label: 'Total Due', value: dollars0(totalDue), color: '#1e3a5f' },
    { label: 'Overdue', value: overdue, color: overdue > 0 ? '#dc2626' : '#059669' },
    { label: 'Due This Week', value: dueThisWeek, color: dueThisWeek > 0 ? '#f59e0b' : '#059669' },
    { label: 'Providers', value: providers, color: '#5b6472' },
  ];

  return (
    <div className="bg-white grid grid-cols-2 sm:grid-cols-4" style={{ borderRadius: '12px', border: '1px solid #e9e4db', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: '14px 18px', borderRight: i < 3 ? '1px solid #f1f5f9' : 'none', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }} className="sm:border-b-0">
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '10px', marginBottom: '2px' }}>{s.label}</p>
          <p className="font-extrabold" style={{ fontSize: '20px', lineHeight: 1, color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// UPCOMING DRAFTS / DUE STRIP
// ═══════════════════════════════════════════════════════════════════════

const UpcomingStrip = ({ companies }) => {
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isAuto = (c) => c.paymentType === 'Autopay (card)' || c.paymentType === 'Autopay (bank)';

  const upcoming = companies
    .filter(c => c.dueDate && new Date(c.dueDate) >= today && new Date(c.dueDate) <= in30)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (upcoming.length === 0) return null;

  const total = upcoming.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const autoTotal = upcoming.filter(isAuto).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #ddd6fe', padding: '16px 18px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <TrendingDown style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
          <h3 className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>Leaving your accounts — next 30 days</h3>
        </div>
        <div className="text-right">
          <span className="font-extrabold text-slate-900" style={{ fontSize: '18px' }}>{dollars2(total)}</span>
          {autoTotal > 0 && (
            <span className="text-slate-400" style={{ fontSize: '12px', marginLeft: '6px' }}>
              ({dollars2(autoTotal)} autopay)
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {upcoming.map(c => {
          const auto = isAuto(c);
          const d = new Date(c.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div key={c.id} className="flex items-center justify-between" style={{ fontSize: '13px', padding: '3px 0' }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium flex items-center gap-1 flex-shrink-0" style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  borderRadius: '5px',
                  padding: '1px 6px',
                  color: auto ? '#7c3aed' : '#475569',
                  background: auto ? '#f5f3ff' : '#f1f5f9',
                  minWidth: '54px',
                  justifyContent: 'center',
                }}>
                  {auto ? <><Repeat style={{ width: '10px', height: '10px' }} /> Auto</> : 'Manual'}
                </span>
                <span className="text-slate-700 truncate">{c.companyName}</span>
                <span className="text-slate-400 flex-shrink-0">{auto ? `drafts ~${d}` : `due ${d}`}</span>
              </div>
              <span className="font-semibold text-slate-900 flex-shrink-0">
                {typeof c.amount === 'number' ? dollars2(c.amount) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// One compact line for overdue / due-soon, or an all-clear line.
// ═══════════════════════════════════════════════════════════════════════

const AttentionStrip = ({ companies }) => {
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const overdue = companies.filter(c => c.dueDate && new Date(c.dueDate) < today);
  const dueSoon = companies.filter(c => {
    if (!c.dueDate) return false;
    const d = new Date(c.dueDate);
    return d >= today && d <= in7Days;
  });

  if (overdue.length === 0 && dueSoon.length === 0) {
    return (
      <div className="flex items-center gap-2" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px' }}>
        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669' }} />
        <p className="font-medium text-green-800" style={{ fontSize: '13px' }}>All caught up — nothing due in the next 7 days.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px' }}>
      <div className="flex items-center gap-2">
        <Bell style={{ width: '16px', height: '16px', color: '#f97316' }} />
        <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>Needs attention:</p>
      </div>
      {overdue.length > 0 && (
        <span className="font-medium text-red-600" style={{ fontSize: '13px' }}>
          {overdue.length} overdue
        </span>
      )}
      {dueSoon.length > 0 && (
        <span className="font-medium text-amber-700" style={{ fontSize: '13px' }}>
          {dueSoon.length} due within 7 days
        </span>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// NEXT BILL DUE — slim line
// ═══════════════════════════════════════════════════════════════════════

const NextBillDue = ({ companies }) => {
  const today = new Date();
  const upcoming = companies
    .filter(c => c.dueDate && new Date(c.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const daysUntil = Math.ceil((new Date(next.dueDate) - today) / 86400000);

  return (
    <div className="flex items-center gap-3 bg-white" style={{ borderRadius: '10px', border: '1px solid #bfdbfe', padding: '10px 16px', marginBottom: '24px' }}>
      <Clock style={{ width: '16px', height: '16px', color: '#2563eb', flexShrink: 0 }} />
      <p className="text-slate-600" style={{ fontSize: '13px' }}>
        <span className="text-slate-400">Next due:</span>{' '}
        <span className="font-semibold text-slate-900">{next.companyName}</span>
        {' '}in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
        {next.amount && ` · ${dollars2(next.amount)}`}
      </p>
      {next.paymentLink && (
        <button className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-auto" style={{ fontSize: '13px' }}
          onClick={() => window.open(next.paymentLink, '_blank', 'noopener,noreferrer')}>
          Pay →
        </button>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// OVERVIEW — Category Breakdown + Annual Spend (lives in its own tab)
// ═══════════════════════════════════════════════════════════════════════

const CategoryBreakdown = ({ companies }) => {
  const categories = [
    { name: 'Electric', icon: Zap, color: '#d97706', bg: '#fffbeb', keywords: ['electric', 'power', 'energy', 'utility'] },
    { name: 'Water', icon: Droplets, color: '#0891b2', bg: '#ecfeff', keywords: ['water', 'sewer', 'waste'] },
    { name: 'Internet', icon: Wifi, color: '#7c3aed', bg: '#f5f3ff', keywords: ['internet', 'cable', 'comcast', 'att', 'verizon', 'xfinity'] },
    { name: 'Insurance', icon: Shield, color: '#059669', bg: '#ecfdf5', keywords: ['insurance', 'allstate', 'state farm', 'geico', 'progressive'] },
    { name: 'Auto', icon: Car, color: '#2563eb', bg: '#eff6ff', keywords: ['auto', 'car', 'vehicle', 'loan'] },
    { name: 'Other', icon: CreditCard, color: '#64748b', bg: '#faf8f4', keywords: [] },
  ];

  const getCategoryTotal = (cat) => {
    return companies.filter(c => {
      const name = c.companyName?.toLowerCase() || '';
      if (cat.name === 'Other') {
        return !categories.slice(0, -1).some(other => other.keywords.some(k => name.includes(k)));
      }
      return cat.keywords.some(k => name.includes(k));
    }).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  };

  const total = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px', marginBottom: '16px' }}>Spending by Category</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const amount = getCategoryTotal(cat);
          if (amount === 0) return null;
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px', background: cat.bg }}>
                <Icon style={{ width: '15px', height: '15px', color: cat.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                  <p className="font-medium text-slate-700" style={{ fontSize: '13px' }}>{cat.name}</p>
                  <p className="font-semibold text-slate-900" style={{ fontSize: '13px' }}>{dollars0(amount)} <span className="text-slate-400 font-normal">({pct}%)</span></p>
                </div>
                <div className="bg-slate-100 rounded-full" style={{ height: '6px' }}>
                  <div className="rounded-full transition-all" style={{ width: `${pct}%`, height: '6px', background: cat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnnualSpendSummary = ({ companies }) => {
  const monthly = companies.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const annual = monthly * 12;

  return (
    <div className="flex flex-col gap-4">
      {[
        { label: 'Monthly Total', value: dollars0(monthly), sub: 'Current month estimate', color: '#1e3a5f' },
        { label: 'Annual Projection', value: `$${annual.toLocaleString()}`, sub: 'Based on current bills', color: '#059669' },
        { label: 'Avg per Bill', value: companies.length > 0 ? dollars0(monthly / companies.length) : '$0', sub: `Across ${companies.length} providers`, color: '#7c3aed' },
      ].map((s, i) => (
        <div key={i} className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-slate-400 font-medium uppercase tracking-wide" style={{ fontSize: '11px', marginBottom: '6px' }}>{s.label}</p>
          <p className="font-extrabold" style={{ fontSize: '26px', lineHeight: 1, color: s.color }}>{s.value}</p>
          <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY GROUP — used in All-Properties mode to batch a flat bill list
// under per-property headers with a subtotal. The no-property bills group
// under the "Other bills" header (was "Unassigned").
// ═══════════════════════════════════════════════════════════════════════

const OTHER_KEY = '__other__';
const NEEDS_KEY = '__needs__';

const PropertyGroupedList = ({ companies, homeName, renderCard }) => {
  // Bucket bills by homeId. Empty-homeId bills split by placement: settled
  // "Other bills" vs still-unplaced "Needs placement".
  const groups = {};
  for (const c of companies) {
    let key;
    const p = placementOf(c);
    if (c.homeId && p === 'property') key = c.homeId;
    else if (p === 'other') key = OTHER_KEY;
    else key = NEEDS_KEY; // 'unassigned' or any legacy no-home bill
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }

  // Real properties first (any non-bucket key), each its own header + subtotal.
  const propertyKeys = Object.keys(groups).filter(k => k !== OTHER_KEY && k !== NEEDS_KEY);
  const otherBills = groups[OTHER_KEY] || [];
  const needsBills = groups[NEEDS_KEY] || [];
  // The two no-property buckets live under ONE persistent "Other & unassigned"
  // section, so assigning a bill from Needs placement → Other moves it between
  // two visible sub-rows in the SAME section rather than appearing to vanish.
  const hasUnplaced = otherBills.length > 0 || needsBills.length > 0;
  const unplacedSubtotal = [...otherBills, ...needsBills]
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  const sumOf = (arr) => arr.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Real properties — one header + subtotal each. */}
      {propertyKeys.map(key => {
        const bills = groups[key];
        return (
          <div key={key}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <span className="font-semibold flex items-center gap-1.5" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#334155' }}>
                {homeName(key) || 'Property'} <span className="text-slate-400 font-normal">({bills.length})</span>
              </span>
              <span className="font-bold text-slate-900" style={{ fontSize: '13px' }}>{dollars2(sumOf(bills))}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bills.map(renderCard)}
            </div>
          </div>
        );
      })}

      {/* Other & unassigned — one section, two sub-groups. Persistent banner so
          moving a bill between "Other bills" and "Needs placement" stays in view. */}
      {hasUnplaced && (
        <div style={{ border: '1px solid #e9e4db', borderRadius: '12px', padding: '14px 0', background: '#fcfbf9' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '12px', padding: '0 14px' }}>
            <span className="font-semibold flex items-center gap-1.5" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.03em', color: '#5b6472' }}>
              <Package style={{ width: '13px', height: '13px', color: '#95a0ae' }} />
              Other &amp; unassigned <span className="text-slate-400 font-normal">({otherBills.length + needsBills.length})</span>
            </span>
            <span className="font-bold text-slate-900" style={{ fontSize: '13px' }}>{dollars2(unplacedSubtotal)}</span>
          </div>

          {/* Sub-group: Other bills (settled — not a property, on purpose). */}
          {otherBills.length > 0 && (
            <div style={{ marginBottom: needsBills.length > 0 ? '16px' : 0 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px', padding: '0 14px' }}>
                <span className="font-medium" style={{ fontSize: '12px', color: '#5b6472' }}>
                  {OTHER_BILLS_LABEL} <span className="text-slate-400">({otherBills.length})</span>
                </span>
                <span className="font-semibold text-slate-700" style={{ fontSize: '12px' }}>{dollars2(sumOf(otherBills))}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {otherBills.map(renderCard)}
              </div>
            </div>
          )}

          {/* Sub-group: Needs placement (a real to-do — amber). */}
          {needsBills.length > 0 && (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px', padding: '0 14px' }}>
                <span className="font-medium" style={{ fontSize: '12px', color: '#b45309' }}>
                  {NEEDS_PLACEMENT_LABEL} <span className="opacity-70">({needsBills.length})</span>
                </span>
                <span className="font-semibold" style={{ fontSize: '12px', color: '#b45309' }}>{dollars2(sumOf(needsBills))}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {needsBills.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SCOPE TOGGLE — Bill-Pay-local control: This property / All properties /
// non-property bills. Local to this page; does NOT touch the global
// HomeSwitcher, which stays purely about properties by design.
// ═══════════════════════════════════════════════════════════════════════

// On a specific home, a quiet way to peek at the bills that aren't on a
// property — BOTH "Other bills" (settled) and "Needs placement" (to-do). The
// grouped list inside this scope shows them as two separate headered sections,
// so one toggle surfaces both buckets the property dropdown can't express.
// In All-Properties mode this renders nothing (everything's already shown).
const OtherBillsPeek = ({ scope, onEnterOther, onExitOther, selectedHome, allProperties }) => {
  if (allProperties) return null; // All Properties already includes these buckets

  const homeLabel = selectedHome ? (selectedHome.name || selectedHome.address || 'this property') : 'this property';

  if (scope === 'other') {
    return (
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl" style={{ padding: '6px 12px' }}>
        <Package style={{ width: '14px', height: '14px', color: '#5b6472' }} />
        <span className="font-medium" style={{ fontSize: '12px', color: '#1f2733' }}>Viewing: Other &amp; unassigned</span>
        <button onClick={onExitOther}
          className="font-semibold hover:opacity-70 transition-opacity"
          style={{ fontSize: '12px', color: '#1e3a5f' }}>
          ← Back to {homeLabel}
        </button>
      </div>
    );
  }

  return (
    <button onClick={onEnterOther}
      className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl font-medium hover:border-slate-300 transition-colors"
      style={{ padding: '7px 12px', fontSize: '12px', color: '#5b6472' }}>
      <Package style={{ width: '14px', height: '14px' }} />
      Other &amp; unassigned bills
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PAST-DUE PENDING ROW — a past-due bill that's still unreviewed.
// Past due takes precedence, so it lives in the Past Due section (not Bills
// to Review). But it can't be PAID yet — the amount is unverified — so instead
// of "Pay Bill" it offers "Review", which opens an inline edit panel right
// here (company / amount / due date / category / property) and confirms in
// place. Self-contained so the bill shows exactly once.
// ═══════════════════════════════════════════════════════════════════════
const PastDuePendingRow = ({ bill, homes, multiHome, onConfirmed }) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    companyName: bill.companyName || '',
    amount: typeof bill.amount === 'number' ? String(bill.amount) : '',
    dueDate: bill.dueDate ? String(bill.dueDate).slice(0, 10) : '',
    category: bill.category || '',
    homeId: bill.homeId || (homes && homes.length === 1 ? homes[0].id : ''),
    paymentType: bill.paymentType || 'Manual',
  });

  const upd = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const dueStr = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const saveConfirm = async () => {
    const name = draft.companyName.trim();
    if (!name) { toast({ title: 'Add a company name', variant: 'destructive' }); return; }
    let amt;
    if (draft.amount.trim() !== '') {
      amt = parseFloat(draft.amount);
      if (isNaN(amt)) { toast({ title: 'Amount must be a number', variant: 'destructive' }); return; }
    }
    // Multi-home users must place it (property, Other, or leave unassigned).
    const choseOther = draft.homeId === '__other__';
    const choseUnassigned = draft.homeId === '__unassigned__';
    const realHome = draft.homeId && !choseOther && !choseUnassigned ? draft.homeId : '';
    if (multiHome && !realHome && !choseOther && !choseUnassigned) {
      toast({ title: 'Pick a property', description: 'Choose a property, Other bills, or leave unassigned.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        companyName: name,
        dueDate: draft.dueDate || null,
        category: draft.category || null,
        status: 'confirmed',
      };
      if (amt !== undefined) payload.amount = amt;
      if (draft.paymentType) payload.paymentType = draft.paymentType;
      if (realHome) { payload.homeId = realHome; payload.placement = 'property'; }
      else if (choseOther) { payload.homeId = ''; payload.placement = 'other'; }
      else if (choseUnassigned) { payload.homeId = ''; payload.placement = 'unassigned'; }
      await pb.collection('invoices').update(bill.id, payload, { $autoCancel: false });
      toast({ title: 'Bill confirmed', description: `${name} is ready to pay.` });
      if (onConfirmed) onConfirmed();
    } catch (e) {
      toast({ title: 'Could not confirm', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fieldLabel = { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' };
  const fieldInput = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#0f172a', background: '#fff', outline: 'none' };

  return (
    <div className="bg-white" style={{ borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626', padding: '14px 16px' }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{bill.companyName || 'Unknown'}</p>
            <span className="flex items-center gap-1 font-semibold" style={{ fontSize: '11px', color: '#dc2626', background: 'rgba(220,38,38,0.10)', borderRadius: '6px', padding: '1px 8px' }}>
              <AlertCircle style={{ width: '11px', height: '11px' }} /> Past due
            </span>
            <span className="font-medium" style={{ fontSize: '11px', color: '#b45309', background: '#fef3c7', borderRadius: '6px', padding: '1px 8px' }}>Not reviewed yet</span>
          </div>
          <p className="text-slate-500" style={{ fontSize: '12.5px', marginTop: '3px' }}>
            {typeof bill.amount === 'number' ? dollars2(bill.amount) : 'No amount'}{dueStr ? ` · Due ${dueStr}` : ''}{bill.category ? ` · ${bill.category}` : ''}
          </p>
        </div>
        {!editing && (
          // Mirror ServiceCompanyCard's action geometry so the Review button's
          // right edge lines up with the Pay Bill / Mark as Paid pills when
          // confirmed and unreviewed past-due rows stack: a fixed 170px
          // right-aligned primary slot + a reserved 72px (the card's hover
          // edit/delete tools slot) with an 8px gap. No tools live here, but
          // the spacer keeps the column consistent down the list.
          <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
            <div className="flex items-center" style={{ width: '170px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 font-semibold rounded-lg"
                style={{ border: '1px solid #1e3a5f', color: '#1e3a5f', padding: '7px 14px', fontSize: '13px', background: '#fff' }}>
                Review
              </button>
            </div>
            <div style={{ width: '72px' }} aria-hidden="true" />
          </div>
        )}
      </div>

      {editing && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #f0ece4', paddingTop: '12px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={fieldLabel}>Company</label>
              <input type="text" value={draft.companyName} onChange={(e) => upd('companyName', e.target.value)} style={fieldInput} />
            </div>
            <div>
              <label style={fieldLabel}>Amount</label>
              <input type="text" inputMode="decimal" value={draft.amount} onChange={(e) => upd('amount', e.target.value)} style={fieldInput} placeholder="0.00" />
            </div>
            <div>
              <label style={fieldLabel}>Due date</label>
              <input type="date" value={draft.dueDate} onChange={(e) => upd('dueDate', e.target.value)} style={fieldInput} />
            </div>
            <div>
              <label style={fieldLabel}>Category</label>
              <input type="text" value={draft.category} onChange={(e) => upd('category', e.target.value)} style={fieldInput} placeholder="e.g. Electric" />
            </div>
            <div>
              <label style={fieldLabel}>How it's paid</label>
              <select value={draft.paymentType} onChange={(e) => upd('paymentType', e.target.value)} style={fieldInput}>
                <option value="Manual">Manual</option>
                <option value="Autopay (bank)">Autopay (bank)</option>
                <option value="Autopay (card)">Autopay (card)</option>
              </select>
            </div>
            {multiHome && (
              <div className="sm:col-span-2">
                <label style={fieldLabel}>Belongs to {!draft.homeId && <span style={{ color: '#dc2626' }}>• needed</span>}</label>
                <select value={draft.homeId} onChange={(e) => upd('homeId', e.target.value)}
                  style={{ ...fieldInput, border: draft.homeId ? fieldInput.border : '1px solid #dc2626' }}>
                  <option value="">— Choose —</option>
                  <optgroup label="Properties">
                    {homes.map(h => <option key={h.id} value={h.id}>{h.name || h.address || 'Property'}</option>)}
                  </optgroup>
                  <optgroup label="Not a property bill">
                    <option value="__other__">Other bills — not tied to a property</option>
                  </optgroup>
                  <optgroup label="Not sure yet">
                    <option value="__unassigned__">Leave unassigned for now</option>
                  </optgroup>
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
            <button onClick={saveConfirm} disabled={saving}
              className="font-semibold text-white rounded-lg"
              style={{ background: '#1e3a5f', padding: '8px 16px', fontSize: '13px', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save & confirm'}
            </button>
            <button onClick={() => setEditing(false)} disabled={saving}
              className="font-medium rounded-lg" style={{ color: '#5b6472', padding: '8px 12px', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const BillPayPage = () => {
  const { currentUser } = useAuth();
  const { selectedHome, homes, allProperties, otherScope, switchHome, viewOther } = useHome();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [timeframeDays, setTimeframeDays] = useState(90); // default 90; null = All
  const utilityListingRef = useRef(null);

  const multiHome = (homes || []).length > 1;

  // Read an incoming scope hint from the URL. The dashboard's "Other &
  // unassigned" tile links here with ?scope=other so the page lands filtered
  // to exactly the no-property bills — the same way a home tile lands scoped
  // to that home. Read once for the initial scope; cleared after consumption
  // so it doesn't pin the view if the user later switches properties.
  const [searchParams, setSearchParams] = useSearchParams();
  const incomingScope = searchParams.get('scope');

  // ── Bill-Pay-local scope ──
  // 'property' = selected home's bills · 'all' = every property · 'other' =
  // the no-property "Other & unassigned" bucket. Seeded from GLOBAL context:
  // the otherScope flag (set by the dropdown item or the dashboard tile) wins,
  // then all-properties, else the selected home. Kept locally so the page can
  // also flip scope via its own in-page peek control.
  const [scope, setScope] = useState(
    (incomingScope === 'other' || otherScope)
      ? 'other'
      : (allProperties && multiHome ? 'all' : 'property')
  );

  // Consume the URL hint once: an incoming ?scope=other becomes the GLOBAL
  // Other scope (so the property dropdown shows "Other & unassigned" too), then
  // we strip the param so it doesn't pin the view or clutter the URL.
  useEffect(() => {
    if (incomingScope) {
      if (incomingScope === 'other') {
        viewOther(); // global flag → dropdown label + Bill Pay filter agree
      }
      const next = new URLSearchParams(searchParams);
      next.delete('scope');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── All-properties view preference ──
  // In All-Properties mode the default is grouped-by-bucket (each property and
  // Other bills under its own header) — that's the whole point of that mode.
  // The toggle lets someone switch to a flat, status-sectioned read instead.
  //   'property' = grouped under per-property/bucket headers (default in 'all')
  //   'status'   = flat, sectioned by Past Due / Ready to Pay / …
  const [groupBy, setGroupBy] = useState('property');

  // Keep local scope in step with the global property selector. The global
  // flags are the source of truth: otherScope → 'other', all-properties →
  // 'all', a real home → 'property'. (The in-page peek control flips scope by
  // calling the same global setters, so this effect carries those through too.)
  useEffect(() => {
    if (otherScope) { setScope('other'); return; }
    if (allProperties && multiHome) { setScope('all'); return; }
    setScope('property');
  }, [otherScope, allProperties, multiHome]);

  // Quick lookup: homeId → home name, for property tags on rows.
  const homeName = (id) => {
    const h = (homes || []).find(x => x.id === id);
    return h ? (h.name || h.address || 'Property') : null;
  };

  const fetchCompanies = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const records = await pb.collection('invoices').getFullList({
        batch: 500, filter: `ownerId="${currentUser.id}"`, sort: 'companyName',
        expand: 'vendorId', $autoCancel: false
      });
      // Flatten the vendor's pay URL onto each invoice as `paymentLink` so the
      // card and pay buttons keep reading a single field. The pay URL now lives
      // on the vendor (stable), resolved here through the expanded relation.
      const flattened = records.map((r) => {
        const vendor = r.expand && r.expand.vendorId ? r.expand.vendorId : null;
        // paymentLink + senderDomain flattened from the vendor so the card reads
        // single fields. senderDomain feeds the "Add payment link" finder's
        // fallback guess when an invoice's own senderAddress is empty.
        return { ...r, paymentLink: vendor ? (vendor.payUrl || '') : '', senderDomain: vendor ? (vendor.senderDomain || '') : '' };
      });
      // Show every invoice. (The old collapse-by-companyName was a workaround
      // from when each monthly bill was its own row sharing a name; the clean
      // vendor/invoice split makes that collapsing wrong — each invoice is real.)
      setCompanies(flattened);
    } catch {
      toast({ title: 'Failed to load bills', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [currentUser]);

  const handleLogPayment = async (company) => {
    if (!currentUser) return;
    try {
      await pb.collection('payment_history').create({
        companyName: company.companyName, datePaid: new Date().toISOString(),
        amount: company.amount || null, accountUsed: selectedHome?.name || 'Default Account', ownerId: currentUser.id
      }, { $autoCancel: false });
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch {
      // non-fatal: bill is still marked paid even if history logging fails
    }
  };

  const handleOpenAddCustom = () => { setPrefillData(null); setIsAddModalOpen(true); };
  const handleSelectDirectoryCompany = (company) => { setPrefillData(company); setIsAddModalOpen(true); };

  // ── Split bills by status ──
  // A bill is CLOSED — off the open views, into history — when it's paid OR
  // cleared. One off-switch, same rule the dashboard and Cash Needs use.
  // A bill leaves the open views ONLY when cleared. The paid flag does not
  // close it — an autopay/card bill can be "paid" but still an open obligation
  // until cleared. One off-switch: cleared. Same rule on the dashboard and
  // Cash Needs, so all three tie to the same total.
  const isClosed = (c) => !!c.cleared;
  const isPaid = isClosed;  // alias: existing call sites say "isPaid" but mean "closed/cleared"
  const isAuto = (c) => c.paymentType === 'Autopay (card)' || c.paymentType === 'Autopay (bank)';
  // "No property" = anything not placed on a real home (placement 'other' or
  // 'unassigned'). The grouped list splits these into two sections; this just
  // gates them out of single-property views and into the local 'other' scope.
  const hasNoHome = (c) => placementOf(c) !== 'property';

  // ── Property scope (LOCAL) ──
  //   'other'    → bills not tied to a property (Other + Needs placement)
  //   'all'      → every bill across properties AND the no-property buckets
  //   'property' → the selected home's bills ONLY (no-property bills are NOT
  //                mixed in here — they have their own 'other' scope, which
  //                fixes the old leak where !homeId bills showed on a single
  //                property). If no real home is selected, fall back to all.
  const propertyFiltered = companies.filter(c => {
    if (scope === 'other') return hasNoHome(c);
    if (scope === 'all') return true;
    if (!selectedHome) return true;
    return placementOf(c) === 'property' && c.homeId === selectedHome.id;
  });

  // Open bills for the action lists (excludes only pending_review, which has
  // its own review section). A bill stays here until cleared — visible until
  // its off-switch is flipped.
  const openBills = propertyFiltered.filter(c => !isPaid(c) && c.status !== 'pending_review');

  // Every OPEN bill in scope (not paid, not cleared) INCLUDING pending_review.
  // "If it's open, it's a cash need." This is what Total Due / the stats tie to,
  // matching the dashboard and Cash Needs. (openBills stays confirmed-only
  // because an unreviewed bill can't be PAID yet — but it still counts as due.)
  const allOpenInScope = propertyFiltered.filter(c => !isClosed(c));

  // Manual bills needing payment, sorted soonest-due first.
  const readyToPay = openBills
    .filter(c => !isAuto(c))
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

  // Autopay bills awaiting human review (drafts on their own; review only).
  const autopayToReview = openBills
    .filter(c => isAuto(c))
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

  const paidBills = propertyFiltered
    .filter(c => {
      if (!isPaid(c)) return false;
      if (timeframeDays == null) return true;
      const closeDate = c.paidDate || c.reviewedDate;
      if (!closeDate) return true;
      const days = (Date.now() - new Date(closeDate).getTime()) / 86400000;
      return days <= timeframeDays;
    })
    .sort((a, b) => {
      const da = new Date(a.paidDate || a.reviewedDate || 0).getTime();
      const db = new Date(b.paidDate || b.reviewedDate || 0).getTime();
      return db - da;
    });

  // For the dashboard/strips: all open money-out (manual + autopay).
  const openCompanies = openBills;

  // Split manual ready-to-pay into past-due vs the rest.
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const isPastDueBill = (c) => {
    if (isPaid(c) || !c.dueDate) return false;
    const due = new Date(c.dueDate); due.setHours(0, 0, 0, 0);
    return due < now;
  };
  // PAST DUE TAKES PRECEDENCE: a past-due bill belongs in the Past Due section
  // regardless of confirm status — including unreviewed ones from the queue —
  // and is shown ONCE (pulled out of Bills to Review below). Confirmed past-due
  // bills get a Pay action; unreviewed ones get a Review action (can't pay an
  // unverified amount). Sorted most-overdue first.
  const pastDue = propertyFiltered
    .filter(isPastDueBill)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  // IDs that the Bills-to-Review list must NOT also show (they live in Past Due).
  const pastDuePendingIds = new Set(
    pastDue.filter(c => c.status === 'pending_review').map(c => c.id)
  );
  // Upcoming = confirmed manual bills that are NOT past due.
  const upcomingToPay = readyToPay.filter(c => !isPastDueBill(c));

  // Show property tags on rows whenever we're looking across properties.
  const showPropertyTags = scope === 'all' && multiHome;
  // Group Ready-to-Pay under per-property headers only when the user picks the
  // "by property" view. Otherwise the list stays sectioned by status.
  const groupByProperty = showPropertyTags && groupBy === 'property';

  // In "By property" view, a property's bills belong together, sorted by due
  // date — so its overdue bill sits at the TOP of that property's group rather
  // than standing alone in a separate Past Due section. So when grouping by
  // property we feed the group ALL ready-to-pay bills (overdue + upcoming),
  // due-date ascending, and suppress the standalone Past Due block.
  //
  // CRITICAL: readyToPay is confirmed-only (it derives from openBills, which
  // excludes pending_review). A past-due bill that's still UNREVIEWED would
  // therefore appear in by-status (via the standalone Past Due section) but
  // vanish in by-property — because that section is suppressed here. So we fold
  // the past-due pending bills into the grouped list too; the group's render
  // dispatches them to the inline Review row (they can't be paid yet). They're
  // already held out of Bills-to-Review via pastDuePendingIds, so each shows
  // exactly once.
  const dueAsc = (a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; // undated last
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return da - db;
  };
  const pastDuePending = pastDue.filter(c => c.status === 'pending_review');
  const groupedReadyToPay = [...readyToPay, ...pastDuePending].sort(dueAsc);
  const showStandalonePastDue = !groupByProperty && pastDue.length > 0;

  // Friendly count of no-home bills, for the toggle/empty hints.
  const otherCount = companies.filter(c => hasNoHome(c) && !isPaid(c) && c.status !== 'pending_review').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Helmet><title>Bill Pay — CasaCEO</title></Helmet>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '20px 32px', marginBottom: '24px' }}>
        <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
          <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Home</Link>
          <ChevronRight style={{ width: '14px', height: '14px' }} />
          <span className="text-slate-700 font-medium">Bill Pay</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff' }}>
              <CreditCard style={{ width: '22px', height: '22px', color: '#2563eb' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '24px', lineHeight: '1.2' }}>Bill Pay</h1>
              <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '2px' }}>
                {scope === 'other'
                  ? `${OTHER_BILLS_LABEL} · `
                  : scope === 'all'
                  ? `All properties · `
                  : (selectedHome?.name ? `${selectedHome.name} · ` : '')}
                Every bill for your home — and anything else worth keeping in one place.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AddBillButton onUploaded={fetchCompanies} onAddManual={handleOpenAddCustom} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{ padding: '0 32px' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab Bar + local scope toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ marginBottom: '24px' }}>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm" style={{ padding: '6px' }}>
              {[
                { key: 'dashboard', label: 'My Bills', icon: LayoutGrid },
                { key: 'cashneeds', label: 'Cash Needs', icon: TrendingDown },
                { key: 'overview', label: 'Overview', icon: BarChart2 },
                { key: 'directory', label: 'Providers', icon: BookOpen },
                { key: 'history', label: 'History', icon: CreditCard },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-2 rounded-xl transition-all font-medium"
                    style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === tab.key ? '#1e3a5f' : 'transparent', color: activeTab === tab.key ? 'white' : '#64748b' }}>
                    <Icon style={{ width: '14px', height: '14px' }} /> {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Toggle row on the data tabs (not Providers/History). */}
            {(activeTab === 'dashboard' || activeTab === 'cashneeds' || activeTab === 'overview') && (
              <OtherBillsPeek
                scope={scope}
                onEnterOther={() => viewOther()}
                onExitOther={() => switchHome(selectedHome)}
                selectedHome={selectedHome}
                allProperties={allProperties}
              />
            )}
            {/* In All Properties on My Bills: how to organize the grouped view. */}
            {activeTab === 'dashboard' && scope === 'all' && multiHome && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl" style={{ padding: '4px' }}>
                {[
                  { key: 'property', label: 'By property' },
                  { key: 'status', label: 'By status' },
                ].map(o => (
                  <button key={o.key} onClick={() => setGroupBy(o.key)}
                    className="rounded-lg transition-all font-medium"
                    style={{ padding: '6px 12px', fontSize: '12px',
                      background: groupBy === o.key ? '#1e3a5f' : 'transparent',
                      color: groupBy === o.key ? '#fff' : '#64748b' }}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── My Bills Tab ── */}
          <TabsContent value="dashboard" className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : companies.length === 0 ? (
              <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e9e4db', padding: '48px 20px' }}>
                <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eff6ff', marginBottom: '16px' }}>
                  <CreditCard style={{ width: '28px', height: '28px', color: '#2563eb' }} />
                </div>
                <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>No bills added yet.</p>
                <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
                  Add your first bill and never miss a due date — home bills first, plus anything else worth keeping in one place.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button onClick={() => setActiveTab('directory')} className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                    style={{ background: '#1e3a5f', padding: '12px 24px', fontSize: '14px' }}>
                    <Search style={{ width: '16px', height: '16px' }} /> Browse Providers
                  </button>
                  <button onClick={handleOpenAddCustom} className="flex items-center gap-2 font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl"
                    style={{ padding: '12px 24px', fontSize: '14px' }}>
                    <Plus style={{ width: '16px', height: '16px' }} /> Add Manually
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* When viewing the Other-bills bucket, a small context line. */}
                {scope === 'other' && (
                  <div className="flex items-center gap-2" style={{ background: '#faf8f4', border: '1px solid #e9e4db', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px' }}>
                    <Package style={{ width: '16px', height: '16px', color: '#5b6472' }} />
                    <p className="text-slate-600" style={{ fontSize: '13px' }}>
                      Bills not tied to a property — car, phone, subscriptions, and anything else worth keeping in one place.
                    </p>
                  </div>
                )}

                {/* Quick glance: the four stats. */}
                <SummaryStrip companies={openCompanies} allInScope={allOpenInScope} />

                {/* ── 1. PAST DUE — top priority, loud ──
                    In "By property" view this standalone block is suppressed;
                    each property's overdue bill leads its own group instead. */}
                {showStandalonePastDue && (
                  <>
                    <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                      <AlertCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
                      <h2 className="font-semibold" style={{ fontSize: '18px', color: '#dc2626' }}>
                        Past Due <span className="font-normal" style={{ color: '#f87171' }}>({pastDue.length})</span>
                      </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                      {pastDue.map(company => (
                        company.status === 'pending_review' ? (
                          <PastDuePendingRow key={company.id} bill={company} homes={homes} multiHome={multiHome} onConfirmed={fetchCompanies} />
                        ) : (
                          <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                        )
                      ))}
                    </div>
                  </>
                )}

                {/* ── 2. READY TO PAY ── */}
                <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>
                    Ready to Pay <span className="text-slate-400 font-normal">({groupByProperty ? groupedReadyToPay.length : upcomingToPay.length})</span>
                  </h2>
                  <button onClick={handleOpenAddCustom} className="flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
                    <Plus style={{ width: '14px', height: '14px' }} /> Add Bill
                  </button>
                </div>
                {(groupByProperty ? groupedReadyToPay.length === 0 : upcomingToPay.length === 0) ? (
                  <div className="bg-white text-center text-slate-400" style={{ borderRadius: '10px', border: '1px solid #e9e4db', padding: '24px', fontSize: '14px', marginBottom: '32px' }}>
                    Nothing upcoming to pay. You're all caught up.
                  </div>
                ) : groupByProperty ? (
                  <div style={{ marginBottom: '32px' }}>
                    <PropertyGroupedList
                      companies={groupedReadyToPay}
                      homeName={homeName}
                      renderCard={(company) => (
                        company.status === 'pending_review' ? (
                          <PastDuePendingRow key={company.id} bill={company} homes={homes} multiHome={multiHome} onConfirmed={fetchCompanies} />
                        ) : (
                          <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={null} homes={homes} />
                        )
                      )}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {upcomingToPay.map(company => (
                      <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                    ))}
                  </div>
                )}

                {/* ── 3. ON AUTOPAY — needs review (drafts on its own) ── */}
                {autopayToReview.length > 0 && (
                  <>
                    <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                      <Repeat style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
                      <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>
                        On Autopay — needs review <span className="text-slate-400 font-normal">({autopayToReview.length})</span>
                      </h2>
                    </div>
                    <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
                      These draft automatically. Reviewing just confirms someone checked the charge — it doesn't change processing.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                      {autopayToReview.map(company => (
                        <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                      ))}
                    </div>
                  </>
                )}

                {/* ── 4. BILLS TO CONFIRM (email-ingested) ── */}
                <PendingReviewSection onConfirmed={fetchCompanies} excludeIds={pastDuePendingIds} />

                {/* ── 5. ALL SET — paid (manual) + reviewed (autopay) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ marginBottom: '12px' }}>
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>
                    All Set <span className="text-slate-400 font-normal">({paidBills.length})</span>
                  </h2>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl" style={{ padding: '4px' }}>
                    {TIMEFRAMES.map(tf => (
                      <button key={tf.label} onClick={() => setTimeframeDays(tf.days)}
                        className="rounded-lg transition-all font-medium"
                        style={{ padding: '5px 12px', fontSize: '12px',
                          background: timeframeDays === tf.days ? '#1e3a5f' : 'transparent',
                          color: timeframeDays === tf.days ? '#fff' : '#64748b' }}>
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>
                {paidBills.length === 0 ? (
                  <div className="bg-white text-center text-slate-400" style={{ borderRadius: '10px', border: '1px solid #e9e4db', padding: '24px', fontSize: '14px' }}>
                    Nothing here yet for this period.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {paidBills.map(company => (
                      <ServiceCompanyCard key={company.id} company={company} onRefresh={fetchCompanies} onPay={handleLogPayment} propertyName={showPropertyTags ? homeName(company.homeId) : null} homes={homes} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Cash Needs Tab ── */}
          <TabsContent value="cashneeds" className="mt-0">
            {companies.length === 0 ? (
              <div className="bg-white text-center text-slate-400" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '40px', fontSize: '14px' }}>
                Add some bills to see what's coming.
              </div>
            ) : (
              <CashNeedsTab companies={propertyFiltered} homes={homes} homeName={homeName} scope={scope} otherBillsLabel={OTHER_BILLS_LABEL} onRefresh={fetchCompanies} />
            )}
          </TabsContent>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="mt-0">
            {companies.length === 0 ? (
              <div className="bg-white text-center text-slate-400" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '40px', fontSize: '14px' }}>
                Add some bills to see your spending overview.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryBreakdown companies={openCompanies} />
                <AnnualSpendSummary companies={openCompanies} />
              </div>
            )}
          </TabsContent>

          {/* ── Directory Tab ── */}
          <TabsContent value="directory" className="mt-0">
            {/* Your billers + connection status, above the browse-the-catalog listing */}
            <BillerConnectChecklist
              companies={companies}
              forwardAddress={currentUser ? `ceo+${currentUser.id}@bills.casaceo.com` : ''}
            />
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '4px' }}>Provider Directory</h2>
                <p className="text-slate-400" style={{ fontSize: '14px' }}>Connect any provider that sends you a bill — utilities, insurance, subscriptions, and more.</p>
              </div>
              <UtilityCompanyListing ref={utilityListingRef} onSelectCompany={handleSelectDirectoryCompany} />
            </div>
          </TabsContent>

          {/* ── History Tab ── */}
          <TabsContent value="history" className="mt-0">
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e9e4db', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <PaymentHistoryTab refreshTrigger={historyRefreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Bill Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{prefillData?.id ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm
            initialData={prefillData}
            onSuccess={() => { setIsAddModalOpen(false); fetchCompanies(); setActiveTab('dashboard'); toast({ title: '✅ Bill added successfully!' }); }}
            onCompanyAdded={() => { if (utilityListingRef.current) utilityListingRef.current.refresh(); }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillPayPage;
