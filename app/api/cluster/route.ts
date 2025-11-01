import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { clusterManager } from '@/lib/cluster-manager'
import type { ClusterConfig, ApiResponse } from '@/types/ark'
import { dirname } from 'path'

const CLUSTER_CONFIG_PATH = process.env.CLUSTER_CONFIG_PATH || '/etc/arkmanager/cluster-config.json'

/**
 * GET /api/cluster - Get cluster configuration
 */
export async function GET() {
  try {
    const content = await readFile(CLUSTER_CONFIG_PATH, 'utf-8')
    const config: ClusterConfig = JSON.parse(content)
    
    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error: any) {
    // Return default config if file doesn't exist
    return NextResponse.json({
      success: true,
      data: {
        clusterId: '',
        clusterDir: '',
        instances: [],
        crossServerChat: {
          enabled: false,
          port: 0
        }
      }
    })
  }
}

/**
 * POST /api/cluster - Save cluster configuration
 * This endpoint saves the cluster metadata only
 * To apply configuration to instances, use /api/cluster/apply
 */
export async function POST(request: NextRequest) {
  try {
    const config: ClusterConfig = await request.json()
    
    // Validate configuration
    const validation = clusterManager.validateClusterConfig(config)
    if (!validation.valid) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Invalid configuration: ${validation.errors.join(', ')}`
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Ensure the config directory exists
    try {
      const configDir = dirname(CLUSTER_CONFIG_PATH)
      await mkdir(configDir, { recursive: true, mode: 0o755 })
    } catch (error) {
      // Directory might already exist, ignore
    }

    // Save configuration
    await writeFile(CLUSTER_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
    
    const response: ApiResponse<null> = {
      success: true,
      message: 'Cluster configuration saved. Use "Apply to Servers" to update instance configurations.'
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Cluster API] Error saving configuration:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}

