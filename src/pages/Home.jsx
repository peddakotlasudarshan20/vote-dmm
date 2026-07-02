import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { session } = useAuth()

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col justify-between">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center w-full">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--gold-soft)] text-[var(--gold)] text-xs font-mono font-semibold uppercase tracking-wider">
            🏛️ Official Voting Portal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] font-bold text-[var(--ink)]">
            Government Polytechnic,<br />
            <span className="text-[var(--ballot-green)]">Dharmavaram</span>
          </h1>
          <p className="text-[var(--ink-soft)] text-base sm:text-lg max-w-lg leading-relaxed">
            Welcome to our student election portal. CloudVote ensures fully verified registrations, one-vote enforcement per student, and transparent, real-time results the moment the admin publishes them.
          </p>
          <div className="flex flex-wrap gap-3.5 pt-2">
            <Link
              to={session ? '/dashboard' : '/register'}
              className="px-6 py-3.5 rounded-xl bg-[var(--ink)] text-[var(--paper-raised)] font-medium hover:bg-[var(--gold)] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition"
            >
              {session ? 'Go to elections' : 'Register to vote'}
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl border border-[var(--line)] font-medium hover:border-[var(--ink)] hover:bg-white transition"
            >
              Log in to account
            </Link>
          </div>
        </div>

        <div className="stub-edge bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl p-8 shadow-sm relative overflow-hidden card-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--gold-soft)] rounded-full -mr-8 -mt-8 opacity-40 blur-xl" />
          <p className="font-mono text-xs text-[var(--ink-soft)] font-semibold uppercase tracking-wider mb-6">4 Steps to Cast Your Ballot</p>
          <ol className="space-y-6">
            {[
              ['Account Signup', 'Submit your name, email, and Admission/Student ID — verified instantly via OTP.'],
              ['Admin Verification', 'Your profile details are reviewed and approved by college administrators.'],
              ['Secure Voting', 'Browse active elections, view candidate profiles, and submit your secret ballot.'],
              ['Published Results', 'Once counting ends, view beautiful interactive vote count charts instantly.']
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex items-center justify-center font-display text-base font-bold text-[var(--gold)] bg-[var(--gold-soft)] w-7 h-7 rounded-lg shrink-0">{i + 1}</span>
                <div>
                  <p className="font-semibold text-[var(--ink)] text-sm sm:text-base">{title}</p>
                  <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-[var(--paper-raised)] py-6 text-center text-xs text-[var(--ink-soft)] w-full">
        <p>© 2026 Government Polytechnic, Dharmavaram. All rights reserved.</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider opacity-60">Secured with Cryptographic Verification</p>
      </footer>
    </div>
  )
}
