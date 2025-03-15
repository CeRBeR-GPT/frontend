"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function ChatRedirect() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Получаем последний сохраненный чат из localStorage
      const lastSavedChat = localStorage.getItem("lastSavedChat")
      console.log(lastSavedChat)

      if (lastSavedChat) {
        const chat = JSON.parse(lastSavedChat)
        console.log("Последний сохраненный чат:", chat)

        // Формируем путь для редиректа
         // Предполагаем, что у чата есть поле `id`
        router.replace(`/chat/${chat}`) // Редирект на страницу чата с конкретным ID
      } else {
        // Если последний чат не найден, редиректим на страницу по умолчанию
        router.replace("/chat")
      }
    } else {
      // Если пользователь не аутентифицирован, редиректим на главную страницу
      router.replace("/")
    }
  }, [isAuthenticated, router])

  return null // Этот компонент не рендерит ничего, он только выполняет редирект
}


