import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { AuthProvider } from "@/shared/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CeRBeR-AI",
  icons: {
    icon: '../public/favicon.ico',
  },
  description: "Advanced AI chat assistant"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <MessageProvider>
              {children}
            </MessageProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
import { MessageProvider } from "@/shared/contexts/MessageContext"



