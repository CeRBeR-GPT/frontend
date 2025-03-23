"use client"

import { useState, useEffect } from "react"
import { format, parseISO, subDays, eachDayOfInterval, addDays, isSameDay, subMonths } from "date-fns"
import { ru } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ActivityData {
  date: string // ISO format date
  count: number
}

interface ActivityHeatmapProps {
  data?: ActivityData[]
  startDate?: Date
  endDate?: Date
}

export function ActivityHeatmap({ data = [], startDate: propStartDate, endDate = new Date() }: ActivityHeatmapProps) {
  const [activityData, setActivityData] = useState<ActivityData[]>(data)
  const [hoveredDay, setHoveredDay] = useState<ActivityData | null>(null)

  // Используем медиа-запросы для определения размера экрана
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const isTablet = useMediaQuery("(min-width: 640px)")

  // Адаптируем период отображения в зависимости от размера экрана
  const startDate =
    propStartDate ||
    (isDesktop ? subDays(new Date(), 365) : isTablet ? subDays(new Date(), 180) : subMonths(new Date(), 3))

  // Если данные не предоставлены, генерируем случайные данные для демонстрации
  useEffect(() => {
    if (data.length === 0) {
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      const mockData: ActivityData[] = days.map((day) => {
        // Генерируем случайное количество активности для каждого дня
        // С большей вероятностью низкой активности
        const random = Math.random()
        let count = 0

        if (random > 0.7) count = Math.floor(Math.random() * 5) + 1
        if (random > 0.85) count = Math.floor(Math.random() * 10) + 5
        if (random > 0.95) count = Math.floor(Math.random() * 15) + 10

        return {
          date: day.toISOString(),
          count,
        }
      })
      setActivityData(mockData)
    } else {
      setActivityData(data)
    }
  }, [data, startDate, endDate])

  // Создаем сетку дней
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Определяем количество недель для отображения
  const weeks = Math.ceil(days.length / 7)

  // Создаем массив дней недели
  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  // Функция для определения цвета ячейки на основе количества активности
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800"
    if (count < 5) return "bg-green-100 dark:bg-green-900"
    if (count < 10) return "bg-green-300 dark:bg-green-700"
    if (count < 15) return "bg-green-500 dark:bg-green-500"
    return "bg-green-700 dark:bg-green-300"
  }

  // Функция для получения данных активности для конкретного дня
  const getActivityForDay = (day: Date) => {
    const activity = activityData.find((item) => isSameDay(parseISO(item.date), day))
    return activity ? activity.count : 0
  }

  // Создаем массив месяцев для отображения над сеткой
  const months: { name: string; width: number }[] = []
  let currentMonth = startDate.getMonth()
  let monthStartCol = 0

  days.forEach((day, index) => {
    const dayMonth = day.getMonth()
    if (dayMonth !== currentMonth || index === 0) {
      if (index > 0) {
        const width = index - monthStartCol
        months.push({
          name: format(days[monthStartCol], "LLL", { locale: ru }),
          width,
        })
      }
      monthStartCol = index
      currentMonth = dayMonth
    }

    if (index === days.length - 1) {
      const width = index - monthStartCol + 1
      months.push({
        name: format(days[monthStartCol], "LLL", { locale: ru }),
        width,
      })
    }
  })

  // Определяем размер ячейки в зависимости от размера экрана
  const cellSize = isDesktop ? 10 : isTablet ? 8 : 6
  const cellGap = isDesktop ? 3 : 2

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Активность использования AI Chat</h3>

      <div className="w-full overflow-hidden">
        <div className="w-full">
          {/* Месяцы - только для планшетов и десктопов */}
          {(isTablet || isDesktop) && (
            <div className="flex text-xs text-muted-foreground h-6 ml-10">
              {months.map((month, i) => (
                <div
                  key={i}
                  className="flex-shrink-0"
                  style={{
                    width: `${((month.width * (cellSize + cellGap)) / weeks) * 7}%`,
                    maxWidth: `${month.width * (cellSize + cellGap)}px`,
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
          )}

          <div className="flex">
            {/* Дни недели - только для планшетов и десктопов */}
            {(isTablet || isDesktop) && (
              <div className="flex flex-col text-xs text-muted-foreground mr-2 mt-6 space-y-2">
                {weekdays.map((day, i) => (
                  <div key={i} className={`h-[${cellSize}px] flex items-center`}>
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Адаптивная сетка активности */}
            <div className="w-full grid grid-flow-col gap-[2px] auto-cols-fr">
              {Array.from({ length: weeks }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {weekdays.map((_, dayIndex) => {
                    const dayOffset = weekIndex * 7 + dayIndex
                    const currentDay = addDays(startDate, dayOffset)

                    // Проверяем, не выходит ли день за пределы диапазона
                    if (currentDay > endDate) {
                      return <div key={dayIndex} className={`w-full aspect-square`} />
                    }

                    const activityCount = getActivityForDay(currentDay)

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-full aspect-square rounded-sm ${getCellColor(activityCount)} cursor-pointer transition-colors`}
                              onMouseEnter={() =>
                                setHoveredDay({ date: currentDay.toISOString(), count: activityCount })
                              }
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs">
                              <p className="font-medium">{format(currentDay, "PPP", { locale: ru })}</p>
                              <p>{activityCount} сообщений</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Легенда */}
          <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
            <span className="mr-2">Меньше</span>
            <div className="flex gap-1">
              <div className="w-[10px] h-[10px] rounded-sm bg-gray-100 dark:bg-gray-800" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-100 dark:bg-green-900" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-300 dark:bg-green-700" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-500 dark:bg-green-500" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-700 dark:bg-green-300" />
            </div>
            <span className="ml-2">Больше</span>
          </div>
        </div>
      </div>

      {/* Информация о наведенном дне */}
      {hoveredDay && (
        <div className="text-sm text-muted-foreground mt-2 hidden md:block">
          <p>
            {format(parseISO(hoveredDay.date), "PPP", { locale: ru })}: {hoveredDay.count} сообщений
          </p>
        </div>
      )}
    </div>
  )
}

