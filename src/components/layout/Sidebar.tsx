'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCog,
  Tag,
  Settings,
  Building2,
  PlusCircle,
  FileText,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { NAV_ITEMS } from '@/lib/constants';
import { getFirm } from '@/lib/services';
import { cn, getInitials } from '@/lib/utils';
import type { UserRole, Firm } from '@/lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCog,
  Tag,
  Settings,
  Building2,
  PlusCircle,
  FileText,
};

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  firm_admin: 'Firm Admin',
  team_member: 'Team Member',
  client: 'Client',
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [firm, setFirm] = useState<Firm | null>(null);

  useEffect(() => {
    if (profile?.firm_id) {
      getFirm(profile.firm_id).then(setFirm).catch(console.error);
    }
  }, [profile?.firm_id]);

  if (!profile) return null;

  const navItems = NAV_ITEMS[profile.role] || [];

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-800 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-navy-700">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            Cointax
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-navy-300 hover:bg-navy-700 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Firm name */}
        {firm && (
          <div className="px-6 py-3 border-b border-navy-700">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-300">
              Firm
            </p>
            <p className="mt-0.5 text-sm font-medium text-navy-100 truncate">
              {firm.name}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard/super-admin' &&
                item.href !== '/dashboard/firm' &&
                item.href !== '/dashboard/client' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-navy-100 hover:bg-navy-700 hover:text-white'
                )}
              >
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div className="border-t border-navy-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
              {getInitials(profile.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile.full_name}
              </p>
              <span className="inline-block mt-0.5 rounded-full bg-navy-700 px-2 py-0.5 text-xs font-medium text-navy-200">
                {ROLE_LABELS[profile.role]}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
