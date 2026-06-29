'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getDemoUser } from '@/lib/auth';
import { mockClients, mockCategories, mockProfiles } from '@/lib/mock-data';
import type { Profile, Client, TaskCategory } from '@/lib/types';
import type { TaskFormData } from '@/components/tasks/TaskForm';

export default function NewTaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [firmClients, setFirmClients] = useState<Client[]>([]);
  const [firmCategories, setFirmCategories] = useState<TaskCategory[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const currentUser = getDemoUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const firmId = currentUser.firm_id;

    const clients = mockClients.filter((c) => c.firm_id === firmId);
    setFirmClients(clients);

    const categories = mockCategories.filter(
      (cat) => cat.firm_id === firmId || cat.is_preset
    );
    setFirmCategories(categories);

    const members = mockProfiles.filter(
      (p) => p.firm_id === firmId && p.role === 'team_member'
    );
    setTeamMembers(members);
  }, [router]);

  const handleSubmit = (data: TaskFormData) => {
    // In a real app, this would POST to an API
    console.log('New task data:', data);
    setSubmitted(true);
  };

  if (!user) {
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
