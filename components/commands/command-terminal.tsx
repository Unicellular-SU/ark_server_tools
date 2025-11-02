'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Trash2, Loader2 } from 'lucide-react'

interface OutputEntry {
  text: string
  timestamp: number
  type: 'command' | 'output' | 'error' | 'system'
}

interface CommandTerminalProps {
  title?: string
}

export function CommandTerminal({ title = 'ARK Command Terminal' }: CommandTerminalProps) {
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState<OutputEntry[]>([])
  const [executing, setExecuting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const addOutput = (text: string, type: OutputEntry['type'] = 'output') => {
    setOutput(prev => [
      ...prev,
      {
        text,
        timestamp: Date.now(),
        type
      }
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!command.trim() || executing) return

    const currentCommand = command.trim()
    setCommand('')
    setExecuting(true)

    // Add command to output
    addOutput(currentCommand, 'command')

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: currentCommand }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        addOutput(errorData.error || 'Failed to execute command', 'error')
        setExecuting(false)
        return
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        const data = await response.json()
        addOutput(data.error || 'Unexpected response format', 'error')
        setExecuting(false)
        return
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        addOutput('Failed to read response stream', 'error')
        setExecuting(false)
        return
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true })
          
          // Parse SSE data
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6))
                
                if (data.type === 'start') {
                  addOutput(data.message, 'system')
                } else if (data.type === 'output') {
                  addOutput(data.line, 'output')
                } else if (data.type === 'end') {
                  addOutput(data.message, 'system')
                } else if (data.type === 'error') {
                  addOutput(data.message, 'error')
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addOutput('Command execution cancelled', 'system')
      } else {
        addOutput(`Error: ${error.message}`, 'error')
      }
    } finally {
      setExecuting(false)
      abortControllerRef.current = null
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  const cancelExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  const getTextColor = (type: OutputEntry['type']) => {
    switch (type) {
      case 'command':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      case 'system':
        return 'text-yellow-400'
      case 'output':
      default:
        return 'text-green-400'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {executing && (
            <Button variant="outline" size="sm" onClick={cancelExecution}>
              Cancel
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearOutput}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={terminalRef}
          className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-[500px] overflow-y-auto mb-4"
        >
          {output.length === 0 ? (
            <p className="text-gray-500">Ready to execute arkmanager commands...</p>
          ) : (
            output.map((entry, index) => (
              <div key={index} className="mb-1">
                {entry.type === 'command' ? (
                  <div className="text-blue-400">
                    <span className="text-gray-500">$ arkmanager</span> {entry.text}
                  </div>
                ) : (
                  <div className={`${getTextColor(entry.type)} whitespace-pre-wrap`}>
                    {entry.text}
                  </div>
                )}
              </div>
            ))
          )}
          {executing && (
            <div className="flex items-center gap-2 text-yellow-400 mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Executing command...</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-mono">
              arkmanager
            </span>
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="status @main"
              className="font-mono pl-[110px]"
              disabled={executing}
            />
          </div>
          <Button type="submit" disabled={executing || !command.trim()}>
            {executing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Execute
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

