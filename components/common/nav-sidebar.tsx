'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Server, 
  Settings, 
  Network, 
  Terminal, 
  ScrollText,
  Puzzle,
  Command
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Servers', href: '/servers', icon: Server },
  { name: 'Configuration', href: '/config', icon: Settings },
  { name: 'Mods', href: '/mods', icon: Puzzle },
  { name: 'Cluster', href: '/cluster', icon: Network },
  { name: 'RCON', href: '/rcon', icon: Terminal },
  { name: 'Commands', href: '/commands', icon: Command },
  { name: 'Logs', href: '/logs', icon: ScrollText },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">ARK Server Manager</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-400">Version 1.0.0</p>
        <p className="text-xs text-gray-500 mt-1">ark-server-tools integration</p>
      </div>
    </div>
  )
}
