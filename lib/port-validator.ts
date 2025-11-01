/**
 * Port Validator - Ensures each server instance uses unique ports
 * 
 * According to ark-server-tools documentation:
 * - Each instance MUST have unique Port, QueryPort, and RCONPort
 * - Shared ports cause crashes or servers hanging at 0/0 players
 */

interface PortConfig {
  instance: string
  port: number
  queryPort: number
  rconPort: number
}

export class PortValidator {
  /**
   * Validate that all ports are unique across instances
   */
  validateUniquePorts(configs: PortConfig[]): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = []
    const portUsage = new Map<number, string[]>()

    // Collect all port usage
    for (const config of configs) {
      this.addPortUsage(portUsage, config.port, config.instance, 'Port')
      this.addPortUsage(portUsage, config.queryPort, config.instance, 'QueryPort')
      this.addPortUsage(portUsage, config.rconPort, config.instance, 'RCONPort')
    }

    // Check for conflicts
    for (const [port, instances] of portUsage.entries()) {
      if (instances.length > 1) {
        conflicts.push(`Port ${port} is used by multiple instances: ${instances.join(', ')}`)
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts
    }
  }

  /**
   * Validate a new instance's ports against existing instances
   */
  validateNewInstancePorts(
    newConfig: PortConfig,
    existingConfigs: PortConfig[]
  ): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = []

    for (const existing of existingConfigs) {
      if (existing.instance === newConfig.instance) continue

      if (existing.port === newConfig.port) {
        conflicts.push(`Port ${newConfig.port} is already used by instance ${existing.instance}`)
      }
      if (existing.queryPort === newConfig.queryPort) {
        conflicts.push(`QueryPort ${newConfig.queryPort} is already used by instance ${existing.instance}`)
      }
      if (existing.rconPort === newConfig.rconPort) {
        conflicts.push(`RCONPort ${newConfig.rconPort} is already used by instance ${existing.instance}`)
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts
    }
  }

  /**
   * Suggest available ports based on existing configurations
   */
  suggestPorts(existingConfigs: PortConfig[]): PortConfig {
    const usedPorts = new Set<number>()

    // Collect all used ports
    for (const config of existingConfigs) {
      usedPorts.add(config.port)
      usedPorts.add(config.queryPort)
      usedPorts.add(config.rconPort)
    }

    // Find available ports starting from defaults
    const findAvailablePort = (startPort: number): number => {
      let port = startPort
      while (usedPorts.has(port)) {
        port++
      }
      return port
    }

    return {
      instance: 'new',
      port: findAvailablePort(7778),
      queryPort: findAvailablePort(27015),
      rconPort: findAvailablePort(32330)
    }
  }

  /**
   * Check if a port is in valid range
   */
  isValidPort(port: number): boolean {
    return port >= 1024 && port <= 65535
  }

  /**
   * Validate port range for all ports
   */
  validatePortRange(config: PortConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.isValidPort(config.port)) {
      errors.push(`Port ${config.port} is out of valid range (1024-65535)`)
    }
    if (!this.isValidPort(config.queryPort)) {
      errors.push(`QueryPort ${config.queryPort} is out of valid range (1024-65535)`)
    }
    if (!this.isValidPort(config.rconPort)) {
      errors.push(`RCONPort ${config.rconPort} is out of valid range (1024-65535)`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private addPortUsage(
    portUsage: Map<number, string[]>,
    port: number,
    instance: string,
    portType: string
  ): void {
    const key = port
    const value = `${instance} (${portType})`
    
    if (portUsage.has(key)) {
      portUsage.get(key)!.push(value)
    } else {
      portUsage.set(key, [value])
    }
  }
}

// Export singleton instance
export const portValidator = new PortValidator()

