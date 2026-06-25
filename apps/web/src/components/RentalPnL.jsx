import React, { useState, useEffect, useCallback, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  Calculator, TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  Pencil, Check, X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// RentalPnL — the tax-ready profit & loss for ONE rental property.
//
// Income (confirmed rent receipts for this property) minus expenses (this
// property's invoices), with every expense sorted onto a Schedule E line.
// The line is auto-mapped from the bill category by default; the user can
// override it per expense (stored in the invoice's schedECategory field).
// Empty schedECategory = use the auto-map. This is the slice where the rent
// you can now see and the bills you already track meet as per-property profit.
//
// Scope: a calendar-year view (tax years are annual), defaulting to the
// current year, with a simple year selector. Money rule: whole dollars for
// the summary and line subtotals, 2dp on individual expense rows.
//
// "See, don't do": this computes and presents the numbers a landlord hands
// their accountant. It is not tax advice and files nothing.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_MUTED = '#5b6472';
const INK_FAINT = '#95a0ae';
const BORDER = '#e9e4db';
const SURFACE = '#ffffff';
const PAGE = '#faf8f4';
const GREEN = '#059669';
const RED = '#dc2626';

// ── Schedule E expense lines (IRS Form 1040 Schedule E, Part I) ──────────
// The canonical line list. Each expense lands on exactly one of these.
const SCHED_E_LINES = [
  { key: 'advertising', line: 5, label: 'Advertising' },
  { key: 'auto_travel', line: 6, label: 'Auto and travel' },
  { key: 'cleaning_maintenance', line: 7, label: 'Cleaning and maintenance' },
  { key: 'commissions', line: 8, label: 'Commissions' },
  { key: 'insurance', line: 9, label: 'Insurance' },
  { key: 'legal_professional', line: 10, label: 'Legal and professional fees' },
  { key: 'management_fees', line: 11, label: 'Management fees' },
  { key: 'mortgage_interest', line: 12, label: 'Mortgage interest' },
  { key: 'other_interest', line: 13, label: 'Other interest' },
  { key: 'repairs', line: 14, label: 'Repairs' },
  { key: 'supplies', line: 15, label: 'Supplies' },
  { key: 'taxes', line: 16, label: 'Taxes' },
  { key: 'utilities', line: 17, label: 'Utilities' },
  { key: 'depreciation', line: 18, label: 'Depreciation' },
  { key: 'other', line: 19, label: 'Other' },
];
const LINE_BY_KEY = SCHED_E_LINES.reduce((m, l) => { m[l.key] = l; return m; }, {});

// Auto-map a bill category to a Schedule E line key. Utilities collapse onto
// line 17; the upkeep categories onto line 7; everything unknown to "other"
// (line 19) so it's never silently dropped — the user can reassign from there.
const CATEGORY_TO_SCHED_E = {
  'Electric': 'utilities',
  'Gas': 'utilities',
  'Water': 'utilities',
  'Internet/Cable': 'utilities',
  'Phone': 'utilities',
  'Trash/Recycling': 'utilities',
  'Pest Control': 'cleaning_maintenance',
  'Security': 'cleaning_maintenance',
  'Insurance': 'insurance',
  'Auto': 'auto_travel',
  'Subscription': 'other',
  'Charitable': 'other',
  'Other': 'other',
};

// The effective Schedule E key for an expense: explicit override wins, else
// the auto-map from category, else "other".
const schedKeyFor = (inv) => {
  if (inv && inv.schedECategory && LINE_BY_KEY[inv.schedECategory]) return inv.schedECategory;
  const mapped = inv && inv.category ? CATEGORY_TO_SCHED_E[inv.category] : null;
  return mapped || 'other';
};

const money0 = (n) => {
  const v = parseFloat(n);
  if (!Number.isFinite(v)) return '$0';
  const neg = v < 0;
  return `${neg ? '-' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
};
const money2 = (n) => {
  const v = parseFloat(n);
  if (!Number.isFinite(v)) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const yearOf = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || isNaN(dt)) return null;
  return dt.getFullYear();
};
// An invoice's effective date for tax-year bucketing: dueDate, else
// billDate-ish fallbacks, else created. Mirrors the "undated still counts"
// principle — we use created so an undated bill isn't dropped from the year.
const invoiceYear = (inv) => yearOf(inv.dueDate) ?? yearOf(inv.billingPeriod) ?? yearOf(inv.created);
const receiptYear = (r) => yearOf(r.receivedDate) ?? yearOf(r.created);

const isConfirmedReceipt = (r) => r && r.status === 'confirmed';
// An expense counts if it's a real obligation: open (!cleared) OR already
// cleared still counts for tax (it was still an expense that year). For the
// P&L every non-deleted invoice for this property in the year is an expense.
// (Deleted = hard-deleted = gone, so anything present counts.)

const RentalPnL = ({ home }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const homeId = home && home.id;

  const load = useCallback(async () => {
    if (!currentUser || !homeId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [recs, invs] = await Promise.all([
        pb.collection('rentReceipts').getFullList({
          filter: `ownerId = "${currentUser.id}" && homeId = "${homeId}"`,
          $autoCancel: false,
        }),
        pb.collection('invoices').getFullList({
          filter: `ownerId = "${currentUser.id}" && homeId = "${homeId}"`,
          $autoCancel: false,
        }),
      ]);
      setReceipts(Array.isArray(recs) ? recs : []);
      setExpenses(Array.isArray(invs) ? invs : []);
    } catch (err) {
      console.error('P&L load failed:', err);
      setReceipts([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, homeId]);

  useEffect(() => { load(); }, [load]);

  // Years we have any data for, so the selector only offers real years.
  const availableYears = useMemo(() => {
    const ys = new Set();
    receipts.forEach((r) => { const y = receiptYear(r); if (y) ys.add(y); });
    expenses.forEach((e) => { const y = invoiceYear(e); if (y) ys.add(y); });
    ys.add(new Date().getFullYear());
    return Array.from(ys).sort((a, b) => b - a);
  }, [receipts, expenses]);

  // ── This year's figures ──
  const yearReceipts = useMemo(
    () => receipts.filter((r) => isConfirmedReceipt(r) && receiptYear(r) === year),
    [receipts, year]
  );
  const yearExpenses = useMemo(
    () => expenses.filter((e) => invoiceYear(e) === year),
    [expenses, year]
  );

  const totalIncome = yearReceipts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  // Group expenses by Schedule E line.
  const byLine = useMemo(() => {
    const groups = {};
    yearExpenses.forEach((e) => {
      const key = schedKeyFor(e);
      if (!groups[key]) groups[key] = { key, line: LINE_BY_KEY[key], items: [], total: 0 };
      groups[key].items.push(e);
      groups[key].total += parseFloat(e.amount) || 0;
    });
    // Return in Schedule E line order, only lines that have expenses.
    return SCHED_E_LINES.map((l) => groups[l.key]).filter(Boolean);
  }, [yearExpenses]);

  const totalExpenses = byLine.reduce((s, g) => s + g.total, 0);
  const netProfit = totalIncome - totalExpenses;

  // Override an expense's Schedule E line.
  const setLineFor = async (inv, key) => {
    setSavingId(inv.id);
    try {
      await pb.collection('invoices').update(inv.id, { schedECategory: key }, { $autoCancel: false });
      // Update local copy so the regroup is instant.
      setExpenses((prev) => prev.map((e) => e.id === inv.id ? { ...e, schedECategory: key } : e));
      setEditingId(null);
    } catch (err) {
      console.error('Line override failed:', err);
      toast({ title: 'Could not change line', description: err && err.message ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const card = {
    background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`,
    marginTop: '16px', overflow: 'hidden',
  };

  if (loading) {
    return (
      <div style={{ ...card, padding: '18px' }}>
        <div style={{ height: '14px', width: '120px', background: PAGE, borderRadius: '6px', marginBottom: '12px' }} />
        <div style={{ height: '40px', background: PAGE, borderRadius: '8px' }} />
      </div>
    );
  }

  return (
    <div style={card}>
      {/* Header — collapsible, with the headline net number always visible */}
      <button onClick={() => setOpen((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '16px 18px', background: PAGE, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        {open ? <ChevronDown style={{ width: '16px', height: '16px', color: INK_MUTED }} />
              : <ChevronRight style={{ width: '16px', height: '16px', color: INK_MUTED }} />}
        <Calculator style={{ width: '17px', height: '17px', color: NAVY }} />
        <span style={{ fontSize: '15px', fontWeight: 600, color: INK }}>Profit &amp; loss</span>
        <span style={{ fontSize: '13px', color: INK_FAINT }}>· {year}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {netProfit >= 0
            ? <TrendingUp style={{ width: '15px', height: '15px', color: GREEN }} />
            : <TrendingDown style={{ width: '15px', height: '15px', color: RED }} />}
          <span style={{ fontSize: '16px', fontWeight: 700, color: netProfit >= 0 ? GREEN : RED }}>
            {money0(netProfit)}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '18px' }}>
          {/* Year selector */}
          {availableYears.length > 1 && (
            <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: INK_MUTED }}>Tax year</span>
              <div className="flex items-center gap-1">
                {availableYears.map((y) => (
                  <button key={y} onClick={() => setYear(y)}
                    style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 500,
                      color: y === year ? '#fff' : INK_MUTED, background: y === year ? NAVY : 'transparent',
                      border: `1px solid ${y === year ? NAVY : BORDER}`, borderRadius: '999px', cursor: 'pointer' }}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Income → Expenses → Net summary band */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
            padding: '16px', borderRadius: '10px', background: PAGE, marginBottom: '18px' }}>
            <div>
              <div style={{ fontSize: '11px', color: INK_MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Rent income</div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: GREEN }}>{money0(totalIncome)}</div>
            </div>
            <div style={{ color: INK_FAINT }}>−</div>
            <div>
              <div style={{ fontSize: '11px', color: INK_MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Expenses</div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: INK }}>{money0(totalExpenses)}</div>
            </div>
            <div style={{ color: INK_FAINT }}>=</div>
            <div>
              <div style={{ fontSize: '11px', color: INK_MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Net</div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: netProfit >= 0 ? GREEN : RED }}>{money0(netProfit)}</div>
            </div>
          </div>

          {/* Expenses by Schedule E line */}
          {byLine.length === 0 ? (
            <p style={{ fontSize: '13px', color: INK_FAINT, lineHeight: 1.6 }}>
              No expenses recorded for this property in {year}. Bills tied to this property will appear
              here, sorted onto their Schedule E line.
            </p>
          ) : (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: INK_MUTED, marginBottom: '10px',
                textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Expenses by Schedule E line
              </div>
              {byLine.map((g) => (
                <div key={g.key} style={{ marginBottom: '14px' }}>
                  <div className="flex items-center" style={{ paddingBottom: '6px', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: INK }}>
                      <span style={{ color: GOLD, fontWeight: 700 }}>{g.line.line}</span>&nbsp;&nbsp;{g.line.label}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 700, color: INK }}>{money0(g.total)}</span>
                  </div>
                  {g.items.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-2" style={{ padding: '7px 0 7px 4px' }}>
                      <span style={{ fontSize: '13px', color: INK_MUTED, flex: 1, minWidth: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inv.companyName || 'Expense'}
                        {inv.billingPeriod ? <span style={{ color: INK_FAINT }}> · {inv.billingPeriod}</span> : null}
                      </span>
                      <span style={{ fontSize: '13px', color: INK }}>{money2(inv.amount)}</span>
                      {editingId === inv.id ? (
                        <select
                          value={schedKeyFor(inv)}
                          disabled={savingId === inv.id}
                          onChange={(e) => setLineFor(inv, e.target.value)}
                          style={{ fontSize: '12px', color: INK, background: SURFACE,
                            border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '3px 6px', cursor: 'pointer' }}>
                          {SCHED_E_LINES.map((l) => (
                            <option key={l.key} value={l.key}>{l.line} · {l.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button onClick={() => setEditingId(inv.id)} title="Change tax line"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '4px', color: INK_FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <Pencil style={{ width: '13px', height: '13px' }} />
                        </button>
                      )}
                      {editingId === inv.id && (
                        <button onClick={() => setEditingId(null)} title="Done"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '4px', color: INK_FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <X style={{ width: '13px', height: '13px' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <p style={{ marginTop: '14px', fontSize: '11px', color: INK_FAINT, lineHeight: 1.5,
            paddingTop: '12px', borderTop: `1px solid ${BORDER}` }}>
            A working picture from the bills and rent you've tracked — not tax advice. Confirm
            figures with your accountant before filing.
          </p>
        </div>
      )}
    </div>
  );
};

export default RentalPnL;
