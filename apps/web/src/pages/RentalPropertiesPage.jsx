import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Building } from 'lucide-react';

const RentalPropertiesPage = () => {
  return (
    <>
      <Helmet>
        <title>Rental Properties - RezPanda</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rental Properties</h1>
          <p className="text-slate-600">Manage tenants and leases</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center flex flex-col items-center">
            <Building className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Coming Soon</h3>
            <p className="text-slate-500 mt-1">Advanced rental property management features are under development.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RentalPropertiesPage;