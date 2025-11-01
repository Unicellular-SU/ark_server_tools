'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Trash2 } from 'lucide-react'

interface CommandEntry {
  command: string
  response: string
  timestamp: number
}

interface RconTerminalProps {
  instance: string
  onExecute: (command: string) => Promise<string>
}

export function RconTerminal({ instance, onExecute }: RconTerminalProps) {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<CommandEntry[]>([])
  const [executing, setExecuting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!command.trim() || executing) return
    
    try {
      setExecuting(true)
      const response = await onExecute(command)
      
      setHistory(prev => [
        ...prev,
        {
          command,
          response,
          timestamp: Date.now()
        }
      ])
      
      setCommand('')
    } catch (error: any) {
      setHistory(prev => [
        ...prev,
        {
          command,
          response: `Error: ${error.message}`,
          timestamp: Date.now()
        }
      ])
    } finally {
      setExecuting(false)
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>RCON Terminal - {instance}</CardTitle>
        <Button variant="outline" size="sm" onClick={clearHistory}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div
          ref={terminalRef}
          className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-[400px] overflow-y-auto mb-4"
        >
          {history.length === 0 ? (
            <p className="text-gray-500">Ready to execute commands...</p>
          ) : (
            history.map((entry, index) => (
              <div key={index} className="mb-3">
                <div className="text-blue-400">
                  <span className="text-gray-500">$</span> {entry.command}
                </div>
                <div className="text-green-400 whitespace-pre-wrap mt-1">
                  {entry.response}
                </div>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter RCON command..."
            className="font-mono"
            disabled={executing}
          />
          <Button type="submit" disabled={executing || !command.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {executing ? 'Executing...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

