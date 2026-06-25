import React, { useState, useEffect, useCallback, useMemo } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  DollarSign, Check, X, Pencil, Inbox, ArrowDownToLine,
  CheckCircle2, AlertCircle, Trash2, CornerDownRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// RentIncomePanel — rent income for ONE rental property.
//
// Two jobs, both scoped to this property's home.id:
//   1. Received vs expected (this month): the lease's monthlyRent is the
//      expected figure; confirmed receipts for this property this month are
//      the received figure. The gap is the collection signal.
//   2. Pending receipt review: receipts that ingestion landed (status
//      pending_review) get confirmed / edited / placed / deleted here — the
//      same human-glance gate bills get, because rent rows feed the tax P&L.
//      Receipts ingestion could NOT attribute to a property (empty homeId)
//      surface as "unassigned" and can be claimed to THIS property.
//
// Open model honored: a receipt counts once confirmed (status confirmed) and
// is never silently auto-confirmed. money rules: whole dollars for the
// summary, 2dp for individual receipt amounts. Design system LOCKED.
//
// "See, don't do": records rent received; never requests or moves money.
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
const AMBER = '#b45309';

const money0 = (n) => {
  const v = parseFloat(n);
  if (!Number.isFinite(v)) return '$0';
  return `$${Math.round(v).toLocaleString('en-US')}`;
};
const money2 = (n) => {
  const v = parseFloat(n);
  if (!Number.isFinite(v)) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Which calendar month a receipt counts toward: prefer receivedDate, fall back
// to created. Returns 'YYYY-MM' for grouping.
const monthKey = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || isNaN(dt)) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};
const thisMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const isConfirmed = (r) => r && r.status === 'confirmed';
const isPending = (r) => r && (r.status === 'pending_review' || !r.status);

