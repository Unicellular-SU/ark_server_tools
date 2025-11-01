import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Timeout helper for long-running operations
async function execWithTimeout(command: string, timeoutMs: number = 30000): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`))
    }, timeoutMs)

    execAsync(command)
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

// Cache entry interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Simple cache manager
class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  clearByPrefix(prefix: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    })
  }

  getAge(key: string): number | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    return Date.now() - entry.timestamp
  }
}

/**
 * Mod Manager - Handles ARK server mod installation and management
 */
export class ModManager {
  private arkToolsPath: string
  private cache: CacheManager

  // Cache TTL configurations (in milliseconds)
  private readonly CACHE_TTL = {
    MOD_LIST: 5 * 60 * 1000,      // 5 minutes for mod list
    MOD_UPDATE: 30 * 60 * 1000,   // 30 minutes for update check
  }

  constructor(arkToolsPath: string = 'arkmanager') {
    this.arkToolsPath = arkToolsPath
    this.cache = new CacheManager()
  }

  /**
   * Clear all cache for a specific instance
   */
  clearInstanceCache(instance: string): void {
    this.cache.clearByPrefix(`${instance}:`)
    console.log(`Cache cleared for instance: ${instance}`)
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear()
    console.log('All cache cleared')
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

      // Clear cache after installation
      this.cache.delete(`${instance}:mods:list`)
      console.log(`Cleared mod list cache for ${instance}`)

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

      // Clear cache after installation
      this.cache.delete(`${instance}:mods:list`)
      console.log(`Cleared mod list cache for ${instance}`)

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

      // Clear cache after uninstallation
      this.cache.delete(`${instance}:mods:list`)
      console.log(`Cleared mod list cache for ${instance}`)

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

      // Clear cache after reinstallation
      this.cache.delete(`${instance}:mods:list`)
      this.cache.delete(`${instance}:mods:update-check`)
      console.log(`Cleared mod cache for ${instance}`)

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
  async listMods(instance: string, forceRefresh: boolean = false): Promise<string[]> {
    const cacheKey = `${instance}:mods:list`

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = this.cache.get<string[]>(cacheKey)
      if (cached !== null) {
        const cacheAge = this.cache.getAge(cacheKey)
        console.log(`Using cached mod list for ${instance} (age: ${Math.round((cacheAge || 0) / 1000)}s)`)
        return cached
      }
    }

    try {
      console.log(`Fetching fresh mod list for instance: ${instance}${forceRefresh ? ' (force refresh)' : ''}`)
      const { stdout } = await execWithTimeout(
        `${this.arkToolsPath} list-mods @${instance}`,
        60000 * 5 // 5 minutes timeout for listing mods
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

      console.log(`Found ${mods.length} mods for instance ${instance}`)

      // Cache the result
      this.cache.set(cacheKey, mods, this.CACHE_TTL.MOD_LIST)
      console.log(`Cached mod list for ${instance} (TTL: ${this.CACHE_TTL.MOD_LIST / 1000}s)`)

      return mods
    } catch (error: any) {
      console.error(`Error listing mods:`, error)
      if (error.message?.includes('timed out')) {
        throw new Error('Listing mods is taking longer than expected. The server may be busy or unreachable.')
      }
      return []
    }
  }

  /**
   * Check if mod updates are available
   */
  async checkModUpdate(instance: string, forceRefresh: boolean = false): Promise<boolean> {
    const cacheKey = `${instance}:mods:update-check`

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = this.cache.get<boolean>(cacheKey)
      if (cached !== null) {
        const cacheAge = this.cache.getAge(cacheKey)
        console.log(`Using cached update check for ${instance} (age: ${Math.round((cacheAge || 0) / 1000)}s)`)
        return cached
      }
    }

    try {
      console.log(`Checking mod updates for instance: ${instance}${forceRefresh ? ' (force refresh)' : ''}`)
      const { stdout } = await execWithTimeout(
        `${this.arkToolsPath} checkmodupdate @${instance}`,
        90000 * 5 // 5 minutes timeout - Steam Workshop checks can be slow
      )

      // Exit code 0 means update available
      // Exit code 1 means no update
      const hasUpdate = stdout.toLowerCase().includes('update available')
      console.log(`Mod update check result for ${instance}: ${hasUpdate ? 'updates available' : 'up to date'}`)

      // Cache the result
      this.cache.set(cacheKey, hasUpdate, this.CACHE_TTL.MOD_UPDATE)
      console.log(`Cached update check for ${instance} (TTL: ${this.CACHE_TTL.MOD_UPDATE / 1000}s)`)

      return hasUpdate
    } catch (error: any) {
      // If command returns non-zero exit code, check the error
      if (error.code === 1) {
        console.log(`No mod updates available for ${instance}`)
        const hasUpdate = false
        // Cache this result too
        this.cache.set(cacheKey, hasUpdate, this.CACHE_TTL.MOD_UPDATE)
        return hasUpdate
      }
      console.error('Error checking mod update:', error)
      if (error.message?.includes('timed out')) {
        throw new Error('Checking mod updates is taking longer than expected. Steam Workshop may be slow or unreachable.')
      }
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

