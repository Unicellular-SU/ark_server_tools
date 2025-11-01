'use client'

import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { RconTerminal } from '@/components/rcon/rcon-terminal'
import { QuickCommands } from '@/components/rcon/quick-commands'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { ServerInstance } from '@/types/ark'

export default function RconPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()
      
      if (data.success) {
        const runningServers = data.data.filter((s: ServerInstance) => s.status === 'running')
        setServers(runningServers)
        
        if (runningServers.length > 0 && !selectedInstance) {
          setSelectedInstance(runningServers[0].name)
        }
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    }
  }

  const executeCommand = async (command: string): Promise<string> => {
    if (!selectedInstance) {
      throw new Error('No instance selected')
    }

    try {
      const server = servers.find(s => s.name === selectedInstance)
      if (!server) {
        throw new Error('Server not found')
      }

      const response = await fetch(`/api/rcon/${selectedInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          host: 'localhost',
          port: server.rconPort,
          password: server.rconPassword
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.data.response
      } else {
        throw new Error(data.error || 'Failed to execute command')
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const handleQuickCommand = async (command: string) => {
    try {
      const response = await executeCommand(command)
      toast({
        title: 'Command Executed',
        description: response || 'Command completed successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">RCON Management</h1>
          <p className="text-muted-foreground">Execute commands on your ARK servers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Server Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="server-select">Select Server Instance</Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger id="server-select">
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.name} value={server.name}>
                      {server.name} ({server.map})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {servers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No running servers available. Start a server to use RCON.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedInstance && (
          <>
            <QuickCommands onExecute={handleQuickCommand} />
            <RconTerminal instance={selectedInstance} onExecute={executeCommand} />
          </>
        )}
      </div>
    </PageLayout>
  )
}

