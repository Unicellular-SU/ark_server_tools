import { NextRequest, NextResponse } from 'next/server'
import { arkManager } from '@/lib/ark-manager'

/**
 * GET /api/servers/[instance]/players - Get online players
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const players = await arkManager.getOnlinePlayers(params.instance)
    
    return NextResponse.json({
      success: true,
      data: players
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

