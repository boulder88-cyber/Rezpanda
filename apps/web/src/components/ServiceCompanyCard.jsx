import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ExternalLink, Edit2, Trash2, Building, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import AddServiceCompanyForm from './AddServiceCompanyForm.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

// ═══════════════════════════════════════════════════════════════════════
// SERVICE COMPANY ROW
//
// A single bill rendered as a consistent LIST ROW (not a card). Status-driven:
//   • status "confirmed" (and not paid) = Ready to Pay -> shows Pay Bill / Mark Paid
//   • status "paid"                      = greyed history row with Paid . date
//
// Marking paid writes status:'paid' + paidDate to the bill itself, AND logs to
// payment_history (via onPay) so the History tab stays populated.
// ═══════════════════════════════════════════════════════════════════════

const ServiceCompanyCard = ({ company, onRefresh, onPay }) => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const isPaid = company.status === 'paid';

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

  // Step 1: open utility site (if we have a link), then ask "did you pay?".
  const handlePayClick = () => {
    if (company.paymentLink) {
      window.open(company.paymentLink, '_blank', 'noopener,noreferrer');
    }
    setAwaitingConfirm(true);
  };

  // Step 2: confirm -> stamp status:'paid' + paidDate on the bill, log payment.
  const handleConfirmPaid = async () => {
    setIsMarking(true);
    try {
      await pb.collection('service_companies').update(
        company.id,
        { status: 'paid', paidDate: new Date().toISOString() },
        { $autoCancel: false }
      );
      if (onPay) await onPay(company);   // keep payment_history populated
      setAwaitingConfirm(false);
      toast({ title: '✅ Marked paid', description: `${company.companyName} cleared.` });
      if (onRefresh) onRefresh();
    } catch {
      toast({ title: 'Could not mark paid', variant: 'destructive' });
    } finally {
      setIsMarking(false);
    }
  };

  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch (e) { return url; }
  };

  const paidLabel = company.paidDate
    ? new Date(company.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const dueLabel = company.dueDate
    ? new Date(company.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 group"
        style={{
          background: isPaid ? '#f8fafc' : '#fff',
          border: '1px solid #e2e8f0',
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
            {company.category && (
              <span className="text-slate-400" style={{ fontSize: '12px' }}>{company.category}</span>
            )}
            {dueLabel && !isPaid && (
              <span className="text-slate-500" style={{ fontSize: '12px' }}>Due {dueLabel}</span>
            )}
            {isPaid && paidLabel && (
              <span className="flex items-center gap-1 font-medium" style={{ color: '#059669', fontSize: '12px' }}>
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                Paid . {paidLabel}
              </span>
            )}
            {company.paymentLink && !isPaid && (
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
        <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth: '180px', justifyContent: 'flex-end' }}>
          {isPaid ? (
            <span className="font-medium" style={{ color: '#94a3b8', fontSize: '13px' }}>Cleared</span>
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
