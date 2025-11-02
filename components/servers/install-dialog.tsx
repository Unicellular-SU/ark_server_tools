'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface InstallConfig {
  instanceName: string
  map: string
  sessionName: string
  adminPassword: string
  serverPassword: string
  maxPlayers: number
  port: number
  queryPort: number
  rconPort: number
  // Cluster settings
  joinCluster?: boolean
  clusterId?: string
  clusterDir?: string
}

interface InstallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInstall: (config: InstallConfig) => void
}

const ARK_MAPS = [
  { value: 'TheIsland', label: 'The Island' },
  { value: 'TheCenter', label: 'The Center' },
  { value: 'ScorchedEarth_P', label: 'Scorched Earth' },
  { value: 'Ragnarok', label: 'Ragnarok' },
  { value: 'Aberration_P', label: 'Aberration' },
  { value: 'Extinction', label: 'Extinction' },
  { value: 'Valguero_P', label: 'Valguero' },
  { value: 'Genesis', label: 'Genesis Part 1' },
  { value: 'Genesis2', label: 'Genesis Part 2' },
  { value: 'CrystalIsles', label: 'Crystal Isles' },
  { value: 'LostIsland', label: 'Lost Island' },
  { value: 'Fjordur', label: 'Fjordur' },
  { value: 'Aquatica', label: 'Aquatica' },
]

export function InstallDialog({ open, onOpenChange, onInstall }: InstallDialogProps) {
  const [instanceName, setInstanceName] = useState('')
  const [selectedMap, setSelectedMap] = useState('TheIsland')
  const [sessionName, setSessionName] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [serverPassword, setServerPassword] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(70)
  const [port, setPort] = useState(7778)
  const [queryPort, setQueryPort] = useState(27015)
  const [rconPort, setRconPort] = useState(32330)
  // Cluster settings
  const [joinCluster, setJoinCluster] = useState(false)
  const [clusterId, setClusterId] = useState('')
  const [clusterDir, setClusterDir] = useState(process.env.NEXT_PUBLIC_CLUSTER_DATA_PATH || '/home/steam/cluster')

  // Auto-generate session name based on instance name
  useEffect(() => {
    if (instanceName.trim()) {
      setSessionName(`ARK Server - ${instanceName.trim()}`)
    }
  }, [instanceName])

  const handleInstall = () => {
    if (instanceName.trim() && adminPassword.trim()) {
      const config: InstallConfig = {
        instanceName: instanceName.trim(),
        map: selectedMap,
        sessionName,
        adminPassword,
        serverPassword,
        maxPlayers,
        port,
        queryPort,
        rconPort,
        joinCluster,
        clusterId: joinCluster ? clusterId : undefined,
        clusterDir: joinCluster ? clusterDir : undefined
      }
      onInstall(config)
      // Reset form
      setInstanceName('')
      setSelectedMap('TheIsland')
      setSessionName('')
      setAdminPassword('')
      setServerPassword('')
      setMaxPlayers(70)
      setPort(7778)
      setQueryPort(27015)
      setRconPort(32330)
      setJoinCluster(false)
      setClusterId('')
      setClusterDir(process.env.NEXT_PUBLIC_CLUSTER_DATA_PATH || '/home/steam/cluster')
      onOpenChange(false)
    }
  }

  const isFormValid = instanceName.trim() && adminPassword.trim() &&
    port > 0 && queryPort > 0 && rconPort > 0 && maxPlayers > 0 &&
    (!joinCluster || (clusterId.trim() && clusterDir.trim()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Install New Server Instance</DialogTitle>
          <DialogDescription>
            Configure and install a new ARK server instance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="network">Network & Ports</TabsTrigger>
            <TabsTrigger value="cluster">Cluster (Optional)</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instance-name">Instance Name *</Label>
              <Input
                id="instance-name"
                placeholder="e.g., main, island1, ragnarok1"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this server instance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="map">Map *</Label>
              <Select value={selectedMap} onValueChange={setSelectedMap}>
                <SelectTrigger id="map">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARK_MAPS.map((map) => (
                    <SelectItem key={map.value} value={map.value}>
                      {map.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-name">Server Name</Label>
              <Input
                id="session-name"
                placeholder="My ARK Server"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Display name shown in server browser
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password *</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Strong admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required for RCON access and admin commands
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-password">Server Password</Label>
              <Input
                id="server-password"
                type="password"
                placeholder="Leave empty for public server"
                value={serverPassword}
                onChange={(e) => setServerPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Players need this password to join
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-players">Max Players</Label>
              <Input
                id="max-players"
                type="number"
                min="1"
                max="200"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 70)}
              />
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="game-port">Game Port *</Label>
              <Input
                id="game-port"
                type="number"
                min="1"
                max="65535"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 7778)}
              />
              <p className="text-xs text-muted-foreground">
                Default: 7778 (UDP) - Each instance needs unique ports
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query-port">Query Port *</Label>
              <Input
                id="query-port"
                type="number"
                min="1"
                max="65535"
                value={queryPort}
                onChange={(e) => setQueryPort(parseInt(e.target.value) || 27015)}
              />
              <p className="text-xs text-muted-foreground">
                Default: 27015 (UDP) - Used for server browser queries
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rcon-port">RCON Port *</Label>
              <Input
                id="rcon-port"
                type="number"
                min="1"
                max="65535"
                value={rconPort}
                onChange={(e) => setRconPort(parseInt(e.target.value) || 32330)}
              />
              <p className="text-xs text-muted-foreground">
                Default: 32330 (TCP) - Used for remote console access
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">⚠️ Port Configuration</p>
              <p className="text-xs text-yellow-700 mt-1">
                Make sure these ports are not already in use by another instance.
                Common pattern: Instance 1 uses 7778/27015/32330, Instance 2 uses 7779/27016/32331, etc.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cluster" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="join-cluster"
                  checked={joinCluster}
                  onChange={(e) => setJoinCluster(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="join-cluster">Join Existing Cluster</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Enable to add this server to an existing cluster for cross-server transfers
              </p>
            </div>

            {joinCluster && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cluster-id">Cluster ID *</Label>
                  <Input
                    id="cluster-id"
                    value={clusterId}
                    onChange={(e) => setClusterId(e.target.value)}
                    placeholder="mycluster"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must match the cluster ID of other servers in the cluster
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cluster-dir">Cluster Directory *</Label>
                  <Input
                    id="cluster-dir"
                    value={clusterDir}
                    onChange={(e) => setClusterDir(e.target.value)}
                    placeholder="/home/steam/cluster"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shared directory path where cluster data is stored
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">ℹ️ Cluster Configuration</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This server will be configured with ClusterId and ClusterDirOverride settings.
                    All servers in the same cluster must share the same cluster ID and directory.
                  </p>
                </div>
              </>
            )}

            {!joinCluster && (
              <div className="text-center py-8 text-muted-foreground">
                <p>This server will not be part of a cluster.</p>
                <p className="text-sm mt-2">You can add it to a cluster later from the Cluster Configuration page.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInstall} disabled={!isFormValid}>
            Install Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

