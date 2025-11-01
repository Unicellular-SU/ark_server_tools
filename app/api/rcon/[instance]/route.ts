import { NextRequest, NextResponse } from 'next/server'
import { rconManager } from '@/lib/rcon-client'

/**
 * POST /api/rcon/[instance] - Execute RCON command
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const { command, host, port, password } = await request.json()
    
    // Connect with fresh connection (connect method handles existing connections)
    const connected = await rconManager.connect(
      instance,
      host || 'localhost',
      port || 32330,
      password || ''
    )
    
    if (!connected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to RCON' },
        { status: 500 }
      )
    }
    
    const response = await rconManager.execute(instance, command)
    
    // Disconnect after command to prevent connection reuse issues
    await rconManager.disconnect(instance)
    
    // Ensure response is serializable
    const responseString = typeof response === 'string' ? response : String(response)
    
    console.log('[RCON API] Command:', command)
    console.log('[RCON API] Response:', responseString)
    
    return NextResponse.json({
      success: true,
      data: {
        command,
        response: responseString
      }
    })
  } catch (error: any) {
    // Make sure to disconnect on error as well
    try {
      await rconManager.disconnect(instance)
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/rcon/[instance] - Get command history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const history = rconManager.getHistory(instance)
    
    return NextResponse.json({
      success: true,
      data: history
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rcon/[instance] - Disconnect RCON
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    await rconManager.disconnect(instance)
    
    return NextResponse.json({
      success: true,
      message: 'RCON disconnected'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

