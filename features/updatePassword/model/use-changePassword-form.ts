import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getVerifyPasswordCodeApi } from './api';

const formSchema = z
  .object({
    newPassword: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
    confirmPassword: z.string().min(6, { message: 'Пароли не совпадают' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const useChangePasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    localStorage.setItem('new_password', values.newPassword);
    setIsSubmitting(true);
    try {
      await getVerifyPasswordCodeApi();
      router.push('/profile/change-password/confirmation');
    } catch (error) {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    onSubmit,
    isSubmitting,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };
};
