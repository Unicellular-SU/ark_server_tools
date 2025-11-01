import si from 'systeminformation'
import type { ServerMetrics } from '@/types/ark'

/**
 * System Monitor - Collects system metrics for server processes
 */
export class SystemMonitor {
  /**
   * Get metrics for a specific process by PID
   */
  async getProcessMetrics(pid: number): Promise<ServerMetrics | null> {
    try {
      const processes = await si.processes()
      const process = processes.list.find(p => p.pid === pid)
      
      if (!process) {
        return null
      }

      const mem = await si.mem()

      return {
        cpuUsage: process.cpu || 0,
        memoryUsage: process.mem || 0,
        memoryTotal: mem.total,
        memoryPercent: ((process.mem || 0) / mem.total) * 100
      }
    } catch (error: any) {
      console.error(`Error getting metrics for PID ${pid}:`, error)
      return null
    }
  }

  /**
   * Get overall system metrics
   */
  async getSystemMetrics() {
    try {
      const cpu = await si.currentLoad()
      const mem = await si.mem()
      const disk = await si.fsSize()

      return {
        cpu: {
          usage: cpu.currentLoad,
          cores: cpu.cpus.length,
          perCore: cpu.cpus.map(c => c.load)
        },
        memory: {
          total: mem.total,
          used: mem.used,
          free: mem.free,
          percent: (mem.used / mem.total) * 100
        },
        disk: disk.map(d => ({
          mount: d.mount,
          total: d.size,
          used: d.used,
          available: d.available,
          percent: d.use
        }))
      }
    } catch (error: any) {
      console.error('Error getting system metrics:', error)
      return null
    }
  }

  /**
   * Get metrics for multiple processes
   */
  async getMultipleProcessMetrics(pids: number[]): Promise<Map<number, ServerMetrics>> {
    const metricsMap = new Map<number, ServerMetrics>()

    try {
      const processes = await si.processes()
      const mem = await si.mem()

      for (const pid of pids) {
        const process = processes.list.find(p => p.pid === pid)
        
        if (process) {
          metricsMap.set(pid, {
            cpuUsage: process.cpu || 0,
            memoryUsage: process.mem || 0,
            memoryTotal: mem.total,
            memoryPercent: ((process.mem || 0) / mem.total) * 100
          })
        }
      }
    } catch (error: any) {
      console.error('Error getting multiple process metrics:', error)
    }

    return metricsMap
  }

  /**
   * Monitor process continuously
   */
  startMonitoring(pid: number, callback: (metrics: ServerMetrics) => void, interval: number = 5000) {
    const intervalId = setInterval(async () => {
      const metrics = await this.getProcessMetrics(pid)
      if (metrics) {
        callback(metrics)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }

  /**
   * Get network stats
   */
  async getNetworkStats() {
    try {
      const networkStats = await si.networkStats()
      
      return networkStats.map(net => ({
        interface: net.iface,
        rxBytes: net.rx_bytes,
        txBytes: net.tx_bytes,
        rxSec: net.rx_sec,
        txSec: net.tx_sec
      }))
    } catch (error: any) {
      console.error('Error getting network stats:', error)
      return []
    }
  }

  /**
   * Get uptime
   */
  async getUptime(): Promise<number> {
    try {
      const time = await si.time()
      return time.uptime
    } catch (error: any) {
      console.error('Error getting uptime:', error)
      return 0
    }
  }
}

// Export singleton instance
export const systemMonitor = new SystemMonitor()

