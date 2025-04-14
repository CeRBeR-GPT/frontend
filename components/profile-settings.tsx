'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface propsProfileSetting {
    plan: string
}

const ProfileSettings = ({plan}: propsProfileSetting) => {
    const router = useRouter()
    const { logout, userData} = useAuth()
    
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
                    <div className="text-center">
                        <h2 className="text-lg font-bold">{userData?.email}</h2>
                    </div>
                    <Button variant="outline" asChild>
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
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Текущий тариф</h3>
                    <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="font-bold">{plan}</p>
                        <p className="text-sm text-muted-foreground">
                        {plan === "Базовый" ? "Бесплатно" : plan === "Премиум" ? "999₽" : plan === "Бизнес" ? "2999₽" : ""}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfileSettings