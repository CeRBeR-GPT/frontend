// features/user/context/user-context.tsx

'use client'
import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';

import { getAccess } from "@/shared/utils/tokens-utils";
import { UserData } from '../../entities/user/model/types';
import { getUserDataApi } from '../../entities/user/model/api';
import { DailyStatistic } from '../types/statistics/statistics';
import { ChatHistory } from '@/entities/chat/model/types';

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
  isChatsRequested: React.MutableRefObject<boolean>;
  isChatRequested: React.MutableRefObject<boolean>; 
  isFetchingChats: boolean;
  setIsFetchingChats: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DailyStatistic[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [chatTitle, setChatTitle] = useState<string>("")
  const [isFetchingChats, setIsFetchingChats] = useState(false)
  const isChatsRequested = useRef(false);
  const isChatRequested = useRef(false);

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
    // if (isRequested1.current) return
    // isRequested1.current = true
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
  useEffect(() => {
    refreshUserData();
  }, []);

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
    chatTitle, setChatTitle, isChatsRequested, isChatRequested, isFetchingChats, setIsFetchingChats
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