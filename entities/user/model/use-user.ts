
// features/user/model/use-user.ts
import { useState, useCallback, useEffect } from 'react';
import { getUserDataApi } from './api';
import { UserData } from './types';
import { getAccess } from "../../../utils/tokens-utils";

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchUserData = useCallback(async (): Promise<UserData | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No valid token');
      }

      const response = await getUserDataApi();
      setUserData(response.data);
      console.log("Data", response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setUserData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
      fetchUserData(); // Загружаем данные при монтировании
    }, [fetchUserData]);

  // Возвращаем только необходимые данные и методы
  return {
    userData,
    loading,
    error,
    fetchUserData,
    getToken,
    setUserData
  };
};