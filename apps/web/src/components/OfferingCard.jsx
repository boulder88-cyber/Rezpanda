import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { ArrowUpRight } from 'lucide-react';

const OfferingCard = ({ title, description, icon: Icon, link, colorClass = "text-primary bg-primary/10" }) => {
  return (
    <Link to={link} className="block h-full outline-none focus-ring rounded-2xl">
      <Card className="group h-full overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 transition-interactive hover:shadow-xl hover:-translate-y-1 rounded-2xl">
        <CardContent className="p-6 flex flex-col h-full relative">
          <div className="absolute top-6 right-6 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-primary" />
          </div>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
            {title}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-auto">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default OfferingCard;