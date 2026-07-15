// Re-export auth utilities from AuthContext for backward compatibility.
// All real auth logic lives in src/contexts/AuthContext.tsx now.

export { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import type { UserRole } from './types';

export function requireRole(currentRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}
