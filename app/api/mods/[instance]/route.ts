import { NextRequest, NextResponse } from 'next/server'
import { modManager } from '@/lib/mod-manager'

/**
 * GET /api/mods/[instance] - List installed mods
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const mods = await modManager.listMods(instance)
    
    return NextResponse.json({
      success: true,
      data: mods
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mods/[instance] - Install mod(s)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const { modIds } = await request.json()
    
    if (!Array.isArray(modIds) || modIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'modIds must be a non-empty array' },
        { status: 400 }
      )
    }
    
    const success = await modManager.installMods(instance, modIds)
    
    return NextResponse.json({
      success,
      message: success ? 'Mod installation started' : 'Failed to install mods'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/mods/[instance] - Uninstall mod
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const { modId } = await request.json()
    
    if (!modId) {
      return NextResponse.json(
        { success: false, error: 'modId is required' },
        { status: 400 }
      )
    }
    
    const success = await modManager.uninstallMod(instance, modId)
    
    return NextResponse.json({
      success,
      message: success ? 'Mod uninstalled successfully' : 'Failed to uninstall mod'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

