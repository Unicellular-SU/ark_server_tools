'use client'

import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ClusterStatusCard } from '@/components/cluster/cluster-status-card'
import { Save, Network, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { ClusterConfig, ServerInstance } from '@/types/ark'

interface ApplyResult {
  instance: string
  success: boolean
  error?: string
}

interface ClusterStatus {
  configured: Array<{
    instance: string
    clusterId: string
    clusterDir: string
    status: string
  }>
  notConfigured: string[]
}

export default function ClusterPage() {
  const [config, setConfig] = useState<ClusterConfig>({
    clusterId: '',
    clusterDir: '',
    instances: [],
    crossServerChat: {
      enabled: false,
      port: 0
    }
  })
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [applyResults, setApplyResults] = useState<ApplyResult[]>([])
  const [needsRestart, setNeedsRestart] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchClusterConfig()
    fetchServers()
    fetchClusterStatus()
  }, [])

  const fetchClusterConfig = async () => {
    try {
      const response = await fetch('/api/cluster')
      const data = await response.json()
      
      if (data.success && data.data) {
        setConfig(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch cluster config:', error)
    }
  }

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()
      
      if (data.success) {
        setServers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    }
  }

  const fetchClusterStatus = async () => {
    try {
      const response = await fetch('/api/cluster/status')
      const data = await response.json()
      
      if (data.success) {
        setClusterStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch cluster status:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.success ? 'Cluster configuration saved' : data.error,
        variant: data.success ? 'default' : 'destructive'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save cluster configuration',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleApplyConfiguration = async () => {
    if (!config.clusterId || !config.clusterDir) {
      toast({
        title: 'Validation Error',
        description: 'Cluster ID and Directory are required',
        variant: 'destructive'
      })
      return
    }

    if (config.instances.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one instance',
        variant: 'destructive'
      })
      return
    }

    try {
      setApplying(true)
      setApplyResults([])
      setNeedsRestart([])

      const response = await fetch('/api/cluster/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await response.json()
      
      if (data.success || data.data) {
        setApplyResults(data.data.results || [])
        setNeedsRestart(data.data.needsRestart || [])
        
        toast({
          title: data.success ? 'Success' : 'Partial Success',
          description: data.message,
          variant: data.success ? 'default' : 'destructive'
        })

        // Refresh status
        await fetchClusterStatus()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to apply configuration',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply cluster configuration',
        variant: 'destructive'
      })
    } finally {
      setApplying(false)
    }
  }

  const handleRestartInstances = async () => {
    if (needsRestart.length === 0) return

    try {
      setRestarting(true)
      
      const results = await Promise.allSettled(
        needsRestart.map(instance =>
          fetch(`/api/servers/${instance}`, { method: 'PUT' })
        )
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      
      toast({
        title: 'Restart Complete',
        description: `Restarted ${successful}/${needsRestart.length} instances`,
        variant: successful === needsRestart.length ? 'default' : 'destructive'
      })

      setNeedsRestart([])
      await fetchServers()
      await fetchClusterStatus()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restart instances',
        variant: 'destructive'
      })
    } finally {
      setRestarting(false)
    }
  }

  const toggleInstance = (instanceName: string) => {
    setConfig(prev => ({
      ...prev,
      instances: prev.instances.includes(instanceName)
        ? prev.instances.filter(i => i !== instanceName)
        : [...prev.instances, instanceName]
    }))
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cluster Configuration</h1>
            <p className="text-muted-foreground">Configure server clustering for cross-server transfers</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Config'}
            </Button>
            <Button 
              onClick={handleApplyConfiguration} 
              disabled={applying || !config.clusterId || !config.clusterDir}
            >
              <Network className="mr-2 h-4 w-4" />
              {applying ? 'Applying...' : 'Apply to Servers'}
            </Button>
          </div>
        </div>

        {/* Cluster Status Card */}
        {clusterStatus && (
          <ClusterStatusCard
            clusterId={config.clusterId}
            clusterDir={config.clusterDir}
            configured={clusterStatus.configured}
            notConfigured={clusterStatus.notConfigured}
          />
        )}

        {/* Apply Results */}
        {applyResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Configuration Results</CardTitle>
              <CardDescription>
                Results from applying cluster configuration to instances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {applyResults.map((result) => (
                  <div 
                    key={result.instance}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.instance}</span>
                    </div>
                    {result.error && (
                      <span className="text-sm text-red-500">{result.error}</span>
                    )}
                    {result.success && (
                      <Badge variant="success">Applied</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restart Warning */}
        {needsRestart.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-5 w-5" />
                Restart Required
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                The following instances need to be restarted for cluster changes to take effect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {needsRestart.map((instance) => (
                  <Badge key={instance} variant="warning">
                    {instance}
                  </Badge>
                ))}
              </div>
              <Button 
                onClick={handleRestartInstances} 
                disabled={restarting}
                variant="outline"
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                {restarting ? 'Restarting...' : `Restart ${needsRestart.length} Instance(s)`}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Cluster Settings
            </CardTitle>
            <CardDescription>
              Configure cluster ID and directory for server transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clusterId">Cluster ID</Label>
                <Input
                  id="clusterId"
                  value={config.clusterId}
                  onChange={(e) => setConfig({ ...config, clusterId: e.target.value })}
                  placeholder="mycluster"
                />
                <p className="text-sm text-muted-foreground">
                  Unique identifier for this cluster
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clusterDir">Cluster Directory</Label>
                <Input
                  id="clusterDir"
                  value={config.clusterDir}
                  onChange={(e) => setConfig({ ...config, clusterDir: e.target.value })}
                  placeholder="/path/to/cluster/data"
                />
                <p className="text-sm text-muted-foreground">
                  Shared directory for cluster data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Instances</CardTitle>
            <CardDescription>
              Select servers to include in this cluster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {servers.map((server) => {
                const isSelected = config.instances.includes(server.name)
                return (
                  <div
                    key={server.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-400'
                    }`}
                    onClick={() => toggleInstance(server.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{server.name}</p>
                        <p className="text-sm text-muted-foreground">{server.map}</p>
                      </div>
                      {isSelected && <Badge variant="success">Selected</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {servers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No server instances available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Server Chat</CardTitle>
            <CardDescription>
              Configure cross-server chat communication (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="crossServerChatEnabled"
                checked={config.crossServerChat?.enabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  crossServerChat: {
                    ...config.crossServerChat,
                    enabled: e.target.checked,
                    port: config.crossServerChat?.port || 27100
                  }
                })}
                className="h-4 w-4"
              />
              <Label htmlFor="crossServerChatEnabled">Enable Cross-Server Chat</Label>
            </div>
            
            {config.crossServerChat?.enabled && (
              <div className="space-y-2">
                <Label htmlFor="chatPort">Chat Communication Port</Label>
                <Input
                  id="chatPort"
                  type="number"
                  value={config.crossServerChat.port}
                  onChange={(e) => setConfig({
                    ...config,
                    crossServerChat: {
                      ...config.crossServerChat!,
                      port: parseInt(e.target.value)
                    }
                  })}
                  placeholder="27100"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

