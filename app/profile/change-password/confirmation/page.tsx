"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Mail } from "lucide-react"
import { Header } from "@/widgets/header/header"

import { ConfirmationForm } from "@/features/updatePassword/ui"
import { useUser } from "@/shared/contexts/user-context"

export default function VerifyPage() {
  const router = useRouter()
  const { getToken, userData } = useUser()
  const email = userData?.email
  const token = getToken()

  useEffect(() => {
    if (!token) {
      router.push("/auth/login")
    }
  }, [token, router])

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
            <CardTitle className="text-2xl font-bold text-center">Проверка пароля</CardTitle>
            <CardDescription className="text-center">
              Мы отправили код подтверждения на <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfirmationForm/>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Не получили код?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.refresh()}>
                Отправить повторно
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}