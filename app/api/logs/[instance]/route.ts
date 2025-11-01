import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

/**
 * GET /api/logs/[instance] - Stream server logs via SSE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  const { instance } = await params
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      // arkmanager logs are in /var/log/arktools
      // Server logs are in ${arkserverroot}/ShooterGame/Saved/Logs/
      const arkserverRoot = process.env.ARK_SERVERS_PATH || '/home/steam/ARK'
      const logPath = `${arkserverRoot}/ShooterGame/Saved/Logs/ShooterGame.log`
      const arkToolsLog = '/var/log/arktools/main.log'
      
      try {
        let lastSize = 0
        
        const sendUpdate = async () => {
          try {
            if (existsSync(logPath)) {
              const content = await readFile(logPath, 'utf-8')
              const newContent = content.slice(lastSize)
              
              if (newContent) {
                const lines = newContent.split('\n').filter(line => line.trim())
                
                for (const line of lines) {
                  const data = `data: ${JSON.stringify({ line, timestamp: Date.now() })}\n\n`
                  controller.enqueue(encoder.encode(data))
                }
                
                lastSize = content.length
              }
            }
          } catch (error) {
            console.error('Error reading log file:', error)
          }
        }
        
        // Send initial logs
        await sendUpdate()
        
        // Send updates every 2 seconds
        const interval = setInterval(sendUpdate, 2000)
        
        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      } catch (error: any) {
        const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`
        controller.enqueue(encoder.encode(errorData))
        controller.close()
      }
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

