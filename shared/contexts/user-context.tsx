// features/user/context/user-context.tsx

'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { userApi } from '@/entities/user/api';
import { getAccess } from '@/shared/utils';
import { DailyStatistic } from '../types/statistics';
import { UserData } from '@/entities/user/types';
import { ChatHistory } from '@/entities/chat/types';
import { QueryObserverResult, RefetchOptions, useQuery } from '@tanstack/react-query';

type UserContextType = {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  getToken: () => Promise<string | null>;
  refreshUserData: (options?: RefetchOptions) => Promise<QueryObserverResult<UserData, Error>>;
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
  const [statistics, setStatistics] = useState<DailyStatistic[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatTitle, setChatTitle] = useState<string>('');
  const [isFetchingChats, setIsFetchingChats] = useState(false);
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

  const {
    data: dataUser,
    error: getUserDataError,
    refetch: refreshUserData,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('No valid token');
      }

      const response = await userApi.getUserData();
      return response.data;
    },
  });

  useEffect(() => {
    if (!dataUser) return;
    setUserData(dataUser);
    if (dataUser?.statistics) {
      setStatistics(dataUser.statistics);
    }
  }, [dataUser]);

  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching, isPending]);

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
    chatTitle,
    setChatTitle,
    isChatsRequested,
    isChatRequested,
    isFetchingChats,
    setIsFetchingChats,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const context = useContext(UserContext);
  if (!context) {
    if (isClient) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return {
      userData: null,
      loading: false,
      error: null,
      getToken: async () => null,
      refreshUserData: async () => {},
      setUserData: () => {},
      statistics: [],
      chatHistory: [],
      setChatHistory: () => {},
      chatTitle: '',
      setChatTitle: () => {},
      isChatsRequested: { current: false },
      isChatRequested: { current: false },
      isFetchingChats: false,
      setIsFetchingChats: () => {},
    };
  }

  return context;
};
