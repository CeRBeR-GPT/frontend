"use client"

import {createContext, useContext, useState, useRef} from "react"
import { useAuth } from "@/features/auth/model/use-auth";
import { useLogout } from "@/features/logout/model/use-logout";
import { useStatistics } from "@/features/statistics/model/use-statistics";
import { useUserData } from "@/entities/user/model/use-user";

type AuthContextType = {
    isAuthenticated: boolean
    getToken: () => Promise<string | null>,
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    getToken: async () => null,
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth1 = () => useContext(AuthContext)