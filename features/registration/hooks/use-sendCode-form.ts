import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';

import { useRegistration } from './use-registration';
import { formSchema, sendCodeSchemaType } from '../schemes/sendCode.schema';

export const useSendCodeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { sendEmailCode, setErrorMessage } = useRegistration();
  const router = useRouter();

  const form = useForm<sendCodeSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: sendCodeSchemaType) {
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
