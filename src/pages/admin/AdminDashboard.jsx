import { useEffect, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import Card from '../../components/ui/Card'
import { SkeletonStatGrid } from '../../components/ui/Skeleton'

const STAT_CONFIG = {
  registered_users: { label: 'Registered Students', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '👥' },
  approved_users: { label: 'Approved Voters', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20', icon: '✅' },
  elections: { label: 'Total Elections', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: '🗳️' },
  candidates: { label: 'Nominated Candidates', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: '👤' },
  votes_cast: { label: 'Ballots Cast', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: '📥' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.dashboardStats().then(setStats) }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">Dashboard</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">Manage elections, voters, and ballots.</p>
      </div>

      {/* Skeleton while loading */}
      {!stats && <SkeletonStatGrid count={5} />}

      {/* Stat cards with staggered pop-in animation */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(STAT_CONFIG).map(([key, config], i) => {
            const value = stats[key] ?? 0
            return (
              <Card
                key={key}
                hoverable
                padding="p-4 sm:p-5"
                className="animate-stat-pop relative overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--ink-soft)] tracking-tight uppercase leading-tight">{config.label}</span>
                  <span className={`text-base sm:text-lg p-1.5 sm:p-2 rounded-xl border ${config.color}`} aria-hidden="true">{config.icon}</span>
                </div>
                <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--ink)] tabular-nums">{value.toLocaleString()}</p>
              </Card>
            )
          })}
        </div>
      )}

      {stats && (
        <>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)] mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminLink
              to="/admin/elections"
              title="Elections"
              desc="Create and manage election timelines."
              icon="⚙️"
            />
            <AdminLink
              to="/admin/candidates"
              title="Candidates"
              desc="Manage nominee profiles and bios."
              icon="📝"
            />
            <AdminLink
              to="/admin/notifications"
              title="Notifications"
              desc="Send announcements to all students."
              icon="🔔"
            />
          </div>
        </>
      )}
    </div>
  )
}

const AdminLink = memo(function AdminLink({ to, title, desc, icon }) {
  return (
    <Link
      to={to}
      className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-4 sm:p-5 hover:border-[var(--gold)] transition-all flex flex-col justify-between shadow-xs card-hover group"
    >
      <div>
        <div className="text-xl bg-[var(--paper)] w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--line)]/50 group-hover:scale-110 transition-transform mb-3" aria-hidden="true">{icon}</div>
        <h3 className="font-bold text-sm sm:text-base text-[var(--ink)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--ink-soft)] leading-relaxed">{desc}</p>
      </div>
      <div className="mt-3 text-xs font-semibold text-[var(--gold)] flex items-center gap-1 group-hover:gap-2 transition-all">
        Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  )
})
