'use client'

import { Check, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/ui/card"
import getProviderIcon, { getProviderDescription, getProviderName } from "@/shared/utils/providers-utils"
import { useEffect, useState } from "react";
import { providersByPlan } from "@/shared/const/providers"
import { useUser } from "@/shared/contexts/user-context";

const ProviderChoice = () => {
    const { userData } = useUser()
    const [selectedProvider, setSelectedProvider] = useState<string>("default")
    const [availableProviders, setAvailableProviders] = useState<string[]>([])

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

    const handleProviderChange = (provider: string) => {
      setSelectedProvider(provider)
      localStorage.setItem("selectedProvider", provider)
    }

    return(
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
                      <Lock className="w-4 h-4 flex-shrink-0"/>
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
    )
}

export default ProviderChoice