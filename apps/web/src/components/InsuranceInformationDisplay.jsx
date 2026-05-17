import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const InsuranceInformationDisplay = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({ title: "Manage Insurance", description: "🚧 This feature isn't implemented yet!" });
  };

  // Mock data since no collection exists
  const policies = [
    { id: 1, type: 'Homeowners', provider: 'State Farm', coverage: 500000, premium: 1200, status: 'active' },
    { id: 2, type: 'Landlord', provider: 'Geico', coverage: 750000, premium: 1800, status: 'expiring' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {policies.map(policy => (
        <Card key={policy.id} className={policy.status === 'expiring' ? 'border-amber-200 shadow-amber-100/50' : ''}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className={`w-5 h-5 ${policy.status === 'expiring' ? 'text-amber-500' : 'text-blue-500'}`} />
              {policy.type} Insurance
            </CardTitle>
            {policy.status === 'expiring' && <AlertCircle className="w-5 h-5 text-amber-500" />}
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-slate-500">Provider:</span> <span className="font-medium">{policy.provider}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Coverage:</span> <span className="font-medium">${policy.coverage.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Premium:</span> <span className="font-medium">${policy.premium}/yr</span></div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleAction}>View Policy Details</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InsuranceInformationDisplay;