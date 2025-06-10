import { isSameMonth, parseISO, subYears } from 'date-fns';

import { DailyStatistic } from '@/shared/types/statistics/statistics';

export const calculateViewTotals = (
  statistics: DailyStatistic[],
  viewMode: 'year' | 'month' | 'day',
  selectedDate: string | null
) => {
  const today = new Date();

  return statistics.reduce(
    (totals, stat) => {
      const date = parseISO(stat.day);
      let isInCurrentView = false;

      switch (viewMode) {
        case 'year':
          isInCurrentView = date >= subYears(today, 1);
          break;
        case 'month':
          isInCurrentView = isSameMonth(date, today);
          break;
        case 'day':
          isInCurrentView = selectedDate === stat.day;
          break;
      }

      if (isInCurrentView) {
        stat.providers.forEach((p) => {
          if (!totals.byProvider[p.provider_name]) {
            totals.byProvider[p.provider_name] = 0;
          }
          totals.byProvider[p.provider_name] += p.messages_sent;
          totals.total += p.messages_sent;
        });
      }

      return totals;
    },
    { total: 0, byProvider: {} as Record<string, number> }
  );
};
