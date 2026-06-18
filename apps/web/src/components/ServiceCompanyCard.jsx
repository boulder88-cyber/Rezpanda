import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ExternalLink, Edit2, Trash2, Building, CheckCircle2, Repeat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import AddServiceCompanyForm from './AddServiceCompanyForm.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

// ═══════════════════════════════════════════════════════════════════════
// SERVICE COMPANY ROW
//
// Status + paymentType drive behavior:
//   • Manual, not paid        -> "Pay Bill" -> did-you-pay -> status:paid + paidDate
//   • Autopay, not reviewed   -> "Mark Reviewed" -> status:paid + reviewedDate
//                                (a human acknowledgment; does NOT move money)
//   • status "paid"           -> "All Set" history row, labeled honestly:
//                                  manual  -> "Paid <date>"
//                                  autopay -> "Autopay . Reviewed <date>"
//
// Marking paid/reviewed also logs to payment_history (via onPay) so History
// stays populated. "All Set" means the user's part is done — for autopay the
// actual bank draft may still lag a few days, which is why it's not "Paid".
// ═══════════════════════════════════════════════════════════════════════

const isAutopay = (c) => c.paymentType === 'Autopay (card)' || c.paymentType === 'Autopay (bank)';

// ── Status color system ─────────────────────────────────────────────────
// red    = overdue (manual, due date in the past, not paid)
// yellow = needs action (manual, not yet paid, due now/soon or undated)
// green  = handled, will close on its own (autopay, not yet reviewed)
// grey   = paid / history
// Returns the accent color used as a left bar on the row.
const statusAccent = (c) => {
  if (c.status === 'paid') return '#cbd5e1';            // grey
  if (isAutopay(c)) return '#059669';                   // green
  if (c.dueDate && new Date(c.dueDate) < new Date()) return '#dc2626'; // red
  return '#f59e0b';                                     // yellow
};

