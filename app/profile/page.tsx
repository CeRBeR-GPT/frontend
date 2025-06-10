'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Bot } from 'lucide-react';

import WithoutAuth from '@/features/auth/ui/WithoutAuth';
import Tarifs from '@/features/pay-for-plan/ui/tarifs';
import ProviderChoice from '@/features/provider-choice/ui/provider-choice';
import { useAuth, useUser } from '@/shared/contexts';
import { Card, CardContent } from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { getToken } from '@/shared/utils';
import { NavLinks } from '@/widgets/navigation';
import ProfileSettings from '@/widgets/profile/profile-settings';
import Subscription from '@/widgets/profile/subscription';
import { UserMenu } from '@/widgets/user-menu';

import { StatisticsDashboard } from '../../features/statistics/ui';

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
      {/* <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="w-6 h-6" />
            <span>CeRBeR-AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <NavLinks />
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header> */}

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
