import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { CreditCard } from 'lucide-react';

const BillsPage = () => {
  return (
    <>
      <Helmet>
        <title>Bills - CasaCEO</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="text-slate-600">Track upcoming payments</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center flex flex-col items-center">
            <CreditCard className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Coming Soon</h3>
            <p className="text-slate-500 mt-1">Advanced bill tracking and reminders are under development.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BillsPage;