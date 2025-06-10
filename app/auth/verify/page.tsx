'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Mail } from 'lucide-react';

import { useVerifyCodeForm } from '@/features/registration/model';
import { VerifyCodeForm } from '@/features/registration/ui';
import { useAuth, useUser } from '@/shared/contexts';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Header } from '@/widgets/header/header';

export default function VerifyPage() {
  const router = useRouter();
  const { email } = useVerifyCodeForm();
  const { isAuthenticated, setAuthChecked } = useAuth();
  const { refreshUserData } = useUser();
  // useEffect(() => {
  //   const savedEmail = localStorage.getItem("email")
  //   const savedPassword = localStorage.getItem("password")

  //   if (savedEmail && savedPassword) {
  //     setEmail(savedEmail)
  //     setPassword(savedPassword)
  //   } else {
  //     router.push("/auth/register")
  //   }
  // }, [router])

  // useEffect(() => {
  //     if (isAuthenticated) {
  //         refreshUserData().then(() => {
  //             setAuthChecked(true);
  //         });
  //     }
  // }, [isAuthenticated, refreshUserData]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold">Проверка Email</CardTitle>
            <CardDescription className="text-center">
              Мы отправили код подтверждения на <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerifyCodeForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Не получили код?{' '}
              <Button variant="link" className="h-auto p-0" onClick={() => router.refresh()}>
                Отправить повторно
              </Button>
            </div>
            <div className="text-center text-sm">
              <Link href="/auth/register" className="text-primary underline underline-offset-4">
                Использовать другой email
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
