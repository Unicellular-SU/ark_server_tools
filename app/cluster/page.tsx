'use client'

import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Save, Network } from 'lucide-react'
import type { ClusterConfig, ServerInstance } from '@/types/ark'

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
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchClusterConfig()
    fetchServers()
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
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

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

