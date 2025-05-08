'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLogout } from "@/features/logout/model/use-logout"
//import { useUserData } from "@/features/user/model/use-user"
import { useAuth } from "@/features/auth/model/use-auth"

const ProfileSettings = () => {
    const router = useRouter()
    const { userData } = useAuth()
    const { logout } = useLogout()
    
    const handleLogout = () => {
        logout()
        router.push("/")
    }

    return(
        <div className="flex flex-col gap-6">
            <Card>
                <CardContent className="p-4">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-20 h-20 mt-2">
                        <AvatarImage src="/user.png?height=85&width=85" />
                        <AvatarFallback>
                            <User className="w-10 h-10" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 w-full">
                        <input
                            id="email"
                            value={userData?.email || ""}
                            readOnly
                            disabled
                            className="px-3 py-2 border border-gray-300 rounded-md bg-muted text-muted-foreground w-full text-center"
                        />
                    </div>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/profile/change-password" className="w-full">
                            <Lock className="w-4 h-4 mr-2" />
                            Изменить пароль
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full mt-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={handleLogout}
                        >
                        <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                    </Button>
                </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfileSettings