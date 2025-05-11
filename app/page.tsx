"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot } from "lucide-react"
import { ThemeToggle } from "@/shared/ui/theme-toggle"
import { UserMenu } from "@/widgets/user-menu/user-menu"
import { NavLinks } from "@/components/nav-links"
import { useAuth } from "@/features/auth/model/use-auth"
import { FormFeedback } from "@/features/feedback/ui/FormFeedback"

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span>CeRBeR-AI</span>
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
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Мощный AI-ассистент</h1>
                  <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Генерация кода, решение разного рода задач и многое другое!
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={isAuthenticated ? `/chat/${localStorage.getItem("lastSavedChat") || "1"}` : "/auth/login"}>
                    <Button size="lg" className="gap-1">
                      Начать общение <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <FormFeedback/>
        </main>
        <footer className="border-t py-6">
          <div className="container px-4 mx-auto flex flex-col items-center text-center space-y-4">
            <div className="text-gray-500 dark:text-gray-400">© 2025 CeRBeR-AI. Все права защищены.</div>
            <div className="text-gray-500 dark:text-gray-400 max-w-md">
              Этот чат никак не связан с OpenAI или ChatGPT и не является их продуктом.
            </div>

            <div className="flex flex-col items-center space-y-2">
              <Link
                  href="https://t.me/energy_cerber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                >
                  <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path>
                </svg>
                energy_cerber
              </Link>
              <Link
                  href="https://t.me/MaluckowD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                >
                  <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path>
                </svg>
                MaluckowD
              </Link>
            </div>
          </div>
        </footer>
      </div>
  )
}
