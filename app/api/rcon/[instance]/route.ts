import { NextRequest, NextResponse } from 'next/server'
import { rconManager } from '@/lib/rcon-client'

/**
 * POST /api/rcon/[instance] - Execute RCON command
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const { command, host, port, password } = await request.json()
    
    // Connect if not already connected
    if (!rconManager.isConnected(params.instance)) {
      const connected = await rconManager.connect(
        params.instance,
        host || 'localhost',
        port || 27020,
        password || ''
      )
      
      if (!connected) {
        return NextResponse.json(
          { success: false, error: 'Failed to connect to RCON' },
          { status: 500 }
        )
      }
    }
    
    const response = await rconManager.execute(params.instance, command)
    
    return NextResponse.json({
      success: true,
      data: {
        command,
        response
      }
    })
  } catch (error: any) {
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
  { params }: { params: { instance: string } }
) {
  try {
    const history = rconManager.getHistory(params.instance)
    
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
  { params }: { params: { instance: string } }
) {
  try {
    await rconManager.disconnect(params.instance)
    
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

