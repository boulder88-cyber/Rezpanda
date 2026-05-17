import React, { useState, useEffect } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useToast } from '@/hooks/use-toast.js';

const TenantForm = ({ tenantId, onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: '',
    paymentStatus: 'pending',
  });

  useEffect(() => {
    loadProperties();
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const loadProperties = async () => {
    try {
      const records = await pb.collection('properties').getFullList({ $autoCancel: false });
      setProperties(records);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const loadTenant = async () => {
    try {
      const tenant = await pb.collection('tenants').getOne(tenantId, { $autoCancel: false });
      setFormData({
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone || '',
        propertyId: tenant.propertyId,
        leaseStartDate: tenant.leaseStartDate,
        leaseEndDate: tenant.leaseEndDate,
        monthlyRent: tenant.monthlyRent,
        paymentStatus: tenant.paymentStatus,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tenant',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        ownerId: currentUser.id,
      };

      if (tenantId) {
        await pb.collection('tenants').update(tenantId, data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Tenant updated successfully' });
      } else {
        await pb.collection('tenants').create(data, { $autoCancel: false });
        toast({ title: 'Success', description: 'Tenant created successfully' });
      }

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tenant',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="text-slate-900"
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="text-slate-900"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="text-slate-900"
        />
      </div>

      <div>
        <Label htmlFor="propertyId">Assigned Property *</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leaseStartDate">Lease Start Date *</Label>
          <Input
            id="leaseStartDate"
            type="date"
            value={formData.leaseStartDate}
            onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
            required
            className="text-slate-900"
          />
        </div>
        <div>
          <Label htmlFor="leaseEndDate">Lease End Date *</Label>
          <Input
            id="leaseEndDate"
            type="date"
            value={formData.leaseEndDate}
            onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
            required
            className="text-slate-900"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="monthlyRent">Monthly Rent *</Label>
        <Input
          id="monthlyRent"
          type="number"
          step="0.01"
          value={formData.monthlyRent}
          onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
          required
          className="text-slate-900"
        />
      </div>

      <div>
        <Label htmlFor="paymentStatus">Payment Status *</Label>
        <select
          id="paymentStatus"
          value={formData.paymentStatus}
          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
          required
        >
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : tenantId ? 'Update Tenant' : 'Create Tenant'}
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

export default TenantForm;