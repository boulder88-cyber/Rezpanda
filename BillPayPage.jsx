import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const FinancialReports = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsData, expensesData] = await Promise.all([
        pb.collection('payments').getFullList({ sort: '-paymentDate', $autoCancel: false }),
        pb.collection('expenses').getFullList({ sort: '-expenseDate', $autoCancel: false }),
      ]);
      setPayments(paymentsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyPayments = payments.filter((p) => {
      const date = new Date(p.paymentDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyExpenses = expenses.filter((e) => {
      const date = new Date(e.expenseDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return { totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
  };

  const handleExport = () => {
    toast({
      title: 'Export Feature',
      description: '🚧 Export functionality will be implemented in a future update! 🚀',
    });
  };

  const monthlyStats = calculateMonthlyStats();

  return (
    <>
      <Helmet>
        <title>Financial Reports - PropManager</title>
        <meta name="description" content="View detailed financial reports" />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
                <p className="text-slate-600 mt-1">Detailed profit/loss breakdown</p>
              </div>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Month Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">${monthlyStats.totalIncome.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">${monthlyStats.totalExpenses.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Net Profit</p>
                        <p
                          className={`text-2xl font-bold ${
                            monthlyStats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}
                        >
                          ${monthlyStats.netProfit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {payments.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No payments recorded</p>
                      ) : (
                        <div className="space-y-3">
                          {payments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-600">{payment.paymentMethod || 'Payment'}</p>
                              </div>
                              <p className="text-sm font-bold text-green-600">${payment.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {expenses.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No expenses recorded</p>
                      ) : (
                        <div className="space-y-3">
                          {expenses.slice(0, 5).map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {new Date(expense.expenseDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-600 capitalize">{expense.category}</p>
                              </div>
                              <p className="text-sm font-bold text-red-600">${expense.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialReports;