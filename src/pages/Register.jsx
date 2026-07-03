import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import FormField from '../components/ui/FormField'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', college_pin: '', email: '', password: '', confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }))

  /* Inline validation */
  const v = {
    full_name: touched.full_name && !form.full_name ? 'Full name is required' : '',
    college_pin: touched.college_pin && !form.college_pin ? 'College PIN is required' :
                 touched.college_pin && form.college_pin.length < 3 ? 'Enter a valid College PIN' : '',
    email: touched.email && !form.email ? 'Email is required' :
           touched.email && !/\S+@\S+\.\S+/.test(form.email) ? 'Enter a valid email' : '',
    password: touched.password && !form.password ? 'Password is required' :
              touched.password && form.password.length < 8 ? 'Must be at least 8 characters' : '',
    confirm: touched.confirm && form.confirm !== form.password ? 'Passwords do not match' : '',
  }

  const passwordStrength = form.password.length === 0 ? 0 :
    form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3
  const strengthLabels = ['', 'Weak', 'Good', 'Strong']
  const strengthColors = ['', 'bg-[var(--ballot-red)]', 'bg-[var(--gold)]', 'bg-[var(--ballot-green)]']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched({ full_name: true, college_pin: true, email: true, password: true, confirm: true })

    if (Object.values(v).some(Boolean)) return
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          voter_id: form.college_pin,
        },
      },
    })
    setLoading(false)

    if (signUpError) { setError(signUpError.message); return }
    navigate('/verify-otp', { state: { email: form.email } })
  }

  return (
    <PageShell maxWidth="md">
      <Card padding="p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-xl mb-3" aria-hidden="true">📝</div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Create Voter Account</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Government Polytechnic, Dharmavaram</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Full Name"
            value={form.full_name}
            onChange={update('full_name')}
            onBlur={touch('full_name')}
            placeholder="As per college records"
            required
            error={v.full_name}
            autoComplete="name"
          />

          <FormField
            label="College PIN"
            value={form.college_pin}
            onChange={update('college_pin')}
            onBlur={touch('college_pin')}
            placeholder="e.g. 21001-C-001"
            required
            error={v.college_pin}
            hint="Your unique College PIN from the admission records"
          />

          <FormField
            label="Email Address"
            type="email"
            value={form.email}
            onChange={update('email')}
            onBlur={touch('email')}
            placeholder="student@gptdvm.in"
            required
            error={v.email}
            autoComplete="email"
          />

          <FormField
            label="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            onBlur={touch('password')}
            placeholder="Min. 8 characters"
            required
            error={v.password}
            autoComplete="new-password"
          />

          {/* Password strength bar */}
          {form.password.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((level) => (
                  <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-[var(--line)]'}`} />
                ))}
              </div>
              <span className="text-[11px] font-medium text-[var(--ink-soft)]">{strengthLabels[passwordStrength]}</span>
            </div>
          )}

          <FormField
            label="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={update('confirm')}
            onBlur={touch('confirm')}
            placeholder="Re-enter password"
            required
            error={v.confirm}
            autoComplete="new-password"
          />

          <Alert variant="error">{error}</Alert>

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Creating account…' : 'Register Account'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--line)] text-center">
          <p className="text-xs text-[var(--ink-soft)]">
            Already registered?{' '}
            <Link to="/login" className="text-[var(--gold)] font-bold hover:underline transition-colors">Log in here</Link>
          </p>
        </div>
      </Card>
    </PageShell>
  )
}
