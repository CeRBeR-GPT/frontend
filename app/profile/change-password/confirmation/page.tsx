'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Mail } from 'lucide-react';

import { ConfirmationForm } from '@/features/updatePassword/components';
import { useUser } from '@/shared/contexts';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export default function VerifyPage() {
  const router = useRouter();
  const { getToken, userData } = useUser();
  const email = userData?.email;
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="container flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold">Проверка пароля</CardTitle>
            <CardDescription className="text-center">
              Мы отправили код подтверждения на <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfirmationForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Не получили код?{' '}
              <Button variant="link" className="h-auto p-0" onClick={() => router.refresh()}>
                Отправить повторно
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
