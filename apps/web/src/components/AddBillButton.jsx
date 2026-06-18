import React, { useState, useRef } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Plus, Upload, PencilLine, Mail, Loader2, ChevronDown, Copy, Check } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// ADD BILL — one button, methods underneath.
//
// A single navy "Add Bill" button opens a menu of capture methods:
//   • Upload a photo / PDF   → existing hybrid upload (Claude reads it)
//   • Enter manually         → opens the Add Bill form (onAddManual)
//   • Forward by email       → opens a helper dialog with the user's unique
//                              forwarding address + how-to steps
//
// The forwarding address is COMPUTED, not stored: the inbound-email hook
// attributes a forwarded bill to its owner by reading the "+<userId>" piece
// of the to-address (inbox+<userId>@bills.casaceo.com). So we just format the
// current user's id — no backend call, no stored field.
//
// The upload logic is lifted from the old UploadBillButton so ingestion
// behaves identically. onUploaded() refreshes "Bills to Review".
// onAddManual() opens the manual-entry modal the page already owns.
// ═══════════════════════════════════════════════════════════════════════

// Must match the to-address pattern the inbound-email hook parses.
const FORWARD_DOMAIN = 'bills.casaceo.com';
const buildForwardAddress = (userId) => userId ? `inbox+${userId}@${FORWARD_DOMAIN}` : '';

const AddBillButton = ({ onUploaded, onAddManual }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const forwardAddress = buildForwardAddress(currentUser?.id);

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

  const handleCopy = () => {
    if (!forwardAddress) return;
    try {
      navigator.clipboard.writeText(forwardAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: forwardAddress });
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

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer" onClick={() => setForwardOpen(true)}>
            <Mail className="w-4 h-4 mr-2 opacity-70" />
            <div className="flex flex-col">
              <span>Forward by email</span>
              <span className="text-xs opacity-70">Show me how — it's the easiest way</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Forward-by-email helper ── */}
      <Dialog open={forwardOpen} onOpenChange={setForwardOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Forward a bill by email</DialogTitle>
          </DialogHeader>

          <div style={{ paddingTop: '4px' }}>
            <p className="text-slate-500" style={{ fontSize: '14px', marginBottom: '14px' }}>
              The easiest way to add a bill: forward the email straight to your private CasaCEO address.
              We read it and drop it into <span className="font-medium text-slate-700">Bills to Review</span>.
            </p>

            {/* The address + copy */}
            <p className="font-semibold text-slate-600" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Your forwarding address
            </p>
            <div className="flex items-center gap-2" style={{ marginBottom: '20px' }}>
              <code className="flex-1 truncate" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#1e3a5f' }} title={forwardAddress}>
                {forwardAddress || 'Sign in to see your address'}
              </code>
              <button
                onClick={handleCopy}
                disabled={!forwardAddress}
                className="flex items-center gap-1 font-semibold text-white hover:opacity-90 transition-all rounded-lg flex-shrink-0"
                style={{ background: copied ? '#059669' : '#1e3a5f', padding: '10px 14px', fontSize: '13px', opacity: forwardAddress ? 1 : 0.5 }}>
                {copied
                  ? <><Check style={{ width: '14px', height: '14px' }} /> Copied</>
                  : <><Copy style={{ width: '14px', height: '14px' }} /> Copy</>}
              </button>
            </div>

            {/* Steps */}
            <p className="font-semibold text-slate-600" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              How to forward
            </p>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
              {[
                'Open the bill in your email app.',
                "Tap Forward (not Reply).",
                'Send it to the address above. That\u2019s it — the bill shows up here to review.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3" style={{ fontSize: '14px', color: '#334155' }}>
                  <span className="flex items-center justify-center flex-shrink-0 font-bold text-white" style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1e3a5f', fontSize: '12px' }}>
                    {i + 1}
                  </span>
                  <span style={{ paddingTop: '1px' }}>{step}</span>
                </li>
              ))}
            </ol>

            <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '16px', lineHeight: 1.5 }}>
              Tip: this address is just for you — bills you forward are linked to your account automatically.
              You can forward from any email account.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddBillButton;
