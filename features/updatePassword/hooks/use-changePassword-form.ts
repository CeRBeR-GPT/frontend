import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { getVerifyPasswordCodeApi } from '../api/api';
import { ChangePasswordSchemaType, formSchema } from '../schemes/change-password.schema';

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

  async function onSubmit(values: ChangePasswordSchemaType) {
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
