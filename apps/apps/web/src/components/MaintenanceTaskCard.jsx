import React from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const MaintenanceTaskCard = ({ task, onToggleComplete, onEdit }) => {
  const isCompleted = task.status === 'completed';
  
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let StatusIcon = Clock;
  
  if (isCompleted) {
    statusColor = 'bg-green-50 text-green-700 border-green-200';
    StatusIcon = CheckCircle2;
  } else if (diffDays < 0) {
    statusColor = 'bg-red-50 text-red-700 border-red-200';
    StatusIcon = AlertCircle;
  } else if (diffDays <= 7) {
    statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'opacity-75 bg-slate-50/50' : 'bg-white'}`}>
      <CardContent className="p-4 flex items-start gap-4">
        <div className="pt-1">
          <Checkbox 
            checked={isCompleted} 
            onCheckedChange={(checked) => onToggleComplete(task.id, checked)}
            className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
        </div>
        
        <div className="flex-grow min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-medium truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
              {task.taskName}
            </h4>
            <Badge variant="outline" className={`shrink-0 flex items-center gap-1 ${statusColor}`}>
              <StatusIcon className="w-3 h-3" />
              {isCompleted ? 'Done' : diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `In ${diffDays}d`}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-sm text-slate-500 line-clamp-1 mb-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
            {task.expand?.systemId && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md">
                {task.expand.systemId.systemName}
              </span>
            )}
            {task.frequency && task.frequency !== 'one-time' && (
              <span className="capitalize px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                {task.frequency}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceTaskCard;