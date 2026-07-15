'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, PlusCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getClientTasks } from '@/lib/services';
import { STATUS_CONFIG, ALL_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/lib/types';

export default function ClientTasksPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    if (loading) return;
    if (!profile) { router.push('/login'); return; }
    if (profile.role !== 'client') { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .eq('email', profile.email)
          .limit(1);
        const client = clients?.[0];
        if (!client) return;

        const clientTasks = await getClientTasks(client.id);
        setTasks(clientTasks);
      } catch (err) {
        console.error('Error fetching client tasks:', err);
      }
    };
    fetchData();
  }, [profile, loading, router]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  // Count tasks per status for the filter tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.length };
    ALL_STATUSES.forEach((s) => {
      counts[s] = tasks.filter((t) => t.status === s).length;
    });
    return counts;
  }, [tasks]);

  if (loading || !profile) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && (
                <span>
                  {' '}
                  &middot; Filtered by{' '}
                  <span className="font-medium">
                    {STATUS_CONFIG[statusFilter].label}
                  </span>
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard/client/tasks/new">
            <Button variant="primary" size="md">
              <PlusCircle className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === 'all'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All ({statusCounts.all})
          </button>
          {ALL_STATUSES.map((status) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  statusFilter === status
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {STATUS_CONFIG[status].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No tasks found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'all'
                ? "You don't have any tasks yet. Raise a new request to get started."
                : `No tasks with status "${STATUS_CONFIG[statusFilter].label}".`}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-3 text-sm font-medium text-[#0d9488] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={(t) => setSelectedTask(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal (read-only) */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
        size="lg"
      >
        {selectedTask && (
          <div className="max-h-[70vh] overflow-y-auto">
            <TaskDetail task={selectedTask} />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
