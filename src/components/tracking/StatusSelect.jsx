import { ChevronDownIcon } from '../ui/Icons'
import { STATUS_OPTIONS, getStatusOption } from '../../constants/repoStatus'

/** Desplegable con aspecto de insignia para cambiar el estado de un repositorio guardado. */
export default function StatusSelect({ id, value, onChange, disabled = false, label }) {
  const option = getStatusOption(value)

  return (
    <div className="relative inline-flex">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full ${option.dotClass}`}
      />
      <select
        id={id}
        value={option.value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`h-8 cursor-pointer appearance-none rounded-full border pr-8 pl-7 text-xs font-medium transition-[border-color,background-color,opacity] focus:ring-4 focus:ring-accent/15 focus:outline-none disabled:cursor-wait disabled:opacity-60 ${option.badgeClass}`}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value} className="bg-surface text-fg">
            {status.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 opacity-70" />
    </div>
  )
}
