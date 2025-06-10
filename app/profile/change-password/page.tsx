'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Bot } from 'lucide-react';

import { ChangePasswordForm } from '@/features/updatePassword/ui';
import { useAuth } from '@/shared/contexts';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { Toaster } from '@/shared/ui/toaster';
import { NavLinks } from '@/widgets/navigation';
import { UserMenu } from '@/widgets/user-menu';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="h-6 w-6" />
            <span>CeRBeR-AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <NavLinks />
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link href="/profile">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold">Изменение пароля</CardTitle>
                <CardDescription>Обновите ваш пароль для повышения безопасности</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm text-muted-foreground">
              Регулярно меняйте пароль для повышения безопасности вашего аккаунта
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
