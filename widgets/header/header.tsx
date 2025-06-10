import Link from 'next/link';

import { Bot } from 'lucide-react';

import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { NavLinks } from '@/widgets/navigation';

import { UserMenu } from '../user-menu';

export const Header = () => {
  return (
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
  );
};
