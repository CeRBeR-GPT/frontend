'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/shared/contexts';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authChecked } = useAuth();
  const router = useRouter();
  const [initialCheckCompleted, setInitialCheckCompleted] = useState(false);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/auth/login');
      setInitialCheckCompleted(true);
    }
  }, [isAuthenticated, authChecked, router]);

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
