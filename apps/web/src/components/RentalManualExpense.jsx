import React, { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { SCHED_E_LINES } from '@/lib/schedE.js';

// ═══════════════════════════════════════════════════════════════════════
// RentalManualExpense — manual expense entry for a rental's Schedule E.
//
// Not every deductible expense flows through Bill Pay: mortgage interest,
// depreciation, HOA dues, a repair paid by card, mileage, an insurance
// premium that was never forwarded. This is the entry point for those.
//
// Manual entries live in their OWN collection (`rentalExpenses`), never in
// `invoices` — so they never leak into Bill Pay, Cash Needs, or the aging
// buckets. They are tax-ledger rows, not bills. The P&L is the one view that
// unions them with bill-pay invoices onto the Schedule E lines.
//
// CASH BASIS: each entry records the date it was PAID (datePaid), which is
// what buckets it into a tax year. A manual expense is only ever recorded
// once paid, so datePaid is always the cash date.
//
// "See, don't do": this records what a landlord spent. It moves no money.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const INK = '#1f2733';
const INK_MUTED = '#5b6472';
const INK_FAINT = '#95a0ae';
const BORDER = '#e9e4db';
const SURFACE = '#ffffff';
const PAGE = '#faf8f4';
const RED = '#dc2626';

const money2 = (n) => {
  const v = parseFloat(n);
  if (!Number.isFinite(v)) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
// A Date field round-trips as an ISO string; the date input wants YYYY-MM-DD.
const toInputDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().slice(0, 10);
};
const todayInput = () => new Date().toISOString().slice(0, 10);

const blankDraft = () => ({
  description: '',
  amount: '',
  datePaid: todayInput(),
  schedECategory: 'other',
  vendorName: '',
  note: '',
});

const inputStyle = {
  width: '100%', fontSize: '13px', color: INK, background: SURFACE,
  border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '8px 10px',
  boxSizing: 'border-box',
};
const labelStyle = { fontSize: '11px', fontWeight: 600, color: INK_MUTED, marginBottom: '4px', display: 'block' };

const RentalManualExpense = ({ home, onChange }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blankDraft());
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(blankDraft());
  const [saving, setSaving] = useState(false);

  const homeId = home && home.id;

  const load = useCallback(async () => {
    if (!currentUser || !homeId) { setLoading(false); return; }
    setLoading(true);
    try {
      const recs = await pb.collection('rentalExpenses').getFullList({
        filter: `ownerId = "${currentUser.id}" && homeId = "${homeId}"`,
        sort: '-datePaid',
        $autoCancel: false,
      });
      setRows(Array.isArray(recs) ? recs : []);
    } catch (err) {
      // Collection may not exist yet — degrade quietly to empty, don't crash.
      console.error('Manual expenses load failed:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, homeId]);

  useEffect(() => { load(); }, [load]);

  const validate = (d) => {
    const amt = parseFloat(d.amount);
    if (!d.description.trim()) return 'Add a short description.';
    if (!Number.isFinite(amt) || amt <= 0) return 'Enter an amount greater than zero.';
    if (!d.datePaid) return 'Pick the date you paid it.';
    return null;
  };

  const payloadFrom = (d) => ({
    ownerId: currentUser.id,
    homeId,
    description: d.description.trim(),
    amount: parseFloat(d.amount),
    datePaid: d.datePaid, // YYYY-MM-DD; PocketBase Date accepts it
    schedECategory: d.schedECategory,
    vendorName: d.vendorName.trim(),
    note: d.note.trim(),
    source: 'manual',
  });

  const handleAdd = async () => {
    const problem = validate(draft);
    if (problem) { toast({ title: problem, variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await pb.collection('rentalExpenses').create(payloadFrom(draft), { $autoCancel: false });
      toast({ title: 'Expense added' });
      setDraft(blankDraft());
      setAdding(false);
      await load();
      if (onChange) onChange();
    } catch (err) {
      // Surface the real PocketBase reason — the discipline that caught the
      // placement and add-home bugs. A silent failure here is a missing
      // deduction, which is worse than a loud error.
      const reason = err && err.message ? err.message : 'Try again.';
      toast({ title: 'Could not save expense', description: reason, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditDraft({
      description: r.description || '',
      amount: r.amount != null ? String(r.amount) : '',
      datePaid: toInputDate(r.datePaid),
      schedECategory: r.schedECategory || 'other',
      vendorName: r.vendorName || '',
      note: r.note || '',
    });
  };

  const handleSaveEdit = async () => {
    const problem = validate(editDraft);
    if (problem) { toast({ title: problem, variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await pb.collection('rentalExpenses').update(editingId, payloadFrom(editDraft), { $autoCancel: false });
      toast({ title: 'Expense updated' });
      setEditingId(null);
      await load();
      if (onChange) onChange();
    } catch (err) {
      const reason = err && err.message ? err.message : 'Try again.';
      toast({ title: 'Could not update expense', description: reason, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    setSaving(true);
    try {
      await pb.collection('rentalExpenses').delete(r.id, { $autoCancel: false });
      toast({ title: 'Expense removed' });
      await load();
      if (onChange) onChange();
    } catch (err) {
      const reason = err && err.message ? err.message : 'Try again.';
      toast({ title: 'Could not remove expense', description: reason, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const lineLabel = (key) => {
    const l = SCHED_E_LINES.find((x) => x.key === key);
    return l ? `${l.line} · ${l.label}` : key;
  };

  const fieldGrid = (d, setD, idPrefix) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelStyle} htmlFor={`${idPrefix}-desc`}>Description</label>
        <input id={`${idPrefix}-desc`} style={inputStyle} value={d.description}
          placeholder="e.g. Roof repair, HOA dues, depreciation"
          onChange={(e) => setD({ ...d, description: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${idPrefix}-amt`}>Amount paid</label>
        <input id={`${idPrefix}-amt`} style={inputStyle} type="number" step="0.01" min="0" value={d.amount}
          placeholder="0.00"
          onChange={(e) => setD({ ...d, amount: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${idPrefix}-date`}>Date paid</label>
        <input id={`${idPrefix}-date`} style={inputStyle} type="date" value={d.datePaid}
          onChange={(e) => setD({ ...d, datePaid: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${idPrefix}-line`}>Schedule E line</label>
        <select id={`${idPrefix}-line`} style={{ ...inputStyle, cursor: 'pointer' }} value={d.schedECategory}
          onChange={(e) => setD({ ...d, schedECategory: e.target.value })}>
          {SCHED_E_LINES.map((l) => <option key={l.key} value={l.key}>{l.line} · {l.label}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle} htmlFor={`${idPrefix}-vendor`}>Vendor (optional)</label>
        <input id={`${idPrefix}-vendor`} style={inputStyle} value={d.vendorName}
          placeholder="Who you paid"
          onChange={(e) => setD({ ...d, vendorName: e.target.value })} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelStyle} htmlFor={`${idPrefix}-note`}>Note (optional)</label>
        <input id={`${idPrefix}-note`} style={inputStyle} value={d.note}
          onChange={(e) => setD({ ...d, note: e.target.value })} />
      </div>
    </div>
  );

  const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    fontSize: '13px', fontWeight: 600, color: '#fff', background: NAVY,
    border: 'none', borderRadius: '8px', cursor: 'pointer',
  };
  const btnQuiet = {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    fontSize: '13px', fontWeight: 500, color: INK_MUTED, background: 'transparent',
    border: `1px solid ${BORDER}`, borderRadius: '8px', cursor: 'pointer',
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <div className="flex items-center" style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: INK_MUTED,
          textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Manual expenses
        </span>
        {!adding && (
          <button onClick={() => { setDraft(blankDraft()); setAdding(true); }}
            style={{ ...btnQuiet, marginLeft: 'auto', padding: '5px 11px' }}>
            <Plus style={{ width: '14px', height: '14px' }} /> Add expense
          </button>
        )}
      </div>

      <p style={{ fontSize: '12px', color: INK_FAINT, lineHeight: 1.5, marginBottom: '12px' }}>
        For expenses that don't come through bill pay — mortgage interest, depreciation, HOA dues,
        a repair you paid by card. Recorded by the date you paid, so it lands in the right tax year.
      </p>

      {adding && (
        <div style={{ background: PAGE, border: `1px solid ${BORDER}`, borderRadius: '10px',
          padding: '14px', marginBottom: '14px' }}>
          {fieldGrid(draft, setDraft, 'add')}
          <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
            <button onClick={handleAdd} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
              <Check style={{ width: '14px', height: '14px' }} /> Save expense
            </button>
            <button onClick={() => { setAdding(false); setDraft(blankDraft()); }} disabled={saving} style={btnQuiet}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ height: '36px', background: PAGE, borderRadius: '8px' }} />
      ) : rows.length === 0 ? (
        !adding && (
          <p style={{ fontSize: '13px', color: INK_FAINT, lineHeight: 1.6 }}>
            No manual expenses yet. These flow into the profit &amp; loss alongside your tracked bills.
          </p>
        )
      ) : (
        <div>
          {rows.map((r) => (
            editingId === r.id ? (
              <div key={r.id} style={{ background: PAGE, border: `1px solid ${BORDER}`,
                borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                {fieldGrid(editDraft, setEditDraft, `edit-${r.id}`)}
                <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
                  <button onClick={handleSaveEdit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                    <Check style={{ width: '14px', height: '14px' }} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} disabled={saving} style={btnQuiet}>
                    <X style={{ width: '14px', height: '14px' }} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={r.id} className="flex items-center gap-2"
                style={{ padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px',
                  marginBottom: '8px', background: SURFACE }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: INK, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.description || r.vendorName || 'Expense'}
                  </div>
                  <div style={{ fontSize: '12px', color: INK_FAINT, marginTop: '2px' }}>
                    {fmtDate(r.datePaid)} · {lineLabel(r.schedECategory)}
                    {r.vendorName ? ` · ${r.vendorName}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: INK }}>{money2(r.amount)}</span>
                <button onClick={() => startEdit(r)} title="Edit" disabled={saving}
                  style={{ padding: '4px', color: INK_FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <Pencil style={{ width: '14px', height: '14px' }} />
                </button>
                <button onClick={() => handleDelete(r)} title="Remove" disabled={saving}
                  style={{ padding: '4px', color: RED, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalManualExpense;
