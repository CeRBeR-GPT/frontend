"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { ActivityHeatmap } from "../../../widgets/statistics/activity-heatmap"
import { Button } from "@/shared/ui/button"
import { RefreshCw } from "lucide-react"
import { useStatistics } from "@/features/statistics/model/use-statistics"

export function StatisticsDashboard() {
  const { statistics, statisticsLoading, refreshStatistics} = useStatistics()
  // if (statisticsLoading) {
  //   return (
  //     <Card className="w-full">
  //       <CardHeader>
  //         <CardTitle>Статистика сообщений</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="space-y-2">
  //           <Skeleton className="h-6 w-full" />
  //           <div className="grid grid-cols-7 gap-2 my-4">
  //             {Array.from({ length: 7 }).map((_, i) => (
  //               <Skeleton key={i} className="h-3 w-full" />
  //             ))}
  //             {Array.from({ length: 35 }).map((_, i) => (
  //               <Skeleton key={`cell-${i}`} className="h-10 w-full" />
  //             ))}
  //           </div>
  //           <Skeleton className="h-24 w-full" />
  //         </div>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  if (!statistics || statistics.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Статистика сообщений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
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
    )
  }

  return <ActivityHeatmap statistics={statistics} />
}
