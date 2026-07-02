import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabaseClient'
import PageShell from '../../components/ui/PageShell'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
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

  const remove = async (id) => {
    if (!confirm('Remove this candidate?')) return
    await api.deleteCandidate(id)
    loadCandidates()
  }

  return (
    <PageShell maxWidth="xl" backTo="/admin" backLabel="Back to admin dashboard">
      <PageHeader
        title="Candidate Registrar"
        subtitle="Register nominees and upload campaign platforms for active ballots."
      />

      <Card className="mb-8">
        <form onSubmit={submit} className="space-y-5">
          <h2 className="font-bold text-lg text-[var(--ink)]">👤 Nominate New Candidate</h2>

          <div className="space-y-4">
            <FormField
              label="Select Target Ballot"
              as="select"
              required
              value={form.election_id}
              onChange={update('election_id')}
            >
              <option value="">Select election…</option>
              {elections.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </FormField>

            <div className="grid sm:grid-cols-2 gap-5">
              <FormField label="Candidate Name" value={form.name} onChange={update('name')} placeholder="e.g. John Doe" required />
              <FormField label="Party Affiliation" value={form.party_name} onChange={update('party_name')} placeholder="e.g. Independent" />
              <FormField label="Photo URL" value={form.photo_url} onChange={update('photo_url')} placeholder="Image URL link" hint="Direct link to candidate photo" />
              <FormField label="Party Symbol URL" value={form.party_symbol_url} onChange={update('party_symbol_url')} placeholder="Symbol URL link" />
              <FormField label="Age" type="number" value={form.age} onChange={update('age')} placeholder="Nominee age" />
              <FormField label="Academic Qualification" value={form.qualification} onChange={update('qualification')} placeholder="e.g. B.Tech 3rd Year" />
            </div>

            <FormField label="Experience / Achievements" value={form.experience} onChange={update('experience')} placeholder="Brief summary of past leadership roles" />

            <FormField
              label="Campaign Biography"
              as="textarea"
              placeholder="Tell students who you are and why they should vote for you"
              value={form.biography}
              onChange={update('biography')}
              rows={3}
            />

            <FormField label="Manifesto PDF URL" value={form.manifesto_url} onChange={update('manifesto_url')} placeholder="Link to campaign document" hint="Upload to a hosting service and paste the URL" />
          </div>

          <Alert variant="error">{error}</Alert>

          <Button type="submit" loading={saving}>
            {saving ? 'Adding…' : 'Add Candidate Nominee'}
          </Button>
        </form>
      </Card>

      {!candidates && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      )}

      {candidates && (
        <div className="space-y-4">
          {candidates.map((c, i) => (
            <Card
              key={c.id}
              hoverable
              padding="p-5"
              className="animate-card-enter flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--gold-soft)] flex items-center justify-center shrink-0 overflow-hidden">
                  {c.photo_url
                    ? <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                    : <span className="font-display font-bold text-[var(--gold)]">{c.name?.[0]}</span>}
                </div>
                <div>
                  <p className="font-semibold text-base text-[var(--ink)]">
                    {c.name} <span className="text-[var(--ink-soft)] font-normal text-sm">— {c.party_name || 'Independent'}</span>
                  </p>
                  <p className="text-xs text-[var(--gold)] font-mono uppercase font-semibold mt-0.5">🎯 {c.elections?.name || 'Loading...'}</p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => remove(c.id)}>
                Remove
              </Button>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
