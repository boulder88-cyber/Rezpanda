import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const LeaseManagementPanel = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeases = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('rental_properties').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}" && leaseEndDate != ""`,
          sort: 'leaseEndDate',
          $autoCancel: false
        });
        setLeases(records.items);
      } catch (error) {
        console.error("Error fetching leases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeases();
  }, [currentUser]);

  const getDaysUntil = (dateString) => {
    if (!dateString) return 999;
    const diff = new Date(dateString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleRenew = () => {
    toast({ title: "Renew Lease", description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <div className="space-y-4">
      {loading ? (
        [1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
      ) : leases.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No active leases found.</div>
      ) : (
        leases.map(lease => {
          const daysLeft = getDaysUntil(lease.leaseEndDate);
          const isExpiringSoon = daysLeft <= 60;

          return (
            <Card key={lease.id} className={`border-l-4 ${isExpiringSoon ? 'border-l-amber-500' : 'border-l-green-500'}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">{lease.tenantName}</h4>
                    {isExpiringSoon && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Expiring in {daysLeft} days
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Ends: {new Date(lease.leaseEndDate).toLocaleDateString()}</span>
                    <span>Rent: ${lease.monthlyRent}/mo</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleRenew}>View Details</Button>
                  <Button className="flex-1 sm:flex-none" onClick={handleRenew}>Renew Lease</Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default LeaseManagementPanel;