import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { FullPageSpinner } from '../../components/ProtectedRoute'

const STAT_CONFIG = {
  registered_users: { label: 'Registered Students', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '👥' },
  pending_approvals: { label: 'Awaiting Review', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: '⏳' },
  approved_users: { label: 'Approved Voters', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', icon: '✅' },
  elections: { label: 'Total Elections', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: '🗳️' },
  candidates: { label: 'Nominated Candidates', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: '👤' },
  votes_cast: { label: 'Ballots Cast', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: '📥' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.dashboardStats().then(setStats) }, [])

  if (!stats) return <FullPageSpinner />

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="border-b border-[var(--line)] pb-4 mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] mb-1">Administrative Center</h1>
        <p className="text-sm text-[var(--ink-soft)]">Manage student voter registrations, list/create elections, and oversee ballots counts.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-10">
        {Object.entries(STAT_CONFIG).map(([key, config]) => {
          const value = stats[key] ?? 0
          const hasAlert = key === 'pending_approvals' && value > 0

          return (
            <div
              key={key}
              className={`bg-[var(--paper-raised)] border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${hasAlert ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/10 animate-[pulse_3s_infinite]' : 'border-[var(--line)]'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-[var(--ink-soft)] tracking-tight uppercase">{config.label}</span>
                <span className={`text-lg p-2 rounded-xl border ${config.color}`}>{config.icon}</span>
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)]">{value}</p>
              {hasAlert && (
                <span className="absolute bottom-2 right-4 text-[10px] font-semibold text-[var(--gold)] font-mono animate-bounce">ACTION NEEDED</span>
              )}
            </div>
          )
        })}
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] mb-4">Management Modules</h2>
      <div className="grid sm:grid-cols-3 gap-5">
        <AdminLink
          to="/admin/approvals"
          title="Voter Approvals"
          desc="Verify and approve student registrations to grant ballot voting rights."
          icon="🛡️"
        />
        <AdminLink
          to="/admin/elections"
          title="Election Editor"
          desc="Create and edit election timelines, configure banners, and publish live results."
          icon="⚙️"
        />
        <AdminLink
          to="/admin/candidates"
          title="Candidate Registrar"
          desc="Manage nominee profiles, campaign biographies, and manifesto upload links."
          icon="📝"
        />
      </div>
    </div>
  )
}

function AdminLink({ to, title, desc, icon }) {
  return (
    <Link
      to={to}
      className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-6 hover:border-[var(--gold)] transition-all flex flex-col justify-between shadow-xs card-hover"
    >
      <div>
        <div className="text-2xl mb-4 bg-[var(--paper)] w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--line)]/50">{icon}</div>
        <h3 className="font-bold text-base sm:text-lg text-[var(--ink)] mb-1">{title}</h3>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed">{desc}</p>
      </div>
      <div className="mt-4 text-xs font-semibold text-[var(--gold)] flex items-center gap-1">
        Configure Module →
      </div>
    </Link>
  )
}
export { AdminLink }
