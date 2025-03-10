"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  email: string
  name: string
  password?: string
} | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<void>
  verifyCode: (email: string, code: string, password: string) => Promise<boolean>
  logout: () => void
  socialLogin: (provider: "google" | "yandex" | "vk") => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => {},
  verifyCode: async () => false,
  logout: () => {},
  socialLogin: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, this would call an API to verify credentials
    // For demo, we'll check if the user exists in localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      // Simple password check - in a real app this would be done securely on the server
      if (parsedUser.email === email && parsedUser.password === password) {
        setUser(parsedUser)
        setIsAuthenticated(true)
        return true
      }
    }

    // For demo purposes, allow login with any credentials if no stored user
    if (!storedUser) {
      const newUser = { email, name: email.split("@")[0], password }
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(newUser))
      return true
    }

    return false
  }

  const register = async (email: string, password: string) => {
    // In a real app, this would call an API to send verification code
    // For demo, we'll just store the email and password temporarily
    localStorage.setItem("pendingRegistration", JSON.stringify({ email, password }))
  }

  const verifyCode = async (email: string, code: string, password: string) => {
    // In a real app, this would verify the code with an API
    // For demo, we'll just check if the code is any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      const newUser = { email, name: email.split("@")[0], password }
      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.removeItem("pendingRegistration")
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  const socialLogin = async (provider: "google" | "yandex" | "vk") => {
    // In a real app, this would redirect to OAuth flow
    // For demo, we'll simulate a successful login
    const email = `user@${provider}.com`
    const newUser = { email, name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` }
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        verifyCode,
        logout,
        socialLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

