'use client';

import { Check, Lock } from 'lucide-react';

import { allProviders } from '@/shared/const';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { ProviderBadge } from '@/shared/ui/provider-badge';
import { cn } from '@/shared/utils';

import { getProviderDescription } from '../lib';
import { ProviderSelectorProps } from '../model';

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
              const isAvailable = availableProviders.includes(provider);
              const isSelected = selectedProvider === provider;

              return (
                <div
                  key={provider}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3 transition-colors',
                    isAvailable ? 'cursor-pointer' : 'opacity-60',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : isAvailable
                        ? 'bg-muted hover:bg-muted/80'
                        : 'bg-muted'
                  )}
                  onClick={() => isAvailable && onProviderChange(provider)}
                >
                  <div className="flex items-center gap-3">
                    <ProviderBadge provider={provider} size="lg" />
                    <div>
                      <p className="font-medium">
                        {provider === 'default'
                          ? 'Стандартный'
                          : provider === 'deepseek'
                            ? 'DeepSeek'
                            : provider === 'gpt_4o_mini'
                              ? 'GPT-4o Mini'
                              : provider === 'gpt_4o'
                                ? 'GPT-4o'
                                : provider === 'gpt_4'
                                  ? 'GPT-4'
                                  : provider}
                      </p>
                      <p className="text-xs opacity-80">{getProviderDescription(provider)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {!isAvailable && (
                      <div className="mr-2 rounded bg-muted-foreground/20 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {provider === 'gpt_4o_mini' ? 'Premium+' : 'Бизнес'}
                      </div>
                    )}
                    {isSelected && <Check className="h-5 w-5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {userPlan !== 'business' && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
              <p className="flex items-center gap-2">
                <Lock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {userPlan === 'default'
                    ? 'Обновите до Premium для доступа к GPT-4o Mini или до Бизнес для всех моделей'
                    : 'Обновите до Бизнес тарифа для доступа ко всем моделям'}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
