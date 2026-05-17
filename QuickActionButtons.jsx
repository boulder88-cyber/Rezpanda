import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Activity, CheckCircle2, AlertCircle, Settings, Calendar } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useHome } from '@/contexts/HomeContext.jsx';

const MaintenanceDashboard = () => {
  const { currentHome } = useHome();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSystems: 0,
    pendingTasks: 0,
    completedThisMonth: 0,
    overdueTasks: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!currentHome) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Systems Count
        const systems = await pb.collection('maintenance_systems').getList(1, 1, {
          filter: `homeId="${currentHome.id}"`,
          $autoCancel: false
        });

        // Fetch Tasks
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const tasks = await pb.collection('maintenance_tasks').getFullList({
          filter: `homeId="${currentHome.id}"`,
          expand: 'systemId',
          sort: 'dueDate',
          $autoCancel: false
        });

        let pending = 0;
        let completedMonth = 0;
        let overdue = 0;
        const upcoming = [];
        const recent = [];

        tasks.forEach(task => {
          if (task.status === 'completed') {
            if (task.completionDate >= firstDayOfMonth) {
              completedMonth++;
            }
            recent.push({
              id: task.id,
              title: `Completed: ${task.taskName}`,
              date: task.completionDate || task.updated,
              type: 'task_completed'
            });
          } else {
            pending++;
            const dueDate = new Date(task.dueDate);
            if (dueDate < now) {
              overdue++;
            } else if (dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
              upcoming.push(task);
            }
          }
        });

        setStats({
          totalSystems: systems.totalItems,
          pendingTasks: pending,
          completedThisMonth: completedMonth,
          overdueTasks: overdue
        });

        setUpcomingTasks(upcoming.slice(0, 5));
        
        // Sort recent activity
        recent.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(recent.slice(0, 5));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentHome]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tracked Systems</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalSystems}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.overdueTasks}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed (Month)</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.completedThisMonth}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              Upcoming Tasks (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No tasks due in the next 7 days.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{task.taskName}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        {task.expand?.systemId?.systemName && (
                          <Badge variant="secondary" className="font-normal text-xs">
                            {task.expand.systemId.systemName}
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No recent activity recorded.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-green-50 text-green-600 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;