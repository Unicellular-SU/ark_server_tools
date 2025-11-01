'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'
import type { ServerConfig } from '@/types/ark'
import { Textarea } from '@/components/ui/textarea'

export default function ConfigPage() {
  const params = useParams()
  const router = useRouter()
  const instance = params.instance as string
  const { toast } = useToast()
  
  const [config, setConfig] = useState<ServerConfig>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [instance])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/servers/${instance}/config`)
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load configuration',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/servers/${instance}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const data = await response.json()
      
      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.success ? data.message || 'Configuration saved successfully' : data.error,
        variant: data.success ? 'default' : 'destructive'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Server Configuration</h1>
              <p className="text-muted-foreground">Instance: {instance}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>重要提示：</strong>配置保存后，需要重启服务器才能生效。配置将保存到 <code className="bg-blue-100 px-1 rounded">/etc/arkmanager/instances/{instance}.cfg</code>
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Server Settings</CardTitle>
                <CardDescription>Configure basic server information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-yellow-900">
                    <strong>提示：</strong>服务器名称如果包含特殊字符（如 !、&、[ 等），建议不要在此设置，而是直接在 GameUserSettings.ini 文件中定义。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionName">Server Name</Label>
                    <Input
                      id="sessionName"
                      value={config.SessionName || ''}
                      onChange={(e) => updateConfig('SessionName', e.target.value)}
                      placeholder="My ARK Server"
                    />
                    <p className="text-xs text-muted-foreground">
                      避免使用特殊字符
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      value={config.MaxPlayers || 70}
                      onChange={(e) => updateConfig('MaxPlayers', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serverPassword">Server Password</Label>
                    <Input
                      id="serverPassword"
                      type="password"
                      value={config.ServerPassword || ''}
                      onChange={(e) => updateConfig('ServerPassword', e.target.value)}
                      placeholder="Leave empty for no password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={config.ServerAdminPassword || ''}
                      onChange={(e) => updateConfig('ServerAdminPassword', e.target.value)}
                      placeholder="Required for admin commands"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gameplay">
            <Card>
              <CardHeader>
                <CardTitle>Gameplay Settings</CardTitle>
                <CardDescription>Adjust multipliers and difficulty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Port Configuration</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    ⚠️ 每个服务器实例必须使用唯一的端口。共享端口会导致服务器崩溃或卡在 0/0 玩家。
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="port">Game Port (UDP)</Label>
                      <Input
                        id="port"
                        type="number"
                        value={config.Port || 7778}
                        onChange={(e) => updateConfig('Port', parseInt(e.target.value))}
                        min="1024"
                        max="65535"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="queryPort">Query Port (UDP)</Label>
                      <Input
                        id="queryPort"
                        type="number"
                        value={config.QueryPort || 27015}
                        onChange={(e) => updateConfig('QueryPort', parseInt(e.target.value))}
                        min="1024"
                        max="65535"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rconPort">RCON Port (TCP)</Label>
                      <Input
                        id="rconPort"
                        type="number"
                        value={config.RCONPort || 32330}
                        onChange={(e) => updateConfig('RCONPort', parseInt(e.target.value))}
                        min="1024"
                        max="65535"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Gameplay Multipliers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Offset (0-1)</Label>
                      <Input
                        id="difficulty"
                        type="number"
                        step="0.1"
                        value={config.DifficultyOffset || 0.5}
                        onChange={(e) => updateConfig('DifficultyOffset', parseFloat(e.target.value))}
                        min="0"
                        max="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="xpMultiplier">XP Multiplier</Label>
                      <Input
                        id="xpMultiplier"
                        type="number"
                        step="0.1"
                        value={config.XPMultiplier || 1.0}
                        onChange={(e) => updateConfig('XPMultiplier', parseFloat(e.target.value))}
                        min="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tamingSpeed">Taming Speed Multiplier</Label>
                      <Input
                        id="tamingSpeed"
                        type="number"
                        step="0.1"
                        value={config.TamingSpeedMultiplier || 1.0}
                        onChange={(e) => updateConfig('TamingSpeedMultiplier', parseFloat(e.target.value))}
                        min="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="harvestAmount">Harvest Amount Multiplier</Label>
                      <Input
                        id="harvestAmount"
                        type="number"
                        step="0.1"
                        value={config.HarvestAmountMultiplier || 1.0}
                        onChange={(e) => updateConfig('HarvestAmountMultiplier', parseFloat(e.target.value))}
                        min="0.1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="resourceRespawn">Resource Respawn Period Multiplier</Label>
                      <Input
                        id="resourceRespawn"
                        type="number"
                        step="0.1"
                        value={config.ResourcesRespawnPeriodMultiplier || 1.0}
                        onChange={(e) => updateConfig('ResourcesRespawnPeriodMultiplier', parseFloat(e.target.value))}
                        min="0.1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Auto-Update &amp; Backup</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoUpdate"
                        checked={config.AutoUpdateOnStart || false}
                        onChange={(e) => updateConfig('AutoUpdateOnStart', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="autoUpdate" className="font-normal">
                        Auto-update on server start
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="backupPreUpdate"
                        checked={config.BackupPreUpdate || false}
                        onChange={(e) => updateConfig('BackupPreUpdate', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="backupPreUpdate" className="font-normal">
                        Backup before update
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="alwaysRestart"
                        checked={config.AlwaysRestartOnCrash || false}
                        onChange={(e) => updateConfig('AlwaysRestartOnCrash', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="alwaysRestart" className="font-normal">
                        Always restart on crash
                      </Label>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      这些设置对应 arkmanager.cfg 中的 arkAutoUpdateOnStart, arkBackupPreUpdate, arkAlwaysRestartOnCrash
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Mods</h3>
                  <div className="space-y-2">
                    <Label htmlFor="gameMods">Game Mod IDs (逗号分隔)</Label>
                    <Input
                      id="gameMods"
                      value={config.GameModIds || ''}
                      onChange={(e) => updateConfig('GameModIds', e.target.value)}
                      placeholder="123456,789012,345678"
                    />
                    <p className="text-xs text-muted-foreground">
                      输入 Steam Workshop Mod ID，用逗号分隔。例如：487516323,487516324
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Raw configuration editing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rawConfig">Raw Configuration (JSON)</Label>
                    <Textarea
                      id="rawConfig"
                      className="font-mono text-sm min-h-[400px]"
                      value={JSON.stringify(config, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value)
                          setConfig(parsed)
                        } catch (error) {
                          // Invalid JSON, don't update
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Edit the configuration in JSON format. Invalid JSON will not be saved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}

