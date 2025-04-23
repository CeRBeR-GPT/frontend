"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/Header"
import { getChatAllApi } from "@/api/api"

const formSchema = z.object({
  code: z.string().min(5, { message: "Код должен содержать 5 цифр" }).max(5),
})

export default function VerifyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { verifyCode, getUserData, verifyEmailCode,  registartion } = useAuth()

  useEffect(() => {
    const savedEmail = localStorage.getItem("email")
    const savedPassword = localStorage.getItem("password")
    
    if (savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
    } else {
      router.push("/auth/register")
    }
  }, [router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email || !password) return

    const userData = { email, password };
    setIsSubmitting(true);
    setError("");
    try {
      const response = await verifyEmailCode(email, values.code);
      if (response.status === 200 || response.status === 201) {
        const registrationResponse = await registartion(userData);
        if (registrationResponse.status === 200 || registrationResponse.status === 201) {
          localStorage.setItem("access_token", registrationResponse.data.access_token);
          
          const result = await verifyCode(email, values.code, password);
          if (result.success) {
            let welcomeChatId = "1"
            localStorage.removeItem("email")
            localStorage.removeItem("password")
            
            try {
              const chatResponse = await getChatAllApi()
              
              if (chatResponse.data) {
                welcomeChatId = chatResponse.data[0].id
                localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
              }
            } catch (error) {
            }
            await getUserData()
            router.push(`/chat/${welcomeChatId}`);
          } else {
            setError("Ошибка верификации кода.");
          }
        }
      }
    } catch (error) {
      setError("Произошла ошибка при проверке кода. Пожалуйста, попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
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
                          placeholder="12345"
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