"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Bot, Send, Lock, MessageSquarePlus, CheckCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { NavLinks } from "@/components/nav-links"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const { isAuthenticated, getToken} = useAuth()
  const [isAuth, setIsAuth] = useState(false)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsAuth(isAuthenticated)
  }, [isAuthenticated])

  const handleSubmitFeedback = async (e: any) => {
    e.preventDefault()

    if (!name.trim() || !message.trim()) {
      toast({
        title: "Не заполнены поля",
        description: "Пожалуйста, укажите ваше имя и текст отзыва.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      const token = await getToken()
      if (!token) {
        toast({
          title: "Требуется авторизация",
          description: "Пожалуйста, войдите в систему, чтобы оставить отзыв.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      await axios.post(
          "https://api-gpt.energy-cerber.ru/user/feedback",
          { name, message },
          { headers: { Authorization: `Bearer ${token}` } },
      )

      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв! Мы ценим ваше мнение.",
      })

      setName("")
      setMessage("")
      setIsSuccess(true)

      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error("Ошибка отправки отзыва:", error)

      if (error.response?.status === 401) {
        toast({
          title: "Сессия истекла",
          description: "Ваша сессия завершена. Пожалуйста, войдите снова, чтобы оставить отзыв.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Ошибка отправки",
          description: "Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Мощный AI-ассистент
                  </h1>
                  <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Генерация кода, решение разного рода задач и многое другое!
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={isAuth ? `/chat/${localStorage.getItem("lastSavedChat") || "1"}` : "/auth/login"}>
                    <Button size="lg" className="gap-1">
                      Начать общение <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Секция формы обратной связи */}
          <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900">
            <div className="container px-4 mx-auto md:px-6">
              <div className="max-w-[700px] mx-auto">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center p-2 mb-4 bg-primary/10 rounded-full">
                    <MessageSquarePlus className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Поделитесь мнением</h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-[500px] mx-auto">
                    Ваши отзывы помогают нам сделать CeRBeR-AI лучше для всех.
                  </p>
                </div>

                {isAuth ? (
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Форма обратной связи</CardTitle>
                        <CardDescription>Расскажите, как мы можем улучшить наш сервис</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form id="feedbackForm" onSubmit={handleSubmitFeedback} className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                              Ваше имя
                            </label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Как к Вам обращаться?"
                                className="w-full transition-all focus-visible:ring-primary"
                                required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="feedback" className="text-sm font-medium">
                              Ваш отзыв
                            </label>
                            <Textarea
                                id="feedback"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Поделитесь идеями по улучшению нашего AI-чата"
                                className="w-full min-h-[150px] transition-all focus-visible:ring-primary resize-none"
                                required
                            />
                          </div>
                        </form>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center pt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Мы ценим ваше мнение</p>
                        <Button type="submit" form="feedbackForm" className="gap-2 px-6" disabled={isSubmitting} size="lg">
                          {isSubmitting ? (
                              <>
                                Отправка<span className="loading">...</span>
                              </>
                          ) : isSuccess ? (
                              <>
                                Отправлено <CheckCircle className="w-4 h-4" />
                              </>
                          ) : (
                              <>
                                Отправить отзыв <Send className="w-4 h-4" />
                              </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-lg text-center p-8">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                          <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Требуется вход</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-[400px] mx-auto">
                        Пожалуйста, войдите в систему, чтобы поделиться отзывом и помочь нам улучшить CeRBeR-AI.
                      </p>
                      <Link href="/auth/login">
                        <Button size="lg" className="px-8">
                          Войти в систему
                        </Button>
                      </Link>
                    </Card>
                )}
              </div>
            </div>
          </section>
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