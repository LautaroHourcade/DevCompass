import SelectMenu from '../ui/SelectMenu'

// Control compacto con la etiqueta dentro: "Lenguaje  Todos ▾".
// Cuando tiene un valor se tiñe de acento, así se ve de un vistazo qué filtros están aplicados.
function fieldClasses(isActive) {
  return (
    'group relative flex h-10 min-w-0 items-center rounded-lg border shadow-card ' +
    'transition-[border-color,background-color,box-shadow] duration-150 ease-out ' +
    'focus-within:ring-4 focus-within:ring-accent-soft ' +
    (isActive
      ? 'border-accent/45 bg-accent-soft focus-within:border-accent'
      : 'border-line-strong bg-surface hover:border-[color-mix(in_oklab,var(--color-fg),transparent_70%)] focus-within:border-accent')
  )
}

function FieldLabel({ id, htmlFor, children }) {
  return (
    <label id={id} htmlFor={htmlFor} className="shrink-0 cursor-pointer pl-3 text-xs whitespace-nowrap text-muted">
      {children}
    </label>
  )
}

/** Desplegable con la etiqueta dentro. Si se pasa `placeholder`, se añade como opción vacía ("Todos"). */
export function SelectField({ id, label, value, options, placeholder, onChange, className = '' }) {
  const labelId = `${id}-label`
  const allOptions = placeholder ? [{ value: '', label: placeholder }, ...options] : options

  return (
    <div className={`${fieldClasses(Boolean(placeholder) && value !== '')} ${className}`}>
      <FieldLabel id={labelId} htmlFor={id}>
        {label}
      </FieldLabel>
      <SelectMenu
        id={id}
        value={value}
        options={allOptions}
        onChange={onChange}
        labelledBy={labelId}
        triggerClassName="h-full flex-1 pr-2.5 pl-2 text-sm font-medium text-fg"
      />
    </div>
  )
}

/** Campo numérico que solo acepta dígitos (evita "e", "-", etc.). */
export function NumberField({ id, label, value, placeholder, onChange, className = '' }) {
  function handleChange(event) {
    onChange(event.target.value.replace(/\D/g, ''))
  }

  return (
    <div className={`${fieldClasses(value !== '')} ${className}`}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-full w-full min-w-0 flex-1 bg-transparent pr-3 pl-2 font-mono text-sm font-medium text-fg tabular-nums placeholder:font-sans placeholder:font-normal placeholder:text-subtle focus:outline-none"
      />
    </div>
  )
}
