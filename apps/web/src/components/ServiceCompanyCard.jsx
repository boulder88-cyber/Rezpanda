import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ExternalLink, Edit2, Trash2, Building, CheckCircle2, Repeat, Plus, Search, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import AddServiceCompanyForm from './AddServiceCompanyForm.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

// Consumer / ISP mail domains. A bill FORWARDED from one of these has a "from"
// that is the user's own inbox, not the biller — so guessing a payment URL from
// it would be wrong. Suppress the "Use [domain]" chip for these. Keep in sync
// with CONSUMER_MAIL_DOMAINS in api/inbound-email.js (the ingestion function).
const CONSUMER_MAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'icloud.com', 'outlook.com', 'hotmail.com',
  'aol.com', 'me.com', 'proton.me', 'protonmail.com', 'live.com', 'msn.com',
  'comcast.net', 'comcast.com', 'xfinity.com', 'att.net', 'verizon.net',
  'sbcglobal.net', 'cox.net', 'charter.net', 'bellsouth.net', 'earthlink.net',
];

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
  // Guard 3 (double-pay): holds an already-paid bill from the same payee in the
  // same month, if found. When set, we interrupt the confirm with a warning
  // instead of marking paid. null = no conflict / not yet checked.
  const [dupePaid, setDupePaid] = useState(null);
  // Quick add-payment-link (for emailed bills that arrived without a URL).
  const [addingLink, setAddingLink] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  // ── Payment-link finder helpers ──────────────────────────────────────
  // A bill that arrived DIRECT from a utility carries the biller's own
  // address (e.g. billing@xfinity.com). That domain IS effectively the
  // biller's website, so we can offer it as a one-tap starting guess — no
  // directory, no payee normalization. Prefer the invoice's own
  // senderAddress; fall back to the vendor's senderDomain if flattened on.
  const domainFromEmail = (addr) => {
    if (!addr || typeof addr !== 'string') return '';
    const at = addr.lastIndexOf('@');
    const raw = (at >= 0 ? addr.slice(at + 1) : addr).trim().toLowerCase();
    // Skip consumer mail domains — a forwarded bill's "from" is the user's
    // own inbox, not the biller, so guessing from it would be wrong.
    if (!raw || raw.indexOf('.') === -1 || CONSUMER_MAIL_DOMAINS.includes(raw)) return '';
    return raw;
  };

  const guessedDomain = domainFromEmail(company.senderAddress) || (company.senderDomain || '');
  const guessedUrl = guessedDomain ? `https://${guessedDomain}` : '';

  // "Search the web" — opens a pre-filled query so the user doesn't have to
  // think about what to type. They click the right result, copy its URL,
  // paste it back. Pure convenience; no data leaves to anyone but Google.
  const webSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${company.companyName || ''} pay bill online`.trim())}`;

  const useGuess = () => {
    if (guessedUrl) setLinkValue(guessedUrl);
  };

  const handleSaveLink = async () => {
    let url = linkValue.trim();
    if (!url) { setAddingLink(false); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    try {
      new URL(url); // basic validation; bail quietly if malformed
    } catch {
      toast({ title: 'That doesn\u2019t look like a valid link', variant: 'destructive' });
      return;
    }
    setSavingLink(true);
    try {
      // The pay URL belongs to the VENDOR (stable "how you pay this biller"),
      // not to this month's invoice. Write it to the linked vendor if there is
      // one; if the bill has no vendor yet, fall back to nothing (rare — the
      // ingestion path creates a vendor for every emailed bill).
      if (company.vendorId) {
        await pb.collection('vendors').update(company.vendorId, { payUrl: url }, { $autoCancel: false });
      }
      setAddingLink(false);
      setLinkValue('');
      toast({ title: 'Payment link added' });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not save the link', variant: 'destructive' });
    } finally {
      setSavingLink(false);
    }
  };
  const [isCheckingDupe, setIsCheckingDupe] = useState(false);

  const isPaid = company.status === 'paid';
  const autopay = isAutopay(company);

  // Backfill: assign this bill to a property (for bills missing homeId).
  // placement legacy fallback (mirror of BillPayPage.placementOf): bills with
  // no placement field are inferred from homeId so old data behaves as before.
  const placement = company.placement || (company.homeId ? 'property' : 'unassigned');

  const handleAssignHome = async (value) => {
    if (!value) return;
    setIsAssigning(true);
    try {
      // "Other bills" is a real destination, not a property: empty homeId,
      // placement 'other' (settled — stops the nag). A real id places it.
      const patch = value === '__other__'
        ? { homeId: '', placement: 'other' }
        : { homeId: value, placement: 'property' };
      await pb.collection('invoices').update(company.id, patch, { $autoCancel: false });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not place this bill', variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await pb.collection('invoices').delete(company.id, { $autoCancel: false });
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

  // ── Guard 3: double-pay lookup ──────────────────────────────────────────
  // Has this user ALREADY marked a bill from this same payee paid within the
  // same calendar month? That's the signature of a double-pay: the same-day
  // "I forgot I paid this" and the autopay-plus-manual weeks apart both land in
  // one month. Keying on month (not day) catches the far-apart case; keying on
  // payee+month (not across months) means next month's real bill never trips it.
  // CasaCEO can't stop a payment (the user pays on the vendor site) — but it's
  // the only place that KNOWS the bill was already handled, so it warns here.
  const findSamePayeePaidThisMonth = async () => {
    const name = company.companyName;
    if (!name) return null;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    const esc = String(name).replace(/"/g, '\\"');
    // Same owner, same payee, already paid, paidDate within this calendar month,
    // and not this very bill. autoCancel off so a rapid click can't abort it.
    const filter =
      `ownerId = "${company.ownerId}"` +
      ` && companyName = "${esc}"` +
      ` && status = "paid"` +
      ` && id != "${company.id}"` +
      ` && paidDate >= "${monthStart}"` +
      ` && paidDate < "${nextMonthStart}"`;
    try {
      const list = await pb.collection('invoices').getList(1, 1, {
        filter,
        sort: '-paidDate',
        $autoCancel: false,
      });
      return (list.items && list.items[0]) || null;
    } catch {
      return null; // fail open: a lookup error never blocks a legitimate payment
    }
  };

  // Manual step 1: open utility site (if any), then ask "did you pay?".
  const handlePayClick = () => {
    if (company.paymentLink) {
      window.open(company.paymentLink, '_blank', 'noopener,noreferrer');
    }
    setAwaitingConfirm(true);
  };

  // Gate: user clicked "Yes, paid". Before flipping to paid, run the double-pay
  // check. If a same-payee, same-month paid bill exists, surface the warning
  // and STOP — the user decides. Otherwise proceed straight to marking paid.
  const handleConfirmPaidClick = async () => {
    setIsCheckingDupe(true);
    try {
      const prior = await findSamePayeePaidThisMonth();
      if (prior) {
        setDupePaid(prior);
        return; // hold — the interrupt UI now drives the decision
      }
      await markPaid();
    } finally {
      setIsCheckingDupe(false);
    }
  };

  // Manual step 2: the actual write -> status:paid + paidDate, log payment.
  // Reached either with no conflict, or via the user explicitly confirming
  // "yes, this is a different bill" past the double-pay warning.
  const markPaid = async () => {
    setIsMarking(true);
    try {
      await pb.collection('invoices').update(
        company.id,
        { status: 'paid', paidDate: new Date().toISOString() },
        { $autoCancel: false }
      );
      if (onPay) await onPay(company);
      setAwaitingConfirm(false);
      setDupePaid(null);
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
      await pb.collection('invoices').update(
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
      await pb.collection('invoices').update(
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
            {placement === 'unassigned' && homes && homes.length > 1 && (
              <select
                value=""
                disabled={isAssigning}
                onChange={(e) => handleAssignHome(e.target.value)}
                title="This bill isn't placed yet"
                style={{ fontSize: '11px', color: '#b45309', fontWeight: 500, border: '1px solid #f59e0b', borderRadius: '6px', padding: '1px 6px', background: '#fffbeb' }}
              >
                <option value="">Needs placement · choose</option>
                <optgroup label="Properties">
                  {homes.map(h => (
                    <option key={h.id} value={h.id}>{h.name || h.address || 'Property'}</option>
                  ))}
                </optgroup>
                <optgroup label="Not a property bill">
                  <option value="__other__">Other bills</option>
                </optgroup>
              </select>
            )}
            {placement === 'other' && (
              <span className="font-medium" style={{ fontSize: '11px', color: '#5b6472', background: '#f1f5f9', borderRadius: '6px', padding: '1px 8px' }}>
                Other bills
              </span>
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
            {!company.paymentLink && !isPaid && !autopay && !addingLink && (
              <button
                onClick={(e) => { e.stopPropagation(); setAddingLink(true); }}
                className="flex items-center gap-1 transition-colors"
                style={{ fontSize: '12px', color: '#1e3a5f' }}>
                <Plus style={{ width: '11px', height: '11px' }} /> Add payment link
              </button>
            )}
            {!company.paymentLink && !isPaid && !autopay && addingLink && (
              <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()} style={{ minWidth: '240px' }}>
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLink(); if (e.key === 'Escape') { setAddingLink(false); setLinkValue(''); } }}
                    placeholder="paste the utility's pay URL"
                    className="rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                    style={{ fontSize: '12px', padding: '4px 8px', width: '180px' }}
                  />
                  <button onClick={handleSaveLink} disabled={savingLink}
                    className="rounded-lg font-medium text-white" style={{ fontSize: '12px', padding: '4px 10px', background: '#1e3a5f' }}>
                    {savingLink ? '…' : 'Save'}
                  </button>
                  <button onClick={() => { setAddingLink(false); setLinkValue(''); }}
                    className="text-slate-400 hover:text-slate-600" style={{ fontSize: '12px', padding: '4px 6px' }}>
                    Cancel
                  </button>
                </div>

                {/* Finder helpers: a smart guess (if the bill came direct from the
                    biller) + a pre-filled web search. Both reduce the "what do I
                    even paste" friction without a maintained directory. */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ paddingLeft: '2px' }}>
                  {guessedUrl && (
                    <button
                      onClick={useGuess}
                      className="flex items-center gap-1 font-medium hover:underline"
                      style={{ fontSize: '11px', color: '#c9a96e' }}
                      title={`Use ${guessedDomain}`}
                    >
                      <Sparkles style={{ width: '11px', height: '11px' }} />
                      Use {guessedDomain}
                    </button>
                  )}
                  <a
                    href={webSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                    style={{ fontSize: '11px', color: '#5b6472' }}
                  >
                    <Search style={{ width: '11px', height: '11px' }} />
                    Search the web for it
                  </a>
                </div>
              </div>
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
              <Button variant="outline" size="sm" disabled={isMarking || isCheckingDupe} onClick={() => { setAwaitingConfirm(false); setDupePaid(null); }}>
                Not yet
              </Button>
              <Button size="sm" className="font-semibold" style={{ background: '#059669' }} disabled={isMarking || isCheckingDupe} onClick={handleConfirmPaidClick}>
                {isCheckingDupe ? 'Checking…' : isMarking ? 'Saving…' : 'Yes, paid'}
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

      {/* Guard 3: double-pay warning. Same payee already marked paid this month. */}
      <AlertDialog open={Boolean(dupePaid)} onOpenChange={(open) => !open && setDupePaid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You may have already paid this</AlertDialogTitle>
            <AlertDialogDescription>
              {company.companyName} was already marked paid
              {dupePaid?.paidDate ? ` on ${fmt(dupePaid.paidDate)}` : ' earlier this month'}
              {typeof dupePaid?.amount === 'number' ? ` ($${dupePaid.amount.toFixed(2)})` : ''}.
              {' '}If this is the same bill, don't pay it again. Only continue if this is a separate, different bill from {company.companyName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={markPaid} disabled={isMarking} style={{ background: '#059669' }} className="hover:opacity-90">
              {isMarking ? 'Saving…' : 'Yes, different bill — mark paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
