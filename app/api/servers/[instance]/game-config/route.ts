import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config-manager'

/**
 * GET /api/servers/[instance]/game-config
 * Read GameUserSettings.ini and Game.ini files
 * 
 * Query params:
 * - download: 'GameUserSettings' | 'Game' - to download specific file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const searchParams = request.nextUrl.searchParams
    const download = searchParams.get('download')

    // If download param is present, return file as download
    if (download) {
      const fileType = download === 'GameUserSettings' ? 'GameUserSettings' : 'Game'
      const filePath = await configManager.getGameConfigFilePath(instance, fileType)
      const content = await configManager.readGameConfigFile(filePath)
      
      const filename = fileType === 'GameUserSettings' ? 'GameUserSettings.ini' : 'Game.ini'
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${instance}-${filename}"`
        }
      })
    }

    // Otherwise, return both files as JSON
    const gameUserSettingsPath = await configManager.getGameConfigFilePath(instance, 'GameUserSettings')
    const gamePath = await configManager.getGameConfigFilePath(instance, 'Game')

    const gameUserSettingsContent = await configManager.readGameConfigFile(gameUserSettingsPath)
    const gameContent = await configManager.readGameConfigFile(gamePath)

    return NextResponse.json({
      success: true,
      data: {
        gameUserSettings: {
          content: gameUserSettingsContent,
          path: gameUserSettingsPath,
          exists: gameUserSettingsContent !== ''
        },
        game: {
          content: gameContent,
          path: gamePath,
          exists: gameContent !== ''
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/servers/[instance]/game-config
 * Save edited configuration file
 * 
 * Body: {
 *   fileType: 'GameUserSettings' | 'Game',
 *   content: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const body = await request.json()
    const { fileType, content } = body

    if (!fileType || !['GameUserSettings', 'Game'].includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid fileType. Must be "GameUserSettings" or "Game"' },
        { status: 400 }
      )
    }

    if (content === undefined || content === null) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get file path
    const filePath = await configManager.getGameConfigFilePath(instance, fileType as 'GameUserSettings' | 'Game')
    
    // Get backup directory
    const instanceConfigDir = process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances'
    const backupDir = `${instanceConfigDir}/bak`

    // Write file (with automatic backup)
    await configManager.writeGameConfigFile(filePath, content, backupDir)

    const filename = fileType === 'GameUserSettings' ? 'GameUserSettings.ini' : 'Game.ini'

    return NextResponse.json({
      success: true,
      message: `${filename} 已保存到 ${instanceConfigDir}/${instance}.${filename}。原文件已备份到 ${backupDir}。重启服务器后，arkmanager 会自动将此文件复制到服务器目录。`
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/servers/[instance]/game-config
 * Upload configuration file
 * 
 * FormData:
 * - file: File
 * - fileType: 'GameUserSettings' | 'Game'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const { instance } = await params
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    if (!fileType || !['GameUserSettings', 'Game'].includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid fileType. Must be "GameUserSettings" or "Game"' },
        { status: 400 }
      )
    }

    // Validate file type (must be text file)
    if (!file.type.includes('text') && !file.name.endsWith('.ini')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only text/ini files are allowed' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()

    // Get file path
    const filePath = await configManager.getGameConfigFilePath(instance, fileType as 'GameUserSettings' | 'Game')
    
    // Get backup directory
    const instanceConfigDir = process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances'
    const backupDir = `${instanceConfigDir}/bak`

    // Write file (with automatic backup)
    await configManager.writeGameConfigFile(filePath, content, backupDir)

    const filename = fileType === 'GameUserSettings' ? 'GameUserSettings.ini' : 'Game.ini'

    return NextResponse.json({
      success: true,
      message: `${filename} 已上传到 ${instanceConfigDir}/${instance}.${filename}。原文件已备份到 ${backupDir}。重启服务器后，arkmanager 会自动将此文件复制到服务器目录。`
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

