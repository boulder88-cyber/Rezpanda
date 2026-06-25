import React, { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  Users, Calendar, DollarSign, Home, Pencil, Check, X,
  AlertTriangle, CheckCircle2, Clock, Phone, Mail, KeyRound
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// LeasePanel — the rent roll for ONE rental property.
//
// Reads/writes the `leases` collection. One active lease per property for v1
// (a future `unitLabel` field + dropping the single-record assumption is all
// multi-unit needs — no migration). The lease record is load-bearing: it
// carries the EXPECTED rent + tenant, which is what lets income ingestion
// later decide "this ~$2,400 deposit is rent for THIS property," and what the
// P&L measures received-vs-expected against.
//
// Design system LOCKED: navy #1e3a5f primary, gold #c9a96e accent, warm bg
// #faf8f4, status red/amber/green/grey via tint. Inline style tokens (Tailwind
// utility classes are a drift risk). Sentence case, plain active copy.
//
// "See, don't do": this panel records the lease facts. It never collects rent,
// never moves money, never messages a tenant. It surfaces; the landlord acts.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_MUTED = '#5b6472';
const INK_FAINT = '#95a0ae';
const BORDER = '#e9e4db';
const SURFACE = '#ffffff';
const PAGE = '#faf8f4';

// Status palette (matches the bills surfaces): each status is a tint fill +
// same-family text, so colour reads as a quiet signal not a block of paint.
const LEASE_STATUS = {
  active:   { label: 'Active',         color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  expiring: { label: 'Expiring soon',  color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  expired:  { label: 'Expired',        color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  vacant:   { label: 'Vacant',         color: '#5b6472', bg: '#f4f2ee', border: '#e9e4db' },
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

// Derive lease status from term dates. Empty = vacant; ≤60 days to end =
// expiring; past end = expired; otherwise active. One fact, one place: status
// is computed, never stored, so it can't drift from the dates.
const deriveStatus = (lease) => {
  if (!lease || !lease.leaseStart || !lease.monthlyRent) return 'vacant';
  if (!lease.leaseEnd) return 'active';
  const end = new Date(lease.leaseEnd);
  if (isNaN(end)) return 'active';
  const now = new Date();
  const days = Math.round((end - now) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring';
  return 'active';
};

const EMPTY_DRAFT = {
  tenantName: '', tenantEmail: '', tenantPhone: '',
  monthlyRent: '', deposit: '',
  leaseStart: '', leaseEnd: '',
  notes: '',
};

const LeasePanel = ({ home }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const homeId = home && home.id;

  const load = useCallback(async () => {
    if (!currentUser || !homeId) { setLoading(false); return; }
    setLoading(true);
    try {
      // One active lease per property for v1: take the most recent for this home.
      const items = await pb.collection('leases').getFullList({
        filter: `ownerId = "${currentUser.id}" && homeId = "${homeId}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setLease(items && items.length ? items[0] : null);
    } catch (err) {
      // Fail soft: a missing `leases` collection or empty result reads as
      // "no lease yet," never a crash. The panel degrades to the vacant CTA.
      console.error('Lease load failed:', err);
      setLease(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser, homeId]);

  useEffect(() => { load(); }, [load]);

  const openEdit = () => {
    setDraft(lease ? {
      tenantName: lease.tenantName || '',
      tenantEmail: lease.tenantEmail || '',
      tenantPhone: lease.tenantPhone || '',
      monthlyRent: lease.monthlyRent != null ? String(lease.monthlyRent) : '',
      deposit: lease.deposit != null ? String(lease.deposit) : '',
      leaseStart: lease.leaseStart ? lease.leaseStart.slice(0, 10) : '',
      leaseEnd: lease.leaseEnd ? lease.leaseEnd.slice(0, 10) : '',
      notes: lease.notes || '',
    } : EMPTY_DRAFT);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setDraft(EMPTY_DRAFT); };

  const save = async () => {
    if (!currentUser || !homeId) return;
    setSaving(true);
    try {
      const rent = draft.monthlyRent.trim() === '' ? null : parseFloat(draft.monthlyRent);
      const dep = draft.deposit.trim() === '' ? null : parseFloat(draft.deposit);
      const payload = {
        ownerId: currentUser.id,
        homeId,
        tenantName: draft.tenantName.trim(),
        tenantEmail: draft.tenantEmail.trim(),
        tenantPhone: draft.tenantPhone.trim(),
        monthlyRent: Number.isFinite(rent) ? rent : null,
        deposit: Number.isFinite(dep) ? dep : null,
        leaseStart: draft.leaseStart || null,
        leaseEnd: draft.leaseEnd || null,
        notes: draft.notes.trim(),
      };
      if (lease) {
        await pb.collection('leases').update(lease.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('leases').create(payload, { $autoCancel: false });
      }
      toast({ title: 'Lease saved', description: 'Rent roll updated for this property.' });
      setEditing(false);
      await load();
    } catch (err) {
      console.error('Lease save failed:', err);
      // Surface the real PocketBase reason (the discipline that caught the
      // placement bug): a field/collection mismatch names itself here.
      const reason = err && err.message ? err.message : 'Could not save the lease.';
      toast({ title: 'Save failed', description: reason, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const card = {
    background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`,
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  if (loading) {
    return (
      <div style={card}>
        <div style={{ height: '14px', width: '120px', background: PAGE, borderRadius: '6px', marginBottom: '12px' }} />
        <div style={{ height: '40px', background: PAGE, borderRadius: '8px' }} />
      </div>
    );
  }

  const status = deriveStatus(lease);
  const sx = LEASE_STATUS[status];

  // ── Edit form ──
  if (editing) {
    const label = { display: 'block', fontSize: '12px', fontWeight: 500, color: INK_MUTED, marginBottom: '4px' };
    const input = {
      width: '100%', padding: '8px 10px', fontSize: '14px', color: INK,
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', outline: 'none',
    };
    const field = { marginBottom: '14px' };
    return (
      <div style={card}>
        <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
          <Users style={{ width: '18px', height: '18px', color: NAVY }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>
            {lease ? 'Edit lease' : 'Add lease'}
          </h3>
        </div>

        <div style={field}>
          <label style={label}>Tenant name</label>
          <input style={input} value={draft.tenantName}
            onChange={(e) => setDraft({ ...draft, tenantName: e.target.value })}
            placeholder="e.g. Sarah Thompson" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div style={field}>
            <label style={label}>Tenant email</label>
            <input style={input} value={draft.tenantEmail}
              onChange={(e) => setDraft({ ...draft, tenantEmail: e.target.value })}
              placeholder="optional" />
          </div>
          <div style={field}>
            <label style={label}>Tenant phone</label>
            <input style={input} value={draft.tenantPhone}
              onChange={(e) => setDraft({ ...draft, tenantPhone: e.target.value })}
              placeholder="optional" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div style={field}>
            <label style={label}>Monthly rent</label>
            <input style={input} value={draft.monthlyRent} inputMode="decimal"
              onChange={(e) => setDraft({ ...draft, monthlyRent: e.target.value })}
              placeholder="0.00" />
          </div>
          <div style={field}>
            <label style={label}>Security deposit</label>
            <input style={input} value={draft.deposit} inputMode="decimal"
              onChange={(e) => setDraft({ ...draft, deposit: e.target.value })}
              placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div style={field}>
            <label style={label}>Lease start</label>
            <input style={input} type="date" value={draft.leaseStart}
              onChange={(e) => setDraft({ ...draft, leaseStart: e.target.value })} />
          </div>
          <div style={field}>
            <label style={label}>Lease end</label>
            <input style={input} type="date" value={draft.leaseEnd}
              onChange={(e) => setDraft({ ...draft, leaseEnd: e.target.value })} />
          </div>
        </div>

        <div style={field}>
          <label style={label}>Notes</label>
          <textarea style={{ ...input, minHeight: '60px', resize: 'vertical' }} value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="optional — deposit bank, renewal terms, anything to remember" />
        </div>

        <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
          <button onClick={save} disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', fontSize: '14px', fontWeight: 500, color: '#fff',
              background: NAVY, border: 'none', borderRadius: '8px',
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
            }}>
            <Check style={{ width: '15px', height: '15px' }} />
            {saving ? 'Saving…' : 'Save lease'}
          </button>
          <button onClick={cancelEdit} disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', fontSize: '14px', fontWeight: 500, color: INK_MUTED,
              background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '8px',
              cursor: 'pointer',
            }}>
            <X style={{ width: '15px', height: '15px' }} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Vacant state (no lease yet) ──
  if (!lease) {
    return (
      <div style={card}>
        <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
          <KeyRound style={{ width: '18px', height: '18px', color: INK_FAINT }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>Rent roll</h3>
          <span style={{
            marginLeft: 'auto', fontSize: '12px', fontWeight: 500,
            color: LEASE_STATUS.vacant.color, background: LEASE_STATUS.vacant.bg,
            border: `1px solid ${LEASE_STATUS.vacant.border}`, borderRadius: '999px', padding: '2px 10px',
          }}>Vacant</span>
        </div>
        <p style={{ fontSize: '14px', color: INK_MUTED, lineHeight: 1.6, marginBottom: '14px' }}>
          No lease on file for this property. Add the tenant and rent terms so this
          property's income shows up in its P&amp;L and tax summary.
        </p>
        <button onClick={openEdit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', fontSize: '14px', fontWeight: 500, color: '#fff',
            background: NAVY, border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}>
          <Users style={{ width: '15px', height: '15px' }} />
          Add lease
        </button>
      </div>
    );
  }

  // ── Filled lease (display) ──
  const startStr = fmtDate(lease.leaseStart);
  const endStr = fmtDate(lease.leaseEnd);
  const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2" style={{ padding: '7px 0' }}>
      <Icon style={{ width: '15px', height: '15px', color: INK_FAINT, flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: INK_FAINT, minWidth: '88px' }}>{label}</span>
      <span style={{ fontSize: '14px', color: INK, fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ ...card, borderLeft: `4px solid ${sx.color}` }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
        <Users style={{ width: '18px', height: '18px', color: NAVY }} />
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: INK }}>Rent roll</h3>
        <span style={{
          fontSize: '12px', fontWeight: 500, color: sx.color, background: sx.bg,
          border: `1px solid ${sx.border}`, borderRadius: '999px', padding: '2px 10px',
        }}>{sx.label}</span>
        <button onClick={openEdit}
          style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '5px 10px', fontSize: '13px', fontWeight: 500, color: NAVY,
            background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: '8px', cursor: 'pointer',
          }}>
          <Pencil style={{ width: '13px', height: '13px' }} />
          Edit
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Row icon={Users} label="Tenant" value={lease.tenantName || '—'} />
        <Row icon={DollarSign} label="Monthly rent" value={money2(lease.monthlyRent)} />
        <Row icon={Home} label="Deposit" value={money2(lease.deposit)} />
        <Row icon={Calendar} label="Term"
          value={startStr ? `${startStr}${endStr ? ` – ${endStr}` : ' – open'}` : '—'} />
        {(lease.tenantEmail || lease.tenantPhone) && (
          <Row icon={Mail} label="Contact"
            value={[lease.tenantEmail, lease.tenantPhone].filter(Boolean).join('  ·  ') || '—'} />
        )}
      </div>

      {status === 'expiring' && (
        <div className="flex items-start gap-2" style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
          background: LEASE_STATUS.expiring.bg, border: `1px solid ${LEASE_STATUS.expiring.border}`,
        }}>
          <Clock style={{ width: '15px', height: '15px', color: LEASE_STATUS.expiring.color, flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: LEASE_STATUS.expiring.color, lineHeight: 1.5 }}>
            Lease ends {endStr}. Worth a renewal conversation soon.
          </span>
        </div>
      )}
      {status === 'expired' && (
        <div className="flex items-start gap-2" style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
          background: LEASE_STATUS.expired.bg, border: `1px solid ${LEASE_STATUS.expired.border}`,
        }}>
          <AlertTriangle style={{ width: '15px', height: '15px', color: LEASE_STATUS.expired.color, flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '13px', color: LEASE_STATUS.expired.color, lineHeight: 1.5 }}>
            This lease ended {endStr}. Update the term if it renewed, or mark the property vacant.
          </span>
        </div>
      )}

      {lease.notes && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: INK_MUTED, lineHeight: 1.6,
          paddingTop: '12px', borderTop: `1px solid ${BORDER}` }}>
          {lease.notes}
        </p>
      )}
    </div>
  );
};

export default LeasePanel;
