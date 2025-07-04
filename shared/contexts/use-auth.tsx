'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { userApi } from '@/entities/user/api';

import { getAccess } from '../utils';
import { useUser } from './user-context';
import { chatApi } from '@/entities/chat/api';
import { ApiError } from '@/features/auth/types';
import { AuthContextType } from '../types/context';
import { useMutation } from '@tanstack/react-query';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authChecked: false,
  isLoading: true,
  setIsAuthenticated: () => {},
  setAuthChecked: () => {},
  getToken: async () => null,
  login: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshUserData } = useUser();

  const getToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!accessToken || !refreshToken) return null;

    try {
      return await getAccess(accessToken, refreshToken);
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
        if (storedIsAuthenticated === 'true') {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData().then(() => {
        setAuthChecked(true);
      });
    }
  }, [isAuthenticated, refreshUserData]);

  const { mutateAsync: login } = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await userApi.login(email, password);

      if (!response.data?.access_token) {
        return { success: false };
      }

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('isAuthenticated', 'true');

      setIsAuthenticated(true);
      // await refreshUserData();
      setAuthChecked(true);

      const lastSavedChat = localStorage.getItem('lastSavedChat');
      let welcomeChatId = '1';
      // if (!lastSavedChat) {
      //   try {
      //     const chatResponse = await chatApi.getAll();
      //     if (chatResponse.data) {
      //       welcomeChatId = chatResponse.data[0].id;
      //       localStorage.setItem('lastSavedChat', chatResponse.data[0].id);
      //     }
      //   } catch (error) {}
      // }

      return { success: true, lastChatId: lastSavedChat || welcomeChatId };
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 401) {
        throw new Error('Неверный логин или пароль. Пожалуйста, попробуйте снова!');
      } else {
        throw new Error('Произошла ошибка при входе. Пожалуйста, попробуйте снова!');
      }
    },
  });

  return (
    <AuthContext.Provider
      value={{
        login,
        isAuthenticated,
        setIsAuthenticated,
        authChecked,
        setAuthChecked,
        isLoading: isLoading || !authChecked,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
