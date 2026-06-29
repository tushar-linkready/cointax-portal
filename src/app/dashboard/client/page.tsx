'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, Loader, CheckCircle, PlusCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getDemoUser } from '@/lib/auth';
import { getEnrichedTasks, mockClients } from '@/lib/mock-data';
import type { Profile, Task } from '@/lib/types';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'client') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Find the client record linked to this user
    const client = mockClients.find(
      (c) => c.email === currentUser.email && c.firm_id === currentUser.firm_id
    );
    if (!client) return;

    const allTasks = getEnrichedTasks(currentUser.firm_id ?? undefined);
    const clientTasks = allTasks.filter((t) => t.client_id === client.id);
    setTasks(clientTasks);
  }, [router]);

  const totalTasks = tasks.length;
  const inProgressCount = useMemo(
    () => tasks.filter((t) => t.status === 'in_progress').length,
    [tasks]
  );
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'completed').length,
    [tasks]
  );

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.full_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Your task overview</p>
          </div>
          <Link href="/dashboard/client/tasks/new">
            <Button variant="primary" size="md">
              <PlusCircle className="h-4 w-4" />
              Raise New Request
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Tasks"
            value={totalTasks}
            icon={ClipboardList}
            color="#1e3a5f"
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            icon={Loader}
            color="#0d9488"
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle}
            color="#16a34a"
          />
        </div>

        {/* Task List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Tasks
          </h2>
          {tasks.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                No tasks yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You don&apos;t have any tasks. Raise a new request to get
                started.
              </p>
              <Link href="/dashboard/client/tasks/new" className="mt-4 inline-block">
                <Button variant="primary" size="sm">
                  <PlusCircle className="h-4 w-4" />
                  Raise New Request
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={(t) => setSelectedTask(t)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal (read-only, no status change for clients) */}
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
