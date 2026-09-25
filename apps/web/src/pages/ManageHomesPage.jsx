import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { clearPropertyData, clearAccountData } from '@/lib/clearData.js';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import { Home, Plus, Pencil, Trash2, MapPin, BedDouble, Bath, Maximize, AlertTriangle } from 'lucide-react';
import PropertyFormModal from '@/components/PropertyFormModal.jsx';

// ═══════════════════════════════════════════════════════════════════════
// MANAGE HOMES
// A simple list of every home with edit + delete, plus an add button — all
// routed through the single PropertyFormModal. This is the home-management
// surface the app was missing (add was orphaned, edit didn't exist).
//
// Also home to two data-wipe actions, both self-service and both requiring
// the user to type a confirmation phrase before the button is even
// clickable — these are one-way. See lib/clearData.js for exactly what
// gets touched and what's deliberately left alone.
//   - "Clear data" per home: wipes that property's bills, payment history,
//     maintenance records, documents, and rental income/expenses. The home
//     itself stays — it comes back looking freshly added, empty.
//   - "Clear all my data" (Danger zone, bottom of page): wipes everything
//     above across every home, then removes every home too. Login stays —
//     this is a full reset, not an account deletion.
// ═══════════════════════════════════════════════════════════════════════

const ManageHomesPage = () => {
  const { homes, refreshHomes } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHome, setEditingHome] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Unified state for both clear flows: { type: 'property', home } or
  // { type: 'account' }. Each requires typing a specific phrase before its
  // confirm button enables.
  const [clearTarget, setClearTarget] = useState(null);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const openAdd = () => { setEditingHome(null); setIsModalOpen(true); };
  const openEdit = (home) => { setEditingHome(home); setIsModalOpen(true); };

  const handleSaved = async () => { await refreshHomes(); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await pb.collection('homes').delete(deleteTarget.id, { $autoCancel: false });
      toast({ title: 'Home removed', description: `${deleteTarget.name || deleteTarget.address || 'Home'} deleted.` });
      await refreshHomes();
    } catch (error) {
      toast({ title: 'Could not delete', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const CLEAR_PHRASE = { property: 'CLEAR', account: 'CLEAR ALL DATA' };
  const requiredPhrase = clearTarget ? CLEAR_PHRASE[clearTarget.type] : '';
  const closeClearDialog = () => { setClearTarget(null); setClearConfirmText(''); };

  const handleClearConfirmed = async () => {
    if (!clearTarget || !currentUser) return;
    setIsClearing(true);
    try {
      const isProperty = clearTarget.type === 'property';
      const result = isProperty
        ? await clearPropertyData(currentUser.id, clearTarget.home.id)
        : await clearAccountData(currentUser.id);

      if (result.allSucceeded) {
        toast(isProperty
          ? { title: 'Data cleared', description: `${clearTarget.home.name || clearTarget.home.address || 'This home'} is now empty — the home itself is still here.` }
          : { title: 'All data cleared', description: 'Every home and everything tied to it has been removed. Your login still works — add a home to start again.' });
      } else {
        // Be honest about a partial failure rather than showing a clean
        // success — some records didn't delete (see console for which).
        toast({
          title: 'Only partly cleared',
          description: `${result.totalFailed} record${result.totalFailed === 1 ? '' : 's'} couldn't be removed. The rest is gone. Try again, or contact support if it keeps happening.`,
          variant: 'destructive',
        });
      }
      await refreshHomes();
    } catch (error) {
      toast({ title: 'Could not clear data', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsClearing(false);
      closeClearDialog();
    }
  };

  const typeLabel = (t) => {
    if (t === 'home') return 'Home';
    if (t === 'vacation') return 'Vacation';
    if (t === 'rental') return 'Rental';
    return 'Property';
  };

  return (
    <>
      <Helmet><title>Manage homes — CasaCEO</title></Helmet>
      <div className="max-w-4xl mx-auto" style={{ padding: '8px 0 80px' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2f8' }}>
              <Home style={{ width: '22px', height: '22px', color: '#1e3a5f' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: 1.2 }}>Manage homes</h1>
              <p className="text-slate-500" style={{ fontSize: '13px', marginTop: '2px' }}>
                {homes.length} {homes.length === 1 ? 'home' : 'homes'}
              </p>
            </div>
          </div>
          <Button onClick={openAdd} className="text-white hover:opacity-90" style={{ background: '#1e3a5f' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add home
          </Button>
        </div>

        {/* Empty state */}
        {homes.length === 0 && (
          <div className="bg-white text-center" style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '48px 24px' }}>
            <Home style={{ width: '32px', height: '32px', color: '#95a0ae', margin: '0 auto 12px' }} />
            <p className="font-semibold text-slate-700" style={{ fontSize: '15px' }}>No homes yet</p>
            <p className="text-slate-400" style={{ fontSize: '13px', marginTop: '4px', marginBottom: '16px' }}>Add your first home to get started.</p>
            <Button onClick={openAdd} className="text-white hover:opacity-90" style={{ background: '#1e3a5f' }}>
              <Plus className="w-4 h-4 mr-2" />
              Add home
            </Button>
          </div>
        )}

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {homes.map((home) => (
            <div
              key={home.id}
              className="bg-white flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ borderRadius: '12px', border: '1px solid #e9e4db', padding: '16px 18px' }}
            >
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2f8' }}>
                <Home style={{ width: '18px', height: '18px', color: '#1e3a5f' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 truncate" style={{ fontSize: '15px' }}>
                    {home.name || home.address || 'Unnamed home'}
                  </p>
                  <span className="font-medium" style={{ fontSize: '11px', color: '#1e3a5f', background: '#eef2f8', borderRadius: '6px', padding: '1px 8px' }}>
                    {typeLabel(home.propertyType)}
                  </span>
                </div>
                {home.address && (
                  <p className="flex items-center gap-1 text-slate-500" style={{ fontSize: '12px', marginTop: '3px' }}>
                    <MapPin style={{ width: '12px', height: '12px' }} />
                    {home.address}
                  </p>
                )}
                <div className="flex items-center gap-4 text-slate-400" style={{ fontSize: '12px', marginTop: '4px' }}>
                  {home.bedrooms ? <span className="flex items-center gap-1"><BedDouble style={{ width: '12px', height: '12px' }} />{home.bedrooms}</span> : null}
                  {home.bathrooms ? <span className="flex items-center gap-1"><Bath style={{ width: '12px', height: '12px' }} />{home.bathrooms}</span> : null}
                  {home.squareFootage ? <span className="flex items-center gap-1"><Maximize style={{ width: '12px', height: '12px' }} />{Number(home.squareFootage).toLocaleString()} sqft</span> : null}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(home)}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-500 hover:text-red-600 hover:border-red-200"
                  onClick={() => { setClearTarget({ type: 'property', home }); setClearConfirmText(''); }}
                >
                  Clear data
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-600"
                  onClick={() => setDeleteTarget(home)}
                  title="Delete home"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Danger zone — full-account data wipe. Kept visually distinct and
            below everything else so it's found on purpose, not stumbled into. */}
        {homes.length > 0 && (
          <div style={{ marginTop: '40px', borderRadius: '12px', border: '1px solid #fecaca', background: '#fef2f2', padding: '20px' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div className="flex-1">
                <p className="font-semibold text-red-700" style={{ fontSize: '14px' }}>Danger zone</p>
                <p className="text-red-600" style={{ fontSize: '13px', marginTop: '2px', marginBottom: '12px' }}>
                  Permanently erase every bill, payment, maintenance record, document, and rental record across all of your homes. Your homes and your login stay — this clears their contents and removes the homes themselves, back to a blank account.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-100"
                  onClick={() => { setClearTarget({ type: 'account' }); setClearConfirmText(''); }}
                >
                  Clear all my data
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSaved}
        initialData={editingHome}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this home?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleteTarget?.name || deleteTarget?.address || 'this home'}. Bills and records tied to it won't be removed, but they'll no longer be linked to a home. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shared confirm dialog for both "Clear data" (one property) and
          "Clear all my data" (whole account) — same pattern, different
          copy and required phrase, so there's one place this logic lives. */}
      <AlertDialog open={Boolean(clearTarget)} onOpenChange={(open) => !open && closeClearDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clearTarget?.type === 'account'
                ? 'Clear all your data?'
                : `Clear ${clearTarget?.home?.name || clearTarget?.home?.address || 'this home'}'s data?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clearTarget?.type === 'account'
                ? 'This permanently deletes every bill, payment, maintenance record, document, and rental record across every home you have, then removes the homes themselves. Your login stays active. This can’t be undone.'
                : 'This permanently deletes every bill, payment, maintenance record, document, and rental record tied to this home. The home itself stays, ready to start fresh. This can’t be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div style={{ padding: '4px 0 8px' }}>
            <Label htmlFor="clear-confirm" className="text-slate-700">
              Type <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{requiredPhrase}</span> to confirm
            </Label>
            <Input
              id="clear-confirm"
              value={clearConfirmText}
              onChange={(e) => setClearConfirmText(e.target.value)}
              placeholder={requiredPhrase}
              className="mt-2 text-slate-900"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirmed}
              disabled={isClearing || clearConfirmText !== requiredPhrase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? 'Clearing…' : 'Clear data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageHomesPage;
