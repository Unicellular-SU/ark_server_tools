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
import { Download, Trash2, RefreshCw, Plus } from 'lucide-react'
import type { ServerInstance } from '@/types/ark'

export default function ModsPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [installedMods, setInstalledMods] = useState<string[]>([])
  const [newModId, setNewModId] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchServers()
  }, [])

  useEffect(() => {
    if (selectedInstance) {
      fetchMods()
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

  const fetchMods = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/mods/${selectedInstance}`)
      const data = await response.json()
      
      if (data.success) {
        setInstalledMods(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch mods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstallMod = async () => {
    if (!newModId.trim()) return

    try {
      setLoading(true)
      const modIds = newModId.split(',').map(id => id.trim()).filter(id => id)
      
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
    }
  }

  const handleUninstallMod = async (modId: string) => {
    try {
      setLoading(true)
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
    }
  }

  const handleCheckModUpdates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/mods/${selectedInstance}/check`)
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Mod Update Check',
          description: data.data.updateAvailable 
            ? 'Mod updates are available!' 
            : 'All mods are up to date',
          variant: data.data.updateAvailable ? 'default' : 'default'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check for mod updates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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
                <Button onClick={handleCheckModUpdates} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Updates
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading mods...</p>
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
                    输入 Steam Workshop Mod ID，点击 Install。支持同时安装多个 mod（用逗号分隔）。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">2. 配置 Mod</h4>
                  <p className="text-muted-foreground">
                    安装后，在 Configuration 页面的 Gameplay 标签中，将 Mod ID 添加到 "Game Mod IDs" 字段。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">3. 重启服务器</h4>
                  <p className="text-muted-foreground">
                    Mod 配置修改后，必须重启服务器才能加载新的 mod。
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <p className="text-xs text-blue-900">
                    <strong>提示：</strong>Mod 安装可能需要几分钟时间，具体取决于 mod 大小和网络速度。
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

