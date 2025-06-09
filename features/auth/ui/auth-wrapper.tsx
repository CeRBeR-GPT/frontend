"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/contexts"

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authChecked } = useAuth()
  const router = useRouter()
  const [initialCheckCompleted, setInitialCheckCompleted] = useState(false)

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/auth/login")
      setInitialCheckCompleted(true)
    }
  }, [isAuthenticated, authChecked, router])

  // Пока не проверили аутентификацию, не рендерим ничего
  if (!authChecked) {
    return null
  }

  // Если не аутентифицирован, но проверка завершена - null (редирект уже выполнится)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}