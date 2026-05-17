import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Settings, Calendar, Wrench, Trash2, Edit, ChevronRight, Zap } from 'lucide-react';

const MaintenanceSystemCard = ({ system, onEdit, onDelete, onViewDetails }) => {
  const getSystemIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hvac': return <Settings className="w-5 h-5 text-blue-500" />;
      case 'plumbing': return <Wrench className="w-5 h-5 text-cyan-500" />;
      case 'electrical': return <Zap className="w-5 h-5 text-yellow-500" />;
      default: return <Settings className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isServiceOverdue = system.nextServiceDate && new Date(system.nextServiceDate) < new Date();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {getSystemIcon(system.systemType)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {system.systemName}
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {system.systemType || 'General System'}
              </p>
            </div>
          </div>
          {isServiceOverdue && (
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
              Service Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-6 flex-grow">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Last Service
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {formatDate(system.lastServiceDate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Next Service
            </span>
            <span className={`font-medium ${isServiceOverdue ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {formatDate(system.nextServiceDate)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2 mt-auto">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(system)} className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(system.id)} className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onViewDetails(system)} className="text-xs font-medium">
          Details <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MaintenanceSystemCard;