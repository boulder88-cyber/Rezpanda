import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Sparkles, Check, Calendar, Tag } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PENDING REVIEW SECTION
// Shows bills captured by email ingestion that are awaiting user confirmation
// (status === "pending_review"). Confirming flips status to "confirmed".
// Bills left unconfirmed simply remain here for "review later".
// ═══════════════════════════════════════════════════════════════════════

const PendingReviewSection = ({ onConfirmed }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

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

  // While loading the very first time, show nothing (avoids a flash).
  if (loading) return null;

  // No pending bills → render nothing at all.
  if (pending.length === 0) return null;

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
        We found these from your forwarded bills. Confirm to add them — or leave them here to review later.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pending.map(bill => (
          <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
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
            <button
              onClick={() => handleConfirm(bill)}
              disabled={confirmingId === bill.id}
              className="flex items-center justify-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl flex-shrink-0"
              style={{ background: '#1e3a5f', padding: '8px 18px', fontSize: '13px', opacity: confirmingId === bill.id ? 0.6 : 1 }}>
              <Check style={{ width: '15px', height: '15px' }} />
              {confirmingId === bill.id ? 'Confirming…' : 'Confirm'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingReviewSection;
