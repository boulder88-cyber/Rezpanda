import React, { useState, useEffect, useCallback, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  Calculator, TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  Pencil, X, Download
} from 'lucide-react';
import { exportPropertyTaxYear } from '@/lib/rentalTaxExport.js';
import RentalManualExpense from '@/components/RentalManualExpense.jsx';
import {
  SCHED_E_LINES, schedKeyFor,
  normalizeInvoiceExpense, normalizeManualExpense,
  receiptYear, isConfirmedReceipt,
} from '@/lib/schedE.js';

// ═══════════════════════════════════════════════════════════════════════
// RentalPnL — the tax-ready profit & loss for ONE rental property.
//
// Income (confirmed rent receipts) minus expenses, every expense sorted onto
// a Schedule E line. Expenses come from TWO sources, merged here:
//   • bill-pay invoices for this property (the reconcilable ones), and
//   • manual rentalExpenses (mortgage interest, depreciation, card-paid
//     repairs — the deductions that never flow through bill pay).
//
// CASH BASIS (locked): an expense counts in the year it was PAID, and an
// UNPAID bill counts in no year at all. So an open/unpaid invoice does NOT
// appear here until it's paid — this is the opposite of the open-model rule
// the rest of the app uses, and it's deliberate: a Schedule E reports what
// you spent, not what you still owe. The cash date is paidDate / clearedDate
// / reviewedDate for invoices, and the user-set datePaid for manual entries.
// (Date logic lives in lib/schedE.js so the screen and the CSV can't diverge.)
//
// The Schedule E line is auto-mapped from category by default and can be
// overridden per bill-pay expense (stored in the invoice's schedECategory).
// Manual entries carry their own schedECategory, set on the entry form.
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

