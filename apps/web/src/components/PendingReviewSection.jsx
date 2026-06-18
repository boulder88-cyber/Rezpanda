import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Sparkles, Check, Calendar, Tag, Pencil, X, ExternalLink, Mail } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PENDING REVIEW SECTION
// Shows bills captured by email ingestion that are awaiting user confirmation
// (status === "pending_review").
//
// Two paths per bill:
//   • Confirm        → flips status to "confirmed" as-is (good parses)
//   • Review         → expands the row inline into editable fields pre-filled
//                      with the parsed values. "Save & Confirm" writes the
//                      corrections back to the SAME service_companies record
//                      and flips status to confirmed in one action.
//
// The parsed_raw text (what the AI originally read) is surfaced inside the
// Review panel as a "what we saw" reference.
//
// Bills left untouched simply remain here for "review later".
// ═══════════════════════════════════════════════════════════════════════

const PendingReviewSection = ({ onConfirmed }) => {
  const { currentUser } = useAuth();
  const { homes, selectedHome } = useHome();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  // Which row is currently expanded for editing, plus its working draft.
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ companyName: '', amount: '', dueDate: '', category: '', homeId: '', paymentType: 'Manual' });

  const fetchPending = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const records = await pb.collection('service_companies').getFullList({
        filter: `ownerId = "${currentUser.id}" && status = "pending_review"`,
        sort: '-created',
        $autoCancel: false,
      });
      setPending(records);
    } catch {
      // silent: if it fails, just show nothing rather than break the page
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, [currentUser]);

  // Open the inline editor for a bill, pre-filling fields with parsed values.
  const startReview = (bill) => {
    setEditingId(bill.id);
    setDraft({
      companyName: bill.companyName ?? '',
      amount: typeof bill.amount === 'number' ? String(bill.amount) : '',
      // <input type="date"> wants YYYY-MM-DD; slice an ISO/date string safely.
      dueDate: bill.dueDate ? String(bill.dueDate).slice(0, 10) : '',
      category: bill.category ?? '',
      // default to the bill's existing home, else the currently-selected home
      homeId: bill.homeId || (selectedHome ? selectedHome.id : ''),
      paymentType: bill.paymentType || 'Manual',
    });
  };

  const cancelReview = () => {
    setEditingId(null);
    setDraft({ companyName: '', amount: '', dueDate: '', category: '', homeId: '', paymentType: 'Manual' });
  };

  const updateDraft = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  // Confirm-as-is: trust the parse, just flip status. (Good parses.)
  const handleConfirm = async (bill) => {
    setConfirmingId(bill.id);
    try {
      await pb.collection('service_companies').update(bill.id, { status: 'confirmed' }, { $autoCancel: false });
      toast({ title: '✅ Bill confirmed', description: `${bill.companyName} added to your bills.` });
      setPending(prev => prev.filter(b => b.id !== bill.id));
      if (onConfirmed) onConfirmed();
    } catch {
      toast({ title: 'Could not confirm bill', variant: 'destructive' });
    } finally {
      setConfirmingId(null);
    }
  };

  // Save & Confirm: write the edited fields back to the SAME record, then
  // flip status to confirmed — corrections + confirm in a single action.
  const handleSaveAndConfirm = async (bill) => {
    const trimmedName = draft.companyName.trim();
    if (!trimmedName) {
      toast({ title: 'Company name is required', variant: 'destructive' });
      return;
    }

    // amount: blank → leave unset; otherwise must be a valid number.
    let amountValue;
    if (draft.amount.trim() !== '') {
      const parsed = parseFloat(draft.amount);
      if (Number.isNaN(parsed) || parsed < 0) {
        toast({ title: 'Enter a valid amount', variant: 'destructive' });
        return;
      }
      amountValue = parsed;
    }

    setConfirmingId(bill.id);
    try {
      const payload = {
        companyName: trimmedName,
        dueDate: draft.dueDate || null,
        category: draft.category || null,
        status: 'confirmed',
      };
      if (amountValue !== undefined) payload.amount = amountValue;
      if (draft.homeId) payload.homeId = draft.homeId;
      if (draft.paymentType) payload.paymentType = draft.paymentType;

      await pb.collection('service_companies').update(bill.id, payload, { $autoCancel: false });
      toast({ title: '✅ Bill confirmed', description: `${trimmedName} added to your bills.` });
      setPending(prev => prev.filter(b => b.id !== bill.id));
      cancelReview();
      if (onConfirmed) onConfirmed();
    } catch {
      toast({ title: 'Could not save bill', variant: 'destructive' });
    } finally {
      setConfirmingId(null);
    }
  };

  // While loading the very first time, show nothing (avoids a flash).
  if (loading) return null;

  // No pending bills → render nothing at all.
  if (pending.length === 0) return null;

  // Shared input styling so the editor reads as one clean form.
  const fieldLabel = { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' };
  const fieldInput = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', color: '#0f172a', background: '#fff', outline: 'none' };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #c7d7eb', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
        <Sparkles style={{ width: '18px', height: '18px', color: '#1e3a5f' }} />
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Bills to Review</h2>
        <span className="font-medium text-white rounded-full" style={{ background: '#1e3a5f', padding: '2px 10px', fontSize: '12px' }}>
          {pending.length}
        </span>
      </div>
      <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '16px' }}>
        We found these from your forwarded bills. Confirm to add them — or Review to fix any details first.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pending.map(bill => {
          const isEditing = editingId === bill.id;
          const isBusy = confirmingId === bill.id;

          return (
            <div key={bill.id}
              style={{ background: '#f8fafc', border: `1px solid ${isEditing ? '#c9a96e' : '#e2e8f0'}`, borderRadius: '10px', padding: '14px 16px', transition: 'border-color 0.15s' }}>

              {/* ── Summary row (always visible) ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{bill.companyName}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1" style={{ marginTop: '4px' }}>
                    {typeof bill.amount === 'number' && (
                      <span className="font-bold text-slate-900" style={{ fontSize: '14px' }}>${bill.amount.toFixed(2)}</span>
                    )}
                    {bill.dueDate && (
                      <span className="flex items-center gap-1 text-slate-500" style={{ fontSize: '13px' }}>
                        <Calendar style={{ width: '13px', height: '13px' }} />
                        Due {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {bill.category && (
                      <span className="flex items-center gap-1 text-slate-500" style={{ fontSize: '13px' }}>
                        <Tag style={{ width: '13px', height: '13px' }} />
                        {bill.category}
                      </span>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startReview(bill)}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 font-semibold transition-all rounded-xl"
                      style={{ background: '#fff', border: '1px solid #1e3a5f', color: '#1e3a5f', padding: '8px 16px', fontSize: '13px' }}>
                      <Pencil style={{ width: '14px', height: '14px' }} />
                      Review
                    </button>
                    <button
                      onClick={() => handleConfirm(bill)}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                      style={{ background: '#1e3a5f', padding: '8px 18px', fontSize: '13px', opacity: isBusy ? 0.6 : 1 }}>
                      <Check style={{ width: '15px', height: '15px' }} />
                      {isBusy ? 'Confirming…' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Inline editor (expands on Review) ── */}
              {isEditing && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #d8c6a0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={fieldLabel}>Company</label>
                      <input
                        type="text"
                        value={draft.companyName}
                        onChange={(e) => updateDraft('companyName', e.target.value)}
                        style={fieldInput}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label style={fieldLabel}>Amount</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={draft.amount}
                        onChange={(e) => updateDraft('amount', e.target.value)}
                        style={fieldInput}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label style={fieldLabel}>Due date</label>
                      <input
                        type="date"
                        value={draft.dueDate}
                        onChange={(e) => updateDraft('dueDate', e.target.value)}
                        style={fieldInput}
                      />
                    </div>
                    <div>
                      <label style={fieldLabel}>Category</label>
                      <input
                        type="text"
                        value={draft.category}
                        onChange={(e) => updateDraft('category', e.target.value)}
                        style={fieldInput}
                        placeholder="e.g. Internet, Utilities"
                      />
                    </div>
                    {(homes || []).length > 0 && (
                      <div>
                        <label style={fieldLabel}>Property</label>
                        <select
                          value={draft.homeId}
                          onChange={(e) => updateDraft('homeId', e.target.value)}
                          style={fieldInput}>
                          <option value="">— Choose property —</option>
                          {homes.map(h => (
                            <option key={h.id} value={h.id}>{h.name || h.address || 'Property'}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label style={fieldLabel}>How it's paid</label>
                      <select
                        value={draft.paymentType}
                        onChange={(e) => updateDraft('paymentType', e.target.value)}
                        style={fieldInput}>
                        <option value="Manual">Manual</option>
                        <option value="Autopay (card)">Autopay (card)</option>
                        <option value="Autopay (bank)">Autopay (bank)</option>
                      </select>
                    </div>
                  </div>

                  {/* "What we saw" — the original parsed values, for reference.
                      parsed_raw is an object ({amount, category, companyName,
                      dueDate}); it may also arrive as a JSON string. Normalize
                      both into plain text so React never receives a raw object. */}
                  {(() => {
                    let raw = bill.parsed_raw;
                    if (typeof raw === 'string') {
                      try { raw = JSON.parse(raw); } catch { /* leave as string */ }
                    }
                    if (!raw) return null;
                    const text = typeof raw === 'object'
                      ? Object.entries(raw).map(([k, v]) => `${k}: ${v}`).join('\n')
                      : String(raw);
                    return (
                      <div style={{ marginTop: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                          What we saw
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto' }}>
                          {text}
                        </p>
                      </div>
                    );
                  })()}

                  {/* ── Helpers while reviewing ──
                      Someone reviewing a bill usually needs more than the email:
                      a link to the vendor's site (to verify the charge / log in),
                      and a quick way to forward the bill to someone with a
                      question. Forwarding opens the user's OWN mail client
                      pre-filled (mailto:) — CasaCEO never sends on their behalf. */}
                  <div className="flex flex-wrap items-center gap-2" style={{ marginTop: '12px' }}>
                    {bill.paymentLink ? (
                      <a
                        href={bill.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium transition-colors"
                        style={{ fontSize: '12px', color: '#1e3a5f', border: '1px solid #c7d7eb', borderRadius: '8px', padding: '6px 10px', background: '#fff' }}>
                        <ExternalLink style={{ width: '13px', height: '13px' }} />
                        Open vendor site
                      </a>
                    ) : (
                      <span className="text-slate-400" style={{ fontSize: '12px' }}>
                        No vendor link yet — add one when confirming.
                      </span>
                    )}

                    <a
                      href={`mailto:?subject=${encodeURIComponent(`Question about ${draft.companyName || bill.companyName} bill`)}&body=${encodeURIComponent(
                        `I have a question about this bill:\n\n` +
                        `Company: ${draft.companyName || bill.companyName || ''}\n` +
                        `Amount: ${draft.amount || (typeof bill.amount === 'number' ? bill.amount : '') || ''}\n` +
                        `Due date: ${draft.dueDate || (bill.dueDate ? String(bill.dueDate).slice(0, 10) : '') || ''}\n\n`
                      )}`}
                      className="flex items-center gap-1 font-medium transition-colors"
                      style={{ fontSize: '12px', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', background: '#fff' }}>
                      <Mail style={{ width: '13px', height: '13px' }} />
                      Forward / ask a question
                    </a>
                  </div>
                  <div className="flex items-center justify-end gap-2" style={{ marginTop: '14px' }}>
                    <button
                      onClick={cancelReview}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 font-semibold transition-all rounded-xl"
                      style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#64748b', padding: '8px 16px', fontSize: '13px' }}>
                      <X style={{ width: '14px', height: '14px' }} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveAndConfirm(bill)}
                      disabled={isBusy}
                      className="flex items-center justify-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
                      style={{ background: '#1e3a5f', padding: '8px 18px', fontSize: '13px', opacity: isBusy ? 0.6 : 1 }}>
                      <Check style={{ width: '15px', height: '15px' }} />
                      {isBusy ? 'Saving…' : 'Save & Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingReviewSection;
