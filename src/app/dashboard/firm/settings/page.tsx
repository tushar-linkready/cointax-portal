'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';
import { getFirm, updateFirm } from '@/lib/services';
import type { Firm } from '@/lib/types';
import {
  Settings,
  Check,
  CreditCard,
  AlertTriangle,
  Zap,
  Shield,
  Users,
  ClipboardList,
  FolderOpen,
} from 'lucide-react';

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Up to 50 clients',
    'Up to 3 team members',
    'Basic task management',
    'Email support',
  ],
  pro: [
    'Up to 200 clients',
    'Up to 10 team members',
    'Advanced task management',
    'Priority support',
    'Custom categories',
    'Reports & analytics',
  ],
  enterprise: [
    'Unlimited clients',
    'Unlimited team members',
    'Full feature access',
    'Dedicated support',
    'Custom integrations',
    'White-label options',
    'API access',
  ],
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading, firmId } = useAuth();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const firmData = await getFirm(firmId!);
        if (firmData) {
          setFirm(firmData);
          setFormName(firmData.name);
          setFormEmail(firmData.email);
          setFormPhone(firmData.phone ?? '');
          setFormAddress(firmData.address ?? '');
        }
      } catch (err) {
        console.error('Failed to load firm data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [profile, loading, firmId, router]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firm) return;

    try {
      const updated = await updateFirm(firmId!, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || null,
        address: formAddress.trim() || null,
      });
      setFirm(updated);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleDeactivate = async () => {
    if (!firm) return;

    try {
      const updated = await updateFirm(firmId!, { is_active: false });
      setFirm(updated);
      setIsDeactivateModalOpen(false);
    } catch (err) {
      console.error('Failed to deactivate firm:', err);
      alert('Failed to deactivate firm. Please try again.');
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

  if (!profile || !firm) return null;

  const planFeatures = PLAN_FEATURES[firm.plan] ?? PLAN_FEATURES.starter;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Firm Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your firm&apos;s information and preferences
          </p>
        </div>

        {/* Firm Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-navy-600" />
              <h3 className="text-lg font-semibold text-navy-900">
                Firm Information
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Firm Name"
                  placeholder="e.g. Sharma & Associates"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="e.g. admin@sharmaassociates.in"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Phone"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
              <Textarea
                label="Address"
                placeholder="Enter firm address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit">Save Changes</Button>
                {showSaveSuccess && (
                  <div className="flex items-center gap-1.5 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Settings saved successfully</span>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-navy-600" />
              <h3 className="text-lg font-semibold text-navy-900">
                Subscription
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Current Plan:
                </span>
                <Badge variant="primary">
                  {PLAN_LABELS[firm.plan] ?? firm.plan}
                </Badge>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Plan Features:
                </p>
                <ul className="space-y-2">
                  {planFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 flex-shrink-0 text-teal-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600">
                Danger Zone
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Deactivating your firm will disable access for all team members
                and clients. This action can be reversed by contacting support.
              </p>
              <Button
                variant="danger"
                onClick={() => setIsDeactivateModalOpen(true)}
              >
                <AlertTriangle className="h-4 w-4" />
                Deactivate Firm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade Plan"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <Zap className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Contact Support to Upgrade
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Please reach out to our support team to upgrade your plan. We will
                help you find the best plan for your firm&apos;s needs.
              </p>
            </div>
            <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Email: <span className="font-medium">support@cointaxfinance.com</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Deactivate Firm"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Are you sure you want to deactivate your firm?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                This will immediately disable access for all team members and
                clients. All data will be preserved and can be restored by
                contacting support.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeactivateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeactivate}>
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
