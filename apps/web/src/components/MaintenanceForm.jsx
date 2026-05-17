import React, { useState, useEffect } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';

const MaintenanceForm = ({ maintenanceId, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    description: '',
    status: 'pending',
    cost: '',
    dateLogged: new Date().toISOString().split('T')[0],
    completionDate: '',
  });

  useEffect(() => {
    loadProperties();
    if (maintenanceId) {
      loadMaintenance();
    }
  }, [maintenanceId]);

  const loadProperties = async () => {
    try {
      const records = await pb.collection('properties').getFullList({ $autoCancel: false });
      setProperties(records);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const loadMaintenance = async () => {
    try {
      const maintenance = await pb.collection('maintenance').getOne(maintenanceId, { $autoCancel: false });
      setFormData({
        propertyId: maintenance.propertyId,
        description: maintenance.description,
        status: maintenance.status,
        cost: maintenance.cost || '',
        dateLogged: maintenance.dateLogged,
        completionDate: maintenance.completionDate || '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load maintenance request',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        propertyId: formData.propertyId,
        description: formData.description,
        status: formData.status,
        cost: formData.cost || 0,
        dateLogged: formData.dateLogged,
        completionDate: formData.completionDate || null,
        ownerId: currentUser.id,
      };

      if (maintenanceId) {
        await pb.collection('maintenance').update(maintenanceId, data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Maintenance request updated successfully' });
      } else {
        await pb.collection('maintenance').create(data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Maintenance request created successfully' });
      }

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save maintenance request',
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
        <Label htmlFor="description">Description *</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white min-h-[100px]"
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
          required
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <Label htmlFor="cost">Cost</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          className="text-slate-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateLogged">Date Logged *</Label>
          <Input
            id="dateLogged"
            type="date"
            value={formData.dateLogged}
            onChange={(e) => setFormData({ ...formData, dateLogged: e.target.value })}
            required
            className="text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="completionDate">Completion Date</Label>
          <Input
            id="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
            className="text-slate-900"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : maintenanceId ? 'Update Request' : 'Create Request'}
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

export default MaintenanceForm;