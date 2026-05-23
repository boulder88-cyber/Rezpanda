import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import DocumentUploadForm from '@/components/DocumentUploadForm.jsx';
import DocumentTypeList from '@/components/DocumentTypeList.jsx';
import {
  ShieldCheck, FileSignature, Receipt, ScrollText,
  Landmark, Ruler, FileText, Shield, FileMinus,
  ArrowLeft, FolderOpen, Search, AlertCircle,
  Clock, CheckCircle2, Upload, Filter, Grid,
  List, X, ChevronRight, Lock
} from 'lucide-react';

// ─── Document Categories ──────────────────────────────────────────────
const DOCUMENT_TYPES = [
  {
    type: 'Warranties',
    icon: ShieldCheck,
    description: 'Appliance and system warranties',
    iconColor: '#1e3a5f', iconBg: '#eef2f8',
    hasExpiry: true,
    tip: 'Track expiry dates to know when warranties run out'
  },
  {
    type: 'Insurance Policies',
    icon: Shield,
    description: 'Homeowners and liability insurance',
    iconColor: '#e8604c', iconBg: '#fdf0ee',
    hasExpiry: true,
    tip: 'Never let a policy expire without knowing'
  },
  {
    type: 'Closing Documents',
    icon: FileSignature,
    description: 'Final settlement and closing papers',
    iconColor: '#7c3aed', iconBg: '#f5f3ff',
    hasExpiry: false,
    tip: 'Keep your closing docs safe and accessible'
  },
  {
    type: 'Deeds',
    icon: ScrollText,
    description: 'Property ownership deeds',
    iconColor: '#d97706', iconBg: '#fffbeb',
    hasExpiry: false,
    tip: 'Your most important ownership documents'
  },
  {
    type: 'Mortgages',
    icon: Landmark,
    description: 'Loan and mortgage agreements',
    iconColor: '#2563eb', iconBg: '#eff6ff',
    hasExpiry: false,
    tip: 'All loan documents in one place'
  },
  {
    type: 'Purchase Receipts',
    icon: Receipt,
    description: 'Receipts for major purchases and repairs',
    iconColor: '#059669', iconBg: '#ecfdf5',
    hasExpiry: false,
    tip: 'Keep receipts for tax deductions and warranties'
  },
  {
    type: 'Tenant Contracts',
    icon: FileText,
    description: 'Lease agreements and addendums',
    iconColor: '#0891b2', iconBg: '#ecfeff',
    hasExpiry: true,
    tip: 'Track lease start and end dates'
  },
  {
    type: 'Architectural Designs',
    icon: Ruler,
    description: 'Floor plans and blueprints',
    iconColor: '#db2777', iconBg: '#fdf2f8',
    hasExpiry: false,
    tip: 'Store plans for renovations and permits'
  },
  {
    type: 'Lien Waivers',
    icon: FileMinus,
    description: 'Contractor lien waivers',
    iconColor: '#64748b', iconBg: '#f8fafc',
    hasExpiry: false,
    tip: 'Protect yourself from contractor liens'
  },
];

// ─── Category Card ────────────────────────────────────────────────────
const CategoryCard = ({ docType, count, expiringCount, onClick }) => {
  const Icon = docType.icon;

  return (
    <button
      onClick={() => onClick(docType.type)}
      className="bg-white rounded-2xl border border-slate-100 p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group w-full shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: docType.iconBg }}>
          <Icon className="w-6 h-6" style={{ color: docType.iconColor }} />
        </div>
        <div className="flex items-center gap-2">
          {expiringCount > 0 && (
            <span className="flex items-center gap-1 bg-red-50 text-red-500 text-xs font-bold px-2 py-1 rounded-full border border-red-100">
              <AlertCircle className="w-3 h-3" />
              {expiringCount} expiring
            </span>
          )}
          {count > 0 && (
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-base mb-1">{docType.type}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-3">{docType.description}</p>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-300 italic">{docType.tip}</p>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      {count === 0 && (
        <div className="mt-3 pt-3 border-t border-dashed border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
          <Upload className="w-3.5 h-3.5" />
          Click to add your first document
        </div>
      )}
    </button>
  );
};

