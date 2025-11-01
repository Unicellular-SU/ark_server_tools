'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Square, RotateCw, Users } from 'lucide-react'
import type { ServerInstance, ServerMetrics } from '@/types/ark'

interface ServerStatusCardProps {
  instance: ServerInstance
  metrics?: ServerMetrics | null
  onStart: () => void
  onStop: () => void
  onRestart: () => void
}

export function ServerStatusCard({ 
  instance, 
  metrics, 
  onStart, 
  onStop, 
  onRestart 
}: ServerStatusCardProps) {
  const getStatusBadge = () => {
    switch (instance.status) {
      case 'running':
        return <Badge variant="success">Running</Badge>
      case 'stopped':
        return <Badge variant="destructive">Stopped</Badge>
      case 'starting':
        return <Badge variant="warning">Starting...</Badge>
      case 'stopping':
        return <Badge variant="warning">Stopping...</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusColor = () => {
    switch (instance.status) {
      case 'running':
        return 'text-green-600'
      case 'stopped':
        return 'text-red-600'
      case 'starting':
      case 'stopping':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{instance.name}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Map</p>
              <p className="font-medium">{instance.map}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Port</p>
              <p className="font-medium">{instance.port}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Players</p>
              <p className="font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {instance.onlinePlayers}/{instance.maxPlayers}
              </p>
            </div>
            {metrics && (
              <div>
                <p className="text-muted-foreground">Memory</p>
                <p className="font-medium">{metrics.memoryPercent.toFixed(1)}%</p>
              </div>
            )}
          </div>
          
          {metrics && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>CPU Usage</span>
                  <span>{metrics.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Memory Usage</span>
                  <span>{metrics.memoryPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${Math.min(metrics.memoryPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {instance.status === 'stopped' && (
              <Button onClick={onStart} size="sm" className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
            {instance.status === 'starting' && (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </Button>
            )}
            {instance.status === 'running' && (
              <>
                <Button onClick={onStop} size="sm" variant="destructive" className="flex-1">
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
                <Button onClick={onRestart} size="sm" variant="outline" className="flex-1">
                  <RotateCw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
              </>
            )}
            {instance.status === 'stopping' && (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Stopping...
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

