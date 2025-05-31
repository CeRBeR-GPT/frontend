import Link from "next/link"
import { Bot, User, LogIn } from "lucide-react"
import { ThemeToggle } from "@/shared/ui/theme-toggle"
import { UserMenu } from "@/widgets/user-menu/user-menu"
import { NavLinks } from "@/widgets/navigation/nav-links"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"

const WithoutAuth = () => {
    return(
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
        <main className="flex-1 container mx-auto px-4 py-12 md:px-6 max-w-5xl flex flex-col items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Профиль недоступен</CardTitle>
              <CardDescription>Пожалуйста, войдите в систему для доступа к вашему профилю</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <div className="rounded-full bg-muted p-6">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground">
                Войдите в систему, чтобы управлять вашей подпиской и просматривать статистику использования.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button size="lg" className="w-full" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Войти
                </Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link href="/auth/register" className="text-primary underline underline-offset-4">
                  Зарегистрироваться
                </Link>
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
}

export default WithoutAuth