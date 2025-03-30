"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Check, User, Zap, LogIn, LogOut, Lock, Cpu, Sparkles, Star } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { useRouter } from "next/navigation"
import { NavLinks } from "@/components/nav-links"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { ActivityStats } from "@/components/activity-stats"
import { subDays, format } from "date-fns"

interface UserData {
  id: string
  email: string
  plan: string
  plan_purchase_date: string
  available_message_count: number
  message_length_limit: number
  message_count_limit: number
}

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

// Define the provider tiers based on subscription plans
const providersByPlan = {
  default: ["default", "deepseek"],
  premium: ["default", "deepseek", "gpt_4o_mini"],
  business: ["default", "deepseek", "gpt_4o_mini", "gpt_4o", "gpt_4"],
}

export default function ProfilePage() {
  const { isAuthenticated, logout, userData } = useAuth()
  const router = useRouter()
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("default")
  const [availableProviders, setAvailableProviders] = useState<string[]>([])

  const isRequested = useRef(false)

  useEffect(() => {
    const getToken = () => localStorage.getItem("access_token")
    const token = getToken()

    const getUserData = async () => {
      // Обновляем историю использования сообщений
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

      // Загружаем чаты и обновляем статистику
      await fetchChats(token)
    }

    if (token) {
      getUserData()
    }
  }, [])

  // Set available providers based on user's plan
  useEffect(() => {
    if (userData) {
      const providers = providersByPlan[userData.plan as keyof typeof providersByPlan] || providersByPlan.default
      setAvailableProviders(providers)

      // Get saved provider from localStorage or use default
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

      // Создаем объект для группировки сообщений по дате
      const messagesByDate: { [key: string]: number } = {}

      // Проходим по всем чатам и их сообщениям
      chats.forEach((chat) => {
        chat.messages.forEach((message) => {
          // Преобразуем дату из UTC в московское время (MSK, UTC+3)
          const utcDate = new Date(message.created_at)
          const mskTime = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000) // Добавляем 3 часа
          console.log("time", mskTime)
          const messageDate = format(mskTime, "yyyy-MM-dd")

          if (messagesByDate[messageDate]) {
            messagesByDate[messageDate] += 1
          } else {
            messagesByDate[messageDate] = 1
          }
        })
      })

      // Преобразуем объект в массив для использования в `usageHistory`
      const updatedHistory = Object.keys(messagesByDate).map((date) => ({
        date,
        usedMessages: messagesByDate[date],
      }))

      // Обновляем состояние и локальное хранилище
      localStorage.setItem("usageHistory", JSON.stringify(updatedHistory))
      setUsageHistory(updatedHistory)
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const generateActivityData = () => {
    const data = []
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const date = subDays(today, i)
      const formattedDate = format(date, "yyyy-MM-dd")
      const usageEntry = usageHistory.find((entry) => entry.date === formattedDate)

      data.push({
        date: date.toISOString(),
        count: usageEntry ? usageEntry.usedMessages : 0,
      })
    }

    return data
  }

  const activityData = generateActivityData()

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

      console.log(response.data.url)
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    localStorage.setItem("selectedProvider", provider)

    // Здесь можно добавить вызов API для сохранения выбранного провайдера на сервере
    // например:
    // const token = localStorage.getItem('access_token');
    // axios.post('https://api-gpt.energy-cerber.ru/user/settings',
    //   { provider },
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
  }

  // Helper function to get provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "default":
        return <Bot className="w-5 h-5" />
      case "deepseek":
        return <Cpu className="w-5 h-5" />
      case "gpt_4o_mini":
        return <Sparkles className="w-5 h-5" />
      case "gpt_4o":
        return <Zap className="w-5 h-5" />
      case "gpt_4":
        return <Star className="w-5 h-5" />
      default:
        return <Bot className="w-5 h-5" />
    }
  }

  // Helper function to get provider name
  const getProviderName = (provider: string) => {
    switch (provider) {
      case "default":
        return "Стандартный"
      case "deepseek":
        return "DeepSeek"
      case "gpt_4o_mini":
        return "GPT-4o Mini"
      case "gpt_4o":
        return "GPT-4o"
      case "gpt_4":
        return "GPT-4"
      default:
        return provider
    }
  }

  // Helper function to get provider description
  const getProviderDescription = (provider: string) => {
    switch (provider) {
      case "default":
        return "Базовая модель для повседневных задач"
      case "deepseek":
        return "Мощная модель с открытым исходным кодом"
      case "gpt_4o_mini":
        return "Компактная версия GPT-4o с хорошим балансом скорости и качества"
      case "gpt_4o":
        return "Мультимодальная модель от OpenAI с расширенными возможностями"
      case "gpt_4":
        return "Продвинутая модель от OpenAI для сложных задач"
      default:
        return ""
    }
  }

  // Helper function to determine if a provider requires a specific plan
  const getRequiredPlan = (provider: string) => {
    if (providersByPlan.default.includes(provider)) {
      return "default"
    } else if (providersByPlan.premium.includes(provider) && !providersByPlan.default.includes(provider)) {
      return "premium"
    } else {
      return "business"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
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
        <main className="flex-1 container mx-auto px-4 py-12 md:px-6 max-w-5xl flex flex-col items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Профиль недоступен</CardTitle>
              <CardDescription>Пожалуйста, войдите в систему для доступа к вашему профилю</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <div className="rounded-full bg-muted p-6">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground">
                Войдите в систему, чтобы управлять вашей подпиской и просматривать статистику использования.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button size="lg" className="w-full" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Войти
                </Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link href="/auth/register" className="text-primary underline underline-offset-4">
                  Зарегистрироваться
                </Link>
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-20 h-20 mt-2">
                    <AvatarImage src="/user.png?height=85&width=85" />
                    <AvatarFallback>
                      <User className="w-10 h-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-lg font-bold">{userData?.email}</h2>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/profile/change-password" className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      Изменить пароль
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full mt-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Текущий тариф</h3>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="font-bold">{plan}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan === "Базовый" ? "Бесплатно" : plan === "Премиум" ? "999₽" : plan === "Бизнес" ? "2999₽" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <ActivityStats data={activityData} />
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ваша подписка</CardTitle>
                <CardDescription>Управляйте вашим тарифным планом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Использовано сообщений</span>
                      <span className="text-sm font-medium">
                        {userData ? userData.message_count_limit - userData.available_message_count : 0} /{" "}
                        {userData?.message_count_limit || 0}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            userData
                              ? (
                                  (userData.message_count_limit - userData.available_message_count) /
                                    userData.message_count_limit
                                ) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-1">{plan} тариф</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      У вас активирован {plan} тариф с ограничением в {userData?.message_count_limit || 0} сообщений в
                      день.
                    </p>
                    <Button variant="outline" size="sm">
                      Управление тарифом
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Provider Selection Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI Провайдер</CardTitle>
                <CardDescription>Выберите предпочитаемую модель AI для общения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {/* Only show providers available for the current plan */}
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

                  {0 && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                      <p className="flex items-center gap-2">
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {1
                            ? "Обновите до Premium для доступа к GPT-4o Mini или до Бизнес для всех моделей"
                            : "Обновите до Бизнес тарифа для доступа ко всем моделям"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-bold mb-4">Доступные тарифы</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>10 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ограничение: 2000 символов</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Доступ к 2 AI моделям</span>
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
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>50 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ограничение: 10000 символов</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Доступ к 3 AI моделям</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Фотокарточка Кирилла</span>
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
                  <CardDescription>Для команд и компаний</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">2999₽</span>
                    <span className="text-muted-foreground"> / месяц</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>100 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ограничение: 20000 символов</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Доступ ко всем AI моделям</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Удочка в подарок</span>
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
        </div>
      </main>
    </div>
  )
}

