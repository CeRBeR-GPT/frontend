"use client"

import {createContext, useContext, useState, useCallback, useRef} from "react"
import {getAccess} from "@/utils/tokens-utils";
import { useAuth } from "@/features/auth/model/use-auth";
import { useLogout } from "@/features/logout/model/use-logout";
import { useStatistics } from "@/features/statistics/model/use-statistics";
import { useUserData } from "@/entities/user/model/use-user";

type AuthContextType = {
    isAuthenticated: boolean
    getToken: () => Promise<string | null>,
    // success: () => { success: boolean },
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    getToken: async () => null,
    // success: () => ({success: false}),
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

    // const success = () => {
    //     setIsAuthenticated(true)
    //     localStorage.setItem('isAuthenticated', 'true')
    //     return {success: true, lastChatId: "1"}
    // }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth1 = () => useContext(AuthContext)