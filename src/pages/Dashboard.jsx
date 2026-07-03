import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { formatDateRange } from '../lib/dateTime'
import Badge from '../components/ui/Badge'
import Countdown from '../components/Countdown'
import PageShell from '../components/ui/PageShell'
import PageHeader from '../components/ui/PageHeader'
import Tabs from '../components/ui/Tabs'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function Dashboard() {
  const [elections, setElections] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    api.listElections().then(setElections).catch((e) => setError(e.message))
  }, [])

  if (error) return (
    <PageShell maxWidth="xl">
      <Alert variant="error">{error}</Alert>
    </PageShell>
  )

  const tabs = [
    { value: 'active', label: 'Live Ballots', count: elections?.filter(e => e.status === 'active').length },
    { value: 'upcoming', label: 'Upcoming', count: elections?.filter(e => e.status === 'upcoming').length },
    { value: 'completed', label: 'Completed', count: elections?.filter(e => e.status === 'completed').length },
  ]

  const filtered = elections?.filter((e) => {
    if (activeTab === 'active') return e.status === 'active'
    if (activeTab === 'upcoming') return e.status === 'upcoming'
    return e.status === 'completed'
  })

  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Elections Portal"
        subtitle="Government Polytechnic, Dharmavaram"
        border={false}
      >
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </PageHeader>

      {/* Skeleton loading state */}
      {!elections && (
        <div className="grid gap-5">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} lines={4} />
          ))}
        </div>
      )}

      {filtered && filtered.length === 0 && (
        <EmptyState
          icon="🗳️"
          title={`No ${activeTab} elections`}
          description="Check back later or contact your system administrator."
        />
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid gap-5">
          {filtered.map((e, i) => (
            <Link
              key={e.id}
              to={`/elections/${e.id}`}
              className="animate-card-enter block bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-4 sm:p-6 shadow-xs card-hover relative overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {e.status === 'active' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-[var(--ballot-green)]" aria-hidden="true" />
              )}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)] break-words">{e.name}</h2>
                    <Badge status={e.status} />
                  </div>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed line-clamp-2">{e.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-[var(--ink-soft)] pt-2">
                    <span className="flex items-center gap-1 bg-[var(--paper)] px-2 py-1 rounded">👤 {e.candidate_count} candidates</span>
                    <span className="flex items-center gap-1 bg-[var(--paper)] px-2 py-1 rounded">📅 {formatDateRange(e.start_time, e.end_time)}</span>
                  </div>
                </div>
              </div>
              {e.status === 'upcoming' && (
                <div className="mt-4 pt-3 border-t border-[var(--line)]/50">
                  <Countdown target={e.start_time} label="Voting opens in" />
                </div>
              )}
              {e.status === 'active' && (
                <div className="mt-4 pt-3 border-t border-[var(--line)]/50">
                  <Countdown target={e.end_time} label="Voting closes in" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
