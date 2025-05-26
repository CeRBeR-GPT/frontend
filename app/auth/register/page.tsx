"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/UI/card"
import { AlertTriangle } from "lucide-react"
import { Header } from "@/widgets/header/header"
import { AuthIcons } from "@/features/oAuth/ui/AuthIcons"
import { ChoiceAuth } from "@/components/ChoiceAuth"
import { Alert, AlertDescription, AlertTitle } from "@/components/UI/alert"
import { SendCodeForm } from "@/features/registration/ui/sendCode-form"

export default function RegisterPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для использования CeRBeR-AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Внимание!</AlertTitle>
                <AlertDescription>
                  <div>
                    В настоящее время регистрация через почту с доменом @mail.ru недоступна из-за проблем с доставкой кода подтверждения.
                    <br />
                    Пожалуйста, используйте альтернативные способы регистрации.
                    <br />
                    Проверяйте, пожалуйста, спам!
                  </div>
                </AlertDescription>
            </Alert>
            <SendCodeForm/>
            <ChoiceAuth text = "Или зарегистрироваться через"/>
            <AuthIcons/>
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

