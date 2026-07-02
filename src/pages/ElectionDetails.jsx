import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import Countdown from '../components/Countdown'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function ElectionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.electionDetail(id).then(setData).catch((e) => setError(e.message))
  }, [id])

  if (error) return (
    <PageShell maxWidth="xl">
      <Alert variant="error">{error}</Alert>
    </PageShell>
  )

  if (!data) return (
    <PageShell maxWidth="xl">
      <SkeletonCard lines={5} className="mb-8" />
      <div className="grid sm:grid-cols-2 gap-5">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </PageShell>
  )

  const { election, candidates } = data

  return (
    <PageShell maxWidth="xl" backTo="/dashboard" backLabel="Back to elections">
      <Card className="relative overflow-hidden mb-8" padding="p-5 sm:p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ballot-green-soft)] rounded-full -mr-12 -mt-12 opacity-30 blur-2xl" aria-hidden="true" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">{election.name}</h1>
          <div className="shrink-0"><StatusBadge status={election.status} /></div>
        </div>
        <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mb-6">{election.description}</p>

        {election.status === 'upcoming' && (
          <div className="bg-[var(--paper)] p-4 rounded-xl border border-[var(--line)]/50">
            <Countdown target={election.start_time} label="Voting opens in" />
          </div>
        )}
        {election.status === 'active' && (
          <div className="bg-[var(--paper)] p-4 rounded-xl border border-[var(--line)]/50">
            <Countdown target={election.end_time} label="Voting closes in" />
          </div>
        )}
        {election.status === 'completed' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--gold-soft)] p-4 rounded-xl border border-[var(--gold)]/20">
            <div className="text-xs sm:text-sm text-[var(--gold)] font-semibold">
              🏁 Voting has concluded. Results are available now.
            </div>
            <Button size="sm" onClick={() => navigate(`/results/${election.id}`)}>
              View results dashboard →
            </Button>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)]">Electoral Candidates</h2>
        <span className="text-xs font-mono text-[var(--ink-soft)] uppercase bg-[var(--line)]/40 px-2.5 py-1 rounded-full">{candidates.length} Nominees</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-5" role="list" aria-label="Candidate list">
        {candidates.map((c, i) => (
          <Card
            key={c.id}
            hoverable
            padding="p-5"
            className="animate-card-enter flex flex-col justify-between"
            style={{ animationDelay: `${i * 60}ms` }}
            role="listitem"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[var(--gold-soft)] border-2 border-white shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                  {c.photo_url
                    ? <img src={c.photo_url} alt={`Photo of ${c.name}`} className="w-full h-full object-cover" />
                    : <span className="font-display text-xl font-bold text-[var(--gold)]" aria-hidden="true">{c.name[0]}</span>}
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-[var(--ink)]">{c.name}</h3>
                  <p className="text-xs text-[var(--gold)] font-mono uppercase tracking-wider font-semibold">{c.party_name || 'Independent'}</p>
                </div>
              </div>
              {c.biography && (
                <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed mb-4 line-clamp-3 bg-[var(--paper)] p-3 rounded-xl border border-[var(--line)]/30">
                  {c.biography}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)]/50">
              <Link
                to={`/candidates/${c.id}`}
                className="flex-1 text-center py-2.5 text-xs font-semibold rounded-xl border border-[var(--line)] hover:border-[var(--ink)] hover:bg-[var(--paper)] transition"
              >
                Profile & Bio
              </Link>
              {election.status === 'active' && (
                <Link
                  to={`/vote/${election.id}/${c.id}`}
                  className="flex-1 text-center py-2.5 text-xs font-semibold rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] hover:bg-[var(--ballot-green)] transition shadow-xs"
                  aria-label={`Vote for ${c.name}`}
                >
                  Vote Candidate
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
