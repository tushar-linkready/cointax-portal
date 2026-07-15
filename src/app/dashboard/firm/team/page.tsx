'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { getProfiles, getTasks } from '@/lib/services';
import { getInitials } from '@/lib/utils';
import type { Profile, Task } from '@/lib/types';
import { Plus, UserCog, Mail, Phone, ClipboardList } from 'lucide-react';

const ROLE_BADGE_VARIANT: Record<string, 'primary' | 'secondary' | 'default'> = {
  firm_admin: 'primary',
  team_member: 'secondary',
};

const ROLE_LABELS: Record<string, string> = {
  firm_admin: 'Firm Admin',
  team_member: 'Team Member',
};

export default function TeamPage() {
  const router = useRouter();
  const { profile, loading, firmId } = useAuth();
  const [team, setTeam] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [profiles, firmTasks] = await Promise.all([
          getProfiles(firmId!),
          getTasks(firmId!),
        ]);
        const firmTeam = profiles.filter(
          (p) => p.role === 'team_member' || p.role === 'firm_admin'
        );
        setTeam(firmTeam);
        setTasks(firmTasks);
      } catch (err) {
        console.error('Failed to load team data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [profile, loading, firmId, router]);

  const getTaskCount = (userId: string) => {
    return tasks.filter(
      (t) => t.assignee_id === userId && t.status !== 'completed'
    ).length;
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    // Note: actual invite flow would send an invitation email via backend
    const newMember: Profile = {
      id: `user-${Date.now()}`,
      firm_id: firmId ?? null,
      full_name: formName.trim(),
      email: formEmail.trim(),
      role: 'team_member',
      avatar_url: null,
      phone: formPhone.trim() || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTeam((prev) => [...prev, newMember]);
    resetForm();
    setIsModalOpen(false);
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

  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Team Members</h1>
            <p className="mt-1 text-sm text-gray-500">
              {team.length} member{team.length !== 1 ? 's' : ''} in your firm
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Team Grid */}
        {team.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <UserCog className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="font-medium text-gray-500">No team members yet</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Invite your first team member to get started
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => {
              const taskCount = getTaskCount(member.id);
              return (
                <Card key={member.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white font-semibold text-sm">
                        {getInitials(member.full_name)}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {member.full_name}
                          </h3>
                          <Badge
                            variant={ROLE_BADGE_VARIANT[member.role] ?? 'default'}
                          >
                            {ROLE_LABELS[member.role] ?? member.role}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              {taskCount} active task{taskCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Badge variant={member.is_active ? 'success' : 'danger'}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { resetForm(); setIsModalOpen(false); }}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Verma"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="e.g. rahul@sharmaassociates.in"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />
          <Input
            label="Role"
            value="Team Member"
            disabled
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetForm(); setIsModalOpen(false); }}
            >
              Cancel
            </Button>
            <Button type="submit">Send Invite</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
