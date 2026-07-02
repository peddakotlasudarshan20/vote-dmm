import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', mobile: '', voter_id: '', password: '', confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

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

    if (signUpError) {
      setError(signUpError.message)
      return
    }
    navigate('/verify-otp', { state: { email: form.email } })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <span className="text-2xl mb-1 block">📝</span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Create Voter Account</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Government Polytechnic, Dharmavaram</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" value={form.full_name} onChange={update('full_name')} placeholder="e.g. Sudarshan Kumar" required />
          <Field label="Email Address" type="email" value={form.email} onChange={update('email')} placeholder="e.g. student@gptdvm.in" required />
          <Field label="Mobile Number" type="tel" value={form.mobile} onChange={update('mobile')} placeholder="e.g. +91 9988776655" required />
          <Field label="Student Admission No. / College ID" value={form.voter_id} onChange={update('voter_id')} placeholder="e.g. 21001-C-001" required />
          <Field label="Password" type="password" value={form.password} onChange={update('password')} placeholder="Min. 8 characters" required />
          <Field label="Confirm Password" type="password" value={form.confirm} onChange={update('confirm')} placeholder="Re-enter password" required />

          {error && (
            <p className="text-xs text-[var(--ballot-red)] bg-[var(--ballot-red-soft)] rounded-lg px-3.5 py-2.5 font-medium border border-[var(--ballot-red)]/10">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] font-semibold hover:bg-[var(--gold)] hover:-translate-y-0.5 active:translate-y-0 shadow-xs transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? 'Creating voter record…' : 'Register Account'}
          </button>
        </form>

        <p className="text-xs text-[var(--ink-soft)] mt-6 text-center">
          Already registered? <Link to="/login" className="text-[var(--gold)] font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">{label}</span>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]"
      />
    </label>
  )
}
