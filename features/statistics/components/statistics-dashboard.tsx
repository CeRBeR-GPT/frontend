'use client';

import { RefreshCw } from 'lucide-react';

import { useUser } from '@/shared/contexts';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';

import { ActivityHeatmap } from './activity-heatmap';
import { useStatistics } from '../hooks';

export function StatisticsDashboard() {
  const { statisticsLoading, refreshStatistics } = useStatistics();
  const { statistics } = useUser();

  if (!statistics || statistics.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Статистика сообщений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <p>Нет данных о сообщениях.</p>
            <p className="mt-2">Начните общаться с AI, чтобы увидеть статистику.</p>
            {refreshStatistics && (
              <Button variant="outline" onClick={refreshStatistics} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Обновить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ActivityHeatmap statistics={statistics} />;
}
