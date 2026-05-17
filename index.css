import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { PieChart, Receipt } from 'lucide-react';

const ExpenseBreakdownAnalysis = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('expenses').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-expenseDate',
          $autoCancel: false
        });
        setExpenses(records.items);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [currentUser]);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-rose-50 border-rose-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Receipt className="w-5 h-5" /></div>
              <h4 className="font-medium text-rose-900">Total Expenses</h4>
            </div>
            <p className="text-3xl font-bold text-rose-700">${totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" /> Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : expenses.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No expense records found.</p>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 capitalize">{expense.category}</p>
                    <p className="text-xs text-slate-500">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">-${expense.amount}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{expense.description}</p>
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

export default ExpenseBreakdownAnalysis;