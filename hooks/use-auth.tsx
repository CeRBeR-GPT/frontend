"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

type User = { email: string } | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  register: (email: string, password: string) => Promise<void>
  verifyCode: (email: string, code: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  logout: () => void
  socialLogin: (provider: "google" | "yandex" | "github") => Promise<{ success: boolean; lastChatId?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => {},
  verifyCode: async () => ({ success: false }),
  logout: () => {},
  socialLogin: async () => ({ success: false }),
  isLoading: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {

      const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/login?email=${email}&password=${password}`);

      if (response.data && response.status === 200) {
        const user = {
           email: email,
         };
        localStorage.setItem('access_token', response.data.access_token);
        console.log(response.data.access_token)
        setUser(user);
        setIsAuthenticated(true);
  
        return { success: true, lastChatId: response.data.lastChatId || "chat1" };
      } else {
        return { success: false};
      }
    } catch (error) {
      throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова.");
    }
  };


  const register = async (email: string, password: string) => {
    // In a real app, this would call an API to send verification code
    // For demo, we'll just store the email and password temporarily
    localStorage.setItem("pendingRegistration", JSON.stringify({ email, password }))
  }

  // Также обновим функцию verifyCode
  const verifyCode = async (email: string, code: string, password: string) => {
    // В реальном приложении это будет проверять код с помощью API
    // Для демонстрации просто проверим, является ли код 6-значным числом
    
    if (code.length === 5 && /^\d+$/.test(code)) {
      const newUser = { email, name: email.split("@")[0], password }
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.removeItem("pendingRegistration")
      return { success: true, lastChatId: "chat1" } // Возвращаем ID последнего чата
    }
    return { success: false }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  // И функцию socialLogin
  const socialLogin = async (provider: "google" | "yandex" | "github") => {
    // В реальном приложении это перенаправит на поток OAuth
    // Для демонстрации мы имитируем успешный вход
    const email = `user@${provider}.com`
    const newUser = { email, name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` }
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(newUser))
    return { success: true, lastChatId: "chat1" } // Возвращаем ID последнего чата
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, verifyCode, logout, socialLogin,}}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


