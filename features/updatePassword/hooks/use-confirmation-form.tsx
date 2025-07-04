import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/shared/contexts';
import { updatePasswordApi } from '../api';
import { useUpdatePassword } from './use-updatePassword';
import { ConfirmationSchemaType, formSchema } from '../schemes/confirmation.schema';
import { useMutation } from '@tanstack/react-query';

export const useConfirmationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { userData } = useUser();
  const { updatePassword } = useUpdatePassword();

  const form = useForm<ConfirmationSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(values: ConfirmationSchemaType) {
    setIsSubmitting(true);
    setError('');
    const email = userData?.email;
    const code = values.code;
    verifyCode({ email, code });
  }

  const { mutate: verifyCode } = useMutation({
    mutationFn: ({ email, code }: { email: string | undefined; code: string }) =>
      updatePasswordApi.VerifyPasswordCode(email, code),
    onSuccess: () => {
      const newPassword = localStorage.getItem('new_password');
      if (newPassword !== null) {
        passwordUpdate(newPassword);
      }
    },
    onError: () => {
      setError('Произошла ошибка при проверке кода. Пожалуйста, попробуйте снова.');
      setIsSubmitting(false);
    },
  });

  const { mutate: passwordUpdate } = useMutation({
    mutationFn: (newPassword: string) => updatePassword(newPassword),
    onSuccess: () => {
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    },
    onError: () => {
      setError('Произошла ошибка при обновлении пароля. Пожалуйста, попробуйте снова.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
    setError,
  };
};
