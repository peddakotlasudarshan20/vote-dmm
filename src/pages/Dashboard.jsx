import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import Countdown from '../components/Countdown'
import PageShell from '../components/ui/PageShell'
import PageHeader from '../components/ui/PageHeader'
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

  const filtered = elections?.filter((e) => {
    if (activeTab === 'active') return e.status === 'active'
    return e.status !== 'active'
  })

  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Elections Portal"
        subtitle="Government Polytechnic, Dharmavaram"
        border={false}
      >
        <div className="flex bg-[var(--line)]/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white shadow-xs text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
          >
            Live Ballots {elections ? `(${elections.filter(e => e.status === 'active').length})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white shadow-xs text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
          >
            Other/Past {elections ? `(${elections.filter(e => e.status !== 'active').length})` : ''}
          </button>
        </div>
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
          title="No elections found in this category."
          description="Check back later or contact your system administrator."
        />
      )}

      {filtered && (
        <div className="grid gap-5">
          {filtered.map((e, i) => (
            <Link
              key={e.id}
              to={`/elections/${e.id}`}
              className="animate-card-enter block bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs card-hover relative overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {e.status === 'active' && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--ballot-green)]" />
              )}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-[var(--ink)]">{e.name}</h2>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-2xl">{e.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--ink-soft)] pt-2">
                    <span className="flex items-center gap-1 bg-[var(--paper)] px-2 py-1 rounded">👤 {e.candidate_count} candidates</span>
                    <span className="flex items-center gap-1 bg-[var(--paper)] px-2 py-1 rounded">📅 {new Date(e.start_time).toLocaleDateString()} – {new Date(e.end_time).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {e.status === 'upcoming' && (
                <div className="mt-5 pt-4 border-t border-[var(--line)]/50">
                  <Countdown target={e.start_time} label="Voting opens in" />
                </div>
              )}
              {e.status === 'active' && (
                <div className="mt-5 pt-4 border-t border-[var(--line)]/50">
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
