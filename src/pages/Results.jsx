import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../lib/api'
import PageShell from '../components/ui/PageShell'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonCard, SkeletonStatGrid } from '../components/ui/Skeleton'

const COLORS = ['#B8862B', '#2E6350', '#4A5468', '#A83E33', '#7A6A9C', '#3B7A9A']

export default function Results() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.results(id).then(setData).catch((e) => setError(e.message))
  }, [id])

  if (error) return (
    <PageShell maxWidth="xl">
      <Alert variant="error">{error}</Alert>
    </PageShell>
  )

  if (!data) return (
    <PageShell maxWidth="xl">
      <div className="skeleton w-64 h-8 mb-8 rounded-lg" />
      <SkeletonStatGrid count={2} />
      <div className="grid md:grid-cols-2 gap-5 mt-5">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
      </div>
    </PageShell>
  )

  if (!data.published) {
    return (
      <PageShell maxWidth="md" center>
        <EmptyState
          icon="📊"
          title="Results have not yet been published"
          description="The admin will publish results once counting is complete."
        >
          <Link to="/dashboard" className="text-[var(--gold)] font-medium hover:underline">← Back to elections</Link>
        </EmptyState>
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="xl" backTo="/dashboard" backLabel="All elections">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-2 mb-8">{data.election_name} — Results</h1>

      {data.winner && (
        <Card className="mb-8 flex flex-col sm:flex-row items-center gap-6 animate-card-enter" padding="p-6 sm:p-8" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
          <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center text-2xl shrink-0" aria-hidden="true">🏆</div>
          <div>
            <p className="font-mono text-xs opacity-60 uppercase">Winner</p>
            <p className="font-display text-2xl font-semibold">{data.winner.name}</p>
            <p className="opacity-80 text-sm">{data.winner.party_name} · {data.winner.votes} votes ({data.winner.percentage}%)</p>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <StatCard label="Total votes cast" value={data.total_votes} />
        <StatCard label="Voter turnout" value={`${data.turnout_percentage}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <Card padding="p-5 sm:p-6">
          <p className="font-medium mb-4">Votes by candidate</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.rankings} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                {data.rankings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="p-5 sm:p-6">
          <p className="font-medium mb-4">Vote share</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.rankings} dataKey="votes" nameKey="name" outerRadius={90}>
                {data.rankings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Election results ranking">
            <thead className="bg-[var(--paper)] text-[var(--ink-soft)] text-left">
              <tr>
                <th scope="col" className="p-3 sm:p-4">Rank</th>
                <th scope="col" className="p-3 sm:p-4">Candidate</th>
                <th scope="col" className="p-3 sm:p-4 hidden sm:table-cell">Party</th>
                <th scope="col" className="p-3 sm:p-4 text-right">Votes</th>
                <th scope="col" className="p-3 sm:p-4 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {data.rankings.map((r, i) => (
                <tr key={r.candidate_id} className="border-t border-[var(--line)] hover:bg-[var(--paper)]/30 transition-colors">
                  <td className="p-3 sm:p-4 font-mono">{i + 1}</td>
                  <td className="p-3 sm:p-4 font-medium">{r.name}</td>
                  <td className="p-3 sm:p-4 text-[var(--ink-soft)] hidden sm:table-cell">{r.party_name}</td>
                  <td className="p-3 sm:p-4 text-right font-mono tabular-nums">{r.votes}</td>
                  <td className="p-3 sm:p-4 text-right font-mono tabular-nums">{r.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  )
}

function StatCard({ label, value }) {
  return (
    <Card padding="p-5 sm:p-6" className="animate-stat-pop">
      <p className="text-xs uppercase tracking-wider font-semibold text-[var(--ink-soft)] mb-1">{label}</p>
      <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
    </Card>
  )
}
