import React, { useState } from 'react';
import { Repeat, TrendingDown, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CASH NEEDS — a forward-looking lens on bills you already have.
//
// NOT a new module: every number here comes from existing bills (amount,
// dueDate, paymentType, homeId). It re-asks the data one question —
// "what's leaving my accounts, and when" — instead of "what do I owe."
//
// Shape (blend, timeline-first, reassurance-led):
//   1. Reassurance line   — plain-language "am I okay?" before any numbers
//   2. Timeline (spine)   — windowed (7/30/60/90d) outflows, date order,
//                           auto vs manual distinguished, running total
//   3. Breakdown          — same window sliced: auto vs manual, by property
//
// Deliberately NOT here: spending history/trends (that's Analysis), editing
// bills (that's My Bills), any new data. Forward-looking only.
//
// Built so a future "view as calendar" toggle drops into the timeline
// section without a rewrite.
// ═══════════════════════════════════════════════════════════════════════

const WINDOWS = [
  { label: 'This week', days: 7 },
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];

const isAuto = (c) => c.paymentType === 'Autopay (card)' || c.paymentType === 'Autopay (bank)';
const isCard = (c) => c.paymentType === 'Autopay (card)';
const isBankAuto = (c) => c.paymentType === 'Autopay (bank)';
const money = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;
const money0 = (n) => `$${(parseFloat(n) || 0).toFixed(0)}`;

const CashNeedsTab = ({ companies = [], homes = [], homeName = () => null, scope = 'all', otherBillsLabel = 'Other bills' }) => {
  const [windowDays, setWindowDays] = useState(30);

  const today = new Date();
  const horizon = new Date(today.getTime() + windowDays * 24 * 60 * 60 * 1000);

  // ── Bucket EVERY unpaid bill into exactly one place, so the screen ties out ──
  // Four mutually-exclusive, exhaustive buckets over unpaid bills:
  //   pastDue      — due before today (shown as rows, own subtotal)
  //   outflows     — due today..horizon, the forward window (shown as rows)
  //   beyondWindow — due after horizon (summarized — out of the window)
  //   undatedBills — no due date (summarized — can't be placed in time)
  // pastDueTotal + total + beyondTotal + undatedTotal === every unpaid dollar
  // (= allUnpaidTotal), which should equal My Bills' Total Due. Nothing hides.
  const unpaid = companies.filter(c => c.status !== 'paid');
  const sum = (arr) => arr.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);

  const pastDue = unpaid
    .filter(c => c.dueDate && new Date(c.dueDate) < stripTime(today))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const outflows = unpaid
    .filter(c => {
      if (!c.dueDate) return false;
      const d = new Date(c.dueDate);
      return d >= stripTime(today) && d <= horizon;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const beyondWindow = unpaid.filter(c => c.dueDate && new Date(c.dueDate) > horizon);
  const undatedBills = unpaid.filter(c => !c.dueDate);

  const pastDueTotal = sum(pastDue);
  const total = sum(outflows);                 // in-window total (the spine)
  const beyondTotal = sum(beyondWindow);
  const undatedTotal = sum(undatedBills);
  const allUnpaidTotal = pastDueTotal + total + beyondTotal + undatedTotal;

  // in-window cash split (past-due handled in its own section)
  const cardTotal = sum(outflows.filter(isCard));
  const bankAutoTotal = sum(outflows.filter(isBankAuto));
  const manualTotal = sum(outflows.filter(c => !isAuto(c)));
  const cashNowTotal = bankAutoTotal + manualTotal; // leaves the bank this period; card is paid later

  // overdue alias kept for the reassurance line (same set as pastDue)
  const overdue = pastDue;
  const overdueTotal = pastDueTotal;

  const windowLabel = (WINDOWS.find(w => w.days === windowDays) || {}).label || `${windowDays} days`;

  // ── 1. Reassurance line ──
  const reassurance = (() => {
    if (overdue.length > 0) {
      return {
        tone: 'red',
        icon: AlertCircle,
        text: `${overdue.length} ${overdue.length === 1 ? 'bill is' : 'bills are'} overdue — ${money0(overdueTotal)} to catch up on.`,
      };
    }
    if (outflows.length === 0 && allUnpaidTotal === 0) {
      return {
        tone: 'green',
        icon: CheckCircle2,
        text: `Nothing due from the bills you've added — you're all set.`,
      };
    }
    if (outflows.length === 0) {
      return {
        tone: 'calm',
        icon: TrendingDown,
        text: `Nothing in the next ${windowLabel.toLowerCase()}, but ${money0(allUnpaidTotal)} in bills sits outside this window — see below.`,
      };
    }
    return {
      tone: 'calm',
      icon: TrendingDown,
      text: cardTotal > 0
        ? `About ${money0(total)} in bills over the ${windowLabel.toLowerCase()} — ${money0(cashNowTotal)} leaves your accounts, ${money0(cardTotal)} goes on a card.`
        : `About ${money0(total)} leaving your accounts over the ${windowLabel.toLowerCase()}, based on what you've added.`,
    };
  })();

  const toneColor = { red: '#dc2626', green: '#059669', calm: '#1e3a5f' };
  const toneBg = { red: '#fef2f2', green: '#ecfdf5', calm: '#eef2f8' };
  const toneBorder = { red: '#fecaca', green: '#a7f3d0', calm: '#c7d7eb' };
  const RIcon = reassurance.icon;

  // Only show the by-property breakdown when there's more than one property
  // AND we're not scoped to the Other-bills bucket (where every bill is, by
  // definition, no-property — so a by-property split is meaningless).
  const showByProperty = (homes || []).length > 1 && scope !== 'other';

  // by-property grouping for the breakdown. No-home bills surface under the
  // Other-bills label.
  const byProperty = (() => {
    const groups = {};
    for (const c of outflows) {
      const key = c.homeId || '__other__';
      groups[key] = (groups[key] || 0) + (parseFloat(c.amount) || 0);
    }
    return Object.entries(groups)
      .map(([key, amt]) => ({
        key,
        label: key === '__other__' ? otherBillsLabel : (homeName(key) || 'Property'),
        amt,
      }))
      .sort((a, b) => {
        // keep Other bills last
        if (a.key === '__other__') return 1;
        if (b.key === '__other__') return -1;
        return b.amt - a.amt;
      });
  })();

  const cardStyle = { background: '#fff', border: '1px solid #e9e4db', borderRadius: '12px', boxShadow: '0 1px 3px rgba(31,39,51,0.06)' };

  // one row renderer shared by past-due and in-window lists
  const renderRow = (c, { pastDue: isPast = false } = {}) => {
    const auto = isAuto(c);
    const card = isCard(c);
    const d = new Date(c.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const tag = card
      ? { text: 'Card', color: '#534ab7', bg: '#eeedfe', icon: true }
      : auto
      ? { text: 'Auto', color: '#059669', bg: '#ecfdf5', icon: true }
      : { text: 'Manual', color: '#b45309', bg: '#fffbeb', icon: false };
    return (
      <div key={c.id} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid #f1ece3' }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium flex items-center gap-1 flex-shrink-0" style={{
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.03em',
            borderRadius: '5px', padding: '2px 7px', minWidth: '58px', justifyContent: 'center',
            color: tag.color, background: tag.bg,
          }}>
            {tag.icon ? <><Repeat style={{ width: '10px', height: '10px' }} /> {tag.text}</> : tag.text}
          </span>
          <span className="font-medium truncate" style={{ fontSize: '14px', color: '#1f2733' }}>{c.companyName}</span>
          {showByProperty && homeName(c.homeId) && (
            <span style={{ fontSize: '11px', color: '#1e3a5f', background: '#eef2f8', borderRadius: '6px', padding: '1px 7px' }}>
              {homeName(c.homeId)}
            </span>
          )}
          {showByProperty && !c.homeId && (
            <span style={{ fontSize: '11px', color: '#5b6472', background: '#f1ece3', borderRadius: '6px', padding: '1px 7px' }}>
              {otherBillsLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span style={{ fontSize: '12px', color: isPast ? '#dc2626' : '#95a0ae', fontWeight: isPast ? 600 : 400 }}>
            {isPast ? `due ${d} · overdue` : card ? `~${d} (card)` : auto ? `drafts ~${d}` : `due ${d}`}
          </span>
          <span className="font-semibold" style={{ fontSize: '14px', color: '#1f2733', minWidth: '70px', textAlign: 'right' }}>{money(c.amount)}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── 1. Reassurance hero ── */}
      <div className="flex items-center gap-3" style={{ background: toneBg[reassurance.tone], border: `1px solid ${toneBorder[reassurance.tone]}`, borderRadius: '12px', padding: '16px 18px' }}>
        <RIcon style={{ width: '20px', height: '20px', color: toneColor[reassurance.tone], flexShrink: 0 }} />
        <p className="font-semibold" style={{ fontSize: '15px', color: '#1f2733' }}>{reassurance.text}</p>
      </div>

      {/* ── Past due (own section, own subtotal — always shown when present) ── */}
      {pastDue.length > 0 && (
        <div style={{ ...cardStyle, padding: '20px', border: '1px solid #fecaca' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ fontSize: '16px', color: '#dc2626' }}>
              <AlertCircle style={{ width: '18px', height: '18px' }} />
              Past due
            </h3>
            <span className="font-bold" style={{ fontSize: '16px', color: '#dc2626' }}>{money(pastDueTotal)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {pastDue.map(c => renderRow(c, { pastDue: true }))}
          </div>
          <p style={{ fontSize: '12px', color: '#5b6472', marginTop: '12px' }}>
            These were due before today. Head to My Bills to pay or update them.
          </p>
        </div>
      )}

      {/* ── 2. Timeline (spine) ── */}
      <div style={{ ...cardStyle, padding: '20px' }}>
        {/* window toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ marginBottom: '16px' }}>
          <h3 className="font-semibold" style={{ fontSize: '16px', color: '#1f2733' }}>What's coming</h3>
          <div className="flex items-center gap-1" style={{ background: '#faf8f4', border: '1px solid #e9e4db', borderRadius: '10px', padding: '4px' }}>
            {WINDOWS.map(w => (
              <button key={w.days} onClick={() => setWindowDays(w.days)}
                className="rounded-lg transition-all font-medium"
                style={{ padding: '5px 12px', fontSize: '12px',
                  background: windowDays === w.days ? '#1e3a5f' : 'transparent',
                  color: windowDays === w.days ? '#fff' : '#5b6472' }}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* running total */}
        <div className="flex items-baseline gap-2" style={{ marginBottom: '4px' }}>
          <span className="font-extrabold" style={{ fontSize: '30px', color: '#1e3a5f', lineHeight: 1 }}>{money0(total)}</span>
          <span style={{ fontSize: '13px', color: '#95a0ae' }}>total over the {windowLabel.toLowerCase()}</span>
        </div>
        {total > 0 && (
          <p style={{ fontSize: '12px', color: '#5b6472', marginBottom: '16px' }}>
            {money0(bankAutoTotal)} drafts from bank · {money0(manualTotal)} needs you to pay
            {cardTotal > 0 && <> · {money0(cardTotal)} on a card <span style={{ color: '#95a0ae' }}>(paid later)</span></>}
          </p>
        )}

        {/* the outflows, date order */}
        {outflows.length === 0 ? (
          <div className="text-center" style={{ background: '#faf8f4', border: '1px solid #e9e4db', borderRadius: '10px', padding: '24px', fontSize: '14px', color: '#95a0ae' }}>
            Nothing scheduled in this window.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {outflows.map(c => renderRow(c))}
          </div>
        )}
      </div>

      {/* ── 3. Breakdown ── */}
      {outflows.length > 0 && (
        <div className={`grid grid-cols-1 ${showByProperty ? 'lg:grid-cols-2' : ''} gap-4`}>
          {/* How it pulls */}
          <div style={{ ...cardStyle, padding: '18px 20px' }}>
            <h4 className="font-semibold" style={{ fontSize: '13px', color: '#1f2733', marginBottom: '14px' }}>How it pulls</h4>
            <Bar label="Drafts from bank" sub="autopay — cash now" amount={bankAutoTotal} total={total} color="#059669" />
            <div style={{ height: '10px' }} />
            <Bar label="Needs you to pay" sub="manual — cash now" amount={manualTotal} total={total} color="#f59e0b" />
            {cardTotal > 0 && (
              <>
                <div style={{ height: '10px' }} />
                <Bar label="On a credit card" sub="not cash now — paid later" amount={cardTotal} total={total} color="#7c5cff" />
              </>
            )}
            <p style={{ fontSize: '11px', color: '#95a0ae', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1ece3' }}>
              {money0(cashNowTotal)} actually leaves your accounts this period. Card charges are paid later when your card bill comes due.
            </p>
          </div>

          {/* By property */}
          {showByProperty && (
            <div style={{ ...cardStyle, padding: '18px 20px' }}>
              <h4 className="font-semibold" style={{ fontSize: '13px', color: '#1f2733', marginBottom: '14px' }}>By property</h4>
              {byProperty.map((p, i) => (
                <div key={p.key}>
                  {i > 0 && <div style={{ height: '10px' }} />}
                  <Bar label={p.label} amount={p.amt} total={total} color="#1e3a5f" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Reconciliation: account for every unpaid dollar so it ties out ── */}
      <div style={{ ...cardStyle, padding: '18px 20px' }}>
        <h4 className="font-semibold" style={{ fontSize: '13px', color: '#1f2733', marginBottom: '12px' }}>The full picture</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pastDueTotal > 0 && (
            <ReconLine label="Past due" sub={`${pastDue.length} ${pastDue.length === 1 ? 'bill' : 'bills'}`} amount={pastDueTotal} color="#dc2626" />
          )}
          <ReconLine label={`Due in the ${windowLabel.toLowerCase()}`} sub={`${outflows.length} ${outflows.length === 1 ? 'bill' : 'bills'}`} amount={total} color="#1e3a5f" />
          {beyondTotal > 0 && (
            <ReconLine label="Later — beyond this window" sub={`${beyondWindow.length} ${beyondWindow.length === 1 ? 'bill' : 'bills'}, widen the window to see`} amount={beyondTotal} color="#5b6472" />
          )}
          {undatedTotal > 0 && (
            <ReconLine label="No due date yet" sub={`${undatedBills.length} ${undatedBills.length === 1 ? 'bill' : 'bills'}, add a date in My Bills`} amount={undatedTotal} color="#b45309" />
          )}
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e9e4db' }}>
          <span className="font-bold" style={{ fontSize: '14px', color: '#1f2733' }}>All unpaid bills</span>
          <span className="font-bold" style={{ fontSize: '15px', color: '#1f2733' }}>{money(allUnpaidTotal)}</span>
        </div>
        <p style={{ fontSize: '11px', color: '#95a0ae', marginTop: '10px' }}>
          This is every unpaid bill you've added, in one place — it should match Total Due in My Bills. The timeline above shows only what falls inside the {windowLabel.toLowerCase()}; the rest is accounted for here so nothing hides.
        </p>
      </div>

      {/* closing note */}
      <p style={{ fontSize: '12px', color: '#95a0ae', textAlign: 'center' }}>
        This view is only as complete as the bills you've added. To pay or update a bill, head to My Bills.
      </p>
    </div>
  );
};

// reconciliation line: label + small sub on the left, amount on the right
const ReconLine = ({ label, sub, amount, color }) => (
  <div className="flex items-center justify-between">
    <div className="min-w-0">
      <span className="font-medium" style={{ fontSize: '13px', color: color || '#1f2733' }}>{label}</span>
      {sub && <span style={{ fontSize: '11px', color: '#95a0ae', marginLeft: '6px' }}>{sub}</span>}
    </div>
    <span className="font-semibold flex-shrink-0" style={{ fontSize: '13px', color: '#1f2733' }}>{`$${(parseFloat(amount) || 0).toFixed(2)}`}</span>
  </div>
);

// little labeled progress bar used in the breakdown
const Bar = ({ label, sub, amount, total, color }) => {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
        <div>
          <span className="font-medium" style={{ fontSize: '13px', color: '#1f2733' }}>{label}</span>
          {sub && <span style={{ fontSize: '11px', color: '#95a0ae', marginLeft: '6px' }}>{sub}</span>}
        </div>
        <span className="font-semibold" style={{ fontSize: '13px', color: '#1f2733' }}>
          {money0(amount)} <span style={{ color: '#95a0ae', fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ background: '#f1ece3', borderRadius: '999px', height: '6px' }}>
        <div style={{ width: `${pct}%`, height: '6px', borderRadius: '999px', background: color, transition: 'width 0.2s' }} />
      </div>
    </div>
  );
};

// normalize to start-of-day so "due today" counts as upcoming, not past
function stripTime(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default CashNeedsTab;
