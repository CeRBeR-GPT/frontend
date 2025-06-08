"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Mail } from "lucide-react"
import { Header } from "@/widgets/header/header"
import { VerifyCodeForm } from "@/features/registration/ui"
import { useVerifyCodeForm } from "@/features/registration/model"
import { useEffect } from "react"
import { useAuth } from "@/features/auth/model"
import { useUser } from "@/shared/contexts/user-context"

export default function VerifyPage() {
  const router = useRouter()
  const { email } = useVerifyCodeForm()
  const { isAuthenticated, setAuthChecked} = useAuth()
  const { refreshUserData } = useUser()
  // useEffect(() => {
  //   const savedEmail = localStorage.getItem("email")
  //   const savedPassword = localStorage.getItem("password")
    
  //   if (savedEmail && savedPassword) {
  //     setEmail(savedEmail)
  //     setPassword(savedPassword)
  //   } else {
  //     router.push("/auth/register")
  //   }
  // }, [router])

  // useEffect(() => {
  //     if (isAuthenticated) {
  //         refreshUserData().then(() => {
  //             setAuthChecked(true);
  //         });
  //     }
  // }, [isAuthenticated, refreshUserData]);

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
            <VerifyCodeForm/>
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