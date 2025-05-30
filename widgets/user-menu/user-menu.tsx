"use client"

import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, 
  DropdownMenuTrigger} from "@/shared/ui/dropdown-menu"
import { useAuth } from "@/features/auth/model/use-auth"
import { Logout } from "@/features/logout/ui/logout"
import { useUser } from "@/shared/contexts/user-context"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function UserMenu() {
  const { isAuthenticated, authChecked } = useAuth()
  const { userData } = useUser()
  //const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(isAuthenticated)
  }, [isAuthenticated])

  // const handleLogout = () => {
  //   logout()
  //   router.push("/")
  // }

  if (!isAuth) {
    return (
      <Button size="sm" asChild>
        <Link href="/auth/login">Войти</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">Профиль</Link>
        </DropdownMenuItem>

        <Logout/>
        {/* <DropdownMenuItem className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Выйти</span>
        </DropdownMenuItem> */}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

