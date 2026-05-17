import React, { useState, useEffect } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Upload, FileText, Trash2, Download, Loader2, AlertCircle } from 'lucide-react';

const DOCUMENT_TYPES = [
  'Warranties',
  'Closing Documents',
  'Purchase Receipts',
  'Deeds',
  'Mortgages',
  'Architectural Designs',
  'Tenant Contracts',
  'Insurance Policies',
  'Lien Waivers'
];

const MAX_FILE_SIZE = 20971520; // 20MB

const PropertyDocuments = ({ propertyId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (propertyId) {
      fetchDocuments();
    }
  }, [propertyId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('property_documents').getFullList({
        filter: `propertyId = "${propertyId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setDocuments(records);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event, documentType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 20MB.',
        variant: 'destructive'
      });
      event.target.value = ''; // Reset input
      return;
    }

    try {
      setUploadingType(documentType);
      
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('documentType', documentType);
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('ownerId', pb.authStore.model.id);

      const record = await pb.collection('property_documents').create(formData, {
        $autoCancel: false
      });

      setDocuments(prev => [record, ...prev]);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully.'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document.',
        variant: 'destructive'
      });
    } finally {
      setUploadingType(null);
      event.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setDeletingId(docId);
      await pb.collection('property_documents').delete(docId, {
        $autoCancel: false
      });
      
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast({
        title: 'Deleted',
        description: 'Document has been removed.'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete document.',
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Property Documents</h2>
          <p className="text-slate-500">Manage all important files and records for this property.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCUMENT_TYPES.map((type) => {
          const typeDocs = documents.filter(doc => doc.documentType === type);
          const isUploading = uploadingType === type;

          return (
            <Card key={type} className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  {type}
                </CardTitle>
                <div>
                  <input
                    type="file"
                    id={`upload-${type.replace(/\s+/g, '-')}`}
                    className="hidden"
                    onChange={(e) => handleUpload(e, type)}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => document.getElementById(`upload-${type.replace(/\s+/g, '-')}`).click()}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                {typeDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No documents uploaded yet</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {typeDocs.map(doc => (
                      <li key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-white rounded shadow-sm shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-900 truncate" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(doc.created).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <a
                            href={pb.files.getUrl(doc, doc.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyDocuments;