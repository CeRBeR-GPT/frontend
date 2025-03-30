"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { ru } from "date-fns/locale"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ActivityData {
  date: string // ISO format date
  count: number
}

interface ActivityStatsProps {
  data?: ActivityData[]
}

export function ActivityStats({ data = [] }: ActivityStatsProps) {
  const [activeTab, setActiveTab] = useState("heatmap")
  const isMobile = !useMediaQuery("(min-width: 640px)")

  // Если данные не предоставлены, используем пустой массив
  const activityData = data.length > 0 ? data : []

  // Подготовка данных для недельного графика
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Неделя начинается с понедельника
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weeklyData = daysOfWeek.map((day) => {
    const dayActivity = activityData.find((item) => isSameDay(new Date(item.date), day))
    return {
      name: format(day, isMobile ? "E" : "EEE", { locale: ru }),
      value: dayActivity ? dayActivity.count / 2 : 0,
      fullDate: format(day, "PPP", { locale: ru }),
    }
  })

  // Подготовка данных для месячной статистики
  // Для мобильных устройств показываем меньше дней
  const daysToShow = isMobile ? 14 : 30
  const monthlyData = Array.from({ length: daysToShow })
    .map((_, i) => {
      const day = subDays(new Date(), i)
      const dayActivity = activityData.find((item) => isSameDay(new Date(item.date), day))
      return {
        name: format(day, isMobile ? "d" : "dd.MM"),
        value: dayActivity ? dayActivity.count / 2 : 0,
        fullDate: format(day, "PPP", { locale: ru }),
      }
    })
    .reverse()

  // Расчет общей статистики
  const totalMessages = activityData.reduce((sum, item) => sum + item.count, 0)
  const activeDays = activityData.filter((item) => item.count > 0).length
  const averagePerDay = activeDays > 0 ? Math.round(totalMessages / activeDays) : 0

  // Находим день с максимальной активностью
  const maxActivityDay = activityData.reduce(
    (max, item) => (item.count > (max?.count || 0) ? item : max),
    null as ActivityData | null,
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-md text-xs">
          <p className="font-medium">{payload[0].payload.fullDate}</p>
          <p>{`${payload[0].value / 2} сообщений`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика активности</CardTitle>
        <CardDescription>Анализ вашего использования AI Chat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalMessages / 2}</div>
              <p className="text-xs text-muted-foreground">Всего сообщений</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{activeDays}</div>
              <p className="text-xs text-muted-foreground">Активных дней</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{Math.floor(averagePerDay / 2)}</div>
              <p className="text-xs text-muted-foreground">Среднее в день</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{maxActivityDay ? maxActivityDay.count / 2 : 0}</div>
              <p className="text-xs text-muted-foreground">
                Максимум за день
                {maxActivityDay && <span> ({format(new Date(maxActivityDay.date), "dd.MM")})</span>}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="heatmap">Тепловая карта</TabsTrigger>
            <TabsTrigger value="weekly">Неделя</TabsTrigger>
            <TabsTrigger value="monthly">Месяц</TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="mt-0">
            <ActivityHeatmap data={activityData} />
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-0">
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

