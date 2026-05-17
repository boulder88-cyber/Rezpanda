import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const FinancialOverview = () => {
  const [stats, setStats] = useState({
    totalRent: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const [payments, expenses] = await Promise.all([
        pb.collection('payments').getFullList({ $autoCancel: false }),
        pb.collection('expenses').getFullList({ $autoCancel: false }),
      ]);

      const totalRent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalRent - totalExpenses;

      setStats({ totalRent, totalExpenses, netProfit });
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Financial Overview - PropManager</title>
        <meta name="description" content="View financial overview and reports" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
              <p className="text-slate-600 mt-1">Track income, expenses, and profitability</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Total Rent Collected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">${stats.totalRent.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">${stats.totalExpenses.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${stats.netProfit.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialOverview;