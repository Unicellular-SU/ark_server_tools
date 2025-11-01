import { mkdir, access, constants } from 'fs/promises'
import { configManager } from './config-manager'
import { arkManager } from './ark-manager'
import type { ClusterConfig, ServerConfig, ServerInstance } from '@/types/ark'

/**
 * Cluster Manager - Manages ARK server clustering
 * Handles cluster directory creation, configuration application, and status tracking
 */
export class ClusterManager {
  private instanceConfigDir: string
  private clusterDataPath: string

  constructor(
    instanceConfigDir: string = process.env.ARK_INSTANCE_CONFIG_DIR || '/etc/arkmanager/instances',
    clusterDataPath: string = process.env.CLUSTER_DATA_PATH || '/home/steam/cluster'
  ) {
    this.instanceConfigDir = instanceConfigDir
    this.clusterDataPath = clusterDataPath
  }

  /**
   * Validate cluster configuration
   */
  validateClusterConfig(config: ClusterConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.clusterId || config.clusterId.trim() === '') {
      errors.push('Cluster ID is required')
    }

    if (!config.clusterDir || config.clusterDir.trim() === '') {
      errors.push('Cluster directory is required')
    }

    if (!config.instances || config.instances.length === 0) {
      errors.push('At least one instance must be selected')
    }

