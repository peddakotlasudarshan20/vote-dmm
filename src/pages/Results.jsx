import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../lib/api'
import { FullPageSpinner } from '../components/ProtectedRoute'

const COLORS = ['#B8862B', '#2E6350', '#4A5468', '#A83E33', '#7A6A9C', '#3B7A9A']

export default function Results() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.results(id).then(setData).catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="max-w-4xl mx-auto px-6 py-16 text-[var(--ballot-red)]">{error}</p>
  if (!data) return <FullPageSpinner />

  if (!data.published) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--gold-soft)] flex items-center justify-center text-2xl mb-6">📊</div>
        <h1 className="font-display text-2xl font-semibold mb-2">Results have not yet been published</h1>
        <p className="text-[var(--ink-soft)] mb-8">The admin will publish results once counting is complete.</p>
        <Link to="/dashboard" className="text-[var(--gold)] font-medium">← Back to elections</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <Link to="/dashboard" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← All elections</Link>
      <h1 className="font-display text-3xl font-semibold mt-4 mb-8">{data.election_name} — Results</h1>

      {data.winner && (
        <div className="bg-[var(--ink)] text-[var(--paper)] rounded-2xl p-8 mb-8 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center text-2xl shrink-0">🏆</div>
          <div>
            <p className="font-mono text-xs opacity-60 uppercase">Winner</p>
            <p className="font-display text-2xl font-semibold">{data.winner.name}</p>
            <p className="opacity-80 text-sm">{data.winner.party_name} · {data.winner.votes} votes ({data.winner.percentage}%)</p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <StatCard label="Total votes cast" value={data.total_votes} />
        <StatCard label="Voter turnout" value={`${data.turnout_percentage}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-xl p-6">
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
        </div>

        <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-xl p-6">
          <p className="font-medium mb-4">Vote share</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.rankings} dataKey="votes" nameKey="name" outerRadius={90}>
                {data.rankings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--paper)] text-[var(--ink-soft)] text-left">
            <tr><th className="p-3">Rank</th><th className="p-3">Candidate</th><th className="p-3">Party</th><th className="p-3 text-right">Votes</th><th className="p-3 text-right">%</th></tr>
          </thead>
          <tbody>
            {data.rankings.map((r, i) => (
              <tr key={r.candidate_id} className="border-t border-[var(--line)]">
                <td className="p-3 font-mono">{i + 1}</td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-[var(--ink-soft)]">{r.party_name}</td>
                <td className="p-3 text-right font-mono">{r.votes}</td>
                <td className="p-3 text-right font-mono">{r.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[var(--paper-raised)] border border-[var(--line)] rounded-xl p-6">
      <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)] mb-1">{label}</p>
      <p className="font-display text-3xl font-semibold">{value}</p>
    </div>
  )
}
