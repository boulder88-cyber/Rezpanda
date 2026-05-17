import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Building2, Loader2 } from 'lucide-react';

const AccountSelector = ({ selectedAccount, onSelectAccount }) => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!currentUser) return;
      try {
        setIsLoading(true);
        const records = await pb.collection('homes').getFullList({
          filter: `ownerId="${currentUser.id}"`,
          sort: 'name',
          $autoCancel: false
        });
        setAccounts(records);
        
        // Auto-select first account if none selected
        if (records.length > 0 && !selectedAccount) {
          onSelectAccount(records[0].id);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [currentUser, selectedAccount, onSelectAccount]);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="bg-primary/10 p-2 rounded-lg">
        <Building2 className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Payment Account / Property</p>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : (
          <Select value={selectedAccount || ''} onValueChange={onSelectAccount}>
            <SelectTrigger className="h-8 border-0 p-0 focus:ring-0 shadow-none font-semibold text-slate-900 dark:text-slate-100 bg-transparent">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.length === 0 ? (
                <SelectItem value="none" disabled>No properties found</SelectItem>
              ) : (
                accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} {acc.address ? `(${acc.address})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default AccountSelector;