    // Validate cluster ID format (alphanumeric and underscores only)
    if (config.clusterId && !/^[a-zA-Z0-9_]+$/.test(config.clusterId)) {
      errors.push('Cluster ID can only contain letters, numbers, and underscores')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if cluster directory exists and is writable
   */
  async checkClusterDirectory(clusterDir: string): Promise<{ exists: boolean; writable: boolean; error?: string }> {
    try {
      await access(clusterDir, constants.F_OK)
      // Directory exists, check if writable
      try {
        await access(clusterDir, constants.W_OK)
        return { exists: true, writable: true }
      } catch {
        return { exists: true, writable: false, error: 'Directory is not writable' }
      }
    } catch {
      return { exists: false, writable: false }
    }
  }

  /**
   * Create cluster directory with proper permissions
   */
  async createClusterDirectory(clusterDir: string): Promise<void> {
    try {
      console.log(`[Cluster Manager] Creating cluster directory: ${clusterDir}`)
      await mkdir(clusterDir, { recursive: true, mode: 0o755 })
      console.log(`[Cluster Manager] Cluster directory created successfully`)
    } catch (error: any) {
      console.error(`[Cluster Manager] Failed to create cluster directory:`, error)
      throw new Error(`Failed to create cluster directory: ${error.message}`)
    }
  }

  /**
   * Apply cluster configuration to selected instances
   */
  async applyClusterToInstances(config: ClusterConfig): Promise<{
    success: boolean
    results: Array<{ instance: string; success: boolean; error?: string }>
    needsRestart: string[]
  }> {
    const results: Array<{ instance: string; success: boolean; error?: string }> = []
    const needsRestart: string[] = []

    console.log(`[Cluster Manager] Applying cluster configuration to ${config.instances.length} instances`)
    console.log(`[Cluster Manager] Cluster ID: ${config.clusterId}`)
    console.log(`[Cluster Manager] Cluster Dir: ${config.clusterDir}`)

    // First, ensure cluster directory exists
    const dirCheck = await this.checkClusterDirectory(config.clusterDir)
    if (!dirCheck.exists) {
      console.log(`[Cluster Manager] Cluster directory does not exist, creating...`)
      await this.createClusterDirectory(config.clusterDir)
    } else if (!dirCheck.writable) {
      throw new Error(`Cluster directory ${config.clusterDir} is not writable`)
    }

    // Get all instances to check their status
    const allInstances = await arkManager.listInstances()
    const instanceStatusMap = new Map<string, ServerInstance>()
    allInstances.forEach(inst => {
      instanceStatusMap.set(inst.name, inst)
    })

    // Apply configuration to each instance
    for (const instanceName of config.instances) {
      try {
        console.log(`[Cluster Manager] Applying configuration to instance: ${instanceName}`)
        
        const configPath = `${this.instanceConfigDir}/${instanceName}.cfg`
        
        // Read existing config to preserve other settings
        const existingConfig = await configManager.readInstanceConfigFile(configPath)
        
        // Apply cluster settings
        const clusterConfig: ServerConfig = {
          ...existingConfig,
          ClusterId: config.clusterId,
          ClusterDirOverride: config.clusterDir,
          AltSaveDirectoryName: instanceName // Use instance name as unique save directory
        }

        await configManager.writeInstanceConfigFile(configPath, clusterConfig)
        
        console.log(`[Cluster Manager] ✓ Successfully applied configuration to ${instanceName}`)
        results.push({ instance: instanceName, success: true })
        
        // Check if instance is running - if so, it needs restart
        const instanceStatus = instanceStatusMap.get(instanceName)
        if (instanceStatus && (instanceStatus.status === 'running' || instanceStatus.status === 'starting')) {
          needsRestart.push(instanceName)
          console.log(`[Cluster Manager] ⚠️ Instance ${instanceName} is running and needs restart`)
        }
      } catch (error: any) {
        console.error(`[Cluster Manager] ✗ Failed to apply configuration to ${instanceName}:`, error.message)
        results.push({ 
          instance: instanceName, 
          success: false, 
          error: error.message 
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const success = successCount === config.instances.length

    console.log(`[Cluster Manager] Configuration applied: ${successCount}/${config.instances.length} successful`)
    
    return {
      success,
      results,
      needsRestart
    }
  }

  /**
   * Remove cluster configuration from instances
   */
  async removeClusterFromInstances(instanceNames: string[]): Promise<{
    success: boolean
    results: Array<{ instance: string; success: boolean; error?: string }>
  }> {
    const results: Array<{ instance: string; success: boolean; error?: string }> = []

    for (const instanceName of instanceNames) {
      try {
        const configPath = `${this.instanceConfigDir}/${instanceName}.cfg`
        const existingConfig = await configManager.readInstanceConfigFile(configPath)
        
        // Remove cluster settings
        const updatedConfig: ServerConfig = {
          ...existingConfig,
          ClusterId: undefined,
          ClusterDirOverride: undefined,
          AltSaveDirectoryName: undefined
        }

        await configManager.writeInstanceConfigFile(configPath, updatedConfig)
        results.push({ instance: instanceName, success: true })
      } catch (error: any) {
        results.push({ 
          instance: instanceName, 
          success: false, 
          error: error.message 
        })
      }
    }

    return {
      success: results.every(r => r.success),
      results
    }
  }

  /**
   * Get cluster status for all instances
   */
  async getClusterStatus(clusterId?: string): Promise<{
    configured: Array<{ instance: string; clusterId: string; clusterDir: string; status: string }>
    notConfigured: string[]
  }> {
    const configured: Array<{ instance: string; clusterId: string; clusterDir: string; status: string }> = []
    const notConfigured: string[] = []

    const allInstances = await arkManager.listInstances()

    for (const instance of allInstances) {
      try {
        const configPath = `${this.instanceConfigDir}/${instance.name}.cfg`
        const config = await configManager.readInstanceConfigFile(configPath)
        
        if (config.ClusterId) {
          // If clusterId is specified, only include matching instances
          if (!clusterId || config.ClusterId === clusterId) {
            configured.push({
              instance: instance.name,
              clusterId: config.ClusterId,
              clusterDir: config.ClusterDirOverride || '',
              status: instance.status
            })
          } else {
            notConfigured.push(instance.name)
          }
        } else {
          notConfigured.push(instance.name)
        }
      } catch (error) {
        console.error(`Error reading config for ${instance.name}:`, error)
        notConfigured.push(instance.name)
      }
    }

    return {
      configured,
      notConfigured
    }
  }
}

// Export singleton instance
export const clusterManager = new ClusterManager()

