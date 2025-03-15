"use client"

import { useState, useEffect } from "react"
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
import { Pencil, Save } from "lucide-react"

const formSchema = z.object({
  chatTitle: z
    .string()
    .min(1, { message: "Название чата не может быть пустым" })
    .max(50, { message: "Название чата не должно превышать 50 символов" }),
})

interface EditChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatTitle: string
  onSave: (newTitle: string) => void
}

export function EditChatDialog({ open, onOpenChange, chatTitle, onSave }: EditChatDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatTitle: chatTitle,
    },
  })

  // Обновляем значение формы при изменении chatTitle или открытии диалога
  useEffect(() => {
    if (open) {
      form.reset({ chatTitle: chatTitle })
    }
  }, [chatTitle, open, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Имитация задержки запроса
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Вызываем функцию сохранения с новым названием
      onSave(values.chatTitle)
    } catch (error) {
      console.error("Error updating chat title:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Редактирование чата
          </DialogTitle>
          <DialogDescription>Измените название чата на более подходящее.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chatTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название чата</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
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
                    <span>Сохранение...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Сохранить</span>
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