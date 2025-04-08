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

  useEffect(() => {
    setIsAuth(isAuthenticated)
  }, [isAuthenticated])

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
          Чаты
        </Link>
      ) : null}
    </>
  )
}