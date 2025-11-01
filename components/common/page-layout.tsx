import { NavSidebar } from './nav-sidebar'

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <NavSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}

