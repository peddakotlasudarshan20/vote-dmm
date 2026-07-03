import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { formatDateRange, formatDateTime } from '../../lib/dateTime'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import FormField from '../../components/ui/FormField'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import { SkeletonCard } from '../../components/ui/Skeleton'

const EMPTY = { name: '', description: '', banner_url: '', start_time: '', end_time: '' }

export default function ManageElections() {
  const [elections, setElections] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

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
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await api.deleteElection(deleteId)
    setDeleteId(null)
    load()
  }

  const publish = async (id) => {
    await api.publishResults(id)
    load()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Elections</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-0.5">Configure timelines and publish results.</p>
      </div>

      <Card className="mb-6" padding="p-4 sm:p-6">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="font-bold text-sm text-[var(--ink)]">
            {editingId ? '✏️ Edit Election' : '➕ New Election'}
          </h2>

          <FormField label="Election Name" required placeholder="e.g. Student Council President 2026" value={form.name} onChange={update('name')} />
          <FormField label="Description" as="textarea" placeholder="Electoral rules" value={form.description} onChange={update('description')} rows={3} />
          <FormField label="Banner URL" placeholder="Banner image URL (optional)" value={form.banner_url} onChange={update('banner_url')} />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Start Date & Time" required type="datetime-local" value={form.start_time} onChange={update('start_time')} hint="IST (Asia/Kolkata)" />
            <FormField label="End Date & Time" required type="datetime-local" value={form.end_time} onChange={update('end_time')} hint="IST (Asia/Kolkata)" />
          </div>

          <Alert variant="error">{error}</Alert>

          <div className="flex gap-2">
            <Button type="submit" loading={saving} size="sm">
              {editingId ? 'Save Changes' : 'Create Election'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingId(null); setForm(EMPTY) }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {!elections && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      )}

      {elections && (
        <div className="space-y-3">
          {elections.map((e, i) => (
            <Card
              key={e.id}
              hoverable
              padding="p-4"
              className="animate-card-enter"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--ink)]">{e.name}</span>
                    <Badge status={e.status} />
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)] font-mono">
                    📅 {formatDateRange(e.start_time, e.end_time)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => edit(e)}>Edit</Button>
                  {e.status === 'completed' && !e.results_published && (
                    <Button size="sm" onClick={() => publish(e.id)}>Publish</Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(e.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete election?">
        <p className="text-sm text-[var(--ink-soft)] mb-6">This will permanently delete the election, its candidates, and all votes.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>
    </div>
  )
}
