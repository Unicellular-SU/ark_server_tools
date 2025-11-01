import { NextRequest, NextResponse } from 'next/server'
import { arkManager } from '@/lib/ark-manager'
import type { ApiResponse, ServerInstance } from '@/types/ark'

/**
 * GET /api/servers/[instance] - Get specific server status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const instance = await arkManager.getInstanceStatus(params.instance)
    
    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      )
    }
    
    const response: ApiResponse<ServerInstance> = {
      success: true,
      data: instance
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/servers/[instance] - Start server
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const success = await arkManager.startServer(params.instance)
    
    return NextResponse.json({
      success,
      message: success ? 'Server started successfully' : 'Failed to start server'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/servers/[instance] - Restart server
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const success = await arkManager.restartServer(params.instance)
    
    return NextResponse.json({
      success,
      message: success ? 'Server restarted successfully' : 'Failed to restart server'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/servers/[instance] - Stop server
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const success = await arkManager.stopServer(params.instance)
    
    return NextResponse.json({
      success,
      message: success ? 'Server stopped successfully' : 'Failed to stop server'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

