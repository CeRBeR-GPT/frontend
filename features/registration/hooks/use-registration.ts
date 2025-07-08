import { useState } from 'react';
import { useAuth } from '@/shared/contexts';
import { regApi } from '../api/api';
import { useMutation } from '@tanstack/react-query';

export const useRegistration = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setIsAuthenticated } = useAuth();

  const verifyCode = async ({
    email,
    code,
    password,
  }: {
    email: string;
    code: string;
    password: string;
  }) => {
    if (code.length === 5 && /^\d+$/.test(code)) {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return { success: true, lastChatId: '1' };
    }
    return { success: false };
  };

  const { mutateAsync: verifyEmailCodeMutation } = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      regApi.verifyEmailCode(email, code),
  });

  const verifyEmailCode = async (email: string, code: string) => {
    try {
      const response = await verifyEmailCodeMutation({ email, code });
      return response;
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Ошибка при проверке кода');
      throw error;
    }
  };

  const { mutateAsync: sendEmailCode } = useMutation({
    mutationFn: (email: string) => regApi.sendEmailCode(email),
    onError: (error: any) => {
      if (error.response?.status === 400) {
        setErrorMessage('Пользователь с такой почтой уже существует.');
      } else {
        setErrorMessage('Произошла ошибка при отправке кода.');
      }
    },
  });

  const registration = async (userData: { email: string; password: string }) => {
    try {
      const response = await reg(userData);
      return response;
    } catch (error: any) {}
  };

  const { mutateAsync: reg, data: reg_data } = useMutation({
    mutationFn: (UserData: { email: string; password: string }) => regApi.registration(UserData),
    onSuccess: (reg_data) => {
      localStorage.setItem('access_token', reg_data?.data.access_token);
      localStorage.setItem('refresh_token', reg_data?.data.refresh_token);
    },
  });

  return {
    verifyCode,
    verifyEmailCode,
    registration,
    sendEmailCode,
    errorMessage,
    setErrorMessage,
  };
};
