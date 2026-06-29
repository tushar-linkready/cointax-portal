'use client';

import { Profile, UserRole } from './types';
import { mockProfiles, DEMO_ACCOUNTS } from './mock-data';
import { isDemoMode } from './utils';

const STORAGE_KEY = 'cointax_demo_user';

export function demoLogin(email: string, password: string): Profile | null {
  const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
  if (!account) return null;
  const profile = mockProfiles.find(p => p.email === email);
  if (!profile) return null;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
  return profile;
}

export function demoLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getDemoUser(): Profile | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Profile;
  } catch {
    return null;
  }
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'firm_admin':
    case 'team_member':
      return '/dashboard/firm';
    case 'client':
      return '/dashboard/client';
    default:
      return '/login';
  }
}

export function requireRole(currentRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}
