import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';

const PaymentTracker = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const records = await pb.collection('tenants').getFullList({ sort: '-created', $autoCancel: false });
      setTenants(records);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    if (filter === 'all') return true;
    return tenant.paymentStatus === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Tracker - PropManager</title>
        <meta name="description" content="Track tenant payment statuses" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Payment Tracker</h1>
              <p className="text-slate-600 mt-1">Monitor tenant payment statuses</p>
            </div>

            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-slate-500">No tenants found with this payment status</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant) => (
                      <Card key={tenant.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600">{tenant.email}</p>
                            <p className="text-xl font-bold text-slate-900">
                              ${tenant.monthlyRent.toLocaleString()}/mo
                            </p>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(tenant.paymentStatus)}`}>
                              {tenant.paymentStatus}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentTracker;