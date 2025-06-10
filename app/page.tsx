"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { ArrowRight } from "lucide-react"
import { FormFeedback } from "@/features/feedback/ui"
import { useAuth } from "@/shared/contexts"
import { TelegramIcon } from "@/shared/ui/telegram-icon"

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
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
              <TelegramIcon/>
              energy_cerber
            </Link>
            <Link
                href="https://t.me/MaluckowD"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <TelegramIcon/>
              MaluckowD
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}