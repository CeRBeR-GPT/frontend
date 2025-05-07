

import { useEffect, useState } from 'react';
import { loginApi } from './api';
import { getUserData } from '@/features/user/model/use-user';

export const useAuth = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true)

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

    const login = async (email: string, password: string) => {
        try {
            const response = await loginApi(email, password)

            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('isAuthenticated', 'true');

                setIsAuthenticated(true);
                await getUserData();

                const lastSavedChat = localStorage.getItem("lastSavedChat")
                let welcomeChatId = "1"
                // if (!lastSavedChat) {
                //     try {
                //         const chatResponse = await getChatAllApi()
                //         if (chatResponse.data)
                //         {
                //             welcomeChatId = chatResponse.data[0].id
                //             localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
                //         }
                //     } catch (error) {
                //     }
                // }

                return {success: true, lastChatId: lastSavedChat || welcomeChatId, isLoading: isLoading || !authChecked};
            }
            return {success: false};
        } catch (error) {
            if (error.response.status === 401) {
                throw new Error("Неверный логин или пароль. Пожалуйста, попробуйте снова!");
            }
            else {
                throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова!");
            }
        }
    };

  return { login, isAuthenticated, setIsAuthenticated, authChecked, setAuthChecked };
};
