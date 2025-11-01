'use client'

import { useState } from 'react'
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

interface InstallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInstall: (instance: string, map: string) => void
}

const ARK_MAPS = [
  { value: 'TheIsland', label: 'The Island' },
  { value: 'TheCenter', label: 'The Center' },
  { value: 'ScorchedEarth_P', label: 'Scorched Earth' },
  { value: 'Aberration_P', label: 'Aberration' },
  { value: 'Extinction', label: 'Extinction' },
  { value: 'Valguero_P', label: 'Valguero' },
  { value: 'Genesis', label: 'Genesis Part 1' },
  { value: 'Genesis2', label: 'Genesis Part 2' },
  { value: 'CrystalIsles', label: 'Crystal Isles' },
  { value: 'LostIsland', label: 'Lost Island' },
  { value: 'Fjordur', label: 'Fjordur' },
]

export function InstallDialog({ open, onOpenChange, onInstall }: InstallDialogProps) {
  const [instanceName, setInstanceName] = useState('')
  const [selectedMap, setSelectedMap] = useState('TheIsland')

  const handleInstall = () => {
    if (instanceName.trim()) {
      onInstall(instanceName.trim(), selectedMap)
      setInstanceName('')
      setSelectedMap('TheIsland')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install New Server Instance</DialogTitle>
          <DialogDescription>
            Configure and install a new ARK server instance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instance-name">Instance Name</Label>
            <Input
              id="instance-name"
              placeholder="e.g., main, island1, ragnarok1"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="map">Map</Label>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInstall} disabled={!instanceName.trim()}>
            Install Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

