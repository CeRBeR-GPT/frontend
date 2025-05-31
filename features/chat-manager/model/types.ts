
export interface ChatOptionsMenuProps {
  chatId: string
  chatTitle: string
  onDelete: (chatId: string) => void
  onClear: (chatId: string) => void
  onRename: (chatId: string, newTitle: string) => void
}