import { useCallback, useEffect, useState } from 'react';

import { useChats } from '@/entities/chat/hooks';
import { PROVIDERS_BY_PLAN } from '@/shared/const';
import { useUser } from '@/shared/contexts';

export const useChangeProvider = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('default');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const { chatId, initializeWebSocket } = useChats();
  const { userData } = useUser();

  useEffect(() => {
    if (userData) {
      const providers =
        PROVIDERS_BY_PLAN[userData.plan as keyof typeof PROVIDERS_BY_PLAN] ||
        PROVIDERS_BY_PLAN.default;
      setAvailableProviders(providers);
      const savedProvider = localStorage.getItem('selectedProvider');
      if (savedProvider && providers.includes(savedProvider)) {
        setSelectedProvider(savedProvider);
      } else {
        setSelectedProvider(providers[0]);
        localStorage.setItem('selectedProvider', providers[0]);
      }
    }
  }, [userData]);

  const handleProviderChange = useCallback(
    (provider: string) => {
      setSelectedProvider(provider);
      localStorage.setItem('selectedProvider', provider);
      initializeWebSocket(chatId);
    },
    [chatId, initializeWebSocket]
  );

  return {
    handleProviderChange,
    selectedProvider,
    availableProviders,
  };
};
