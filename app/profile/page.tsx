"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Check, User, Zap, LogIn, LogOut, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/user-menu"
import { useRouter } from "next/navigation"
import {NavLinks} from "@/components/nav-links"
import { useEffect, useState } from "react"
import axios from "axios"
import { useRef } from "react"

interface UserData {
  id: string;
  email: string;
  plan: string;
  available_message_count: number;
  message_length_limit: number;
  message_count_limit: number
}


export default function ProfilePage() {
  const { isAuthenticated, logout, user} = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)

  const isRequested = useRef(false);

  useEffect(() => {
    const getToken = () => localStorage.getItem('access_token');
    const token = getToken();

    const getUserData = async () => {
      if (isRequested.current) return;
      isRequested.current = true; 

      try {
        const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data;
        console.log("User data fetched:", userData);
        setUserData(userData)
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (token) {
      getUserData();
    }
  }, []);

  const payForPremium = async (plan: string) => {
    const getToken = () => localStorage.getItem('access_token');
    const token = getToken();
    console.log(token)
    console.log('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiZGltLm1hbHVja293MjAxN0B5YW5kZXgucnUiLCJ1dWlkIjoiODExYmVmYWUtY2MxZC00ZDVjLThjNDctOTcwOWJmNmY1ZDIwIiwiZXhwIjoxNzQyMDY3MTUwLCJpYXQiOjE3NDE5ODA3NTB9.UUm9ZAMToft-I6V8no8sHOPKQ8TsCDg1IB1AVB9kde7YoYm9eg6XdgAgdEeAalBKj_OwrIiw4CZpw1tfiEV7SUnR_1-tdvea40dHnnWkLLQ47RrCaAaFZkp14wHFduAMoWlZCve95TgOiCWLg5tXMlCp-7hO1PjoPgS8zG3LfCcMgJSZZTb0VTC9Y1P6BUbIbrNE2vsPmG-eaFC9xtrO9pu5Yck65xzBnvi8FFIvbUHks7EUHWxMaiL1q1JUMlK4kblzWPxEUvUjgcCvLnZkZKaMXntkRZwbnLr_ju5hMAg4W49Ax5yeXER0wtr3RYdtADLLt42CepAk23zOkU0bxA' === token)
    try {
      const response = await axios.post(`https://api-gpt.energy-cerber.ru/transaction/new_payment?plan=${plan}`, {},  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log(response.data.url)
      router.replace(response.data.url)
    } catch (error) {
      console.error("Fail to pay:", error);
    }
  }

  let available_message_count = userData ? userData.available_message_count: 1;
  let message_count_limit = userData ? userData.message_count_limit: 1
  let plan = userData?.plan === "default"
  ? "Базовый"
  : userData?.plan === "premium"
    ? "Премиум"
    : userData?.plan === "business"
      ? "Бизнес"
      : "дефолт";

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
                      <span>10 сообщений в день</span>
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
                      <span>50 сообщений в день</span>
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
                      <span>100 сообщений в день</span>
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
            <NavLinks />
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
                    <AvatarImage src="/user.png?height=85&width=85" />
                    <AvatarFallback>
                      <User className="w-10 h-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user?.email}</h2>
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
                  <p className="text-sm text-muted-foreground">{plan === "Базовый" ? "Бесплатно" : 
                  plan === "Премиум" ? "999₽" : plan === "Бизнес" ? "2999₽" : ""}</p>
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
                      <span className="text-sm font-medium">{message_count_limit - available_message_count} / {message_count_limit}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(message_count_limit - available_message_count) / message_count_limit * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-1">{plan} тариф</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      У вас активирован {plan} тариф с ограничением в {message_count_limit} сообщений в день.
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
              <Card className={plan !== "Базовый" ? "border-2 border-gray-200" : "border-2 border-primary"}>
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
                      <span>10 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ограничение: 2000 символов</span>
                    </li>
                  </ul>
                </CardContent>
                {plan === "Базовый" && (
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Текущий план
                    </Button>
                </CardFooter>
                )}
              </Card>
              <Card className={plan !== "Премиум" ? "border-2 border-gray-200" : "border-2 border-primary"}>
                <CardHeader>
                  <CardTitle>Премиум</CardTitle>
                  <CardDescription>Для активных пользователей</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">999₽</span>
                    <span className="text-muted-foreground"> / месяц</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>50 сообщений в день</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Ограничение: 10000 символов</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Фотокарточка Кирилла</span>
                    </li>
                  </ul>
                </CardContent>
                {plan === "Премиум" && (
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Текущий план
                    </Button>
                  </CardFooter>)}
                
                {plan === "Базовый" && (
                  <CardFooter>
                    <Button onClick = {() => payForPremium("premium")} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Обновить
                    </Button>
                  </CardFooter>)}
              </Card>
              <Card className={plan !== "Бизнес" ? "border-2 border-gray-200" : "border-2 border-primary"}>
                <CardHeader>
                  <CardTitle>Бизнес</CardTitle>
                  <CardDescription>Для команд и компаний</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">2999₽</span>
                    <span className="text-muted-foreground"> / месяц</span>
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
                      <span>Ограничение: 20000 символов</span>
                    </li>
                    
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Удочка в подарок</span>
                    </li>
                  </ul>
                </CardContent>
                {plan === "Бизнес" && (
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Текущий план
                    </Button>
                  </CardFooter>)}
                
                  {plan === "Премиум"  && (
                  <CardFooter>
                    <Button onClick = {() => payForPremium("business")} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Обновить
                    </Button>
                  </CardFooter>)}
                  {plan === "Базовый"  && (
                  <CardFooter>
                    <Button onClick = {() => payForPremium("business")} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Обновить
                    </Button>
                  </CardFooter>)}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}