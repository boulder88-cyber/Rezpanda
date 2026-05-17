import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Calendar as CalendarIcon, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const InspectionHistoryScheduler = () => {
  const { toast } = useToast();

  const handleSchedule = () => {
    toast({ title: "Schedule Inspection", description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" /> Recent Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            No recent inspections found.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Schedule New
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Plan your next property inspection to ensure everything is in top condition.</p>
          <Button className="w-full" onClick={handleSchedule}>Schedule Inspection</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InspectionHistoryScheduler;