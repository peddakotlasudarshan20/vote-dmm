import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabaseClient'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import { SkeletonCard } from '../../components/ui/Skeleton'

const EMPTY = {
  election_id: '', name: '', party_name: '', photo_url: '', party_symbol_url: '',
  age: '', qualification: '', experience: '', biography: '', manifesto_url: '',
}

export default function ManageCandidates() {
  const [elections, setElections] = useState([])
  const [candidates, setCandidates] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

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
    setSaving(true)
    try {
      await api.addCandidate({ ...form, age: form.age ? Number(form.age) : null })
      setForm(EMPTY)
      loadCandidates()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await api.deleteCandidate(deleteId)
    setDeleteId(null)
    loadCandidates()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Candidates</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-0.5">Register nominees for active elections.</p>
      </div>

      <Card className="mb-6" padding="p-4 sm:p-6">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="font-bold text-sm text-[var(--ink)]">👤 Nominate Candidate</h2>

          <FormField label="Election" as="select" required value={form.election_id} onChange={update('election_id')}>
            <option value="">Select election…</option>
            {elections.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Name" value={form.name} onChange={update('name')} placeholder="Full name" required />
            <FormField label="Party" value={form.party_name} onChange={update('party_name')} placeholder="Independent" />
            <FormField label="Photo URL" value={form.photo_url} onChange={update('photo_url')} placeholder="Image link" />
            <FormField label="Age" type="number" value={form.age} onChange={update('age')} placeholder="Age" />
            <FormField label="Qualification" value={form.qualification} onChange={update('qualification')} placeholder="B.Tech 3rd Year" />
            <FormField label="Experience" value={form.experience} onChange={update('experience')} placeholder="Past roles" />
          </div>

          <FormField label="Biography" as="textarea" placeholder="Campaign message" value={form.biography} onChange={update('biography')} rows={3} />
          <FormField label="Manifesto URL" value={form.manifesto_url} onChange={update('manifesto_url')} placeholder="PDF link" />

          <Alert variant="error">{error}</Alert>

          <Button type="submit" loading={saving} size="sm">
            {saving ? 'Adding…' : 'Add Candidate'}
          </Button>
        </form>
      </Card>

      {!candidates && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      )}

      {candidates && (
        <div className="space-y-3">
          {candidates.map((c, i) => (
            <Card
              key={c.id}
              hoverable
              padding="p-3 sm:p-4"
              className="animate-card-enter"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--gold-soft)] flex items-center justify-center shrink-0 overflow-hidden">
                    {c.photo_url
                      ? <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                      : <span className="font-display font-bold text-sm text-[var(--gold)]">{c.name?.[0]}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--ink)] truncate">
                      {c.name} <span className="text-[var(--ink-soft)] font-normal">— {c.party_name || 'Independent'}</span>
                    </p>
                    <p className="text-[10px] text-[var(--gold)] font-mono uppercase font-semibold truncate">🎯 {c.elections?.name || '—'}</p>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(c.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove candidate?">
        <p className="text-sm text-[var(--ink-soft)] mb-6">This candidate will be permanently removed from the election.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Remove</Button>
        </div>
      </Dialog>
    </div>
  )
}
