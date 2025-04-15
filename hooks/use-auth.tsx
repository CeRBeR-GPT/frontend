"use client"

import {createContext, useContext, useState, useEffect, useCallback, useRef} from "react"
import axios from "axios"
import {getAccess} from "@/utils/tokens-utils";

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
    login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string, error?: string; }>
    register: (email: string, password: string) => Promise<void>
    verifyCode: (email: string, code: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
    logout: () => void
    socialLogin: (provider: "google" | "yandex" | "github") => Promise<{ success: boolean; lastChatId?: string }>
    updatePassword: (newPassword: string) => Promise<{ success: boolean } | undefined>
    isLoading: boolean
    Login: (email: string, password: string) => Promise<{ success: boolean; lastChatId?: string }>
    getUserData: () => Promise<void>
    getToken: () => Promise<string | null>,
    success: () => { success: boolean }
}
const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    isAuthenticated: false,
    login: async () => ({success: false}),
    register: async () => {},
    verifyCode: async () => ({success: false}),
    logout: () => {},
    socialLogin: async () => ({success: false}),
    updatePassword: async () => ({success: false}),
    isLoading: false,
    Login: async () => ({success: false}),
    getUserData: async () => {},
    getToken: async () => null,
    success: () => ({success: false})
})

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [authChecked, setAuthChecked] = useState(false);

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


    const getToken = useCallback(async (): Promise<string | null> => {
        if (typeof window === "undefined") return null;

        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!accessToken || !refreshToken) return null;

        return await getAccess(accessToken, refreshToken);
    }, []);
    const isRequested = useRef(false)

    const getUserData = useCallback(async (): Promise<void> => {
        if (typeof window === "undefined") return;
        // if (isRequested.current) return
        // isRequested.current = true

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No valid token");
            }

            const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
                headers: {Authorization: `Bearer ${token}`},
            });

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
            localStorage.removeItem("user");
        }

    }, [getToken]);


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
                const user = {email};
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(user));

                setUser(user);
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
                        console.log("ERROR IN LOGIN")
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

            if (response.data?.access_token) {
                localStorage.setItem('access_token', response.data.access_token);
                localStorage.setItem('refresh_token', response.data.refresh_token);

                if (user) {
                    const updatedUser = {...user};
                    setUser(updatedUser);
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                }

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

    const register = async (email: string, password: string) => {
        localStorage.setItem("pendingRegistration", JSON.stringify({email, password}))
    }

    const success = () => {
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        return {success: true, lastChatId: "1"}
    }

    const verifyCode = async (email: string, code: string, password: string) => {
        if (code.length === 5 && /^\d+$/.test(code)) {
            const newUser = {email, name: email.split("@")[0], password}
            localStorage.setItem('isAuthenticated', 'true') // Добавлено
            localStorage.setItem("user", JSON.stringify(newUser))
            setUser(newUser)
            setIsAuthenticated(true)
            return {success: true, lastChatId: "1"}
        }
        return {success: false}
    }

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem("user");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
        setAuthChecked(false);
    };

    const socialLogin = async (provider: "google" | "yandex" | "github") => {
        const email = `user@${provider}.com`
        const newUser = {email, name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`}
        setUser(newUser)
        setIsAuthenticated(true)
        const lastSavedChat = localStorage.getItem("lastSavedChat")
        localStorage.setItem("user", JSON.stringify(newUser))
        localStorage.setItem('isAuthenticated', 'true')
        return {success: true, lastChatId: lastSavedChat || ""}
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                getUserData,
                isAuthenticated,
                isLoading: isLoading || !authChecked,
                login,
                register,
                verifyCode,
                logout,
                socialLogin,
                updatePassword,
                Login: login,
                getToken,
                success
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)


