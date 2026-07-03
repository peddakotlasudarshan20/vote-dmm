import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

/* ── SVG Icon Components ─────────────────────────────── */

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

/* ── NavLink with active indicator ───────────────────── */

function NavLink({ to, children, onClick, className = '' }) {
  const { pathname } = useLocation()
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to))

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`relative transition-colors duration-200 ${
        isActive
          ? 'nav-link-active text-[var(--ink)] font-medium'
          : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
      } ${className}`}
    >
      {children}
    </Link>
  )
}

/* ── Main Navbar ─────────────────────────────────────── */

export default function Navbar() {
  const { session, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [notifs, setNotifs] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const notifRef = useRef(null)
  const menuBtnRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const unread = notifs.filter((n) => !n.read).length

  /* ── Fetch notifications ──────────────────────────── */
  useEffect(() => {
    if (!session) return
    api.notifications().then(setNotifs).catch(() => {})
  }, [session])

  /* ── Close mobile menu on route change ────────────── */
  useEffect(() => {
    setMenuOpen(false)
    setNotifOpen(false)
  }, [location.pathname])

  /* ── Scroll shadow ────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Body scroll lock when mobile menu is open ────── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  /* ── Click-outside: close notification dropdown ───── */
  useEffect(() => {
    if (!notifOpen) return
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  /* ── Escape key handler ───────────────────────────── */
  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape') {
        if (notifOpen) setNotifOpen(false)
        if (menuOpen) setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [notifOpen, menuOpen])

  /* ── Handlers ─────────────────────────────────────── */
  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/')
  }, [signOut, navigate])

  const closeMobileMenu = useCallback(() => setMenuOpen(false), [])

  /* ── Shared nav links (used in both desktop & mobile) */
  const navLinks = (
    <>
      <NavLink to="/dashboard" onClick={closeMobileMenu}>
        Elections
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" onClick={closeMobileMenu}>
          Admin
        </NavLink>
      )}
    </>
  )

  /* ── Notification bell + dropdown ──────────────────── */
  const notificationBell = (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setNotifOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={notifOpen}
        aria-controls="notif-dropdown"
        className="relative w-9 h-9 flex items-center justify-center rounded-full
                   hover:bg-[var(--gold-soft)] transition-colors duration-200"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] leading-4
                           text-white bg-[var(--ballot-red)] rounded-full text-center
                           animate-pulse">
            {unread}
          </span>
        )}
      </button>
      {notifOpen && (
        <div
          id="notif-dropdown"
          role="menu"
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm
                     max-h-96 overflow-y-auto bg-[var(--paper-raised)]
                     border border-[var(--line)] rounded-xl shadow-lg p-2
                     md:w-80"
        >
          {notifs.length === 0 && (
            <p className="text-sm text-[var(--ink-soft)] p-4 text-center">
              No notifications yet.
            </p>
          )}
          {notifs.slice(0, 5).map((n) => (
            <div
              key={n.id}
              role="menuitem"
              className={`p-3 rounded-lg hover:bg-[var(--paper)]
                         border-b last:border-b-0 border-[var(--line)]
                         transition-colors duration-150 ${!n.read ? 'bg-[var(--gold-soft)]/30' : ''}`}
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5 line-clamp-1">{n.message}</p>
            </div>
          ))}
          <Link
            to="/notifications"
            onClick={() => setNotifOpen(false)}
            className="block text-center text-xs font-semibold text-[var(--gold)] py-2 mt-1 hover:underline"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  )

  /* ── Profile avatar ────────────────────────────────── */
  const profileAvatar = (
    <Link
      to="/profile"
      onClick={closeMobileMenu}
      aria-label="Your profile"
      className="w-9 h-9 rounded-full bg-[var(--ink)] text-[var(--paper)]
                 flex items-center justify-center text-xs font-semibold
                 hover:ring-2 hover:ring-[var(--gold)] hover:ring-offset-2
                 transition-all duration-200 shrink-0"
    >
      {profile?.full_name?.[0]?.toUpperCase() || '·'}
    </Link>
  )

  /* ── Sign-out button ───────────────────────────────── */
  const signOutBtn = (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-1.5 text-[var(--ink-soft)]
                 hover:text-[var(--ballot-red)] transition-colors duration-200"
    >
      <LogOutIcon />
      <span>Log out</span>
    </button>
  )

  return (
    <>
      {/* ── Skip to content (a11y) ────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50
                   focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--ink)] focus:text-[var(--paper)]
                   focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* ── Backdrop overlay (mobile) ─────────────────── */}
      <div
        className="mobile-backdrop md:hidden"
        data-open={menuOpen}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-40 bg-[var(--paper-raised)]/90 backdrop-blur-md
                     border-b border-[var(--line)] transition-shadow duration-300
                     ${scrolled ? 'navbar-scrolled' : 'shadow-none'}`}
      >
        {/* ── Top bar ──────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-semibold
                       text-[var(--ink)] hover:opacity-90 transition-opacity duration-200"
          >
            <span
              className="inline-block w-3.5 h-3.5 rounded-full bg-[var(--gold)]
                         border-2 border-white shadow-xs shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-tight text-[15px] sm:text-base">
                Government Polytechnic
              </span>
              <span className="text-[10px] sm:text-xs text-[var(--ink-soft)] font-sans
                               uppercase font-semibold tracking-wider">
                Dharmavaram · CloudVote
              </span>
            </div>
          </Link>

          {/* ── Desktop nav (≥ 768px) ──────────────────── */}
          <nav
            className="hidden md:flex items-center gap-5 text-sm"
            role="navigation"
            aria-label="Main navigation"
          >
            {session && (
              <>
                {navLinks}
                {notificationBell}
                {profileAvatar}
                {signOutBtn}
              </>
            )}
            {!session && (
              <>
                <NavLink to="/login">Log in</NavLink>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--paper)]
                             hover:bg-[var(--gold)] hover:-translate-y-0.5 active:translate-y-0
                             shadow-sm transition-all duration-200 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* ── Mobile controls (< 768px) ──────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {session && notificationBell}
            <button
              ref={menuBtnRef}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`w-10 h-10 flex flex-col items-center justify-center gap-[5px]
                          rounded-lg hover:bg-[var(--gold-soft)] transition-colors duration-200
                          ${menuOpen ? 'hamburger-open' : ''}`}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>

        {/* ── Mobile menu (< 768px) ──────────────────── */}
        <div
          id="mobile-menu"
          className="mobile-menu-wrap md:hidden border-t border-[var(--line)]"
          data-open={menuOpen}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="mobile-menu-inner" ref={mobileMenuRef}>
            <div className="px-4 py-3 space-y-1 bg-[var(--paper-raised)]">
              {session && (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="block py-3 px-3 rounded-lg text-sm hover:bg-[var(--paper)]
                               transition-colors duration-150"
                  >
                    Elections
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className="block py-3 px-3 rounded-lg text-sm hover:bg-[var(--paper)]
                               transition-colors duration-150"
                  >
                    Notifications
                    {unread > 0 && (
                      <span className="ml-1.5 text-[10px] font-bold text-white bg-[var(--ballot-red)] px-1.5 py-0.5 rounded-full">{unread}</span>
                    )}
                  </NavLink>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="block py-3 px-3 rounded-lg text-sm hover:bg-[var(--paper)]
                                 transition-colors duration-150"
                    >
                      Admin
                    </NavLink>
                  )}

                  <div className="border-t border-[var(--line)] my-2" />

                  {/* Profile row */}
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg
                               hover:bg-[var(--paper)] transition-colors duration-150"
                  >
                    <span
                      className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--paper)]
                                 flex items-center justify-center text-xs font-semibold shrink-0"
                    >
                      {profile?.full_name?.[0]?.toUpperCase() || '·'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--ink)] truncate">
                        {profile?.full_name || 'Your Profile'}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)]">View profile</p>
                    </div>
                  </Link>

                  <div className="border-t border-[var(--line)] my-2" />

                  {/* Log out */}
                  <button
                    onClick={() => { closeMobileMenu(); handleSignOut() }}
                    className="w-full flex items-center gap-2.5 py-3 px-3 rounded-lg text-sm
                               text-[var(--ballot-red)] hover:bg-[var(--ballot-red-soft)]
                               transition-colors duration-150"
                  >
                    <LogOutIcon />
                    Log out
                  </button>
                </>
              )}

              {!session && (
                <>
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block py-3 px-3 rounded-lg text-sm hover:bg-[var(--paper)]
                               transition-colors duration-150"
                  >
                    Log in
                  </NavLink>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block py-3 px-3 rounded-lg text-sm font-medium text-center
                               bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--gold)]
                               transition-colors duration-200 mt-2"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
