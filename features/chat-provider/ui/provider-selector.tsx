"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Check, Lock } from "lucide-react"
import { ProviderBadge } from "@/shared/ui/provider-badge"
import { cn } from "@/shared/utils/utils"
import { getProviderDescription } from "../lib/getProviderDescription"
import { ProviderSelectorProps } from "../model/types"
import { allProviders } from "@/shared/const/providers"

export function ProviderSelector({
  availableProviders,
  selectedProvider,
  onProviderChange,
  userPlan,
}: ProviderSelectorProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Провайдер</CardTitle>
        <CardDescription>Выберите предпочитаемую модель AI для общения</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3">
            {allProviders.map((provider) => {
              const isAvailable = availableProviders.includes(provider)
              const isSelected = selectedProvider === provider

              return (
                <div
                  key={provider}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isAvailable ? "cursor-pointer" : "opacity-60",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isAvailable
                        ? "bg-muted hover:bg-muted/80"
                        : "bg-muted",
                  )}
                  onClick={() => isAvailable && onProviderChange(provider)}
                >
                  <div className="flex items-center gap-3">
                    <ProviderBadge provider={provider} size="lg" />
                    <div>
                      <p className="font-medium">
                        {provider === "default"
                          ? "Стандартный"
                          : provider === "deepseek"
                            ? "DeepSeek"
                            : provider === "gpt_4o_mini"
                              ? "GPT-4o Mini"
                              : provider === "gpt_4o"
                                ? "GPT-4o"
                                : provider === "gpt_4"
                                  ? "GPT-4"
                                  : provider}
                      </p>
                      <p className="text-xs opacity-80">{getProviderDescription(provider)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {!isAvailable && (
                      <div className="mr-2 text-xs font-medium px-2 py-0.5 rounded bg-muted-foreground/20 text-muted-foreground">
                        {provider === "gpt_4o_mini" ? "Premium+" : "Бизнес"}
                      </div>
                    )}
                    {isSelected && <Check className="w-5 h-5" />}
                  </div>
                </div>
              )
            })}
          </div>

          {userPlan !== "business" && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
              <p className="flex items-center gap-2">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>
                  {userPlan === "default"
                    ? "Обновите до Premium для доступа к GPT-4o Mini или до Бизнес для всех моделей"
                    : "Обновите до Бизнес тарифа для доступа ко всем моделям"}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}