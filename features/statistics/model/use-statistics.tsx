import { useState } from 'react';
import { DailyStatistic } from '@/shared/types/statistics/statistics';
import { useUserData } from '@/entities/user/model/use-user';
import { getUserDataApi } from '@/entities/user/model/api';

export const useStatistics = () => {
    const [statistics, setStatistics] = useState<DailyStatistic[]>([])
    const [statisticsLoading, setStatisticsLoading] = useState(true)

    const { fetchUserData } = useUserData()

    const refreshStatistics = async () => {
            await fetchUserData()
            const token = localStorage.getItem("access_token")
            if (token) {
              setStatisticsLoading(true)
    
              try{
                const response = await getUserDataApi()
                if (response.data?.statistics) {
                    setStatistics(response.data.statistics)
                }
                setStatisticsLoading(false)
              }
              catch(error) {
                setStatisticsLoading(false)
              }
            }
    }

  return { refreshStatistics, statistics, statisticsLoading, setStatistics };
};