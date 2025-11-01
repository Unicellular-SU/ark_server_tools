'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Square, 
  RotateCw, 
  Settings, 
  Download,
  RefreshCw
} from 'lucide-react'
import type { ServerInstance } from '@/types/ark'
import { ConfirmDialog } from './confirm-dialog'

interface ServerInstanceCardProps {
  instance: ServerInstance
  onStart: () => void
  onStop: () => void
  onRestart: () => void
  onUpdate: () => void
  onConfigure: () => void
}

export function ServerInstanceCard({
  instance,
  onStart,
  onStop,
  onRestart,
  onUpdate,
  onConfigure
}: ServerInstanceCardProps) {
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
    variant?: 'default' | 'destructive'
  } | null>(null)

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{instance.name}</CardTitle>
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
                <p className="text-muted-foreground">Query Port</p>
                <p className="font-medium">{instance.queryPort}</p>
              </div>
              <div>
                <p className="text-muted-foreground">RCON Port</p>
                <p className="font-medium">{instance.rconPort}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Players</p>
                <p className="font-medium">{instance.onlinePlayers}/{instance.maxPlayers}</p>
              </div>
              {instance.uptime && (
                <div>
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-medium">{Math.floor(instance.uptime / 60)}m</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {instance.status === 'stopped' && (
                <Button 
                  onClick={() => setConfirmAction({
                    open: true,
                    title: 'Start Server',
                    description: `Are you sure you want to start ${instance.name}?`,
                    action: onStart
                  })}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              )}
              
              {instance.status === 'running' && (
                <>
                  <Button 
                    onClick={() => setConfirmAction({
                      open: true,
                      title: 'Stop Server',
                      description: `Are you sure you want to stop ${instance.name}? All players will be disconnected.`,
                      action: onStop,
                      variant: 'destructive'
                    })}
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                  <Button 
                    onClick={() => setConfirmAction({
                      open: true,
                      title: 'Restart Server',
                      description: `Are you sure you want to restart ${instance.name}? All players will be temporarily disconnected.`,
                      action: onRestart
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                </>
              )}
              
              <Button onClick={onConfigure} variant="secondary" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              
              <Button onClick={onUpdate} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {confirmAction && (
        <ConfirmDialog
          open={confirmAction.open}
          onOpenChange={(open) => setConfirmAction(open ? confirmAction : null)}
          title={confirmAction.title}
          description={confirmAction.description}
          onConfirm={confirmAction.action}
          variant={confirmAction.variant}
        />
      )}
    </>
  )
}

