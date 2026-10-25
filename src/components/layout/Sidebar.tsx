import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  X,
  ClipboardList,
  Megaphone,
  Search,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useAuthStore } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { APP_NAME, REPO_URL } from '@/lib/brand'

type NavSubItem = {
  label: string
  href: string
  roles?: string[]
}

type NavGroup = {
  label: string
  icon: React.ElementType
  href?: string
  roles?: string[]
  children?: NavSubItem[]
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Announcements', href: '/announcements', icon: Megaphone, roles: ['owner', 'hr', 'system_admin'] },
  {
    label: 'People',
    icon: Users,
    roles: ['owner', 'hr', 'system_admin'],
    children: [
      { label: 'Directory', href: '/team-members', roles: ['owner', 'hr', 'system_admin'] },
      { label: 'Add person', href: '/team-members/new', roles: ['owner'] },
      { label: 'Org chart', href: '/org-chart', roles: ['owner', 'hr', 'system_admin'] },
      { label: 'Profile changes', href: '/team-members/profile-edits', roles: ['owner', 'hr'] },
    ],
  },
  {
    label: 'Time & attendance',
    icon: Clock,
    children: [
      { label: 'Team attendance', href: '/attendance/team', roles: ['owner', 'hr'] },
      { label: 'Corrections', href: '/attendance/regularization', roles: ['owner', 'hr', 'employee'] },
      { label: 'My attendance', href: '/attendance', roles: ['employee'] },
    ],
  },
  {
    label: 'Time off',
    icon: Calendar,
    children: [
      { label: 'My time off', href: '/leave', roles: ['hr', 'employee'] },
      { label: 'Request time off', href: '/leave/apply', roles: ['hr', 'employee'] },
      { label: 'Team calendar', href: '/leave/team', roles: ['owner', 'hr'] },
      { label: 'Holidays', href: '/leave/holidays', roles: ['owner', 'hr', 'employee'] },
    ],
  },
  {
    label: 'Insights',
    icon: BarChart3,
    roles: ['owner', 'hr', 'system_admin', 'employee'],
    children: [
      { label: 'Overview', href: '/reports', roles: ['owner', 'hr', 'system_admin', 'employee'] },
      { label: 'Attendance', href: '/reports/attendance', roles: ['owner', 'hr', 'employee'] },
      { label: 'Time off', href: '/reports/leave', roles: ['owner', 'hr'] },
      { label: 'Headcount', href: '/reports/headcount', roles: ['owner', 'system_admin'] },
      { label: 'Corrections log', href: '/reports/regularization', roles: ['owner'] },
      { label: 'Heatmap', href: '/reports/heatmap', roles: ['owner'] },
      { label: 'Daily attendance', href: '/reports/daily', roles: ['owner'] },
    ],
  },
  { label: 'Activity', href: '/audit-logs', icon: ClipboardList, roles: ['owner', 'system_admin'] },
  {
    label: 'Settings',
    icon: Settings,
    roles: ['owner', 'hr', 'system_admin'],
    children: [
      { label: 'Departments', href: '/settings/departments', roles: ['owner'] },
      { label: 'Designations', href: '/settings/designations', roles: ['owner'] },
      { label: 'Shifts', href: '/settings/shifts', roles: ['owner', 'hr'] },
      { label: 'Time-off types', href: '/settings/leave-types', roles: ['owner'] },
      { label: 'Network rules', href: '/settings/ip-whitelist', roles: ['owner', 'system_admin'] },
      { label: 'Geofence', href: '/settings/geofence', roles: ['owner', 'system_admin'] },
      { label: 'Location history', href: '/settings/location-history', roles: ['owner', 'system_admin'] },
      { label: 'Notifications', href: '/settings/notifications', roles: ['owner'] },
      { label: 'Onboarding', href: '/settings/onboarding-checklist', roles: ['owner'] },
      { label: 'Roles', href: '/settings/roles', roles: ['owner'] },
      { label: 'App config', href: '/settings/app-config', roles: ['owner'] },
      { label: 'Time-off balances', href: '/settings/leave-balances', roles: ['owner', 'hr'] },
    ],
  },
]

