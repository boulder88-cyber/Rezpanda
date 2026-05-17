import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { UploadCloud, FileText, Trash2, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';
import pb from '@/lib/pocketbaseClient.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CATEGORIES = ['Appliances', 'Systems', 'Renovations', 'Warranties', 'Service Records', 'Other'];

const DocumentStorage = () => {
  const { currentHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [documents, setDocuments] = useState([]);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fileName: '',
    category: 'Other',
    systemId: 'none',
    file: null
  });

  const fetchData = async () => {
    if (!currentHome) return;
    setLoading(true);
    try {
      const [docsRes, systemsRes] = await Promise.all([
        pb.collection('maintenance_documents').getFullList({
          filter: `homeId="${currentHome.id}"`,
          expand: 'systemId',
          sort: '-created',
          $autoCancel: false
        }),
        pb.collection('maintenance_systems').getFullList({
          filter: `homeId="${currentHome.id}"`,
          $autoCancel: false
        })
      ]);
      setDocuments(docsRes);
      setSystems(systemsRes);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({ title: "Error", description: "Failed to load documents.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentHome]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file,
        fileName: formData.fileName || file.name.split('.')[0]
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast({ title: "Error", description: "Please select a file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('homeId', currentHome.id);
      data.append('ownerId', currentUser.id);
      data.append('fileName', formData.fileName);
      data.append('category', formData.category);
      if (formData.systemId !== 'none') {
        data.append('systemId', formData.systemId);
      }
      data.append('file', formData.file);

      await pb.collection('maintenance_documents').create(data, { $autoCancel: false });
      
      toast({ title: "Success", description: "Document uploaded successfully." });
      setIsUploadOpen(false);
      setFormData({ fileName: '', category: 'Other', systemId: 'none', file: null });
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await pb.collection('maintenance_documents').delete(id, { $autoCancel: false });
      toast({ title: "Success", description: "Document deleted." });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  };

  const filteredDocs = documents.filter(d => {
    if (filterCategory === 'all') return true;
    return d.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="w-full sm:w-auto">
          <UploadCloud className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No documents found</h3>
          <p className="text-slate-500 mb-4">Upload manuals, warranties, or receipts for your home systems.</p>
          <Button variant="outline" onClick={() => setIsUploadOpen(true)}>Upload File</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <Card key={doc.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-slate-900 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {doc.category}
                    </Badge>
                    {doc.expand?.systemId && (
                      <Badge variant="outline" className="text-xs font-normal text-slate-500">
                        {doc.expand.systemId.systemName}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Uploaded {new Date(doc.created).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-500 hover:text-blue-600"
                    onClick={() => window.open(pb.files.getUrl(doc, doc.file), '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 py-4">
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              {formData.file ? (
                <p className="text-sm font-medium text-blue-600">{formData.file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900">Click to select a file</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, Word, or Images up to 20MB</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileName">Document Name *</Label>
              <Input 
                id="fileName" 
                required 
                value={formData.fileName}
                onChange={(e) => setFormData({...formData, fileName: e.target.value})}
                placeholder="e.g., HVAC Warranty"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemId">Related System</Label>
                <Select 
                  value={formData.systemId} 
                  onValueChange={(val) => setFormData({...formData, systemId: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {systems.map(sys => (
                      <SelectItem key={sys.id} value={sys.id}>{sys.systemName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} disabled={uploading}>Cancel</Button>
              <Button type="submit" disabled={uploading || !formData.file}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentStorage;