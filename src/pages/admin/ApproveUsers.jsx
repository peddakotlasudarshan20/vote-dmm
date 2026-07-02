import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import PageShell from '../../components/ui/PageShell'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'

export default function ApproveUsers() {
  const [users, setUsers] = useState(null)
  const [filter, setFilter] = useState('pending_approval')
  const [acting, setActing] = useState(null)

  const load = () => api.adminListUsers(filter === 'all' ? undefined : filter).then(setUsers)

  useEffect(() => { setUsers(null); load() }, [filter])

  const act = async (fn, id) => {
    setActing(id)
    await fn(id)
    setActing(null)
    load()
  }

  return (
    <PageShell maxWidth="xl" backTo="/admin" backLabel="Back to admin dashboard">
      <PageHeader
        title="Voter Approvals"
        subtitle="Review and authorize student voting registrations."
        border={false}
      >
        <div className="flex flex-wrap gap-1.5 bg-[var(--line)]/40 p-1 rounded-xl">
          {['pending_approval', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${filter === f ? 'bg-[var(--ink)] text-[var(--paper-raised)] shadow-xs' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </PageHeader>

      {!users && <SkeletonList rows={4} />}

      {users && users.length === 0 && (
        <EmptyState icon="📋" title="No students found in this category." />
      )}

      {users && users.length > 0 && (
        <Card padding="p-0" className="overflow-hidden">
          <div className="divide-y divide-[var(--line)]">
            {users.map((u, i) => (
              <div
                key={u.id}
                className="animate-card-enter flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-[var(--paper)]/40 transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-[var(--ink)]">{u.full_name}</span>
                    <StatusBadge status={u.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--ink-soft)] font-mono">
                    <span>📧 {u.email}</span>
                    <span>📞 {u.mobile}</span>
                    <span className="bg-[var(--line)]/50 px-1.5 py-0.5 rounded">ID: {u.voter_id}</span>
                  </div>
                </div>
                {u.status === 'pending_approval' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="success" size="sm" loading={acting === u.id} onClick={() => act(api.approveUser, u.id)}>
                      Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => act(api.rejectUser, u.id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  )
}
