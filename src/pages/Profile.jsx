import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import StatusBadge from '../components/StatusBadge'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import FormField from '../components/ui/FormField'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function Profile() {
  const { profile } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (err) setError(err.message)
    else {
      setMsg('Password updated successfully.')
      setNewPassword('')
    }
  }

  if (!profile) return null

  return (
    <PageShell maxWidth="md">
      {/* Profile Header */}
      <Card padding="p-6 sm:p-8" className="mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-display text-2xl shrink-0">
            {profile.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-semibold">{profile.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={profile.status} />
              {profile.role === 'admin' && (
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--gold)] bg-[var(--gold-soft)] px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Details */}
      <Card className="mb-6" padding="p-5 sm:p-6">
        <h2 className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-4">Account Details</h2>
        <dl className="space-y-0">
          <Row label="Email" value={profile.email} icon="📧" />
          <Row label="Mobile" value={profile.mobile} icon="📱" />
          <Row label="Voter ID" value={profile.voter_id} icon="🪪" />
          <Row label="Role" value={profile.role} icon="👤" last />
        </dl>
      </Card>

      {/* Change Password */}
      <Card padding="p-5 sm:p-6">
        <form onSubmit={changePassword} className="space-y-4">
          <h2 className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Change Password</h2>
          <FormField
            label="New Password"
            type="password"
            required
            minLength={8}
            placeholder="Enter new password (min. 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="Password must be at least 8 characters"
            autoComplete="new-password"
          />
          <Alert variant="error">{error}</Alert>
          <Alert variant="success">{msg}</Alert>
          <Button type="submit" loading={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Card>
    </PageShell>
  )
}

function Row({ label, value, icon, last = false }) {
  return (
    <div className={`flex items-center justify-between py-3 ${!last ? 'border-b border-[var(--line)]' : ''}`}>
      <dt className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
        <span className="text-xs">{icon}</span>
        {label}
      </dt>
      <dd className="font-medium text-sm">{value || '—'}</dd>
    </div>
  )
}
