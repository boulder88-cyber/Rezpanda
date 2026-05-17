import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { DollarSign, TrendingUp } from 'lucide-react';

const RentalIncomeTracker = () => {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('payments').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-paymentDate',
          $autoCancel: false
        });
        setPayments(records.items);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [currentUser]);

  const totalIncome = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign className="w-5 h-5" /></div>
              <h4 className="font-medium text-emerald-900">Total Income</h4>
            </div>
            <p className="text-3xl font-bold text-emerald-700">${totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp className="w-5 h-5" /></div>
              <h4 className="font-medium text-slate-600">Monthly Average</h4>
            </div>
            <p className="text-3xl font-bold text-slate-900">${(totalIncome / (payments.length || 1)).toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : payments.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No payment records found.</p>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Payment Received</p>
                    <p className="text-xs text-slate-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+${payment.amount}</p>
                    <p className="text-xs text-slate-500 capitalize">{payment.paymentMethod || 'Transfer'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalIncomeTracker;