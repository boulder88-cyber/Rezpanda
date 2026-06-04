import React, { useState, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { Upload, Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// UPLOAD A BILL — lets the user pick a photo or PDF of a bill.
// Sends it to the /casaceo/upload-test hook, which extracts the bill and
// saves it as pending_review. On success, calls onUploaded() so the
// "Bills to Review" section refreshes.
// ═══════════════════════════════════════════════════════════════════════

const UploadBillButton = ({ onUploaded }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChosen = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('bill', file);

      // pb.baseUrl is the PocketBase server address; the auth token is sent
      // so the hook knows who the owner is.
      const res = await fetch(pb.baseUrl + '/casaceo/upload-test', {
        method: 'POST',
        headers: { Authorization: pb.authStore.token },
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        toast({ title: '✅ Bill uploaded', description: 'We read it — check "Bills to Review" below to confirm.' });
        if (onUploaded) onUploaded();
      } else {
        toast({ title: 'Could not read that bill', description: (data && data.error) ? data.error : 'Please try a clearer photo.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      // reset so the same file can be picked again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChosen}
        style={{ display: 'none' }}
      />
      <button
        onClick={handlePick}
        disabled={uploading}
        className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
        style={{ background: '#e8604c', padding: '10px 20px', fontSize: '14px', opacity: uploading ? 0.7 : 1 }}>
        {uploading
          ? <><Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> Reading bill…</>
          : <><Upload style={{ width: '16px', height: '16px' }} /> Upload a Bill</>}
      </button>
    </>
  );
};

export default UploadBillButton;
