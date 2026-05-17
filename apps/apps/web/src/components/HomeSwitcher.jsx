import React, { useState } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import { Home, Plus, ChevronDown, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';
import PropertyFormModal from '@/components/PropertyFormModal.jsx';

const HomeSwitcher = () => {
  const { homes, selectedHome, switchHome, addHome, refreshHomes } = useHome();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeType, setNewHomeType] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddHome = async (e) => {
    e.preventDefault();
    if (!newHomeName.trim()) return;

    setIsSubmitting(true);
    try {
      await addHome({ name: newHomeName, propertyType: newHomeType });
      toast({ title: 'Success', description: 'Home added successfully' });
      setIsAddDialogOpen(false);
      setNewHomeName('');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add home', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePropertyCreated = async (newProperty) => {
    await refreshHomes();
    // If the new property is compatible with the homes list, we can switch to it.
    // Since the prompt asks to select the newly created property, we pass it to switchHome.
    switchHome(newProperty);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-between bg-white border-slate-200">
            <div className="flex items-center gap-2 truncate">
              <Home className="w-4 h-4 text-blue-600" />
              <span className="truncate font-medium">
                {selectedHome ? (selectedHome.name || selectedHome.address) : 'Select a Property'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]">
          <DropdownMenuLabel>Your Portfolio</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {homes.map((home) => (
            <DropdownMenuItem
              key={home.id}
              onClick={() => switchHome(home)}
              className={`cursor-pointer ${selectedHome?.id === home.id ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Building className="w-4 h-4 mr-2 opacity-70" />
              <div className="flex flex-col">
                <span>{home.name || home.address || 'Unnamed Property'}</span>
                <span className="text-xs opacity-70 capitalize">{home.propertyType || 'Property'}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer text-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add New Home
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPropertyModalOpen(true)} className="cursor-pointer text-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Add your first property
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Home</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddHome} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="homeName">Home Name</Label>
              <Input
                id="homeName"
                placeholder="e.g., Primary Residence, Beach House"
                value={newHomeName}
                onChange={(e) => setNewHomeName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homeType">Property Type</Label>
              <select
                id="homeType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newHomeType}
                onChange={(e) => setNewHomeType(e.target.value)}
              >
                <option value="personal">Personal</option>
                <option value="vacation">Vacation</option>
                <option value="rental">Rental</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Home'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <PropertyFormModal 
        isOpen={isPropertyModalOpen} 
        onClose={() => setIsPropertyModalOpen(false)} 
        onSuccess={handlePropertyCreated} 
      />
    </>
  );
};

export default HomeSwitcher;