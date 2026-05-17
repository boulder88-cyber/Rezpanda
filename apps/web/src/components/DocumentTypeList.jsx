import React, { useState, useEffect, useRef } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Download, Trash2, FileText, Plus, UploadCloud, Calendar, X } from 'lucide-react';

const DOCUMENT_TYPES = ['lease', 'inspection', 'contract', 'receipt', 'other'];

const DocumentTypeList = ({ propertyId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser, propertyId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let filterStr = `ownerId="${currentUser.id}"`;
      if (propertyId) {
        filterStr += ` && propertyId="${propertyId}"`;
      }
      
      const records = await pb.collection('documents').getFullList({
        filter: filterStr,
        sort: '-uploadDate',
        $autoCancel: false
      });
      setDocuments(records);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({ title: 'Error', description: 'Failed to load documents.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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

  const resetForm = () => {
    clearFile();
    setDocumentType('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!propertyId) {
      toast({ title: 'Error', description: 'Property ID is required to upload a document.', variant: 'destructive' });
      return;
    }
    if (!file || !fileName || !documentType) {
      toast({ title: 'Error', description: 'Please fill all required fields and select a file.', variant: 'destructive' });
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

      await pb.collection('documents').create(formData, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Document uploaded successfully.' });
      setUploadModalOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: 'Upload Failed', description: error.message || 'Failed to upload document.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await pb.collection('documents').delete(id, { $autoCancel: false });
        toast({ title: 'Success', description: 'Document deleted successfully.' });
        fetchDocuments();
      } catch (error) {
        console.error("Delete error:", error);
        toast({ title: 'Error', description: 'Failed to delete document.', variant: 'destructive' });
      }
    }
  };

  const handleDownload = (doc) => {
    try {
      const url = pb.files.getUrl(doc, doc.file);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Download error:", error);
      toast({ title: 'Error', description: 'Could not generate download link.', variant: 'destructive' });
    }
  };

  // Group documents by type
  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.documentType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Property Documents</h2>
          <p className="text-slate-500 text-sm">Manage all files and records for this property.</p>
        </div>
        
        <Dialog open={uploadModalOpen} onOpenChange={(open) => {
          setUploadModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              
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
                      <FileText className="w-5 h-5 text-primary" />
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

              <div className="space-y-2">
                <Label htmlFor="fileName">Document Name</Label>
                <Input 
                  id="fileName"
                  placeholder="e.g., Signed Lease Agreement 2024"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !file || !propertyId}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              
              {!propertyId && (
                <p className="text-xs text-red-500 text-center mt-2">
                  A property must be selected to upload documents.
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No documents found</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              You haven't uploaded any documents for this property yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {DOCUMENT_TYPES.map(type => {
            const typeDocs = groupedDocuments[type];
            if (!typeDocs || typeDocs.length === 0) return null;

            return (
              <div key={type} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 capitalize border-b pb-2">
                  {type} Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeDocs.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
                      <CardContent className="p-0">
                        <div className="p-5 flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-900 truncate" title={doc.fileName}>
                              {doc.fileName}
                            </h4>
                            <div className="flex items-center text-xs text-slate-500 mt-1.5">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(doc.uploadDate || doc.created).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8 bg-white"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentTypeList;