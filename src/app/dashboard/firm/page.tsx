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
import { getDemoUser } from '@/lib/auth';
import { mockClients, getEnrichedTasks } from '@/lib/mock-data';
import { isOverdue } from '@/lib/utils';
import type { Profile, Task } from '@/lib/types';

export default function FirmDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const firmId = currentUser.firm_id;
    const firmTasks = getEnrichedTasks(firmId ?? undefined);
    setTasks(firmTasks);

    const firmClients = mockClients.filter((c) => c.firm_id === firmId);
    setClientCount(firmClients.length);
  }, [router]);

  if (!user) {
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
            {user.full_name}&apos;s Firm Overview
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clients"
            value={clientCount}
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
