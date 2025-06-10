import { Bot, Cpu, Sparkles, Star, Zap } from 'lucide-react';

interface ProviderIconProps {
  provider: string;
  className?: string;
}

export function ProviderIcon({ provider, className = 'w-4 h-4' }: ProviderIconProps) {
  switch (provider) {
    case 'default':
      return <Bot className={className} />;
    case 'deepseek':
      return <Cpu className={className} />;
    case 'gpt_4o_mini':
      return <Sparkles className={className} />;
    case 'gpt_4o':
      return <Zap className={className} />;
    case 'gpt_4':
      return <Star className={className} />;
    default:
      return <Bot className={className} />;
  }
}
