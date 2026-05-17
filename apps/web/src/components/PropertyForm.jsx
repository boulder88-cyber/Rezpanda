import React, { useState } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2 } from 'lucide-react';

const PropertyForm = ({ onSuccess, onCancel, initialData = null }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    propertyType: initialData?.propertyType || 'apartment',
    bedrooms: initialData?.bedrooms || '',
    bathrooms: initialData?.bathrooms || '',
    squareFootage: initialData?.squareFootage || '',
    rentPrice: initialData?.rentPrice || '',
    status: initialData?.status || 'vacant'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a property.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0,
        squareFootage: formData.squareFootage ? Number(formData.squareFootage) : 0,
        rentPrice: formData.rentPrice ? Number(formData.rentPrice) : 0,
        ownerId: currentUser.id // Strictly using ownerId as per schema
      };

      let record;
      if (initialData?.id) {
        record = await pb.collection('properties').update(initialData.id, dataToSubmit, { $autoCancel: false });
        toast({ title: "Success", description: "Property updated successfully." });
      } else {
        record = await pb.collection('properties').create(dataToSubmit, { $autoCancel: false });
        toast({ title: "Success", description: "Property created successfully." });
      }
      
      if (onSuccess) onSuccess(record);
    } catch (error) {
      console.error("Error saving property:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save property.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="address" className="text-slate-700">Property Address *</Label>
        <Input 
          id="address" 
          name="address" 
          value={formData.address} 
          onChange={handleChange} 
          placeholder="123 Main St, City, State" 
          required 
          className="text-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="propertyType" className="text-slate-700">Property Type *</Label>
          <Select value={formData.propertyType} onValueChange={(val) => handleSelectChange('propertyType', val)}>
            <SelectTrigger className="text-slate-900">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-700">Status *</Label>
          <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
            <SelectTrigger className="text-slate-900">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="text-slate-700">Bedrooms</Label>
          <Input 
            id="bedrooms" 
            name="bedrooms" 
            type="number" 
            min="0" 
            value={formData.bedrooms} 
            onChange={handleChange} 
            className="text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms" className="text-slate-700">Bathrooms</Label>
          <Input 
            id="bathrooms" 
            name="bathrooms" 
            type="number" 
            min="0" 
            step="0.5" 
            value={formData.bathrooms} 
            onChange={handleChange} 
            className="text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="squareFootage" className="text-slate-700">Sq Ft</Label>
          <Input 
            id="squareFootage" 
            name="squareFootage" 
            type="number" 
            min="0" 
            value={formData.squareFootage} 
            onChange={handleChange} 
            className="text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rentPrice" className="text-slate-700">Rent Price ($) *</Label>
          <Input 
            id="rentPrice" 
            name="rentPrice" 
            type="number" 
            min="0" 
            value={formData.rentPrice} 
            onChange={handleChange} 
            required 
            className="text-slate-900"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Property' : 'Create Property'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;