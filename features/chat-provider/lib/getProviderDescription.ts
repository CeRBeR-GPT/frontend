
export const getProviderDescription = (provider: string) => {
    switch (provider) {
      case "default":
        return "Базовая модель для повседневных задач"
      case "deepseek":
        return "Мощная модель с открытым исходным кодом"
      case "gpt_4o_mini":
        return "Компактная версия GPT-4o с хорошим балансом скорости и качества"
      case "gpt_4o":
        return "Мультимодальная модель от OpenAI с расширенными возможностями"
      case "gpt_4":
        return "Продвинутая модель от OpenAI для сложных задач"
      default:
        return ""
    }
  }