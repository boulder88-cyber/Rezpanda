import React, { useState, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { Home, MapPin, ArrowRight, AlertCircle, CheckCircle2, Plus, CreditCard, Wrench, FolderOpen, Inbox, Building } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTIES AT A GLANCE  (warm off-white field · navy tiles)
//
// Stacked doors:
//   • Portfolio strip (top): one calm all-properties readout — total due,
//     due this week, overdue, to review — so the "across all" answer is
//     visible, not just implied by the function row.
//   • Property tiles: one navy tile per home with a real readout — what's
//     due, the next bill date, and the home's maintenance standing — then
//     enter that home's board. White house icon to match the brand logo.
//   • "Needs your eye" row: surfaces anything overdue or pending review
//     across all homes as tap-through items; collapses to a calm line when
//     there's nothing to do.
//   • Function row: Bills / Maintenance / Records as an ALL-PROPERTIES
//     "go straight to."
//
// Navy tiles on the warm #faf8f4 page, gold as the sparing accent. Money rule
// (locked): per-property "due" aggregates round to whole dollars; individual
// bill amounts keep cents. Maintenance date math mirrors
// MaintenanceManagementPage (maintenance_systems collection, nextServiceDate;
// overdue = past today, soon = within 30 days). Maintenance fetch fails open.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';

// A bill is CLOSED — off the open views, into history — when it's paid OR
// cleared. One off-switch, identical to My Bills and Cash Needs. Named isPaid
// for continuity, but it means "closed."
const isPaid = (c) => c.status === 'paid' || c.cleared;
const isPending = (c) => c.status === 'pending_review';
const isOpen = (c) => !isPaid(c) && !isPending(c); // confirmed, not yet closed
// Money rule: a bill's dollars count from the moment it exists, regardless of
// confirm status — only CLOSED (paid or cleared) bills stop counting. So every
// due total and aging bucket sums all open bills (confirmed AND in review).
// This is what lets every tile reconcile to the portfolio strip.
const counts = (c) => !isPaid(c);
// Past due is a HARD FACT of the calendar, not a workflow state: any unpaid
// bill whose due date has passed is overdue — whether or not it's been
// confirmed. This deliberately includes pending_review bills, so an obviously
// late bill sitting in the review queue still counts and flags as past due.
const isPastDue = (c) => {
  if (isPaid(c) || !c.dueDate) return false;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(c.dueDate); due.setHours(0, 0, 0, 0);
  return due < now;
};
// Mirror of BillPayPage.placementOf — old bills with no placement field are
// inferred from homeId so existing data behaves as before.
const placementOf = (c) => (c && c.placement) ? c.placement : (c && c.homeId ? 'property' : 'unassigned');
const needsPlacement = (c) => isOpen(c) && placementOf(c) === 'unassigned';

// Aging buckets for a set of OPEN bills, keyed off dueDate against today:
//   pastDue  — due date already gone
//   next7    — due within the next 7 days (today through +7)
//   next30   — due in 8–30 days
//   later    — dated, but more than 30 days out
//   undated  — open bill with NO due date: the system holds it but can't place
//              it on the timeline. This MUST stay visible — a bill that exists
//              but appears in no bucket is a silent gap the user can't reconcile.
// Buckets bills by timing. IMPORTANT status rule:
//   • pastDue is status-AGNOSTIC — any unpaid bill past its due date counts,
//     including pending_review (a late bill is late even before you confirm it).
//   • forward buckets (next7/next30/later/undated) are CONFIRMED-only — they
//     describe acknowledged upcoming obligations, so unreviewed bills don't
//     inflate them. (An unreviewed FUTURE bill simply isn't bucketed yet.)
// Pass the full bill list; this sorts out status internally.
const ageBills = (allBills) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const day = 24 * 60 * 60 * 1000;
  const b = {
    pastDue: { count: 0, amount: 0 },
    next7: { count: 0, amount: 0 },
    next30: { count: 0, amount: 0 },
    later: { count: 0, amount: 0 },
    undated: { count: 0, amount: 0 },
  };
  for (const c of allBills) {
    if (isPaid(c)) continue;
    const amt = parseFloat(c.amount) || 0;
    // Every unpaid bill counts its dollars — confirmed or in review. The bucket
    // is decided purely by the due date, so the five cells sum to the true
    // total owed and the strip reconciles to the tiles.
    if (c.dueDate) {
      const due = new Date(c.dueDate); due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due - now) / day);
      if (diffDays < 0) { b.pastDue.count++; b.pastDue.amount += amt; continue; }
      if (diffDays <= 7) { b.next7.count++; b.next7.amount += amt; }
      else if (diffDays <= 30) { b.next30.count++; b.next30.amount += amt; }
      else { b.later.count++; b.later.amount += amt; }
    } else {
      // Undated: held but not yet on the timeline — counts regardless of status.
      b.undated.count++; b.undated.amount += amt;
    }
  }
  return b;
};

