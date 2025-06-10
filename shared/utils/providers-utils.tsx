import { Bot, Cpu, Sparkles, Star, Zap } from 'lucide-react';

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'default':
      return <Bot className="h-5 w-5" />;
    case 'deepseek':
      return <Cpu className="h-5 w-5" />;
    case 'gpt_4o_mini':
      return <Sparkles className="h-5 w-5" />;
    case 'gpt_4o':
      return <Zap className="h-5 w-5" />;
    case 'gpt_4':
      return <Star className="h-5 w-5" />;
    default:
      return <Bot className="h-5 w-5" />;
  }
};

export default getProviderIcon;

export const getProviderName = (provider: string) => {
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

export const getProviderDescription = (provider: string) => {
  switch (provider) {
    case 'default':
      return 'Базовая модель для повседневных задач';
    case 'deepseek':
      return 'Мощная модель с открытым исходным кодом';
    case 'gpt_4o_mini':
      return 'Компактная версия GPT-4o с хорошим балансом скорости и качества';
    case 'gpt_4o':
      return 'Мультимодальная модель от OpenAI с расширенными возможностями';
    case 'gpt_4':
      return 'Продвинутая модель от OpenAI для сложных задач';
    default:
      return '';
  }
};
