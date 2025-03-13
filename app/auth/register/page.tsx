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
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import axios from "axios"
import { Header } from "@/components/Header"
import { AuthIcons } from "@/components/AuthIcons"

const formSchema = z
  .object({
    email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
    password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
    confirmPassword: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await sendEmailCode(values.email);
  
      if (response.status === 200 || response.status === 201) {
        router.push(
          `/auth/verify?email=${encodeURIComponent(values.email)}&password=${encodeURIComponent(values.password)}`,
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const sendEmailCode = async (email: string) => {
    try {
      const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/register/verify_code?email=${email}`);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErrorMessage("Пользователь с такой почтой уже существует.");
      } else {
        setErrorMessage("Произошла ошибка при отправке кода.");
      }
      throw error;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex-1 container flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для использования AI Chat</CardDescription>
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
                        <Input placeholder="your@email.com" {...field}/>
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
                          <Input type={showPassword ? "text" : "password"} placeholder="••••••" {...field}/>
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Подтверждение пароля</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••" {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Отправка...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Продолжить</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>

                {errorMessage && (
                  <div className="text-red-500 text-sm text-center mt-4">
                    {errorMessage}
                  </div>
                )}
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Или зарегистрироваться через</span>
              </div>
            </div>

            <AuthIcons setError={setErrorMessage}/>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="text-primary underline underline-offset-4">
                Войти
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

