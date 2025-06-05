"use client"
import Link from "next/link"
import { Card, CardContent } from "@/shared/ui/card"
import { Bot } from "lucide-react"
import { ThemeToggle } from "@/shared/ui/theme-toggle"
import { UserMenu } from "@/widgets/user-menu/user-menu"
import { NavLinks } from "@/widgets/navigation/nav-links"
import { useEffect } from "react"
import WithoutAuth from "@/features/auth/ui/WithoutAuth"
import { StatisticsDashboard } from "../../features/statistics/ui/statistics-dashboard"
import ProfileSettings from "@/widgets/profile/profile-settings"
import Subscription from "@/widgets/profile/subscription"
import ProviderChoice from "@/features/provider-choice/ui/provider-choice"
import Tarifs from "@/features/pay-for-plan/ui/tarifs"
import { useAuth } from "@/features/auth/model"
import { useUser } from "@/shared/contexts/user-context"
import { useRouter } from "next/navigation"
import { getToken } from "@/shared/utils/tokens-utils"

export default function ProfilePage() {
  const { isAuthenticated} = useAuth()
  const { refreshUserData } = useUser()
  const router = useRouter()
  const token = getToken()

  useEffect(() => {
    if (token) {
      refreshUserData()
    }
    if (!token) {
      router.push("/auth/login")
    }
  }, [token])
    

  if (!isAuthenticated) { return <WithoutAuth /> }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="w-6 h-6" />
            <span>CeRBeR-AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <NavLinks />
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <ProfileSettings/>
          <Subscription/>
        </div>

        <div className="mt-8 mb-8 w-full">
          <h2 className="text-xl font-bold mb-4">Статистика использования</h2>
          <Card className="w-full">
            <CardContent className="pt-6 px-2 sm:px-4 md:px-6">
              <StatisticsDashboard/>
            </CardContent>
          </Card>
        </div>
        <ProviderChoice/>
        <Tarifs/>
      </main>
    </div>
  )
}
