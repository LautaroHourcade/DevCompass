import { CONTROL_CLASSES, INVALID_CONTROL_CLASSES, LABEL_CLASSES } from './formStyles'

/**
 * Campo de texto con etiqueta, ayuda y error accesibles.
 * onChange recibe directamente el valor (no el evento).
 * multiline: true usa un <textarea>.
 */
export default function TextField({
  id,
  label,
  value,
  onChange,
  error = '',
  hint = '',
  multiline = false,
  className = '',
  ...inputProps
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const controlClasses = `${CONTROL_CLASSES} ${error ? INVALID_CONTROL_CLASSES : ''} ${
    multiline ? 'h-auto min-h-24 resize-y py-2' : ''
  }`

  const sharedProps = {
    id,
    value,
    onChange: (event) => onChange(event.target.value),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: controlClasses,
    ...inputProps,
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={LABEL_CLASSES}>
        {label}
      </label>

      {multiline ? <textarea rows={3} {...sharedProps} /> : <input {...sharedProps} />}

      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger animate-fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
