import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import DocumentUpload from '@/components/DocumentUpload.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Plus, Download, Trash2, FileText } from 'lucide-react';

const DocumentsList = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [documentsData, propertiesData] = await Promise.all([
        pb.collection('documents').getFullList({ sort: '-uploadDate', $autoCancel: false }),
        pb.collection('properties').getFullList({ $autoCancel: false }),
      ]);
      setDocuments(documentsData);
      setProperties(propertiesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await pb.collection('documents').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Document deleted successfully' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (document) => {
    const url = pb.files.getUrl(document, document.file);
    window.open(url, '_blank');
  };

  const handleUploadSuccess = () => {
    setDialogOpen(false);
    loadData();
  };

  const getPropertyAddress = (propertyId) => {
    const property = properties.find((p) => p.id === propertyId);
    return property ? property.address : 'Unknown';
  };

  return (
    <>
      <Helmet>
        <title>Documents - PropManager</title>
        <meta name="description" content="Manage property documents" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
                <p className="text-slate-600 mt-1">Manage property-related documents</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                  </DialogHeader>
                  <DocumentUpload onSuccess={handleUploadSuccess} onCancel={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : documents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No documents yet. Upload your first document to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((document) => (
                  <Card key={document.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate mb-1">{document.fileName}</h3>
                          <p className="text-sm text-slate-600 mb-1">{getPropertyAddress(document.propertyId)}</p>
                          <p className="text-xs text-slate-500 capitalize mb-3">{document.documentType}</p>
                          <p className="text-xs text-slate-500">
                            Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(document)}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(document.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentsList;