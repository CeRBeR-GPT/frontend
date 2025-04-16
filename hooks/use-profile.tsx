
"use client"

import {createContext, useContext, useState, useEffect, useCallback, useRef} from "react"
import axios from "axios"
import type { DailyStatistic } from "@/components/statistics/activity-heatmap"
type User = { email: string; password?: string } | null

type UserData = {
    id: string,
    email: string,
    plan: string,
    available_message_count: number,
    message_length_limit: number,
    message_count_limit: number
} | null

type AuthContextType = {

    refreshStatistics: () => void;

}
const AuthContext = createContext<AuthContextType>({

    refreshStatistics: () => void
})

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [authChecked, setAuthChecked] = useState(false);
    const [statistics, setStatistics] = useState<DailyStatistic[]>([])

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

    return (
        <AuthContext.Provider
            value={{refreshStatistics}}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)


