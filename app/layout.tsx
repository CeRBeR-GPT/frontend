import type React from 'react';
import '@/app/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import { TanstackQueryProvider, ThemeProvider } from '@/shared/providers';
import { AuthProvider } from '@/shared/hooks';
import { Toaster } from '@/shared/components/ui/toaster';
import { MessageProvider } from '@/shared/contexts/MessageContext';
import { UserProvider } from '@/shared/contexts/user-context';
import { Header } from '@/widgets/header/header';

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
        <TanstackQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider>
              <AuthProvider>
                <MessageProvider>
                  <Header />
                  {children}
                </MessageProvider>
              </AuthProvider>
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
