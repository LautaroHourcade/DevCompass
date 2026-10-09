// Estados de seguimiento de un repositorio guardado.
// value coincide con la restricción CHECK de user_repositories.status.

export const DEFAULT_STATUS = 'to_learn'

export const STATUS_OPTIONS = [
  { value: 'to_learn', label: 'Por aprender', dotClass: 'bg-info', badgeClass: 'border-info/40 bg-info/10 text-info' },
  { value: 'in_progress', label: 'En progreso', dotClass: 'bg-star', badgeClass: 'border-star/40 bg-star/10 text-star' },
  { value: 'completed', label: 'Completado', dotClass: 'bg-accent', badgeClass: 'border-accent/40 bg-accent-soft text-accent' },
]

export function getStatusOption(value) {
  return STATUS_OPTIONS.find((option) => option.value === value) ?? STATUS_OPTIONS[0]
}
