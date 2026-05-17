import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Building, Wrench, CreditCard, Loader2 } from 'lucide-react';

const DashboardOverview = ({ selectedPropertyId }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ properties: 0, maintenance: 0, bills: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      try {
        setIsLoading(true);
        
        // Fetch total properties
        const props = await pb.collection('properties').getList(1, 1, {
          filter: `ownerId="${currentUser.id}"`,
          $autoCancel: false
        });

        // Fetch pending maintenance
        const maint = await pb.collection('maintenance').getList(1, 1, {
          filter: `ownerId="${currentUser.id}" && status="pending"`,
          $autoCancel: false
        });

        // Fetch pending bills
        const bills = await pb.collection('bills').getList(1, 1, {
          filter: `ownerId="${currentUser.id}" && paymentStatus="pending"`,
          $autoCancel: false
        });

        setStats({
          properties: props.totalItems,
          maintenance: maint.totalItems,
          bills: bills.totalItems
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, selectedPropertyId]);

  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl mb-10">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a?q=80&w=2070&auto=format&fit=crop" 
          alt="Modern architecture" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
      </div>

      <div className="relative z-10 p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight text-white">
            Welcome back, {firstName}.
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
            Here's what's happening with your properties today. Manage everything from one centralized hub.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-300 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Loading stats...</span>
            </div>
          ) : (
            <>
              <StatBadge icon={Building} label="Properties" value={stats.properties} color="text-blue-400" />
              <StatBadge icon={Wrench} label="Pending Fixes" value={stats.maintenance} color="text-amber-400" />
              <StatBadge icon={CreditCard} label="Bills Due" value={stats.bills} color="text-rose-400" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="glass-panel px-5 py-4 rounded-2xl flex items-center gap-4 min-w-[160px] transition-interactive hover:bg-white/20">
    <div className={`p-2.5 rounded-xl bg-white/10 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export default DashboardOverview;