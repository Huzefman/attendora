import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Megaphone,
  ClipboardList,
  Plus,
  ArrowRight,
  UserRound,
  Building2,
  Sparkles,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useAuthStore } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types'

type PageItem = {
  label: string
  href: string
  icon: React.ElementType
  roles: Role[]
  keywords?: string
}

const PAGES: PageItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['owner', 'hr', 'employee', 'system_admin'], keywords: 'home dashboard' },
  { label: 'Announcements', href: '/announcements', icon: Megaphone, roles: ['owner', 'hr', 'employee', 'system_admin'], keywords: 'news updates' },
  { label: 'People directory', href: '/team-members', icon: Users, roles: ['owner', 'hr', 'system_admin'], keywords: 'employees team members staff' },
  { label: 'Add a person', href: '/team-members/new', icon: Plus, roles: ['owner'], keywords: 'new employee create' },
  { label: 'Profile changes', href: '/team-members/profile-edits', icon: UserRound, roles: ['owner', 'hr'], keywords: 'profile edit requests' },
  { label: 'My profile', href: '/team-members/me', icon: UserRound, roles: ['employee'], keywords: 'me account' },
  { label: 'Team attendance', href: '/attendance/team', icon: Clock, roles: ['owner', 'hr'], keywords: 'present absent late' },
  { label: 'My attendance', href: '/attendance', icon: Clock, roles: ['employee'], keywords: 'check in out' },
  { label: 'Attendance corrections', href: '/attendance/regularization', icon: Clock, roles: ['owner', 'hr', 'employee'], keywords: 'regularization fix missed punch' },
  { label: 'My time off', href: '/leave', icon: Calendar, roles: ['hr', 'employee'], keywords: 'leave balance' },
  { label: 'Request time off', href: '/leave/apply', icon: Calendar, roles: ['hr', 'employee'], keywords: 'apply leave vacation' },
  { label: 'Team calendar', href: '/leave/team', icon: Calendar, roles: ['owner', 'hr'], keywords: 'leave calendar who is off' },
  { label: 'Holidays', href: '/leave/holidays', icon: Calendar, roles: ['owner', 'hr', 'employee'], keywords: 'holiday calendar' },
  { label: 'Insights overview', href: '/reports', icon: BarChart3, roles: ['owner', 'hr', 'employee', 'system_admin'], keywords: 'reports analytics' },
  { label: 'Attendance report', href: '/reports/attendance', icon: BarChart3, roles: ['owner', 'hr', 'employee'], keywords: 'reports' },
  { label: 'Time-off report', href: '/reports/leave', icon: BarChart3, roles: ['owner', 'hr'], keywords: 'leave report' },
  { label: 'Headcount report', href: '/reports/headcount', icon: BarChart3, roles: ['owner', 'system_admin'], keywords: 'headcount' },
  { label: 'Corrections log', href: '/reports/regularization', icon: ClipboardList, roles: ['owner'], keywords: 'regularization report' },
  { label: 'Attendance heatmap', href: '/reports/heatmap', icon: BarChart3, roles: ['owner'], keywords: 'heatmap' },
  { label: 'Daily attendance', href: '/reports/daily', icon: BarChart3, roles: ['owner'], keywords: 'daily report' },
  { label: 'Activity log', href: '/audit-logs', icon: ClipboardList, roles: ['owner', 'system_admin'], keywords: 'audit logs' },
  { label: 'Departments', href: '/settings/departments', icon: Building2, roles: ['owner'], keywords: 'settings' },
  { label: 'Designations', href: '/settings/designations', icon: Building2, roles: ['owner'], keywords: 'settings roles titles' },
  { label: 'Shifts', href: '/settings/shifts', icon: Clock, roles: ['owner', 'hr'], keywords: 'settings schedule' },
  { label: 'Time-off types', href: '/settings/leave-types', icon: Calendar, roles: ['owner'], keywords: 'settings leave types' },
  { label: 'Network rules', href: '/settings/ip-whitelist', icon: Settings, roles: ['owner', 'system_admin'], keywords: 'ip whitelist' },
  { label: 'Geofence', href: '/settings/geofence', icon: Settings, roles: ['owner', 'system_admin'], keywords: 'location radius' },
  { label: 'Location history', href: '/settings/location-history', icon: Settings, roles: ['owner', 'system_admin'], keywords: 'location' },
  { label: 'Notification settings', href: '/settings/notifications', icon: Settings, roles: ['owner'], keywords: 'settings' },
  { label: 'Onboarding checklist', href: '/settings/onboarding-checklist', icon: Settings, roles: ['owner'], keywords: 'settings' },
  { label: 'Role management', href: '/settings/roles', icon: Settings, roles: ['owner'], keywords: 'settings permissions' },
  { label: 'App configuration', href: '/settings/app-config', icon: Settings, roles: ['owner'], keywords: 'settings config' },
  { label: 'Time-off balances', href: '/settings/leave-balances', icon: Settings, roles: ['owner', 'hr'], keywords: 'settings balance' },
]

type PersonResult = {
  id: string
  first_name: string
  last_name: string
  employee_code: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const canSearchPeople = role === 'owner' || role === 'hr' || role === 'system_admin'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    const onOpenEvent = () => setOpen(true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('attendora:command', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('attendora:command', onOpenEvent)
    }
  }, [])

  const { data: people = [] } = useQuery({
    queryKey: ['command-people'],
    enabled: open && canSearchPeople,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_code')
        .eq('is_active', true)
        .order('first_name')
        .limit(40)
      if (error) throw error
      return (data ?? []) as PersonResult[]
    },
  })

  const pages = useMemo(
    () => PAGES.filter((page) => (role ? page.roles.includes(role) : false)),
    [role]
  )

  function go(href: string) {
    setOpen(false)
    navigate(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, people, or actions…" />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem key={page.href} value={`${page.label} ${page.keywords ?? ''}`} onSelect={() => go(page.href)}>
              <page.icon className="text-muted-foreground" />
              <span>{page.label}</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />
            </CommandItem>
          ))}
        </CommandGroup>

        {canSearchPeople && people.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="People">
              {people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={`${person.first_name} ${person.last_name} ${person.employee_code}`}
                  onSelect={() => go(`/team-members/${person.id}`)}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
                    {person.first_name[0]}
                    {person.last_name[0]}
                  </span>
                  <span>
                    {person.first_name} {person.last_name}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{person.employee_code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem value="request time off apply leave" onSelect={() => go('/leave/apply')}>
            <Sparkles className="text-muted-foreground" />
            <span>Request time off</span>
          </CommandItem>
          {role === 'owner' && (
            <CommandItem value="add person create employee" onSelect={() => go('/team-members/new')}>
              <Plus className="text-muted-foreground" />
              <span>Add a person</span>
            </CommandItem>
          )}
          <CommandItem value="my attendance check in" onSelect={() => go('/attendance')}>
            <Clock className="text-muted-foreground" />
            <span>Go to attendance</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
        <span>Navigate with ↑ ↓ · select with ↵</span>
        <span>Esc to close</span>
      </div>
    </CommandDialog>
  )
}
