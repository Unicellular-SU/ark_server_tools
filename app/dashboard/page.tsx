'use client'

import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { ServerStatusCard } from '@/components/dashboard/server-status-card'
import { ResourceMonitor } from '@/components/dashboard/resource-monitor'
import { PlayerList } from '@/components/dashboard/player-list'
import { useToast } from '@/hooks/use-toast'
import type { ServerInstance, ServerMetrics } from '@/types/ark'

interface ServerWithMetrics extends ServerInstance {
  metrics?: ServerMetrics | null
}

export default function DashboardPage() {
  const [servers, setServers] = useState<ServerWithMetrics[]>([])
  const [players, setPlayers] = useState<Record<string, string[]>>({})
  const { toast } = useToast()

  useEffect(() => {
    // Connect to SSE endpoint for real-time updates
    const eventSource = new EventSource('/api/events')

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setServers(data.servers || [])
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server event stream',
        variant: 'destructive'
      })
    }

    // Fetch initial data
    fetchServers()
    
    return () => {
      eventSource.close()
    }
  }, [toast])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()
      
      if (data.success) {
        setServers(data.data)
        
        // Fetch players for each running server
        data.data.forEach(async (server: ServerInstance) => {
          if (server.status === 'running') {
            fetchPlayers(server.name)
          }
        })
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
    }
  }

  const fetchPlayers = async (instance: string) => {
    try {
      const response = await fetch(`/api/servers/${instance}/players`)
      const data = await response.json()
      
      if (data.success) {
        setPlayers(prev => ({
          ...prev,
          [instance]: data.data
        }))
      }
    } catch (error) {
      console.error(`Error fetching players for ${instance}:`, error)
    }
  }

  const handleStart = async (instance: string) => {
    try {
      const response = await fetch(`/api/servers/${instance}`, { method: 'POST' })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      })
      
      if (data.success) {
        fetchServers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start server',
        variant: 'destructive'
      })
    }
  }

  const handleStop = async (instance: string) => {
    try {
      const response = await fetch(`/api/servers/${instance}`, { method: 'DELETE' })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      })
      
      if (data.success) {
        fetchServers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop server',
        variant: 'destructive'
      })
    }
  }

  const handleRestart = async (instance: string) => {
    try {
      const response = await fetch(`/api/servers/${instance}`, { method: 'PUT' })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      })
      
      if (data.success) {
        fetchServers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restart server',
        variant: 'destructive'
      })
    }
  }

  // Calculate aggregate metrics
  const aggregateMetrics = servers.reduce<ServerMetrics | null>((acc, server) => {
    if (server.metrics) {
      if (!acc) {
        return { ...server.metrics }
      }
      return {
        cpuUsage: acc.cpuUsage + server.metrics.cpuUsage,
        memoryUsage: acc.memoryUsage + server.metrics.memoryUsage,
        memoryTotal: server.metrics.memoryTotal,
        memoryPercent: acc.memoryPercent + server.metrics.memoryPercent
      }
    }
    return acc
  }, null)

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your ARK servers</p>
        </div>

        {aggregateMetrics && (
          <ResourceMonitor metrics={aggregateMetrics} title="System Resources" />
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Server Instances</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => (
              <ServerStatusCard
                key={server.name}
                instance={server}
                metrics={server.metrics}
                onStart={() => handleStart(server.name)}
                onStop={() => handleStop(server.name)}
                onRestart={() => handleRestart(server.name)}
              />
            ))}
          </div>
          
          {servers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-muted-foreground">No server instances configured</p>
            </div>
          )}
        </div>

        {servers.filter(s => s.status === 'running').map((server) => (
          players[server.name] && players[server.name].length > 0 && (
            <PlayerList 
              key={server.name}
              serverName={server.name}
              players={players[server.name]}
            />
          )
        ))}
      </div>
    </PageLayout>
  )
}

