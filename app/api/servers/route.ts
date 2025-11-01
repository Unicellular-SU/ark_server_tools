import { NextResponse } from 'next/server'
import { arkManager } from '@/lib/ark-manager'
import type { ApiResponse, ServerInstance } from '@/types/ark'

/**
 * GET /api/servers - List all server instances
 */
export async function GET() {
  try {
    const instances = await arkManager.listInstances()
    
    const response: ApiResponse<ServerInstance[]> = {
      success: true,
      data: instances
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    const response: ApiResponse<ServerInstance[]> = {
      success: false,
      error: error.message || 'Failed to list server instances'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

