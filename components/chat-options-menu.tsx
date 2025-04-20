"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,DropdownMenuTrigger } 
         from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, Eraser, AlertTriangle } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
         AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { EditChatDialog } from "@/components/edit-chat-dialog"

interface ChatOptionsMenuProps {
  chatId: string
  chatTitle: string
  onDelete: (chatId: string) => void
  onClear: (chatId: string) => void
  onRename: (chatId: string, newTitle: string) => void
}

export function ChatOptionsMenu({ chatId, chatTitle, onDelete, onClear, onRename }: ChatOptionsMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = () => {
    onDelete(chatId)
    setIsDeleteDialogOpen(false)
  }

  const handleClear = () => {
    onClear(chatId)
    setIsClearDialogOpen(false)
  }

  const handleRename = (newTitle: string) => {
    onRename(chatId, newTitle)
    setIsEditDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-70 hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Опции чата</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => {
            setIsEditDialogOpen(true)
            }}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Переименовать</span>
        </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsClearDialogOpen(true)}>
            <Eraser className="mr-2 h-4 w-4" />
            <span>Очистить сообщения</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Удалить чат</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Удаление чата
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить чат "{chatTitle}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Eraser className="h-5 w-5 text-amber-500" />
              Очистка сообщений
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите очистить все сообщения в чате "{chatTitle}"? История сообщений будет удалена, но
              сам чат останется.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600">
              Очистить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditChatDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        chatTitle={chatTitle}
        onSave={handleRename}
      />
    </>
  )
}

