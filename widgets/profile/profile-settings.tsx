'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Lock, LogOut, User } from 'lucide-react';

import { useLogout } from '@/features/logout/hooks';
import { useUser } from '@/shared/contexts';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

const ProfileSettings = () => {
  const router = useRouter();
  const { userData } = useUser();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="mt-2 h-20 w-20">
              <AvatarImage src="/user.png?height=85&width=85" />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <input
                id="email"
                value={userData?.email || ''}
                readOnly
                disabled
                className="w-full rounded-md border border-gray-300 bg-muted px-3 py-2 text-center text-muted-foreground"
              />
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/profile/change-password" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Изменить пароль
              </Link>
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full text-red-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
