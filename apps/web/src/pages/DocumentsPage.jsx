import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import DocumentUploadForm from '@/components/DocumentUploadForm.jsx';
import DocumentTypeList from '@/components/DocumentTypeList.jsx';
import {
  ShieldCheck, FileSignature, Receipt, ScrollText,
  Landmark, Ruler, FileText, Shield, FileMinus,
  ArrowLeft, FolderOpen, Search, AlertCircle,
  Clock, CheckCircle2, Upload, Grid, X,
  ChevronRight, Lock, Plus, Download, Filter,
  Home, AlertTriangle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════════════

const DOCUMENT_TYPES = [
  { type: 'Insurance Policies', icon: Shield, description: 'Homeowners, liability, and umbrella coverage.', iconColor: '#e8604c', iconBg: '#fdf0ee', hasExpiry: true, tip: 'Never let a policy expire — CasaCEO alerts you before renewal', required: true },
  { type: 'Deeds', icon: ScrollText, description: 'Property ownership documents — your most important proof.', iconColor: '#d97706', iconBg: '#fffbeb', hasExpiry: false, tip: 'Your most important proof of ownership', required: true },
  { type: 'Mortgages', icon: Landmark, description: 'Loan and mortgage agreements — all financing in one place.', iconColor: '#2563eb', iconBg: '#eff6ff', hasExpiry: false, tip: 'All financing documents organized and searchable', required: true },
  { type: 'Warranties', icon: ShieldCheck, description: 'Appliance and system coverage — track expiry and renewal.', iconColor: '#1e3a5f', iconBg: '#eef2f8', hasExpiry: true, tip: 'Track expiry dates across every home', required: false },
  { type: 'Closing Documents', icon: FileSignature, description: 'Settlement and closing papers — every transaction accessible.', iconColor: '#7c3aed', iconBg: '#f5f3ff', hasExpiry: false, tip: 'Keep every transaction record accessible and searchable', required: false },
  { type: 'Purchase Receipts', icon: Receipt, description: 'Major purchases and repairs — keep receipts for taxes.', iconColor: '#059669', iconBg: '#ecfdf5', hasExpiry: false, tip: 'Keep receipts for tax deductions and warranty claims', required: false },
  { type: 'Tenant Contracts', icon: FileText, description: 'Lease agreements and addendums — track start and end dates.', iconColor: '#0891b2', iconBg: '#ecfeff', hasExpiry: true, tip: 'Track lease start and end dates automatically', required: false },
  { type: 'Architectural Designs', icon: Ruler, description: 'Floor plans, blueprints, and permits — plans for future projects.', iconColor: '#db2777', iconBg: '#fdf2f8', hasExpiry: false, tip: 'Store plans for renovations and future projects', required: false },
  { type: 'Lien Waivers', icon: FileMinus, description: 'Contractor lien releases — protect yourself from future disputes.', iconColor: '#64748b', iconBg: '#f8fafc', hasExpiry: false, tip: 'Protect yourself from future disputes', required: false },
];

const REQUIRED_DOCS = [
  { name: 'Homeowner\'s Insurance Policy', type: 'Insurance Policies', priority: 'High' },
  { name: 'Property Deed', type: 'Deeds', priority: 'High' },
  { name: 'Mortgage Agreement', type: 'Mortgages', priority: 'High' },
  { name: 'Closing Disclosure', type: 'Closing Documents', priority: 'Medium' },
  { name: 'Home Warranty', type: 'Warranties', priority: 'Medium' },
  { name: 'Survey / Site Plan', type: 'Architectural Designs', priority: 'Low' },
];

// ═══════════════════════════════════════════════════════════════════════
// EXPIRY ALERTS
// ═══════════════════════════════════════════════════════════════════════

const ExpiryAlerts = ({ documents }) => {
  const today = new Date();
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiring = documents.filter(d => d.expiryDate && new Date(d.expiryDate) <= in60Days && new Date(d.expiryDate) >= today);
  const expired = documents.filter(d => d.expiryDate && new Date(d.expiryDate) < today);
  if (expiring.length === 0 && expired.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
      {expired.length > 0 && (
        <div className="flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px' }}>
          <AlertCircle style={{ width: '18px', height: '18px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="font-semibold text-red-700" style={{ fontSize: '14px' }}>{expired.length} document{expired.length > 1 ? 's' : ''} expired</p>
            <p className="text-red-500" style={{ fontSize: '12px', marginTop: '2px' }}>{expired.map(d => d.documentName || d.documentType).join(', ')}</p>
          </div>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="flex items-start gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px' }}>
          <Clock style={{ width: '18px', height: '18px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="font-semibold text-amber-700" style={{ fontSize: '14px' }}>{expiring.length} document{expiring.length > 1 ? 's' : ''} expiring soon</p>
            <p className="text-amber-600" style={{ fontSize: '12px', marginTop: '2px' }}>{expiring.map(d => d.documentName || d.documentType).join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// VAULT STATS
// ═══════════════════════════════════════════════════════════════════════

const VaultStats = ({ documents, categories }) => {
  const totalDocs = documents.length;
  const withExpiry = documents.filter(d => d.expiryDate).length;
  const categoriesUsed = new Set(documents.map(d => d.documentType)).size;

  return (
    <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '24px' }}>
      {[
        { label: 'Securely Stored', value: totalDocs, icon: FolderOpen, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb' },
        { label: 'Active Folders', value: `${categoriesUsed}/${categories.length}`, icon: Grid, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
        { label: 'Renewal Alerts', value: withExpiry, icon: Clock, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white flex flex-col items-center text-center" style={{ borderRadius: '12px', border: `1px solid ${stat.border}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: stat.bg, marginBottom: '8px' }}>
              <Icon style={{ width: '18px', height: '18px', color: stat.color }} />
            </div>
            <p className="font-extrabold text-slate-900" style={{ fontSize: '24px', lineHeight: 1 }}>{stat.value}</p>
            <p className="font-medium text-slate-500" style={{ fontSize: '12px', marginTop: '4px' }}>{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MISSING DOCUMENTS SECTION
// ═══════════════════════════════════════════════════════════════════════

const MissingDocuments = ({ documents, onAddDocument }) => {
  const docTypes = new Set(documents.map(d => d.documentType));
  const missing = REQUIRED_DOCS.filter(r => !docTypes.has(r.type));
  if (missing.length === 0) return null;

  const priorityColors = { High: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', label: 'Required' }, Medium: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', label: 'Recommended' }, Low: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', label: 'Optional' } };

  return (
    <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
        <AlertTriangle style={{ width: '16px', height: '16px', color: '#d97706' }} />
        <h3 className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Missing Documents</h3>
        <span className="font-medium text-amber-700 bg-amber-100 rounded-full" style={{ padding: '2px 8px', fontSize: '11px' }}>{missing.length} missing</span>
      </div>
      <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '16px' }}>Your home record is incomplete. Add these documents for a complete profile.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {missing.map((doc, i) => {
          const p = priorityColors[doc.priority];
          return (
            <div key={i} className="flex items-center justify-between" style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: '10px', padding: '10px 14px' }}>
              <div className="flex items-center gap-3">
                <Upload style={{ width: '14px', height: '14px', color: p.color, flexShrink: 0 }} />
                <div>
                  <p className="font-medium text-slate-800" style={{ fontSize: '13px' }}>{doc.name}</p>
                  <p className="text-slate-400" style={{ fontSize: '11px' }}>{doc.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium rounded-full" style={{ fontSize: '11px', color: p.color, background: 'white', padding: '2px 8px', border: `1px solid ${p.border}` }}>{p.label}</span>
                <button onClick={() => onAddDocument(doc.type)} className="font-semibold text-white hover:opacity-90 transition-all rounded-lg" style={{ background: '#1e3a5f', padding: '4px 12px', fontSize: '12px' }}>
                  Upload
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY CARD — folder-style
// ═══════════════════════════════════════════════════════════════════════

const CategoryCard = ({ docType, count, expiringCount, onClick }) => {
  const Icon = docType.icon;
  return (
    <button onClick={() => onClick(docType.type)} className="bg-white text-left hover:shadow-md transition-all group w-full" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center group-hover:scale-105 transition-transform" style={{ width: '44px', height: '44px', borderRadius: '10px', background: docType.iconBg }}>
          <Icon style={{ width: '20px', height: '20px', color: docType.iconColor }} />
        </div>
        <div className="flex items-center gap-2">
          {expiringCount > 0 && (
            <span className="flex items-center gap-1 font-bold text-red-500 bg-red-50 rounded-full" style={{ padding: '3px 8px', fontSize: '11px', border: '1px solid #fecaca' }}>
              <AlertCircle style={{ width: '11px', height: '11px' }} /> {expiringCount} expiring
            </span>
          )}
          <span className="font-bold text-slate-600 bg-slate-100 rounded-full" style={{ padding: '3px 8px', fontSize: '12px' }}>{count}</span>
        </div>
      </div>

      <h3 className="font-semibold text-slate-900" style={{ fontSize: '15px', marginBottom: '4px' }}>{docType.type}</h3>
      <p className="text-slate-400" style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>{docType.description}</p>

      <div className="flex items-center justify-between">
        <p className="text-slate-300 italic" style={{ fontSize: '11px' }}>{docType.tip}</p>
        <ChevronRight style={{ width: '14px', height: '14px', color: '#cbd5e1' }} className="group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      {count === 0 && (
        <div className="flex items-center gap-1.5 border-t border-dashed border-slate-100" style={{ marginTop: '12px', paddingTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
          <Upload style={{ width: '13px', height: '13px' }} /> Click to add your first document
        </div>
      )}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

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
    if (selectedHome && currentUser) fetchAllDocuments();
  }, [selectedHome, currentUser]);

  useEffect(() => {
    if (selectedDocumentType && selectedHome && currentUser) fetchDocuments();
  }, [selectedDocumentType, selectedHome, currentUser]);

  const fetchAllDocuments = async () => {
    try {
      const records = await pb.collection('property_documents').getFullList({
        filter: `ownerId="${currentUser.id}" && propertyId="${selectedHome.id}"`, sort: '-uploadDate', $autoCancel: false
      });
      setAllDocuments(records);
    } catch (error) { console.error('Failed to fetch all documents:', error); }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('property_documents').getList(1, 50, {
        filter: `documentType="${selectedDocumentType}" && ownerId="${currentUser.id}" && propertyId="${selectedHome.id}"`, sort: '-uploadDate', $autoCancel: false
      });
      setDocuments(records.items);
    } catch {
      toast({ title: 'Error', description: 'Failed to load documents.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await pb.collection('property_documents').delete(id, { $autoCancel: false });
      toast({ title: '✅ Document deleted' });
      fetchDocuments(); fetchAllDocuments();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete document.', variant: 'destructive' });
    }
  };

  const getCountForType = (type) => allDocuments.filter(d => d.documentType === type).length;
  const getExpiringForType = (type) => {
    const today = new Date();
    const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    return allDocuments.filter(d => d.documentType === type && d.expiryDate && new Date(d.expiryDate) <= in60Days).length;
  };

  const filteredCategories = DOCUMENT_TYPES.filter(dt => dt.type.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── No home selected ──
  if (!selectedHome) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8' }}>
              <FolderOpen style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px' }}>Document Vault</h1>
              <p className="text-slate-400" style={{ fontSize: '14px' }}>Your secure, searchable home archive.</p>
            </div>
          </div>
        </div>
        <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
          <div className="flex items-center justify-center mx-auto" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eef2f8', marginBottom: '16px' }}>
            <FolderOpen style={{ width: '28px', height: '28px', color: '#1e3a5f' }} />
          </div>
          <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No property selected.</p>
          <p className="text-slate-400" style={{ fontSize: '14px' }}>Select a property from the top menu to view and manage your documents.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Document Vault — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            {selectedDocumentType ? (
              <>
                <button onClick={() => setSelectedDocumentType(null)} className="hover:text-slate-600 transition-colors">Document Vault</button>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
                <span className="text-slate-700 font-medium">{selectedDocumentType}</span>
              </>
            ) : (
              <span className="text-slate-700 font-medium">Document Vault</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedDocumentType && (
                <button onClick={() => setSelectedDocumentType(null)} className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <ArrowLeft style={{ width: '18px', height: '18px', color: '#64748b' }} />
                </button>
              )}
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', flexShrink: 0 }}>
                <Lock style={{ width: '22px', height: '22px', color: '#1e3a5f' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>
                  {selectedDocumentType || 'Document Vault'}
                </h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                  {selectedDocumentType
                    ? `${selectedHome?.name} · ${getCountForType(selectedDocumentType)} documents`
                    : `${selectedHome?.name} · ${allDocuments.length} documents stored · Encrypted`
                  }
                </p>
              </div>
            </div>

            {!selectedDocumentType && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search style={{ width: '15px', height: '15px', color: '#94a3b8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <Input placeholder="Search folders…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl border-slate-200" style={{ width: '220px', height: '40px', fontSize: '13px' }} />
                </div>
                <button className="flex items-center gap-2 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all rounded-xl" style={{ padding: '8px 14px', fontSize: '13px' }}>
                  <Download style={{ width: '14px', height: '14px' }} /> Export All
                </button>
              </div>
            )}
          </div>
        </div>

        {!selectedDocumentType ? (
          <>
            <ExpiryAlerts documents={allDocuments} />
            <VaultStats documents={allDocuments} categories={DOCUMENT_TYPES} />
            <MissingDocuments documents={allDocuments} onAddDocument={setSelectedDocumentType} />

            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px' }}>Document Folders</h2>
              <div className="flex items-center gap-2">
                <ShieldCheck style={{ width: '14px', height: '14px', color: '#059669' }} />
                <p className="text-slate-400" style={{ fontSize: '12px' }}>All documents encrypted and securely stored</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(docType => (
                <CategoryCard key={docType.type} docType={docType} count={getCountForType(docType.type)} expiringCount={getExpiringForType(docType.type)} onClick={setSelectedDocumentType} />
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center" style={{ padding: '48px 0' }}>
                <p className="font-medium text-slate-400" style={{ fontSize: '15px' }}>No folders match "{searchQuery}"</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <DocumentUploadForm
              documentType={selectedDocumentType}
              propertyId={selectedHome.id}
              onUploadSuccess={() => { fetchDocuments(); fetchAllDocuments(); }}
            />
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
              </div>
            ) : (
              <DocumentTypeList documentType={selectedDocumentType} documents={documents} onDelete={handleDeleteDocument} />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsPage;
