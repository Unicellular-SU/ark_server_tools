import { NextRequest, NextResponse } from 'next/server'
import { clusterManager } from '@/lib/cluster-manager'
import type { ClusterConfig, ApiResponse } from '@/types/ark'

/**
 * POST /api/cluster/apply - Apply cluster configuration to instances
 * This endpoint applies cluster settings to instance configuration files
 */
export async function POST(request: NextRequest) {
  try {
    const config: ClusterConfig = await request.json()
    
    // Validate configuration
    const validation = clusterManager.validateClusterConfig(config)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid cluster configuration: ${validation.errors.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Apply cluster configuration to instances
    const result = await clusterManager.applyClusterToInstances(config)
    
    const failedInstances = result.results.filter(r => !r.success)
    const successfulInstances = result.results.filter(r => r.success)

    let message = `Configuration applied to ${successfulInstances.length} instance(s)`
    if (failedInstances.length > 0) {
      message += `. Failed: ${failedInstances.length} instance(s)`
    }
    if (result.needsRestart.length > 0) {
      message += `. ${result.needsRestart.length} instance(s) need to be restarted for changes to take effect`
    }

    const response: ApiResponse<any> = {
      success: result.success,
      message,
      data: {
        results: result.results,
        needsRestart: result.needsRestart,
        appliedCount: successfulInstances.length,
        failedCount: failedInstances.length
      }
    }
    
    return NextResponse.json(response, { status: result.success ? 200 : 207 })
  } catch (error: any) {
    console.error('[Cluster Apply API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

