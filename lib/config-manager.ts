import { readFile, writeFile } from 'fs/promises'
import ini from 'ini'
import type { ServerConfig } from '@/types/ark'

/**
 * Config Manager - Manages ARK server configuration files
 */
export class ConfigManager {
  /**
   * Read GameUserSettings.ini
   */
  async readGameUserSettings(configPath: string): Promise<ServerConfig> {
    try {
      const content = await readFile(configPath, 'utf-8')
      const parsed = ini.parse(content)
      
      // Extract relevant sections
      const sessionSettings = parsed.SessionSettings || {}
      const serverSettings = parsed.ServerSettings || {}
      
      return {
        ...sessionSettings,
        ...serverSettings
      }
    } catch (error: any) {
      console.error('Error reading GameUserSettings.ini:', error)
      throw error
    }
  }

  /**
   * Write GameUserSettings.ini
   */
  async writeGameUserSettings(configPath: string, config: ServerConfig): Promise<void> {
    try {
      const iniContent = {
        SessionSettings: {},
        ServerSettings: {},
        '/Script/ShooterGame.ShooterGameMode': {}
      }

      // Distribute settings to appropriate sections
      const sessionKeys = ['SessionName', 'MaxPlayers', 'ServerPassword', 'ServerAdminPassword']
      const serverKeys = ['DifficultyOffset', 'XPMultiplier', 'TamingSpeedMultiplier', 
                          'HarvestAmountMultiplier', 'ResourcesRespawnPeriodMultiplier']

      for (const [key, value] of Object.entries(config)) {
        if (sessionKeys.includes(key)) {
          iniContent.SessionSettings[key] = value
        } else if (serverKeys.includes(key)) {
          iniContent.ServerSettings[key] = value
        } else {
          iniContent['/Script/ShooterGame.ShooterGameMode'][key] = value
        }
      }

      const content = ini.stringify(iniContent)
      await writeFile(configPath, content, 'utf-8')
    } catch (error: any) {
      console.error('Error writing GameUserSettings.ini:', error)
      throw error
    }
  }

  /**
   * Read Game.ini
   */
  async readGameIni(configPath: string): Promise<any> {
    try {
      const content = await readFile(configPath, 'utf-8')
      return ini.parse(content)
    } catch (error: any) {
      console.error('Error reading Game.ini:', error)
      throw error
    }
  }

  /**
   * Write Game.ini
   */
  async writeGameIni(configPath: string, config: any): Promise<void> {
    try {
      const content = ini.stringify(config)
      await writeFile(configPath, content, 'utf-8')
    } catch (error: any) {
      console.error('Error writing Game.ini:', error)
      throw error
    }
  }

  /**
   * Merge configurations
   */
  mergeConfig(existing: ServerConfig, updates: Partial<ServerConfig>): ServerConfig {
    return {
      ...existing,
      ...updates
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config: ServerConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate max players
    if (config.MaxPlayers !== undefined && (config.MaxPlayers < 1 || config.MaxPlayers > 100)) {
      errors.push('MaxPlayers must be between 1 and 100')
    }

    // Validate difficulty offset
    if (config.DifficultyOffset !== undefined && (config.DifficultyOffset < 0 || config.DifficultyOffset > 1)) {
      errors.push('DifficultyOffset must be between 0 and 1')
    }

    // Validate multipliers (must be positive)
    const multipliers = ['XPMultiplier', 'TamingSpeedMultiplier', 'HarvestAmountMultiplier']
    for (const key of multipliers) {
      if (config[key] !== undefined && config[key] < 0) {
        errors.push(`${key} must be a positive number`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): ServerConfig {
    return {
      SessionName: 'ARK Server',
      ServerPassword: '',
      ServerAdminPassword: 'admin123',
      MaxPlayers: 70,
      DifficultyOffset: 0.5,
      XPMultiplier: 1.0,
      TamingSpeedMultiplier: 1.0,
      HarvestAmountMultiplier: 1.0,
      ResourcesRespawnPeriodMultiplier: 1.0,
      AllowThirdPersonPlayer: true,
      ShowMapPlayerLocation: true,
      ServerPVE: true,
      EnablePVPGamma: false
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager()

