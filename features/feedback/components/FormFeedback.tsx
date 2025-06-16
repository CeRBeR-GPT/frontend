import Link from 'next/link';

import { CheckCircle, FileUp, Info, Lock, MessageSquarePlus, Send, Upload } from 'lucide-react';

import { useAuth } from '@/shared/contexts';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';
import { FeedbackIcon } from '@/shared/components/feedback-icon';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import { useFeedback } from '../hooks';

export const FormFeedback = () => {
  const {
    handleSubmitFeedback,
    handleFileChange,
    fileError,
    isSubmitting,
    message,
    file,
    setFile,
    setName,
    setMessage,
    isSuccess,
    name,
  } = useFeedback();
  const { isAuthenticated } = useAuth();
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12 dark:from-gray-900/50 dark:to-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-[700px]">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-2">
              <MessageSquarePlus className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Поделитесь мнением</h2>
            <p className="mx-auto mt-2 max-w-[500px] text-gray-500 dark:text-gray-400">
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
                      className="min-h-[150px] w-full resize-none transition-all focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-sm font-medium">
                      Прикрепить файл (опционально)
                    </Label>

                    <Alert className="mb-3 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertTitle className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        Ограничения для файлов
                      </AlertTitle>
                      <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                        Пожалуйста, не прикрепляйте архивы (.zip, .rar, .7z), исполняемые файлы
                        (.exe, .bat) и другие потенциально небезопасные файлы. Рекомендуемые
                        форматы: изображения, PDF, документы Office, текстовые файлы. Максимальный
                        размер: 10 МБ.
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
                          className={`w-full justify-start text-left font-normal ${fileError ? 'border-red-300 dark:border-red-700' : ''}`}
                          onClick={() => document.getElementById('file')?.click()}
                        >
                          <FileUp className={`mr-2 h-4 w-4 ${fileError ? 'text-red-500' : ''}`} />
                          {file
                            ? file.name
                            : fileError
                              ? 'Выберите другой файл...'
                              : 'Выберите файл...'}
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
                          <FeedbackIcon />
                        </Button>
                      )}
                    </div>
                    {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
                    {file && !fileError && (
                      <p className="mt-1 text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} МБ
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-2">
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
                      Отправлено <CheckCircle className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Отправить отзыв{' '}
                      {file ? <Upload className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-0 p-8 text-center shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <Lock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Требуется вход</h3>
              <p className="mx-auto mb-6 max-w-[400px] text-gray-500 dark:text-gray-400">
                Пожалуйста, войдите в систему, чтобы поделиться отзывом и помочь нам улучшить
                CeRBeR-AI.
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
  );
};
