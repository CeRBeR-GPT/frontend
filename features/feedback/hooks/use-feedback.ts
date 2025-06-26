import { useState } from 'react';

import { ALLOWED_FILE_TYPES, blockedExtensions } from '@/shared/const';
import { useUser } from '@/shared/contexts';
import { useToast } from '@/shared/hooks';
import { feedbackApi } from '../api';
import { useMutation } from '@tanstack/react-query';

export const useFeedback = () => {
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { getToken } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { mutateAsync, isSuccess, reset } = useMutation({
    mutationFn: async ({
      name,
      message,
      file,
    }: {
      name: string;
      message: string;
      file: File | null;
    }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }

      return feedbackApi.handleSubmitFeedback(name, message, formData);
    },
    onError: (error: any) => {
      if (error.message === 'Требуется авторизация') {
        toast({
          title: 'Требуется авторизация',
          description: 'Пожалуйста, войдите в систему, чтобы оставить отзыв.',
          variant: 'destructive',
        });
      } else if (error.response?.status === 401) {
        toast({
          title: 'Сессия истекла',
          description: 'Ваша сессия завершена. Пожалуйста, войдите снова.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Ошибка отправки',
          description: 'Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Отзыв отправлен',
        description: 'Спасибо за Ваш отзыв! Мы ценим Ваше мнение.',
      });
    },
  });

  const handleSubmitFeedback = async (
    e: React.FormEvent,
    name: string,
    message: string,
    file: File | null,
    fileError: string | null,
    setName: (value: string) => void,
    setMessage: (value: string) => void,
    setFile: (value: File | null) => void
  ) => {
    e.preventDefault();
    console.log(name, message);
    // Валидация
    if (!name.trim() || !message.trim()) {
      toast({
        title: 'Не заполнены поля',
        description: 'Пожалуйста, укажите Ваше имя и текст отзыва.',
        variant: 'destructive',
      });
      return;
    }

    if (fileError) {
      toast({
        title: 'Проблема с файлом',
        description: fileError,
        variant: 'destructive',
      });
      return;
    }

    try {
      await mutateAsync({ name, message, file });

      // Сброс формы после успешной отправки
      setName('');
      setMessage('');
      setFile(null);

      // Автоматический сброс статуса успеха через 3 секунды
      setTimeout(() => reset(), 3000);
    } catch {
      // Ошибки уже обрабатываются в onError
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const fileName = selectedFile.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

      if (blockedExtensions.includes(fileExtension)) {
        setFileError(
          `Файлы с расширением ${fileExtension} не поддерживаются из соображений безопасности.`
        );
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(selectedFile.type) && selectedFile.type !== '') {
        setFileError(`Тип файла ${selectedFile.type || fileExtension} не поддерживается.`);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('Размер файла не должен превышать 10 МБ.');
        return;
      }

      setFile(selectedFile);
    }
  };

  return {
    handleSubmitFeedback,
    isSubmitting,
    isSuccess,
    handleFileChange,
    name,
    fileError,
    message,
    file,
    setName,
    setMessage,
    setFile,
  };
};
