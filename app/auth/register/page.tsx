'use client';

import Link from 'next/link';

import { AlertTriangle } from 'lucide-react';

import { AuthIcons } from '@/features/oAuth/components';
import { SendCodeForm } from '@/features/registration/components';
import { ChoiceAuth } from '@/shared/ui/ChoiceAuth';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Header } from '@/widgets/header/header';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для использования CeRBeR-AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Внимание!</AlertTitle>
              <AlertDescription>
                <div>
                  В настоящее время регистрация через почту с доменом @mail.ru недоступна из-за
                  проблем с доставкой кода подтверждения.
                  <br />
                  Пожалуйста, используйте альтернативные способы регистрации.
                  <br />
                  Проверяйте, пожалуйста, спам!
                </div>
              </AlertDescription>
            </Alert>
            <SendCodeForm />
            <ChoiceAuth text="Или зарегистрироваться через" />
            <AuthIcons />
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-primary underline underline-offset-4">
                Войти
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
