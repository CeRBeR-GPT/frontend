"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/model/use-auth"


export default function ChatRedirect() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {

      const lastSavedChat = localStorage.getItem("lastSavedChat")

      if (lastSavedChat) {
        router.replace(`/chat/${lastSavedChat}`)
      }
    } else {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  return null
}


