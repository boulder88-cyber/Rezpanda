// ═══════════════════════════════════════════════════════════════════════
// rentalTaxExport — build an accountant-ready CSV for a rental's tax year.
//
// Mirrors the on-screen Schedule E P&L: rent income, then expenses grouped by
// Schedule E line with per-line subtotals, then net. One property per call;
// a portfolio export concatenates per-property sections under one file.
//
// Reuses the app's existing Blob + object-URL download idiom (see
// ExpensesPage), but with PROPER CSV escaping — a vendor name like
// "Smith, Jones & Co" must not shift columns in a tax document. Every field is
// quoted and embedded quotes are doubled, per RFC 4180.
//
// This is the same Schedule E mapping the P&L view uses; kept in sync here so
// the exported file and the on-screen numbers always agree. ("One fact, one
// place" — the export must never diverge from what the user saw.)
// ═══════════════════════════════════════════════════════════════════════

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
const LINE_BY_KEY = SCHED_E_LINES.reduce((m, l) => { m[l.key] = l; return m; }, {});

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

export const schedKeyFor = (inv) => {
  if (inv && inv.schedECategory && LINE_BY_KEY[inv.schedECategory]) return inv.schedECategory;
  const mapped = inv && inv.category ? CATEGORY_TO_SCHED_E[inv.category] : null;
  return mapped || 'other';
};

const yearOf = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || isNaN(dt)) return null;
  return dt.getFullYear();
};
export const invoiceYear = (inv) => yearOf(inv.dueDate) ?? yearOf(inv.billingPeriod) ?? yearOf(inv.created);
export const receiptYear = (r) => yearOf(r.receivedDate) ?? yearOf(r.created);

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

// Build the CSV section for one property's tax year. Returns an array of CSV
// line strings (no trailing newline) so a portfolio export can join sections.
export function buildPropertySection(propertyName, receipts, expenses, year) {
  const yearReceipts = receipts.filter((r) => r.status === 'confirmed' && receiptYear(r) === year);
  const yearExpenses = expenses.filter((e) => invoiceYear(e) === year);

  const lines = [];
  lines.push(row([`Property: ${propertyName}`]));
  lines.push(row([`Tax year: ${year}`]));
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
    const key = schedKeyFor(e);
    if (!groups[key]) groups[key] = { line: LINE_BY_KEY[key], items: [], total: 0 };
    groups[key].items.push(e);
    groups[key].total += parseFloat(e.amount) || 0;
  });
  const ordered = SCHED_E_LINES.map((l) => groups[l.key] ? { ...groups[l.key], def: l } : null).filter(Boolean);

  lines.push(row(['EXPENSES (Schedule E)']));
  lines.push(row(['Sch. E line', 'Category', 'Date', 'Vendor', 'Period', 'Amount']));
  let totalExpenses = 0;
  ordered.forEach((g) => {
    g.items
      .slice()
      .sort((a, b) => new Date(a.dueDate || a.created) - new Date(b.dueDate || b.created))
      .forEach((inv) => {
        lines.push(row([
          `${g.def.line} ${g.def.label}`,
          inv.category || '',
          fmtDate(inv.dueDate || inv.created),
          inv.companyName || '',
          inv.billingPeriod || '',
          money(inv.amount),
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
export function exportPropertyTaxYear({ propertyName, receipts, expenses, year }) {
  const lines = [
    row(['CasaCEO rental tax summary']),
    row([`Generated ${new Date().toLocaleDateString('en-US')}`]),
    row(['Working figures from tracked bills and rent — not tax advice.']),
    '',
    ...buildPropertySection(propertyName, receipts, expenses, year),
  ];
  triggerDownload(lines.join('\n'), `rental-tax-${safeName(propertyName)}-${year}.csv`);
}

// Export the whole portfolio: one file, a section per property, a portfolio
// total at the end. `properties` is [{ name, receipts, expenses }].
export function exportPortfolioTaxYear({ properties, year }) {
  const lines = [
    row(['CasaCEO rental portfolio tax summary']),
    row([`Tax year: ${year}`]),
    row([`Generated ${new Date().toLocaleDateString('en-US')}`]),
    row(['Working figures from tracked bills and rent — not tax advice.']),
    '',
  ];

  let portIncome = 0;
  let portExpense = 0;
  properties.forEach((p, i) => {
    const yr = p.receipts.filter((r) => r.status === 'confirmed' && receiptYear(r) === year);
    const ye = p.expenses.filter((e) => invoiceYear(e) === year);
    portIncome += yr.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    portExpense += ye.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    lines.push(...buildPropertySection(p.name, p.receipts, p.expenses, year));
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
