"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LogIn, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/Header"
import { AuthIcons } from "@/components/AuthIcons"
import { ChoiceAuth } from "@/components/ChoiceAuth"

const formSchema = z.object({
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
})

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { login, isAuthenticated, getToken } = useAuth()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken()
        if (isAuthenticated || token) {
          const lastSavedChat = localStorage.getItem("lastSavedChat") || "1"
          router.push(`/chat/${lastSavedChat}`)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [isAuthenticated, router])

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
    form.clearErrors()
    
    try {
      const result = await login(values.email, values.password)
      
      if (result.success) {
        const lastSavedChat = localStorage.getItem("lastSavedChat") || "1"
        router.push(`/chat/${lastSavedChat}`)
      } else {
        setError(result.error || "Неверный email или пароль. Пожалуйста, попробуйте снова.")
      }
    } catch (error) {
      setError("Произошла ошибка при входе. Пожалуйста, попробуйте снова.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
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
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••" 
                            {...field} 
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
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

            <ChoiceAuth text="Или войти через" />
            <AuthIcons setError={setError} disabled={isSubmitting} />
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Нет аккаунта?{" "}
              <Link 
                href="/auth/register" 
                className="text-primary underline underline-offset-4"
                onClick={(e) => isSubmitting && e.preventDefault()}
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
