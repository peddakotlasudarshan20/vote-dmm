import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
    navigate('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-8">
          <span className="text-2xl mb-1 block">🔐</span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Portal Authentication</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Government Polytechnic, Dharmavaram</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Email Address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. voter@gptdvm.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]"
            />
          </label>

          {error && (
            <p className="text-xs text-[var(--ballot-red)] bg-[var(--ballot-red-soft)] rounded-lg px-3.5 py-2.5 font-medium border border-[var(--ballot-red)]/10">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] font-semibold hover:bg-[var(--gold)] hover:-translate-y-0.5 active:translate-y-0 shadow-xs transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? 'Authenticating account…' : 'Log In'}
          </button>
        </form>

        <p className="text-xs text-[var(--ink-soft)] mt-6 text-center">
          New student voter? <Link to="/register" className="text-[var(--gold)] font-bold hover:underline">Register account</Link>
        </p>
      </div>
    </div>
  )
}
