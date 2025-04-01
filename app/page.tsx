"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { NavLinks } from "@/components/nav-links"
import Head from 'next/head';
export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)


  // Отслеживаем изменения состояния аутентификации
  useEffect(() => {
    setIsAuth(isAuthenticated)
  }, [isAuthenticated])

  // Обновим редирект для авторизованных пользователей
  useEffect(() => {
    if (isAuth) {
      const lastSavedChat = localStorage.getItem("lastSavedChat")

      //if (lastSavedChat) {
      //  router.replace(`/chat/${lastSavedChat}`)
      //   //const chat = JSON.parse(lastSavedChat)
      //   //console.log("Последний сохраненный чат:", chat)
      //
      //   // Формируем путь для редиректа
      //    // Предполагаем, что у чата есть поле `id`
      //   router.replace(`/chat/${lastSavedChat}`) // Редирект на страницу чата с конкретным ID
      // } else {
      //   // Если последний чат нgе найден, редиректим на страницу по умолчанию
      //   router.replace("/chat/1")
      //}
    }
  }, [isAuth, router])

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="w-6 h-6" />
            <span>AI Chat</span>
          </Link>
          <nav className="flex items-center gap-4">
            <NavLinks />
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 mx-auto md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Powerful AI Chat Assistant
                </h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Get instant answers, creative ideas, and helpful assistance with our advanced AI chat.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href={isAuth ? `/chat/${localStorage.getItem("lastSavedChat") || "1"}` : "/auth/login"}>
                  <Button size="lg" className="gap-1">
                    Start Chatting <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 px-4 md:h-16 md:flex-row md:py-0">
          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            © 2025 AI Chat. All rights reserved.
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="#" className="text-gray-500 hover:underline underline-offset-4 dark:text-gray-400">
              Terms
            </Link>
            <Link href="#" className="text-gray-500 hover:underline underline-offset-4 dark:text-gray-400">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