// ─── Expiry Alert Banner ──────────────────────────────────────────────
const ExpiryAlerts = ({ documents }) => {
  const today = new Date();
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const expiring = documents.filter(d => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    return exp <= in60Days && exp >= today;
  });

  const expired = documents.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < today;
  });

  if (expiring.length === 0 && expired.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {expired.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">
              {expired.length} document{expired.length > 1 ? 's' : ''} expired
            </p>
            <p className="text-red-500 text-xs mt-0.5">
              {expired.map(d => d.documentName || d.documentType).join(', ')}
            </p>
          </div>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-700 text-sm">
              {expiring.length} document{expiring.length > 1 ? 's' : ''} expiring soon
            </p>
            <p className="text-amber-500 text-xs mt-0.5">
              {expiring.map(d => d.documentName || d.documentType).join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Vault Stats ──────────────────────────────────────────────────────
const VaultStats = ({ documents, categories }) => {
  const totalDocs = documents.length;
  const withExpiry = documents.filter(d => d.expiryDate).length;
  const categoriesUsed = new Set(documents.map(d => d.documentType)).size;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Total Documents', value: totalDocs, icon: <FolderOpen className="w-5 h-5" />, iconColor: '#1e3a5f', bg: '#eef2f8', border: '#c7d5e8' },
        { label: 'Categories Used', value: `${categoriesUsed}/${categories.length}`, icon: <Grid className="w-5 h-5" />, iconColor: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
        { label: 'With Expiry Dates', value: withExpiry, icon: <Clock className="w-5 h-5" />, iconColor: '#d97706', bg: '#fffbeb', border: '#fde68a' },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl border p-4 flex flex-col items-center text-center shadow-sm" style={{ borderColor: stat.border }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: stat.bg, color: stat.iconColor }}>
            {stat.icon}
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const DocumentsPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedHome && currentUser) {
      fetchAllDocuments();
    }
  }, [selectedHome, currentUser]);

  useEffect(() => {
    if (selectedDocumentType && selectedHome && currentUser) {
      fetchDocuments();
    }
  }, [selectedDocumentType, selectedHome, currentUser]);

  const fetchAllDocuments = async () => {
    try {
      const records = await pb.collection('property_documents').getFullList({
        filter: `ownerId="${currentUser.id}" && propertyId="${selectedHome.id}"`,
        sort: '-uploadDate',
        $autoCancel: false
      });
      setAllDocuments(records);
    } catch (error) {
      console.error('Failed to fetch all documents:', error);
    }
  };

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
      toast({ title: 'Error', description: 'Failed to load documents.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await pb.collection('property_documents').delete(id, { $autoCancel: false });
      toast({ title: '✅ Document deleted' });
      fetchDocuments();
      fetchAllDocuments();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete document.', variant: 'destructive' });
    }
  };

  const getCountForType = (type) => allDocuments.filter(d => d.documentType === type).length;
  const getExpiringForType = (type) => {
    const today = new Date();
    const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    return allDocuments.filter(d =>
      d.documentType === type &&
      d.expiryDate &&
      new Date(d.expiryDate) <= in60Days
    ).length;
  };

  const filteredCategories = DOCUMENT_TYPES.filter(dt =>
    dt.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedHome) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">Please select a property to view documents.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Document Vault — CasaCEO</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-0">

        {/* Header — Navy branded */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {selectedDocumentType && (
                  <button
                    onClick={() => setSelectedDocumentType(null)}
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white">
                    {selectedDocumentType ? selectedDocumentType : 'Document Vault'}
                  </h1>
                  <p className="text-blue-200 text-sm mt-0.5">
                    {selectedDocumentType
                      ? `${selectedHome?.name || 'This Property'} · ${getCountForType(selectedDocumentType)} documents`
                      : `${selectedHome?.name || 'This Property'} · ${allDocuments.length} documents stored`
                    }
                  </p>
                  {!selectedDocumentType && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
                      <span className="text-blue-200 text-xs">All documents encrypted and securely stored</span>
                    </div>
                  )}
                </div>
              </div>

              {!selectedDocumentType && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-white/40 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!selectedDocumentType ? (
          <>
            {/* Expiry Alerts */}
            <ExpiryAlerts documents={allDocuments} />

            {/* Stats */}
            <VaultStats documents={allDocuments} categories={DOCUMENT_TYPES} />

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCategories.map((docType) => (
                <CategoryCard
                  key={docType.type}
                  docType={docType}
                  count={getCountForType(docType.type)}
                  expiringCount={getExpiringForType(docType.type)}
                  onClick={setSelectedDocumentType}
                />
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 font-medium">No categories match "{searchQuery}"</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <DocumentUploadForm
              documentType={selectedDocumentType}
              propertyId={selectedHome.id}
              onUploadSuccess={() => {
                fetchDocuments();
                fetchAllDocuments();
              }}
            />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
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
