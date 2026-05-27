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
import { Plus, Trash2, Leaf, Droplets } from 'lucide-react';

const PlantsPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    plantName: '',
    plantType: '',
    location: '',
    lastWateredDate: new Date().toISOString().split('T')[0],
    wateringFrequencyDays: 7
  });

  useEffect(() => {
    if (selectedHome) {
      loadPlants();
    }
  }, [selectedHome]);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('plants').getFullList({
        filter: `homeId = "${selectedHome.id}"`,
        sort: 'plantName',
        $autoCancel: false
      });
      setPlants(records);
    } catch (error) {
      console.error("Failed to load plants:", error);
      toast({ title: 'Error', description: 'Failed to load plants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('plants').create({
        ...formData,
        homeId: selectedHome.id,
        ownerId: currentUser.id
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Plant added successfully' });
      setIsAddOpen(false);
      setFormData({
        plantName: '',
        plantType: '',
        location: '',
        lastWateredDate: new Date().toISOString().split('T')[0],
        wateringFrequencyDays: 7
      });
      loadPlants();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add plant', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plant?')) return;
    try {
      await pb.collection('plants').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Plant deleted' });
      loadPlants();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete plant', variant: 'destructive' });
    }
  };

  const handleWater = async (id) => {
    try {
      await pb.collection('plants').update(id, {
        lastWateredDate: new Date().toISOString().split('T')[0]
      }, { $autoCancel: false });
      toast({ title: 'Success', description: 'Plant watered!' });
      loadPlants();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update plant', variant: 'destructive' });
    }
  };

  if (!selectedHome) return null;

  return (
    <>
      <Helmet>
        <title>Plants & Yard - CasaCEO</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Plants & Yard</h1>
            <p className="text-slate-600">Track watering and care schedules</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" /> Add Plant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Plant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Plant Name</Label>
                  <Input 
                    placeholder="e.g. Fiddle Leaf Fig, Front Lawn"
                    value={formData.plantName}
                    onChange={e => setFormData({...formData, plantName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type/Species</Label>
                    <Input 
                      placeholder="e.g. Ficus lyrata"
                      value={formData.plantType}
                      onChange={e => setFormData({...formData, plantType: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      placeholder="e.g. Living Room"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Last Watered</Label>
                    <Input 
                      type="date" 
                      value={formData.lastWateredDate}
                      onChange={e => setFormData({...formData, lastWateredDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Water Every (Days)</Label>
                    <Input 
                      type="number" 
                      min="1"
                      value={formData.wateringFrequencyDays}
                      onChange={e => setFormData({...formData, wateringFrequencyDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Save Plant</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading plants...</div>
        ) : plants.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center flex flex-col items-center">
              <Leaf className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No plants added</h3>
              <p className="text-slate-500 mt-1">Add your indoor plants or yard zones to track care.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plants.map((plant) => {
              // Calculate if due
              let isDue = false;
              if (plant.lastWateredDate && plant.wateringFrequencyDays) {
                const last = new Date(plant.lastWateredDate);
                const next = new Date(last);
                next.setDate(last.getDate() + plant.wateringFrequencyDays);
                isDue = new Date() >= next;
              }

              return (
                <Card key={plant.id} className={`flex flex-col ${isDue ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                      {isDue && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          Needs Water
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 truncate">{plant.plantName}</h3>
                    <p className="text-sm text-slate-500 mb-4 truncate">{plant.location || 'No location'}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="text-sm flex justify-between">
                        <span className="text-slate-500">Last Watered:</span>
                        <span className="font-medium text-slate-900">
                          {plant.lastWateredDate ? new Date(plant.lastWateredDate).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          onClick={() => handleWater(plant.id)}
                        >
                          <Droplets className="w-4 h-4 mr-1" /> Water
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(plant.id)} className="text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PlantsPage;
