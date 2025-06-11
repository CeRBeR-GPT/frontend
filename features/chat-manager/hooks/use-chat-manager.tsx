import { useState } from 'react';

interface ChatOptionsMenuProps {
  chatId: string;
  onDelete: (chatId: string) => void;
  onClear: (chatId: string) => void;
  onRename: (chatId: string, newTitle: string) => void;
}

export const useChatManager = ({ chatId, onDelete, onClear, onRename }: ChatOptionsMenuProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete(chatId);
    setIsDeleteDialogOpen(false);
  };

  const handleClear = () => {
    onClear(chatId);
    setIsClearDialogOpen(false);
  };

  const handleRename = (newTitle: string) => {
    onRename(chatId, newTitle);
    setIsEditDialogOpen(false);
  };

  return {
    handleDelete,
    handleClear,
    handleRename,
    isDeleteDialogOpen,
    isClearDialogOpen,
    isEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsClearDialogOpen,
    setIsEditDialogOpen,
  };
};
