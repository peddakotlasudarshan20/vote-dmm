import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import PageShell from '../../components/ui/PageShell'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import { SkeletonCard } from '../../components/ui/Skeleton'

const EMPTY = { name: '', description: '', banner_url: '', start_time: '', end_time: '' }

export default function ManageElections() {
  const [elections, setElections] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.listElections().then(setElections)
  useEffect(() => { load() }, [])

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingId) await api.updateElection(editingId, form)
      else await api.createElection(form)
      setForm(EMPTY)
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const edit = (el) => {
    setEditingId(el.id)
    setForm({
      name: el.name, description: el.description || '', banner_url: el.banner_url || '',
      start_time: el.start_time.slice(0, 16), end_time: el.end_time.slice(0, 16),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <PageShell maxWidth="xl" backTo="/admin" backLabel="Back to admin dashboard">
      <PageHeader
        title="Elections Editor"
        subtitle="Configure timelines, announcements, and results publishing."
      />

      <Card className="mb-8">
        <form onSubmit={submit} className="space-y-5">
          <h2 className="font-bold text-lg text-[var(--ink)] flex items-center gap-2">
            {editingId ? '✏️ Edit Election' : '➕ New Election'}
          </h2>

          <div className="space-y-4">
            <FormField
              label="Election Name"
              required
              placeholder="e.g. Student Council President 2026"
              value={form.name}
              onChange={update('name')}
            />
            <FormField
              label="Description & Rules"
              as="textarea"
              placeholder="Electoral Description & Rules"
              value={form.description}
              onChange={update('description')}
              rows={3}
            />
            <FormField
              label="Banner Image URL"
              placeholder="Banner Image URL (optional)"
              value={form.banner_url}
              onChange={update('banner_url')}
              hint="Paste a public URL for the election banner"
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField
                label="Start Date & Time"
                required
                type="datetime-local"
                value={form.start_time}
                onChange={update('start_time')}
                className="font-sans"
              />
              <FormField
                label="End Date & Time"
                required
                type="datetime-local"
                value={form.end_time}
                onChange={update('end_time')}
                className="font-sans"
              />
            </div>
          </div>

          <Alert variant="error">{error}</Alert>

          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={saving}>
              {editingId ? 'Save Changes' : 'Create Election'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setEditingId(null); setForm(EMPTY) }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {!elections && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      )}

      {elections && (
        <div className="space-y-4">
          {elections.map((e, i) => (
            <Card
              key={e.id}
              hoverable
              padding="p-5"
              className="animate-card-enter flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ animationDelay: `${i * 50}ms` }}
            >
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
                <Button variant="secondary" size="sm" onClick={() => edit(e)}>Edit</Button>
                {e.status === 'completed' && !e.results_published && (
                  <Button variant="gold" size="sm" onClick={() => publish(e.id)}>Publish Results</Button>
                )}
                <Button variant="danger" size="sm" onClick={() => remove(e.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
