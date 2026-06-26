// ═══════════════════════════════════════════════════════════════════════
// schedE — the ONE source of truth for Schedule E lines, category mapping,
// and the cash-basis date logic shared by the rental P&L view and the tax
// CSV export.
//
// Why this file exists: the Schedule E line list and the category→line map
// were duplicated in RentalPnL.jsx AND rentalTaxExport.js, with a standing
// note that a future edit must change BOTH or the screen and the export
// would silently disagree. This consolidates them so that can't happen.
// ("One fact, one place.")
//
// CASH BASIS (the model the P&L now uses): an expense belongs to the tax
// year in which it was PAID, and an expense that hasn't been paid belongs to
// no year at all (it isn't a cash-basis expense yet). This is deliberately
// different from accrual — the question a landlord's Schedule E answers is
// "what did I actually pay this year," not "what did I owe."
// ═══════════════════════════════════════════════════════════════════════

// ── Schedule E expense lines (IRS Form 1040 Schedule E, Part I) ──────────
export const SCHED_E_LINES = [
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

export const LINE_BY_KEY = SCHED_E_LINES.reduce((m, l) => { m[l.key] = l; return m; }, {});

// Auto-map a bill category to a Schedule E line key. Utilities collapse onto
// line 17; the upkeep categories onto line 7; everything unknown to "other"
// (line 19) so it's never silently dropped — the user can reassign from there.
export const CATEGORY_TO_SCHED_E = {
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

// The effective Schedule E key for an expense: explicit override (schedECategory)
// wins, else the auto-map from category, else "other". Works for both invoices
// (which carry `category`) and manual rentalExpenses (which carry an explicit
// `schedECategory` and usually no `category`).
export const schedKeyFor = (e) => {
  if (e && e.schedECategory && LINE_BY_KEY[e.schedECategory]) return e.schedECategory;
  const mapped = e && e.category ? CATEGORY_TO_SCHED_E[e.category] : null;
  return mapped || 'other';
};

// ── Date helpers ─────────────────────────────────────────────────────────
export const yearOf = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || isNaN(dt)) return null;
  return dt.getFullYear();
};

// CASH-BASIS payment date for a bill-pay invoice. The date cash actually left
// the user's hands, best-effort from the fields the lifecycle stamps:
//   • manual bill        -> paidDate
//   • bank autopay       -> reviewedDate (status:paid; the draft is the payment)
//   • card autopay       -> clearedDate (when the statement was settled), else
//                           reviewedDate as a fallback for older card bills
//                           that were cleared before clearedDate existed.
// Returns null if the invoice has no payment date — i.e. it is UNPAID and must
// NOT count in any cash-basis year.
export const invoicePaidDate = (inv) => {
  if (!inv) return null;
  return inv.paidDate || inv.clearedDate || inv.reviewedDate || null;
};

// The cash-basis tax year for a bill-pay invoice. null => unpaid => excluded.
export const invoiceCashYear = (inv) => yearOf(invoicePaidDate(inv));

// The cash-basis tax year for a MANUAL rental expense: the user-set datePaid.
// Manual entries are recorded only when paid, so datePaid is the cash date;
// falls back to created only if datePaid is somehow blank (shouldn't happen).
export const manualPaidDate = (m) => (m ? (m.datePaid || m.created || null) : null);
export const manualCashYear = (m) => yearOf(manualPaidDate(m));

// Rent receipts stay as they were — income is counted when received.
export const receiptYear = (r) => yearOf(r ? (r.receivedDate || r.created) : null);
export const isConfirmedReceipt = (r) => r && r.status === 'confirmed';

// ── Normalization ────────────────────────────────────────────────────────
// Bring an invoice and a manual rentalExpense to ONE common shape the P&L and
// the export both consume, so downstream code never branches on source again.
// Shape: { id, source: 'bill'|'manual', schedKey, amount, paidDate, year,
//          label, vendor, period, category, schedECategory, raw }
export const normalizeInvoiceExpense = (inv) => ({
  id: inv.id,
  source: 'bill',
  schedKey: schedKeyFor(inv),
  amount: parseFloat(inv.amount) || 0,
  paidDate: invoicePaidDate(inv),
  year: invoiceCashYear(inv),
  label: inv.companyName || 'Expense',
  vendor: inv.companyName || '',
  period: inv.billingPeriod || '',
  category: inv.category || '',
  schedECategory: inv.schedECategory || '',
  raw: inv,
});

export const normalizeManualExpense = (m) => ({
  id: m.id,
  source: 'manual',
  schedKey: schedKeyFor(m),
  amount: parseFloat(m.amount) || 0,
  paidDate: manualPaidDate(m),
  year: manualCashYear(m),
  label: m.description || m.vendorName || 'Expense',
  vendor: m.vendorName || '',
  period: '',
  category: '',
  schedECategory: m.schedECategory || '',
  raw: m,
});
