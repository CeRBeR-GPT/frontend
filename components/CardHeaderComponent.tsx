import { CardHeader,CardTitle, CardDescription } from "./ui/card"
export const CardHeaderComponent = () => {

    return (
        <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для использования AI Chat</CardDescription>
        </CardHeader>
    )
}