import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export const NavLinks = () => {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState(false)

  // Используем useEffect для отслеживания изменений состояния аутентификации
  useEffect(() => {
    setIsAuth(isAuthenticated)
  }, [isAuthenticated])
  const lastSavedChat = localStorage.getItem("lastSavedChat")
  const chat = lastSavedChat ? JSON.parse(lastSavedChat) : "chat"
  
  return (
    <>
      {isAuth ? (
        <Link
          href= {`/chat/${chat}`}
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