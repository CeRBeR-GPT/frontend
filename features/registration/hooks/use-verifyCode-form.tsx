import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@/shared/contexts';
import { useRegistration } from './use-registration';
import { formSchema, verifyCodeSchemaType } from '../schemes/verifyCode.schema';
import { chatApi } from '@/entities/chat/api';

export const useVerifyCodeForm = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { verifyEmailCode, verifyCode, registration } = useRegistration();
  const { refreshUserData } = useUser();

  const form = useForm<verifyCodeSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    } else {
      router.push('/auth/register');
    }
  }, [router]);

  async function onSubmit(values: verifyCodeSchemaType) {
    if (!email || !password) return;

    const userData = { email, password };
    setIsSubmitting(true);
    setError('');
    try {
      const response = await verifyEmailCode(email, values.code);
      if (response.status === 200 || response.status === 201) {
        const registrationResponse = await registration(userData);
        if (registrationResponse?.status === 200 || registrationResponse?.status === 201) {
          localStorage.setItem('access_token', registrationResponse.data.access_token);
          const code = values.code;
          const result = await verifyCode({ email, code, password });
          if (result.success) {
            let welcomeChatId = '1';
            localStorage.removeItem('email');
            localStorage.removeItem('password');

            try {
              const chatResponse = await chatApi.getAll();

              if (chatResponse.data) {
                welcomeChatId = chatResponse.data[0].id;
                localStorage.setItem('lastSavedChat', chatResponse.data[0].id);
              }
            } catch (error) {}

            await refreshUserData();
            router.push(`/chat/${welcomeChatId}`);
          } else {
            setError('Ошибка верификации кода.');
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
    error,
    isSubmitting,
    email,
  };
};
