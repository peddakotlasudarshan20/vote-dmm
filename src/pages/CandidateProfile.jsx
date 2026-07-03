import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'

export default function CandidateProfile() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('candidates').select('*').eq('id', id).single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setCandidate(data)
      })
  }, [id])

  if (error) return (
    <PageShell maxWidth="lg">
      <Alert variant="error">{error}</Alert>
    </PageShell>
  )

  if (!candidate) return (
    <PageShell maxWidth="lg">
      <SkeletonCard lines={6} />
    </PageShell>
  )

  const links = candidate.social_links || {}

  return (
    <PageShell maxWidth="lg" backTo={`/elections/${candidate.election_id}`} backLabel="Back to candidates">
      <Card padding="p-5 sm:p-6 md:p-8" className="mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--gold-soft)] flex items-center justify-center overflow-hidden shrink-0">
            {candidate.photo_url
              ? <img src={candidate.photo_url} alt={`Photo of ${candidate.name}`} className="w-full h-full object-cover" />
              : <span className="font-display text-xl sm:text-2xl font-bold text-[var(--gold)]" aria-hidden="true">{candidate.name[0]}</span>}
          </div>
          <div className="text-center sm:text-left min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-semibold break-words">{candidate.name}</h1>
            <p className="text-sm text-[var(--ink-soft)]">{candidate.party_name || 'Independent'}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 text-sm mb-6">
          <Detail label="Age" value={candidate.age} />
          <Detail label="Qualification" value={candidate.qualification} />
          <Detail label="Experience" value={candidate.experience} />
        </dl>
      </Card>

      {candidate.biography && (
        <Card padding="p-5 sm:p-6 md:p-8" className="mb-6">
          <h2 className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">Biography</h2>
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{candidate.biography}</p>
        </Card>
      )}

      {(candidate.manifesto_url || Object.keys(links).length > 0) && (
        <div className="flex flex-wrap gap-3">
          {candidate.manifesto_url && (
            <a href={candidate.manifesto_url} target="_blank" rel="noreferrer" aria-label="Read manifesto PDF (opens in new tab)">
              <Button variant="secondary" size="sm">📄 Read manifesto</Button>
            </a>
          )}
          {Object.entries(links).map(([platform, url]) => (
            <a key={platform} href={url} target="_blank" rel="noreferrer" aria-label={`${platform} profile (opens in new tab)`}>
              <Button variant="secondary" size="sm" className="capitalize">{platform}</Button>
            </a>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div className="bg-[var(--paper)] p-3 rounded-xl border border-[var(--line)]/30">
      <dt className="text-[var(--ink-soft)] text-[10px] sm:text-xs uppercase tracking-wider font-semibold">{label}</dt>
      <dd className="font-medium text-sm mt-0.5">{value}</dd>
    </div>
  )
}
