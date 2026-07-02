import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import PageShell from '../../components/ui/PageShell'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { SkeletonStatGrid } from '../../components/ui/Skeleton'

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

  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Administrative Center"
        subtitle="Manage student voter registrations, list/create elections, and oversee ballots counts."
      />

      {/* Skeleton while loading */}
      {!stats && <SkeletonStatGrid count={6} />}

      {/* Stat cards with staggered pop-in animation */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-8">
          {Object.entries(STAT_CONFIG).map(([key, config], i) => {
            const value = stats[key] ?? 0
            const hasAlert = key === 'pending_approvals' && value > 0

            return (
              <Card
                key={key}
                hoverable
                padding="p-5"
                className={`animate-stat-pop relative overflow-hidden ${hasAlert ? 'border-[var(--gold)] ring-2 ring-[var(--gold)]/10' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-semibold text-[var(--ink-soft)] tracking-tight uppercase leading-tight">{config.label}</span>
                  <span className={`text-lg p-2 rounded-xl border ${config.color} transition-transform hover:scale-110`}>{config.icon}</span>
                </div>
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tabular-nums">{value.toLocaleString()}</p>
                {hasAlert && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                    <span className="text-[10px] font-semibold text-[var(--gold)] font-mono uppercase">Action Needed</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {stats && (
        <>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--ink)] mb-4">Management Modules</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <AdminLink
              to="/admin/approvals"
              title="Voter Approvals"
              desc="Verify and approve student registrations to grant ballot voting rights."
              icon="🛡️"
              count={stats.pending_approvals}
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
        </>
      )}
    </PageShell>
  )
}

function AdminLink({ to, title, desc, icon, count }) {
  return (
    <Link
      to={to}
      className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 hover:border-[var(--gold)] transition-all flex flex-col justify-between shadow-xs card-hover group"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-2xl bg-[var(--paper)] w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--line)]/50 group-hover:scale-110 transition-transform">{icon}</div>
          {count > 0 && (
            <span className="text-[10px] font-bold text-white bg-[var(--gold)] px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        <h3 className="font-bold text-base sm:text-lg text-[var(--ink)] mb-1">{title}</h3>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed">{desc}</p>
      </div>
      <div className="mt-4 text-xs font-semibold text-[var(--gold)] flex items-center gap-1 group-hover:gap-2 transition-all">
        Configure Module <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  )
}
export { AdminLink }
