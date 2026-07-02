import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import { FullPageSpinner } from '../../components/ProtectedRoute'

const EMPTY = { name: '', description: '', banner_url: '', start_time: '', end_time: '' }

export default function ManageElections() {
  const [elections, setElections] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => api.listElections().then(setElections)
  useEffect(() => { load() }, [])

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) await api.updateElection(editingId, form)
      else await api.createElection(form)
      setForm(EMPTY)
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const edit = (el) => {
    setEditingId(el.id)
    setForm({
      name: el.name, description: el.description || '', banner_url: el.banner_url || '',
      start_time: el.start_time.slice(0, 16), end_time: el.end_time.slice(0, 16),
    })
  }

  const remove = async (id) => {
    if (!confirm('Delete this election? This also removes its candidates and votes.')) return
    await api.deleteElection(id)
    load()
  }

  const publish = async (id) => {
    await api.publishResults(id)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition mb-6">
        ← Back to admin dashboard
      </Link>

      <div className="border-b border-[var(--line)] pb-4 mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mb-1">Elections Editor</h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)]">Configure timelines, announcements, and results publishing.</p>
      </div>

      <form onSubmit={submit} className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-6 shadow-xs mb-8 space-y-4">
        <h2 className="font-bold text-lg text-[var(--ink)]">{editingId ? '✏️ Edit Election Parameters' : '➕ Create New Election'}</h2>
        
        <div className="space-y-3">
          <input
            required
            placeholder="Election Name (e.g. Student Council President 2026)"
            value={form.name}
            onChange={update('name')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]"
          />
          <textarea
            placeholder="Electoral Description & Rules"
            value={form.description}
            onChange={update('description')}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]"
          />
          <input
            placeholder="Banner Image URL (optional)"
            value={form.banner_url}
            onChange={update('banner_url')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm text-[var(--ink)]"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider space-y-1">
              Start Date & Time
              <input
                required
                type="datetime-local"
                value={form.start_time}
                onChange={update('start_time')}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm font-sans"
              />
            </label>
            <label className="block text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider space-y-1">
              End Date & Time
              <input
                required
                type="datetime-local"
                value={form.end_time}
                onChange={update('end_time')}
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none transition text-sm font-sans"
              />
            </label>
          </div>
        </div>

        {error && <p className="text-xs text-[var(--ballot-red)] font-medium bg-[var(--ballot-red-soft)] border border-[var(--ballot-red)]/10 px-3.5 py-2.5 rounded-xl">{error}</p>}
        
        <div className="flex gap-2 pt-2">
          <button className="px-5 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] font-semibold hover:bg-[var(--gold)] transition shadow-xs cursor-pointer">
            {editingId ? 'Save Changes' : 'Create Election'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(EMPTY) }}
              className="px-5 py-2.5 rounded-xl border border-[var(--line)] font-semibold hover:bg-[var(--paper)] transition cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {!elections && <FullPageSpinner />}
      <div className="space-y-4">
        {elections?.map((e) => (
          <div key={e.id} className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-semibold text-base sm:text-lg text-[var(--ink)]">{e.name}</span>
                <StatusBadge status={e.status} />
              </div>
              <p className="text-xs text-[var(--ink-soft)] font-mono">
                📅 {new Date(e.start_time).toLocaleString()} – {new Date(e.end_time).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => edit(e)}
                className="px-3.5 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--ink)] text-xs font-semibold transition cursor-pointer"
              >
                Edit
              </button>
              {e.status === 'completed' && !e.results_published && (
                <button
                  onClick={() => publish(e.id)}
                  className="px-3.5 py-2 rounded-lg bg-[var(--gold)] text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                  Publish Results
                </button>
              )}
              <button
                onClick={() => remove(e.id)}
                className="px-3.5 py-2 rounded-lg border border-[var(--ballot-red)] text-[var(--ballot-red)] text-xs font-semibold hover:bg-[var(--ballot-red-soft)] transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
