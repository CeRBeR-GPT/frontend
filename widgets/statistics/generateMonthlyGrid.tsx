import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

import { DailyStatistic } from '@/shared/types/statistics';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/components/ui/hover-card';
import { getColorIntensity, getProviderName } from '@/shared/utils';

export const generateMonthlyGrid = ({
  statistics,
  selectedDate,
  setSelectedDate,
  setViewMode,
}: {
  statistics: DailyStatistic[];
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
  setViewMode: React.Dispatch<React.SetStateAction<'year' | 'month' | 'day'>>;
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = [];
  for (let day = 1; day <= 31; day++) {
    const date = new Date(currentYear, currentMonth, day);
    if (date.getMonth() !== currentMonth) break;

    const dateStr = format(date, 'yyyy-MM-dd');
    const stat = statistics.find((s) => s.day === dateStr);
    const totalMessages = stat ? stat.providers.reduce((sum, p) => sum + p.messages_sent, 0) : 0;

    daysInMonth.push({ date, dateStr, day, totalMessages, stat });
  }

  return (
    <div className="my-4 grid grid-cols-7 gap-1">
      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
        <div key={day} className="text-center text-xs text-muted-foreground">
          {day}
        </div>
      ))}

      {Array.from({ length: daysInMonth[0].date.getDay() || 7 }).map((_, i) => (
        <div key={`empty-start-${i}`} className="h-10" />
      ))}

      {daysInMonth.map(({ dateStr, day, totalMessages, stat }) => (
        <HoverCard key={dateStr} openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div
              className={`flex h-10 items-center justify-center rounded ${getColorIntensity(statistics, totalMessages)} cursor-pointer ${selectedDate === dateStr ? 'ring-2 ring-primary' : ''} `}
              onClick={() => {
                setSelectedDate(dateStr);
                setViewMode('day');
              }}
            >
              <span className="text-xs font-medium">{day}</span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-56">
            <div className="text-sm">
              <div className="font-medium">{format(parseISO(dateStr), 'PPP', { locale: ru })}</div>
              <div>{totalMessages} сообщений</div>
              {stat &&
                stat.providers.map((p) => (
                  <div key={p.provider_name} className="mt-1 text-xs">
                    {getProviderName(p.provider_name)}: {p.messages_sent} сообщений
                  </div>
                ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
};