function EmployeeNav({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <>
      <NavItem icon={LayoutDashboard} href="/dashboard" label="Overview" onClick={onItemClick} />
      <NavItem icon={User} href="/team-members/me" label="My profile" onClick={onItemClick} />
      <NavItem icon={Megaphone} href="/announcements" label="Announcements" onClick={onItemClick} />
      <NavItem icon={Clock} href="/attendance" label="My attendance" onClick={onItemClick} />
      <NavItem icon={Clock} href="/attendance/regularization" label="Corrections" onClick={onItemClick} />
      <NavGroupItem
        icon={Calendar}
        label="Time off"
        children={[
          { label: 'Request time off', href: '/leave/apply' },
          { label: 'My time off', href: '/leave' },
          { label: 'Holidays', href: '/leave/holidays' },
        ]}
        onChildClick={onItemClick}
      />
      <NavItem icon={BarChart3} href="/reports/attendance" label="My reports" onClick={onItemClick} />
    </>
  )
}

function NavItem({ icon: Icon, href, label, onClick }: { icon: React.ElementType; href: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={href}
      end
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-white/10 font-medium text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 h-4 w-0.5 rounded-full bg-indigo-400 opacity-0 transition-opacity',
              isActive && 'opacity-100'
            )}
          />
          <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300')} />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function NavGroupItem({
  icon: Icon,
  label,
  children,
  defaultOpen,
  onChildClick,
}: {
  icon: React.ElementType
  label: string
  children: { label: string; href: string }[]
  defaultOpen?: boolean
  onChildClick?: () => void
}) {
  const location = useLocation()
  const childActive = children.some(
    (c) => location.pathname === c.href || location.pathname.startsWith(c.href + '/')
  )
  const [open, setOpen] = useState(defaultOpen ?? childActive)

  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          childActive
            ? 'bg-white/10 font-medium text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        )}
      >
        <span
          className={cn(
            'absolute left-0 h-4 w-0.5 rounded-full bg-indigo-400 opacity-0 transition-opacity',
            childActive && 'opacity-100'
          )}
        />
        <Icon className={cn('h-4 w-4 shrink-0', childActive ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300')} />
        <span className="flex-1 text-left">{label}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
      </button>
      {open && (
        <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {children.map((child) => (
            <NavLink
              key={child.href}
              to={child.href}
              end
              onClick={onChildClick}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'bg-indigo-500/15 font-medium text-indigo-200'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function BrandMark() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg shadow-lg shadow-indigo-950/40" />
      <span className="text-[15px] font-semibold tracking-tight text-white">{APP_NAME}</span>
    </Link>
  )
}

function WorkspaceChip() {
  const employee = useAuthStore((s) => s.employee)
  const role = employee?.role ?? 'employee'
  const label =
    role === 'owner'
      ? 'Owner workspace'
      : role === 'hr'
        ? 'HR workspace'
        : role === 'system_admin'
          ? 'Admin workspace'
          : 'Employee workspace'
  return (
    <div className="mx-3 mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-200">{label}</p>
        <p className="truncate text-[10px] text-slate-500">{employee?.employee_code ?? 'Attendora'}</p>
      </div>
    </div>
  )
}

type Props = { open: boolean; onClose: () => void }

export function Sidebar({ open, onClose }: Props) {
  const { role } = useRole()

  const openCommand = () => {
    window.dispatchEvent(new CustomEvent('attendora:command'))
  }

  const navContent = role === 'employee' ? (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      <EmployeeNav onItemClick={onClose} />
    </nav>
  ) : (
    <div className="flex-1 overflow-y-auto p-3">
      <nav className="space-y-0.5">
        {(() => {
          const visibleGroups = NAV_GROUPS.filter(
            (group) => !group.roles || (role && group.roles.includes(role))
          ).map((group) => ({
            ...group,
            children: group.children?.filter(
              (child) => !child.roles || (role && child.roles.includes(role))
            ),
          }))

          return visibleGroups.map((group) => {
            if (!group.children || group.children.length === 0) {
              return (
                <NavItem key={group.href!} icon={group.icon} href={group.href!} label={group.label} onClick={onClose} />
              )
            }
            if (group.children.length === 1) {
              return (
                <NavItem key={group.children[0].href} icon={group.icon} href={group.children[0].href} label={group.children[0].label} onClick={onClose} />
              )
            }
            return (
              <NavGroupItem
                key={group.label}
                icon={group.icon}
                label={group.label}
                children={group.children.map((c) => ({ label: c.label, href: c.href }))}
                onChildClick={onClose}
              />
            )
          })
        })()}
      </nav>
    </div>
  )

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-slate-950 transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <BrandMark />
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden">
            <span className="sr-only">Close navigation</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <WorkspaceChip />

        <div className="px-3 pt-3">
          <button
            onClick={openCommand}
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-left text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Jump to…</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd>
          </button>
        </div>

        {navContent}

        <div className="border-t border-white/10 p-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          >
            <span>Open source · v1.0.0</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </aside>
    </>
  )
}
