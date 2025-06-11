import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/shared/contexts';
import { VerifyPasswordCodeApi } from '../api/api';
import { useUpdatePassword } from './use-updatePassword';
import { ConfirmationSchemaType, formSchema } from '../schemes/confirmation.schema';

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
    try {
      const response = await VerifyPasswordCodeApi(email, values.code);
      if (response.status === 200 || response.status === 201) {
        const newPassword = localStorage.getItem('new_password');
        if (newPassword !== null) {
          try {
            const result = await updatePassword(newPassword);
            if (result !== undefined && result.success) {
              setTimeout(() => {
                router.push('/profile');
              }, 2000);
            }
          } catch (error) {
          } finally {
            setIsSubmitting(false);
          }
        }
      }
    } catch (error) {
      setError('Произошла ошибка при проверке кода. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
    setError,
  };
};
