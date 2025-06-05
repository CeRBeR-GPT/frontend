"use client"

import {createContext, useContext, useState, useRef} from "react"
import { useAuth } from "@/features/auth/model";
import { useLogout } from "@/features/logout/model/use-logout";
import { useStatistics } from "@/features/statistics/model/use-statistics";

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
    const value = {
        ...auth,
        ...logout,
        ...statistics,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth1 = () => useContext(AuthContext)