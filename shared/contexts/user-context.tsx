// features/user/context/user-context.tsx

'use client'
import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';

import { getAccess } from "@/shared/utils/tokens-utils";
import { UserData } from '../../entities/user/model/types';
import { getUserDataApi } from '../../entities/user/model/api';
import { DailyStatistic } from '../types/statistics/statistics';
import { ChatHistory } from '@/entities/chat/model/types';
import { getChatAllApi } from '@/api/api';

type UserContextType = {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  getToken: () => Promise<string | null>;
  refreshUserData: () => Promise<void>;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  statistics: DailyStatistic[];
  chatHistory: ChatHistory[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>;
  chatTitle: string;
  setChatTitle: React.Dispatch<React.SetStateAction<string>>;
  updateChatHistory: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DailyStatistic[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [chatTitle, setChatTitle] = useState<string>("")

  const getToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!accessToken || !refreshToken) return null;

    try {
      return await getAccess(accessToken, refreshToken);
    } catch (e) {
      return null;
    }
  }, []);

  const isRequested1 = useRef(false)
  const refreshUserData = useCallback(async () => {
    if (isRequested1.current) return
    isRequested1.current = true
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No valid token');
      }

      const response = await getUserDataApi();
      setUserData(response.data);

      if (response.data?.statistics) {
          setStatistics(response.data.statistics)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // // Загружаем данные при инициализации
  // useEffect(() => {
  //   refreshUserData();
  // }, [refreshUserData]);

  const updateChatHistory = useCallback(async () => {
      try {
          const token = await getToken()
          if (!token) return

          const response = await getChatAllApi()

          const updatedChats = response.data.map((chat: any) => {
              const lastMessageDate =
              chat.messages.length > 0
                  ? new Date(chat.messages[chat.messages.length - 1].created_at)
                  : new Date(chat.created_at)
              lastMessageDate.setHours(lastMessageDate.getHours() + 3)
      
              return {
                  id: chat.id,
                  title: chat.name,
                  preview: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "Нет сообщений",
                  date: lastMessageDate,
                  messages: chat.messages.length,
              }
          })
      
          const sortedChats = updatedChats.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
      
          setChatHistory(sortedChats)

          if (sortedChats.length > 0) {
              localStorage.setItem("lastSavedChat", sortedChats[0].id)
          }
      } catch (error) {
      }
    }, [getToken])

  const value = {
    userData,
    loading,
    error,
    getToken,
    refreshUserData,
    setUserData,
    statistics,
    chatHistory,
    setChatHistory,
    chatTitle, setChatTitle, updateChatHistory
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {

  if (typeof window === 'undefined') {
    throw new Error('useUser only works on the client side');
  }
  
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};