// Days until a date (positive = future, negative = past). Mirrors the
// management page's ceil-based day math.
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
};

const summarize = (bills, systems, homeId) => {
  const now = new Date();
  const mine = bills.filter((c) => c.homeId === homeId);
  // Countable = every unpaid bill (confirmed + in review). Dollars and the
  // "bills" count derive from this, so the tile reconciles to the strip.
  const live = mine.filter(counts);
  const dueTotal = live.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  // Overdue is status-agnostic — a past-due bill counts even if still in review.
  const overdueCount = mine.filter(isPastDue).length;
  const pendingCount = mine.filter(isPending).length;
  // Unpaid bills with no due date — held but not yet placeable on the timeline.
  const undatedCount = live.filter((c) => !c.dueDate).length;

  // Next bill by due date (soonest first). nextOverdue tells the tile whether
  // that soonest bill is actually past due — so it isn't mislabeled "next"
  // when its date is already gone.
  const dated = live.filter((c) => c.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextBill = dated[0] || null;
  const nextOverdue = !!(nextBill && new Date(nextBill.dueDate) < now);

  // Maintenance standing for this home.
  const homeSystems = systems.filter((s) => s.homeId === homeId);
  const mOverdue = homeSystems.filter((s) => s.nextServiceDate && new Date(s.nextServiceDate) < now).length;
  const mSoon = homeSystems.filter((s) => {
    const d = daysUntil(s.nextServiceDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;

  return { dueTotal, openCount: live.length, overdueCount, pendingCount, undatedCount, nextBill, nextOverdue, mOverdue, mSoon, mTotal: homeSystems.length };
};

// Summarize the bills that DON'T belong to a property — the two empty-homeId
// states: "other" (a deliberate Other-bills bucket) and "unassigned" (not yet
// placed). Same bill math as summarize(), no maintenance (these aren't a home).
// This is what lets a late unassigned bill surface in a tile instead of hiding.
const summarizeUnplaced = (bills) => {
  const now = new Date();
  const mine = bills.filter((c) => placementOf(c) !== 'property');
  // Countable = every unpaid unplaced bill (confirmed + in review), same basis
  // as the home tiles, so this tile reconciles into the strip alongside them.
  const live = mine.filter(counts);
  const dueTotal = live.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const overdueCount = mine.filter(isPastDue).length;
  const pendingCount = mine.filter(isPending).length;
  const undatedCount = live.filter((c) => !c.dueDate).length;
  // How many still need a real home (unassigned) vs. parked in Other on purpose
  // — status-agnostic, since a pending unassigned bill still needs placing.
  const needsPlaceCount = live.filter((c) => placementOf(c) === 'unassigned').length;
  const dated = live.filter((c) => c.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextBill = dated[0] || null;
  const nextOverdue = !!(nextBill && new Date(nextBill.dueDate) < now);
  return { dueTotal, openCount: live.length, overdueCount, pendingCount, undatedCount, needsPlaceCount, nextBill, nextOverdue, total: mine.length };
};

// Short "Aug 14" style date.
const shortDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

// ── Property tile: navy surface, gold accent, white icon ──────────────────
const PropertyGlanceTile = ({ home, summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount, undatedCount, nextBill, nextOverdue, mOverdue, mSoon, mTotal } = summary;
  const allClear = openCount === 0 && overdueCount === 0;
  // Top accent reflects urgency; gold leads the calm state.
  const accent = overdueCount > 0 ? '#dc2626' : openCount > 0 ? '#f59e0b' : GOLD;

  // Maintenance status — ALWAYS present so every tile carries it and the rows
  // line up. All states render as the same boxed pill (so heights match); only
  // the color/tone differs. "No maintenance tracked" is NOT a home status — a
  // home always has maintenance needs, the app just doesn't know them yet — so
  // it reads as an invitation to set it up, not a verdict.
  let maint;
  if (mTotal === 0) {
    maint = {
      text: 'Set up maintenance', icon: 'wrench',
      color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.14)',
    };
  } else if (mOverdue > 0) {
    maint = {
      text: `${mOverdue} maintenance ${mOverdue === 1 ? 'task' : 'tasks'} overdue`, icon: 'alert',
      color: '#fca5a5', bg: 'rgba(220,38,38,0.14)', border: 'rgba(220,38,38,0.28)',
    };
  } else if (mSoon > 0) {
    maint = {
      text: `${mSoon} maintenance ${mSoon === 1 ? 'task' : 'tasks'} due this month`, icon: 'wrench',
      color: '#fcd34d', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.26)',
    };
  } else {
    maint = {
      text: 'Maintenance on track', icon: 'check',
      color: '#6ee7b7', bg: 'rgba(110,231,183,0.10)', border: 'rgba(110,231,183,0.22)',
    };
  }

  return (
    <button
      onClick={onEnter}
      className="text-left hover:-translate-y-0.5 transition-all group flex flex-col w-full h-full"
      style={{
        background: NAVY,
        borderRadius: '16px',
        borderTop: `3px solid ${accent}`,
        padding: '20px',
        boxShadow: '0 6px 18px rgba(30,58,95,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)' }}>
          <Home style={{ width: '22px', height: '22px', color: '#ffffff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate" style={{ fontSize: '17px' }}>
            {home.name || home.address || 'Unnamed home'}
          </p>
          {home.address && (
            <p className="flex items-center gap-1 truncate" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
              <MapPin style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {home.address}
            </p>
          )}
        </div>
      </div>

      {/* The glance — bills */}
      {allClear ? (
        <div className="rounded-xl flex items-center gap-2" style={{ background: 'rgba(110,231,183,0.10)', border: '1px solid rgba(110,231,183,0.22)', padding: '12px 14px', marginBottom: '12px', color: '#6ee7b7' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span className="font-medium" style={{ fontSize: '14px' }}>No bills to pay</span>
        </div>
      ) : (
        <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', padding: '12px 14px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="font-extrabold text-white" style={{ fontSize: '26px', lineHeight: 1 }}>
            ${Math.round(dueTotal).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            {openCount} {openCount === 1 ? 'bill' : 'bills'} owed
          </p>
        </div>
      )}

      {/* Attention chips — bill-related, grouped with the bills box above.
          This region flexes (mb-auto pushes maintenance + Open to the bottom),
          so however many chips a tile has, the maintenance pill below still
          lines up tile-to-tile. */}
      <div className="flex flex-wrap items-center gap-2" style={{ minHeight: '20px', marginBottom: 'auto' }}>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fca5a5', background: 'rgba(220,38,38,0.18)', padding: '3px 9px' }}>
            <AlertCircle style={{ width: '11px', height: '11px' }} /> {overdueCount} overdue
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fcd34d', background: 'rgba(245,158,11,0.16)', padding: '3px 9px' }}>
            {pendingCount} to review
          </span>
        )}
        {undatedCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fcd34d', background: 'rgba(245,158,11,0.16)', padding: '3px 9px' }}>
            {undatedCount} no due date
          </span>
        )}
      </div>

      {/* Maintenance status — always present, same pill shape across states so
          the rows line up tile-to-tile; only the tone differs. Bottom-anchored
          (the chips region above absorbs height variance), so the pill sits at
          the same vertical position on every tile. */}
      <div className="flex items-center gap-2 rounded-lg" style={{ background: maint.bg, border: `1px solid ${maint.border}`, padding: '8px 12px', marginTop: '12px', marginBottom: '16px', color: maint.color }}>
        {maint.icon === 'check'
          ? <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
          : maint.icon === 'alert'
            ? <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
            : <Wrench style={{ width: '14px', height: '14px', flexShrink: 0 }} />}
        <span className="font-semibold" style={{ fontSize: '13px' }}>{maint.text}</span>
      </div>

      {/* Enter — sits directly below the bottom-anchored maintenance pill.
          (The chips region's mb-auto is the single flex spacer, so no auto
          margin here or the two would fight and float the pill to the middle.) */}
      <div className="flex items-center gap-1.5 font-semibold" style={{ fontSize: '13px', color: GOLD }}>
        Open
        <ArrowRight style={{ width: '15px', height: '15px' }} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

// ── Other & unassigned tile: same navy surface as a property, but for bills
// that have no home. Without this, a late unassigned bill is invisible on the
// dashboard — the portfolio strip counts it but no tile owns it. This gives
// those bills a door. Maintenance has no meaning here, so the pill is replaced
// with a one-line "needs a home" nudge when anything is still unassigned.
const UnplacedGlanceTile = ({ summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount, undatedCount, needsPlaceCount } = summary;
  const allClear = openCount === 0 && overdueCount === 0;
  const accent = overdueCount > 0 ? '#dc2626' : openCount > 0 ? '#f59e0b' : GOLD;

  return (
    <button
      onClick={onEnter}
      className="text-left hover:-translate-y-0.5 transition-all group flex flex-col w-full h-full"
      style={{
        background: NAVY,
        borderRadius: '16px',
        borderTop: `3px solid ${accent}`,
        padding: '20px',
        boxShadow: '0 6px 18px rgba(30,58,95,0.18)',
      }}
    >
      {/* Header — Inbox icon distinguishes it from the house-icon home tiles. */}
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)' }}>
          <Inbox style={{ width: '22px', height: '22px', color: '#ffffff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate" style={{ fontSize: '17px' }}>
            Other &amp; unassigned
          </p>
          <p className="truncate" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
            Bills not tied to a property
          </p>
        </div>
      </div>

      {/* The glance — bills */}
      {allClear ? (
        <div className="rounded-xl flex items-center gap-2" style={{ background: 'rgba(110,231,183,0.10)', border: '1px solid rgba(110,231,183,0.22)', padding: '12px 14px', marginBottom: '12px', color: '#6ee7b7' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span className="font-medium" style={{ fontSize: '14px' }}>Nothing here right now</span>
        </div>
      ) : (
        <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', padding: '12px 14px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="font-extrabold text-white" style={{ fontSize: '26px', lineHeight: 1 }}>
            ${Math.round(dueTotal).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            {openCount} {openCount === 1 ? 'bill' : 'bills'} owed
          </p>
        </div>
      )}

      {/* Attention chips — same set as a property tile (overdue / to review /
          no due date), so a late unassigned bill flags exactly as it would
          inside a home. */}
      <div className="flex flex-wrap items-center gap-2" style={{ minHeight: '20px', marginBottom: 'auto' }}>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fca5a5', background: 'rgba(220,38,38,0.18)', padding: '3px 9px' }}>
            <AlertCircle style={{ width: '11px', height: '11px' }} /> {overdueCount} overdue
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fcd34d', background: 'rgba(245,158,11,0.16)', padding: '3px 9px' }}>
            {pendingCount} to review
          </span>
        )}
        {undatedCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fcd34d', background: 'rgba(245,158,11,0.16)', padding: '3px 9px' }}>
            {undatedCount} no due date
          </span>
        )}
      </div>

      {/* In place of the maintenance pill: a placement nudge when bills still
          need a home, or a calm "parked here on purpose" line when they don't.
          Same pill shape/position so this tile lines up with the home tiles. */}
      {needsPlaceCount > 0 ? (
        <div className="flex items-center gap-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.26)', padding: '8px 12px', marginTop: '12px', marginBottom: '16px', color: '#fcd34d' }}>
          <Building style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          <span className="font-semibold" style={{ fontSize: '13px' }}>
            {needsPlaceCount} {needsPlaceCount === 1 ? 'bill needs' : 'bills need'} a property
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', padding: '8px 12px', marginTop: '12px', marginBottom: '16px', color: 'rgba(255,255,255,0.6)' }}>
          <Inbox style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          <span className="font-semibold" style={{ fontSize: '13px' }}>Kept here on purpose</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 font-semibold" style={{ fontSize: '13px', color: GOLD }}>
        Open
        <ArrowRight style={{ width: '15px', height: '15px' }} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

// ── Portfolio summary strip: a calm all-properties aging readout ──────────
// The Past-due cell is clickable: it expands an inline list of exactly which
// bills are past due (company, amount, how late), each a link into Bill Pay
// for that home — so "how much is overdue" is one tap from "which ones."
const PortfolioStrip = ({ stats, pastDueBills, homesById, onGoBill }) => {
  const [showPastDue, setShowPastDue] = React.useState(false);
  const toneColor = { plain: '#1f2733', amber: '#b45309', red: '#dc2626', green: '#059669' };
  const money = (n) => `$${Math.round(n).toLocaleString()}`;
  const billWord = (n) => `${n} ${n === 1 ? 'bill' : 'bills'}`;
  const a = stats.aging;
  // How late, in whole days, against today (midnight-normalized).
  const daysLate = (dateStr) => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
    return Math.round((now - due) / (24 * 60 * 60 * 1000));
  };

  const hasPastDue = a.pastDue.count > 0;
  const cells = [
    { key: 'total', label: 'Due across all homes', value: money(stats.dueTotal), sub: billWord(stats.openCount), tone: 'plain' },
    { key: 'pastdue', label: 'Past due', value: money(a.pastDue.amount), sub: billWord(a.pastDue.count), tone: hasPastDue ? 'red' : 'green', clickable: hasPastDue },
    { key: 'next7', label: 'Next 7 days', value: money(a.next7.amount), sub: billWord(a.next7.count), tone: a.next7.count > 0 ? 'amber' : 'plain' },
    { key: 'next30', label: 'Next 30 days', value: money(a.next30.amount), sub: billWord(a.next30.count), tone: 'plain' },
  ];
  if (a.undated.count > 0) {
    cells.push({ key: 'undated', label: 'No due date', value: money(a.undated.amount), sub: `${billWord(a.undated.count)} · add a date`, tone: 'amber' });
  }

  // Past-due bills, soonest-overdue last (most overdue first).
  const sortedPastDue = [...(pastDueBills || [])].sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate));

  return (
    <div className="bg-white" style={{ border: '1px solid #e9e4db', borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        {cells.map((c, i) => {
          const inner = (
            <>
              <p style={{ fontSize: '11px', color: '#95a0ae', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '6px' }}>
                {c.label}
                {c.clickable && <span style={{ color: '#dc2626', marginLeft: '6px', fontWeight: 700 }}>{showPastDue ? '▲' : '▼'}</span>}
              </p>
              <p className="font-bold" style={{ fontSize: '21px', color: toneColor[c.tone], lineHeight: 1 }}>{c.value}</p>
              {c.sub && <p style={{ fontSize: '11px', color: '#95a0ae', marginTop: '4px' }}>{c.sub}</p>}
            </>
          );
          const cellStyle = { padding: '16px 18px', borderLeft: i === 0 ? 'none' : '1px solid #f0ece4' };
          return c.clickable ? (
            <button key={c.key} onClick={() => setShowPastDue((v) => !v)} className="text-left transition-colors hover:bg-[#fef2f2]" style={cellStyle} title="See which bills are past due">
              {inner}
            </button>
          ) : (
            <div key={c.key} style={cellStyle}>{inner}</div>
          );
        })}
      </div>

      {/* Inline past-due detail — exactly what's overdue, one tap to the bill */}
      {showPastDue && hasPastDue && (
        <div style={{ borderTop: '1px solid #f0ece4', background: '#fffafa' }}>
          {sortedPastDue.map((c) => {
            const late = daysLate(c.dueDate);
            const homeName = homesById[c.homeId]?.name || homesById[c.homeId]?.address
              || (placementOf(c) === 'other' ? 'Other bills' : 'Needs placement');
            return (
              <button
                key={c.id}
                onClick={() => onGoBill(c.homeId)}
                className="w-full flex items-center gap-3 text-left transition-colors hover:bg-[#fef2f2]"
                style={{ padding: '10px 18px', borderTop: '1px solid #faf0f0' }}
              >
                <AlertCircle style={{ width: '14px', height: '14px', color: '#dc2626', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ fontSize: '13px', color: '#1f2733' }}>
                    {c.companyName || 'Bill'}
                    {c.amount ? <span style={{ color: '#5b6472', fontWeight: 400 }}>{'  ·  $'}{parseFloat(c.amount).toFixed(2)}</span> : null}
                  </p>
                  <p className="truncate" style={{ fontSize: '11px', color: '#dc2626' }}>
                    {late === 1 ? '1 day' : `${late} days`} past due · {homeName}
                  </p>
                </div>
                <ArrowRight style={{ width: '13px', height: '13px', color: '#e2b8b8', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── "Needs your eye" row: cross-home actionable items ─────────────────────
const NeedsYourEye = ({ items, homesById, onGoBill }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-white" style={{ border: '1px solid #e9e4db', borderRadius: '14px', padding: '16px 18px', marginBottom: '28px' }}>
        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', color: '#5b6472' }}>Nothing needs you right now — everything&rsquo;s handled.</span>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ border: '1px solid #e9e4db', borderRadius: '14px', padding: '8px 6px', marginBottom: '28px' }}>
      {items.map((it, i) => {
        const placement = it.placement || (it.homeId ? 'property' : 'unassigned');
        const bucketLabel = placement === 'other' ? 'Other bills' : placement === 'unassigned' ? 'Needs placement' : null;
        const homeName = homesById[it.homeId]?.name || homesById[it.homeId]?.address || bucketLabel || 'Other bills';
        const isPlacement = it.kind === 'placement';
        const isUndated = it.kind === 'undated';
        const reason = isPlacement ? 'Needs a property' : isUndated ? 'No due date' : 'Needs review';
        return (
          <button
            key={it.id}
            onClick={() => onGoBill(it.homeId)}
            className="w-full flex items-center gap-3 text-left transition-colors hover:bg-[#faf8f4]"
            style={{ padding: '11px 12px', borderTop: i === 0 ? 'none' : '1px solid #f3efe8', borderRadius: '10px' }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#fffbeb' }}>
              {isPlacement
                ? <Building style={{ width: '16px', height: '16px', color: '#d97706' }} />
                : <Inbox style={{ width: '16px', height: '16px', color: '#d97706' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ fontSize: '13.5px', color: '#1f2733' }}>
                {it.companyName || 'Bill'}
                {it.amount ? <span style={{ color: '#5b6472', fontWeight: 400 }}>{'  ·  $'}{parseFloat(it.amount).toFixed(2)}</span> : null}
              </p>
              <p className="truncate" style={{ fontSize: '11.5px', color: '#95a0ae' }}>
                {reason} · {homeName}
              </p>
            </div>
            <ArrowRight style={{ width: '14px', height: '14px', color: '#cbd5e1', flexShrink: 0 }} />
          </button>
        );
      })}
    </div>
  );
};

// ── Function box: an all-properties "go straight to" ──────────────────────
const FunctionBox = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md group bg-white"
    style={{ border: '1px solid #e9e4db', borderRadius: '14px', padding: '14px 16px' }}
  >
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef2f8' }}>
      <Icon style={{ width: '19px', height: '19px', color: NAVY }} />
    </div>
    <div className="text-left flex-1 min-w-0">
      <p className="font-semibold" style={{ fontSize: '14px', color: '#1f2733' }}>{label}</p>
      <p style={{ fontSize: '11px', color: '#95a0ae' }}>All properties</p>
    </div>
    <ArrowRight style={{ width: '15px', height: '15px', color: '#cbd5e1' }} className="group-hover:translate-x-1 transition-transform" />
  </button>
);

const PropertiesAtAGlance = ({ onEnter }) => {
  const { homes, switchHome, viewAllProperties } = useHome();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [systems, setSystems] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser?.id) { setLoadingBills(false); return; }
      try {
        // Bills (invoices) — owner-scoped. Maintenance (maintenance_systems) is
        // fetched in parallel with its own catch so a failure there never
        // blanks the bills view (fail open) — falls back to empty.
        const billsReq = pb.collection('invoices').getFullList({
          batch: 500,
          filter: `ownerId="${currentUser.id}"`,
          sort: 'companyName',
          $autoCancel: false,
        });
        const systemsReq = pb.collection('maintenance_systems').getFullList({
          batch: 500,
          filter: `ownerId="${currentUser.id}"`,
          $autoCancel: false,
        }).catch(() => []);

        const [billRecords, systemRecords] = await Promise.all([billsReq, systemsReq]);
        if (!cancelled) {
          setBills(billRecords || []);
          setSystems(systemRecords || []);
        }
      } catch {
        if (!cancelled) { setBills([]); setSystems([]); }
      } finally {
        if (!cancelled) setLoadingBills(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const handleEnter = (home) => {
    switchHome(home);
    if (onEnter) onEnter(home);
  };

  // Go straight to a function in all-properties scope. We set the flag for all
  // three; Bills honors it now, Maintenance/Records will once wired.
  const goAllProperties = (path) => {
    if (viewAllProperties) viewAllProperties();
    navigate(path);
  };

  // Enter a specific home, then land on its bill list (used by the eye row).
  const goHomeBills = (homeId) => {
    const home = homes.find((h) => h.id === homeId);
    if (home) switchHome(home);
    else if (viewAllProperties) viewAllProperties();
    navigate('/bill-pay');
  };

  // Open Bill Pay filtered to ONLY the unplaced bills — the dashboard tile's
  // equivalent of entering a home. We pass ?scope=other (Bill Pay already has
  // an "Other & unassigned" scope that filters to exactly placement !==
  // 'property'), and deliberately do NOT switch on all-properties mode, since
  // that mode hides the Other-scope filter and shows everything instead.
  const goUnplaced = () => {
    navigate('/bill-pay?scope=other');
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const homesById = React.useMemo(() => {
    const m = {};
    homes.forEach((h) => { m[h.id] = h; });
    return m;
  }, [homes]);

  // Portfolio-wide stats. dueTotal and the aging buckets both count EVERY
  // unpaid bill (confirmed + in review) on the same basis, so the strip's
  // headline equals the sum of all tiles and equals the sum of its own cells.
  const portfolio = React.useMemo(() => {
    const live = bills.filter(counts);
    const dueTotal = live.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    const pendingCount = bills.filter(isPending).length;
    const aging = ageBills(bills);
    return { dueTotal, openCount: live.length, pendingCount, aging };
  }, [bills]);

  // Past-due bills for the strip's expandable detail list — status-agnostic,
  // so an overdue bill still in the review queue shows here too.
  const pastDueBills = React.useMemo(() => bills.filter(isPastDue), [bills]);

  // Bills with no property (other / unassigned). Drives the dashboard's
  // "Other & unassigned" tile so a late bill there can't hide.
  const unplaced = React.useMemo(() => summarizeUnplaced(bills), [bills]);

  // "Needs your eye": the actionable items that DON'T already have a dedicated
  // surface. Overdue bills are intentionally excluded — the strip's "Past due"
  // cell owns them (summary number + full drill-down with days-late), so
  // listing them here too would be redundant. This row covers what's left:
  // bills to review, bills needing a property, and undated bills. Capped to 4.
  const eyeItems = React.useMemo(() => {
    const pending = bills
      .filter(isPending)
      .map((c) => ({ ...c, kind: 'review' }));
    const placement = bills
      .filter((c) => needsPlacement(c))
      .map((c) => ({ ...c, kind: 'placement' }));
    // Undated open bills — held but not yet on the timeline. Deduped against
    // placement so a bill never lists twice.
    const seen = new Set(placement.map((c) => c.id));
    const undated = bills
      .filter((c) => isOpen(c) && !c.dueDate && !seen.has(c.id))
      .map((c) => ({ ...c, kind: 'undated' }));
    return [...pending, ...placement, ...undated].slice(0, 4);
  }, [bills]);

  const emptySummary = { dueTotal: 0, openCount: 0, overdueCount: 0, pendingCount: 0, undatedCount: 0, nextBill: null, nextOverdue: false, mOverdue: 0, mSoon: 0, mTotal: 0 };

  return (
    <div className="max-w-5xl mx-auto" style={{ padding: '8px 0 80px' }}>
      {/* Header row: greeting/title left, compact Add property box right */}
      <div className="flex items-start justify-between gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '14px', color: '#5b6472' }}>{greeting}, {firstName}</p>
          <h1 className="font-semibold" style={{ fontSize: '26px', color: '#1f2733', marginTop: '2px' }}>
            Your properties
          </h1>
          <p style={{ fontSize: '13px', color: '#95a0ae', marginTop: '4px' }}>
            Pick one, or jump to a function across all
          </p>
        </div>
        <Link
          to="/manage-homes"
          className="flex items-center gap-2 font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0 text-white"
          style={{ background: NAVY, borderRadius: '12px', padding: '10px 16px', fontSize: '13px' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add property
        </Link>
      </div>

      {/* Portfolio summary strip — the all-properties answer, made visible */}
      {!loadingBills && <PortfolioStrip stats={portfolio} pastDueBills={pastDueBills} homesById={homesById} onGoBill={goHomeBills} />}

      {/* Property tiles — equal-width grid columns so tiles render the same
          size, items stretched to equal height. Grid is width-capped and
          centered so a single tile doesn't stretch full-bleed. */}
      {(() => {
        // Tile count includes the Other & unassigned tile when it renders, so
        // the width cap matches the real column count (a 2-home user with
        // unplaced bills shows 3 tiles, not 2).
        const tileCount = homes.length + (!loadingBills && unplaced.total > 0 ? 1 : 0);
        const capWidth = tileCount === 1 ? '360px' : tileCount === 2 ? '760px' : '100%';
        return (
      <div
        className="grid mx-auto items-stretch"
        style={{
          gap: '16px',
          marginBottom: '28px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          maxWidth: capWidth,
        }}
      >
        {homes.map((home) => (
          <PropertyGlanceTile
            key={home.id}
            home={home}
            summary={loadingBills ? emptySummary : summarize(bills, systems, home.id)}
            onEnter={() => handleEnter(home)}
          />
        ))}
        {/* Other & unassigned — only when bills actually live there, so an
            empty bucket never adds clutter, but a late unassigned bill always
            gets a visible door. */}
        {!loadingBills && unplaced.total > 0 && (
          <UnplacedGlanceTile summary={unplaced} onEnter={goUnplaced} />
        )}
      </div>
        );
      })()}

      {/* Needs your eye — cross-home actionable items, or a calm all-clear */}
      <p className="font-semibold uppercase tracking-wide" style={{ fontSize: '11px', color: GOLD, marginBottom: '12px' }}>
        Needs your eye
      </p>
      {!loadingBills && (
        <NeedsYourEye items={eyeItems} homesById={homesById} onGoBill={goHomeBills} />
      )}

      {/* Function row — below, all-properties go-straight-to */}
      <p className="font-semibold uppercase tracking-wide" style={{ fontSize: '11px', color: GOLD, marginBottom: '12px' }}>
        Or jump to a function
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '12px' }}>
        <FunctionBox icon={CreditCard} label="Bills" onClick={() => goAllProperties('/bill-pay')} />
        <FunctionBox icon={Wrench} label="Maintenance" onClick={() => goAllProperties('/maintenance-management')} />
        <FunctionBox icon={FolderOpen} label="Records" onClick={() => goAllProperties('/documents')} />
      </div>
    </div>
  );
};

export default PropertiesAtAGlance;
