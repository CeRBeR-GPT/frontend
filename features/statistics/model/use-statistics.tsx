import { useState } from 'react';

import { getUserDataApi } from '@/entities/user/model';
import { useUser } from '@/shared/contexts';
import { DailyStatistic } from '@/shared/types/statistics';

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<DailyStatistic[]>([]);
  const [statisticsLoading, setStatisticsLoading] = useState(true);

  const { refreshUserData } = useUser();

  const refreshStatistics = async () => {
    await refreshUserData();
    const token = localStorage.getItem('access_token');
    if (token) {
      setStatisticsLoading(true);

      try {
        const response = await getUserDataApi();
        if (response.data?.statistics) {
          setStatistics(response.data.statistics);
        }
        setStatisticsLoading(false);
      } catch (error) {
        setStatisticsLoading(false);
      }
    }
  };

  return { refreshStatistics, statistics, statisticsLoading, setStatistics };
};
