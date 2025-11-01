import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Mod Manager - Handles ARK server mod installation and management
 */
export class ModManager {
  private arkToolsPath: string

  constructor(arkToolsPath: string = 'arkmanager') {
    this.arkToolsPath = arkToolsPath
  }

  /**
   * Install a mod
   */
  async installMod(instance: string, modId: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} installmod @${instance} ${modId}`
      )
      console.log('Install mod output:', stdout)
      return true
    } catch (error: any) {
      console.error(`Error installing mod ${modId}:`, error)
      return false
    }
  }

  /**
   * Install multiple mods
   */
  async installMods(instance: string, modIds: string[]): Promise<boolean> {
    try {
      const modList = modIds.join(',')
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} installmod @${instance} ${modList}`
      )
      console.log('Install mods output:', stdout)
      return true
    } catch (error: any) {
      console.error(`Error installing mods:`, error)
      return false
    }
  }

  /**
   * Uninstall a mod
   */
  async uninstallMod(instance: string, modId: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} uninstallmod @${instance} ${modId}`
      )
      console.log('Uninstall mod output:', stdout)
      return true
    } catch (error: any) {
      console.error(`Error uninstalling mod ${modId}:`, error)
      return false
    }
  }

  /**
   * Reinstall a mod (uninstall + install)
   */
  async reinstallMod(instance: string, modId: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} reinstallmod @${instance} ${modId}`
      )
      console.log('Reinstall mod output:', stdout)
      return true
    } catch (error: any) {
      console.error(`Error reinstalling mod ${modId}:`, error)
      return false
    }
  }

  /**
   * Enable a mod in the config
   */
  async enableMod(instance: string, modId: string, modType: 'game' | 'map' | 'tc' = 'game'): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} enablemod @${instance} ${modId}=${modType}`
      )
      console.log('Enable mod output:', stdout)
      return true
    } catch (error: any) {
      console.error(`Error enabling mod ${modId}:`, error)
      return false
    }
  }

  /**
   * Disable a mod in the config
   */
  async disableMod(instance: string, modId: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} disablemod @${instance} ${modId}`
      )
      console.log('Disable mod output:', stdout)
      return true
    } catch (error: any) {
      console.error(`Error disabling mod ${modId}:`, error)
      return false
    }
  }

  /**
   * List installed mods
   */
  async listMods(instance: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(
        `${this.arkToolsPath} list-mods @${instance}`
      )
      
      // Parse mod list from output
      const mods: string[] = []
      const lines = stdout.split('\n')
      
      for (const line of lines) {
        const trimmed = line.trim()
        // Look for mod IDs (typically numeric)
        const modMatch = trimmed.match(/(\d{6,})/)
        if (modMatch) {
          mods.push(modMatch[1])
        }
      }
      
      return mods
    } catch (error: any) {
      console.error(`Error listing mods:`, error)
      return []
    }
  }

  /**
   * Check if mod updates are available
   */
  async checkModUpdate(instance: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `${this.arkToolsPath} checkmodupdate @${instance}`
      )
      
      // Exit code 0 means update available
      // Exit code 1 means no update
      return stdout.toLowerCase().includes('update available')
    } catch (error: any) {
      // If command returns non-zero exit code, check the error
      if (error.code === 1) {
        return false // No update available
      }
      console.error('Error checking mod update:', error)
      return false
    }
  }

  /**
   * Install all mods defined in instance config
   */
  async installAllMods(instance: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} installmods @${instance}`
      )
      console.log('Install all mods output:', stdout)
      return true
    } catch (error: any) {
      console.error('Error installing all mods:', error)
      return false
    }
  }

  /**
   * Uninstall all mods
   */
  async uninstallAllMods(instance: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(
        `${this.arkToolsPath} uninstallmods @${instance}`
      )
      console.log('Uninstall all mods output:', stdout)
      return true
    } catch (error: any) {
      console.error('Error uninstalling all mods:', error)
      return false
    }
  }
}

// Export singleton instance
export const modManager = new ModManager(
  process.env.ARK_TOOLS_PATH || 'arkmanager'
)

