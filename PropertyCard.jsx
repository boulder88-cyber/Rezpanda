import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Zap, Droplet, Flame, Wifi } from 'lucide-react';

const UtilityTrackingAnalysis = () => {
  const { currentUser } = useAuth();
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUtilities = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('utilities').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          $autoCancel: false
        });
        setUtilities(records.items);
      } catch (error) {
        console.error("Error fetching utilities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUtilities();
  }, [currentUser]);

  const getIcon = (type) => {
    switch(type) {
      case 'electric': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'water': return <Droplet className="w-5 h-5 text-blue-500" />;
      case 'gas': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'internet': return <Wifi className="w-5 h-5 text-slate-500" />;
      default: return <Zap className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : utilities.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500">No utilities tracked yet.</div>
        ) : (
          utilities.map(utility => (
            <Card key={utility.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  {getIcon(utility.utilityType)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 capitalize">{utility.utilityType || 'Utility'}</p>
                  <p className="text-lg font-bold text-slate-900">${utility.lastBillAmount || 0}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Placeholder for Chart */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Utility Costs Trend (Last 12 Months)</h4>
          <div className="h-64 w-full bg-slate-50 rounded-lg border border-dashed flex items-center justify-center text-slate-400">
            Chart Visualization Area
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UtilityTrackingAnalysis;