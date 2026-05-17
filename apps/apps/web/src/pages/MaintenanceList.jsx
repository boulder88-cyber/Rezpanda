import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import MaintenanceForm from '@/components/MaintenanceForm.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

const MaintenanceList = () => {
  const { toast } = useToast();
  const [maintenance, setMaintenance] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [maintenanceData, propertiesData] = await Promise.all([
        pb.collection('maintenance').getFullList({ sort: '-dateLogged', $autoCancel: false }),
        pb.collection('properties').getFullList({ $autoCancel: false }),
      ]);
      setMaintenance(maintenanceData);
      setProperties(propertiesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load maintenance requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance request?')) return;

    try {
      await pb.collection('maintenance').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Maintenance request deleted successfully' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete maintenance request',
        variant: 'destructive',
      });
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await pb.collection('maintenance').update(
        id,
        {
          status: 'completed',
          completionDate: new Date().toISOString().split('T')[0],
        },
        { $autoCancel: false }
      );
      toast({ title: 'Success', description: 'Maintenance request marked as completed' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update maintenance request',
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
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <Helmet>
        <title>Maintenance - PropManager</title>
        <meta name="description" content="Track maintenance requests and work orders" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
                <p className="text-slate-600 mt-1">Track maintenance requests and work orders</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingId(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Maintenance Request' : 'Log New Request'}</DialogTitle>
                  </DialogHeader>
                  <MaintenanceForm
                    maintenanceId={editingId}
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
            ) : maintenance.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-slate-500">No maintenance requests yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Property</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Cost</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date Logged</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {maintenance.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-900">{getPropertyAddress(item.propertyId)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.description}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900">
                              {item.cost ? `$${item.cost.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {new Date(item.dateLogged).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {item.status !== 'completed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkComplete(item.id)}
                                    title="Mark as completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
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

export default MaintenanceList;