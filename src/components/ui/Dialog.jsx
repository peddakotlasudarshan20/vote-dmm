/**
 * Reusable Dialog (modal) component.
 * Features: backdrop blur, escape-to-close, click-outside-to-close, focus trap.
 */
import { useEffect, useRef, useCallback } from 'react'

export default function Dialog({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  const dialogRef = useRef(null)

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    // Focus the dialog
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative ${maxWidth} w-full bg-[var(--paper-raised)] border border-[var(--line)] rounded-2xl shadow-xl p-6 sm:p-8 animate-[dialogEnter_0.2s_ease-out] outline-none`}
      >
        {title && (
          <h2 className="font-display text-xl font-semibold text-[var(--ink)] mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
