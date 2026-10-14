import SelectMenu from '../ui/SelectMenu'
import { STATUS_OPTIONS, getStatusOption } from '../../constants/repoStatus'

/** Desplegable con aspecto de insignia para cambiar el estado de un repositorio guardado. */
export default function StatusSelect({ id, value, onChange, disabled = false, label }) {
  const option = getStatusOption(value)
  const labelId = `${id}-label`

  return (
    <div className="relative inline-flex">
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <SelectMenu
        id={id}
        value={option.value}
        options={STATUS_OPTIONS}
        onChange={onChange}
        labelledBy={labelId}
        disabled={disabled}
        triggerClassName={`h-8 rounded-md border px-2.5 text-xs font-medium transition-[border-color,background-color,opacity,scale] duration-150 focus-visible:ring-4 focus-visible:ring-accent-soft active:scale-[0.97] disabled:opacity-60 ${option.badgeClass}`}
      />
    </div>
  )
}
