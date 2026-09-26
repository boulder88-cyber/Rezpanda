import React, { useState, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { Home, MapPin, ArrowRight, AlertCircle, CheckCircle2, Plus, CreditCard, Wrench, FolderOpen, Inbox, Building, Heart } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTIES AT A GLANCE  (warm off-white field · white tiles · navy ink)
//
// Stacked doors:
//   • Portfolio strip (top): one calm all-properties readout — total due,
//     past due, upcoming, undated. Empty forward buckets collapse to a single
//     "Nothing due" cell instead of a row of $0s.
//   • Property tiles: one WHITE tile per home with a real readout — what's
//     due, attention chips, maintenance standing — then enter that home.
//   • "Needs your eye" row: review / placement / undated items across homes;
//     collapses to a calm line when there's nothing to do.
//   • Function row: Bills / Maintenance / Records as an ALL-PROPERTIES
//     "go straight to."
//
// COLOR ROLES (locked — one job per color):
//   navy  #1e3a5f  structure + ink: titles, icon badges, primary buttons, links
//   gold  #c9a96e  brand only: focus rings, caretaker heart (deep gold for text)
//   red            ONLY a past-due bill. Never decoration, never a tile border.
//   amber          needs attention but not late: to review, no due date, soon
//   green          all good
//
// A healthy tile should look quiet. Alarm is earned by a real past-due bill.
//
// Money rule (locked): per-property "due" aggregates round to whole dollars;
// individual bill amounts keep cents. Maintenance date math mirrors
// MaintenanceManagementPage (maintenance_systems collection, nextServiceDate;
// overdue = past today, soon = within 30 days). Maintenance fetch fails open.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const GOLD_INK = '#8a6d3b';   // gold dark enough for text on white (AA)
const INK = '#1f2733';
const MUTED = '#5b6472';
const FAINT = '#95a0ae';
const LINE = '#e9e4db';
const LINE_SOFT = '#f0ece4';
const FIELD = '#faf8f4';

// Status palette — light-surface versions, all text/bg pairs pass AA.
const TONE = {
  red:    { text: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  amber:  { text: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  green:  { text: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  quiet:  { text: MUTED,     bg: FIELD,     border: LINE },
};

const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2';
const LIFT = 'transition-all hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0';

// A bill leaves the open totals ONLY when cleared — the paid flag does not
// remove it (an autopay/card bill can be paid but still an open obligation).
// Named isPaid for continuity with call sites, but it means "cleared/closed."
const isPaid = (c) => !!c.cleared;
// Individual bill amount: two decimals, comma-grouped ($1,604.00 — never 1604).
const money2 = (n) => `$${(parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const isPending = (c) => c.status === 'pending_review';
const isOpen = (c) => !isPaid(c) && !isPending(c); // confirmed, not yet closed
// Money rule: a bill's dollars count from the moment it exists, regardless of
// confirm status — only CLOSED (paid or cleared) bills stop counting.
const counts = (c) => !isPaid(c);
// Past due is a HARD FACT of the calendar, not a workflow state: any unpaid
// bill whose due date has passed is overdue — including pending_review.
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

// Aging buckets keyed off dueDate against today. Every unpaid bill lands in
// exactly one bucket, so the cells sum to the true total owed.
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
    if (c.dueDate) {
      const due = new Date(c.dueDate); due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due - now) / day);
      if (diffDays < 0) { b.pastDue.count++; b.pastDue.amount += amt; continue; }
      if (diffDays <= 7) { b.next7.count++; b.next7.amount += amt; }
      else if (diffDays <= 30) { b.next30.count++; b.next30.amount += amt; }
      else { b.later.count++; b.later.amount += amt; }
    } else {
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
  const live = mine.filter(counts);
  const dueTotal = live.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const overdueCount = mine.filter(isPastDue).length;
  const pendingCount = mine.filter(isPending).length;
  const undatedCount = live.filter((c) => !c.dueDate).length;

  const dated = live.filter((c) => c.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextBill = dated[0] || null;
  const nextOverdue = !!(nextBill && new Date(nextBill.dueDate) < now);

  const homeSystems = systems.filter((s) => s.homeId === homeId);
  const mOverdue = homeSystems.filter((s) => s.nextServiceDate && new Date(s.nextServiceDate) < now).length;
  const mSoon = homeSystems.filter((s) => {
    const d = daysUntil(s.nextServiceDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;

  return { dueTotal, openCount: live.length, overdueCount, pendingCount, undatedCount, nextBill, nextOverdue, mOverdue, mSoon, mTotal: homeSystems.length };
};

// Bills that DON'T belong to a property — "other" (parked on purpose) and
// "unassigned" (not yet placed). Same bill math as summarize(), no maintenance.
const summarizeUnplaced = (bills) => {
  const now = new Date();
  const mine = bills.filter((c) => placementOf(c) !== 'property');
  const live = mine.filter(counts);
  const dueTotal = live.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const overdueCount = mine.filter(isPastDue).length;
  const pendingCount = mine.filter(isPending).length;
  const undatedCount = live.filter((c) => !c.dueDate).length;
  const needsPlaceCount = live.filter((c) => placementOf(c) === 'unassigned').length;
  const dated = live.filter((c) => c.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextBill = dated[0] || null;
  const nextOverdue = !!(nextBill && new Date(nextBill.dueDate) < now);
  return { dueTotal, openCount: live.length, overdueCount, pendingCount, undatedCount, needsPlaceCount, nextBill, nextOverdue, total: mine.length };
};

// ── Shared tile pieces ─────────────────────────────────────────────────────
const tileStyle = {
  background: '#ffffff',
  border: `1px solid ${LINE}`,
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 1px 2px rgba(30,58,95,0.05), 0 6px 16px rgba(30,58,95,0.06)',
};

const Chip = ({ tone, icon: Icon, children }) => (
  <span
    className="flex items-center gap-1 font-medium rounded-full"
    style={{ fontSize: '11.5px', color: TONE[tone].text, background: TONE[tone].bg, border: `1px solid ${TONE[tone].border}`, padding: '2px 9px' }}
  >
    {Icon && <Icon style={{ width: '11px', height: '11px' }} />} {children}
  </span>
);

const StatusPill = ({ tone, icon: Icon, children }) => (
  <div
    className="flex items-center gap-2 rounded-lg"
    style={{ background: TONE[tone].bg, border: `1px solid ${TONE[tone].border}`, padding: '8px 12px', marginTop: '12px', marginBottom: '16px', color: TONE[tone].text }}
  >
    <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
    <span className="font-semibold" style={{ fontSize: '13px' }}>{children}</span>
  </div>
);

// Dollar readout, or a calm all-clear when nothing is owed.
const DueBox = ({ allClear, clearText, dueTotal, openCount }) => (
  allClear ? (
    <div className="rounded-xl flex items-center gap-2" style={{ background: TONE.green.bg, border: `1px solid ${TONE.green.border}`, padding: '14px', marginBottom: '12px', color: TONE.green.text }}>
      <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
      <span className="font-medium" style={{ fontSize: '14px' }}>{clearText}</span>
    </div>
  ) : (
    <div className="rounded-xl" style={{ background: FIELD, border: `1px solid ${LINE_SOFT}`, padding: '12px 14px', marginBottom: '12px' }}>
      <p className="font-extrabold" style={{ fontSize: '26px', lineHeight: 1, color: NAVY }}>
        ${Math.round(dueTotal).toLocaleString()}
      </p>
      <p style={{ fontSize: '12px', color: MUTED, marginTop: '4px' }}>
        {openCount} {openCount === 1 ? 'bill' : 'bills'} owed
      </p>
    </div>
  )
);

// Bill attention chips. Red is reserved for past due; the rest are amber.
const BillChips = ({ overdueCount, pendingCount, undatedCount }) => (
  <div className="flex flex-wrap items-center gap-2" style={{ minHeight: '22px', marginBottom: 'auto' }}>
    {overdueCount > 0 && <Chip tone="red" icon={AlertCircle}>{overdueCount} past due</Chip>}
    {pendingCount > 0 && <Chip tone="amber">{pendingCount} to review</Chip>}
    {undatedCount > 0 && <Chip tone="amber">{undatedCount} no due date</Chip>}
  </div>
);

const OpenLink = () => (
  <div className="flex items-center gap-1.5 font-semibold" style={{ fontSize: '13px', color: NAVY }}>
    Open
    <ArrowRight style={{ width: '15px', height: '15px' }} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
  </div>
);

// Two-line clamp so addresses wrap instead of cutting mid-word.
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

// ── Property tile ──────────────────────────────────────────────────────────
const PropertyGlanceTile = ({ home, summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount, undatedCount, mOverdue, mSoon, mTotal } = summary;
  const allClear = openCount === 0 && overdueCount === 0;
  const hasName = !!(home.name && home.address);

  // Maintenance standing — always present so rows line up tile-to-tile.
  let maint;
  if (mTotal === 0) maint = { tone: 'quiet', icon: Wrench, text: 'Set up maintenance' };
  else if (mOverdue > 0) maint = { tone: 'amber', icon: AlertCircle, text: `${mOverdue} maintenance ${mOverdue === 1 ? 'task' : 'tasks'} overdue` };
  else if (mSoon > 0) maint = { tone: 'amber', icon: Wrench, text: `${mSoon} maintenance ${mSoon === 1 ? 'task' : 'tasks'} due this month` };
  else maint = { tone: 'green', icon: CheckCircle2, text: 'Maintenance on track' };

  // Caretaker reassurance — only when the home is genuinely fine. When it
  // isn't, the chips already say so; repeating it in a banner was noise.
  const caretakerCalm = home.managedOnBehalf && overdueCount === 0 && pendingCount === 0 && undatedCount === 0;

  return (
    <button onClick={onEnter} className={`text-left group flex flex-col w-full h-full ${LIFT} ${FOCUS}`} style={tileStyle}>
      {/* Header */}
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: NAVY }}>
          <Home style={{ width: '22px', height: '22px', color: '#ffffff' }} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Row 1 — name, falling back to address. */}
          <p className="font-semibold truncate" style={{ fontSize: '17px', color: INK }}>
            {home.name || home.address || 'Unnamed home'}
          </p>
          {/* Row 2 — address, wraps to two lines. Fixed height keeps tiles aligned. */}
          <p className="flex items-start gap-1" style={{ fontSize: '12px', lineHeight: 1.35, color: hasName ? MUTED : 'transparent', marginTop: '2px', minHeight: '32px' }} aria-hidden={hasName ? undefined : true}>
            {hasName && <MapPin style={{ width: '11px', height: '11px', flexShrink: 0, marginTop: '2px' }} />}
            <span style={clamp2}>{hasName ? home.address : '\u00A0'}</span>
          </p>
          {/* Row 3 — on-behalf, the managing-for-someone lens. */}
          <p
            className="flex items-center gap-1 truncate font-medium"
            style={{ fontSize: '11.5px', marginTop: '2px', color: home.managedOnBehalf ? GOLD_INK : 'transparent', userSelect: 'none' }}
            aria-hidden={home.managedOnBehalf ? undefined : true}
          >
            <Heart style={{ width: '10px', height: '10px', flexShrink: 0, opacity: home.managedOnBehalf ? 1 : 0, color: GOLD }} />
            {home.managedOnBehalf
              ? (home.onBehalfOfName ? `On behalf of ${home.onBehalfOfName}` : 'Managed on their behalf')
              : '\u00A0'}
          </p>
        </div>
      </div>

      <DueBox allClear={allClear} clearText="No bills to pay" dueTotal={dueTotal} openCount={openCount} />

      <BillChips overdueCount={overdueCount} pendingCount={pendingCount} undatedCount={undatedCount} />

      {caretakerCalm && (
        <div className="flex items-center gap-2" style={{ marginTop: '12px', color: TONE.green.text, fontSize: '12.5px' }}>
          <Heart style={{ width: '13px', height: '13px', flexShrink: 0 }} />
          <span className="font-medium">All quiet. Bills are current.</span>
        </div>
      )}

      <StatusPill tone={maint.tone} icon={maint.icon}>{maint.text}</StatusPill>

      <OpenLink />
    </button>
  );
};

// ── Other & unassigned tile ────────────────────────────────────────────────
// Bills with no home get a door so a late unassigned bill can't hide.
const UnplacedGlanceTile = ({ summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount, undatedCount, needsPlaceCount } = summary;
  const allClear = openCount === 0 && overdueCount === 0;

  return (
    <button onClick={onEnter} className={`text-left group flex flex-col w-full h-full ${LIFT} ${FOCUS}`} style={tileStyle}>
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        {/* Outlined badge distinguishes this from a real home. */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: FIELD, border: `1px solid ${LINE}` }}>
          <Inbox style={{ width: '22px', height: '22px', color: NAVY }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ fontSize: '17px', color: INK }}>
            Other &amp; unassigned
          </p>
          <p style={{ fontSize: '12px', lineHeight: 1.35, color: MUTED, marginTop: '2px', minHeight: '32px' }}>
            Bills not tied to a property
          </p>
          <p className="truncate" style={{ fontSize: '11.5px', marginTop: '2px', color: 'transparent', userSelect: 'none' }} aria-hidden="true">
            {'\u00A0'}
          </p>
        </div>
      </div>

      <DueBox allClear={allClear} clearText="Nothing here right now" dueTotal={dueTotal} openCount={openCount} />

      <BillChips overdueCount={overdueCount} pendingCount={pendingCount} undatedCount={undatedCount} />

      {needsPlaceCount > 0 ? (
        <StatusPill tone="amber" icon={Building}>
          {needsPlaceCount} {needsPlaceCount === 1 ? 'bill needs' : 'bills need'} a property
        </StatusPill>
      ) : (
        <StatusPill tone="quiet" icon={Inbox}>Kept here on purpose</StatusPill>
      )}

      <OpenLink />
    </button>
  );
};

// ── Portfolio summary strip ────────────────────────────────────────────────
// Past-due cell expands an inline list of exactly which bills are late.
// Forward buckets with nothing in them collapse to one "Nothing due" cell.
const PortfolioStrip = ({ stats, pastDueBills, homesById, onGoBill }) => {
  const [showPastDue, setShowPastDue] = React.useState(false);
  const toneColor = { plain: INK, amber: TONE.amber.text, red: TONE.red.text, green: TONE.green.text };
  const money = (n) => `$${Math.round(n).toLocaleString()}`;
  const billWord = (n) => `${n} ${n === 1 ? 'bill' : 'bills'}`;
  const a = stats.aging;
  const daysLate = (dateStr) => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
    return Math.round((now - due) / (24 * 60 * 60 * 1000));
  };

  const hasPastDue = a.pastDue.count > 0;
  const cells = [
    { key: 'total', label: 'Due across all homes', value: money(stats.dueTotal), sub: billWord(stats.openCount), tone: 'plain' },
    { key: 'pastdue', label: 'Past due', value: hasPastDue ? money(a.pastDue.amount) : 'None', sub: hasPastDue ? `${billWord(a.pastDue.count)} · see which` : 'All on time', tone: hasPastDue ? 'red' : 'green', clickable: hasPastDue },
  ];
  if (a.next7.count > 0) {
    cells.push({ key: 'next7', label: 'Next 7 days', value: money(a.next7.amount), sub: billWord(a.next7.count), tone: 'amber' });
  }
  if (a.next30.count > 0) {
    cells.push({ key: 'next30', label: a.next7.count > 0 ? 'Days 8–30' : 'Next 30 days', value: money(a.next30.amount), sub: billWord(a.next30.count), tone: 'plain' });
  }
  if (a.next7.count === 0 && a.next30.count === 0) {
    cells.push({ key: 'upcoming', label: 'Next 30 days', value: 'Nothing due', sub: 'You’re clear for the month', tone: 'plain' });
  }
  if (a.undated.count > 0) {
    cells.push({ key: 'undated', label: 'No due date', value: money(a.undated.amount), sub: `${billWord(a.undated.count)} · add a date`, tone: 'amber' });
  }

  const sortedPastDue = [...(pastDueBills || [])].sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate));

  return (
    <div className="bg-white" style={{ border: `1px solid ${LINE}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {cells.map((c, i) => {
          const inner = (
            <>
              <p style={{ fontSize: '12px', color: MUTED, fontWeight: 600, marginBottom: '6px' }}>
                {c.label}
                {c.clickable && <span style={{ color: TONE.red.text, marginLeft: '6px', fontSize: '10px' }}>{showPastDue ? '▲' : '▼'}</span>}
              </p>
              <p className="font-bold" style={{ fontSize: '21px', color: toneColor[c.tone], lineHeight: 1 }}>{c.value}</p>
              {c.sub && <p style={{ fontSize: '11.5px', color: FAINT, marginTop: '5px' }}>{c.sub}</p>}
            </>
          );
          const cellStyle = { padding: '16px 18px', borderLeft: i === 0 ? 'none' : `1px solid ${LINE_SOFT}` };
          return c.clickable ? (
            <button key={c.key} onClick={() => setShowPastDue((v) => !v)} className={`text-left transition-colors hover:bg-[#fef2f2] ${FOCUS}`} style={cellStyle} aria-expanded={showPastDue} title="See which bills are past due">
              {inner}
            </button>
          ) : (
            <div key={c.key} style={cellStyle}>{inner}</div>
          );
        })}
      </div>

      {showPastDue && hasPastDue && (
        <div style={{ borderTop: `1px solid ${LINE_SOFT}`, background: '#fffafa' }}>
          {sortedPastDue.map((c) => {
            const late = daysLate(c.dueDate);
            const homeName = homesById[c.homeId]?.name || homesById[c.homeId]?.address
              || (placementOf(c) === 'other' ? 'Other bills' : 'Needs placement');
            return (
              <button
                key={c.id}
                onClick={() => onGoBill(c.homeId)}
                className={`w-full flex items-center gap-3 text-left transition-colors hover:bg-[#fef2f2] ${FOCUS}`}
                style={{ padding: '10px 18px', borderTop: '1px solid #faf0f0' }}
              >
                <AlertCircle style={{ width: '14px', height: '14px', color: TONE.red.text, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ fontSize: '13px', color: INK }}>
                    {c.companyName || 'Bill'}
                    {c.amount ? <span style={{ color: MUTED, fontWeight: 400 }}>{'  ·  '}{money2(c.amount)}</span> : null}
                  </p>
                  <p className="truncate" style={{ fontSize: '11.5px', color: TONE.red.text }}>
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

// ── "Needs your eye" row ───────────────────────────────────────────────────
const NeedsYourEye = ({ items, homesById, onGoBill }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-white" style={{ border: `1px solid ${LINE}`, borderRadius: '14px', padding: '16px 18px', marginBottom: '28px' }}>
        <CheckCircle2 style={{ width: '16px', height: '16px', color: TONE.green.text, flexShrink: 0 }} />
        <span style={{ fontSize: '14px', color: MUTED }}>Nothing needs you right now. Everything&rsquo;s handled.</span>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ border: `1px solid ${LINE}`, borderRadius: '14px', padding: '8px 6px', marginBottom: '28px' }}>
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
            className={`w-full flex items-center gap-3 text-left transition-colors hover:bg-[#faf8f4] ${FOCUS}`}
            style={{ padding: '11px 12px', borderTop: i === 0 ? 'none' : '1px solid #f3efe8', borderRadius: '10px' }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '9px', background: TONE.amber.bg }}>
              {isPlacement
                ? <Building style={{ width: '16px', height: '16px', color: TONE.amber.text }} />
                : <Inbox style={{ width: '16px', height: '16px', color: TONE.amber.text }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ fontSize: '13.5px', color: INK }}>
                {it.companyName || 'Bill'}
                {it.amount ? <span style={{ color: MUTED, fontWeight: 400 }}>{'  ·  '}{money2(it.amount)}</span> : null}
              </p>
              <p className="truncate" style={{ fontSize: '11.5px', color: FAINT }}>
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
    className={`flex items-center gap-3 group bg-white ${LIFT} ${FOCUS}`}
    style={{ border: `1px solid ${LINE}`, borderRadius: '14px', padding: '16px', boxShadow: '0 1px 2px rgba(30,58,95,0.05)' }}
  >
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '42px', height: '42px', borderRadius: '11px', background: NAVY }}>
      <Icon style={{ width: '21px', height: '21px', color: '#fff' }} />
    </div>
    <div className="text-left flex-1 min-w-0">
      <p className="font-semibold" style={{ fontSize: '14.5px', color: INK }}>{label}</p>
      <p style={{ fontSize: '11.5px', color: FAINT }}>All properties</p>
    </div>
    <ArrowRight style={{ width: '16px', height: '16px', color: NAVY }} className="group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
  </button>
);

const SectionTitle = ({ children }) => (
  <h2 className="font-semibold" style={{ fontSize: '15px', color: INK, marginBottom: '12px' }}>{children}</h2>
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
        // Bills owner-scoped; maintenance fetched in parallel and fails open.
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

  const goAllProperties = (path) => {
    if (viewAllProperties) viewAllProperties();
    navigate(path);
  };

  const goHomeBills = (homeId) => {
    const home = homes.find((h) => h.id === homeId);
    if (home) switchHome(home);
    else if (viewAllProperties) viewAllProperties();
    navigate('/bill-pay');
  };

  // Bill Pay filtered to only unplaced bills (Other & unassigned scope).
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

  const portfolio = React.useMemo(() => {
    const live = bills.filter(counts);
    const dueTotal = live.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    const pendingCount = bills.filter(isPending).length;
    const aging = ageBills(bills);
    return { dueTotal, openCount: live.length, pendingCount, aging };
  }, [bills]);

  const pastDueBills = React.useMemo(() => bills.filter(isPastDue), [bills]);

  const unplaced = React.useMemo(() => summarizeUnplaced(bills), [bills]);

  // Review / placement / undated items. Overdue bills live in the strip's
  // Past due drill-down, so they're not repeated here. Capped to 4.
  const eyeItems = React.useMemo(() => {
    const pending = bills
      .filter(isPending)
      .map((c) => ({ ...c, kind: 'review' }));
    const placement = bills
      .filter((c) => needsPlacement(c))
      .map((c) => ({ ...c, kind: 'placement' }));
    const seen = new Set(placement.map((c) => c.id));
    const undated = bills
      .filter((c) => isOpen(c) && !c.dueDate && !seen.has(c.id))
      .map((c) => ({ ...c, kind: 'undated' }));
    return [...pending, ...placement, ...undated].slice(0, 4);
  }, [bills]);

  const emptySummary = { dueTotal: 0, openCount: 0, overdueCount: 0, pendingCount: 0, undatedCount: 0, nextBill: null, nextOverdue: false, mOverdue: 0, mSoon: 0, mTotal: 0 };

  const tileCount = homes.length + (!loadingBills && unplaced.total > 0 ? 1 : 0);
  const capWidth = tileCount === 1 ? '360px' : tileCount === 2 ? '760px' : '100%';

  return (
    <div className="max-w-5xl mx-auto" style={{ padding: '8px 0 80px' }}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '14px', color: MUTED }}>{greeting}, {firstName}</p>
          <h1 className="font-semibold" style={{ fontSize: '26px', color: INK, marginTop: '2px' }}>
            Your properties
          </h1>
          <p style={{ fontSize: '13.5px', color: MUTED, marginTop: '4px' }}>
            Open a home, or go straight to bills, maintenance, or records across all of them.
          </p>
        </div>
        <Link
          to="/manage-homes"
          className={`flex items-center gap-2 font-semibold flex-shrink-0 text-white ${LIFT} ${FOCUS}`}
          style={{ background: NAVY, borderRadius: '12px', padding: '10px 16px', fontSize: '13px' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add property
        </Link>
      </div>

      {!loadingBills && <PortfolioStrip stats={portfolio} pastDueBills={pastDueBills} homesById={homesById} onGoBill={goHomeBills} />}

      {/* Property tiles */}
      <div
        className="grid mx-auto items-stretch"
        style={{ gap: '16px', marginBottom: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', maxWidth: capWidth }}
      >
        {homes.map((home) => (
          <PropertyGlanceTile
            key={home.id}
            home={home}
            summary={loadingBills ? emptySummary : summarize(bills, systems, home.id)}
            onEnter={() => handleEnter(home)}
          />
        ))}
        {!loadingBills && unplaced.total > 0 && (
          <UnplacedGlanceTile summary={unplaced} onEnter={goUnplaced} />
        )}
      </div>

      <SectionTitle>Needs your eye</SectionTitle>
      {!loadingBills && (
        <NeedsYourEye items={eyeItems} homesById={homesById} onGoBill={goHomeBills} />
      )}

      <SectionTitle>Go straight to</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '12px' }}>
        <FunctionBox icon={CreditCard} label="Bills" onClick={() => goAllProperties('/bill-pay')} />
        <FunctionBox icon={Wrench} label="Maintenance" onClick={() => goAllProperties('/maintenance-management')} />
        <FunctionBox icon={FolderOpen} label="Records" onClick={() => goAllProperties('/documents')} />
      </div>
    </div>
  );
};

export default PropertiesAtAGlance;