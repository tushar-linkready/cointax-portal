'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { mockFirms, mockClients } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';
import { Firm, FirmPlan } from '@/lib/types';
import { Plus, Search } from 'lucide-react';

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const PLAN_BADGE_VARIANT: Record<FirmPlan, 'default' | 'primary' | 'secondary'> = {
  starter: 'default',
  pro: 'primary',
  enterprise: 'secondary',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function FirmsPage() {
  const [firms, setFirms] = useState<Firm[]>([...mockFirms]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPlan, setFormPlan] = useState<FirmPlan>('starter');

  const filteredFirms = useMemo(() => {
    if (!searchQuery.trim()) return firms;
    const q = searchQuery.toLowerCase();
    return firms.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.plan.toLowerCase().includes(q)
    );
  }, [firms, searchQuery]);

  const getClientCount = (firmId: string) => {
    return mockClients.filter((c) => c.firm_id === firmId).length;
  };

  const handleToggleStatus = (firmId: string) => {
    setFirms((prev) =>
      prev.map((f) => (f.id === firmId ? { ...f, is_active: !f.is_active } : f))
    );
  };

  const handleAddFirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const newFirm: Firm = {
      id: `firm-${Date.now()}`,
      name: formName.trim(),
      slug: slugify(formName),
      email: formEmail.trim(),
      phone: formPhone.trim() || null,
      plan: formPlan,
      is_active: true,
      logo_url: null,
      address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setFirms((prev) => [newFirm, ...prev]);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPlan('starter');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Firms</h1>
            <p className="mt-1 text-sm text-gray-500">
              View, add, and manage all registered firms on the platform.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Firm
          </Button>
        </div>

        {/* Search / Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search firms by name, email, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>

        {/* Firms Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clients</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFirms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                  No firms found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFirms.map((firm) => (
                <TableRow key={firm.id}>
                  <TableCell className="font-medium text-gray-900">{firm.name}</TableCell>
                  <TableCell>{firm.email}</TableCell>
                  <TableCell>
                    <Badge variant={PLAN_BADGE_VARIANT[firm.plan]}>
                      {firm.plan.charAt(0).toUpperCase() + firm.plan.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(firm.id)}
                      className="focus:outline-none"
                      title="Click to toggle status"
                    >
                      <Badge variant={firm.is_active ? 'success' : 'danger'}>
                        {firm.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>{getClientCount(firm.id)}</TableCell>
                  <TableCell>{formatDate(firm.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(firm.id)}
                    >
                      {firm.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Firm Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Firm">
        <form onSubmit={handleAddFirm} className="space-y-4">
          <Input
            label="Firm Name"
            placeholder="e.g. Kumar & Associates"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="e.g. admin@kumarassociates.in"
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
          <Select
            label="Plan"
            options={PLAN_OPTIONS}
            value={formPlan}
            onChange={(e) => setFormPlan(e.target.value as FirmPlan)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Firm</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
