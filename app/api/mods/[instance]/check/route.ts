import { NextRequest, NextResponse } from 'next/server'
import { modManager } from '@/lib/mod-manager'

/**
 * GET /api/mods/[instance]/check - Check for mod updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const updateAvailable = await modManager.checkModUpdate(instance)
    
    return NextResponse.json({
      success: true,
      data: {
        updateAvailable
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

