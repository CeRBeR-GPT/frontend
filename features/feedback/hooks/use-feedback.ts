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
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { getToken } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: ({
      name,
      message,
      formData,
    }: {
      name: string;
      message: string;
      formData: FormData;
    }) => feedbackApi.handleSubmitFeedback(name, message, formData),
    onSuccess: () => {
      toast({
        title: 'Отзыв отправлен',
        description: 'Спасибо за Ваш отзыв! Мы ценим Ваше мнение.',
      });

      setName('');
      setMessage('');
      setFile(null);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast({
          title: 'Сессия истекла',
          description: 'Ваша сессия завершена. Пожалуйста, войдите снова, чтобы оставить отзыв.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Ошибка отправки',
          description: 'Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.',
          variant: 'destructive',
        });
      }
      setIsSubmitting(false);
    },
  });

  const handleSubmitFeedback = async (e: any) => {
    e.preventDefault();

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

    setIsSubmitting(true);
    setIsSuccess(false);

    const token = await getToken();
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в систему, чтобы оставить отзыв.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    mutate({ name, message, formData });
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
