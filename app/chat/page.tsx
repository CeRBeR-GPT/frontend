"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function ChatRedirect() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // В реальном приложении здесь будет запрос к API для получения ID последнего чата
      const mockRecentChatId = "chat1" // Это будет приходить из вашей базы данных
      router.replace(`/chat/${mockRecentChatId}`)
    } else {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  return null // Этот компонент не рендерит ничего, он только выполняет редирект
}

