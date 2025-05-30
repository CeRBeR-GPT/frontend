import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { Send, Lock, MessageSquarePlus, CheckCircle, Upload, FileUp, Info } from "lucide-react"
import { Label } from "@/shared/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { useFeedback } from "../model/use-feedback"
import { useAuth } from "@/features/auth/model/use-auth"

export const FormFeedback = () => {
    const { handleSubmitFeedback, handleFileChange, fileError, isSubmitting, message, file, setFile, 
        setName, setMessage, isSuccess, name} = useFeedback()
    const { isAuthenticated } = useAuth()
    return(
        <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900">
            <div className="container px-4 mx-auto md:px-6">
                <div className="max-w-[700px] mx-auto">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center p-2 mb-4 bg-primary/10 rounded-full">
                            <MessageSquarePlus className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Поделитесь мнением</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-[500px] mx-auto">
                            Ваши отзывы помогают нам сделать CeRBeR-AI лучше для всех.
                        </p>
                    </div>

                    {isAuthenticated ? (
                        <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Форма обратной связи</CardTitle>
                            <CardDescription>Расскажите, как мы можем улучшить наш сервис</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="feedbackForm" onSubmit={handleSubmitFeedback} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">
                                        Ваше имя
                                    </label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Как к Вам обращаться?"
                                        className="w-full transition-all focus-visible:ring-primary"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="feedback" className="text-sm font-medium">
                                        Ваш отзыв
                                    </label>
                                    <Textarea
                                        id="feedback"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Поделитесь идеями по улучшению нашего AI-чата"
                                        className="w-full min-h-[150px] transition-all focus-visible:ring-primary resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="file" className="text-sm font-medium">
                                        Прикрепить файл (опционально)
                                    </Label>

                                    <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 mb-3">
                                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <AlertTitle className="text-amber-800 dark:text-amber-400 text-sm font-medium">
                                            Ограничения для файлов
                                        </AlertTitle>
                                        <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
                                            Пожалуйста, не прикрепляйте архивы (.zip, .rar, .7z), исполняемые файлы (.exe, .bat) и
                                            другие потенциально небезопасные файлы. Рекомендуемые форматы: изображения, PDF, документы
                                            Office, текстовые файлы. Максимальный размер: 10 МБ.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="flex items-center gap-2">
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.mp3,.mp4,.wav"
                                    />
                                    <div className="flex-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${fileError ? "border-red-300 dark:border-red-700" : ""}`}
                                            onClick={() => document.getElementById("file")?.click()}
                                        >
                                        <FileUp className={`mr-2 h-4 w-4 ${fileError ? "text-red-500" : ""}`} />
                                            {file ? file.name : fileError ? "Выберите другой файл..." : "Выберите файл..."}
                                        </Button>
                                    </div>
                                    {file && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setFile(null)}
                                            className="h-8 w-8 text-gray-500"
                                        >
                                            <span className="sr-only">Удалить файл</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                            <path d="M18 6 6 18"></path>
                                            <path d="m6 6 12 12"></path>
                                            </svg>
                                        </Button>
                                    )}
                                    </div>
                                    {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
                                    {file && !fileError && (
                                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} МБ</p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center pt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Мы ценим Ваше мнение</p>
                            <Button
                                type="submit"
                                form="feedbackForm"
                                className="gap-2 px-6"
                                disabled={isSubmitting || !!fileError}
                                size="lg"
                            >
                            {isSubmitting ? (
                                <>
                                    Отправка<span className="loading">...</span>
                                </>
                            ) : isSuccess ? (
                                <>
                                    Отправлено <CheckCircle className="w-4 h-4" />
                                </>
                            ) : (
                                <>Отправить отзыв {file ? <Upload className="w-4 h-4" /> : <Send className="w-4 h-4" />}</>
                            )}
                            </Button>
                        </CardFooter>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-lg text-center p-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                                <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Требуется вход</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-[400px] mx-auto">
                            Пожалуйста, войдите в систему, чтобы поделиться отзывом и помочь нам улучшить CeRBeR-AI.
                        </p>
                        <Link href="/auth/login">
                            <Button size="lg" className="px-8">
                            Войти в систему
                            </Button>
                        </Link>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    )
}