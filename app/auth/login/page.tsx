"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Bot, LogIn, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import axios from "axios"

const formSchema = z.object({
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
})

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, socialLogin } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError("")
    try {
      //console.log(values.email, values.password)
      const response = await Login(values.email, values.password);
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('access_token', response.data.access_token);
        login(values.email, values.password)
        router.push("/chat")
      }else {
        setError("Неверный email или пароль. Пожалуйста, попробуйте снова.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Произошла ошибка при входе. Пожалуйста, попробуйте снова.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const Login = (email: string, password: string) => {
    try {
      const response = axios.post(`https://api-gpt.energy-cerber.ru/user/login?email=${email}&password=${password}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  const handleSocialLogin = async (provider: "google" | "yandex" | "vk") => {
    try {
      await socialLogin(provider)
      router.push("/chat")
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setError(`Произошла ошибка при входе через ${provider}. Пожалуйста, попробуйте снова.`)
    }
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
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1 container flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
            <CardDescription>Введите ваши данные для входа в аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••" {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <div className="text-sm font-medium text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Вход...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span>Войти</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Или войти через</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("google")}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("yandex")}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                  <path
                    d="M2.04297 0H21.957C23.0859 0 24 0.914062 24 2.04297V21.957C24 23.0859 23.0859 24 21.957 24H2.04297C0.914062 24 0 23.0859 0 21.957V2.04297C0 0.914062 0.914062 0 2.04297 0Z"
                    fill="#FC3F1D"
                  />
                  <path
                    d="M13.6285 20.1074H15.8848V3.89258H12.5391C9.29297 3.89258 7.32422 5.80078 7.32422 8.44922C7.32422 10.5117 8.20312 11.8574 10.0195 13.3945L6.32812 20.1074H8.73047L12.0762 13.9336L10.8223 13.0195C9.15234 11.7656 8.53125 10.7598 8.53125 8.66016C8.53125 6.63281 9.9375 5.30859 12.5391 5.30859H13.6285V20.1074Z"
                    fill="white"
                  />
                </svg>
                Яндекс
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("vk")}>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                  <path
                    d="M21.5793 0H2.42075C1.08366 0 0 1.08366 0 2.42075V21.5793C0 22.9163 1.08366 24 2.42075 24H21.5793C22.9163 24 24 22.9163 24 21.5793V2.42075C24 1.08366 22.9163 0 21.5793 0Z"
                    fill="#4C75A3"
                  />
                  <path
                    d="M18.9409 13.7934C18.9409 13.7934 20.3739 15.2083 20.7248 15.8608C20.7339 15.8745 20.7384 15.8882 20.7429 15.8973C20.8978 16.1574 20.9388 16.3625 20.8568 16.5129C20.7202 16.7684 20.2739 16.8914 20.1099 16.9005H17.8903C17.6848 16.9005 17.2523 16.8413 16.7287 16.4813C16.3232 16.1939 15.9222 15.7432 15.5349 15.3016C14.9613 14.6764 14.4696 14.1437 13.9733 14.1437C13.9279 14.1437 13.8825 14.1483 13.8371 14.1574C13.4225 14.2347 12.8944 14.8236 12.8944 16.2613C12.8944 16.6804 12.5617 16.9005 12.3244 16.9005H11.2863C10.9127 16.9005 8.92391 16.7592 7.16945 14.9184C5.00403 12.6443 3.04248 8.18471 3.02791 8.14647C2.90041 7.83255 3.18791 7.66328 3.50183 7.66328H5.74055C6.11328 7.66328 6.22621 7.87739 6.30621 8.09149C6.40003 8.34237 6.66547 9.12419 7.14547 10.0213C7.92729 11.5318 8.41638 12.1571 8.80821 12.1571C8.87821 12.1571 8.94366 12.1389 9.00456 12.1025C9.51275 11.8197 9.40891 9.85816 9.38526 9.44724C9.38526 9.37724 9.38526 8.77633 9.18026 8.47149C9.03463 8.25283 8.77828 8.17283 8.62356 8.14011C8.69356 8.04174 8.78738 7.89611 8.90578 7.80683C9.17578 7.61092 9.65578 7.57724 10.1322 7.57724H10.5513C11.0731 7.58633 11.2513 7.63365 11.4977 7.70365C11.9986 7.83115 12.0123 8.09149 11.9623 9.01149C11.9441 9.30724 11.9259 9.64935 11.9259 10.0531C11.9259 10.1651 11.9213 10.2862 11.9213 10.4119C11.9031 10.9519 11.8804 11.5682 12.2677 11.8288C12.3131 11.8606 12.3676 11.8743 12.4221 11.8743C12.5441 11.8743 12.9086 11.8743 13.9733 10.0486C14.4696 9.12419 14.8569 8.05633 14.8842 7.97633C14.9204 7.91088 15.0106 7.77428 15.1189 7.72241C15.1962 7.68871 15.2734 7.68871 15.3507 7.68871H17.8903C18.1686 7.68871 18.3604 7.73603 18.4059 7.84349C18.4877 8.01276 18.4059 8.45733 17.2659 10.0213C17.0968 10.2536 16.9459 10.4541 16.8148 10.6318C15.7767 12.0513 15.7767 12.1298 16.8876 13.1679C17.5583 13.7934 18.0546 14.2256 18.3604 14.5577C18.6708 14.8989 18.9409 15.2083 18.9409 15.2083V13.7934Z"
                    fill="white"
                  />
                </svg>
                ВКонтакте
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Нет аккаунта?{" "}
              <Link href="/auth/register" className="text-primary underline underline-offset-4">
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

