'use client';

import { useEffect, useRef, useState } from 'react';

import {
  addDays,
  eachMonthOfInterval,
  format,
  isSameMonth,
  parseISO,
  startOfWeek,
  subYears,
} from 'date-fns';
import { ru } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/hover-card';
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { getProviderName } from '@/shared/utils';

import { ProviderStats } from './provider-stats';

export interface ProviderStatistic {
  provider_name: string;
  messages_sent: number;
  last_activity: string;
}

export interface DailyStatistic {
  day: string;
  providers: ProviderStatistic[];
}

interface ActivityHeatmapProps {
  statistics: DailyStatistic[];
}

export function ActivityHeatmap({ statistics }: ActivityHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'day'>('year');
  const maxMessages = statistics.reduce((max, stat) => {
    const totalMessages = stat.providers.reduce((sum, provider) => sum + provider.messages_sent, 0);
    return totalMessages > max ? totalMessages : max;
  }, 0);

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToRight = () => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement;

      if (scrollContainer) {
        const scrollWidth = scrollContainer.scrollWidth;
        const clientWidth = scrollContainer.clientWidth;

        if (scrollWidth > clientWidth) {
          scrollContainer.scrollLeft = scrollWidth - clientWidth;
        }
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToRight, 100);
    return () => clearTimeout(timer);
  }, [viewMode, statistics]);

  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';

    const intensity = Math.min(Math.ceil((count / maxMessages) * 4), 4);

    switch (intensity) {
      case 1:
        return 'bg-green-100 dark:bg-green-900';
      case 2:
        return 'bg-green-300 dark:bg-green-700';
      case 3:
        return 'bg-green-500 dark:bg-green-500';
      case 4:
        return 'bg-green-700 dark:bg-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const generateYearlyGrid = () => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    const startDate = oneYearAgo; // Исправлено: используем ровно дату год назад
    const weeks = [];
    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const monthsData: { name: string; startWeek: number; endWeek: number }[] = [];
    let currentMonth = '';
    let currentStartWeek = 0;

    for (let week = 0; week < 53; week++) {
      const weekStart = addDays(startDate, week * 7);
      const monthName = format(weekStart, 'MMM', { locale: ru });

      if (monthName !== currentMonth) {
        if (currentMonth) {
          monthsData.push({
            name: currentMonth,
            startWeek: currentStartWeek,
            endWeek: week - 1,
          });
        }
        currentMonth = monthName;
        currentStartWeek = week;
      }
    }

    if (currentMonth) {
      monthsData.push({
        name: currentMonth,
        startWeek: currentStartWeek,
        endWeek: 52,
      });
    }

    const monthLabels = monthsData.map((month) => {
      const startPosition = (month.startWeek / 53) * 100;
      const width = ((month.endWeek - month.startWeek + 1) / 53) * 100;

      return (
        <div
          key={`${month.name}-${month.startWeek}`}
          className="truncate text-xs text-muted-foreground"
          style={{
            left: `${startPosition}%`,
            width: `${width}%`,
            position: 'absolute',
            textIndent: '4px',
          }}
        >
          {month.name}
        </div>
      );
    });

    for (let week = 0; week < 53; week++) {
      const days = [];

      for (let day = 0; day < 7; day++) {
        const date = addDays(startDate, week * 7 + day);
        if (date > today) continue;

        const dateStr = format(date, 'yyyy-MM-dd');
        const stat = statistics.find((s) => s.day === dateStr);
        const totalMessages = stat
          ? stat.providers.reduce((sum, p) => sum + p.messages_sent, 0)
          : 0;

        days.push(
          <HoverCard key={dateStr} openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div
                className={`m-0.5 h-3 w-3 cursor-pointer rounded-sm ${getColorIntensity(totalMessages)} ${
                  selectedDate === dateStr ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setViewMode('day');
                }}
              />
            </HoverCardTrigger>
            <HoverCardContent className="w-56" side="top">
              <div className="text-sm">
                <div className="font-medium">
                  {format(parseISO(dateStr), 'PPP', { locale: ru })}
                </div>
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
        );
      }

      if (days.length > 0) {
        weeks.push(
          <div key={week} className="flex flex-col">
            {days}
          </div>
        );
      }
    }

    return (
      <div className="mt-6">
        <div className="relative mb-1 h-5" style={{ width: '100%' }}>
          {monthLabels}
        </div>
        <div className="flex items-start">
          <div className="mr-2 flex flex-col text-xs text-muted-foreground">
            {dayLabels.map((label, idx) => (
              <div key={idx} className="flex h-4 items-center">
                {label}
              </div>
            ))}
          </div>
          <ScrollArea className="w-full">
            <div className="flex min-w-max space-x-1 pb-2">{weeks}</div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  const generateMonthlyGrid = () => {
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
                className={`flex h-10 items-center justify-center rounded ${getColorIntensity(totalMessages)} cursor-pointer ${selectedDate === dateStr ? 'ring-2 ring-primary' : ''} `}
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
                <div className="font-medium">
                  {format(parseISO(dateStr), 'PPP', { locale: ru })}
                </div>
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

  const getSelectedDayStats = () => {
    if (!selectedDate) return null;
    return statistics.find((s) => s.day === selectedDate) || null;
  };

  const calculateViewTotals = () => {
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

  const viewTotals = calculateViewTotals();
  const selectedDayStats = getSelectedDayStats();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Статистика сообщений</CardTitle>
        <Tabs
          defaultValue="year"
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'year' | 'month' | 'day')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="year">Год</TabsTrigger>
            <TabsTrigger value="month">Месяц</TabsTrigger>
            <TabsTrigger value="day" disabled={!selectedDate}>
              День
            </TabsTrigger>
          </TabsList>

          <TabsContent value="year" className="mt-2">
            <ScrollArea className="w-full" ref={containerRef}>
              <ScrollBar orientation="horizontal" />
              <div className="mb-4 min-w-[800px] text-sm">
                <div className="flex items-center justify-between">
                  <span>
                    Всего сообщений за год: <strong>{viewTotals.total}</strong>
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">Меньше</span>
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-3 w-3 ${
                          level === 0
                            ? 'bg-gray-100 dark:bg-gray-800'
                            : level === 1
                              ? 'bg-green-100 dark:bg-green-900'
                              : level === 2
                                ? 'bg-green-300 dark:bg-green-700'
                                : level === 3
                                  ? 'bg-green-500 dark:bg-green-500'
                                  : 'bg-green-700 dark:bg-green-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs">Больше</span>
                  </div>
                </div>
              </div>
              {generateYearlyGrid()}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="month">
            <ScrollArea className="w-full">
              <ScrollBar orientation="horizontal" />
              <div className="mb-2 min-w-[600px] text-sm">
                <p>
                  Всего сообщений за {format(new Date(), 'LLLL', { locale: ru })}:{' '}
                  <strong>{viewTotals.total}</strong>
                </p>
              </div>
              {generateMonthlyGrid()}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="day">
            <ScrollArea className="w-full">
              <ScrollBar orientation="horizontal" />
              <div className="my-4 min-w-[500px]">
                {selectedDayStats ? (
                  <>
                    <h3 className="mb-2 text-lg font-medium">
                      {format(parseISO(selectedDate!), 'PPP', { locale: ru })}
                    </h3>
                    <ProviderStats providers={selectedDayStats.providers} />
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    {selectedDate ? (
                      <>
                        <p className="font-medium">
                          {format(parseISO(selectedDate), 'PPP', { locale: ru })}
                        </p>
                        <p className="mt-2">В этот день не было отправлено сообщений</p>
                      </>
                    ) : (
                      <p>Выберите день для просмотра детальной статистики</p>
                    )}
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardHeader>

      <CardContent>
        {viewMode !== 'day' && Object.keys(viewTotals.byProvider).length > 0 && (
          <ScrollArea className="w-full">
            <ScrollBar orientation="horizontal" />
            <div className="min-w-[400px]">
              <h4 className="mb-3 text-sm font-medium">
                {viewMode === 'month'
                  ? 'Месячная статистика по провайдерам'
                  : 'Годовая статистика по провайдерам'}
              </h4>
              <ProviderStats
                providers={Object.entries(viewTotals.byProvider).map(([name, count]) => ({
                  provider_name: name,
                  messages_sent: count,
                  last_activity: '',
                }))}
              />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
