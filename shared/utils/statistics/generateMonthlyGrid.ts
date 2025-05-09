import { DailyStatistic } from "@/shared/types/statistics/statistics"

export const getColorIntensity = (statistics: DailyStatistic[], count: number) => {
    const maxMessages = statistics.reduce((max, stat) => {
        const totalMessages = stat.providers.reduce((sum, provider) => sum + provider.messages_sent, 0)
        return totalMessages > max ? totalMessages : max
    }, 0)
    if (count === 0) return "bg-gray-100 dark:bg-gray-800"

    const intensity = Math.min(Math.ceil((count / maxMessages) * 4), 4)

    switch (intensity) {
      case 1:
        return "bg-green-100 dark:bg-green-900"
      case 2:
        return "bg-green-300 dark:bg-green-700"
      case 3:
        return "bg-green-500 dark:bg-green-500"
      case 4:
        return "bg-green-700 dark:bg-green-300"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
}