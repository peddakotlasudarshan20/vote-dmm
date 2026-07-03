import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { session } = useAuth()

  return (
    <div className="overflow-hidden">
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-24 grid md:grid-cols-2 gap-8 sm:gap-12 items-center w-full"
        aria-labelledby="hero-heading"
      >
        <div className="space-y-5 sm:space-y-6 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold-soft)] text-[var(--gold)] text-[11px] font-mono font-semibold uppercase tracking-wider">
            🏛️ Official Voting Portal
          </div>
          <h1 id="hero-heading" className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-bold text-[var(--ink)] break-words">
            Government Polytechnic,<br />
            <span className="text-[var(--ballot-green)]">Dharmavaram</span>
          </h1>
          <p className="text-[var(--ink-soft)] text-sm sm:text-base md:text-lg max-w-lg leading-relaxed">
            CloudVote ensures fully verified registrations, one-vote enforcement per student, and transparent real-time results.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
            <Link
              to={session ? '/dashboard' : '/register'}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] font-medium hover:bg-[var(--gold)] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition text-center text-sm sm:text-base"
            >
              {session ? 'Go to elections' : 'Register to vote'}
            </Link>
            <Link
              to="/login"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl border border-[var(--line)] font-medium hover:border-[var(--ink)] hover:bg-white transition text-center text-sm sm:text-base"
            >
              Log in to account
            </Link>
          </div>
        </div>

        <aside className="stub-edge bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm relative overflow-hidden card-hover" aria-label="How voting works">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--gold-soft)] rounded-full -mr-8 -mt-8 opacity-40 blur-xl" aria-hidden="true" />
          <p className="font-mono text-[10px] sm:text-xs text-[var(--ink-soft)] font-semibold uppercase tracking-wider mb-5 sm:mb-6">4 Steps to Cast Your Ballot</p>
          <ol className="space-y-4 sm:space-y-6">
            {[
              ['Account Signup', 'Enter your name, email, College PIN, and password — verified via OTP.'],
              ['Instant Verification', 'Your College PIN is auto-verified against the authorized student list.'],
              ['Secure Voting', 'Browse active elections, view candidate profiles, and cast your secret ballot.'],
              ['Published Results', 'Once counting ends, view interactive vote count charts instantly.']
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-3 sm:gap-4">
                <span className="flex items-center justify-center font-display text-sm sm:text-base font-bold text-[var(--gold)] bg-[var(--gold-soft)] w-7 h-7 rounded-lg shrink-0" aria-hidden="true">{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--ink)] text-sm">{title}</p>
                  <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

    </div>
  )
}
