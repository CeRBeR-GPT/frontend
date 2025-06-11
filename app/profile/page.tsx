'use client';
import { Card, CardContent } from '@/shared/ui/card';
import { useEffect } from 'react';
import WithoutAuth from '@/features/auth/components/WithoutAuth';
import { StatisticsDashboard } from '../../features/statistics/components';
import ProfileSettings from '@/widgets/profile/profile-settings';
import Subscription from '@/widgets/profile/subscription';
import ProviderChoice from '@/features/provider-choice/components/provider-choice';
import Tarifs from '@/features/pay-for-plan/components/tarifs';
import { useAuth, useUser } from '@/shared/contexts';
import { useRouter } from 'next/navigation';
import { getToken } from '@/shared/utils';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { refreshUserData } = useUser();
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (token) {
      refreshUserData();
    }
    if (!token) {
      router.push('/auth/login');
    }
  }, [token]);

  if (!isAuthenticated) {
    return <WithoutAuth />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-6 md:px-6">
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <ProfileSettings />
          <Subscription />
        </div>

        <div className="mb-8 mt-8 w-full">
          <h2 className="mb-4 text-xl font-bold">Статистика использования</h2>
          <Card className="w-full">
            <CardContent className="px-2 pt-6 sm:px-4 md:px-6">
              <StatisticsDashboard />
            </CardContent>
          </Card>
        </div>
        <ProviderChoice />
        <Tarifs />
      </main>
    </div>
  );
}
