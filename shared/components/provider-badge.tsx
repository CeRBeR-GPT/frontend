import { ProviderIcon } from '@/shared/components/provider-icon';
import { cn } from '@/shared/utils';

interface ProviderBadgeProps {
  provider: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProviderBadge({
  provider,
  size = 'md',
  showLabel = false,
  className,
}: ProviderBadgeProps) {
  const getLabel = () => {
    switch (provider) {
      case 'default':
        return 'Стандартный';
      case 'deepseek':
        return 'DeepSeek';
      case 'gpt_4o_mini':
        return 'GPT-4o Mini';
      case 'gpt_4o':
        return 'GPT-4o';
      case 'gpt_4':
        return 'GPT-4';
      default:
        return provider;
    }
  };

  const getBgColor = () => {
    switch (provider) {
      case 'default':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'deepseek':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'gpt_4o_mini':
        return 'bg-purple-100 dark:bg-purple-900/30';
      case 'gpt_4o':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'gpt_4':
        return 'bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getTextColor = () => {
    switch (provider) {
      case 'default':
        return 'text-gray-700 dark:text-gray-300';
      case 'deepseek':
        return 'text-blue-700 dark:text-blue-300';
      case 'gpt_4o_mini':
        return 'text-purple-700 dark:text-purple-300';
      case 'gpt_4o':
        return 'text-green-700 dark:text-green-300';
      case 'gpt_4':
        return 'text-amber-700 dark:text-amber-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1',
        getBgColor(),
        getTextColor(),
        className
      )}
    >
      <ProviderIcon provider={provider} className={iconSize} />
      {showLabel && (
        <span
          className={cn(
            'font-medium',
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
          )}
        >
          {getLabel()}
        </span>
      )}
    </div>
  );
}
