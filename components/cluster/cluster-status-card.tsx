'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network, HardDrive, Server, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface ClusterStatusInstance {
  instance: string
  clusterId: string
  clusterDir: string
  status: 'running' | 'stopped' | 'starting' | 'stopping'
}

interface ClusterStatusCardProps {
  clusterId: string
  clusterDir: string
  configured: ClusterStatusInstance[]
  notConfigured: string[]
  loading?: boolean
}

export function ClusterStatusCard({ 
  clusterId, 
  clusterDir, 
  configured, 
  notConfigured,
  loading = false 
}: ClusterStatusCardProps) {
  
  const runningCount = configured.filter(i => i.status === 'running').length
  const stoppedCount = configured.filter(i => i.status === 'stopped').length
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Cluster Status
          </CardTitle>
          <CardDescription>Loading cluster information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Cluster Status
        </CardTitle>
        <CardDescription>
          Current cluster configuration and instance status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cluster Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Network className="h-4 w-4" />
              Cluster ID
            </div>
            <p className="text-lg font-mono font-semibold">
              {clusterId || <span className="text-muted-foreground">Not configured</span>}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              Cluster Directory
            </div>
            <p className="text-sm font-mono break-all">
              {clusterDir || <span className="text-muted-foreground">Not configured</span>}
            </p>
          </div>
        </div>

        {/* Instance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{configured.length}</div>
            <div className="text-sm text-muted-foreground">Configured</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{runningCount}</div>
            <div className="text-sm text-muted-foreground">Running</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stoppedCount}</div>
            <div className="text-sm text-muted-foreground">Stopped</div>
          </div>
        </div>

        {/* Configured Instances */}
        {configured.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Server className="h-4 w-4" />
              Configured Instances
            </div>
            <div className="space-y-2">
              {configured.map((instance) => (
                <div 
                  key={instance.instance} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {instance.status === 'running' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : instance.status === 'starting' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium">{instance.instance}</span>
                  </div>
                  <Badge 
                    variant={
                      instance.status === 'running' ? 'success' : 
                      instance.status === 'starting' ? 'warning' :
                      'secondary'
                    }
                  >
                    {instance.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not Configured Instances */}
        {notConfigured.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Not in Cluster ({notConfigured.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {notConfigured.map((instance) => (
                <Badge key={instance} variant="outline">
                  {instance}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {configured.length === 0 && notConfigured.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No instances found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

