import { PROGRAMMING_LANGUAGES } from "@/shared/const/PROGRAMMING_LANGUAGES"


export function detectLanguage(className?: string): string {
  if (!className) return "text"

  for (const lang of PROGRAMMING_LANGUAGES) {
    if (className.includes(lang)) {
      return lang
    }
  }

  const match = /language-(\w+)/.exec(className)
  return match?.[1] || "text"
}