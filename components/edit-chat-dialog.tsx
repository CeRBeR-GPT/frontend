"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } 
from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Save } from "lucide-react"

interface EditChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatTitle: string
  onSave: (newTitle: string) => void
}

export function EditChatDialog({ open, onOpenChange, chatTitle, onSave }: EditChatDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(chatTitle)

  useEffect(() => {
    if (open) {
      setTitle(chatTitle)
    }
  }, [chatTitle, open])

  async function handleSave() {
    if (!title.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      onSave(title)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating chat title:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
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
        <div className="space-y-4">
          <div>
            <label htmlFor="chatTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Название чата
            </label>
            <Input
              id="chatTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting || !title.trim()}>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}