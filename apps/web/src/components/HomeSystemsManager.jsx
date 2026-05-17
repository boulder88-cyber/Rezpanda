import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Plus, Search, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';
import pb from '@/lib/pocketbaseClient.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import MaintenanceSystemCard from './MaintenanceSystemCard.jsx';

const SYSTEM_TYPES = ['HVAC', 'plumbing', 'roof', 'appliances', 'electrical', 'foundation', 'insulation', 'windows', 'doors', 'other'];

const HomeSystemsManager = () => {
  const { currentHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [formData, setFormData] = useState({
    systemName: '',
    systemType: '',
    lastServiceDate: '',
    nextServiceDate: '',
    serviceHistory: ''
  });

  const fetchSystems = async () => {
    if (!currentHome) return;
    setLoading(true);
    try {
      const records = await pb.collection('maintenance_systems').getFullList({
        filter: `homeId="${currentHome.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setSystems(records);
    } catch (error) {
      console.error("Error fetching systems:", error);
      toast({ title: "Error", description: "Failed to load systems.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [currentHome]);

  const handleOpenDialog = (system = null) => {
    if (system) {
      setEditingSystem(system);
      setFormData({
        systemName: system.systemName,
        systemType: system.systemType || '',
        lastServiceDate: system.lastServiceDate ? system.lastServiceDate.split('T')[0] : '',
        nextServiceDate: system.nextServiceDate ? system.nextServiceDate.split('T')[0] : '',
        serviceHistory: system.serviceHistory || ''
      });
    } else {
      setEditingSystem(null);
      setFormData({
        systemName: '',
        systemType: '',
        lastServiceDate: '',
        nextServiceDate: '',
        serviceHistory: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        homeId: currentHome.id,
        ownerId: currentUser.id,
        // Ensure empty dates are sent as empty strings or null, not invalid dates
        lastServiceDate: formData.lastServiceDate ? new Date(formData.lastServiceDate).toISOString() : '',
        nextServiceDate: formData.nextServiceDate ? new Date(formData.nextServiceDate).toISOString() : ''
      };

      if (editingSystem) {
        await pb.collection('maintenance_systems').update(editingSystem.id, dataToSave, { $autoCancel: false });
        toast({ title: "Success", description: "System updated successfully." });
      } else {
        await pb.collection('maintenance_systems').create(dataToSave, { $autoCancel: false });
        toast({ title: "Success", description: "System added successfully." });
      }
      setIsDialogOpen(false);
      fetchSystems();
    } catch (error) {
      console.error("Error saving system:", error);
      toast({ title: "Error", description: "Failed to save system.", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this system?")) return;
    try {
      await pb.collection('maintenance_systems').delete(id, { $autoCancel: false });
      toast({ title: "Success", description: "System deleted." });
      fetchSystems();
    } catch (error) {
      console.error("Error deleting system:", error);
      toast({ title: "Error", description: "Failed to delete system.", variant: "destructive" });
    }
  };

  const filteredSystems = systems.filter(s => 
    s.systemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.systemType && s.systemType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search systems..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add System
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : filteredSystems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No systems found</h3>
          <p className="text-slate-500 mb-4">Add your home's major systems to start tracking maintenance.</p>
          <Button variant="outline" onClick={() => handleOpenDialog()}>Add Your First System</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSystems.map(system => (
            <MaintenanceSystemCard 
              key={system.id} 
              system={system} 
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onViewDetails={handleOpenDialog} // For now, just open edit dialog
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSystem ? 'Edit System' : 'Add New System'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name *</Label>
              <Input 
                id="systemName" 
                required 
                value={formData.systemName}
                onChange={(e) => setFormData({...formData, systemName: e.target.value})}
                placeholder="e.g., Main AC Unit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemType">System Type</Label>
              <Select 
                value={formData.systemType} 
                onValueChange={(val) => setFormData({...formData, systemType: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastServiceDate">Last Service Date</Label>
                <Input 
                  id="lastServiceDate" 
                  type="date" 
                  value={formData.lastServiceDate}
                  onChange={(e) => setFormData({...formData, lastServiceDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextServiceDate">Next Service Date</Label>
                <Input 
                  id="nextServiceDate" 
                  type="date" 
                  value={formData.nextServiceDate}
                  onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceHistory">Notes / History</Label>
              <Input 
                id="serviceHistory" 
                value={formData.serviceHistory}
                onChange={(e) => setFormData({...formData, serviceHistory: e.target.value})}
                placeholder="Any important notes..."
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingSystem ? 'Save Changes' : 'Add System'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeSystemsManager;