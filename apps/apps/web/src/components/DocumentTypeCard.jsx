import React from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { cn } from '@/lib/utils.js';

const DocumentTypeCard = ({ type, icon, description, isSelected, onClick }) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/30 bg-white"
      )}
      onClick={() => onClick(type)}
    >
      <CardContent className="p-6 flex flex-col items-center text-center h-full">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
          isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">{type}</h3>
        <p className="text-sm text-slate-500 flex-grow">{description}</p>
      </CardContent>
    </Card>
  );
};

export default DocumentTypeCard;