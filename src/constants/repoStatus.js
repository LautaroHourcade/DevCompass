// Estados de seguimiento de un repositorio guardado.
// value coincide con la restricción CHECK de user_repositories.status. labelKey: clave de traducción.

export const DEFAULT_STATUS = 'to_learn'

export const STATUS_OPTIONS = [
  { value: 'to_learn', labelKey: 'status.to_learn', dotClass: 'bg-info', badgeClass: 'border-info/40 bg-info/10 text-info' },
  { value: 'in_progress', labelKey: 'status.in_progress', dotClass: 'bg-star', badgeClass: 'border-star/40 bg-star/10 text-star' },
  { value: 'completed', labelKey: 'status.completed', dotClass: 'bg-accent', badgeClass: 'border-accent/40 bg-accent-soft text-accent' },
]

// Filtros de la colección guardada sin aplicar (todos los estados y todas las etiquetas).
export const EMPTY_SAVED_FILTERS = { status: '', tagId: '' }

export function getStatusOption(value) {
  return STATUS_OPTIONS.find((option) => option.value === value) ?? STATUS_OPTIONS[0]
}
