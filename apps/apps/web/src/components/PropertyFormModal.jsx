import React, { useState } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';

const PropertyFormModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    rentPrice: '',
    status: 'vacant'
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

    // Validation
    if (!formData.propertyName || !formData.address || !formData.propertyType || !formData.rentPrice || !formData.status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        name: formData.propertyName, // Mapping propertyName to name just in case it's needed by other components
        address: formData.address,
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0,
        squareFootage: formData.squareFootage ? Number(formData.squareFootage) : 0,
        rentPrice: formData.rentPrice ? Number(formData.rentPrice) : 0,
        status: formData.status,
        ownerId: currentUser.id
      };

      const record = await pb.collection('properties').create(dataToSubmit, { $autoCancel: false });
      
      toast({ 
        title: "Success", 
        description: "Property created successfully." 
      });
      
      // Reset form
      setFormData({
        propertyName: '',
        address: '',
        propertyType: 'apartment',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        rentPrice: '',
        status: 'vacant'
      });
      
      if (onSuccess) onSuccess(record);
      onClose();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Enter the details of your new property below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="propertyName">Property Name *</Label>
            <Input 
              id="propertyName" 
              name="propertyName" 
              value={formData.propertyName} 
              onChange={handleChange} 
              placeholder="e.g., Sunset Apartments" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Property Address *</Label>
            <Input 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="123 Main St, City, State" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={formData.propertyType} onValueChange={(val) => handleSelectChange('propertyType', val)}>
                <SelectTrigger>
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
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                <SelectTrigger>
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
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input 
                id="bedrooms" 
                name="bedrooms" 
                type="number" 
                min="0" 
                value={formData.bedrooms} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input 
                id="bathrooms" 
                name="bathrooms" 
                type="number" 
                min="0" 
                step="0.5" 
                value={formData.bathrooms} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareFootage">Sq Ft</Label>
              <Input 
                id="squareFootage" 
                name="squareFootage" 
                type="number" 
                min="0" 
                value={formData.squareFootage} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentPrice">Rent Price ($) *</Label>
              <Input 
                id="rentPrice" 
                name="rentPrice" 
                type="number" 
                min="0" 
                value={formData.rentPrice} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create Property'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;