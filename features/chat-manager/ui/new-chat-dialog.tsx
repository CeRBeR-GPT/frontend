'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { z } from 'zod';

import { createChatApi } from '@/entities/chat/model';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

const formSchema = z.object({
  chatName: z
    .string()
    .min(1, { message: 'Название чата не может быть пустым' })
    .max(50, { message: 'Название чата не должно превышать 50 символов' }),
});

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewChatDialog = ({ open, onOpenChange }: NewChatDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatName, setChatName] = useState('');
  const [error, setError] = useState<null | string>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatName: '',
    },
  });

  async function onSubmit() {
    setIsSubmitting(true);
    try {
      const response = await createChatApi(chatName);
      onOpenChange(false);
      router.push(`/chat/${response.data.id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setError('Превышен лимит чатов по вашему тарифу');
      }
    } finally {
      setIsSubmitting(false);
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
          <DialogDescription>
            Введите название для вашего нового чата. Вы сможете изменить его позже.
          </DialogDescription>
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
                    <Input
                      placeholder="Например: Помощь с проектом"
                      {...field}
                      autoFocus
                      onChange={(e) => {
                        field.onChange(e);
                        setChatName(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setError(null);
                }}
              >
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
  );
};
