import { NextRequest, NextResponse } from 'next/server'
import { clusterManager } from '@/lib/cluster-manager'
import type { ApiResponse } from '@/types/ark'

/**
 * GET /api/cluster/status - Get cluster status
 * Returns information about which instances are configured with cluster settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clusterId = searchParams.get('clusterId') || undefined
    
    const status = await clusterManager.getClusterStatus(clusterId)
    
    const response: ApiResponse<typeof status> = {
      success: true,
      data: status
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Cluster Status API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

