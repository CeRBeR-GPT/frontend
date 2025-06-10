'use client';

import { useEffect } from 'react';

import { Check, Lock } from 'lucide-react';

import { useUser } from '@/shared/contexts';
import getProviderIcon, {
  getProviderDescription,
  getProviderName,
} from '@/shared/utils/providers-utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/card';
import { useChoiceProvider } from '../model';

const ProviderChoice = () => {
  const { userData } = useUser();
  const { renderData, handleProviderChange, selectedProvider, availableProviders } =
    useChoiceProvider(userData);

  useEffect(() => {
    renderData();
  }, [userData]);

  return (
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
                const isSelected = selectedProvider === provider;
                return (
                  <div
                    key={provider}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
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
                    {isSelected && <Check className="h-5 w-5" />}
                  </div>
                );
              })}
            </div>

            {userData?.plan !== 'business' && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {userData?.plan === 'default'
                      ? 'Обновите до Premium для доступа к GPT-4o Mini или до Бизнес для всех моделей'
                      : 'Обновите до Бизнес тарифа для доступа ко всем моделям'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderChoice;
