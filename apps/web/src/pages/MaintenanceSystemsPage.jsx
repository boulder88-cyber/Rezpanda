import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Plus, Trash2, Wrench, Calendar, Settings } from 'lucide-react';

const MaintenanceSystemsPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    systemName: '',
    systemType: 'HVAC',
    lastServiceDate: '',
    nextServiceDate: '',
    serviceHistory: ''
  });

  useEffect(() => {
    if (selectedHome) {
      loadSystems();
    }
  }, [selectedHome]);

  const loadSystems = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId = "${selectedHome.id}"`,
        sort: 'systemName',
        $autoCancel: false
      });
      setSystems(records);
    } catch (error) {
      console.error("Failed to load systems:", error);
      toast({ title: 'Error', description: 'Failed to load maintenance systems', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('maintenance_systems').create({
        ...formData,
        homeId: selectedHome.id,
        ownerId: currentUser.id
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'System added successfully' });
      setIsAddOpen(false);
      setFormData({
        systemName: '',
        systemType: 'HVAC',
        lastServiceDate: '',
        nextServiceDate: '',
        serviceHistory: ''
      });
      loadSystems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add system', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this system?')) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'System deleted' });
      loadSystems();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete system', variant: 'destructive' });
    }
  };

  if (!selectedHome) return null;

  return (
    <>
      <Helmet>
        <title>Maintenance - CasaCEO</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Maintenance Systems</h1>
            <p className="text-slate-600">Track HVAC, plumbing, and other home systems</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Add System
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New System</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>System Name</Label>
                  <Input 
                    placeholder="e.g. Main AC Unit, Water Heater"
                    value={formData.systemName}
                    onChange={e => setFormData({...formData, systemName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>System Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.systemType}
                    onChange={e => setFormData({...formData, systemType: e.target.value})}
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="roof">Roof</option>
                    <option value="appliances">Appliances</option>
                    <option value="electrical">Electrical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Last Service Date</Label>
                    <Input 
                      type="date" 
                      value={formData.lastServiceDate}
                      onChange={e => setFormData({...formData, lastServiceDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Service Due</Label>
                    <Input 
                      type="date" 
                      value={formData.nextServiceDate}
                      onChange={e => setFormData({...formData, nextServiceDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes / History</Label>
                  <Input 
                    placeholder="Filter sizes, contractor info, etc."
                    value={formData.serviceHistory}
                    onChange={e => setFormData({...formData, serviceHistory: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">Save System</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading systems...</div>
        ) : systems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center flex flex-col items-center">
              <Settings className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No systems tracked</h3>
              <p className="text-slate-500 mt-1">Add your HVAC, water heater, or other systems to track maintenance.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((sys) => (
              <Card key={sys.id} className="flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{sys.systemName}</CardTitle>
                    <p className="text-sm text-slate-500 capitalize mt-1">{sys.systemType}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-slate-600" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Last Service:</span>
                      <span className="font-medium text-slate-900">
                        {sys.lastServiceDate ? new Date(sys.lastServiceDate).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-600">Next Due:</span>
                      <span className="font-medium text-blue-700">
                        {sys.nextServiceDate ? new Date(sys.nextServiceDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    {sys.serviceHistory && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Notes</p>
                        <p className="text-sm text-slate-700 line-clamp-2">{sys.serviceHistory}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sys.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MaintenanceSystemsPage;