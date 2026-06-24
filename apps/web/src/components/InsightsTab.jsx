import React, { useState, useMemo } from 'react';
import {
  Zap, Droplets, Wifi, Shield, Car, CreditCard, Package, Heart, Repeat,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// INSIGHTS TAB  (was "Overview")
//
// A calm read on where the money goes. Reads the FULL scoped invoice set
// (open + cleared) so YTD / average / latest are real history, not just the
// bills currently in front of you. Two dimensions, user-toggled:
//   • By category  — groups on the invoice's `category` field (free text the
//     user tagged in Review), normalized lightly. Uncategorized is its own
//     visible group — nothing invisible.
//   • By vendor    — groups on the vendor name (companyName).
// And a Spend / Count measure toggle (#6 "count types").
//
// Money rule honored: aggregates (average, YTD, group total) round to whole
// dollars; the LATEST bill is a real bill amount, shown to 2 decimals.
//
// Graphs are hand-drawn SVG (no chart library): a soft horizontal share bar
// per group + a small monthly sparkline of that group's spend over time.
// Design-system tokens only (navy / gold sparingly / warm surfaces).
// ═══════════════════════════════════════════════════════════════════════

const INK = '#1f2733';
const INK_MID = '#5b6472';
const INK_LIGHT = '#95a0ae';
const BORDER = '#e9e4db';
const NAVY = '#1e3a5f';

const money0 = (n) => `$${Math.round(parseFloat(n) || 0).toLocaleString('en-US')}`;

// Light category normalization: trim + lower for the key, Title Case for label.
// We group on what the user actually tagged rather than guessing from the name.
const normCategory = (raw) => {
  const t = (raw || '').trim();
  if (!t) return { key: '__uncat__', label: 'Uncategorized' };
  return { key: t.toLowerCase(), label: t.charAt(0).toUpperCase() + t.slice(1) };
};

// Icon + accent per known category (falls back to a neutral chip otherwise).
// Accent is used sparingly — a small icon tile, not a flood of color.
const CATEGORY_STYLE = {
  electric: { icon: Zap, color: '#d97706' },
  power: { icon: Zap, color: '#d97706' },
  energy: { icon: Zap, color: '#d97706' },
  gas: { icon: Zap, color: '#d97706' },
  water: { icon: Droplets, color: '#0891b2' },
  sewer: { icon: Droplets, color: '#0891b2' },
  trash: { icon: Package, color: '#64748b' },
  internet: { icon: Wifi, color: '#7c3aed' },
  cable: { icon: Wifi, color: '#7c3aed' },
  phone: { icon: Wifi, color: '#7c3aed' },
  insurance: { icon: Shield, color: '#059669' },
  auto: { icon: Car, color: '#2563eb' },
  subscription: { icon: Repeat, color: '#7c3aed' },
  charitable: { icon: Heart, color: '#dc2626' },
};
const styleFor = (key) => CATEGORY_STYLE[key] || { icon: CreditCard, color: NAVY };

const monthKey = (d) => {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

// The date a bill should be attributed to for YTD / month bucketing. dueDate is
// the truest (service period), but MANY bills have no dueDate — a bill with no
// date must still count, or spend silently leaks out of YTD and the trend.
// Fall back through the dates a bill realistically carries, newest-meaning
// first, so an undated bill lands in the period it actually arrived.
const billDate = (b) =>
  b.dueDate || b.paidDate || b.reviewedDate || b.forwardedAt || b.created || null;

// Build a monthly series (oldest→newest) of summed amounts for a set of bills,
// keyed off the best-available date. Empty months are 0 so the line reads an
// honest gap rather than collapsing time. `months` defaults to 12 (per-card
// sparkline); the headline outflow line passes 13 (a full year + this month).
const monthlySeries = (bills, months = 12) => {
  const now = new Date();
  const slots = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, total: 0 });
  }
  const idx = Object.fromEntries(slots.map((s, i) => [s.key, i]));
  for (const b of bills) {
    const mk = monthKey(billDate(b));
    if (mk != null && mk in idx) slots[idx[mk]].total += parseFloat(b.amount) || 0;
  }
  return slots;
};

