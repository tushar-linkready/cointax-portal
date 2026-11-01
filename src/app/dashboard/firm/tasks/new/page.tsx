'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { getClients, getCategories, getProfiles, createTask, createNotification } from '@/lib/services';
import type { Client, TaskCategory, Profile } from '@/lib/types';
import type { TaskFormData } from '@/components/tasks/TaskForm';

export default function NewTaskPage() {
  const router = useRouter();
  const { profile, loading, firmId } = useAuth();
  const { showToast } = useToast();
  const [firmClients, setFirmClients] = useState<Client[]>([]);
  const [firmCategories, setFirmCategories] = useState<TaskCategory[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/login');
      return;
    }
    if (profile.role === 'client') {
      window.location.href = '/dashboard/client';
      return;
    }

    const loadData = async () => {
      try {
        const [clients, categories, profiles] = await Promise.all([
          getClients(firmId!),
          getCategories(firmId!),
          getProfiles(firmId!),
        ]);
        setFirmClients(clients);
        setFirmCategories(categories);
        setTeamMembers(profiles.filter((p) => p.role === 'team_member'));
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [profile, loading, firmId, router]);

  const handleSubmit = async (data: TaskFormData) => {
    try {
      const newTask = await createTask({
        firm_id: firmId!,
        client_id: data.client_id,
        category_id: data.category_id || null,
        title: data.title,
        description: data.description || null,
        status: data.assignee_id ? 'assigned' : 'pending_approval',
        priority: data.priority,
        assignee_id: data.assignee_id || null,
        created_by: profile!.id,
        due_date: data.due_date || null,
      });

      // Notify the assignee if one was selected
      if (data.assignee_id && data.assignee_id !== profile!.id) {
        createNotification({
          user_id: data.assignee_id,
          firm_id: firmId,
          title: 'New task assigned to you',
          message: `"${data.title}" has been assigned to you by ${profile!.full_name}.`,
          link: `/dashboard/firm/tasks`,
        }).catch(console.error);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to create task:', err);
      showToast('Failed to create task. Please try again.', 'error');
    }
  };

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

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                Task Created Successfully
              </h2>
              <p className="text-gray-500 mb-6">
                Your new task has been created and assigned.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/dashboard/firm/tasks">
                  <Button variant="primary">View All Tasks</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/firm/tasks">
            <Button variant="ghost" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Create New Task
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details to create a new task
            </p>
          </div>
        </div>

        {/* Task Form */}
        <div className="max-w-3xl">
          <TaskForm
            clients={firmClients}
            categories={firmCategories}
            teamMembers={teamMembers}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
