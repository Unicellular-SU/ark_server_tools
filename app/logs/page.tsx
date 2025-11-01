'use client'

import { useState, useEffect, useRef } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Pause, Play } from 'lucide-react'
import type { ServerInstance } from '@/types/ark'

interface LogEntry {
  line: string
  timestamp: number
}

export default function LogsPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [paused, setPaused] = useState(false)
  const logsRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchServers()
  }, [])

  useEffect(() => {
    if (selectedInstance && !paused) {
      connectToLogs()
    }
    
    return () => {
      disconnectFromLogs()
    }
  }, [selectedInstance, paused])

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logsRef.current && !paused) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs, paused])

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

  const connectToLogs = () => {
    disconnectFromLogs()
    
    const eventSource = new EventSource(`/api/logs/${selectedInstance}`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.line && !paused) {
          setLogs(prev => [...prev, data])
        }
      } catch (error) {
        console.error('Error parsing log data:', error)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      disconnectFromLogs()
    }
    
    eventSourceRef.current = eventSource
  }

  const disconnectFromLogs = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const togglePause = () => {
    setPaused(!paused)
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Server Logs</h1>
          <p className="text-muted-foreground">View real-time server logs</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Server Selection</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={togglePause}>
                  {paused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs - {selectedInstance || 'No server selected'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={logsRef}
              className="bg-black text-gray-300 font-mono text-xs p-4 rounded-lg h-[600px] overflow-y-auto"
            >
              {logs.length === 0 ? (
                <p className="text-gray-500">
                  {selectedInstance ? 'Waiting for log entries...' : 'Select a server to view logs'}
                </p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>{' '}
                    {log.line}
                  </div>
                ))
              )}
            </div>
            
            {paused && (
              <p className="text-sm text-yellow-600 mt-2">
                Log streaming is paused. Click Resume to continue.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

