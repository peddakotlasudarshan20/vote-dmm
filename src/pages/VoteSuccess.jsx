import { Link, useLocation, Navigate } from 'react-router-dom'
import { formatDateTime } from '../lib/dateTime'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'

export default function VoteSuccess() {
  const { state } = useLocation()
  if (!state) return <Navigate to="/dashboard" replace />

  return (
    <PageShell maxWidth="sm" center>
      <div className="w-16 h-16 mx-auto rounded-full bg-[var(--ballot-green-soft)] flex items-center justify-center text-3xl mb-6 animate-[bounce_1s_ease-in-out_1]" aria-hidden="true">
        ✅
      </div>
      <h1 className="font-display text-2xl font-semibold mb-1">Vote recorded</h1>
      <p className="text-[var(--ink-soft)] mb-8">Thank you for participating. Keep this receipt for your records.</p>

      <div className="stub-edge bg-[var(--ink)] text-[var(--paper)] rounded-2xl p-5 sm:p-6 text-left">
        <p className="font-mono text-xs opacity-60 mb-1">VOTE REFERENCE</p>
        <p className="font-mono text-xl sm:text-2xl tracking-widest mb-4 break-all">{state.reference_id}</p>
        <div className="space-y-1 text-sm opacity-80 border-t border-white/20 pt-4">
          <p>{state.election_name}</p>
          <p>{formatDateTime(state.voted_at)}</p>
        </div>
      </div>

      <Link to="/dashboard" className="inline-block mt-8">
        <Button size="lg">Back to elections</Button>
      </Link>
    </PageShell>
  )
}
