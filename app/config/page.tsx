'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import type { ServerInstance } from '@/types/ark'

export default function ConfigIndexPage() {
  const [servers, setServers] = useState<ServerInstance[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers')
      const data = await response.json()
      
      if (data.success) {
        setServers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error)
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Server Configuration</h1>
          <p className="text-muted-foreground">Select a server instance to configure</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <Card key={server.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {server.name}
                </CardTitle>
                <CardDescription>{server.map}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/config/${server.name}`)}
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {servers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-muted-foreground">No server instances found</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

