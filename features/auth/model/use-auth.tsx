
import { useCallback, useEffect, useState } from 'react';
import { loginApi } from './api';
import { ApiError } from './types';
import { getAccess } from '@/shared/utils';
import { useUser } from '@/shared/contexts';
import { getChatAllApi } from '@/entities/chat/model';

export const useAuth = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const { refreshUserData } = useUser()
    
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
            if (typeof window !== "undefined") {
                const storedIsAuthenticated = localStorage.getItem('isAuthenticated')
                if (storedIsAuthenticated === 'true') {
                    setIsAuthenticated(true)
                }
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            refreshUserData().then(() => {
                setAuthChecked(true);
            });
        }
    }, [isAuthenticated, refreshUserData]);

    const login = async (email: string, password: string) => {
        try {
            const response = await loginApi(email, password)

            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('isAuthenticated', 'true');

                setIsAuthenticated(true);
                await refreshUserData();
                setAuthChecked(true);

                const lastSavedChat = localStorage.getItem("lastSavedChat")
                let welcomeChatId = "1"
                if (!lastSavedChat) {
                    try {
                        const chatResponse = await getChatAllApi()
                        if (chatResponse.data){
                            welcomeChatId = chatResponse.data[0].id
                            localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
                        }
                    } catch (error) {
                    }
                }

                return {success: true, lastChatId: lastSavedChat || welcomeChatId};
            }
            return {success: false};
        } catch (error: unknown) {
            const apiError = error as ApiError;
            
            if (apiError.response?.status === 401) {
                throw new Error("Неверный логин или пароль. Пожалуйста, попробуйте снова!");
            } else {
                throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова!");
            }
        }
    };

  return { 
    login, 
    isAuthenticated, 
    setIsAuthenticated, 
    authChecked, 
    setAuthChecked, 
    isLoading: isLoading || !authChecked,
    getToken
   };
};
