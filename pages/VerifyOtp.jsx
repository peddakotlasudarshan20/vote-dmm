import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const verify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/pending-approval')
  }

  const resend = async () => {
    setError('')
    setInfo('')
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    if (err) setError(err.message)
    else setInfo('A new code has been sent to your email.')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-2xl mb-6">✉️</div>
      <h1 className="font-display text-2xl font-semibold mb-2">Check your email</h1>
      <p className="text-[var(--ink-soft)] mb-8">
        Enter the 8-digit code we sent to verify your address.</p>
      <form onSubmit={verify} className="space-y-4 text-left">
        <label className="block">
          <span className="text-sm font-medium">Email address</span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] outline-none focus:border-[var(--gold)]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Verification code</span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
            inputMode="numeric"
            placeholder="00000000"
            className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] outline-none focus:border-[var(--gold)] font-mono text-lg tracking-[0.4em] text-center"
          />
        </label>

        {error && <p className="text-sm text-[var(--ballot-red)] bg-[var(--ballot-red-soft)] rounded-lg px-3 py-2">{error}</p>}
        {info && <p className="text-sm text-[var(--ballot-green)] bg-[var(--ballot-green-soft)] rounded-lg px-3 py-2">{info}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <button onClick={resend} className="text-sm text-[var(--gold)] font-medium mt-4">
        Resend code
      </button>
    </div>
  )
}
