import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { api } from '../lib/api'
import { FullPageSpinner } from '../components/ProtectedRoute'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function VoteConfirm() {
  const { electionId, candidateId } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('candidates').select('*').eq('id', candidateId).single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setCandidate(data)
      })
  }, [candidateId])

  const confirmVote = async () => {
    setSubmitting(true)
    setError('')
    try {
      const result = await api.vote(electionId, candidateId)
      navigate('/vote-success', { state: result })
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  if (!candidate && !error) return <FullPageSpinner />

  return (
    <PageShell maxWidth="sm" center>
      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-2xl mb-4" aria-hidden="true">🗳️</div>
      <h1 className="font-display text-xl sm:text-2xl font-semibold mb-1">Confirm your vote</h1>
      <p className="text-sm text-[var(--ink-soft)] mb-6">This action cannot be undone once submitted.</p>

      {candidate && (
        <Card className="mb-6" padding="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--gold-soft)] flex items-center justify-center overflow-hidden shrink-0">
              {candidate.photo_url
                ? <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover" />
                : <span className="font-display text-lg font-bold text-[var(--gold)]" aria-hidden="true">{candidate.name[0]}</span>}
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold truncate">{candidate.name}</p>
              <p className="text-xs text-[var(--ink-soft)]">{candidate.party_name || 'Independent'}</p>
            </div>
          </div>
        </Card>
      )}

      <Alert variant="error">{error}</Alert>

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          variant="success"
          size="lg"
          fullWidth
          loading={submitting}
          onClick={confirmVote}
          disabled={!candidate}
          aria-label={candidate ? `Confirm vote for ${candidate.name}` : 'Confirm vote'}
        >
          {submitting ? 'Submitting…' : 'Confirm vote'}
        </Button>
      </div>
    </PageShell>
  )
}
