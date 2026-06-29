'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDemoUser, getDashboardPath } from '@/lib/auth';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getDemoUser();
    if (user) {
      router.replace(getDashboardPath(user.role));
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
