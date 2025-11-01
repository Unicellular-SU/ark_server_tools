import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import type { ClusterConfig } from '@/types/ark'

const CLUSTER_CONFIG_PATH = '/etc/arkmanager/cluster-config.json'

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
 */
export async function POST(request: NextRequest) {
  try {
    const config: ClusterConfig = await request.json()
    
    await writeFile(CLUSTER_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
    
    return NextResponse.json({
      success: true,
      message: 'Cluster configuration saved successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