const ServiceCompanyCard = ({ company, onRefresh, onPay, propertyName = null, homes = [] }) => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const isPaid = company.status === 'paid';
  const autopay = isAutopay(company);

  // Backfill: assign this bill to a property (for bills missing homeId).
  const handleAssignHome = async (homeId) => {
    if (!homeId) return;
    setIsAssigning(true);
    try {
      await pb.collection('service_companies').update(company.id, { homeId }, { $autoCancel: false });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not set property', variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await pb.collection('service_companies').delete(company.id, { $autoCancel: false });
      toast({ title: 'Bill removed.' });
      onRefresh();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Manual step 1: open utility site (if any), then ask "did you pay?".
  const handlePayClick = () => {
    if (company.paymentLink) {
      window.open(company.paymentLink, '_blank', 'noopener,noreferrer');
    }
    setAwaitingConfirm(true);
  };

  // Manual step 2: confirm -> status:paid + paidDate, log payment.
  const handleConfirmPaid = async () => {
    setIsMarking(true);
    try {
      await pb.collection('service_companies').update(
        company.id,
        { status: 'paid', paidDate: new Date().toISOString() },
        { $autoCancel: false }
      );
      if (onPay) await onPay(company);
      setAwaitingConfirm(false);
      toast({ title: '✅ Marked paid', description: `${company.companyName} cleared.` });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not mark paid', variant: 'destructive' });
    } finally {
      setIsMarking(false);
    }
  };

  // Autopay: "Mark Reviewed" -> status:paid + reviewedDate. A human looked at
  // it and it's correct. Does NOT change processing; money drafts on its own.
  const handleMarkReviewed = async () => {
    setIsMarking(true);
    try {
      await pb.collection('service_companies').update(
        company.id,
        { status: 'paid', reviewedDate: new Date().toISOString() },
        { $autoCancel: false }
      );
      if (onPay) await onPay(company);
      toast({ title: '✅ Reviewed', description: `${company.companyName} checked — autopay will draft on its own.` });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not mark reviewed', variant: 'destructive' });
    } finally {
      setIsMarking(false);
    }
  };

  // Undo: a paid/reviewed bill goes back to its open state. This is the
  // safety net for an accidental "paid" or a mistake noticed after the fact.
  // Flip status back to "confirmed" and clear BOTH date stamps so the bill
  // re-lands in the correct open section (Ready to Pay or autopay review).
  // No confirm dialog on purpose — undo IS the safety net, and it's itself
  // reversible (just mark paid again).
  const handleUndoPaid = async () => {
    setIsMarking(true);
    try {
      await pb.collection('service_companies').update(
        company.id,
        { status: 'confirmed', paidDate: null, reviewedDate: null },
        { $autoCancel: false }
      );
      toast({ title: 'Moved back to unpaid', description: `${company.companyName} is open again.` });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not undo', variant: 'destructive' });
    } finally {
      setIsMarking(false);
    }
  };

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch (e) { return url; }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const paidLabel = fmt(company.paidDate);
  const reviewedLabel = fmt(company.reviewedDate);
  const dueLabel = fmt(company.dueDate);

  return (
    <>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 group"
        style={{
          background: isPaid ? '#f8fafc' : '#fff',
          border: '1px solid #e2e8f0',
          borderLeft: `4px solid ${statusAccent(company)}`,
          borderRadius: '10px',
          padding: '14px 16px',
          opacity: isPaid ? 0.7 : 1,
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2f8' }}>
          <Building style={{ width: '18px', height: '18px', color: '#1e3a5f' }} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate" style={{ fontSize: '15px' }} title={company.companyName}>
            {company.companyName}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1" style={{ marginTop: '2px' }}>
            {propertyName && (
              <span className="font-medium" style={{ fontSize: '11px', color: '#1e3a5f', background: '#eef2f8', borderRadius: '6px', padding: '1px 8px' }}>
                {propertyName}
              </span>
            )}
            {!company.homeId && homes && homes.length > 0 && (
              <select
                value=""
                disabled={isAssigning}
                onChange={(e) => handleAssignHome(e.target.value)}
                style={{ fontSize: '11px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '1px 6px', background: '#fff' }}
              >
                <option value="">Set property…</option>
                {homes.map(h => (
                  <option key={h.id} value={h.id}>{h.name || h.address || 'Property'}</option>
                ))}
              </select>
            )}
            {autopay && (
              <span className="flex items-center gap-1 font-medium" style={{ fontSize: '11px', color: '#7c3aed', background: '#f5f3ff', borderRadius: '6px', padding: '1px 8px' }}>
                <Repeat style={{ width: '11px', height: '11px' }} />
                {company.paymentType}
              </span>
            )}
            {company.category && (
              <span className="text-slate-400" style={{ fontSize: '12px' }}>{company.category}</span>
            )}
            {dueLabel && !isPaid && (
              <span className="text-slate-500" style={{ fontSize: '12px' }}>
                {autopay ? `Drafts ~${dueLabel}` : `Due ${dueLabel}`}
              </span>
            )}
            {/* All Set labels — honest per type */}
            {isPaid && autopay && (
              <span className="flex items-center gap-1 font-medium" style={{ color: '#7c3aed', fontSize: '12px' }}>
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                Autopay · Reviewed{reviewedLabel ? ` ${reviewedLabel}` : ''}{dueLabel ? ` · drafts ~${dueLabel}` : ''}
              </span>
            )}
            {isPaid && !autopay && (
              <span className="flex items-center gap-1 font-medium" style={{ color: '#059669', fontSize: '12px' }}>
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                Paid{paidLabel ? ` · ${paidLabel}` : ''}
              </span>
            )}
            {company.paymentLink && !isPaid && !autopay && (
              <a href={company.paymentLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize: '12px' }}
                onClick={(e) => e.stopPropagation()}>
                {getDomain(company.paymentLink)}
                <ExternalLink style={{ width: '11px', height: '11px' }} />
              </a>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="font-bold text-slate-900 flex-shrink-0" style={{ fontSize: '15px', minWidth: '70px', textAlign: 'right' }}>
          {typeof company.amount === 'number' ? `$${company.amount.toFixed(2)}` : '—'}
        </div>

        {/* Action area */}
        <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth: '190px', justifyContent: 'flex-end' }}>
          {isPaid ? (
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: '#94a3b8', fontSize: '13px' }}>All set</span>
              <button
                onClick={handleUndoPaid}
                disabled={isMarking}
                className="font-medium text-slate-400 hover:text-slate-700 transition-colors underline"
                style={{ fontSize: '12px', textUnderlineOffset: '2px', opacity: isMarking ? 0.5 : 1 }}>
                {isMarking ? 'Undoing…' : 'Undo'}
              </button>
            </div>
          ) : autopay ? (
            // Autopay: the action is to REVIEW, not pay.
            <Button size="sm" className="font-semibold" style={{ background: '#7c3aed' }} disabled={isMarking} onClick={handleMarkReviewed}>
              {isMarking ? 'Saving…' : 'Mark Reviewed'}
            </Button>
          ) : awaitingConfirm ? (
            <>
              <Button variant="outline" size="sm" disabled={isMarking} onClick={() => setAwaitingConfirm(false)}>
                Not yet
              </Button>
              <Button size="sm" className="font-semibold" style={{ background: '#059669' }} disabled={isMarking} onClick={handleConfirmPaid}>
                {isMarking ? 'Saving…' : 'Yes, paid'}
              </Button>
            </>
          ) : (
            <Button size="sm" className="font-semibold" style={{ background: '#1e3a5f' }} onClick={handlePayClick}>
              {company.paymentLink ? 'Pay Bill' : 'Mark as Paid'}
            </Button>
          )}

          {/* Edit / delete (hover) */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm
            initialData={company}
            onSuccess={() => { setIsEditModalOpen(false); onRefresh(); }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {company.companyName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceCompanyCard;
