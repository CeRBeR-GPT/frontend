'use client';

import Link from 'next/link';

import { useLoginForm } from '@/features/auth/hooks';
import { FORM } from '@/features/auth/components';
import { AuthIcons } from '@/features/oAuth/components';
import { ChoiceAuth } from '@/shared/components/ChoiceAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';

export default function LoginPage() {
  const { isSubmitting } = useLoginForm();

  return (
    <div className="flex min-h-screen flex-col">
      {/* <Header /> */}
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
            <CardDescription>Введите ваши данные для входа в аккаунт</CardDescription>
          </CardHeader>

          <CardContent>
            <FORM />
            <ChoiceAuth text="Или войти через" />
            <AuthIcons />
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Нет аккаунта?{' '}
              <Link
                href="/auth/register"
                className="text-primary underline underline-offset-4"
                onClick={(e) => isSubmitting && e.preventDefault()}
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
