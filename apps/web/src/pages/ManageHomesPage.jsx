import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHome } from '@/contexts/HomeContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import { Home, Plus, Pencil, Trash2, MapPin, BedDouble, Bath, Maximize } from 'lucide-react';
import PropertyFormModal from '@/components/PropertyFormModal.jsx';

// ═══════════════════════════════════════════════════════════════════════
// MANAGE HOMES
// A simple list of every home with edit + delete, plus an add button — all
// routed through the single PropertyFormModal. This is the home-management
// surface the app was missing (add was orphaned, edit didn't exist).
// ═══════════════════════════════════════════════════════════════════════

const ManageHomesPage = () => {
  const { homes, refreshHomes } = useHome();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHome, setEditingHome] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    </>
  );
};

export default ManageHomesPage;
