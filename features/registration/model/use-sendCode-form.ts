import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useRegistration } from './use-registration';

const formSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Пожалуйста, введите корректный email' })
      .refine((email) => !email.endsWith('@mail.ru'), {
        message: 'Регистрация с @mail.ru временно недоступна',
      }),
    password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
    confirmPassword: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const useSendCodeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { sendEmailCode, setErrorMessage } = useRegistration();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await sendEmailCode(values.email);

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('email', values.email);
        localStorage.setItem('password', values.password);
        router.push(`/auth/verify`);
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    onSubmit,
    isSubmitting,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
  };
};
