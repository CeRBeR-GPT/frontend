"use client"

import {createContext, useContext, useState, useEffect, useCallback, useRef} from "react"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import {getAccess} from "@/utils/tokens-utils";
import type { DailyStatistic } from "@/components/statistics/activity-heatmap"
import { useRouter } from "next/navigation"

type UserData = {
    id: string,
    email: string,
    plan: string,
    available_message_count: number,
    message_length_limit: number,
    message_count_limit: number
} | null

interface IUserDataRegistration {
    email: string;
    password: string;
  }

interface tokensInterface{
    "access_token": string,
    "refresh_token": string,
    "token_type": "Bearer"
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
    statistics: DailyStatistic[];
    statisticsLoading: boolean,
    verifyEmailCode: (email: string, code: string) => Promise<{status: number}>;
    registartionApi: (UserData: IUserDataRegistration) => Promise<{status: number, data: { access_token: string; refresh_token: any; };}>

}
const AuthContext = createContext<AuthContextType>({
    userData: null,
    isAuthenticated: false,
    login: async () => ({success: false}),
    verifyCode: async () => ({success: false}),
    logout: () => {},
    updatePassword: async () => ({success: false}),
    isLoading: false,
    Login: async () => ({success: false}),
    getUserData: async () => {},
    getToken: async () => null,
    success: () => ({success: false}),
    refreshStatistics: () => {},
    statistics: [],
    statisticsLoading: true,
    verifyEmailCode: async () => ({status: 0}),
    registartionApi: async () => ({status: 0, data: {access_token: "", refresh_token: ""}})
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

    const isRequested = useRef(false)

    const getUserData = useCallback(async (): Promise<void> => {
        //if (typeof window === "undefined") return;
        // if (isRequested.current) return
        // isRequested.current = true
        setStatisticsLoading(true)
        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No valid token");
            }

            const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (response.data?.statistics) {
                setStatistics(response.data.statistics)
            }

            setUserData(response.data);
            setIsAuthenticated(true);
            setAuthChecked(true);

        } catch (error) {
            console.error("Error fetching user data:", error);
            setIsAuthenticated(false);
            setAuthChecked(true);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
        finally{
            setStatisticsLoading(false)
        }

    }, [getToken]);

    const refreshStatistics = () => {
        getUserData()
        const token = localStorage.getItem("access_token")
        if (token) {
          setStatisticsLoading(true)
          axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((response) => {
              if (response.data?.statistics) {
                setStatistics(response.data.statistics)
              }
              setStatisticsLoading(false)
            })
            .catch((error) => {
              console.error("Error refreshing statistics:", error)
              setStatisticsLoading(false)
            })
        }
      }

    useEffect(() => {
        if (isAuthenticated && !authChecked) {
            getUserData();
        }
    }, [isAuthenticated, authChecked, getUserData]);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/login`, {
                email,
                password
            });

            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('isAuthenticated', 'true');

                setIsAuthenticated(true);
                await getUserData();

                const lastSavedChat = localStorage.getItem("lastSavedChat")
                let welcomeChatId = "1"
                if (!lastSavedChat) {
                    try {
                        const chatResponse = await axios.get(`https://api-gpt.energy-cerber.ru/chat/all`, {
                            headers: {
                                Authorization: `Bearer ${response.data.access_token}`,
                            },
                        });
                        if (chatResponse.data)
                        {
                            welcomeChatId = chatResponse.data[0].id
                            localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }

                return {success: true, lastChatId: lastSavedChat || welcomeChatId};
            }
            return {success: false};
        } catch (error) {
            console.error("Login error:", error);
            throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова.");
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const token = await getToken();
            if (!token) throw new Error("No valid token");

            const response = await axios.post(
                `https://api-gpt.energy-cerber.ru/user/edit_password?new_password=${newPassword}`,
                {},
                {headers: {Authorization: `Bearer ${token}`}}
            );
            localStorage.removeItem("new_password")
            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                return {success: true};
            }
            return {success: false};
        } catch (error) {
            console.error("Password update error:", error);
            return {success: false};
        }
    };

    const success = () => {
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        return {success: true, lastChatId: "1"}
    }

    const verifyCode = async (email: string, code: string, password: string) => {
        if (code.length === 5 && /^\d+$/.test(code)) {
            localStorage.setItem('isAuthenticated', 'true')
            setIsAuthenticated(true)
            return {success: true, lastChatId: "1"}
        }
        return {success: false}
    }

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUserData(null);
        setIsAuthenticated(false);
        setAuthChecked(false);
    };

    const verifyEmailCode = async (email: string, code: string) => {
        try {
          return await axios.post(`https://api-gpt.energy-cerber.ru/user/register/verify_code?email=${email}&code=${code}`);
        } catch (error) {
          throw error;
        }
      };
    
    const registartionApi = async (userData: IUserDataRegistration) => {
        try {
            const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/register`, userData);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            return response;
        } catch (error) {
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                userData,
                getUserData,
                isAuthenticated,
                isLoading: isLoading || !authChecked,
                login,
                verifyCode,
                logout,
                updatePassword,
                Login: login,
                getToken,
                success,
                refreshStatistics,
                statistics,
                statisticsLoading,
                verifyEmailCode,
                registartionApi
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)


