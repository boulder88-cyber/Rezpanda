import React from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Wrench, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const RepairImprovementLog = () => {
  const { toast } = useToast();

  const handleAdd = () => {
    toast({ title: "Add Repair Log", description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Repairs & Improvements</h3>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Log Repair
        </Button>
      </div>

      <Card>
        <CardContent className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">No repair logs yet</h4>
          <p className="text-slate-500 max-w-md">Keep track of all maintenance, repairs, and property improvements to maintain your asset's value history.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairImprovementLog;