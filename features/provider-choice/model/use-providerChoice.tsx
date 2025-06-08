import { UserData } from "@/entities/user/model";
import { providersByPlan } from "@/shared/const/providers";
import { useUser } from "@/shared/contexts/user-context";
import { useState } from "react";

export const useChoiceProvider = ( userData: UserData ) => {
    const [selectedProvider, setSelectedProvider] = useState<string>("default")
    const [availableProviders, setAvailableProviders] = useState<string[]>([])

    const handleProviderChange = (provider: string) => {
        setSelectedProvider(provider)
        localStorage.setItem("selectedProvider", provider)
    }

    const renderData = () => {
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
    }



    return { renderData,  handleProviderChange, selectedProvider, availableProviders};
};
