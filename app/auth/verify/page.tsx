"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Bot, Mail } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import axios from "axios"


interface IUserDataRegistration{
  email: string;
  password: string;
}

const formSchema = z.object({
  code: z.string().min(5, { message: "Код должен содержать 5 цифр" }).max(5),
})

export default function VerifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const password = searchParams.get("password") || ""
  const { register, verifyCode } = useAuth()

  useEffect(() => {
    if (!email) {
      router.push("/auth/register")
    }
  }, [email, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userData = {
      email,
      password,
    };
    setIsSubmitting(true);
    setError("");
    try {
      const response = await verifyEmailCode(email, values.code);
      if (response.status === 200 || response.status === 201) {
        const registrationResponse = await registartionApi(userData);
        if (registrationResponse.status === 200 || registrationResponse.status === 201) {
          localStorage.setItem("access_token", registrationResponse.data.access_token);
  
          // Обновляем состояние аутентификации
          await register(email, password);
  
          // Верифицируем код и сохраняем пользователя
          const isVerified = await verifyCode(email, values.code, password);
          if (isVerified) {
            router.push("/chat");
          } else {
            setError("Ошибка верификации кода.");
          }
        } else {
          setError("Ошибка регистрации. Пожалуйста, попробуйте снова.");
          console.error("Ошибка регистрации:", registrationResponse.status, registrationResponse.data);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Произошла ошибка при проверке кода. Пожалуйста, попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const verifyEmailCode = async (email: string, code: string) => {
    try {
      const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/register/verify_code?email=${email}&code=${code}`);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const registartionApi = async (userData: IUserDataRegistration) => {
    try {
      const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/register`, userData);
      return response;
    } catch (error) {
      throw error;
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
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Проверка Email</CardTitle>
            <CardDescription className="text-center">
              Мы отправили код подтверждения на <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Код подтверждения</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          {...field}
                          maxLength={5}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="one-time-code"
                        />
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
                      <span>Проверка...</span>
                    </div>
                  ) : (
                    "Подтвердить"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Не получили код?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.refresh()}>
                Отправить повторно
              </Button>
            </div>
            <div className="text-center text-sm">
              <Link href="/auth/register" className="text-primary underline underline-offset-4">
                Использовать другой email
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

