import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { api } from '../lib/api'
import { FullPageSpinner } from '../components/ProtectedRoute'

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
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold mb-2">Confirm your vote</h1>
      <p className="text-[var(--ink-soft)] mb-8">This action cannot be undone once submitted.</p>

      {candidate && (
        <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-xl p-6 mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center overflow-hidden mb-3">
            {candidate.photo_url
              ? <img src={candidate.photo_url} alt="" className="w-full h-full object-cover" />
              : <span className="font-display text-xl">{candidate.name[0]}</span>}
          </div>
          <p className="font-display text-xl font-semibold">{candidate.name}</p>
          <p className="text-sm text-[var(--ink-soft)]">{candidate.party_name}</p>
        </div>
      )}

      {error && <p className="text-sm text-[var(--ballot-red)] bg-[var(--ballot-red-soft)] rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-lg border border-[var(--line)] font-medium hover:border-[var(--ink)]"
        >
          Cancel
        </button>
        <button
          onClick={confirmVote}
          disabled={submitting || !candidate}
          className="flex-1 py-3 rounded-lg bg-[var(--ballot-green)] text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Confirm vote'}
        </button>
      </div>
    </div>
  )
}
