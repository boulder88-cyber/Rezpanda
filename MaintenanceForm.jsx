import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Filter } from 'lucide-react';

const MaintenanceRequestTracker = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('maintenance').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-dateLogged',
          $autoCancel: false
        });
        setRequests(records.items);
      } catch (error) {
        console.error("Error fetching maintenance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [currentUser]);

  const filteredRequests = filter === 'All' ? requests : requests.filter(r => r.status === filter.toLowerCase());

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['All', 'Pending', 'In-Progress', 'Completed'].map(f => (
          <Button 
            key={f} 
            variant={filter === f ? 'default' : 'outline'} 
            onClick={() => setFilter(f)}
            size="sm"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Logged</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">No maintenance requests found.</TableCell>
              </TableRow>
            ) : (
              filteredRequests.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.description}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(req.status)} variant="outline">
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(req.dateLogged).toLocaleDateString()}</TableCell>
                  <TableCell>{req.cost ? `$${req.cost}` : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MaintenanceRequestTracker;