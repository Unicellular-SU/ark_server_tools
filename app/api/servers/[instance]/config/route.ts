import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config-manager'
import { arkManager } from '@/lib/ark-manager'
import type { ServerConfig } from '@/types/ark'

/**
 * GET /api/servers/[instance]/config - Read server configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const configPath = await arkManager.getConfigPath(instance, 'GameUserSettings.ini')
    const config = await configManager.readGameUserSettings(configPath)
    
    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/servers/[instance]/config - Write server configuration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const config: ServerConfig = await request.json()
    
    // Validate configuration
    const validation = configManager.validateConfig(config)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      )
    }
    
    const configPath = await arkManager.getConfigPath(instance, 'GameUserSettings.ini')
    await configManager.writeGameUserSettings(configPath, config)
    
    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

