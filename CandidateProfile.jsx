import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FullPageSpinner } from '../components/ProtectedRoute'

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

  if (error) return <p className="max-w-2xl mx-auto px-6 py-16 text-[var(--ballot-red)]">{error}</p>
  if (!candidate) return <FullPageSpinner />

  const links = candidate.social_links || {}

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <Link to={`/elections/${candidate.election_id}`} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Back to candidates</Link>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[var(--gold-soft)] flex items-center justify-center overflow-hidden shrink-0">
          {candidate.photo_url
            ? <img src={candidate.photo_url} alt="" className="w-full h-full object-cover" />
            : <span className="font-display text-2xl">{candidate.name[0]}</span>}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">{candidate.name}</h1>
          <p className="text-[var(--ink-soft)]">{candidate.party_name}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 mt-8 text-sm">
        <Detail label="Age" value={candidate.age} />
        <Detail label="Qualification" value={candidate.qualification} />
        <Detail label="Experience" value={candidate.experience} />
      </dl>

      {candidate.biography && (
        <div className="mt-8">
          <h2 className="font-medium mb-2">Biography</h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">{candidate.biography}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        {candidate.manifesto_url && (
          <a href={candidate.manifesto_url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--gold)] text-sm font-medium">
            Read manifesto (PDF)
          </a>
        )}
        {Object.entries(links).map(([platform, url]) => (
          <a key={platform} href={url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--gold)] text-sm font-medium capitalize">
            {platform}
          </a>
        ))}
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-[var(--ink-soft)] text-xs uppercase tracking-wide">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
