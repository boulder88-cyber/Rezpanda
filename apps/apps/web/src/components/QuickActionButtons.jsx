import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Calendar, Wrench, Upload, UserPlus, DollarSign, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const QuickActionButtons = () => {
  const { toast } = useToast();

  const handleAction = (action) => {
    toast({
      title: action,
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const actions = [
    { label: 'Schedule Inspection', icon: Calendar, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'Request Maintenance', icon: Wrench, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
    { label: 'Upload Documents', icon: Upload, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Add Tenant', icon: UserPlus, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { label: 'Record Payment', icon: DollarSign, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
    { label: 'Log Expense', icon: Receipt, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <Button
            key={idx}
            variant="ghost"
            className={`h-auto py-4 flex flex-col items-center justify-center gap-2 rounded-xl transition-all ${action.color}`}
            onClick={() => handleAction(action.label)}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium text-center whitespace-normal leading-tight">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActionButtons;