import React, { useState, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useToast } from '@/hooks/use-toast.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Plus, Upload, PencilLine, Mail, Loader2, ChevronDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// ADD BILL — one button, methods underneath.
//
// Replaces the old two-button row (Add Bill + Upload a Bill). A single navy
// "Add Bill" button opens a menu of capture methods:
//   • Upload a photo / PDF   → existing hybrid upload (Claude reads it)
//   • Enter manually         → opens the Add Bill form (onAddManual)
//   • Forward by email       → shows the user's forwarding address
//
// The upload logic is lifted verbatim from the old UploadBillButton so
// ingestion behaves identically. onUploaded() refreshes "Bills to Review".
// onAddManual() opens the manual-entry modal the page already owns.
// ═══════════════════════════════════════════════════════════════════════

const AddBillButton = ({ onUploaded, onAddManual, forwardingAddress }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      if (file.name && file.name.toLowerCase().endsWith('.pdf')) billType = 'application/pdf';
      const formData = new FormData();
      formData.append('bill', file);
      formData.append('billBase64', base64);
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

  const handleCopyForward = () => {
    if (!forwardingAddress) return;
    try {
      navigator.clipboard.writeText(forwardingAddress);
      toast({ title: 'Copied', description: 'Forwarding address copied to clipboard.' });
    } catch {
      toast({ title: forwardingAddress });
    }
  };

  return (
    <>
      {/* hidden file picker, triggered from the menu */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChosen}
        style={{ display: 'none' }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={uploading}
            className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-all rounded-xl"
            style={{ background: '#1e3a5f', padding: '10px 20px', fontSize: '14px', opacity: uploading ? 0.7 : 1 }}>
            {uploading
              ? <><Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> Reading bill…</>
              : <><Plus style={{ width: '16px', height: '16px' }} /> Add Bill <ChevronDown style={{ width: '14px', height: '14px', opacity: 0.7 }} /></>}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuLabel>How do you want to add it?</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}>
            <Upload className="w-4 h-4 mr-2 opacity-70" />
            <div className="flex flex-col">
              <span>Upload a photo or PDF</span>
              <span className="text-xs opacity-70">We read the details for you</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => { if (onAddManual) onAddManual(); }}>
            <PencilLine className="w-4 h-4 mr-2 opacity-70" />
            <div className="flex flex-col">
              <span>Enter manually</span>
              <span className="text-xs opacity-70">Type in the bill yourself</span>
            </div>
          </DropdownMenuItem>

          {forwardingAddress && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleCopyForward}>
                <Mail className="w-4 h-4 mr-2 opacity-70" />
                <div className="flex flex-col">
                  <span>Forward by email</span>
                  <span className="text-xs opacity-70">Tap to copy your forwarding address</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default AddBillButton;
