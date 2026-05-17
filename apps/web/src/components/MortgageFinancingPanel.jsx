import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Landmark, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const MortgageFinancingPanel = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({ title: "Mortgage Details", description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary" /> Mortgage Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
          <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="mb-4">Track your property financing, interest rates, and payoff progress.</p>
          <Button onClick={handleAction}>Add Mortgage Info</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageFinancingPanel;