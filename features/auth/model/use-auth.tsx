"use client"

import {createContext, useContext, useState, useEffect, useCallback, useRef} from "react"
import {getAccess} from "@/utils/tokens-utils";
import type { DailyStatistic } from "@/components/statistics/activity-heatmap"
import { getChatAllApi, getUserDataApi, loginApi, registartionApi, updatePasswordApi, verifyEmailCodeApi } from "@/api/api";

type UserData = {
    id: string,
    email: string,
    plan: string,
    plan_expire_date: Date,
    available_message_count: number,
    message_length_limit: number,
    message_count_limit: number
} | null

interface IUserDataRegistration {
    email: string;
    password: string;
  }

type AuthContextType = {
    userData: UserData
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string, error?: string; }>
    verifyCode: (email: string, code: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
    logout: () => void
    updatePassword: (newPassword: string) => Promise<{ success: boolean } | undefined>
    isLoading: boolean
    Login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
    getUserData: () => Promise<void>
    getToken: () => Promise<string | null>,
    success: () => { success: boolean },
    refreshStatistics: () => void;
    verifyEmailCode: (email: string, code: string) => Promise<{status: number}>;
    registartion: (UserData: IUserDataRegistration) => Promise<{status: number, data: { access_token: string; refresh_token: any; };}>

}
const AuthContext = createContext<AuthContextType>({
    userData: null,
    isAuthenticated: false,
    login: async () => ({success: false}),
    verifyCode: async () => ({success: false}),
    logout: () => {},
    isLoading: false,
    Login: async () => ({success: false}),
    getToken: async () => null,
})

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [authChecked, setAuthChecked] = useState(false);
    const [statistics, setStatistics] = useState<DailyStatistic[]>([])
    const [statisticsLoading, setStatisticsLoading] = useState(true)

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


    const getToken = useCallback(async (): Promise<string | null> => {
        if (typeof window === "undefined") return null;

        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) return null;

        return await getAccess(accessToken, refreshToken);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await loginApi(email, password)

            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('isAuthenticated', 'true');

                setIsAuthenticated(true);

                const lastSavedChat = localStorage.getItem("lastSavedChat")
                let welcomeChatId = "1"
                if (!lastSavedChat) {
                    try {
                        const chatResponse = await getChatAllApi()
                        if (chatResponse.data)
                        {
                            welcomeChatId = chatResponse.data[0].id
                            localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
                        }
                    } catch (error) {
                    }
                }

                return {success: true, lastChatId: lastSavedChat || welcomeChatId};
            }
            return {success: false};
        } catch (error) {
            // @ts-ignore
            if (error.response.status === 401) {
                throw new Error("Неверный логин или пароль. Пожалуйста, попробуйте снова!");
            }
            else {
                throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова!");
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUserData(null);
        setIsAuthenticated(false);
        setAuthChecked(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading: isLoading || !authChecked,
                login,
                logout,
                Login: login,
                getToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)


