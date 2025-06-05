import { useChats } from "@/entities/chat/model";
import { useUser } from "@/shared/contexts/user-context";
import { useCallback, useEffect, useState } from "react";

export const useChangeProvider = () => {

    const providersByPlan = {
        default: ["default", "deepseek"],
        premium: ["default", "deepseek", "gpt_4o_mini"],
        business: ["default", "deepseek", "gpt_4o_mini", "gpt_4o", "gpt_4"],
    }

    const [selectedProvider, setSelectedProvider] = useState<string>("default")
    const [availableProviders, setAvailableProviders] = useState<string[]>([])
    const { chatId, initializeWebSocket } = useChats()
    const { userData } = useUser()

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

    const handleProviderChange = useCallback( (provider: string) => {
          setSelectedProvider(provider)
          localStorage.setItem("selectedProvider", provider)
          initializeWebSocket(chatId)
        },
        [chatId, initializeWebSocket],
      )


    return { 
        handleProviderChange, selectedProvider, availableProviders
    };
};
