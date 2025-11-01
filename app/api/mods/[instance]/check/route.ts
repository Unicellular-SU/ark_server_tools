import { NextRequest, NextResponse } from 'next/server'
import { modManager } from '@/lib/mod-manager'

/**
 * GET /api/mods/[instance]/check - Check for mod updates
 * Query params: forceRefresh=true to bypass cache
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('forceRefresh') === 'true'
    
    const updateAvailable = await modManager.checkModUpdate(instance, forceRefresh)
    
    return NextResponse.json({
      success: true,
      data: {
        updateAvailable
      },
      cached: !forceRefresh // Indicate if result might be cached
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

