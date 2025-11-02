'use client'

import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Download, Trash2, RefreshCw, Plus, Save } from 'lucide-react'
import type { ServerInstance, ServerConfig } from '@/types/ark'

export default function ModsPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [installedMods, setInstalledMods] = useState<string[]>([])
  const [newModId, setNewModId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [config, setConfig] = useState<ServerConfig>({})
  const [configLoading, setConfigLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchServers()
  }, [])

  useEffect(() => {
    if (selectedInstance) {
      fetchMods()
      fetchConfig()
    }
  }, [selectedInstance])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()

      if (data.success) {
        setServers(data.data)
        if (data.data.length > 0 && !selectedInstance) {
          setSelectedInstance(data.data[0].name)
        }
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    }
  }

  const fetchMods = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setLoadingMessage(forceRefresh
        ? 'Refreshing mod list from server... This may take a moment.'
        : 'Loading installed mods... (using cache if available)')

      const url = `/api/mods/${selectedInstance}${forceRefresh ? '?forceRefresh=true' : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setInstalledMods(data.data)
        // Don't show toast for cached results to avoid spam
        // Users can see cache status in console logs
      } else if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to fetch mods:', error)
      toast({
        title: 'Error',
        description: 'Failed to load mods. The server may be unreachable.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const fetchConfig = async () => {
    try {
      setConfigLoading(true)
      const response = await fetch(`/api/servers/${selectedInstance}/config`)
      const data = await response.json()

      if (data.success) {
        setConfig(data.data)
      } else {
        console.error('Failed to load config:', data.error)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setConfigLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setConfigLoading(true)
      const response = await fetch(`/api/servers/${selectedInstance}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await response.json()

      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.success ? 'Mod configuration saved successfully' : data.error,
        variant: data.success ? 'default' : 'destructive'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      })
    } finally {
      setConfigLoading(false)
    }
  }

  const handleInstallMod = async () => {
    if (!newModId.trim()) return

    try {
      setLoading(true)
      const modIds = newModId.split(',').map(id => id.trim()).filter(id => id)
      setLoadingMessage(`Installing ${modIds.length} mod(s)... This may take several minutes depending on mod size.`)

      const response = await fetch(`/api/mods/${selectedInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modIds })
      })
      const data = await response.json()

      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      })

      if (data.success) {
        setNewModId('')
        fetchMods()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to install mod',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const handleUninstallMod = async (modId: string) => {
    try {
      setLoading(true)
      setLoadingMessage(`Uninstalling mod ${modId}...`)
      const response = await fetch(`/api/mods/${selectedInstance}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modId })
      })
      const data = await response.json()

      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      })

      if (data.success) {
        fetchMods()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to uninstall mod',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const handleCheckModUpdates = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setLoadingMessage(forceRefresh
        ? 'Checking for mod updates from Steam Workshop... This may take up to 90 seconds.'
        : 'Checking for mod updates... (using cache if available)')

      const url = `/api/mods/${selectedInstance}/check${forceRefresh ? '?forceRefresh=true' : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Mod Update Check',
          description: data.data.updateAvailable
            ? 'Mod updates are available!'
            : 'All mods are up to date',
          variant: data.data.updateAvailable ? 'default' : 'default'
        })
      } else if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check for mod updates. Steam Workshop may be unreachable.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mod Management</h1>
          <p className="text-muted-foreground">Install and manage ARK server mods</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Server Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="server-select">Select Server Instance</Label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger id="server-select">
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.name} value={server.name}>
                      {server.name} ({server.map})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedInstance && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Mod Configuration</CardTitle>
                <CardDescription>
                  Configure which mods are loaded when the server starts. Mod loading order matters!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gameModIds">Game Mod IDs (逗号分隔，按加载顺序排列)</Label>
                  <Input
                    id="gameModIds"
                    value={config.GameModIds || ''}
                    onChange={(e) => setConfig({ ...config, GameModIds: e.target.value })}
                    placeholder="731604991,889745138,895711211"
                    disabled={configLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    这些是服务器启动时加载的 Mod。多个 Mod ID 用逗号分隔。<strong>顺序很重要！</strong>方舟会按照这里的顺序加载 mod。
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    onClick={handleSaveConfig}
                    disabled={configLoading}
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {configLoading ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  <p className="text-xs text-amber-600">
                    ⚠️ 修改后需要重启服务器才能生效
                  </p>
                </div>

                {/* 配置与已安装 mod 对比 */}
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-sm font-medium mb-2">Status Overview</h4>
                  {(() => {
                    const configuredMods = config.GameModIds?.split(',').map(id => id.trim()).filter(id => id) || []
                    const notInstalled = configuredMods.filter(id => !installedMods.includes(id))
                    const notConfigured = installedMods.filter(id => !configuredMods.includes(id))

                    return (
                      <div className="space-y-2 text-xs">
                        {notInstalled.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-red-900">
                              <strong>⚠️ 已配置但未安装:</strong> {notInstalled.join(', ')}
                            </p>
                            <p className="text-red-800 mt-1">
                              这些 mod 在配置中，但尚未安装。服务器启动时可能会出错。
                            </p>
                          </div>
                        )}
                        {notConfigured.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-yellow-900">
                              <strong>💡 已安装但未配置:</strong> {notConfigured.join(', ')}
                            </p>
                            <p className="text-yellow-800 mt-1">
                              这些 mod 已安装，但未添加到配置中。服务器启动时不会加载它们。
                            </p>
                          </div>
                        )}
                        {notInstalled.length === 0 && notConfigured.length === 0 && installedMods.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-green-900">✓ 配置与已安装 mod 一致</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Install New Mod</CardTitle>
                <CardDescription>
                  Enter Steam Workshop Mod ID(s) to install. Separate multiple IDs with commas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="mod-id">Mod ID(s)</Label>
                    <Input
                      id="mod-id"
                      value={newModId}
                      onChange={(e) => setNewModId(e.target.value)}
                      placeholder="e.g., 731604991 or 731604991,839162288"
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find Mod IDs on Steam Workshop URL: steamcommunity.com/sharedfiles/filedetails/?id=<strong>MODID</strong>
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleInstallMod} disabled={loading || !newModId.trim()}>
                      <Download className="mr-2 h-4 w-4" />
                      Install
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Installed Mods</CardTitle>
                  <CardDescription>Manage currently installed mods</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fetchMods(true)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    title="Refresh mod list from server"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh List
                  </Button>
                  <Button
                    onClick={() => handleCheckModUpdates(true)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    title="Check for updates on Steam Workshop"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Check Updates
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <div>
                        <p className="text-sm font-medium">Loading...</p>
                        {loadingMessage && (
                          <p className="text-xs text-muted-foreground mt-1">{loadingMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-900">
                        <strong>Note:</strong> Loading mods from the server may take some time, especially if there are many mods installed or if the server is busy.
                      </p>
                    </div>
                  </div>
                ) : installedMods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No mods installed</p>
                ) : (
                  <div className="space-y-2">
                    {installedMods.map((modId) => (
                      <div
                        key={modId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{modId}</Badge>
                          <a
                            href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${modId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View on Workshop
                          </a>
                        </div>
                        <Button
                          onClick={() => handleUninstallMod(modId)}
                          variant="destructive"
                          size="sm"
                          disabled={loading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Uninstall
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">1. 安装 Mod</h4>
                  <p className="text-muted-foreground">
                    在 "Install New Mod" 卡片中输入 Steam Workshop Mod ID，点击 Install。支持同时安装多个 mod（用逗号分隔）。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">2. 配置 Mod 加载顺序</h4>
                  <p className="text-muted-foreground">
                    在 "Mod Configuration" 卡片中编辑 "Game Mod IDs" 字段，添加已安装的 mod ID。<strong className="text-amber-700">注意：mod 的加载顺序很重要！</strong>方舟会按照你输入的顺序加载 mod，某些 mod 需要特定的加载顺序才能正常工作。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">3. 保存并重启</h4>
                  <p className="text-muted-foreground">
                    点击 "Save Configuration" 保存配置，然后到 Dashboard 页面重启服务器以应用新的 mod 配置。
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <p className="text-xs text-blue-900 mb-2">
                    <strong>提示：</strong>Mod 安装可能需要几分钟时间，具体取决于 mod 大小和网络速度。
                  </p>
                  <p className="text-xs text-blue-900 mb-2">
                    <strong>性能优化：</strong>系统已启用智能缓存机制。Mod 列表缓存 5 分钟，更新检查缓存 30 分钟。首次加载可能需要时间，后续访问将即时响应。
                  </p>
                  <p className="text-xs text-blue-900 mb-2">
                    <strong>刷新数据：</strong>点击 "Refresh List" 或 "Check Updates" 按钮可以强制从服务器获取最新数据（可能需要 30-90 秒）。
                  </p>
                  <p className="text-xs text-blue-900">
                    <strong>Mod 加载顺序：</strong>某些 mod 可能依赖于其他 mod，或需要特定的加载顺序。请查阅 mod 作者的说明来确定正确的加载顺序。
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  )
}

