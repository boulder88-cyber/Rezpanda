import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/horizonsBackend.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Plus, Trash2, Download, Receipt } from 'lucide-react';

const ExpensesPage = () => {
  const { selectedHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    category: 'maintenance',
    vendor: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    if (selectedHome) {
      loadExpenses();
    }
  }, [selectedHome]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('expenses').getFullList({
        filter: `propertyId = "${selectedHome.id}"`,
        sort: '-expenseDate',
        $autoCancel: false
      });
      setExpenses(records);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      toast({ title: 'Error', description: 'Failed to load expenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('expenses').create({
        ...formData,
        propertyId: selectedHome.id,
        ownerId: currentUser.id
      }, { $autoCancel: false });
      
      toast({ title: 'Success', description: 'Expense added successfully' });
      setIsAddOpen(false);
      setFormData({
        category: 'maintenance',
        vendor: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        description: ''
      });
      loadExpenses();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await pb.collection('expenses').delete(id, { $autoCancel: false });
      toast({ title: 'Success', description: 'Expense deleted' });
      loadExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast({ title: 'Error', description: 'Failed to delete expense', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    toast({ title: 'Export', description: '🚧 Export to CSV will be available soon! 🚀' });
  };

  if (!selectedHome) return null;

  return (
    <>
      <Helmet>
        <title>Expenses - RezPanda</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
            <p className="text-slate-600">Track spending for {selectedHome.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date" 
                        value={formData.expenseDate}
                        onChange={e => setFormData({...formData, expenseDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount ($)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="utilities">Utilities</option>
                      <option value="tax">Tax</option>
                      <option value="insurance">Insurance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor / Payee</Label>
                    <Input 
                      placeholder="e.g. Home Depot, Plumber Bob"
                      value={formData.vendor}
                      onChange={e => setFormData({...formData, vendor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      placeholder="What was this for?"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">Save Expense</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Receipt className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No expenses yet</h3>
                <p className="text-slate-500 mt-1">Add your first expense to start tracking.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium">Vendor</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                          {new Date(exp.expenseDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900">{exp.vendor || '-'}</td>
                        <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{exp.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900">
                          ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ExpensesPage;