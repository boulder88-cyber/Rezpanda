import React, { useState, useRef } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

const DocumentUploadForm = ({ documentType, propertyId, onUploadSuccess }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill name if empty
      if (!fileName) {
        setFileName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast({ title: 'Error', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }
    if (!fileName.trim()) {
      toast({ title: 'Error', description: 'Please provide a document name.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('ownerId', currentUser.id);
      formData.append('documentType', documentType);
      formData.append('fileName', fileName);
      formData.append('file', file);
      formData.append('uploadDate', new Date().toISOString());

      await pb.collection('property_documents').create(formData, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Document uploaded successfully.' });
      clearFile();
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: 'Upload Failed', description: error.message || 'Failed to upload document.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-8 border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Upload New {documentType}</CardTitle>
        <CardDescription>Add a new document to this category.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          {!file ? (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">Click to browse or drag and drop</p>
              <p className="text-xs text-slate-500">Any file type up to 20MB</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={clearFile} className="text-slate-400 hover:text-red-500 shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {file && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="fileName">Document Name</Label>
                <Input 
                  id="fileName"
                  placeholder="e.g., 2024 Roof Warranty"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadForm;