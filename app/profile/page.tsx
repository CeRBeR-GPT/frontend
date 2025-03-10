"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Check, User, Zap, LogIn, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { isAuthenticated, logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Bot className="w-6 h-6" />
              <span>AI Chat</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/chat/chat1" className="text-sm font-medium hover:underline underline-offset-4">
                Chat
              </Link>
              <Link href="/profile" className="text-sm font-medium underline underline-offset-4">
                Profile
              </Link>
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

          <div className="mt-16 w-full">
            <h2 className="text-2xl font-bold text-center mb-8">Доступные тарифы</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Базовый</CardTitle>
                  <CardDescription>Для начинающих пользователей</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">Бесплатно</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>100 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Стандартная модель AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Базовая поддержка</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/auth/register">Начать бесплатно</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Премиум</CardTitle>
                  <CardDescription>Для активных пользователей</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-muted-foreground"> / месяц</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Неограниченные сообщения</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Продвинутая модель AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Приоритетная поддержка</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Без рекламы</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/auth/register">
                      <Zap className="w-4 h-4 mr-2" />
                      Выбрать Премиум
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Бизнес</CardTitle>
                  <CardDescription>Для команд и компаний</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$29.99</span>
                    <span className="text-muted-foreground"> / месяц</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Все функции Премиум</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>До 10 пользователей</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Самая мощная модель AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Аналитика и отчеты</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Выделенная поддержка</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/auth/register">Связаться с продажами</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="w-6 h-6" />
            <span>AI Chat</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/chat/chat1" className="text-sm font-medium hover:underline underline-offset-4">
              Chat
            </Link>
            <Link href="/profile" className="text-sm font-medium underline underline-offset-4">
              Profile
            </Link>
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 max-w-5xl">
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-20 h-20 mt-2">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback>
                      <User className="w-10 h-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user?.email}</h2>
                  </div>
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
                  <p className="font-bold">Базовый</p>
                  <p className="text-sm text-muted-foreground">Бесплатно</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ваша подписка</CardTitle>
                <CardDescription>Управляйте вашим тарифным планом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Использовано сообщений</span>
                      <span className="text-sm font-medium">45 / 100</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-1">Базовый тариф</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      У вас активирован базовый тариф с ограничением в 100 сообщений в день.
                    </p>
                    <Button variant="outline" size="sm">
                      Управление тарифом
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-bold mb-4">Доступные тарифы</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Базовый</CardTitle>
                  <CardDescription>Для начинающих пользователей</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">Бесплатно</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>100 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Стандартная модель AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Базовая поддержка</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Текущий план
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Премиум</CardTitle>
                  <CardDescription>Для активных пользователей</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="text-muted-foreground"> / месяц</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Неограниченные сообщения</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Продвинутая модель AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Приоритетная поддержка</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Без рекламы</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Обновить
                  </Button>
                </CardFooter>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Бизнес</CardTitle>
                  <CardDescription>Для команд и компаний</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">$29.99</span>
                    <span className="text-muted-foreground"> / месяц</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Все функции Премиум</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>До 10 пользователей</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Самая мощная модель AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Аналитика и отчеты</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Выделенная поддержка</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Связаться с продажами
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

