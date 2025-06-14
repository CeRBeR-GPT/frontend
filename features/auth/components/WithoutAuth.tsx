import Link from 'next/link';

import { Bot, LogIn, User } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { NavLinks } from '@/widgets/navigation';
import { UserMenu } from '@/widgets/user-menu';

const WithoutAuth = () => {
  return (
    <div className="flex min-h-screen flex-col">
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
      <main className="container mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12 md:px-6">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Профиль недоступен</CardTitle>
            <CardDescription>
              Пожалуйста, войдите в систему для доступа к вашему профилю
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="rounded-full bg-muted p-6">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">
              Войдите в систему, чтобы управлять вашей подпиской и просматривать статистику
              использования.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button size="lg" className="w-full" asChild>
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-primary underline underline-offset-4">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default WithoutAuth;
