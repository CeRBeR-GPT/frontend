import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordApi } from '../api';
import { ChangePasswordSchemaType, formSchema } from '../schemes/change-password.schema';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useChangePasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { mutate: getVerifyCode } = useMutation({
    mutationFn: () => updatePasswordApi.getVerifyPasswordCode(),
    onSuccess: () => {
      router.push('/profile/change-password/confirmation');
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: ChangePasswordSchemaType) {
    localStorage.setItem('new_password', values.newPassword);
    setIsSubmitting(true);
    getVerifyCode(); // Вызов мутации
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
