
import { useCallback, useEffect, useState } from 'react';
import { loginApi } from './api';
import { getChatAllApi } from '@/api/api';
import { ApiError, UserData } from './types';
import { getAccess } from '@/shared/utils/tokens-utils';
import { useStatistics } from '@/features/statistics/model/use-statistics';
import { useUserData } from '@/entities/user/model/use-user';

export const useAuth = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    // const { setStatistics } = useStatistics()
    const { fetchUserData } = useUserData()
    
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
    
    // const fetchUserData = useCallback(async (): Promise<UserData | null> => {
    //     setLoading(true);
    //     setError(null);

    //     try {
    //         const token = await getToken();
    //         if (!token) {
    //         throw new Error('No valid token');
    //         }

    //         const response = await getUserDataApi();

    //         setUserData(response.data);
    //         // if (response.data?.statistics) {
    //         //     setStatistics(response.data.statistics)
    //         // }
    //         setIsAuthenticated(true);
    //         setAuthChecked(true);
    //         return response.data;
    //     } catch (err) {
    //         const message = err instanceof Error ? err.message : 'Unknown error';
    //         setIsAuthenticated(false);
    //         setAuthChecked(true);
    //         localStorage.removeItem('isAuthenticated');
    //         localStorage.removeItem('access_token');
    //         localStorage.removeItem('refresh_token');
    //         setError(message);
    //         setUserData(null);
    //         return null;
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [getToken]);

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
        if (isAuthenticated && !authChecked) {
            fetchUserData().then(() => {
                setAuthChecked(true)
                setIsAuthenticated(true)
            })
        }
    }, [isAuthenticated, authChecked, fetchUserData]);

    const login = async (email: string, password: string) => {
        try {
            const response = await loginApi(email, password)

            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('isAuthenticated', 'true');

                setIsAuthenticated(true);
                await fetchUserData();

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
