import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'
import PageShell from '../components/ui/PageShell'
import Button from '../components/ui/Button'

export default function PendingApproval() {
  const { profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const status = profile?.status || 'rejected'

  useEffect(() => {
    if (status === 'approved') {
      navigate('/dashboard', { replace: true })
    }
  }, [status, navigate])

  return (
    <PageShell maxWidth="sm" center>
      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--ballot-red-soft)] flex items-center justify-center text-2xl mb-5" aria-hidden="true">⚠️</div>
      <h1 className="font-display text-xl sm:text-2xl font-semibold mb-2">
        {status === 'rejected' ? 'Registration not approved' : 'Account issue'}
      </h1>
      <div className="flex justify-center mb-4"><Badge status={status} /></div>
      <p className="text-sm text-[var(--ink-soft)] mb-8 max-w-sm mx-auto">
        {status === 'rejected'
          ? 'Your registration was reviewed and could not be approved. Please contact your election administrator for assistance.'
          : 'There is an issue with your account. Please contact support or try registering again.'}
      </p>
      <div className="flex gap-3 justify-center">
        <Button size="sm" onClick={refreshProfile}>Recheck status</Button>
        <Button variant="secondary" size="sm" onClick={signOut}>Log out</Button>
      </div>
    </PageShell>
  )
}
