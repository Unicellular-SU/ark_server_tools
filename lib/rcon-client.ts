import Rcon from 'simple-rcon'
import type { RconCommand } from '@/types/ark'

/**
 * RCON Manager - Handles RCON connections to ARK servers
 */
export class RconManager {
  private connections: Map<string, Rcon> = new Map()
  private commandHistory: Map<string, RconCommand[]> = new Map()

  /**
   * Connect to a server via RCON
   */
  async connect(
    instance: string,
    host: string,
    port: number,
    password: string
  ): Promise<boolean> {
    try {
      // Disconnect existing connection if any
      if (this.connections.has(instance)) {
        await this.disconnect(instance)
      }

      const rcon = new Rcon({
        host,
        port,
        password,
        timeout: 5000
      })

      await rcon.connect()
      this.connections.set(instance, rcon)

      // Initialize command history for this instance
      if (!this.commandHistory.has(instance)) {
        this.commandHistory.set(instance, [])
      }

      return true
    } catch (error: any) {
      console.error(`Failed to connect to RCON for ${instance}:`, error)
      return false
    }
  }

  /**
   * Execute RCON command
   */
  async execute(instance: string, command: string): Promise<string> {
    try {
      const rcon = this.connections.get(instance)

      if (!rcon) {
        throw new Error(`No RCON connection for instance: ${instance}`)
      }

      const rawResponse = await rcon.exec(command)

      // Handle response from simple-rcon
      // simple-rcon can return: string, object with body property, or other formats
      let response: string

      if (typeof rawResponse === 'string') {
        response = rawResponse
      } else if (rawResponse && typeof rawResponse === 'object') {
        // Try to extract the actual response from the object
        // simple-rcon may return an object with various properties
        response = (rawResponse as any).body ||
          (rawResponse as any).message ||
          (rawResponse as any).response ||
          JSON.stringify(rawResponse)
      } else {
        response = 'Command executed successfully'
      }

      console.log(`[RCON ${instance}] Command: ${command}`)
      console.log(`[RCON ${instance}] Response type:`, typeof rawResponse)
      console.log(`[RCON ${instance}] Raw response:`, rawResponse)
      console.log(`[RCON ${instance}] Parsed response:`, response)

      // Add to command history
      const history = this.commandHistory.get(instance) || []
      history.push({
        command,
        response,
        timestamp: Date.now()
      })

      // Keep only last 100 commands
      if (history.length > 100) {
        history.shift()
      }

      this.commandHistory.set(instance, history)

      return response
    } catch (error: any) {
      console.error(`Failed to execute RCON command for ${instance}:`, error)
      throw error
    }
  }

  /**
   * Disconnect from server
   */
  async disconnect(instance: string): Promise<void> {
    try {
      const rcon = this.connections.get(instance)

      if (rcon) {
        await rcon.close()
        this.connections.delete(instance)
      }
    } catch (error: any) {
      console.error(`Failed to disconnect RCON for ${instance}:`, error)
    }
  }

  /**
   * Check if connected
   */
  isConnected(instance: string): boolean {
    return this.connections.has(instance)
  }

  /**
   * Get command history for instance
   */
  getHistory(instance: string): RconCommand[] {
    return this.commandHistory.get(instance) || []
  }

  /**
   * Clear command history
   */
  clearHistory(instance: string): void {
    this.commandHistory.set(instance, [])
  }

  /**
   * Common RCON commands
   */
  async broadcast(instance: string, message: string): Promise<string> {
    return this.execute(instance, `broadcast ${message}`)
  }

  async saveWorld(instance: string): Promise<string> {
    return this.execute(instance, 'saveworld')
  }

  async listPlayers(instance: string): Promise<string> {
    return this.execute(instance, 'listplayers')
  }

  async kickPlayer(instance: string, steamId: string): Promise<string> {
    return this.execute(instance, `kickplayer ${steamId}`)
  }

  async banPlayer(instance: string, steamId: string): Promise<string> {
    return this.execute(instance, `banplayer ${steamId}`)
  }

  async unbanPlayer(instance: string, steamId: string): Promise<string> {
    return this.execute(instance, `unbanplayer ${steamId}`)
  }

  async destroyWildDinos(instance: string): Promise<string> {
    return this.execute(instance, 'destroywilddinos')
  }

  async setTimeOfDay(instance: string, hour: number, minute: number = 0): Promise<string> {
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    return this.execute(instance, `settimeofday ${time}`)
  }
}

// Export singleton instance
export const rconManager = new RconManager()

