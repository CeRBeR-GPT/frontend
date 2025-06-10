'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/shared/contexts';

const formSchema = z.object({
  email: z.string().email({ message: 'Пожалуйста, введите корректный email' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
});

export const useLoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError('');
    form.clearErrors();

    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        const lastSavedChat = localStorage.getItem('lastSavedChat') || '1';
        // router.push(`/chat/${lastSavedChat}`);
        window.location.href = `/chat/${lastSavedChat}`;
      } else {
        setError('Неверный email или пароль');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
    showPassword,
    setShowPassword,
    setError,
  };
};
