// ═══════════════════════════════════════════════════════════════════════
// rentalTaxExport — build an accountant-ready CSV for a rental's tax year.
//
// Mirrors the on-screen Schedule E P&L: rent income, then expenses grouped by
// Schedule E line with per-line subtotals, then net. One property per call;
// a portfolio export concatenates per-property sections under one file.
//
// CASH BASIS: matches the P&L view exactly — an expense is counted in the
// year it was PAID (paidDate / clearedDate / reviewedDate for bills, the
// user-set datePaid for manual entries); unpaid bills are excluded. Income is
// counted when received. The shared Schedule E mapping + date logic lives in
// lib/schedE.js, imported here, so the exported file and the on-screen numbers
// can never diverge. ("One fact, one place.")
//
// Expenses come from TWO sources, merged: bill-pay invoices and manual
// rentalExpenses. The CSV marks each row's source so the accountant can see
// which lines have a bill behind them and which were entered by hand.
//
// Reuses the app's Blob + object-URL download idiom, with PROPER CSV escaping
// (RFC 4180: every field quoted, embedded quotes doubled) so a vendor name
// like "Smith, Jones & Co" never shifts columns.
// ═══════════════════════════════════════════════════════════════════════

import {
  SCHED_E_LINES, LINE_BY_KEY,
  normalizeInvoiceExpense, normalizeManualExpense,
  receiptYear, isConfirmedReceipt,
} from '@/lib/schedE.js';

const fmtDate = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || isNaN(dt)) return '';
  return dt.toLocaleDateString('en-US');
};
const money = (n) => {
  const v = parseFloat(n);
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
};

// RFC 4180 field escaping: always quote, double internal quotes.
const cell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
const row = (arr) => arr.map(cell).join(',');

// Merge an invoice list + manual list into normalized, cash-basis expense rows
// for one tax year. Unpaid invoices (year null) drop out here.
function yearExpensesFor(invoices, manual, year) {
  return [
    ...(invoices || []).map(normalizeInvoiceExpense),
    ...(manual || []).map(normalizeManualExpense),
  ].filter((e) => e.year === year);
}

// Build the CSV section for one property's tax year. Returns an array of CSV
// line strings (no trailing newline) so a portfolio export can join sections.
export function buildPropertySection(propertyName, receipts, invoices, manual, year) {
  const yearReceipts = (receipts || []).filter((r) => isConfirmedReceipt(r) && receiptYear(r) === year);
  const yearExpenses = yearExpensesFor(invoices, manual, year);

  const lines = [];
  lines.push(row([`Property: ${propertyName}`]));
  lines.push(row([`Tax year: ${year} (cash basis)`]));
  lines.push('');

  // ── Income ──
  const totalIncome = yearReceipts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  lines.push(row(['RENTAL INCOME']));
  lines.push(row(['Date received', 'Payer', 'Period', 'Amount']));
  yearReceipts
    .slice()
    .sort((a, b) => new Date(a.receivedDate || a.created) - new Date(b.receivedDate || b.created))
    .forEach((r) => {
      lines.push(row([fmtDate(r.receivedDate || r.created), r.payerName || '', r.coversPeriod || '', money(r.amount)]));
    });
  lines.push(row(['', '', 'Total rental income', money(totalIncome)]));
  lines.push('');

  // ── Expenses, grouped by Schedule E line ──
  const groups = {};
  yearExpenses.forEach((e) => {
    if (!groups[e.schedKey]) groups[e.schedKey] = { line: LINE_BY_KEY[e.schedKey], items: [], total: 0 };
    groups[e.schedKey].items.push(e);
    groups[e.schedKey].total += e.amount;
  });
  const ordered = SCHED_E_LINES.map((l) => groups[l.key] ? { ...groups[l.key], def: l } : null).filter(Boolean);

  lines.push(row(['EXPENSES (Schedule E)']));
  lines.push(row(['Sch. E line', 'Source', 'Date paid', 'Vendor / description', 'Period', 'Amount']));
  let totalExpenses = 0;
  ordered.forEach((g) => {
    g.items
      .slice()
      .sort((a, b) => new Date(a.paidDate || 0) - new Date(b.paidDate || 0))
      .forEach((e) => {
        lines.push(row([
          `${g.def.line} ${g.def.label}`,
          e.source === 'manual' ? 'Manual' : 'Bill',
          fmtDate(e.paidDate),
          e.label || e.vendor || '',
          e.period || '',
          money(e.amount),
        ]));
      });
    lines.push(row([`${g.def.line} ${g.def.label}`, '', '', '', 'Line subtotal', money(g.total)]));
    totalExpenses += g.total;
  });
  lines.push(row(['', '', '', '', 'Total expenses', money(totalExpenses)]));
  lines.push('');

  // ── Net ──
  lines.push(row(['', '', '', '', 'NET (income − expenses)', money(totalIncome - totalExpenses)]));

  return lines;
}

function triggerDownload(csvText, filename) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const safeName = (s) => String(s || 'property').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'property';

// Export one property's tax year.
export function exportPropertyTaxYear({ propertyName, receipts, invoices, manual, year }) {
  const lines = [
    row(['CasaCEO rental tax summary']),
    row([`Generated ${new Date().toLocaleDateString('en-US')}`]),
    row(['Cash basis — expenses counted in the year paid. Working figures, not tax advice.']),
    '',
    ...buildPropertySection(propertyName, receipts, invoices, manual, year),
  ];
  triggerDownload(lines.join('\n'), `rental-tax-${safeName(propertyName)}-${year}.csv`);
}

// Export the whole portfolio: one file, a section per property, a portfolio
// total at the end. `properties` is [{ name, receipts, invoices, manual }].
export function exportPortfolioTaxYear({ properties, year }) {
  const lines = [
    row(['CasaCEO rental portfolio tax summary']),
    row([`Tax year: ${year} (cash basis)`]),
    row([`Generated ${new Date().toLocaleDateString('en-US')}`]),
    row(['Cash basis — expenses counted in the year paid. Working figures, not tax advice.']),
    '',
  ];

  let portIncome = 0;
  let portExpense = 0;
  properties.forEach((p, i) => {
    const yr = (p.receipts || []).filter((r) => isConfirmedReceipt(r) && receiptYear(r) === year);
    const ye = yearExpensesFor(p.invoices, p.manual, year);
    portIncome += yr.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    portExpense += ye.reduce((s, e) => s + e.amount, 0);

    lines.push(...buildPropertySection(p.name, p.receipts, p.invoices, p.manual, year));
    if (i < properties.length - 1) {
      lines.push('');
      lines.push(row(['────────────────────']));
      lines.push('');
    }
  });

  lines.push('');
  lines.push(row(['PORTFOLIO TOTAL']));
  lines.push(row(['', '', '', 'Total income', money(portIncome)]));
  lines.push(row(['', '', '', 'Total expenses', money(portExpense)]));
  lines.push(row(['', '', '', 'Net', money(portIncome - portExpense)]));

  triggerDownload(lines.join('\n'), `rental-tax-portfolio-${year}.csv`);
}
