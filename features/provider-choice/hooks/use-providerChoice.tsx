import { useState } from 'react';

import { providersByPlan } from '@/shared/const';
import { UserData } from '@/entities/user/types';

export const useChoiceProvider = (userData: UserData) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('default');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    localStorage.setItem('selectedProvider', provider);
  };

  const renderData = () => {
    if (userData) {
      const providers =
        providersByPlan[userData.plan as keyof typeof providersByPlan] || providersByPlan.default;
      setAvailableProviders(providers);
      const savedProvider = localStorage.getItem('selectedProvider');
      if (savedProvider && providers.includes(savedProvider)) {
        setSelectedProvider(savedProvider);
      } else {
        setSelectedProvider(providers[0]);
        localStorage.setItem('selectedProvider', providers[0]);
      }
    }
  };

  return { renderData, handleProviderChange, selectedProvider, availableProviders };
};
