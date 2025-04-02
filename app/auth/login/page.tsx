"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LogIn, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/Header"
import { AuthIcons } from "@/components/AuthIcons"
import { ChoiceAuth } from "@/components/ChoiceAuth"
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
  const {login, isAuthenticated} = useAuth()


  useEffect(() => {
    const token = getToken()
    console.log(token)
    const lastSavedChat = localStorage.getItem("lastSavedChat") || "1"
    console.log("Info", !isAuthenticated, !token)
      if (isAuthenticated || token) {
        router.push(`/chat/${lastSavedChat}`)
      }
      else{
        router.push("/auth/login")
      }
    }, [isAuthenticated, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError("");
    try {
      const result = await login(values.email, values.password);
      const lastSavedChat = localStorage.getItem("lastSavedChat")
      if (lastSavedChat) {
        const chat = JSON.parse(lastSavedChat)
      }
      if (result.success) {
        router.push(`/chat/1`);
        await getUserData()
      } else {
        setError("Неверный email или пароль. Пожалуйста, попробуйте снова.");
      }
    } catch (error) {;
      setError("Произошла ошибка при входе. Пожалуйста, попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getToken = () => localStorage.getItem('access_token');

  const getUserData = async () => {
    try {
      const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const userData = response.data;
    } catch (error) {

    }
  }

  return (
    <div className="flex flex-col min-h-screen">

      <Header/>

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

            <ChoiceAuth text = "Или войти через"/>
            <AuthIcons setError = {setError}/> 
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