const RentIncomePanel = ({ home }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [expectedRent, setExpectedRent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ amount: '', payerName: '', coversPeriod: '', receivedDate: '' });

  const homeId = home && home.id;

  const load = useCallback(async () => {
    if (!currentUser) { setLoading(false); return; }
    setLoading(true);
    try {
      // This property's lease gives the expected monthly rent; receipts give
      // what's actually come in. Two small queries scoped to this owner.
      const [items, leases] = await Promise.all([
        pb.collection('rentReceipts').getFullList({
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-receivedDate',
          $autoCancel: false,
        }),
        pb.collection('leases').getFullList({
          filter: `ownerId = "${currentUser.id}" && homeId = "${homeId}"`,
          sort: '-created',
          $autoCancel: false,
        }),
      ]);
      setReceipts(Array.isArray(items) ? items : []);
      const lease = leases && leases.length ? leases[0] : null;
      const rent = lease ? (typeof lease.monthlyRent === 'number' ? lease.monthlyRent : parseFloat(lease.monthlyRent)) : 0;
      setExpectedRent(Number.isFinite(rent) ? rent : 0);
    } catch (err) {
      console.error('Rent income load failed:', err);
      setReceipts([]);
      setExpectedRent(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser, homeId]);

  useEffect(() => { load(); }, [load]);

  // ── Partition receipts ──
  const forThisHome = useMemo(
    () => receipts.filter((r) => r.homeId === homeId),
    [receipts, homeId]
  );
  const unassigned = useMemo(
    () => receipts.filter((r) => !r.homeId && isPending(r)),
    [receipts]
  );

  const pendingHere = forThisHome.filter(isPending);
  const confirmedHere = forThisHome.filter(isConfirmed);

  // ── Received vs expected, this month ──
  const tmk = thisMonthKey();
  const receivedThisMonth = useMemo(
    () => confirmedHere
      .filter((r) => monthKey(r.receivedDate || r.created) === tmk)
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [confirmedHere, tmk]
  );

  const expected = parseFloat(expectedRent) || 0;
  const gap = expected - receivedThisMonth;
  let collectStatus;
  if (expected <= 0) collectStatus = { label: 'No rent set', color: INK_FAINT, bg: PAGE, border: BORDER };
  else if (receivedThisMonth >= expected - 0.5) collectStatus = { label: 'Rent received', color: GREEN, bg: '#ecfdf5', border: '#a7f3d0' };
  else if (receivedThisMonth > 0) collectStatus = { label: 'Partially received', color: AMBER, bg: '#fffbeb', border: '#fde68a' };
  else collectStatus = { label: 'Not yet received', color: AMBER, bg: '#fffbeb', border: '#fde68a' };

  // ── Actions ──
  const startEdit = (r) => {
    setEditingId(r.id);
    setDraft({
      amount: r.amount != null ? String(r.amount) : '',
      payerName: r.payerName || '',
      coversPeriod: r.coversPeriod || '',
      receivedDate: r.receivedDate ? String(r.receivedDate).slice(0, 10) : '',
    });
  };
  const cancelEdit = () => { setEditingId(null); };

  // Confirm as-is: trust the parse, attach to this home, flip to confirmed.
  const confirmReceipt = async (r, claimToThisHome) => {
    setBusyId(r.id);
    try {
      const payload = { status: 'confirmed' };
      if (claimToThisHome && r.homeId !== homeId) payload.homeId = homeId;
      await pb.collection('rentReceipts').update(r.id, payload, { $autoCancel: false });
      toast({ title: 'Rent confirmed', description: 'Added to this property\u2019s income.' });
      await load();
    } catch (err) {
      console.error('Confirm failed:', err);
      toast({ title: 'Could not confirm', description: err && err.message ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  // Save edits + confirm + place on this home, in one action.
  const saveAndConfirm = async (r) => {
    setBusyId(r.id);
    try {
      const amt = draft.amount.trim() === '' ? null : parseFloat(draft.amount);
      const payload = {
        status: 'confirmed',
        homeId,
        amount: Number.isFinite(amt) ? amt : null,
        payerName: draft.payerName.trim(),
        coversPeriod: draft.coversPeriod.trim(),
        receivedDate: draft.receivedDate || r.receivedDate || null,
      };
      await pb.collection('rentReceipts').update(r.id, payload, { $autoCancel: false });
      toast({ title: 'Rent saved', description: 'Corrected and added to income.' });
      setEditingId(null);
      await load();
    } catch (err) {
      console.error('Save failed:', err);
      toast({ title: 'Save failed', description: err && err.message ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const deleteReceipt = async (r) => {
    setBusyId(r.id);
    try {
      await pb.collection('rentReceipts').delete(r.id, { $autoCancel: false });
      await load();
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ title: 'Could not remove', description: err && err.message ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const card = {
    background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`,
    padding: '18px', marginTop: '16px',
  };

  if (loading) {
    return (
      <div style={card}>
        <div style={{ height: '14px', width: '140px', background: PAGE, borderRadius: '6px', marginBottom: '12px' }} />
        <div style={{ height: '32px', background: PAGE, borderRadius: '8px' }} />
      </div>
    );
  }

  const label = { display: 'block', fontSize: '12px', fontWeight: 500, color: INK_MUTED, marginBottom: '4px' };
  const input = {
    width: '100%', padding: '8px 10px', fontSize: '14px', color: INK,
    background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', outline: 'none',
  };

  return (
    <div style={card}>
      <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
        <ArrowDownToLine style={{ width: '17px', height: '17px', color: NAVY }} />
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: INK }}>Rent income</h4>
      </div>

      {/* Received vs expected — this month */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        padding: '14px 16px', borderRadius: '10px',
        background: collectStatus.bg, border: `1px solid ${collectStatus.border}`,
      }}>
        <div>
          <div style={{ fontSize: '11px', color: INK_MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Expected</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: INK }}>{money0(expected)}</div>
        </div>
        <div style={{ color: INK_FAINT, fontSize: '18px' }}>→</div>
        <div>
          <div style={{ fontSize: '11px', color: INK_MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Received</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: collectStatus.color }}>{money0(receivedThisMonth)}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: collectStatus.color }}>{collectStatus.label}</span>
          {expected > 0 && gap > 0.5 && (
            <div style={{ fontSize: '12px', color: INK_MUTED, marginTop: '2px' }}>{money0(gap)} outstanding this month</div>
          )}
        </div>
      </div>

      {/* Pending receipts FOR THIS HOME — need a glance before they count */}
      {pendingHere.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: INK_MUTED, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            To review
          </div>
          {pendingHere.map((r) => (
            <ReceiptRow key={r.id} r={r} editing={editingId === r.id} busy={busyId === r.id}
              draft={draft} setDraft={setDraft} inputStyle={input} labelStyle={label}
              onStartEdit={() => startEdit(r)} onCancelEdit={cancelEdit}
              onConfirm={() => confirmReceipt(r, false)} onSaveConfirm={() => saveAndConfirm(r)}
              onDelete={() => deleteReceipt(r)} claimable={false} />
          ))}
        </div>
      )}

      {/* Unassigned receipts — ingestion couldn't match a property. Offer to
          claim them to THIS one. Shown on every rental card by design: a
          floating rent payment shouldn't hide just because we couldn't guess. */}
      {unassigned.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: PAGE, border: `1px dashed ${BORDER}` }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
            <Inbox style={{ width: '15px', height: '15px', color: INK_FAINT }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: INK_MUTED }}>
              Unmatched rent payments ({unassigned.length})
            </span>
          </div>
          <p style={{ fontSize: '12px', color: INK_FAINT, lineHeight: 1.5, marginBottom: '10px' }}>
            These arrived but couldn't be matched to a property. Claim any that belong to {home.name || home.address || 'this property'}.
          </p>
          {unassigned.map((r) => (
            <div key={r.id} className="flex items-center gap-2" style={{ padding: '8px 0', borderTop: `1px solid ${BORDER}` }}>
              <CornerDownRight style={{ width: '14px', height: '14px', color: INK_FAINT, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: INK }}>{money2(r.amount)}</span>
                <span style={{ fontSize: '12px', color: INK_MUTED, marginLeft: '8px' }}>
                  {[r.payerName, r.coversPeriod, fmtDate(r.receivedDate)].filter(Boolean).join('  ·  ')}
                </span>
              </div>
              <button onClick={() => confirmReceipt(r, true)} disabled={busyId === r.id}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                  fontSize: '13px', fontWeight: 500, color: '#fff', background: NAVY, border: 'none',
                  borderRadius: '8px', cursor: busyId === r.id ? 'default' : 'pointer', opacity: busyId === r.id ? 0.6 : 1 }}>
                <Check style={{ width: '13px', height: '13px' }} />
                Claim here
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent confirmed receipts — quiet history, this property */}
      {confirmedHere.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: INK_MUTED, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Received
          </div>
          {confirmedHere.slice(0, 6).map((r) => (
            <div key={r.id} className="flex items-center gap-2" style={{ padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
              <CheckCircle2 style={{ width: '15px', height: '15px', color: GREEN, flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: INK }}>{money2(r.amount)}</span>
              <span style={{ fontSize: '13px', color: INK_MUTED }}>
                {[r.payerName, r.coversPeriod].filter(Boolean).join('  ·  ')}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: INK_FAINT }}>{fmtDate(r.receivedDate) || ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {pendingHere.length === 0 && confirmedHere.length === 0 && unassigned.length === 0 && (
        <p style={{ marginTop: '14px', fontSize: '13px', color: INK_FAINT, lineHeight: 1.6 }}>
          No rent recorded yet. Forward a rent payment confirmation to your CasaCEO address and it'll
          show up here to review.
        </p>
      )}
    </div>
  );
};

// One reviewable pending receipt: display row + inline editor twin.
const ReceiptRow = ({ r, editing, busy, draft, setDraft, inputStyle, labelStyle,
  onStartEdit, onCancelEdit, onConfirm, onSaveConfirm, onDelete }) => {
  if (editing) {
    return (
      <div style={{ padding: '14px', borderRadius: '10px', background: PAGE, border: `1px solid ${BORDER}`, marginBottom: '8px' }}>
        <div className="grid grid-cols-2 gap-3">
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Amount received</label>
            <input style={inputStyle} value={draft.amount} inputMode="decimal"
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })} placeholder="0.00" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Received date</label>
            <input style={inputStyle} type="date" value={draft.receivedDate}
              onChange={(e) => setDraft({ ...draft, receivedDate: e.target.value })} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Payer</label>
            <input style={inputStyle} value={draft.payerName}
              onChange={(e) => setDraft({ ...draft, payerName: e.target.value })} placeholder="tenant name" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Covers period</label>
            <input style={inputStyle} value={draft.coversPeriod}
              onChange={(e) => setDraft({ ...draft, coversPeriod: e.target.value })} placeholder="e.g. March 2026" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSaveConfirm} disabled={busy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '14px',
              fontWeight: 500, color: '#fff', background: NAVY, border: 'none', borderRadius: '8px',
              cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            <Check style={{ width: '14px', height: '14px' }} /> Save &amp; confirm
          </button>
          <button onClick={onCancelEdit} disabled={busy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '14px',
              fontWeight: 500, color: INK_MUTED, background: 'transparent', border: `1px solid ${BORDER}`,
              borderRadius: '8px', cursor: 'pointer' }}>
            <X style={{ width: '14px', height: '14px' }} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
      borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', marginBottom: '8px' }}>
      <AlertCircle style={{ width: '16px', height: '16px', color: AMBER, flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: INK }}>{money2(r.amount)}</span>
        <span style={{ fontSize: '13px', color: INK_MUTED, marginLeft: '8px' }}>
          {[r.payerName, r.coversPeriod, fmtDate(r.receivedDate)].filter(Boolean).join('  ·  ') || 'rent received'}
        </span>
        <div style={{ fontSize: '12px', color: AMBER, marginTop: '2px' }}>Needs your confirmation</div>
      </div>
      <button onClick={onStartEdit} disabled={busy} title="Review & edit"
        style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 11px',
          fontSize: '13px', fontWeight: 500, color: NAVY, background: '#fff', border: `1px solid ${BORDER}`,
          borderRadius: '8px', cursor: 'pointer' }}>
        <Pencil style={{ width: '13px', height: '13px' }} /> Review
      </button>
      <button onClick={onConfirm} disabled={busy} title="Confirm as-is"
        style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 11px',
          fontSize: '13px', fontWeight: 500, color: '#fff', background: NAVY, border: 'none',
          borderRadius: '8px', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
        <Check style={{ width: '13px', height: '13px' }} /> Confirm
      </button>
      <button onClick={onDelete} disabled={busy} title="Not rent — remove"
        style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '6px', color: INK_FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}>
        <Trash2 style={{ width: '15px', height: '15px' }} />
      </button>
    </div>
  );
};

export default RentIncomePanel;
