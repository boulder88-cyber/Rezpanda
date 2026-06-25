import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Clock, HelpCircle, Inbox } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// COVERAGE VIEW — "is anything missing?"
//
// A completeness check layered over the bills already ingested. Two layers,
// deliberately NON-OVERLAPPING (one fact lives in exactly one layer):
//
//   LAYER 1 — per-biller cadence (the spine). For each biller we have bills
//     from, infer its rhythm (monthly / bimonthly / quarterly …) from the gaps
//     between its own bills, then check whether the next expected one has shown
//     up. This is the "5 electric, 4 gas → I missed one" detector, automated.
//
//   LAYER 2 — category coverage (the safety net). Catches Layer 1's blind
//     spot: a whole category that USED to appear and now has no biller at all.
//     Layer 1 can't see a biller that produces no rows; Layer 2 can. A category
//     that still HAS a biller belongs to Layer 1 and is never re-flagged here.
//
// Reads `invoices` (live bills, incl. unpaid) — NOT payment_history — because a
// received-but-unpaid bill still counts as "covered." Pure derivation: no new
// schema, no migration. Accuracy grows as history accumulates (we say so).
// ═══════════════════════════════════════════════════════════════════════

// Design tokens (inline-style discipline — navy/gold system).
const INK = '#1f2733';
const INK_SOFT = '#5b6472';
const INK_MUTE = '#95a0ae';
const BORDER = '#e9e4db';
const PAGE = '#faf8f4';
const GREEN = '#059669';
const AMBER = '#f59e0b';
const NAVY = '#1e3a5f';

const DAY = 86400000;

