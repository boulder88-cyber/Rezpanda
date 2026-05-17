import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { UserPlus, Phone, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const TenantManagementSection = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('rental_properties').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          $autoCancel: false
        });
        setTenants(records.items);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, [currentUser]);

  const handleAddTenant = () => {
    toast({
      title: "Add Tenant",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Current Tenants</h3>
        <Button onClick={handleAddTenant}>
          <UserPlus className="w-4 h-4 mr-2" /> Add Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : tenants.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed">
            <p className="text-slate-500">No tenants found.</p>
          </div>
        ) : (
          tenants.map(tenant => (
            <Card key={tenant.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{tenant.tenantName}</CardTitle>
                  <Badge variant={tenant.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                    {tenant.paymentStatus || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> {tenant.tenantEmail || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> {tenant.tenantPhone || 'No phone'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> 
                  Lease: {tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toLocaleDateString() : 'N/A'} - {tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-medium text-slate-900">Rent: ${tenant.monthlyRent}/mo</span>
                  <Button variant="ghost" size="sm" onClick={() => handleAddTenant()}>Manage</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantManagementSection;