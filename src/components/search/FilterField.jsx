import { ChevronDownIcon } from '../ui/Icons'

const CONTROL_CLASSES =
  'h-10 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-fg transition-[border-color,box-shadow] ' +
  'focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none'

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
      {children}
    </label>
  )
}

/** Desplegable. Si se pasa `placeholder`, se añade como opción vacía ("Todos"). */
export function SelectField({ id, label, value, options, placeholder, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL_CLASSES} cursor-pointer appearance-none pr-9`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </div>
    </div>
  )
}

/** Campo numérico que solo acepta dígitos (evita "e", "-", etc.). */
export function NumberField({ id, label, value, placeholder, onChange }) {
  function handleChange(event) {
    onChange(event.target.value.replace(/\D/g, ''))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${CONTROL_CLASSES} font-mono placeholder:font-sans placeholder:text-muted/70`}
      />
    </div>
  )
}
