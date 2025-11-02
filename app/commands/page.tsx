'use client'

import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { CommandTerminal } from '@/components/commands/command-terminal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Info, Terminal, Server, Zap } from 'lucide-react'
import type { ServerInstance } from '@/types/ark'

export default function CommandsPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState('')

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()
      
      if (data.success) {
        setServers(data.data)
        if (data.data.length > 0 && !selectedInstance) {
          setSelectedInstance(data.data[0].name)
        }
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">ARK Manager Commands</h1>
          <p className="text-gray-600">
            Execute any arkmanager command with real-time output streaming
          </p>
        </div>

        {/* Instance Selector (Optional Helper) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Quick Instance Selector
            </CardTitle>
            <CardDescription>
              Select an instance to use in your commands (e.g., @{selectedInstance || 'instance'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="instance-select" className="min-w-fit">
                Current Instance:
              </Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger id="instance-select" className="w-[250px]">
                  <SelectValue placeholder="Select instance" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.name} value={server.name}>
                      {server.name}
                      <Badge variant="outline" className="ml-2">
                        {server.status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedInstance && (
                <span className="text-sm text-gray-600 font-mono">
                  Use: <span className="text-blue-600">@{selectedInstance}</span> in commands
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Command Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Command Examples
            </CardTitle>
            <CardDescription>
              Common arkmanager commands you can execute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Global Commands */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <h3 className="font-semibold">Global Commands</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> list-instances
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> upgrade-tools
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> status @all
                  </div>
                </div>
              </div>

              {/* Instance-Specific Commands */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold">Instance Commands</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> status @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> start @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> stop @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> restart @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> update @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> backup @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> broadcast "Your message" @{selectedInstance || 'instance'}
                  </div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    <span className="text-gray-500">$</span> saveworld @{selectedInstance || 'instance'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> You can execute any arkmanager command. 
                Type the command without the "arkmanager" prefix. 
                For example, just type <code className="bg-white px-1 rounded">status @main</code> instead of 
                <code className="bg-white px-1 rounded">arkmanager status @main</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terminal */}
        <CommandTerminal />
      </div>
    </PageLayout>
  )
}

