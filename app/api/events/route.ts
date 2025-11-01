import { NextRequest } from 'next/server'
import { arkManager } from '@/lib/ark-manager'
import { systemMonitor } from '@/lib/system-monitor'

/**
 * GET /api/events - Server-Sent Events endpoint for real-time updates
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          // Get all server instances
          const instances = await arkManager.listInstances()
          
          // Get metrics for each running instance
          const updates = await Promise.all(
            instances.map(async (instance) => {
              if (instance.pid) {
                const metrics = await systemMonitor.getProcessMetrics(instance.pid)
                return {
                  ...instance,
                  metrics
                }
              }
              return instance
            })
          )
          
          const data = `data: ${JSON.stringify({
            timestamp: Date.now(),
            servers: updates
          })}\n\n`
          
          controller.enqueue(encoder.encode(data))
        } catch (error: any) {
          console.error('Error sending update:', error)
        }
      }
      
      // Send initial update
      await sendUpdate()
      
      // Send updates every 5 seconds
      const interval = setInterval(sendUpdate, 5000)
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
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

