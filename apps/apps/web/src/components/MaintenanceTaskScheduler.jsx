import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';
import pb from '@/lib/pocketbaseClient.js';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import MaintenanceTaskCard from './MaintenanceTaskCard.jsx';

const FREQUENCIES = ['one-time', 'weekly', 'monthly', 'yearly'];

const MaintenanceTaskScheduler = () => {
  const { currentHome } = useHome();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState([]);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    dueDate: '',
    frequency: 'one-time',
    systemId: '',
    status: 'pending'
  });

  const fetchData = async () => {
    if (!currentHome) return;
    setLoading(true);
    try {
      const [tasksRes, systemsRes] = await Promise.all([
        pb.collection('maintenance_tasks').getFullList({
          filter: `homeId="${currentHome.id}"`,
          expand: 'systemId',
          sort: 'dueDate',
          $autoCancel: false
        }),
        pb.collection('maintenance_systems').getFullList({
          filter: `homeId="${currentHome.id}"`,
          $autoCancel: false
        })
      ]);
      setTasks(tasksRes);
      setSystems(systemsRes);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({ title: "Error", description: "Failed to load tasks.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentHome]);

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        taskName: task.taskName,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        frequency: task.frequency || 'one-time',
        systemId: task.systemId || 'none',
        status: task.status || 'pending'
      });
    } else {
      setEditingTask(null);
      setFormData({
        taskName: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        frequency: 'one-time',
        systemId: 'none',
        status: 'pending'
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
        systemId: formData.systemId === 'none' ? '' : formData.systemId,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (editingTask) {
        await pb.collection('maintenance_tasks').update(editingTask.id, dataToSave, { $autoCancel: false });
        toast({ title: "Success", description: "Task updated." });
      } else {
        await pb.collection('maintenance_tasks').create(dataToSave, { $autoCancel: false });
        toast({ title: "Success", description: "Task created." });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({ title: "Error", description: "Failed to save task.", variant: "destructive" });
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      const status = isCompleted ? 'completed' : 'pending';
      const completionDate = isCompleted ? new Date().toISOString() : '';
      
      await pb.collection('maintenance_tasks').update(taskId, { 
        status, 
        completionDate 
      }, { $autoCancel: false });
      
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status, completionDate } : t));
      
      if (isCompleted) {
        toast({ title: "Task Completed", description: "Great job!" });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks found</h3>
          <p className="text-slate-500 mb-4">Create a maintenance task to keep your home in top shape.</p>
          <Button variant="outline" onClick={() => handleOpenDialog()}>Create Task</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <MaintenanceTaskCard 
              key={task.id} 
              task={task} 
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenDialog}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input 
                id="taskName" 
                required 
                value={formData.taskName}
                onChange={(e) => setFormData({...formData, taskName: e.target.value})}
                placeholder="e.g., Change AC Filter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(val) => setFormData({...formData, frequency: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(f => (
                      <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemId">Related System</Label>
              <Select 
                value={formData.systemId} 
                onValueChange={(val) => setFormData({...formData, systemId: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (General Task)</SelectItem>
                  {systems.map(sys => (
                    <SelectItem key={sys.id} value={sys.id}>{sys.systemName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceTaskScheduler;