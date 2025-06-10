import type React from 'react';

import { Inter } from 'next/font/google';

import '@/app/globals.css';
import { MessageProvider } from '@/shared/contexts/MessageContext';
import { UserProvider } from '@/shared/contexts/user-context';
import { AuthProvider } from '@/shared/hooks';
import { ThemeProvider } from '@/shared/providers';
import { Toaster } from '@/shared/ui/toaster';
import { Header } from '@/widgets/header/header';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CeRBeR-AI',
  icons: {
    icon: '../public/favicon.ico',
  },
  description: 'Advanced AI chat assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <AuthProvider>
              <MessageProvider>
                {/* <Header></Header> */}
                <Header />
                {children}
              </MessageProvider>
            </AuthProvider>
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
