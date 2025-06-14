'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';

import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { NavLinks } from '@/widgets/navigation';
import { UserMenu } from '../user-menu';
import { useUser } from '@/shared/contexts';

export const Header = () => {
  const pathname = usePathname();
  const { chatTitle } = useUser();

  const isChatPage = pathname?.startsWith('/chat');

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="h-6 w-6" />
            <span className="hidden sm:inline">CeRBeR-AI</span>
          </Link>
          {isChatPage && (
            <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
              <span>/</span>
              <span className="font-medium text-foreground">
                {chatTitle === 'Новый чат' ? '' : chatTitle}
              </span>
            </div>
          )}
        </div>
        <nav className="flex items-center gap-4">
          <NavLinks />
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
};
