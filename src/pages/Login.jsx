import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import FormField from '../components/ui/FormField'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  const emailError = touched.email && !email ? 'Email is required' :
                     touched.email && !/\S+@\S+\.\S+/.test(email) ? 'Enter a valid email address' : ''
  const passwordError = touched.password && !password ? 'Password is required' :
                        touched.password && password.length < 8 ? 'Must be at least 8 characters' : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })
    if (!email || !password || password.length < 8) return

    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (err) {
      if (err.message.toLowerCase().includes('email not confirmed')) {
        navigate('/verify-otp', { state: { email } })
        return
      }
      setError(err.message)
      return
    }

    // Refresh profile and redirect based on role
    await refreshProfile()
    navigate('/dashboard')
  }

  return (
    <PageShell maxWidth="sm" center>
      <Card padding="p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-xl mb-3" aria-hidden="true">🗳️</div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Student Login</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Government Polytechnic, Dharmavaram</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <FormField
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={touch('email')}
            placeholder="student@gptdvm.in"
            error={emailError}
            autoComplete="email"
          />
          <FormField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={touch('password')}
            placeholder="Enter your password"
            error={passwordError}
            autoComplete="current-password"
          />

          <Alert variant="error">{error}</Alert>

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Signing in…' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--line)] space-y-2 text-center">
          <p className="text-xs text-[var(--ink-soft)]">
            New student?{' '}
            <Link to="/register" className="text-[var(--gold)] font-bold hover:underline transition-colors">
              Register account
            </Link>
          </p>
          <p className="text-xs text-[var(--ink-soft)]">
            Administrator?{' '}
            <Link to="/admin/login" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline transition-colors">
              Admin portal →
            </Link>
          </p>
        </div>
      </Card>
    </PageShell>
  )
}
