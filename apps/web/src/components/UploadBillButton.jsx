import React, { useState, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import { Upload, Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// UPLOAD A BILL (hybrid) — reads the file in the browser, sends:
//   • billBase64 : base64 of the file, for Claude to read
//   • billType   : media type (image/png, application/pdf, etc.)
//   • bill       : the original file, for storage in billFile
// On success, calls onUploaded() so "Bills to Review" refreshes.
// ═══════════════════════════════════════════════════════════════════════

const UploadBillButton = ({ onUploaded }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // read a File into a base64 string (no data: prefix)
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result || '';
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileChosen = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      let billType = file.type || 'image/jpeg';
      // normalize a couple of common cases
      if (file.name && file.name.toLowerCase().endsWith('.pdf')) billType = 'application/pdf';

      const formData = new FormData();
      formData.append('bill', file);          // original, for storage
      formData.append('billBase64', base64);  // for Claude
      formData.append('billType', billType);

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
