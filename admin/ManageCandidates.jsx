import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabaseClient'
import { FullPageSpinner } from '../../components/ProtectedRoute'

const EMPTY = {
  election_id: '', name: '', party_name: '', photo_url: '', party_symbol_url: '',
  age: '', qualification: '', experience: '', biography: '', manifesto_url: '',
}

export default function ManageCandidates() {
  const [elections, setElections] = useState([])
  const [candidates, setCandidates] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    api.listElections().then(setElections)
    loadCandidates()
  }, [])

  const loadCandidates = () => {
    supabase.from('candidates').select('*, elections(name)').order('created_at', { ascending: false })
      .then(({ data }) => setCandidates(data || []))
  }

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.addCandidate({ ...form, age: form.age ? Number(form.age) : null })
      setForm(EMPTY)
      loadCandidates()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Remove this candidate?')) return
    await api.deleteCandidate(id)
    loadCandidates()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition mb-6">
        ← Back to admin dashboard
      </Link>

      <div className="border-b border-[var(--line)] pb-4 mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mb-1">Candidate Registrar</h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)]">Register nominees and upload campaign platforms for active ballots.</p>
      </div>

      <form onSubmit={submit} className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-6 shadow-xs mb-8 space-y-4">
        <h2 className="font-bold text-lg text-[var(--ink)]">👤 Nominate New Candidate</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-1">Select Target Ballot</label>
            <select required value={form.election_id} onChange={update('election_id')} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm">
              <option value="">Select election…</option>
              {elections.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Candidate Name" value={form.name} onChange={update('name')} placeholder="e.g. John Doe" required />
            <Field label="Party Affiliation" value={form.party_name} onChange={update('party_name')} placeholder="e.g. Independent, Science Club" />
            <Field label="Photo URL" value={form.photo_url} onChange={update('photo_url')} placeholder="Image URL link" />
            <Field label="Party Symbol URL" value={form.party_symbol_url} onChange={update('party_symbol_url')} placeholder="Symbol URL link" />
            <Field label="Age" type="number" value={form.age} onChange={update('age')} placeholder="Nominee age" />
            <Field label="Academic Qualification" value={form.qualification} onChange={update('qualification')} placeholder="e.g. B.Tech 3rd Year" />
          </div>

          <Field label="Experience / Achievements" value={form.experience} onChange={update('experience')} placeholder="Brief summary of past leadership roles" />
          
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-1">Campaign Biography</label>
            <textarea placeholder="Tell students who you are and why they should vote for you" value={form.biography} onChange={update('biography')} rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]" />
          </div>

          <Field label="Manifesto PDF URL" value={form.manifesto_url} onChange={update('manifesto_url')} placeholder="Link to campaign document" />
        </div>

        {error && <p className="text-xs text-[var(--ballot-red)] font-medium bg-[var(--ballot-red-soft)] border border-[var(--ballot-red)]/10 px-3.5 py-2.5 rounded-xl">{error}</p>}
        
        <button className="px-5 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] font-semibold hover:bg-[var(--gold)] transition shadow-xs cursor-pointer pt-2">
          Add Candidate Nominee
        </button>
      </form>

      {!candidates && <FullPageSpinner />}
      <div className="space-y-4">
        {candidates?.map((c) => (
          <div key={c.id} className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover">
            <div>
              <p className="font-semibold text-base sm:text-lg text-[var(--ink)]">
                {c.name} <span className="text-[var(--ink-soft)] font-normal">— {c.party_name || 'Independent'}</span>
              </p>
              <p className="text-xs text-[var(--gold)] font-mono uppercase font-semibold mt-1">🎯 {c.elections?.name || 'Loading election...'}</p>
            </div>
            <button
              onClick={() => remove(c.id)}
              className="px-3.5 py-2 rounded-lg border border-[var(--ballot-red)] text-[var(--ballot-red)] text-xs font-semibold hover:bg-[var(--ballot-red-soft)] transition shrink-0 cursor-pointer"
            >
              Remove Candidate
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">{label}</span>
      <input {...props} className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]" />
    </label>
  )
}
