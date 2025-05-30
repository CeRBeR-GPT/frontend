import { CardHeader,CardTitle, CardDescription } from "./UI/card"
export const CardHeaderComponent = () => {

    return (
        <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для использования CeRBeR-AI</CardDescription>
        </CardHeader>
    )
}