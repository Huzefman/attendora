import { Menu, Sun, Moon, Monitor, LogOut, Search, Command } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuthStore } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NotificationBell } from './NotificationBell'
import { APP_NAME } from '@/lib/brand'

type Props = { onToggleSidebar: () => void }

export function Header({ onToggleSidebar }: Props) {
  const employee = useAuthStore((s) => s.employee)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { theme, setTheme } = useTheme()
  const isMobile = !useMediaQuery('(min-width: 768px)')

  async function handleSignOut() {
    await supabase.auth.signOut()
    clearAuth()
  }

  const initials = employee
    ? `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase()
    : '?'

  const openCommand = () => window.dispatchEvent(new CustomEvent('attendora:command'))

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {isMobile && (
          <>
            <button onClick={onToggleSidebar} className="rounded-md p-1.5 hover:bg-accent" aria-label="Toggle navigation">
              <Menu className="h-5 w-5" />
            </button>
            <span className="truncate text-sm font-semibold">{APP_NAME}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={openCommand}
          className="hidden items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="w-32 text-left lg:w-44">Search or jump to…</span>
          <kbd className="flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-[10px]">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
        <button onClick={openCommand} className="rounded-md p-1.5 hover:bg-accent sm:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </button>
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-accent">
              <Avatar className="h-8 w-8 ring-2 ring-background">
                <AvatarFallback className="bg-indigo-600 text-xs font-medium text-white">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground sm:inline">
                {employee?.first_name} {employee?.last_name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{employee?.first_name} {employee?.last_name}</p>
                <p className="text-xs text-muted-foreground">{employee?.email ?? employee?.employee_code}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] font-normal uppercase tracking-wide text-muted-foreground">
              Appearance
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent' : ''}>
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent' : ''}>
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent' : ''}>
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
