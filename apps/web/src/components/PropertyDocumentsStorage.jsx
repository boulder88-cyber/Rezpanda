import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { FileText, UploadCloud, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const PropertyDocumentsStorage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('property_documents').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setDocuments(records.items);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [currentUser]);

  const handleAction = (action) => {
    toast({ title: action, description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Document Storage</h3>
        <Button onClick={() => handleAction('Upload Document')}>
          <UploadCloud className="w-4 h-4 mr-2" /> Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : documents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents uploaded yet.</p>
          </div>
        ) : (
          documents.map(doc => (
            <Card key={doc.id} className="hover:border-primary/50 transition-colors group">
              <CardContent className="p-4 flex flex-col items-center text-center h-full">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{doc.fileName}</h4>
                <p className="text-xs text-slate-500 mb-4">{doc.documentType || 'Document'}</p>
                
                <div className="mt-auto flex gap-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleAction('Download')}>
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleAction('Delete')}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyDocumentsStorage;