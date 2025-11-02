import { NextRequest } from 'next/server'
import { arkManager } from '@/lib/ark-manager'

/**
 * POST /api/commands - Execute arkmanager command with streaming output
 * Uses Server-Sent Events (SSE) to stream output in real-time
 */
export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()

    if (!command || typeof command !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Command is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate command (basic sanitization)
    if (command.includes('&&') || command.includes('||') || command.includes(';')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Command contains invalid characters. Please use single arkmanager commands only.' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`[Commands API] Executing command: ${command}`)

    // Create a streaming response using Server-Sent Events
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'start', message: `Executing: ${command}` })}\n\n`)
          )

          // Stream command output
          for await (const line of arkManager.executeCommandStreaming(command)) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'output', line })}\n\n`)
            )
          }

          // Send completion message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'end', message: 'Command completed' })}\n\n`)
          )
        } catch (error: any) {
          // Send error message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`)
          )
        } finally {
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
  } catch (error: any) {
    console.error('[Commands API] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

