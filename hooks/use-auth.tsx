"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

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
  user: User
  userData: UserData
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  register: (email: string, password: string) => Promise<void>
  verifyCode: (email: string, code: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  logout: () => void
  socialLogin: (provider: "google" | "yandex" | "github") => Promise<{ success: boolean; lastChatId?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean } | undefined>
  isLoading: boolean
  Login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  getUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => {},
  verifyCode: async () => ({ success: false }),
  logout: () => {},
  socialLogin: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
  isLoading: false,
  Login: async () => ({ success: false }),
  getUserData: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user")
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated')

        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        if (storedIsAuthenticated === 'true') {
          setIsAuthenticated(true)
        }

        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('access_token')
    }
    return null
  }

  const token = getToken()

  const getUserData = async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const userData = response.data
          console.log("User data fetched:", userData)
          const user = {
            email: userData.email,
          }

          setUserData(userData)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        }
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      getUserData()
    }
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/login`, {email, password})

      if (response.data && response.status === 200) {
        const user = {
          email: email,
        }
        localStorage.setItem('access_token', response.data.access_token)
        setUser(user)
        setIsAuthenticated(true)
        const lastSavedChat = localStorage.getItem("lastSavedChat")
        if (lastSavedChat) {
          const chat = JSON.parse(lastSavedChat)
          console.log("Последний сохраненный чат:", chat)
        }
        localStorage.setItem('isAuthenticated', 'true')
        return { success: true, lastChatId: lastSavedChat || "chat1" }
      } else {
        return { success: false }
      }
    } catch (error) {
      throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова.")
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const token = getToken()
      const response = await axios.post(
        `https://api-gpt.energy-cerber.ru/user/edit_password?new_password=${newPassword}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data && response.status === 200) {
        if (user) {
          localStorage.setItem('access_token', response.data.access_token)
          const updatedUser = { ...user, password: newPassword }
          setUser(updatedUser)
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setIsAuthenticated(true)
          localStorage.setItem('isAuthenticated', 'true')
        }
        return { success: true }
      }

      return { success: false }
    } catch (error) {
      console.error(error)
      return { success: false }
    }
  }

  const Login = async (email: string, password: string) => {
    const user = {
      email: email,
    }
    if (user) {
      setUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('isAuthenticated', 'true')
      return { success: true, lastChatId: "chat1" }
    }

    return { success: false }
  }

  const register = async (email: string, password: string) => {
    localStorage.setItem("pendingRegistration", JSON.stringify({ email, password }))
  }

  const verifyCode = async (email: string, code: string, password: string) => {
    if (code.length === 5 && /^\d+$/.test(code)) {
      const newUser = { email, name: email.split("@")[0], password }
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.removeItem("pendingRegistration")
      return { success: true, lastChatId: "chat1" }
    }
    return { success: false }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem('isAuthenticated')
  }

  const socialLogin = async (provider: "google" | "yandex" | "github") => {
    const email = `user@${provider}.com`
    const newUser = { email, name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` }
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(newUser))
    localStorage.setItem('isAuthenticated', 'true')
    return { success: true, lastChatId: "chat1" }
  }

  return (
    <AuthContext.Provider
      value={{ user, userData, getUserData, isAuthenticated, isLoading, login, register, verifyCode, logout, socialLogin, updatePassword, Login }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


