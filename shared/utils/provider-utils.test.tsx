import { Bot, Cpu, Sparkles, Star, Zap } from 'lucide-react';
import { getProviderName, getProviderDescription } from '../utils/providers-utils';
import getProviderIcon from '../utils/providers-utils';

describe('getProviderIcon', () => {
  it('возвращает <Bot className="h-5 w-5" /> при значении default', () => {
    expect(getProviderIcon('default')).toEqual(<Bot className="h-5 w-5" />);
  });

  it('возвращает <Cpu className="h-5 w-5" /> при значении deepseek', () => {
    expect(getProviderIcon('deepseek')).toEqual(<Cpu className="h-5 w-5" />);
  });

  it('возвращает <Sparkles className="h-5 w-5" /> при значении gpt_4o_mini', () => {
    expect(getProviderIcon('gpt_4o_mini')).toEqual(<Sparkles className="h-5 w-5" />);
  });

  it('возвращает <Zap className="h-5 w-5" /> при значении gpt_4o', () => {
    expect(getProviderIcon('gpt_4o')).toEqual(<Zap className="h-5 w-5" />);
  });

  it('возвращает <Star className="h-5 w-5" /> при значении gpt_4', () => {
    expect(getProviderIcon('gpt_4')).toEqual(<Star className="h-5 w-5" />);
  });

  it('возвращает <Bot className="h-5 w-5" /> при отличном значении от остальных', () => {
    expect(getProviderIcon('gpt')).toEqual(<Bot className="h-5 w-5" />);
  });
});

describe('getProviderName', () => {
  it('возвращает Стандартный при значении default', () => {
    expect(getProviderName('default')).toBe('Стандартный');
  });

  it('возвращает DeepSeek при значении deepseek', () => {
    expect(getProviderName('deepseek')).toBe('DeepSeek');
  });

  it('возвращает GPT-4o Mini при значении gpt_4o_mini', () => {
    expect(getProviderName('gpt_4o_mini')).toBe('GPT-4o Mini');
  });

  it('возвращает GPT-4o при значении gpt_4o', () => {
    expect(getProviderName('gpt_4o')).toBe('GPT-4o');
  });

  it('возвращает GPT-4 при значении gpt_4', () => {
    expect(getProviderName('gpt_4')).toBe('GPT-4');
  });

  it('возвращает тоже самое при отличном значении от остальных', () => {
    expect(getProviderName('gpt')).toBe('gpt');
  });
});

describe('getProviderDescription', () => {
  it('возвращает Базовая модель для повседневных задач при значении default', () => {
    expect(getProviderDescription('default')).toBe('Базовая модель для повседневных задач');
  });

  it('возвращает Мощная модель с открытым исходным кодом при значении deepseek', () => {
    expect(getProviderDescription('deepseek')).toBe('Мощная модель с открытым исходным кодом');
  });

  it('возвращает Компактная версия GPT-4o с хорошим балансом скорости и качества при значении gpt_4o_mini', () => {
    expect(getProviderDescription('gpt_4o_mini')).toBe(
      'Компактная версия GPT-4o с хорошим балансом скорости и качества'
    );
  });

  it('возвращает Мультимодальная модель от OpenAI с расширенными возможностями при значении gpt_4o', () => {
    expect(getProviderDescription('gpt_4o')).toBe(
      'Мультимодальная модель от OpenAI с расширенными возможностями'
    );
  });

  it('возвращает Продвинутая модель от OpenAI для сложных задач при значении gpt_4', () => {
    expect(getProviderDescription('gpt_4')).toBe('Продвинутая модель от OpenAI для сложных задач');
  });

  it('возвращает пустую строку при отличном значении от остальных', () => {
    expect(getProviderDescription('gpt')).toBe('');
  });
});
