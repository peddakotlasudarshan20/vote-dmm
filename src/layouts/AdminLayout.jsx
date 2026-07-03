/**
 * Admin layout with sidebar navigation.
 * Responsive: full sidebar on desktop, collapsed on tablet, bottom nav on mobile.
 */
import { Link, useLocation, Outlet } from 'react-router-dom'
import { memo } from 'react'

const NAV_ITEMS = [
  { to: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/admin/elections', icon: '🗳️', label: 'Elections' },
  { to: '/admin/candidates', icon: '👤', label: 'Candidates' },
  { to: '/admin/approvals', icon: '🛡️', label: 'Approvals' },
  { to: '/admin/notifications', icon: '🔔', label: 'Notifications' },
]

const SHORT_LABELS = {
  Dashboard: 'Home',
  Notifications: 'Notifs',
}

const SidebarLink = memo(function SidebarLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-[var(--ink)] text-[var(--paper)] shadow-xs'
          : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper)]'
      }`}
    >
      <span className="text-base shrink-0" aria-hidden="true">{icon}</span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  )
})

export default function AdminLayout() {
  const { pathname } = useLocation()

  const isActive = (item) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-page-enter">
      <div className="flex gap-6">
        {/* Sidebar — hidden on mobile, icons on tablet, full on desktop */}
        <aside className="hidden md:flex flex-col gap-1 w-14 lg:w-52 shrink-0 sticky top-20 self-start" aria-label="Admin navigation">
          <div className="hidden lg:block mb-4">
            <p className="text-[10px] font-semibold text-[var(--ink-soft)] uppercase tracking-widest px-4">Administration</p>
          </div>
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} active={isActive(item)} />
          ))}
        </aside>

        {/* Main content area — pb-20 on mobile for bottom nav clearance */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--paper-raised)]/95 backdrop-blur-md border-t border-[var(--line)] px-2 py-1.5 flex justify-around safe-area-bottom" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{SHORT_LABELS[item.label] || item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
