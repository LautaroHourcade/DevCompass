import { SelectField } from '../search/FilterField'
import { FilterIcon, ResetIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { STATUS_OPTIONS } from '../../constants/repoStatus'

export const EMPTY_SAVED_FILTERS = { status: '', tagId: '' }

/** Filtros de la colección guardada: por estado y por etiqueta. Se aplican al momento. */
export default function SavedFilters({ filters, tags, onChange, onReset, resultCount, totalCount }) {
  const hasActiveFilters = Boolean(filters.status || filters.tagId)
  const tagOptions = tags.map((tag) => ({ value: tag.id, label: tag.name }))

  function handleSubmit(event) {
    event.preventDefault()
  }

  function handleReset(event) {
    event.preventDefault()
    onReset()
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Filtros de tu colección" className="animate-fade-up">
      <fieldset className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-end sm:p-5">
        <legend className="sr-only">Filtrar repositorios guardados</legend>

        <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-muted uppercase sm:mb-3 sm:self-end">
          <FilterIcon className="size-4 text-accent" />
          Filtros
        </p>

        <div className="grid flex-1 grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:max-w-[56rem]">
          <SelectField
            id="saved-filter-status"
            label="Estado"
            value={filters.status}
            options={STATUS_OPTIONS}
            placeholder="Todos los estados"
            onChange={(value) => onChange('status', value)}
          />
          <SelectField
            id="saved-filter-tag"
            label="Etiqueta"
            value={filters.tagId}
            options={tagOptions}
            placeholder={tags.length === 0 ? 'Sin etiquetas todavía' : 'Todas las etiquetas'}
            onChange={(value) => onChange('tagId', value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:ml-auto sm:flex-col sm:items-end">
          <p className="font-mono text-xs text-muted" aria-live="polite">
            {resultCount} de {totalCount}
          </p>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className={buttonClasses({ variant: 'ghost', size: 'sm' })}
          >
            <ResetIcon className="size-3.5" />
            Restablecer filtros
          </button>
        </div>
      </fieldset>
    </form>
  )
}
