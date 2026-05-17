import React, { useState, useEffect } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Upload } from 'lucide-react';

const DocumentUpload = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    documentType: 'lease',
    file: null,
    fileName: '',
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const records = await pb.collection('properties').getFullList({ $autoCancel: false });
      setProperties(records);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file,
        fileName: file.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('propertyId', formData.propertyId);
      data.append('documentType', formData.documentType);
      data.append('file', formData.file);
      data.append('fileName', formData.fileName);
      data.append('uploadDate', new Date().toISOString().split('T')[0]);
      data.append('ownerId', currentUser.id);

      await pb.collection('documents').create(data, { $autoCancel: false });
      toast({ title: 'Success', description: 'Document uploaded successfully' });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="propertyId">Property *</Label>
        <select
          id="propertyId"
          value={formData.propertyId}
          onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
          required
        >
          <option value="">Select a property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="documentType">Document Type *</Label>
        <select
          id="documentType"
          value={formData.documentType}
          onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
          required
        >
          <option value="lease">Lease</option>
          <option value="inspection">Inspection</option>
          <option value="contract">Contract</option>
          <option value="receipt">Receipt</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="file">File *</Label>
        <div className="mt-2 flex items-center gap-4">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="text-slate-900"
            required
          />
          {formData.file && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Upload className="w-4 h-4" />
              <span>{formData.file.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Uploading...' : 'Upload Document'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default DocumentUpload;