import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

interface DashboardShellProps {
  title: string
  children: React.ReactNode
}

export function DashboardShell({ title, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-150">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 bg-gray-50 dark:bg-slate-950 transition-colors duration-150">
        <Navbar title={title} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
