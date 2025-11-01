'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, HardDrive } from 'lucide-react'
import type { ServerMetrics } from '@/types/ark'

interface ResourceMonitorProps {
  metrics: ServerMetrics | null
  title: string
}

export function ResourceMonitor({ metrics, title }: ResourceMonitorProps) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Cpu className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">CPU Usage</span>
                <span className="text-muted-foreground">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <HardDrive className="h-8 w-8 text-green-500" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Memory Usage</span>
                <span className="text-muted-foreground">
                  {(metrics.memoryUsage / 1024 / 1024 / 1024).toFixed(2)} GB / 
                  {(metrics.memoryTotal / 1024 / 1024 / 1024).toFixed(2)} GB
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(metrics.memoryPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