// A bill's timeline anchor: dueDate if present, else the received timestamp
// (forwardedAt). Returns a Date or null.
const billDate = (b) => {
  const raw = b.dueDate || b.forwardedAt || '';
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

// Bucket a median gap (in days) into a human cadence label + expected days.
const cadenceFromGap = (days) => {
  if (days <= 0) return null;
  if (days <= 24) return { label: 'every couple weeks', period: days };
  if (days <= 45) return { label: 'monthly', period: 30 };
  if (days <= 75) return { label: 'every other month', period: 61 };
  if (days <= 135) return { label: 'quarterly', period: 91 };
  if (days <= 270) return { label: 'twice a year', period: 182 };
  return { label: 'yearly', period: 365 };
};

const median = (arr) => {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Human "how long ago" from a day count, for surfacing staleness at a glance.
const agoLabel = (days) => {
  if (days == null) return '';
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months === 1) return 'about a month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.round(days / 365);
  return years === 1 ? 'about a year ago' : `${years} years ago`;
};

const CoverageView = ({ companies = [], homeNameById = null }) => {
  const { billerRows, missingCategories, totalBillers, multiProperty } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Does this view span more than one property? If so, the same provider can
    // serve two homes and we must NOT collapse them — two homes' streams merged
    // into one row would invent a false rhythm and mis-flag gaps. We group by
    // biller + home and label the property; in a single-home view the label is
    // noise, so we suppress it.
    const homeIds = new Set(companies.map((c) => c.homeId || '').filter(Boolean));
    const multiProperty = homeIds.size > 1;

    // ── Group bills by biller (companyName) + property (homeId) ──
    // The key includes homeId so "Georgia Power · Home" and "Georgia Power ·
    // Rental" are separate billers, each judged on its own cadence.
    const byBiller = {};
    for (const c of companies) {
      const name = (c.companyName || 'Unknown').trim();
      const hid = c.homeId || '';
      const key = name + '\u0000' + hid; // NUL separator can't appear in a name
      if (!byBiller[key]) byBiller[key] = { name, homeId: hid, bills: [], category: c.category || 'Other' };
      byBiller[key].bills.push(c);
      if (!byBiller[key].category && c.category) byBiller[key].category = c.category;
    }

    // ── LAYER 1: per-biller cadence rows ──
    const billerRows = Object.values(byBiller).map((b) => {
      const dates = b.bills.map(billDate).filter(Boolean).sort((a, z) => a - z);
      const count = b.bills.length;
      const last = dates.length ? dates[dates.length - 1] : null;
      const daysSinceLast = last ? Math.round((today - last) / DAY) : null;

      // Not enough dated history to judge a rhythm yet. We still surface the
      // last-received date, and if that single/sparse bill is itself old, flag
      // it amber — "one bill, and it was a while ago" is a real silent gap we
      // can show even without a known cadence.
      if (dates.length < 2) {
        const stale = daysSinceLast != null && daysSinceLast > 45;
        return { name: b.name, homeId: b.homeId, category: b.category, count, state: 'learning', cadence: null, last, daysSinceLast, expected: null, stale };
      }

      const gaps = [];
      for (let i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i - 1]) / DAY);
      const cadence = cadenceFromGap(median(gaps));

      if (!cadence) {
        const stale = daysSinceLast != null && daysSinceLast > 45;
        return { name: b.name, homeId: b.homeId, category: b.category, count, state: 'learning', cadence: null, last, daysSinceLast, expected: null, stale };
      }

      // Expected next bill ≈ last + cadence period. Flag only when we're past a
      // generous grace window (1.5× the period) — conservative, to avoid crying
      // wolf on a biller that's just a little late.
      const expected = new Date(last.getTime() + cadence.period * DAY);
      const overdue = daysSinceLast > cadence.period * 1.5;

      return {
        name: b.name, homeId: b.homeId, category: b.category, count, cadence, last, daysSinceLast, expected,
        state: overdue ? 'gap' : 'ok',
      };
    }).sort((a, z) => {
      // Gaps first (actionable), then learning, then ok; alpha within.
      const rank = (s) => (s === 'gap' ? 0 : s === 'learning' ? 1 : 2);
      if (rank(a.state) !== rank(z.state)) return rank(a.state) - rank(z.state);
      return a.name.localeCompare(z.name);
    });

    // ── LAYER 2: category coverage (only categories with NO current biller) ──
    // "Established" = a category we've seen in history. A category that still
    // has a biller is owned by Layer 1, so we exclude any category present in
    // the current biller set.
    const categoriesWithBiller = new Set(
      Object.values(byBiller).map((b) => (b.category || 'Other'))
    );
    const everSeen = new Set(
      companies.map((c) => (c.category || 'Other')).filter((cat) => cat && cat !== 'Other')
    );
    // A category is "missing entirely" only if we've seen it before AND it has
    // no biller now. (In a single dataset this is rare — it mostly fires after
    // a biller is deleted — but it's the structural safety net.)
    const missingCategories = [...everSeen].filter((cat) => !categoriesWithBiller.has(cat));

    return { billerRows, missingCategories, totalBillers: Object.keys(byBiller).length, multiProperty };
  }, [companies]);

  const cardStyle = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', boxShadow: '0 1px 3px rgba(31,39,51,0.06)' };

  if (totalBillers === 0) {
    return (
      <div style={{ ...cardStyle, padding: '40px 24px', textAlign: 'center' }}>
        <Inbox style={{ width: '32px', height: '32px', color: INK_MUTE, margin: '0 auto 12px' }} />
        <p style={{ fontSize: '15px', color: INK_SOFT, marginBottom: '4px' }}>Nothing to check yet.</p>
        <p style={{ fontSize: '13px', color: INK_MUTE }}>As bills come in, this view learns each biller's rhythm and flags anything that looks missing.</p>
      </div>
    );
  }

  const gapCount = billerRows.filter((r) => r.state === 'gap' || (r.state === 'learning' && r.stale)).length + missingCategories.length;

  return (
    <div style={{ ...cardStyle, padding: '20px' }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: '4px' }}>
        <h2 className="font-semibold" style={{ fontSize: '18px', color: INK }}>Coverage</h2>
        <span style={{ fontSize: '13px', color: gapCount > 0 ? AMBER : GREEN }}>
          {gapCount > 0 ? `${gapCount} to look at` : 'All caught up'}
        </span>
      </div>
      <p style={{ fontSize: '13px', color: INK_SOFT, marginBottom: '16px' }}>
        Each biller's expected rhythm, and whether the latest bill has arrived.
      </p>

      {/* Layer 2: whole categories that went quiet (safety net, shown first) */}
      {missingCategories.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          {missingCategories.map((cat) => (
            <div key={cat} className="flex items-start gap-3" style={{ padding: '12px 14px', border: `1px solid #fde68a`, background: '#fffbeb', borderRadius: '10px', marginBottom: '8px' }}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: AMBER, flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: INK }}>You usually have {cat.toLowerCase()} — nothing tracked now</div>
                <div style={{ fontSize: '12px', color: INK_SOFT, marginTop: '2px' }}>A {cat.toLowerCase()} bill used to come in but there's no biller for it anymore. Add one if it's still active.</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Layer 1: per-biller cadence rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {billerRows.map((r) => {
          const learningStale = r.state === 'learning' && r.stale;
          const tone =
            r.state === 'gap' ? { icon: AlertTriangle, color: AMBER, bg: '#fffbeb', border: '#fde68a' }
            : learningStale ? { icon: AlertTriangle, color: AMBER, bg: '#fffbeb', border: '#fde68a' }
            : r.state === 'learning' ? { icon: Clock, color: INK_MUTE, bg: '#fff', border: BORDER }
            : { icon: CheckCircle2, color: GREEN, bg: '#f6fcf9', border: BORDER };
          const Icon = tone.icon;
          const propLabel = (multiProperty && r.homeId && homeNameById) ? homeNameById(r.homeId) : null;
          return (
            <div key={r.name + '\u0000' + (r.homeId || '')} className="flex items-center justify-between" style={{ padding: '12px 14px', border: `1px solid ${tone.border}`, background: tone.bg, borderRadius: '10px' }}>
              <div className="flex items-center gap-3 min-w-0">
                <Icon style={{ width: '18px', height: '18px', color: tone.color, flexShrink: 0 }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate" style={{ fontSize: '14px', color: INK }}>{r.name}</span>
                    {propLabel && (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: NAVY, background: '#eef4fb', border: '1px solid #cdddef', borderRadius: '6px', padding: '1px 7px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {propLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: INK_SOFT }}>
                    {r.state === 'gap' && r.cadence && r.expected && r.last &&
                      `Usually ${r.cadence.label} · last on ${fmtDate(r.last)} (${agoLabel(r.daysSinceLast)}) · next was expected around ${fmtDate(r.expected)}`}
                    {r.state === 'learning' && r.last &&
                      `${r.count} ${r.count === 1 ? 'bill' : 'bills'} so far · last on ${fmtDate(r.last)} (${agoLabel(r.daysSinceLast)})${r.stale ? ' · nothing recent' : ' · still learning the rhythm'}`}
                    {r.state === 'learning' && !r.last &&
                      `${r.count} ${r.count === 1 ? 'bill' : 'bills'} so far · no dated bill yet`}
                    {r.state === 'ok' && r.cadence && r.last &&
                      `${r.cadence.label.charAt(0).toUpperCase() + r.cadence.label.slice(1)} · last on ${fmtDate(r.last)} (${agoLabel(r.daysSinceLast)})`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                <div style={{ fontSize: '12px', color: INK, fontWeight: 500 }}>{r.last ? fmtDate(r.last) : '—'}</div>
                <div style={{ fontSize: '11px', color: INK_MUTE }}>{r.count} {r.count === 1 ? 'bill' : 'bills'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accuracy-grows note */}
      <div className="flex items-start gap-2" style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${BORDER}` }}>
        <HelpCircle style={{ width: '13px', height: '13px', color: INK_MUTE, flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '11px', color: INK_MUTE, lineHeight: 1.5 }}>
          Coverage gets sharper as your history grows — the more bills CasaCEO has seen from a biller, the better it knows that biller's rhythm. Early on, some billers will still be learning.
        </p>
      </div>
    </div>
  );
};

export default CoverageView;
