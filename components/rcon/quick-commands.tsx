'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Megaphone, 
  Save, 
  UserX, 
  Ban,
  Trash2,
  Clock 
} from 'lucide-react'

interface QuickCommandsProps {
  onExecute: (command: string) => Promise<void>
}

export function QuickCommands({ onExecute }: QuickCommandsProps) {
  const [broadcastDialog, setBroadcastDialog] = useState(false)
  const [kickDialog, setKickDialog] = useState(false)
  const [banDialog, setBanDialog] = useState(false)
  const [timeDialog, setTimeDialog] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [playerSteamId, setPlayerSteamId] = useState('')
  const [timeHour, setTimeHour] = useState('12')
  const [timeMinute, setTimeMinute] = useState('0')

  const handleBroadcast = async () => {
    if (broadcastMessage.trim()) {
      await onExecute(`broadcast ${broadcastMessage}`)
      setBroadcastMessage('')
      setBroadcastDialog(false)
    }
  }

  const handleKick = async () => {
    if (playerSteamId.trim()) {
      await onExecute(`kickplayer ${playerSteamId}`)
      setPlayerSteamId('')
      setKickDialog(false)
    }
  }

  const handleBan = async () => {
    if (playerSteamId.trim()) {
      await onExecute(`banplayer ${playerSteamId}`)
      setPlayerSteamId('')
      setBanDialog(false)
    }
  }

  const handleSetTime = async () => {
    await onExecute(`settimeofday ${timeHour.padStart(2, '0')}:${timeMinute.padStart(2, '0')}`)
    setTimeDialog(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button onClick={() => setBroadcastDialog(true)} variant="outline">
              <Megaphone className="mr-2 h-4 w-4" />
              Broadcast
            </Button>
            
            <Button onClick={() => onExecute('saveworld')} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save World
            </Button>
            
            <Button onClick={() => onExecute('listplayers')} variant="outline">
              List Players
            </Button>
            
            <Button onClick={() => setKickDialog(true)} variant="outline">
              <UserX className="mr-2 h-4 w-4" />
              Kick Player
            </Button>
            
            <Button onClick={() => setBanDialog(true)} variant="outline">
              <Ban className="mr-2 h-4 w-4" />
              Ban Player
            </Button>
            
            <Button onClick={() => onExecute('destroywilddinos')} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Destroy Wild Dinos
            </Button>
            
            <Button onClick={() => setTimeDialog(true)} variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Set Time
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Broadcast Dialog */}
      <Dialog open={broadcastDialog} onOpenChange={setBroadcastDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broadcast Message</DialogTitle>
            <DialogDescription>
              Send a message to all players on the server
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Input
              id="broadcast-message"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter your message..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBroadcast}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kick Player Dialog */}
      <Dialog open={kickDialog} onOpenChange={setKickDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kick Player</DialogTitle>
            <DialogDescription>
              Remove a player from the server
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="kick-steam-id">Player Steam ID</Label>
            <Input
              id="kick-steam-id"
              value={playerSteamId}
              onChange={(e) => setPlayerSteamId(e.target.value)}
              placeholder="76561198000000000"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKickDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleKick} variant="destructive">Kick</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Player Dialog */}
      <Dialog open={banDialog} onOpenChange={setBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Player</DialogTitle>
            <DialogDescription>
              Permanently ban a player from the server
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-steam-id">Player Steam ID</Label>
            <Input
              id="ban-steam-id"
              value={playerSteamId}
              onChange={(e) => setPlayerSteamId(e.target.value)}
              placeholder="76561198000000000"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBan} variant="destructive">Ban</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Time Dialog */}
      <Dialog open={timeDialog} onOpenChange={setTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Time of Day</DialogTitle>
            <DialogDescription>
              Change the current time on the server
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time-hour">Hour (0-23)</Label>
              <Input
                id="time-hour"
                type="number"
                min="0"
                max="23"
                value={timeHour}
                onChange={(e) => setTimeHour(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-minute">Minute (0-59)</Label>
              <Input
                id="time-minute"
                type="number"
                min="0"
                max="59"
                value={timeMinute}
                onChange={(e) => setTimeMinute(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetTime}>Set Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

