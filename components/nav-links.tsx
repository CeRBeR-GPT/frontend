"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export const NavLinks = () => {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  return (
    <>
      {isAuthenticated ? (
        <Link
          href="/chat/chat1"
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