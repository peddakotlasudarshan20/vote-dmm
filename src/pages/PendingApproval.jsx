import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'

export default function PendingApproval() {
  const { profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const status = profile?.status || 'pending_approval'

  useEffect(() => {
    if (status === 'approved') {
      navigate('/dashboard', { replace: true })
    }
  }, [status, navigate])

  const recheck = async () => {
    await refreshProfile()
  }

  return (
    <PageShell maxWidth="md" center>
      <div className="w-16 h-16 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-3xl mb-6">⏳</div>
      <h1 className="font-display text-2xl font-semibold mb-2">
        {status === 'rejected' ? 'Registration not approved' : 'Awaiting administrator approval'}
      </h1>
      <div className="flex justify-center mb-4"><StatusBadge status={status} /></div>
      <p className="text-[var(--ink-soft)] mb-8">
        {status === 'rejected'
          ? 'Your registration was reviewed and could not be approved. Contact your election administrator for details.'
          : 'Your email is verified. An administrator now needs to confirm your voter details before you can log in and vote. Please check back later.'}
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={recheck}>Check status</Button>
        <Button variant="secondary" onClick={signOut}>Log out</Button>
      </div>
    </PageShell>
  )
}
