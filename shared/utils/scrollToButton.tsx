import { useCallback } from "react"


export const scrollToBottom = (messagesContainerRef: React.RefObject<HTMLDivElement> | null) => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
}