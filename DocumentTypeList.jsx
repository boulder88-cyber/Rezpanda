import React from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const PropertyComparisonTool = () => {
  const { toast } = useToast();

  const handleCompare = () => {
    toast({ title: "Compare Properties", description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <Card>
      <CardContent className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ArrowLeftRight className="w-8 h-8 text-slate-400" />
        </div>
        <h4 className="text-lg font-medium text-slate-900 mb-2">Compare Properties Side-by-Side</h4>
        <p className="text-slate-500 max-w-md mb-6">Select up to 3 properties to compare their performance, expenses, and ROI metrics.</p>
        <Button onClick={handleCompare}>Select Properties to Compare</Button>
      </CardContent>
    </Card>
  );
};

export default PropertyComparisonTool;