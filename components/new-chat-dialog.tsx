"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sparkles, MessageSquarePlus } from "lucide-react"

const formSchema = z.object({
  chatName: z
    .string()
    .min(1, { message: "Название чата не может быть пустым" })
    .max(50, { message: "Название чата не должно превышать 50 символов" }),
})

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewChatDialog = ({ open, onOpenChange }: NewChatDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // В реальном приложении здесь был бы запрос к API для создания нового чата
      // Для демонстрации просто перенаправим на страницу нового чата
      console.log("Создание нового чата:", values.chatName)

      // Имитация задержки запроса
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Закрываем диалог и перенаправляем на страницу нового чата
      onOpenChange(false)
      router.push("/chat/new")
    } catch (error) {
      console.error("Error creating chat:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Новый чат
          </DialogTitle>
          <DialogDescription>Введите название для вашего нового чата. Вы сможете изменить его позже.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chatName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название чата</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Помощь с проектом" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Создание...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Создать чат</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}