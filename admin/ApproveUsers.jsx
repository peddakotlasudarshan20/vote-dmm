import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import StatusBadge from '../../components/StatusBadge'
import { FullPageSpinner } from '../../components/ProtectedRoute'

export default function ApproveUsers() {
  const [users, setUsers] = useState(null)
  const [filter, setFilter] = useState('pending_approval')

  const load = () => api.adminListUsers(filter === 'all' ? undefined : filter).then(setUsers)

  useEffect(() => { setUsers(null); load() }, [filter])

  const act = async (fn, id) => {
    await fn(id)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition mb-6">
        ← Back to admin dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">Voter Approvals</h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)]">Review and authorize student voting registrations.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-[var(--line)]/40 p-1 rounded-xl">
          {['pending_approval', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${filter === f ? 'bg-[var(--ink)] text-[var(--paper-raised)] shadow-xs' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {!users && <FullPageSpinner />}
      {users && users.length === 0 && (
        <div className="text-center py-16 bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl shadow-xs">
          <span className="text-3xl mb-2 block">📋</span>
          <p className="text-sm font-medium text-[var(--ink)]">No students found in this category.</p>
        </div>
      )}

      {users && users.length > 0 && (
        <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-[var(--line)]">
            {users.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-[var(--paper)]/25 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-[var(--ink)]">{u.full_name}</span>
                    <StatusBadge status={u.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--ink-soft)] font-mono">
                    <span>📧 {u.email}</span>
                    <span>📞 {u.mobile}</span>
                    <span className="bg-[var(--line)]/50 px-1.5 py-0.5 rounded">ID: {u.voter_id}</span>
                  </div>
                </div>
                {u.status === 'pending_approval' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => act(api.approveUser, u.id)}
                      className="px-4 py-2 rounded-lg bg-[var(--ballot-green)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition cursor-pointer shadow-xs"
                    >
                      Approve Student
                    </button>
                    <button
                      onClick={() => act(api.rejectUser, u.id)}
                      className="px-4 py-2 rounded-lg border border-[var(--ballot-red)] text-[var(--ballot-red)] text-xs font-semibold hover:bg-[var(--ballot-red-soft)] active:scale-95 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
