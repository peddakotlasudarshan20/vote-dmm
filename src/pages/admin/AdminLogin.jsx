import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import PageShell from '../../components/ui/PageShell'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  const emailError = touched.email && !email ? 'Email is required' :
                     touched.email && !/\S+@\S+\.\S+/.test(email) ? 'Enter a valid email' : ''
  const passwordError = touched.password && !password ? 'Password is required' :
                        touched.password && password.length < 8 ? 'Must be at least 8 characters' : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })
    if (!email || !password || password.length < 8) return

    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    await refreshProfile()
    navigate('/admin')
  }

  return (
    <PageShell maxWidth="sm" center>
      <Card padding="p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--ink)] flex items-center justify-center text-2xl mb-4" aria-hidden="true">🔒</div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Admin Portal</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Authorized administrators only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <FormField
            label="Admin Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={touch('email')}
            placeholder="admin@gptdvm.in"
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
            placeholder="Enter admin password"
            error={passwordError}
            autoComplete="current-password"
          />

          <Alert variant="error">{error}</Alert>

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Authenticating…' : 'Sign in as Admin'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--line)] text-center">
          <p className="text-xs text-[var(--ink-soft)]">
            Student?{' '}
            <Link to="/login" className="text-[var(--gold)] font-bold hover:underline transition-colors">
              Use student login
            </Link>
          </p>
        </div>
      </Card>
    </PageShell>
  )
}
