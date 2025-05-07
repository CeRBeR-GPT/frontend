
import { useCallback, useState } from 'react';
import { getUserDataApi } from './api';
import { UserData } from './types';
import { getAccess } from '@/utils/tokens-utils';
import { useAuth } from '@/features/auth/model/use-auth';

const getToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) return null;

    return await getAccess(accessToken, refreshToken);
    }, []);


export const getUserData = useCallback(async ()  => {

    const [userData, setUserData] = useState<UserData | null>(null)
    const { isAuthenticated, authChecked, setAuthChecked, setIsAuthenticated } = useAuth();

    //if (typeof window === "undefined") return;
    // if (isRequested.current) return
    // isRequested.current = true
    //setStatisticsLoading(true)
    
    try {
        const token = await getToken();
        if (!token) {
            throw new Error("No valid token");
        }

        const response = await getUserDataApi()

        // if (response.data?.statistics) {
        //     setStatistics(response.data.statistics)
        // }

        setUserData(response.data);
        setIsAuthenticated(true);
        setAuthChecked(true);
        return { userData, setUserData } 

    } catch (error) {
        setIsAuthenticated(false);
        setAuthChecked(true);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
    finally{
        //setStatisticsLoading(false)
    }

}, [getToken]);