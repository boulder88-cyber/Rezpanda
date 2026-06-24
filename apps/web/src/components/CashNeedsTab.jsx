import React, { useState } from 'react';
import { Repeat, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CASH NEEDS — a forward-looking lens on bills you already have.
//
// NOT a new module: every number here comes from existing bills (amount,
// dueDate, paymentType, homeId). It re-asks the data one question —
// "what's leaving my accounts, and when" — instead of "what do I owe."
//
// "If it's open, it's a cash need." Every unpaid bill (confirmed AND still
// in review) counts, so this view ties out to My Bills' Total Due.
//
// Shape (timeline-first, reassurance-led, nothing hidden):
//   1. Reassurance line   — plain-language "am I okay?" before any numbers
//   2. Timeline (spine)   — windowed outflows in date order, THEN a
//                           "Further out" catch-all sweeping up everything
//                           past the window so the timeline always ties to
//                           every unpaid dollar regardless of window.
//   3. Cash split         — two SEPARATE groups: what leaves your accounts
//                           now (bank + manual) vs. what goes on a card.
//   4. By grouping        — every unpaid dollar split by property / Other.
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
  //   pastDue      — due before today
  //   outflows     — due today..horizon (the forward window)
  //   beyondWindow — due after horizon (dated, just further out)
  //   undatedBills — no due date yet
  // pastDueTotal + total + beyondTotal + undatedTotal === every unpaid dollar
  // (= allUnpaidTotal), which equals My Bills' Total Due. Nothing hides.
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

  const beyondWindow = unpaid
    .filter(c => c.dueDate && new Date(c.dueDate) > horizon)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const undatedBills = unpaid.filter(c => !c.dueDate);

  const pastDueTotal = sum(pastDue);
  const total = sum(outflows);                 // in-window total
  const beyondTotal = sum(beyondWindow);
  const undatedTotal = sum(undatedBills);
  const allUnpaidTotal = pastDueTotal + total + beyondTotal + undatedTotal;

  // Everything past the selected window, swept into one catch-all so the
  // timeline never drops a bill just because the window is short.
  const furtherOutTotal = beyondTotal + undatedTotal;
  const furtherOutCount = beyondWindow.length + undatedBills.length;

  // ── Cash split over ALL unpaid dated/undated bills (not just in-window) ──
  // Two clean groups the user actually cares about:
  //   leaves your accounts now  = bank autopay + manual (real cash out)
  //   goes on a credit card     = card autopay (paid later, when the card bill lands)
  const cardTotal = sum(unpaid.filter(isCard));
  const bankAutoTotal = sum(unpaid.filter(isBankAuto));
  const manualTotal = sum(unpaid.filter(c => !isAuto(c)));
  const cashNowTotal = bankAutoTotal + manualTotal;

  const windowLabel = (WINDOWS.find(w => w.days === windowDays) || {}).label || `${windowDays} days`;

  // ── 1. Reassurance line ──
  const reassurance = (() => {
    if (pastDue.length > 0) {
      return {
        tone: 'red',
        icon: AlertCircle,
        text: `${pastDue.length} ${pastDue.length === 1 ? 'bill is' : 'bills are'} past due — ${money0(pastDueTotal)} to catch up on.`,
      };
    }
    if (allUnpaidTotal === 0) {
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
        text: `Nothing in the next ${windowLabel.toLowerCase()}, but ${money0(furtherOutTotal)} in bills sits further out — see below.`,
      };
    }
    return {
      tone: 'calm',
      icon: TrendingDown,
      text: `About ${money0(total)} due in the next ${windowLabel.toLowerCase()}, and ${money0(allUnpaidTotal)} unpaid in all.`,
    };
  })();

  const toneColor = { red: '#dc2626', green: '#059669', calm: '#1e3a5f' };
  const toneBg = { red: '#fef2f2', green: '#ecfdf5', calm: '#eef2f8' };
  const toneBorder = { red: '#fecaca', green: '#a7f3d0', calm: '#c7d7eb' };
  const RIcon = reassurance.icon;

  // By-grouping over ALL unpaid bills (not just in-window) so it ties to the
  // overall unpaid total. No-property bills surface under the Other label.
  // Built from the bills themselves, so a property with unpaid bills always
  // gets a row regardless of how many homes exist.
  const byGrouping = (() => {
    const groups = {};
    for (const c of unpaid) {
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
        if (a.key === '__other__') return 1;   // keep Other last
        if (b.key === '__other__') return -1;
        return b.amt - a.amt;
      });
  })();

  // Show the breakdown whenever it actually says something — i.e. there's more
  // than one group (multiple properties, or a property plus Other bills). A
  // single group is just the total restated, so it's hidden as redundant.
  // When scoped to "other", every bill is no-property, so there's no split.
  const showByGrouping = scope !== 'other' && byGrouping.length > 1;

  const cardStyle = { background: '#fff', border: '1px solid #e9e4db', borderRadius: '12px', boxShadow: '0 1px 3px rgba(31,39,51,0.06)' };

  // one row renderer shared by past-due, in-window, and further-out lists
  const renderRow = (c, { pastDue: isPast = false, undated = false } = {}) => {
    const auto = isAuto(c);
    const card = isCard(c);
    const d = c.dueDate ? new Date(c.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
    const tag = card
      ? { text: 'Card', color: '#534ab7', bg: '#eeedfe', icon: true }
      : auto
      ? { text: 'Auto', color: '#059669', bg: '#ecfdf5', icon: true }
      : { text: 'Manual', color: '#b45309', bg: '#fffbeb', icon: false };
    const when = undated
      ? 'no due date'
      : isPast
      ? `due ${d} · overdue`
      : card
      ? `~${d} (card)`
      : auto
      ? `drafts ~${d}`
      : `due ${d}`;
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
          {showByGrouping && homeName(c.homeId) && (
            <span style={{ fontSize: '11px', color: '#1e3a5f', background: '#eef2f8', borderRadius: '6px', padding: '1px 7px' }}>
              {homeName(c.homeId)}
            </span>
          )}
          {showByGrouping && !c.homeId && (
            <span style={{ fontSize: '11px', color: '#5b6472', background: '#f1ece3', borderRadius: '6px', padding: '1px 7px' }}>
              {otherBillsLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span style={{ fontSize: '12px', color: isPast ? '#dc2626' : '#95a0ae', fontWeight: isPast ? 600 : 400 }}>
            {when}
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

      {/* ── 2. Timeline (spine): past due → coming up → further out ──
          Every unpaid bill appears somewhere here, so the timeline's running
          parts sum to All unpaid below. The window toggle only decides where
          the line between "coming up" and "further out" falls. */}
      <div style={{ ...cardStyle, padding: '20px' }}>
        {/* header + window toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ marginBottom: '16px' }}>
          <h3 className="font-semibold" style={{ fontSize: '16px', color: '#1f2733' }}>Your bills, in time order</h3>
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

        {/* ── PAST DUE block (red, top of the list) ── */}
        {pastDue.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="flex items-center justify-between" style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
              padding: '8px 12px', marginBottom: '4px',
            }}>
              <span className="font-semibold flex items-center gap-2" style={{ fontSize: '13px', color: '#dc2626' }}>
                <AlertCircle style={{ width: '15px', height: '15px' }} />
                Past due
              </span>
              <span className="font-bold" style={{ fontSize: '14px', color: '#dc2626' }}>{money(pastDueTotal)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {pastDue.map(c => renderRow(c, { pastDue: true }))}
            </div>
          </div>
        )}

        {/* ── COMING UP block (in-window) ── */}
        <div className="flex items-baseline justify-between" style={{ marginBottom: '4px' }}>
          <span className="font-semibold" style={{ fontSize: '13px', color: '#5b6472', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Coming up · next {windowLabel.toLowerCase()}
          </span>
          <span className="font-bold" style={{ fontSize: '14px', color: '#1e3a5f' }}>{money(total)}</span>
        </div>
        {outflows.length === 0 ? (
          <div className="text-center" style={{ background: '#faf8f4', border: '1px solid #e9e4db', borderRadius: '10px', padding: '20px', fontSize: '14px', color: '#95a0ae', marginTop: '8px' }}>
            Nothing due in this window.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {outflows.map(c => renderRow(c))}
          </div>
        )}

        {/* ── FURTHER OUT catch-all: everything past the window + undated ──
            So no bill disappears just because the window is narrow. */}
        {furtherOutCount > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: '4px' }}>
              <span className="font-semibold" style={{ fontSize: '13px', color: '#5b6472', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Further out
              </span>
              <span className="font-bold" style={{ fontSize: '14px', color: '#5b6472' }}>{money(furtherOutTotal)}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#95a0ae', marginBottom: '8px' }}>
              Beyond the {windowLabel.toLowerCase()} — widen the window to bring these into the list above.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {beyondWindow.map(c => renderRow(c))}
              {undatedBills.map(c => renderRow(c, { undated: true }))}
            </div>
          </div>
        )}

        {/* running tie-out: the three blocks above sum to every unpaid dollar */}
        <div className="flex items-center justify-between" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #e9e4db' }}>
          <span className="font-bold" style={{ fontSize: '14px', color: '#1f2733' }}>All unpaid bills</span>
          <span className="font-bold" style={{ fontSize: '15px', color: '#1f2733' }}>{money(allUnpaidTotal)}</span>
        </div>
        <p style={{ fontSize: '11px', color: '#95a0ae', marginTop: '8px' }}>
          Every unpaid bill you've added is on this list — it matches Total Due in My Bills. Nothing hides.
        </p>
      </div>

      {/* ── 3. Cash split: two SEPARATE groups ── */}
      {allUnpaidTotal > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Group A — leaves your accounts now */}
          <div style={{ ...cardStyle, padding: '18px 20px' }}>
            <h4 className="font-semibold" style={{ fontSize: '13px', color: '#1f2733', marginBottom: '4px' }}>Leaves your accounts now</h4>
            <p style={{ fontSize: '11px', color: '#95a0ae', marginBottom: '14px' }}>Real cash out — bank drafts and bills you pay yourself.</p>
            <Bar label="Drafts from bank" sub="autopay" amount={bankAutoTotal} total={cashNowTotal || 1} color="#059669" />
            <div style={{ height: '10px' }} />
            <Bar label="Needs you to pay" sub="manual" amount={manualTotal} total={cashNowTotal || 1} color="#f59e0b" />
            <div className="flex items-center justify-between" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1ece3' }}>
              <span className="font-semibold" style={{ fontSize: '13px', color: '#1f2733' }}>Cash now</span>
              <span className="font-bold" style={{ fontSize: '14px', color: '#1f2733' }}>{money(cashNowTotal)}</span>
            </div>
          </div>

          {/* Group B — goes on a credit card */}
          <div style={{ ...cardStyle, padding: '18px 20px' }}>
            <h4 className="font-semibold" style={{ fontSize: '13px', color: '#1f2733', marginBottom: '4px' }}>Goes on a credit card</h4>
            <p style={{ fontSize: '11px', color: '#95a0ae', marginBottom: '14px' }}>Paid later, when your card statement comes due — not cash out today.</p>
            {cardTotal > 0 ? (
              <Bar label="Card autopay" sub="paid later" amount={cardTotal} total={cardTotal} color="#7c5cff" />
            ) : (
              <p style={{ fontSize: '13px', color: '#95a0ae' }}>No bills set to a credit card.</p>
            )}
            <div className="flex items-center justify-between" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1ece3' }}>
              <span className="font-semibold" style={{ fontSize: '13px', color: '#1f2733' }}>On a card</span>
              <span className="font-bold" style={{ fontSize: '14px', color: '#1f2733' }}>{money(cardTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. By grouping (properties + Other), ties to all unpaid ── */}
      {showByGrouping && (
        <div style={{ ...cardStyle, padding: '18px 20px' }}>
          <h4 className="font-semibold" style={{ fontSize: '13px', color: '#1f2733', marginBottom: '14px' }}>By grouping</h4>
          {byGrouping.map((p, i) => (
            <div key={p.key}>
              {i > 0 && <div style={{ height: '10px' }} />}
              <Bar label={p.label} amount={p.amt} total={allUnpaidTotal || 1} color={p.key === '__other__' ? '#5b6472' : '#1e3a5f'} />
            </div>
          ))}
          <div className="flex items-center justify-between" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1ece3' }}>
            <span className="font-semibold" style={{ fontSize: '13px', color: '#1f2733' }}>All unpaid</span>
            <span className="font-bold" style={{ fontSize: '14px', color: '#1f2733' }}>{money(allUnpaidTotal)}</span>
          </div>
        </div>
      )}

      {/* closing note */}
      <p style={{ fontSize: '12px', color: '#95a0ae', textAlign: 'center' }}>
        This view is only as complete as the bills you've added. To pay or update a bill, head to My Bills.
      </p>
    </div>
  );
};

// little labeled progress bar used in the breakdowns
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
