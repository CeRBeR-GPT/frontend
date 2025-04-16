"use client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { NavLinks } from "@/components/nav-links"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import WithoutAuth from "@/components/WithoutAuth"
import { providersByPlan } from "@/const/providers"
import { StatisticsDashboard } from "@/components/statistics/statistics-dashboard"
import type { DailyStatistic } from "@/components/statistics/activity-heatmap"
import ProfileSettings from "@/components/profile-settings"
import Subscription from "@/components/subscription"
import ProviderChoice from "@/components/provider-choice"
import Tarifs from "@/components/tarifs"

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
  const { isAuthenticated, userData, getUserData } = useAuth()
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
        } else {
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
    } catch (error) {
      console.error("Error fetching chats:", error)
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

        <ProviderChoice availableProviders = {availableProviders} selectedProvider = {selectedProvider}
          handleProviderChange = {handleProviderChange}/>
        <Tarifs plan = {plan}/>
      </main>
    </div>
  )
}