// Hand-drawn sparkline. Flat baseline when there's nothing to show.
const Sparkline = ({ series, color }) => {
  const w = 96, h = 28, pad = 2;
  const vals = series.map(s => s.total);
  const max = Math.max(...vals, 0);
  if (max <= 0) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad}
          stroke={BORDER} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const n = series.length;
  const x = (i) => pad + (i * (w - pad * 2)) / (n - 1);
  const y = (v) => h - pad - (v / max) * (h - pad * 2);
  const pts = series.map((s, i) => `${x(i)},${y(s.total)}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `M ${x(0)},${h - pad} L ${pts.join(' L ')} L ${x(n - 1)},${h - pad} Z`;
  const last = series[n - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={areaPath} fill={color} opacity="0.10" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75"
        strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(n - 1)} cy={y(last.total)} r="2.5" fill={color} />
    </svg>
  );
};

// ── Headline: total monthly outflow over the last 13 months ──
// The story the tab opens with — is the cost of running this home drifting?
// One navy area/line, month ticks, latest month + MoM delta called out.
const OutflowLine = ({ series }) => {
  const w = 720, h = 150;
  const padL = 8, padR = 8, padT = 14, padB = 26;
  const vals = series.map(s => s.total);
  const max = Math.max(...vals, 0);
  const n = series.length;
  const x = (i) => padL + (i * (w - padL - padR)) / (n - 1);
  const y = (v) => max > 0 ? (h - padB - (v / max) * (h - padT - padB)) : (h - padB);

  const monthLabel = (key) => {
    const [yr, mo] = key.split('-').map(Number);
    return new Date(yr, mo - 1, 1).toLocaleDateString('en-US', { month: 'short' });
  };

  const pts = series.map((s, i) => `${x(i)},${y(s.total)}`);
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `M ${x(0)},${h - padB} L ${pts.join(' L ')} L ${x(n - 1)},${h - padB} Z`;

  const last = series[n - 1];
  const prev = series[n - 2] || { total: 0 };
  const delta = last.total - prev.total;
  const deltaPct = prev.total > 0 ? Math.round((delta / prev.total) * 100) : null;

  const tickEvery = Math.max(1, Math.round(n / 6));

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: '4px' }}>
        <div>
          <p className="font-semibold" style={{ fontSize: '15px', color: INK }}>Total outflow</p>
          <p style={{ fontSize: '11px', color: INK_LIGHT }}>Your tracked bills monthly outflow · last 13 months</p>
        </div>
        <div className="text-right">
          <p className="font-bold" style={{ fontSize: '22px', color: NAVY, lineHeight: 1 }}>{money0(last.total)}</p>
          <p style={{ fontSize: '11px', color: INK_LIGHT, marginTop: '2px' }}>
            {monthLabel(last.key)}
            {deltaPct != null && (
              <span style={{ color: delta > 0 ? '#dc2626' : delta < 0 ? '#059669' : INK_LIGHT, marginLeft: '6px', fontWeight: 600 }}>
                {delta > 0 ? '▲' : delta < 0 ? '▼' : ''} {Math.abs(deltaPct)}% vs prev
              </span>
            )}
          </p>
        </div>
      </div>
      {max <= 0 ? (
        <div className="text-center" style={{ padding: '24px 0', fontSize: '13px', color: INK_LIGHT }}>
          No dated spend yet — your monthly trend fills in as bills come through.
        </div>
      ) : (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none" aria-hidden="true">
          <path d={areaPath} fill={NAVY} opacity="0.07" />
          <path d={linePath} fill="none" stroke={NAVY} strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {series.map((s, i) => (
            <circle key={i} cx={x(i)} cy={y(s.total)} r={i === n - 1 ? 3.5 : 2}
              fill={i === n - 1 ? NAVY : '#fff'} stroke={NAVY} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s, i) => (i % tickEvery === 0 || i === n - 1) ? (
            <text key={`t${i}`} x={x(i)} y={h - 8} textAnchor="middle"
              style={{ fontSize: '10px', fill: INK_LIGHT }}>{monthLabel(s.key)}</text>
          ) : null)}
        </svg>
      )}
    </div>
  );
};

const InsightsTab = ({ companies = [] }) => {
  const [dimension, setDimension] = useState('category'); // 'category' | 'vendor'
  const [measure, setMeasure] = useState('spend');        // 'spend'    | 'count'

  const thisYear = new Date().getFullYear();

  // Group the full scoped set by the chosen dimension.
  const groups = useMemo(() => {
    const map = new Map();
    for (const c of companies) {
      let key, label, accentKey;
      if (dimension === 'vendor') {
        const name = (c.companyName || '').trim() || 'Unknown vendor';
        key = name.toLowerCase();
        label = name;
        accentKey = normCategory(c.category).key; // icon hints from its category
      } else {
        const nc = normCategory(c.category);
        key = nc.key; label = nc.label; accentKey = nc.key;
      }
      if (!map.has(key)) map.set(key, { key, label, accentKey, bills: [] });
      map.get(key).bills.push(c);
    }

    const rows = [];
    for (const g of map.values()) {
      const amt = (b) => parseFloat(b.amount) || 0;
      const total = g.bills.reduce((s, b) => s + amt(b), 0);
      const count = g.bills.length;
      const avg = count > 0 ? total / count : 0;

      // YTD: bills attributed to the current calendar year, using the best
      // available date (so an undated bill still counts — it can't vanish).
      const ytd = g.bills
        .filter(b => { const d = new Date(billDate(b)); return !isNaN(d) && d.getFullYear() === thisYear; })
        .reduce((s, b) => s + amt(b), 0);

      // Latest: most recent bill by best-available date (a real bill amount).
      // Uses the date fallback so an undated bill still surfaces its amount
      // rather than collapsing to "—".
      const dated = g.bills
        .map(b => ({ b, d: billDate(b) }))
        .filter(x => x.d && !isNaN(new Date(x.d)));
      let latest = null;
      if (dated.length) {
        const top = dated.reduce((best, x) =>
          new Date(x.d) > new Date(best.d) ? x : best, dated[0]);
        latest = top.b;
      }

      rows.push({
        ...g, total, count, avg, ytd,
        latestAmount: latest ? amt(latest) : null,
        latestDate: latest ? billDate(latest) : null,
        latestDated: latest ? !!latest.dueDate : false,
        series: monthlySeries(g.bills),
      });
    }

    const measureVal = (r) => (measure === 'count' ? r.count : r.total);
    rows.sort((a, b) => measureVal(b) - measureVal(a));
    return rows;
  }, [companies, dimension, measure, thisYear]);

  const grandMeasure = groups.reduce(
    (s, r) => s + (measure === 'count' ? r.count : r.total), 0);

  // Headline trend: total spend per month across ALL bills in scope, 13 months.
  const outflowSeries = useMemo(() => monthlySeries(companies, 13), [companies]);

  const fmtDate = (d) => {
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const Toggle = ({ value, set, options }) => (
    <div className="flex items-center bg-white rounded-xl" style={{ border: `1px solid ${BORDER}`, padding: '4px' }}>
      {options.map(o => (
        <button key={o.key} onClick={() => set(o.key)}
          className="rounded-lg transition-all font-medium"
          style={{
            padding: '5px 14px', fontSize: '12px',
            background: value === o.key ? NAVY : 'transparent',
            color: value === o.key ? '#fff' : INK_MID,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );

  if (!companies.length) {
    return (
      <div className="bg-white text-center" style={{ borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '40px', fontSize: '14px', color: INK_LIGHT }}>
        Add some bills to see your spending insights.
      </div>
    );
  }

  return (
    <div>
      {/* Headline: total monthly outflow over 13 months */}
      <OutflowLine series={outflowSeries} />

      {/* Controls: dimension + measure */}
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: '20px' }}>
        <Toggle
          value={dimension} set={setDimension}
          options={[{ key: 'category', label: 'By category' }, { key: 'vendor', label: 'By vendor' }]}
        />
        <Toggle
          value={measure} set={setMeasure}
          options={[{ key: 'spend', label: 'Spend' }, { key: 'count', label: 'Count' }]}
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((r) => {
          const st = styleFor(r.accentKey);
          const Icon = st.icon;
          const measureVal = measure === 'count' ? r.count : r.total;
          const pct = grandMeasure > 0 ? Math.round((measureVal / grandMeasure) * 100) : 0;
          return (
            <div key={r.key} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {/* Header: icon + label + share */}
              <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center flex-shrink-0"
                    style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${st.color}14` }}>
                    <Icon style={{ width: '16px', height: '16px', color: st.color }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontSize: '14px', color: INK }}>{r.label}</p>
                    <p style={{ fontSize: '11px', color: INK_LIGHT }}>
                      {r.count} {r.count === 1 ? 'bill' : 'bills'}
                    </p>
                  </div>
                </div>
                <Sparkline series={r.series} color={st.color} />
              </div>

              {/* Soft share bar */}
              <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: INK_LIGHT }}>
                  {measure === 'count' ? 'Share of bills' : 'Share of spend'}
                </span>
                <span className="font-medium" style={{ fontSize: '12px', color: INK_MID }}>
                  {measure === 'count' ? `${r.count}` : money0(r.total)} <span style={{ color: INK_LIGHT }}>({pct}%)</span>
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '999px', background: '#f1ede5', marginBottom: '14px' }}>
                <div style={{ width: `${pct}%`, height: '6px', borderRadius: '999px', background: st.color, transition: 'width .3s' }} />
              </div>

              {/* Three figures: latest / average / YTD */}
              <div className="grid grid-cols-3" style={{ gap: '8px' }}>
                <Figure label="Latest bill"
                  value={r.latestAmount != null ? money0(r.latestAmount) : '—'}
                  sub={r.latestDate ? (r.latestDated ? fmtDate(r.latestDate) : `${fmtDate(r.latestDate)} · received`) : 'no bills'} />
                <Figure label="Average" value={money0(r.avg)} sub={`over ${r.count}`} />
                <Figure label={`YTD ${thisYear}`} value={money0(r.ytd)} sub="this year" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Figure = ({ label, value, sub }) => (
  <div>
    <p className="uppercase tracking-wide" style={{ fontSize: '9px', color: '#95a0ae', marginBottom: '3px', fontWeight: 600 }}>{label}</p>
    <p className="font-bold" style={{ fontSize: '16px', color: '#1f2733', lineHeight: 1.1 }}>{value}</p>
    <p style={{ fontSize: '10px', color: '#b5bdc8', marginTop: '1px' }}>{sub}</p>
  </div>
);

export default InsightsTab;
