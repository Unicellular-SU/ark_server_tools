// TypeScript type definitions for ARK Server Management

export interface ServerInstance {
  name: string
  status: 'running' | 'stopped' | 'starting' | 'stopping'
  map: string
  port: number
  queryPort: number
  rconPort: number
  rconPassword: string
  pid?: number
  onlinePlayers: number
  maxPlayers: number
  uptime?: number
  serverName?: string
  version?: string
  mods?: string[]
}

export interface ServerMetrics {
  cpuUsage: number
  memoryUsage: number
  memoryTotal: number
  memoryPercent: number
}

export interface Player {
  name: string
  steamId: string
  duration: number
}

export interface ServerConfig {
  // Basic Settings
  SessionName?: string
  ServerPassword?: string
  ServerAdminPassword?: string
  MaxPlayers?: number
  
  // Ports
  Port?: number
  QueryPort?: number
  RCONPort?: number
  RCONEnabled?: boolean
  
  // Gameplay Settings
  DifficultyOffset?: number
  XPMultiplier?: number
  TamingSpeedMultiplier?: number
  HarvestAmountMultiplier?: number
  ResourcesRespawnPeriodMultiplier?: number
  
  // Advanced Settings
  AllowThirdPersonPlayer?: boolean
  ShowMapPlayerLocation?: boolean
  ServerPVE?: boolean
  EnablePVPGamma?: boolean
  
  // Cluster Settings
  ClusterId?: string
  ClusterDirOverride?: string
  AltSaveDirectoryName?: string
  
  // Auto-update and Backup
  AutoUpdateOnStart?: boolean
  BackupPreUpdate?: boolean
  AlwaysRestartOnCrash?: boolean
  
  // Mods
  GameModIds?: string
  MapModId?: string
  TotalConversionId?: string
  
  // Map
  serverMap?: string
  
  // Custom settings
  [key: string]: any
}

export interface ModInfo {
  modId: string
  name?: string
  enabled: boolean
  type: 'game' | 'map' | 'tc' | 'disabled'
}

export interface ClusterConfig {
  clusterId: string
  clusterDir: string
  instances: string[]
  crossServerChat?: {
    enabled: boolean
    port: number
  }
}

export interface RconCommand {
  command: string
  response: string
  timestamp: number
}

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
}

export interface InstallProgress {
  instance: string
  status: 'downloading' | 'installing' | 'completed' | 'failed'
  progress: number
  message: string
}

export interface UpdateStatus {
  instance: string
  currentVersion: string
  latestVersion: string
  updateAvailable: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ServerEvent {
  type: 'status' | 'metrics' | 'players' | 'log'
  instance: string
  data: any
  timestamp: number
}

export interface PortConflict {
  port: number
  type: 'Port' | 'QueryPort' | 'RCONPort'
  instances: string[]
}
