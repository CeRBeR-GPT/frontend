"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Check, Zap, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { useRouter } from "next/navigation"
import { NavLinks } from "@/components/nav-links"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"
import WithoutAuth from "@/components/WithoutAuth"
import getProviderIcon, { getProviderDescription, getProviderName } from "@/utils/providers-utils"
import { providersByPlan } from "@/const/providers"
import { StatisticsDashboard } from "@/components/statistics/statistics-dashboard"
import type { DailyStatistic } from "@/components/statistics/activity-heatmap"
import ProfileSettings from "@/components/profile-settings"
import Subscription from "@/components/subscription"

interface UsageHistory {
  date: string
  usedMessages: number
}

interface Chat {
  id: string
  name: string
  user_id: string
  created_at: string
  messages: {
    id: string
    text: string
    message_belong: string
    chat_id: string
    user_id: string
    created_at: string
  }[]
}

export default function ProfilePage() {
  const { isAuthenticated, logout, userData, getUserData } = useAuth()
  const router = useRouter()
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("default")
  const [availableProviders, setAvailableProviders] = useState<string[]>([])
  const [render, setRender] = useState<number>(0)
  const [statistics, setStatistics] = useState<DailyStatistic[]>([])
  const [statisticsLoading, setStatisticsLoading] = useState(true)

  useEffect(() => {
    const getToken = () => localStorage.getItem("access_token")
    const token = getToken()
    const fetchUserData = async () => {
      setStatisticsLoading(true)

      try {
        const today = format(new Date(), "yyyy-MM-dd")
        const existingHistory = JSON.parse(localStorage.getItem("usageHistory") || "[]")
        const todayUsage = existingHistory.find((entry: UsageHistory) => entry.date === today)

        if (!todayUsage && userData) {
          const newEntry = {
            date: today,
            usedMessages: userData.message_count_limit - userData.available_message_count,
          }
          const updatedHistory = [newEntry, ...existingHistory]
          localStorage.setItem("usageHistory", JSON.stringify(updatedHistory))
          setUsageHistory(updatedHistory)
        } else {
          setUsageHistory(existingHistory)
        }

        const token = localStorage.getItem("access_token")

        const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data?.statistics) {
          setStatistics(response.data.statistics)
        }

        await fetchChats(token)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setStatisticsLoading(false)
      }
    }

    if (token) {
      getUserData()
      fetchUserData()
    }
  }, [])

  useEffect(() => {
    if (userData) {
      const providers = providersByPlan[userData.plan as keyof typeof providersByPlan] || providersByPlan.default
      setAvailableProviders(providers)
      const savedProvider = localStorage.getItem("selectedProvider")
      if (savedProvider && providers.includes(savedProvider)) {
        setSelectedProvider(savedProvider)
      } else {
        setSelectedProvider(providers[0])
        localStorage.setItem("selectedProvider", providers[0])
      }
    }
  }, [userData])

  const isRequest = useRef(false)
  const fetchChats = async (token: string | null) => {
    if (isRequest.current) return
    isRequest.current = true
    try {
      const response = await axios.get(`https://api-gpt.energy-cerber.ru/chat/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const chats: Chat[] = response.data
      const messagesByDate: { [key: string]: number } = {}

      chats.forEach((chat) => {
        chat.messages.forEach((message) => {
          const utcDate = new Date(message.created_at)
          const mskTime = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000)
          console.log("time", mskTime)
          const messageDate = format(mskTime, "yyyy-MM-dd")

          if (messagesByDate[messageDate]) {
            messagesByDate[messageDate] += 1
          } else {
            messagesByDate[messageDate] = 1
          }
        })
      })

      const updatedHistory = Object.keys(messagesByDate).map((date) => ({
        date,
        usedMessages: messagesByDate[date],
      }))

      localStorage.setItem("usageHistory", JSON.stringify(updatedHistory))
      setUsageHistory(updatedHistory)
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const payForPremium = async (plan: string) => {
    const getToken = () => localStorage.getItem("access_token")
    const token = getToken()
    try {
      const response = await axios.post(
        `https://api-gpt.energy-cerber.ru/transaction/new_payment?plan=${plan}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      router.replace(response.data.url)
    } catch (error) {
      console.error("Fail to pay:", error)
    }
  }

  const plan =
    userData?.plan === "default"
      ? "Базовый"
      : userData?.plan === "premium"
        ? "Премиум"
        : userData?.plan === "business"
          ? "Бизнес"
          : ""

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    localStorage.setItem("selectedProvider", provider)
  }

  const refreshStatistics = () => {
    getUserData()
    const token = localStorage.getItem("access_token")
    if (token) {
      setStatisticsLoading(true)
      axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
          if (response.data?.statistics) {
            setStatistics(response.data.statistics)
          }
          setStatisticsLoading(false)
        })
        .catch((error) => {
          console.error("Error refreshing statistics:", error)
          setStatisticsLoading(false)
        })
    }
  }

  if (!isAuthenticated) { return <WithoutAuth /> }

  return (
    <div key={`sidebar-${render}`} className="flex flex-col min-h-screen">
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
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <ProfileSettings plan={plan} />
          <Subscription plan={plan}/>
        </div>

        <div className="mt-8 mb-8 w-full">
          <h2 className="text-xl font-bold mb-4">Статистика использования</h2>
          <Card className="w-full">
            <CardContent className="pt-6 px-2 sm:px-4 md:px-6">
              <StatisticsDashboard statistics={statistics} loading={statisticsLoading} onRefresh={refreshStatistics} />
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>AI Провайдер</CardTitle>
              <CardDescription>Выберите предпочитаемую модель AI для общения</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3">
                  {availableProviders.map((provider) => {
                    const isSelected = selectedProvider === provider
                    return (
                      <div
                        key={provider}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                        }`}
                        onClick={() => handleProviderChange(provider)}
                      >
                        <div className="flex items-center gap-3">
                          {getProviderIcon(provider)}
                          <div>
                            <p className="font-medium">{getProviderName(provider)}</p>
                            <p className="text-xs opacity-80">{getProviderDescription(provider)}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5" />}
                      </div>
                    )
                  })}
                </div>

                {userData?.plan !== "business" && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                    <p className="flex items-center gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {userData?.plan === "default"
                          ? "Обновите до Premium для доступа к GPT-4o Mini или до Бизнес для всех моделей"
                          : "Обновите до Бизнес тарифа для доступа ко всем моделям"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 w-full">
          <h2 className="text-xl font-bold mb-4">Доступные тарифы</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className={plan !== "Базовый" ? "border-2 border-gray-200" : "border-2 border-primary"}>
              <CardHeader>
                <CardTitle>Базовый</CardTitle>
                <CardDescription>Для начинающих пользователей</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">Бесплатно</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>10 сообщений в день</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Ограничение: 2000 символов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Возможность создать до 5 чатов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Доступ к стандартному gpt-3.5 и DeepSeek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>Сообщения старше 7 дней удаляются</span>
                  </li>
                </ul>
              </CardContent>
              {plan === "Базовый" && (
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card className={plan !== "Премиум" ? "border-2 border-gray-200" : "border-2 border-primary"}>
              <CardHeader>
                <CardTitle>Премиум</CardTitle>
                <CardDescription>Для активных пользователей</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">999₽</span>
                  <span className="text-muted-foreground"> / месяц</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>50 сообщений в день</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Ограничение: 10000 символов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Возможность создать до 20 чатов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Провайдеры предыдущего тарифа + gpt-4o-mini</span>
                  </li>
                </ul>
              </CardContent>
              {plan === "Премиум" && (
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
              )}
              {plan === "Базовый" && (
                <CardFooter>
                  <Button onClick={() => payForPremium("premium")} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Обновить
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card className={plan !== "Бизнес" ? "border-2 border-gray-200" : "border-2 border-primary"}>
              <CardHeader>
                <CardTitle>Бизнес</CardTitle>
                <CardDescription>Не могу существовать без AI</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">2999₽</span>
                  <span className="text-muted-foreground"> / месяц</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>100 сообщений в день</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Ограничение: 20000 символов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Возможность создать до 50 чатов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Провайдеры предыдущего тарифа + gpt-4o и gpt-4</span>
                  </li>
                </ul>
              </CardContent>
              {plan === "Бизнес" && (
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
              )}
              {(plan === "Премиум" || plan === "Базовый") && (
                <CardFooter>
                  <Button onClick={() => payForPremium("business")} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Обновить
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
