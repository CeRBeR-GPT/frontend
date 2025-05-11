import { BarChart, ChevronUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import getProviderIcon, { getProviderName } from "@/shared/utils/providers-utils"
import { ProviderStatistic } from "@/shared/types/statistics/statistics"

export function ProviderStats( { providers } : {providers: ProviderStatistic[]}) {

  if (!providers.length) return null

  const sortedProviders = [...providers].sort((a, b) => b.messages_sent - a.messages_sent)
  const totalMessages = sortedProviders.reduce((sum, p) => sum + p.messages_sent, 0)
  const providersWithPercentage = sortedProviders.map((p) => ({
    ...p,
    percentage: Math.round((p.messages_sent / totalMessages) * 100) || 0,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <BarChart className="h-4 w-4" />
        <span>Распределение по провайдерам</span>
      </div>

      <div className="space-y-3">
        {providersWithPercentage.map((provider) => (
          <div key={provider.provider_name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                {getProviderIcon(provider.provider_name)}
                <span>{getProviderName(provider.provider_name)}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <span>{provider.messages_sent} сообщений</span>
                <ChevronUp
                  className={`h-4 w-4 text-green-500 ml-1 ${provider.percentage < 5 ? "rotate-180 text-red-500" : ""}`}
                />
                <span className={`${provider.percentage < 5 ? "text-red-500" : "text-green-500"}`}>
                  {provider.percentage}%
                </span>
              </div>
            </div>
            <Progress value={provider.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
