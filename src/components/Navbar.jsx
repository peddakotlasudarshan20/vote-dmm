import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Navbar() {
  const { session, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!session) return
    api.notifications().then(setNotifs).catch(() => {})
  }, [session])

  const unread = notifs.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-40 bg-[var(--paper-raised)]/90 backdrop-blur-md border-b border-[var(--line)] shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-17 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-[var(--ink)] hover:opacity-90 transition">
          <span className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--gold)] border-2 border-white shadow-xs shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight text-[15px] sm:text-base">Government Polytechnic</span>
            <span className="text-[10px] sm:text-xs text-[var(--ink-soft)] font-sans uppercase font-semibold tracking-wider">Dharmavaram · CloudVote</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {session && (
            <>
              <Link to="/dashboard" className="text-[var(--ink-soft)] hover:text-[var(--ink)]">Elections</Link>
              {isAdmin && (
                <Link to="/admin" className="text-[var(--ink-soft)] hover:text-[var(--ink)]">Admin</Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label="Notifications"
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--gold-soft)] transition"
                >
                  🔔
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] leading-4 text-white bg-[var(--ballot-red)] rounded-full text-center">
                      {unread}
                    </span>
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[var(--paper-raised)] border border-[var(--line)] rounded-xl shadow-lg p-2">
                    {notifs.length === 0 && (
                      <p className="text-sm text-[var(--ink-soft)] p-4 text-center">No notifications yet.</p>
                    )}
                    {notifs.map((n) => (
                      <div key={n.id} className="p-3 rounded-lg hover:bg-[var(--paper)] border-b last:border-b-0 border-[var(--line)]">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-[var(--ink-soft)] mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/profile" className="w-9 h-9 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center text-xs font-semibold">
                {profile?.full_name?.[0]?.toUpperCase() || '·'}
              </Link>

              <button
                onClick={async () => { await signOut(); navigate('/') }}
                className="text-[var(--ink-soft)] hover:text-[var(--ballot-red)]"
              >
                Log out
              </button>
            </>
          )}

          {!session && (
            <>
              <Link to="/login" className="text-[var(--ink-soft)] hover:text-[var(--ink)]">Log in</Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
