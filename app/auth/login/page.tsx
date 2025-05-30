"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { useLoginForm } from "@/features/auth/model/use-login-form"
import { Header } from "@/widgets/header/header"
import { FORM } from "@/features/auth/ui/form"
import { ChoiceAuth } from "@/shared/ui/ChoiceAuth"
import { AuthIcons } from "@/features/oAuth/ui/AuthIcons"
import Link from "next/link"

export default function LoginPage() {
  const { isSubmitting } = useLoginForm()

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
            <FORM/>
            <ChoiceAuth text="Или войти через" />
            <AuthIcons/>
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
