'use client';

import { useEffect, useRef, useState } from 'react';
import { format, parseISO, addDays, subYears } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/components/ui/hover-card';
import { ru } from 'date-fns/locale';
import { ProviderStats } from './provider-stats';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  getProviderName,
  getColorIntensity,
  calculateViewTotals,
  scrollToRight,
} from '@/shared/utils';
import { DailyStatistic } from '@/shared/types/statistics';
import { generateMonthlyGrid } from './generateMonthlyGrid';

export function ActivityHeatmap({ statistics }: { statistics: DailyStatistic[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'day'>('year');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => scrollToRight(containerRef), 100);
    return () => clearTimeout(timer);
  }, [viewMode, statistics]);

  const generateYearlyGrid = () => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    const startDate = oneYearAgo;
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
                className={`m-0.5 h-3 w-3 cursor-pointer rounded-sm ${getColorIntensity(statistics, totalMessages)} ${
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

  const getSelectedDayStats = () => {
    if (!selectedDate) return null;
    return statistics.find((s) => s.day === selectedDate) || null;
  };

  const viewTotals = calculateViewTotals(statistics, viewMode, selectedDate);
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
              {generateMonthlyGrid({ statistics, selectedDate, setSelectedDate, setViewMode })}
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
