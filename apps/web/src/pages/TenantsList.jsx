import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import TenantForm from '@/components/TenantForm.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Plus, Edit, Trash2 } from 'lucide-react';

const TenantsList = () => {
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tenantsData, propertiesData] = await Promise.all([
        pb.collection('tenants').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('properties').getFullList({ $autoCancel: false }),
      ]);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tenants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await pb.collection('tenants').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Tenant deleted successfully' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tenant',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingId(null);
    loadData();
  };

  const getPropertyAddress = (propertyId) => {
    const property = properties.find((p) => p.id === propertyId);
    return property ? property.address : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <Helmet>
        <title>Tenants - PropManager</title>
        <meta name="description" content="Manage your tenants" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>
                <p className="text-slate-600 mt-1">Manage tenant information and leases</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingId(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tenant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
                  </DialogHeader>
                  <TenantForm
                    tenantId={editingId}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : tenants.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No tenants yet. Add your first tenant to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Lease End</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Rent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tenants.map((tenant) => (
                          <tr key={tenant.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-900">{tenant.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{tenant.email}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{tenant.phone || '-'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{getPropertyAddress(tenant.propertyId)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {new Date(tenant.leaseEndDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                              ${tenant.monthlyRent.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tenant.paymentStatus)}`}>
                                {tenant.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(tenant.id);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(tenant.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TenantsList;