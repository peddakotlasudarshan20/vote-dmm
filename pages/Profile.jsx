import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import StatusBadge from '../components/StatusBadge'

export default function Profile() {
  const { profile } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const changePassword = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) setError(err.message)
    else {
      setMsg('Password updated.')
      setNewPassword('')
    }
  }

  if (!profile) return null

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="w-16 h-16 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-display text-2xl mb-4">
        {profile.full_name?.[0]?.toUpperCase()}
      </div>
      <h1 className="font-display text-2xl font-semibold">{profile.full_name}</h1>
      <div className="mt-2"><StatusBadge status={profile.status} /></div>

      <dl className="mt-8 space-y-3 text-sm">
        <Row label="Email" value={profile.email} />
        <Row label="Mobile" value={profile.mobile} />
        <Row label="Voter ID" value={profile.voter_id} />
        <Row label="Role" value={profile.role} />
      </dl>

      <form onSubmit={changePassword} className="mt-10 space-y-3">
        <h2 className="font-medium">Change password</h2>
        <input
          type="password" required minLength={8} placeholder="New password"
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] outline-none focus:border-[var(--gold)]"
        />
        {error && <p className="text-sm text-[var(--ballot-red)]">{error}</p>}
        {msg && <p className="text-sm text-[var(--ballot-green)]">{msg}</p>}
        <button className="px-5 py-2.5 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-medium">
          Update password
        </button>
      </form>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[var(--line)] pb-2">
      <dt className="text-[var(--ink-soft)]">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  )
}
