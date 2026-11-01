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
import { useToast } from '@/components/ui/Toast';
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
  const { showToast } = useToast();
  const [firm, setFirm] = useState<Firm | null>(null);
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
    if (profile.role === 'client') {
      window.location.href = '/dashboard/client';
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
      showToast('Settings saved successfully.', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings. Please try again.', 'error');
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
      showToast('Failed to deactivate firm. Please try again.', 'error');
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
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Choose the plan that best fits your firm. Contact us to upgrade.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Starter', price: '499', features: PLAN_FEATURES.starter, key: 'starter' },
              { name: 'Pro', price: '999', features: PLAN_FEATURES.pro, key: 'pro' },
              { name: 'Enterprise', price: '2,499', features: PLAN_FEATURES.enterprise, key: 'enterprise' },
            ].map((plan) => (
              <div
                key={plan.key}
                className={`rounded-xl border-2 p-4 ${
                  firm.plan === plan.key
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-gray-200'
                }`}
              >
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="mt-1">
                  <span className="text-2xl font-bold text-[#1e3a5f]">&#8377;{plan.price}</span>
                  <span className="text-xs text-gray-500">/mo</span>
                </p>
                {firm.plan === plan.key && (
                  <span className="mt-2 inline-block rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                    Current Plan
                  </span>
                )}
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Check className="h-3 w-3 flex-shrink-0 text-teal-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-center space-y-2">
            <p className="text-sm font-medium text-gray-900">
              To upgrade, email us at:
            </p>
            <a
              href="mailto:cointaxfinance@gmail.com?subject=Plan Upgrade Request"
              className="text-sm font-semibold text-[#0d9488] hover:underline"
            >
              cointaxfinance@gmail.com
            </a>
            <p className="text-xs text-gray-400 mt-1">
              Online plan upgrades coming soon
            </p>
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
