import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ExternalLink, Edit2, Trash2, Building, DollarSign, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import AddServiceCompanyForm from './AddServiceCompanyForm.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';

// ═══════════════════════════════════════════════════════════════════════
// SERVICE COMPANY CARD
//
// Pay lifecycle (no DB schema change required):
//   1. "Pay Bill" opens the utility's site in a NEW TAB. CasaCEO stays put.
//      The card then shifts into a "Did you pay?" confirm state.
//   2. "Yes, mark it paid" logs the payment (via onPay → payment_history)
//      and greys the card in place with a checkmark.
//   3. "Not yet" returns the card to normal.
//
// "Paid" is derived from a logged payment, NOT a status field — so this
// works without editing the service_companies collection. The parent passes
// `isPaid` (computed from payment_history) and `paidDate` for display.
// ═══════════════════════════════════════════════════════════════════════

const ServiceCompanyCard = ({ company, onRefresh, onPay, isPaid = false, paidDate = null }) => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local "did you pay?" confirm state (after the user clicks Pay Bill).
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await pb.collection('service_companies').delete(company.id, { $autoCancel: false });
      toast({ title: "Company removed successfully." });
      onRefresh();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({ title: "Failed to delete company", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Step 1: open the utility site in a new tab, then ask "did you pay?".
  const handlePayClick = () => {
    if (company.paymentLink) {
      window.open(company.paymentLink, '_blank', 'noopener,noreferrer');
    }
    setAwaitingConfirm(true);
  };

  // Step 2: confirm payment → log it (parent writes payment_history) → grey out.
  const handleConfirmPaid = async () => {
    setIsMarking(true);
    try {
      await onPay(company);        // existing handler: logs to payment_history
      setAwaitingConfirm(false);
      if (onRefresh) onRefresh();  // re-pull so isPaid recomputes from history
    } finally {
      setIsMarking(false);
    }
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  const paidLabel = paidDate
    ? new Date(paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <>
      <Card
        className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex flex-col h-full"
        style={{ opacity: isPaid ? 0.6 : 1 }}
      >
        <CardContent className="p-6 flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-1" title={company.companyName}>
            {company.companyName}
          </h3>

          {company.paymentLink && (
            <a
              href={company.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-1 mb-4 line-clamp-1"
              onClick={(e) => e.stopPropagation()}
            >
              {getDomain(company.paymentLink)}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {company.amount && (
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-3 py-1 rounded-full text-sm">
              <DollarSign className="w-4 h-4 text-slate-500" />
              {company.amount.toFixed(2)}
            </div>
          )}

          {/* Paid badge (shown once a payment is on record) */}
          {isPaid && (
            <div className="flex items-center gap-1 font-semibold mt-3" style={{ color: '#059669', fontSize: '13px' }}>
              <CheckCircle2 className="w-4 h-4" />
              Paid{paidLabel ? ` · ${paidLabel}` : ''}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 mt-auto">
          {isPaid ? (
            // Already paid → no action button, just the greyed card above.
            <div className="w-full text-center font-medium" style={{ color: '#94a3b8', fontSize: '13px', padding: '8px 0' }}>
              Cleared
            </div>
          ) : awaitingConfirm ? (
            // "Did you pay?" confirm step.
            <div className="w-full">
              <p className="text-center text-slate-600 dark:text-slate-300 font-medium" style={{ fontSize: '13px', marginBottom: '8px' }}>
                Did you finish paying?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isMarking}
                  onClick={() => setAwaitingConfirm(false)}
                >
                  Not yet
                </Button>
                <Button
                  className="flex-1 font-semibold"
                  style={{ background: '#059669' }}
                  disabled={isMarking}
                  onClick={handleConfirmPaid}
                >
                  {isMarking ? 'Saving…' : 'Yes, mark paid'}
                </Button>
              </div>
            </div>
          ) : (
            // Default: Pay Bill (opens utility site, then asks did-you-pay).
            <Button
              className="w-full font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              onClick={handlePayClick}
            >
              {company.paymentLink ? 'Pay Bill' : 'Mark as Paid'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Service Company</DialogTitle>
          </DialogHeader>
          <AddServiceCompanyForm
            initialData={company}
            onSuccess={() => {
              setIsEditModalOpen(false);
              onRefresh();
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Service Company?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {company.companyName} from your dashboard. This action cannot be undone.
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
