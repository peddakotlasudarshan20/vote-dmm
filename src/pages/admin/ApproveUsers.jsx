import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/dateTime'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'

export default function ApproveUsers() {
  const [users, setUsers] = useState(null)
  const [filter, setFilter] = useState('all')
  const [acting, setActing] = useState(null)

  const load = () => api.adminListUsers(filter === 'all' ? undefined : filter).then(setUsers)
  useEffect(() => { setUsers(null); load() }, [filter])

  const act = async (fn, id) => {
    setActing(id)
    await fn(id)
    setActing(null)
    load()
  }

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Voter Management</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-0.5">View and manage student registrations.</p>
        </div>
        <Tabs tabs={tabs} active={filter} onChange={setFilter} />
      </div>

      {!users && <SkeletonList rows={4} />}

      {users && users.length === 0 && (
        <EmptyState icon="📋" title="No students found" description="No users match this filter." />
      )}

      {users && users.length > 0 && (
        <Card padding="p-0" className="overflow-hidden">
          <div className="divide-y divide-[var(--line)]">
            {users.map((u, i) => (
              <div
                key={u.id}
                className="animate-card-enter flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3 hover:bg-[var(--paper)]/40 transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--ink)]">{u.full_name}</span>
                    <Badge status={u.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--ink-soft)] font-mono">
                    <span>📧 {u.email}</span>
                    <span className="bg-[var(--line)]/50 px-1.5 py-0.5 rounded">PIN: {u.voter_id}</span>
                    <span>{formatDateTime(u.created_at)}</span>
                  </div>
                </div>
                {u.status === 'rejected' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="success" size="sm" loading={acting === u.id} onClick={() => act(api.approveUser, u.id)}>
                      Re-approve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
