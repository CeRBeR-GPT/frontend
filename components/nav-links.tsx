"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export const NavLinks = () => {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState(false)
  const [chat, setChat] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("lastSavedChat") || "1"
    }
    return "1"
  })

  // Используем useEffect для отслеживания изменений состояния аутентификации
  useEffect(() => {
    setIsAuth(isAuthenticated)
  }, [isAuthenticated])

  // Используем useEffect для работы с localStorage только на клиенте
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastSavedChat = localStorage.getItem("lastSavedChat")
      if (lastSavedChat) {
        setChat(lastSavedChat)
      }
    }
  }, [])

  return (
    <>
      {isAuth ? (
        <Link
          href={`/chat/${chat}`}
          className={`text-sm font-medium ${pathname.includes("/chat") ? "underline" : "hover:underline"} underline-offset-4`}
        >
          Chat
        </Link>
      ) : null}
      <Link
        href="/profile"
        className={`text-sm font-medium ${pathname === "/profile" ? "underline" : "hover:underline"} underline-offset-4`}
      >
        Profile
      </Link>
    </>
  )
}