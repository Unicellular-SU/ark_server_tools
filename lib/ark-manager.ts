import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import type { ServerInstance, ServerConfig, UpdateStatus } from '@/types/ark'

const execAsync = promisify(exec)

/**
 * ARK Server Manager - Wrapper for ark-server-tools commands
 * Executes bash commands to manage ARK servers
 */
export class ArkManager {
  private arkToolsPath: string
  private instanceConfigDir: string
  private arkServerRoot: string

  constructor(
    arkToolsPath: string = 'arkmanager',
    instanceConfigDir: string = '/etc/arkmanager/instances',
    arkServerRoot: string = process.env.ARK_SERVERS_PATH || '/home/steam/ARK'
  ) {
    this.arkToolsPath = arkToolsPath
    this.instanceConfigDir = instanceConfigDir
    this.arkServerRoot = arkServerRoot
  }

  /**
   * Execute arkmanager command
   */
  async executeCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(`${this.arkToolsPath} ${command}`)
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(stderr)
      }
      return stdout
    } catch (error: any) {
      throw new Error(`Failed to execute command: ${error.message}`)
    }
  }

  /**
   * List all server instances
   */
  async listInstances(): Promise<ServerInstance[]> {
    try {
      const output = await this.executeCommand('status')
      return this.parseStatusOutput(output)
    } catch (error: any) {
      console.error('Error listing instances:', error)
      return []
    }
  }

  /**
   * Get status of a specific instance
   */
  async getInstanceStatus(instance: string): Promise<ServerInstance | null> {
    try {
      const output = await this.executeCommand(`status @${instance}`)
      const instances = this.parseStatusOutput(output)
      return instances.find(i => i.name === instance) || null
    } catch (error: any) {
      console.error(`Error getting status for ${instance}:`, error)
      return null
    }
  }

  /**
   * Start a server instance
   */
  async startServer(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`start @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error starting ${instance}:`, error)
      return false
    }
  }

  /**
   * Stop a server instance
   */
  async stopServer(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`stop @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error stopping ${instance}:`, error)
      return false
    }
  }

  /**
   * Restart a server instance
   */
  async restartServer(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`restart @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error restarting ${instance}:`, error)
      return false
    }
  }

  /**
   * Install a server instance
   */
  async installServer(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`install @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error installing ${instance}:`, error)
      return false
    }
  }

  /**
   * Update a server instance
   */
  async updateServer(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`update @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error updating ${instance}:`, error)
      return false
    }
  }

  /**
   * Check for updates
   */
  async checkUpdate(instance: string): Promise<UpdateStatus> {
    try {
      const output = await this.executeCommand(`checkupdate @${instance}`)
      // Parse output to determine if update is available
      const updateAvailable = output.includes('update available') || output.includes('outdated')

      return {
        instance,
        currentVersion: 'Unknown',
        latestVersion: 'Unknown',
        updateAvailable
      }
    } catch (error: any) {
      console.error(`Error checking update for ${instance}:`, error)
      return {
        instance,
        currentVersion: 'Unknown',
        latestVersion: 'Unknown',
        updateAvailable: false
      }
    }
  }

  /**
   * Get server configuration file path
   * Based on arkserverroot from instance config
   */
  async getConfigPath(instance: string, configFile: 'GameUserSettings.ini' | 'Game.ini'): Promise<string> {
    try {
      // Try to read arkserverroot from instance config
      const instanceConfig = await this.readInstanceConfig(instance)
      const serverRoot = instanceConfig.arkserverroot || this.arkServerRoot
      return `${serverRoot}/ShooterGame/Saved/Config/LinuxServer/${configFile}`
    } catch (error) {
      // Fallback to default path
      return `${this.arkServerRoot}/ShooterGame/Saved/Config/LinuxServer/${configFile}`
    }
  }

  /**
   * Read instance configuration file
   */
  async readInstanceConfig(instance: string): Promise<Record<string, any>> {
    try {
      const configPath = `${this.instanceConfigDir}/${instance}.cfg`
      const content = await readFile(configPath, 'utf-8')
      const config: Record<string, any> = {}

      // Parse bash-style config file
      const lines = content.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const match = trimmed.match(/^([^=]+)=(.+)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '')
          config[key] = value
        }
      }

      return config
    } catch (error) {
      console.error(`Error reading config for ${instance}:`, error)
      return {}
    }
  }

  /**
   * Broadcast message to server
   * Uses arkmanager's broadcast command which handles RCON internally
   */
  async broadcast(instance: string, message: string): Promise<boolean> {
    try {
      await this.executeCommand(`broadcast @${instance} "${message}"`)
      return true
    } catch (error: any) {
      console.error(`Error broadcasting to ${instance}:`, error)
      return false
    }
  }

  /**
   * Save world
   * Uses arkmanager's saveworld command
   */
  async saveWorld(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`saveworld @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error saving world for ${instance}:`, error)
      return false
    }
  }

  /**
   * Execute RCON command through arkmanager
   */
  async executeRconCommand(instance: string, command: string): Promise<string> {
    try {
      const output = await this.executeCommand(`rconcmd @${instance} "${command}"`)
      return output
    } catch (error: any) {
      console.error(`Error executing RCON command for ${instance}:`, error)
      throw error
    }
  }

  /**
   * Parse arkmanager status output
   * arkmanager status format varies, but typically shows:
   * - Instance name
   * - Running/Stopped status
   * - Server version
   * - PID if running
   * - Player count if running
   */
  private async parseStatusOutput(output: string): Promise<ServerInstance[]> {
    const instances: ServerInstance[] = []

    // Try to get list of all instances first
    try {
      const listOutput = await this.executeCommand('list-instances --brief')
      const instanceNames = listOutput.trim().split(/\s+/).filter(n => n)

      for (const instanceName of instanceNames) {
        const instance = await this.parseInstanceStatus(instanceName, output)
        if (instance) {
          instances.push(instance)
        }
      }
    } catch (error) {
      // Fallback to parsing the status output directly
      console.error('Error listing instances, trying to parse status output:', error)

      // Basic parsing as fallback
      const lines = output.split('\n')
      for (const line of lines) {
        if (line.includes('running') || line.includes('stopped')) {
          const parts = line.trim().split(/\s+/)
          if (parts.length > 0) {
            const instanceName = parts[0]
            const instance = await this.parseInstanceStatus(instanceName, line)
            if (instance) {
              instances.push(instance)
            }
          }
        }
      }
    }

    return instances
  }

  /**
   * Parse status for a single instance
   */
  private async parseInstanceStatus(instanceName: string, statusOutput: string): Promise<ServerInstance | null> {
    try {
      // Read instance configuration
      const config = await this.readInstanceConfig(instanceName)

      // Determine if running by checking status output
      const isRunning = statusOutput.toLowerCase().includes('running') ||
        statusOutput.toLowerCase().includes('listening')

      // Extract PID if available
      const pidMatch = statusOutput.match(/PID:\s*(\d+)/)
      const pid = pidMatch ? parseInt(pidMatch[1]) : undefined

      // Extract player count if available
      const playersMatch = statusOutput.match(/(\d+)\/(\d+)\s+players/)
      const onlinePlayers = playersMatch ? parseInt(playersMatch[1]) : 0
      const maxPlayers = playersMatch ? parseInt(playersMatch[2]) :
        parseInt(config.ark_MaxPlayers || '70')

      return {
        name: instanceName,
        status: isRunning ? 'running' : 'stopped',
        map: config.serverMap || 'TheIsland',
        port: parseInt(config.ark_Port || '7778'),
        queryPort: parseInt(config.ark_QueryPort || '27015'),
        rconPort: parseInt(config.ark_RCONPort || '32330'),
        rconPassword: config.ark_ServerAdminPassword || '',
        pid,
        onlinePlayers,
        maxPlayers
      }
    } catch (error) {
      console.error(`Error parsing status for ${instanceName}:`, error)
      return null
    }
  }

  /**
   * Get list of online players
   */
  async getOnlinePlayers(instance: string): Promise<string[]> {
    try {
      const output = await this.executeCommand(`rconcmd @${instance} "listplayers"`)
      // Parse player list from RCON output
      const players: string[] = []
      const lines = output.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed &&
          !trimmed.includes('No Players') &&
          !trimmed.includes('Running') &&
          !trimmed.includes('command:')) {
          players.push(trimmed)
        }
      }

      return players
    } catch (error: any) {
      console.error(`Error getting players for ${instance}:`, error)
      return []
    }
  }

  /**
   * Get list of all available instances from config directory
   */
  async listAvailableInstances(): Promise<string[]> {
    try {
      const output = await this.executeCommand('list-instances --brief')
      return output.trim().split(/\s+/).filter(n => n)
    } catch (error: any) {
      console.error('Error listing available instances:', error)
      return []
    }
  }

  /**
   * Backup a server instance
   */
  async backupServer(instance: string): Promise<boolean> {
    try {
      await this.executeCommand(`backup @${instance}`)
      return true
    } catch (error: any) {
      console.error(`Error backing up ${instance}:`, error)
      return false
    }
  }
}

// Export singleton instance with environment variables
export const arkManager = new ArkManager(
  process.env.ARK_TOOLS_PATH || 'arkmanager',
  process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances',
  process.env.ARK_SERVERS_PATH || '/home/steam/ARK'
)

