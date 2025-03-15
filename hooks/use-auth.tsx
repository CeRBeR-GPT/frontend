"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

type User = { email: string; password?: string } | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  register: (email: string, password: string) => Promise<void>
  verifyCode: (email: string, code: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
  logout: () => void
  socialLogin: (provider: "google" | "yandex" | "github") => Promise<{ success: boolean; lastChatId?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean } | undefined>
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
  updatePassword: async () => ({ success: false }),
  isLoading: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
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
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/login?email=${email}&password=${password}`)

      if (response.data && response.status === 200) {
        const user = {
          email: email,
        }
        localStorage.setItem('access_token', response.data.access_token)
        setUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true') // Сохраняем isAuthenticated
        return { success: true, lastChatId: response.data.lastChatId || "chat1" }
      } else {
        return { success: false }
      }
    } catch (error) {
      throw new Error("Произошла ошибка при входе. Пожалуйста, попробуйте снова.")
    }
  }

  const getToken = () => localStorage.getItem('access_token')

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
          setIsAuthenticated(true) // Обновляем isAuthenticated
          localStorage.setItem('isAuthenticated', 'true') // Сохраняем isAuthenticated
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
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.email === email && parsedUser.password === password) {
        setUser(parsedUser)
        setIsAuthenticated(true)
        return { success: true, lastChatId: "chat1" } // Возвращаем ID последнего чата
      }
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
      localStorage.setItem('isAuthenticated', 'true') // Сохраняем isAuthenticated
      localStorage.removeItem("pendingRegistration")
      return { success: true, lastChatId: "chat1" }
    }
    return { success: false }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    localStorage.removeItem('isAuthenticated') // Удаляем isAuthenticated
  }

  const socialLogin = async (provider: "google" | "yandex" | "github") => {
    const email = `user@${provider}.com`
    const newUser = { email, name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` }
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(newUser))
    localStorage.setItem('isAuthenticated', 'true') // Сохраняем isAuthenticated
    return { success: true, lastChatId: "chat1" }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, verifyCode, logout, socialLogin, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)


