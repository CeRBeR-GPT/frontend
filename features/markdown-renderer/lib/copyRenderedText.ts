import { RefObject } from "react"
import { ToastFn } from "../model/types"


export const copyRenderedText = async (
  markdownRef: RefObject<HTMLElement | null>,
  handleCopyTextMarkdown: (text: string) => void,
  toast: ToastFn
): Promise<void> => {
  if (markdownRef.current) {
    const renderedText = markdownRef.current.innerText || markdownRef.current.textContent || ""
    try {
      await navigator.clipboard.writeText(renderedText)
      handleCopyTextMarkdown(renderedText)
      toast({
        title: "Текст скопирован",
        description: "Текст скопирован в буфер обмена",
      })
    } catch (err) {
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать текст",
        variant: "destructive",
      })
    }
  }
}