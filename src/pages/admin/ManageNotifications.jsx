import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/dateTime'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Dialog from '../../components/ui/Dialog'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'

export default function ManageNotifications() {
  const [notifs, setNotifs] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', message: '', type: 'info', pinned: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => api.adminListNotifications().then(setNotifs).catch(() => setNotifs([]))
  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', message: '', type: 'info', pinned: false })
    setEditing(null)
    setShowForm(false)
    setError('')
  }

  const openEdit = (n) => {
    setForm({ title: n.title, message: n.message, type: n.type || 'info', pinned: n.pinned || false })
    setEditing(n.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.message) { setError('Title and message are required'); return }
    setLoading(true)
    try {
      if (editing) {
        await api.updateNotification(editing, form)
      } else {
        await api.createNotification(form)
      }
      await load()
      resetForm()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await api.deleteNotification(deleteId)
    setDeleteId(null)
    await load()
  }

  const togglePin = async (n) => {
    await api.updateNotification(n.id, { pinned: !n.pinned })
    await load()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Notifications</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-0.5">{notifs ? `${notifs.length} total` : 'Loading…'}</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
          + Create notification
        </Button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <Card padding="p-5 sm:p-6" className="mb-6 animate-card-enter">
          <h2 className="font-medium text-sm mb-4">{editing ? 'Edit notification' : 'New notification'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Notification title" />
            <FormField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="Notification body text" />
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-xs font-medium text-[var(--ink-soft)]">
                Type:
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="ml-2 px-2 py-1 rounded-lg border border-[var(--line)] text-xs bg-[var(--paper)]"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-soft)] cursor-pointer">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="rounded" />
                Pin to top
              </label>
            </div>
            <Alert variant="error">{error}</Alert>
            <div className="flex gap-2">
              <Button type="submit" loading={loading} size="sm">
                {editing ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" size="sm" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      {!notifs && <SkeletonCard lines={3} />}

      {notifs && notifs.length === 0 && (
        <EmptyState icon="🔔" title="No notifications yet" description="Create your first notification to reach all students." />
      )}

      {notifs && notifs.length > 0 && (
        <div className="space-y-3">
          {notifs.map((n) => (
            <Card key={n.id} padding="p-4 sm:p-5" className={n.pinned ? 'border-l-4 border-l-[var(--gold)]' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[var(--ink)]">{n.title}</p>
                    <Badge status={n.type === 'success' ? 'approved' : n.type === 'warning' ? 'pending_approval' : undefined} variant="info" label={n.type} />
                    {n.pinned && <Badge variant="warning" label="📌 Pinned" />}
                  </div>
                  <p className="text-xs text-[var(--ink-soft)] mt-1">{n.message}</p>
                  <p className="text-[10px] text-[var(--ink-soft)] font-mono mt-2">{formatDateTime(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePin(n)} className="p-1.5 rounded-lg hover:bg-[var(--paper)] text-xs transition" title={n.pinned ? 'Unpin' : 'Pin'}>
                    📌
                  </button>
                  <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg hover:bg-[var(--paper)] text-xs transition" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => setDeleteId(n.id)} className="p-1.5 rounded-lg hover:bg-[var(--ballot-red-soft)] text-xs transition" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete notification?">
        <p className="text-sm text-[var(--ink-soft)] mb-6">This notification will be permanently removed for all users.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>
    </div>
  )
}
