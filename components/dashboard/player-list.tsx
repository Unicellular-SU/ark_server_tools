'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users } from 'lucide-react'

interface PlayerListProps {
  players: string[]
  serverName: string
}

export function PlayerList({ players, serverName }: PlayerListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Online Players - {serverName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">No players online</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{player}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

