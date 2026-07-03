import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import FormField from '../components/ui/FormField'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const codeRef = useRef(null)

  /* Auto-focus the code input when email is pre-filled */
  useEffect(() => {
    if (email && codeRef.current) {
      codeRef.current.focus()
    }
  }, [])

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
    navigate('/dashboard')
  }

  const resend = async () => {
    setError('')
    setInfo('')
    setResending(true)
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    if (err) setError(err.message)
    else setInfo('A new code has been sent to your email.')
  }

  return (
    <PageShell maxWidth="sm" center>
      <Card padding="p-6 sm:p-8">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-2xl mb-6">✉️</div>
        <h1 className="font-display text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-[var(--ink-soft)] text-sm mb-8">Enter the 8-digit code we sent to verify your address.</p>

        <form onSubmit={verify} className="space-y-5 text-left">
          <FormField
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <div>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Verification code</span>
              <input
                ref={codeRef}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                maxLength={8}
                inputMode="numeric"
                placeholder="00000000"
                className="w-full px-3.5 py-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none text-sm text-[var(--ink)] form-field-focus font-mono text-xl tracking-[0.4em] text-center"
                autoComplete="one-time-code"
              />
            </label>
            <p className="text-[11px] text-[var(--ink-soft)] mt-1.5">
              {code.length}/8 digits entered
            </p>
          </div>

          <Alert variant="error">{error}</Alert>
          <Alert variant="success">{info}</Alert>

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Verifying…' : 'Verify email'}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--line)] text-center">
          <Button variant="ghost" size="sm" onClick={resend} loading={resending}>
            {resending ? 'Sending…' : 'Resend code'}
          </Button>
        </div>
      </Card>
    </PageShell>
  )
}
