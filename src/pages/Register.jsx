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
    full_name: '', email: '', mobile: '', voter_id: '', password: '', confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }))

  /* Inline validation */
  const v = {
    full_name: touched.full_name && !form.full_name ? 'Full name is required' : '',
    email: touched.email && !form.email ? 'Email is required' :
           touched.email && !/\S+@\S+\.\S+/.test(form.email) ? 'Enter a valid email' : '',
    mobile: touched.mobile && !form.mobile ? 'Mobile number is required' :
            touched.mobile && form.mobile.length < 10 ? 'Enter a valid mobile number' : '',
    voter_id: touched.voter_id && !form.voter_id ? 'Student ID is required' : '',
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
    setTouched({ full_name: true, email: true, mobile: true, voter_id: true, password: true, confirm: true })

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
          mobile: form.mobile,
          voter_id: form.voter_id,
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
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-xl mb-3">📝</div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Create Voter Account</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Government Polytechnic, Dharmavaram</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-[10px] flex items-center justify-center font-bold">1</span>
              Personal Information
            </legend>
            <FormField label="Full Name" value={form.full_name} onChange={update('full_name')} onBlur={touch('full_name')} placeholder="e.g. Sudarshan Kumar" required error={v.full_name} autoComplete="name" />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Email Address" type="email" value={form.email} onChange={update('email')} onBlur={touch('email')} placeholder="e.g. student@gptdvm.in" required error={v.email} autoComplete="email" />
              <FormField label="Mobile Number" type="tel" value={form.mobile} onChange={update('mobile')} onBlur={touch('mobile')} placeholder="e.g. +91 9988776655" required error={v.mobile} autoComplete="tel" />
            </div>
            <FormField label="Student Admission No. / College ID" value={form.voter_id} onChange={update('voter_id')} onBlur={touch('voter_id')} placeholder="e.g. 21001-C-001" required error={v.voter_id} />
          </fieldset>

          {/* Security */}
          <fieldset className="space-y-4 pt-2">
            <legend className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-[10px] flex items-center justify-center font-bold">2</span>
              Account Security
            </legend>
            <FormField label="Password" type="password" value={form.password} onChange={update('password')} onBlur={touch('password')} placeholder="Min. 8 characters" required error={v.password} autoComplete="new-password" />

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

            <FormField label="Confirm Password" type="password" value={form.confirm} onChange={update('confirm')} onBlur={touch('confirm')} placeholder="Re-enter password" required error={v.confirm} autoComplete="new-password" />
          </fieldset>

          <Alert variant="error">{error}</Alert>

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Creating voter record…' : 'Register Account'}
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
