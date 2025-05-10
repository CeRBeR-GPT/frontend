"use client"

import {createContext, useContext, useState, useCallback, useRef} from "react"
import {getAccess} from "@/utils/tokens-utils";
import { registartionApi, verifyEmailCodeApi } from "@/api/api";
import { useAuth } from "@/features/auth/model/use-auth";
import { useLogout } from "@/features/logout/model/use-logout";
import { useStatistics } from "@/features/statistics/model/use-statistics";
import { useUserData } from "@/entities/user/model/use-user";

interface IUserDataRegistration {
    email: string;
    password: string;
  }

type AuthContextType = {
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string, error?: string; }>
    // verifyCode: (email: string, code: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
    getToken: () => Promise<string | null>,
    // success: () => { success: boolean },
    // verifyEmailCode: (email: string, code: string) => Promise<{status: number}>;
    // registartion: (UserData: IUserDataRegistration) => Promise<{status: number, data: { access_token: string; refresh_token: any; };}>

}
const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: async () => ({success: false}),
    // verifyCode: async () => ({success: false}),
    getToken: async () => null,
    // success: () => ({success: false}),
    // verifyEmailCode: async () => ({status: 0}),
    // registartion: async () => ({status: 0, data: {access_token: "", refresh_token: ""}})
})

export function AuthProvider({children}: { children: React.ReactNode }) {

    const auth = useAuth()
    const logout = useLogout()
    const statistics = useStatistics()
    const user = useUserData()
    const value = {
        ...auth,
        ...logout,
        ...statistics,
        ...user
    };

    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const getToken = useCallback(async (): Promise<string | null> => {
        if (typeof window === "undefined") return null;

        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) return null;

        return await getAccess(accessToken, refreshToken);
    }, []);

    const isRequested = useRef(false)

    // const getUserData = useCallback(async (): Promise<void> => {
    //     //if (typeof window === "undefined") return;
    //     // if (isRequested.current) return
    //     // isRequested.current = true
    //     setStatisticsLoading(true)
    //     try {
    //         const token = await getToken();
    //         if (!token) {
    //             throw new Error("No valid token");
    //         }

    //         const response = await getUserDataApi()

    //         if (response.data?.statistics) {
    //             setStatistics(response.data.statistics)
    //         }

    //         setUserData(response.data);
    //         setIsAuthenticated(true);
    //         setAuthChecked(true);

    //     } catch (error) {
    //         setIsAuthenticated(false);
    //         setAuthChecked(true);
    //         localStorage.removeItem('isAuthenticated');
    //         localStorage.removeItem('access_token');
    //         localStorage.removeItem('refresh_token');
    //     }
    //     finally{
    //         setStatisticsLoading(false)
    //     }

    // }, [getToken]);

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

    const verifyEmailCode = async (email: string, code: string) => {
        try {
          return await verifyEmailCodeApi(email, code);
        } catch (error) {
          throw error;
        }
    };
    
    const registartion = async (userData: IUserDataRegistration) => {
        try {
            const response = await registartionApi(userData);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            return response;
        } catch (error) {
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth1 = () => useContext(AuthContext)