const RentalPnL = ({ home }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [manual, setManual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const homeId = home && home.id;

  const load = useCallback(async () => {
    if (!currentUser || !homeId) { setLoading(false); return; }
    setLoading(true);
    const ownerHome = `ownerId = "${currentUser.id}" && homeId = "${homeId}"`;
    try {
      const [recs, invs, mans] = await Promise.all([
        pb.collection('rentReceipts').getFullList({ filter: ownerHome, $autoCancel: false }),
        pb.collection('invoices').getFullList({ filter: ownerHome, $autoCancel: false }),
        // Manual expenses may not exist yet — tolerate its absence.
        pb.collection('rentalExpenses').getFullList({ filter: ownerHome, $autoCancel: false })
          .catch(() => []),
      ]);
      setReceipts(Array.isArray(recs) ? recs : []);
      setInvoices(Array.isArray(invs) ? invs : []);
      setManual(Array.isArray(mans) ? mans : []);
    } catch (err) {
      console.error('P&L load failed:', err);
      setReceipts([]); setInvoices([]); setManual([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, homeId]);

  useEffect(() => { load(); }, [load]);

  // Normalize both expense sources to one shape; unpaid invoices (no cash
  // date → year null) fall out naturally in the year filter below.
  const allExpenses = useMemo(() => [
    ...invoices.map(normalizeInvoiceExpense),
    ...manual.map(normalizeManualExpense),
  ], [invoices, manual]);

  // Years we have any data for, so the selector only offers real years.
  const availableYears = useMemo(() => {
    const ys = new Set();
    receipts.forEach((r) => { const y = receiptYear(r); if (y) ys.add(y); });
    allExpenses.forEach((e) => { if (e.year) ys.add(e.year); });
    ys.add(new Date().getFullYear());
    return Array.from(ys).sort((a, b) => b - a);
  }, [receipts, allExpenses]);

  const yearReceipts = useMemo(
    () => receipts.filter((r) => isConfirmedReceipt(r) && receiptYear(r) === year),
    [receipts, year]
  );
  // Cash basis: only expenses PAID in this year (year !== null && === year).
  const yearExpenses = useMemo(
    () => allExpenses.filter((e) => e.year === year),
    [allExpenses, year]
  );

  const totalIncome = yearReceipts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  // Group expenses by Schedule E line.
  const byLine = useMemo(() => {
    const groups = {};
    yearExpenses.forEach((e) => {
      const key = e.schedKey;
      if (!groups[key]) groups[key] = { key, line: SCHED_E_LINES.find((l) => l.key === key), items: [], total: 0 };
      groups[key].items.push(e);
      groups[key].total += e.amount;
    });
    return SCHED_E_LINES.map((l) => groups[l.key]).filter(Boolean);
  }, [yearExpenses]);

  const totalExpenses = byLine.reduce((s, g) => s + g.total, 0);
  const netProfit = totalIncome - totalExpenses;

  // Count of unpaid invoices for this property — surfaced as an honest note so
  // the user understands why a known bill might not appear in the P&L.
  const unpaidCount = useMemo(
    () => invoices.map(normalizeInvoiceExpense).filter((e) => e.year === null).length,
    [invoices]
  );

  // Override a bill-pay expense's Schedule E line. (Manual entries are edited
  // on their own row in the RentalManualExpense panel, not here.)
  const setLineFor = async (exp, key) => {
    setSavingId(exp.id);
    try {
      await pb.collection('invoices').update(exp.id, { schedECategory: key }, { $autoCancel: false });
      setInvoices((prev) => prev.map((e) => e.id === exp.id ? { ...e, schedECategory: key } : e));
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
          {/* Year selector + export */}
          <div className="flex items-center gap-2" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
            {availableYears.length > 1 && (
              <>
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
              </>
            )}
            <button
              onClick={() => exportPropertyTaxYear({
                propertyName: home.name || home.address || 'Rental property',
                receipts, invoices, manual, year,
              })}
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 13px', fontSize: '13px', fontWeight: 500, color: NAVY,
                background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '8px', cursor: 'pointer' }}>
              <Download style={{ width: '14px', height: '14px' }} />
              Export {year} for taxes
            </button>
          </div>

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
              No expenses paid for this property in {year}. Bills you've paid and manual expenses
              you add will appear here, sorted onto their Schedule E line.
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
                  {g.items.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-2" style={{ padding: '7px 0 7px 4px' }}>
                      <span style={{ fontSize: '13px', color: INK_MUTED, flex: 1, minWidth: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {exp.label}
                        {exp.period ? <span style={{ color: INK_FAINT }}> · {exp.period}</span> : null}
                        {exp.source === 'manual'
                          ? <span style={{ color: GOLD, fontSize: '11px', fontWeight: 600 }}> · manual</span>
                          : null}
                      </span>
                      <span style={{ fontSize: '13px', color: INK }}>{money2(exp.amount)}</span>
                      {/* Tax-line override is only for bill-pay expenses; manual
                          entries are re-lined on their own edit row below. */}
                      {exp.source === 'bill' && editingId === exp.id ? (
                        <select
                          value={exp.schedKey}
                          disabled={savingId === exp.id}
                          onChange={(e) => setLineFor(exp, e.target.value)}
                          style={{ fontSize: '12px', color: INK, background: SURFACE,
                            border: `1px solid ${BORDER}`, borderRadius: '6px', padding: '3px 6px', cursor: 'pointer' }}>
                          {SCHED_E_LINES.map((l) => (
                            <option key={l.key} value={l.key}>{l.line} · {l.label}</option>
                          ))}
                        </select>
                      ) : exp.source === 'bill' ? (
                        <button onClick={() => setEditingId(exp.id)} title="Change tax line"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '4px', color: INK_FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <Pencil style={{ width: '13px', height: '13px' }} />
                        </button>
                      ) : null}
                      {exp.source === 'bill' && editingId === exp.id && (
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

          {/* Honest note: unpaid bills aren't counted under cash basis. */}
          {unpaidCount > 0 && (
            <p style={{ marginTop: '12px', fontSize: '12px', color: INK_MUTED, lineHeight: 1.5,
              padding: '10px 12px', background: PAGE, borderRadius: '8px' }}>
              {unpaidCount} tracked bill{unpaidCount === 1 ? '' : 's'} for this property {unpaidCount === 1 ? 'is' : 'are'} not
              paid yet, so {unpaidCount === 1 ? "it isn't" : "they aren't"} counted here. Cash basis counts an
              expense in the year you pay it.
            </p>
          )}

          {/* Manual expense entry — the off-bill-pay deductions. */}
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: `1px solid ${BORDER}` }}>
            <RentalManualExpense home={home} onChange={load} />
          </div>

          <p style={{ marginTop: '14px', fontSize: '11px', color: INK_FAINT, lineHeight: 1.5,
            paddingTop: '12px', borderTop: `1px solid ${BORDER}` }}>
            A working picture from the bills, rent, and expenses you've tracked — not tax advice. Confirm
            figures with your accountant before filing.
          </p>
        </div>
      )}
    </div>
  );
};

export default RentalPnL;
