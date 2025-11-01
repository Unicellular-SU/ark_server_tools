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
    const fullCommand = `${this.arkToolsPath} ${command}`

    // Log command execution
    console.log(`[ARK Manager] Executing command: ${fullCommand}`)

    try {
      const { stdout, stderr } = await execAsync(fullCommand)

      // Log output
      console.log(`[ARK Manager] Command output (first 200 chars):`, stdout.substring(0, 200))

      if (stderr && !stderr.includes('Warning')) {
        console.error(`[ARK Manager] Command stderr:`, stderr)
        throw new Error(stderr)
      }
      return stdout
    } catch (error: any) {
      console.error(`[ARK Manager] Command failed:`, error.message)
      throw new Error(`Failed to execute command: ${error.message}`)
    }
  }

  /**
   * List all server instances
   * Gets individual status for each instance for accuracy
   */
  async listInstances(): Promise<ServerInstance[]> {
    try {
      // Get list of all instances
      const listOutput = await this.executeCommand('list-instances --brief')
      const instanceNames = listOutput.trim().split(/\s+/).filter(n => n)

      // Get status for each instance individually
      const instances: ServerInstance[] = []
      for (const instanceName of instanceNames) {
        try {
          const instance = await this.getInstanceStatus(instanceName)
          if (instance) {
            instances.push(instance)
          }
        } catch (error) {
          console.error(`Error getting status for ${instanceName}:`, error)
        }
      }

      return instances
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
      // Parse the status output for this specific instance
      return await this.parseInstanceStatus(instance, output)
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
   * Properly handles bash-style config with quotes and inline comments
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

          // Check if value is quoted
          if ((value.startsWith('"') && value.includes('"', 1)) ||
            (value.startsWith("'") && value.includes("'", 1))) {
            // Extract content between quotes (handles inline comments after closing quote)
            const quoteChar = value[0]
            const closeQuoteIndex = value.indexOf(quoteChar, 1)
            if (closeQuoteIndex !== -1) {
              value = value.substring(1, closeQuoteIndex)
            }
          } else {
            // If no quotes, remove inline comments
            const commentIndex = value.indexOf('#')
            if (commentIndex !== -1) {
              value = value.substring(0, commentIndex).trim()
            }
          }

          // Final cleanup: remove any remaining quotes
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
   * Parse status for a single instance
   * Properly parses arkmanager status output format:
   * 
   * Status can be:
   * - stopped: Server running: No
   * - starting: Server running: Yes, Server listening: No
   * - starting: Server running: Yes, Server listening: Yes, Unable to query
   * - running: Server running: Yes, Server listening: Yes, has player info
   */
  private async parseInstanceStatus(instanceName: string, statusOutput: string): Promise<ServerInstance | null> {
    try {
      // Read instance configuration
      const config = await this.readInstanceConfig(instanceName)

      // Debug: log the status output
      console.log(`[${instanceName}] Parsing status output:`, statusOutput.substring(0, 200))

      // Check if server is running by looking for specific status lines
      // Note: arkmanager output may have multiple spaces
      const runningMatch = statusOutput.match(/Server running:\s+(Yes|No)/i)
      const listeningMatch = statusOutput.match(/Server listening:\s+(Yes|No)/i)

      console.log(`[${instanceName}] Running match:`, runningMatch ? runningMatch[1] : 'NO MATCH')
      console.log(`[${instanceName}] Listening match:`, listeningMatch ? listeningMatch[1] : 'NO MATCH')

      const isServerRunning = runningMatch && runningMatch[1].toLowerCase() === 'yes'
      const isServerListening = listeningMatch && listeningMatch[1].toLowerCase() === 'yes'

      console.log(`[${instanceName}] isServerRunning:`, isServerRunning)
      console.log(`[${instanceName}] isServerListening:`, isServerListening)

      // Determine server status
      let status: 'running' | 'stopped' | 'starting' | 'stopping'

      if (!isServerRunning) {
        // Server process not running
        status = 'stopped'
        console.log(`[${instanceName}] ✗ Status: STOPPED (Server running: No)`)
      } else if (!isServerListening) {
        // Server process running but not listening yet
        status = 'starting'
        console.log(`[${instanceName}] ⏳ Status: STARTING (Server listening: No)`)
      } else {
        // Server is listening, check if it's queryable (fully started)
        const hasPlayerInfo = statusOutput.includes('Steam Players:')
        const unableToQuery = statusOutput.includes('Unable to query')

        console.log(`[${instanceName}] hasPlayerInfo:`, hasPlayerInfo)
        console.log(`[${instanceName}] unableToQuery:`, unableToQuery)

        if (unableToQuery || !hasPlayerInfo) {
          // Server listening but not fully ready
          status = 'starting'
          console.log(`[${instanceName}] ⏳ Status: STARTING (listening but not queryable)`)
        } else {
          // Server fully online and queryable
          status = 'running'
          console.log(`[${instanceName}] ✓ Status: RUNNING (fully online)`)
        }
      }

      // Extract PID if available
      const pidMatch = statusOutput.match(/Server PID:\s*(\d+)/i)
      const pid = pidMatch ? parseInt(pidMatch[1]) : undefined

      // Extract player count from "Steam Players: X / Y" format
      const steamPlayersMatch = statusOutput.match(/Steam Players:\s*(\d+)\s*\/\s*(\d+)/i)
      let onlinePlayers = 0
      let maxPlayers = parseInt(config.ark_MaxPlayers || '70')

      if (steamPlayersMatch) {
        onlinePlayers = parseInt(steamPlayersMatch[1])
        maxPlayers = parseInt(steamPlayersMatch[2])
      }

      // Extract server name and version if available
      // Format: "Server Name: 8233 8233 - (v360.35)"
      const serverNameMatch = statusOutput.match(/Server Name:\s*(.+?)\s*-\s*\(v([\d.]+)\)/i)
      const serverName = serverNameMatch ? serverNameMatch[1].trim() : undefined
      const version = serverNameMatch ? serverNameMatch[2] : undefined

      const result = {
        name: instanceName,
        status,
        map: config.serverMap || 'TheIsland',
        port: parseInt(config.ark_Port || '7778'),
        queryPort: parseInt(config.ark_QueryPort || '27015'),
        rconPort: parseInt(config.ark_RCONPort || '32330'),
        rconPassword: config.ark_ServerAdminPassword || '',
        pid,
        onlinePlayers,
        maxPlayers,
        serverName,
        version
      }

      console.log(`[${instanceName}] Final result:`, JSON.stringify(result, null, 2))

      return result
    } catch (error) {
      console.error(`[${instanceName}] ✗ Error parsing status:`, error)
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

