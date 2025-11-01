'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/common/page-layout'
import { ServerInstanceCard } from '@/components/servers/server-instance-card'
import { InstallDialog, type InstallConfig } from '@/components/servers/install-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import type { ServerInstance } from '@/types/ark'

export default function ServersPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [installDialogOpen, setInstallDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/servers')
      const data = await response.json()
      
      if (data.success) {
        setServers(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch servers',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch servers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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

  const handleUpdate = async (instance: string) => {
    try {
      toast({
        title: 'Update Started',
        description: `Checking for updates for ${instance}...`
      })
      
      const response = await fetch(`/api/servers/${instance}/install`, { method: 'PUT' })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Update Started' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      })
      
      if (data.success) {
        fetchServers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update server',
        variant: 'destructive'
      })
    }
  }

  const handleConfigure = (instance: string) => {
    router.push(`/config/${instance}`)
  }

  const handleInstall = async (config: InstallConfig) => {
    try {
      toast({
        title: 'Installation Started',
        description: `Installing ${config.instanceName} with map ${config.map}. This may take several minutes...`
      })
      
      const response = await fetch(`/api/servers/${config.instanceName}/install`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Installation Started' : 'Error',
        description: data.message || data.error,
        variant: data.success ? 'default' : 'destructive'
      })
      
      if (data.success) {
        fetchServers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start installation',
        variant: 'destructive'
      })
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Server Management</h1>
            <p className="text-muted-foreground">Manage your ARK server instances</p>
          </div>
          <Button onClick={() => setInstallDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Install New Server
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading servers...</p>
          </div>
        ) : (
          <>
            {servers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground mb-4">No server instances found</p>
                <Button onClick={() => setInstallDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Install Your First Server
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {servers.map((server) => (
                  <ServerInstanceCard
                    key={server.name}
                    instance={server}
                    onStart={() => handleStart(server.name)}
                    onStop={() => handleStop(server.name)}
                    onRestart={() => handleRestart(server.name)}
                    onUpdate={() => handleUpdate(server.name)}
                    onConfigure={() => handleConfigure(server.name)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <InstallDialog
        open={installDialogOpen}
        onOpenChange={setInstallDialogOpen}
        onInstall={handleInstall}
      />
    </PageLayout>
  )
}

