import { NextRequest, NextResponse } from 'next/server'
import { arkManager } from '@/lib/ark-manager'
import { configManager } from '@/lib/config-manager'
import type { ServerConfig } from '@/types/ark'

/**
 * POST /api/servers/[instance]/install - Install server
 * Creates instance config file and installs the server
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const body = await request.json()
    const {
      map,
      sessionName,
      adminPassword,
      serverPassword,
      maxPlayers,
      port,
      queryPort,
      rconPort
    } = body

    // Validate required parameters
    if (!map) {
      return NextResponse.json(
        { success: false, error: 'Map parameter is required' },
        { status: 400 }
      )
    }

    if (!adminPassword || adminPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Admin password is required (minimum 6 characters)' },
        { status: 400 }
      )
    }

    if (!port || !queryPort || !rconPort) {
      return NextResponse.json(
        { success: false, error: 'All port numbers are required' },
        { status: 400 }
      )
    }

    // Validate port numbers
    const validatePort = (portNum: number, name: string): string | null => {
      if (portNum < 1 || portNum > 65535) {
        return `${name} must be between 1 and 65535`
      }
      return null
    }

    const portError = validatePort(port, 'Game port') ||
      validatePort(queryPort, 'Query port') ||
      validatePort(rconPort, 'RCON port')

    if (portError) {
      return NextResponse.json(
        { success: false, error: portError },
        { status: 400 }
      )
    }

    // Check for port conflicts with existing instances
    const existingInstances = await arkManager.listInstances()
    const portConflicts: string[] = []

    existingInstances.forEach(inst => {
      if (inst.port === port) {
        portConflicts.push(`Game port ${port} is already used by instance '${inst.name}'`)
      }
      if (inst.queryPort === queryPort) {
        portConflicts.push(`Query port ${queryPort} is already used by instance '${inst.name}'`)
      }
      if (inst.rconPort === rconPort) {
        portConflicts.push(`RCON port ${rconPort} is already used by instance '${inst.name}'`)
      }
    })

    if (portConflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: `Port conflicts detected:\n${portConflicts.join('\n')}` },
        { status: 400 }
      )
    }

    // Create instance configuration file before installation
    const instanceConfigDir = process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances'
    const configPath = `${instanceConfigDir}/${instance}.cfg`

    // Create configuration with user-provided values
    const serverConfig: ServerConfig = {
      serverMap: map,
      SessionName: sessionName || `ARK Server - ${instance}`,
      ServerAdminPassword: adminPassword,
      RCONEnabled: true,
      RCONPort: rconPort,
      Port: port,
      QueryPort: queryPort,
      MaxPlayers: maxPlayers || 70,
      ServerPassword: serverPassword || ''
    }

    console.log(`[Install] Creating config file for instance: ${instance}`)
    console.log(`[Install] Map: ${map}`)
    console.log(`[Install] Session Name: ${serverConfig.SessionName}`)
    console.log(`[Install] Ports - Game: ${port}, Query: ${queryPort}, RCON: ${rconPort}`)
    console.log(`[Install] Max Players: ${serverConfig.MaxPlayers}`)

    await configManager.writeInstanceConfigFile(configPath, serverConfig)

    // Now install the server
    const success = await arkManager.installServer(instance)

    return NextResponse.json({
      success,
      message: success ? 'Server installation started' : 'Failed to start installation'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/servers/[instance]/install - Update server
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const success = await arkManager.updateServer(instance)

    return NextResponse.json({
      success,
      message: success ? 'Server update started' : 'Failed to start update'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/servers/[instance]/install - Check for updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const updateStatus = await arkManager.checkUpdate(instance)

    return NextResponse.json({
      success: true,
      data: updateStatus
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

