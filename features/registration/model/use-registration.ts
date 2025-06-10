import { useState } from 'react';

import { useAuth } from '@/shared/contexts';

import { registartionApi, sendEmailCodeApi, verifyEmailCodeApi } from './api';

export const useRegistration = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setIsAuthenticated } = useAuth();

  const verifyCode = async (email: string, code: string, password: string) => {
    if (code.length === 5 && /^\d+$/.test(code)) {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return { success: true, lastChatId: '1' };
    }
    return { success: false };
  };

  const verifyEmailCode = async (email: string, code: string) => {
    try {
      return await verifyEmailCodeApi(email, code);
    } catch (error) {
      throw error;
    }
  };

  const sendEmailCode = async (email: string) => {
    try {
      const response = await sendEmailCodeApi(email);
      return response;
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMessage('Пользователь с такой почтой уже существует.');
      } else {
        setErrorMessage('Произошла ошибка при отправке кода.');
      }
      throw error;
    }
  };

  const registartion = async (userData: { email: string; password: string }) => {
    try {
      const response = await registartionApi(userData);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    verifyCode,
    verifyEmailCode,
    registartion,
    sendEmailCode,
    errorMessage,
    setErrorMessage,
  };
};
