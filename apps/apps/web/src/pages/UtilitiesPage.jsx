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
import { Plus, Trash2, Zap, ExternalLink, Calendar } from 'lucide-react';

const UtilitiesPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    providerName: '',
    utilityType: 'electric',
    accountNumber: '',
    payOnlineLink: '',
    billingCycleDay: ''
  });

  useEffect(() => {
    if (selectedHome) {
      loadUtilities();
    }
  }, [selectedHome]);

  const loadUtilities = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('utilities').getFullList({
        filter: `homeId = "${selectedHome.id}"`,
        sort: 'providerName',
        $autoCancel: false
      });
      setUtilities(records);
    } catch (error) {
      console.error("Failed to load utilities:", error);
      toast({ title: 'Error', description: 'Failed to load utilities', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('utilities').create({
        ...formData,
        homeId: selectedHome.id,
        ownerId: currentUser.id
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Utility provider added' });
      setIsAddOpen(false);
      setFormData({
        providerName: '',
        utilityType: 'electric',
        accountNumber: '',
        payOnlineLink: '',
        billingCycleDay: ''
      });
      loadUtilities();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add utility', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this utility provider?')) return;
    try {
      await pb.collection('utilities').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Provider deleted' });
      loadUtilities();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete provider', variant: 'destructive' });
    }
  };

  if (!selectedHome) return null;

  return (
    <>
      <Helmet>
        <title>Utilities - RezPanda</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Utilities</h1>
            <p className="text-slate-600">Manage providers and billing for {selectedHome.name}</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Utility Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input 
                    placeholder="e.g. Pacific Gas & Electric"
                    value={formData.providerName}
                    onChange={e => setFormData({...formData, providerName: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.utilityType}
                      onChange={e => setFormData({...formData, utilityType: e.target.value})}
                    >
                      <option value="electric">Electric</option>
                      <option value="gas">Gas</option>
                      <option value="water">Water</option>
                      <option value="internet">Internet</option>
                      <option value="trash">Trash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Day (1-31)</Label>
                    <Input 
                      type="number" 
                      min="1" max="31"
                      placeholder="e.g. 15"
                      value={formData.billingCycleDay}
                      onChange={e => setFormData({...formData, billingCycleDay: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input 
                    value={formData.accountNumber}
                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pay Online URL</Label>
                  <Input 
                    type="url"
                    placeholder="https://..."
                    value={formData.payOnlineLink}
                    onChange={e => setFormData({...formData, payOnlineLink: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">Save Provider</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading utilities...</div>
        ) : utilities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center flex flex-col items-center">
              <Zap className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No utilities added</h3>
              <p className="text-slate-500 mt-1">Add your electric, water, and internet providers.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {utilities.map((util) => (
              <Card key={util.id} className="flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{util.providerName}</CardTitle>
                    <p className="text-sm text-slate-500 capitalize mt-1">{util.utilityType}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {util.accountNumber && (
                      <div className="text-sm">
                        <span className="text-slate-500 block text-xs uppercase font-semibold">Account #</span>
                        <span className="font-medium text-slate-900">{util.accountNumber}</span>
                      </div>
                    )}
                    {util.billingCycleDay && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Bills on day {util.billingCycleDay}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    {util.payOnlineLink ? (
                      <a href={util.payOnlineLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium">
                        Pay Online <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">No link</span>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(util.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
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

export default UtilitiesPage;