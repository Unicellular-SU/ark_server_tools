import { NextRequest, NextResponse } from 'next/server'
import { arkManager } from '@/lib/ark-manager'

/**
 * POST /api/servers/[instance]/install - Install server
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const success = await arkManager.installServer(instance)
    
    return NextResponse.json({
      success,
      message: success ? 'Server installation started' : 'Failed to start installation'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/servers/[instance]/install - Update server
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const success = await arkManager.updateServer(instance)
    
    return NextResponse.json({
      success,
      message: success ? 'Server update started' : 'Failed to start update'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/servers/[instance]/install - Check for updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const updateStatus = await arkManager.checkUpdate(instance)
    
    return NextResponse.json({
      success: true,
      data: updateStatus
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

