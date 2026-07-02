/**
 * Shared footer component.
 * Semantic HTML with accessibility.
 */

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--paper-raised)] py-6 text-center text-xs text-[var(--ink-soft)] w-full" role="contentinfo">
      <p>© {new Date().getFullYear()} Government Polytechnic, Dharmavaram. All rights reserved.</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider opacity-60">
        Secured with Cryptographic Verification
      </p>
    </footer>
  )
}
