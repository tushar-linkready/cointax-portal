'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ClipboardList, Clock, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentTasks } from '@/components/dashboard/RecentTasks';
import { TaskChart } from '@/components/dashboard/TaskChart';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { getFirmDashboardStats, getTasks } from '@/lib/services';
import { isOverdue } from '@/lib/utils';
import type { Task } from '@/lib/types';

export default function FirmDashboardPage() {
  const router = useRouter();
  const { profile, loading, firmId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    pendingApprovals: 0,
    inProgress: 0,
    overdue: 0,
    completedThisMonth: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    paidThisMonth: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [dashStats, firmTasks] = await Promise.all([
          getFirmDashboardStats(firmId!),
          getTasks(firmId!),
        ]);
        setStats(dashStats);
        setTasks(firmTasks);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [profile, loading, firmId, router]);

  if (loading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return null;
  }

  const openTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'on_hold'
  );
  const pendingApprovals = tasks.filter(
    (t) => t.status === 'pending_approval'
  );
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.due_date && isOverdue(t.due_date)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile.full_name}&apos;s Firm Overview
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="text-teal-600"
          />
          <StatsCard
            title="Open Tasks"
            value={openTasks.length}
            icon={ClipboardList}
            color="text-navy-600"
          />
          <StatsCard
            title="Pending Approvals"
            value={pendingApprovals.length}
            icon={Clock}
            color="text-amber-600"
          />
          <StatsCard
            title="Overdue Tasks"
            value={overdueTasks.length}
            icon={AlertTriangle}
            color="text-red-600"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2">
            <RecentTasks tasks={tasks} />
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-6">
            <TaskChart tasks={tasks} />

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-navy-900">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/firm/clients" className="block">
                  <Button variant="outline" className="w-full justify-center">
                    <Users className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </Link>
                <Link href="/dashboard/firm/tasks/new" className="block">
                  <Button variant="primary" className="w-full justify-center">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
