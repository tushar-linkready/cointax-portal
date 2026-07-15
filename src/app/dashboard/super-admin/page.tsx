'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth';
import { getSuperAdminStats, getFirms, getAllTasks, getAllClients } from '@/lib/services';
import { formatCurrency } from '@/lib/utils';
import { Building2, CheckCircle, IndianRupee, Users } from 'lucide-react';
import type { Firm, Task, Client } from '@/lib/types';

const PLAN_PRICES: Record<string, number> = {
  starter: 499,
  pro: 999,
  enterprise: 2499,
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState({ totalFirms: 0, activeFirms: 0, totalRevenue: 0, totalUsers: 0 });
  const [firms, setFirms] = useState<Firm[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!profile) { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        const [adminStats, firmsData, tasksData, clientsData] = await Promise.all([
          getSuperAdminStats(),
          getFirms(),
          getAllTasks(),
          getAllClients(),
        ]);

        const totalRevenue = firmsData
          .filter((f) => f.is_active)
          .reduce((sum, f) => sum + (PLAN_PRICES[f.plan] || 0), 0);

        setStats({
          totalFirms: adminStats.totalFirms,
          activeFirms: adminStats.activeFirms,
          totalRevenue,
          totalUsers: adminStats.totalUsers,
        });
        setFirms(firmsData);
        setTasks(tasksData);
        setClients(clientsData);
      } catch (err) {
        console.error('Error fetching super admin data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [profile, loading, router]);

  const taskSummary = (() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending_approval').length;
    const overdue = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;
    return { total, completed, inProgress, pending, overdue };
  })();

  if (loading || !profile) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of all firms, users, and platform activity.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Firms"
            value={stats.totalFirms}
            icon={Building2}
            color="#1e3a5f"
            change={`${stats.totalFirms} registered`}
          />
          <StatsCard
            title="Active Firms"
            value={stats.activeFirms}
            icon={CheckCircle}
            color="#0d9488"
            change={stats.totalFirms > 0 ? `${Math.round((stats.activeFirms / stats.totalFirms) * 100)}% active` : '0% active'}
            trend="up"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={IndianRupee}
            color="#1e3a5f"
            change="Monthly recurring"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="#0d9488"
            change="Across all firms"
          />
        </div>

        {/* Two-column layout: Firms list + Task summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Firms */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Registered Firms</h2>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              {firms.map((firm) => (
                  <div key={firm.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{firm.name}</p>
                      <p className="text-sm text-gray-500">{firm.email}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <Badge variant={firm.plan === 'pro' ? 'primary' : firm.plan === 'enterprise' ? 'secondary' : 'default'}>
                        {firm.plan.charAt(0).toUpperCase() + firm.plan.slice(1)}
                      </Badge>
                      <Badge variant={firm.is_active ? 'success' : 'danger'}>
                        {firm.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
              ))}
              {firms.length === 0 && !dataLoading && (
                <p className="py-4 text-center text-sm text-gray-500">No firms registered yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Task Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Tasks Overview (All Firms)</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Total Tasks', value: taskSummary.total, variant: 'primary' as const },
                { label: 'In Progress', value: taskSummary.inProgress, variant: 'info' as const },
                { label: 'Pending Approval', value: taskSummary.pending, variant: 'warning' as const },
                { label: 'Completed', value: taskSummary.completed, variant: 'success' as const },
                { label: 'Overdue', value: taskSummary.overdue, variant: 'danger' as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <Badge variant={item.variant}>{item.value}</Badge>
                </div>
              ))}

              {/* Per-firm breakdown */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-3 text-sm font-medium text-gray-700">Per-Firm Breakdown</p>
                {firms.map((firm) => {
                  const firmTaskCount = tasks.filter((t) => t.firm_id === firm.id).length;
                  const firmCompleted = tasks.filter(
                    (t) => t.firm_id === firm.id && t.status === 'completed'
                  ).length;
                  return (
                    <div key={firm.id} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-600">{firm.name}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {firmCompleted}/{firmTaskCount} done
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
