import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import DocumentTypeCard from '@/components/DocumentTypeCard.jsx';
import DocumentUploadForm from '@/components/DocumentUploadForm.jsx';
import DocumentTypeList from '@/components/DocumentTypeList.jsx';
import { 
  ShieldCheck, 
  FileSignature, 
  Receipt, 
  ScrollText, 
  Landmark, 
  Ruler, 
  FileText, 
  Shield, 
  FileMinus,
  ArrowLeft,
  FolderOpen
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { type: 'Warranties', icon: <ShieldCheck className="w-6 h-6" />, description: 'Appliance and system warranties' },
  { type: 'Closing Documents', icon: <FileSignature className="w-6 h-6" />, description: 'Final settlement and closing papers' },
  { type: 'Purchase Receipts', icon: <Receipt className="w-6 h-6" />, description: 'Receipts for major purchases and repairs' },
  { type: 'Deeds', icon: <ScrollText className="w-6 h-6" />, description: 'Property ownership deeds' },
  { type: 'Mortgages', icon: <Landmark className="w-6 h-6" />, description: 'Loan and mortgage agreements' },
  { type: 'Architectural Designs', icon: <Ruler className="w-6 h-6" />, description: 'Floor plans and blueprints' },
  { type: 'Tenant Contracts', icon: <FileText className="w-6 h-6" />, description: 'Lease agreements and addendums' },
  { type: 'Insurance Policies', icon: <Shield className="w-6 h-6" />, description: 'Homeowners and liability insurance' },
  { type: 'Lien Waivers', icon: <FileMinus className="w-6 h-6" />, description: 'Contractor lien waivers' }
];

const DocumentsPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDocumentType && selectedHome && currentUser) {
      fetchDocuments();
    }
  }, [selectedDocumentType, selectedHome, currentUser]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('property_documents').getList(1, 50, {
        filter: `documentType="${selectedDocumentType}" && ownerId="${currentUser.id}" && propertyId="${selectedHome.id}"`,
        sort: '-uploadDate',
        $autoCancel: false
      });
      setDocuments(records.items);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({ title: 'Error', description: 'Failed to load documents.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await pb.collection('property_documents').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Document deleted successfully.' });
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({ title: 'Error', description: 'Failed to delete document.', variant: 'destructive' });
    }
  };

  if (!selectedHome) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please select a property to view documents.
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Documents - CasaCEO</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Document Vault</h1>
              <p className="text-slate-500 text-sm mt-1">
                {selectedDocumentType 
                  ? `Managing ${selectedDocumentType}` 
                  : 'Select a category to view or upload documents'}
              </p>
            </div>
          </div>
          
          {selectedDocumentType && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedDocumentType(null)}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
            </Button>
          )}
        </div>

        {/* Main Content Area */}
        {!selectedDocumentType ? (
          /* View 1: Category Selection */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOCUMENT_TYPES.map((docType) => (
              <DocumentTypeCard
                key={docType.type}
                type={docType.type}
                icon={docType.icon}
                description={docType.description}
                isSelected={selectedDocumentType === docType.type}
                onClick={setSelectedDocumentType}
              />
            ))}
          </div>
        ) : (
          /* View 2: Upload & List for Selected Category */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DocumentUploadForm 
              documentType={selectedDocumentType}
              propertyId={selectedHome.id}
              onUploadSuccess={fetchDocuments}
            />
            
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
              </div>
            ) : (
              <DocumentTypeList 
                documentType={selectedDocumentType}
                documents={documents}
                onDelete={handleDeleteDocument}
              />
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default DocumentsPage;
