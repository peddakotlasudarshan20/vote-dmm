/**
 * Reusable form field: input, textarea, or select.
 * Features: focus glow ring, error state, hint text, smooth transitions.
 */

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] focus:border-[var(--gold)] focus:bg-white outline-none text-sm text-[var(--ink)] form-field-focus'

const ERROR_INPUT =
  'border-[var(--ballot-red)] focus:border-[var(--ballot-red)]'

export default function FormField({
  label,
  as = 'input',
  error,
  hint,
  className = '',
  children,
  ...props
}) {
  const Tag = as

  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">
          {label}
        </span>
      )}
      {as === 'select' ? (
        <select
          className={`${INPUT_CLASS} ${error ? ERROR_INPUT : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
      ) : (
        <Tag
          className={`${INPUT_CLASS} ${error ? ERROR_INPUT : ''} ${className}`}
          {...props}
        />
      )}
      {error && (
        <span className="text-[11px] text-[var(--ballot-red)] font-medium">{error}</span>
      )}
      {hint && !error && (
        <span className="text-[11px] text-[var(--ink-soft)]">{hint}</span>
      )}
    </label>
  )
}

export { INPUT_CLASS }
