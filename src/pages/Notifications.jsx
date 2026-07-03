import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { formatRelative } from '../lib/dateTime'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function Notifications() {
  const [notifs, setNotifs] = useState(null)

  useEffect(() => {
    api.notifications().then(setNotifs).catch(() => setNotifs([]))
  }, [])

  const markRead = async (id) => {
    await api.markNotificationRead(id)
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await api.markAllNotificationsRead()
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unread = notifs?.filter((n) => !n.read).length || 0

  return (
    <PageShell maxWidth="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">Notifications</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {!notifs && (
        <div className="space-y-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      )}

      {notifs && notifs.length === 0 && (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up. Check back later." />
      )}

      {notifs && notifs.length > 0 && (
        <div className="space-y-3">
          {notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((n, i) => (
            <Card
              key={n.id}
              padding="p-4 sm:p-5"
              className={`animate-card-enter ${!n.read ? 'border-l-4 border-l-[var(--gold)]' : 'opacity-70'}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                  n.type === 'success' ? 'bg-[var(--ballot-green-soft)]' :
                  n.type === 'warning' ? 'bg-[var(--gold-soft)]' :
                  n.type === 'error' ? 'bg-[var(--ballot-red-soft)]' :
                  'bg-blue-50'
                }`}>
                  {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.read ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}>{n.title}</p>
                    {n.pinned && <Badge variant="warning" label="Pinned" />}
                  </div>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--ink-soft)] font-mono">{formatRelative(n.created_at)}</span>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-[10px] font-medium text-[var(--gold)] hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
