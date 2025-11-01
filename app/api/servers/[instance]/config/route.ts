import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config-manager'
import type { ServerConfig } from '@/types/ark'

/**
 * GET /api/servers/[instance]/config - Read server configuration
 * Reads from instance .cfg file (ark_ parameters)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    
    // Read from instance .cfg file
    const instanceConfigDir = process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances'
    const configPath = `${instanceConfigDir}/${instance}.cfg`
    const config = await configManager.readInstanceConfigFile(configPath)
    
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
 * Writes to instance .cfg file (ark_ parameters)
 * 
 * This updates the arkmanager instance configuration file with ark_ prefixed parameters.
 * These parameters are used when starting the server.
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
    
    // Write to instance .cfg file
    const instanceConfigDir = process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances'
    const configPath = `${instanceConfigDir}/${instance}.cfg`
    await configManager.writeInstanceConfigFile(configPath, config)
    
    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully. Restart the server for changes to take effect.'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

