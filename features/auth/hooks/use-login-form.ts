'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/shared/contexts';
import { AuthSchemaType, formSchema } from '../schemes';

export const useLoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const form = useForm<AuthSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthSchemaType) => {
    setIsSubmitting(true);
    setError('');
    form.clearErrors();

    try {
      const email = values.email;
      const password = values.password;
      const result = await login({ email, password });

      if (result.success) {
        const lastSavedChat = localStorage.getItem('lastSavedChat') || '1';
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
