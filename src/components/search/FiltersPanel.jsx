import { NumberField, SelectField } from './FilterField'
import { FilterIcon } from '../ui/Icons'
import {
  LANGUAGE_OPTIONS,
  LICENSE_OPTIONS,
  SORT_OPTIONS,
  UPDATED_WITHIN_OPTIONS,
} from '../../constants/filters'

export default function FiltersPanel({ filters, sort, onFilterChange, onSortChange, onReset, hasActiveFilters }) {
  // Los filtros se aplican al momento; el formulario no se envía nunca.
  function handleSubmit(event) {
    event.preventDefault()
  }

  function handleReset(event) {
    event.preventDefault()
    onReset()
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Filtros de búsqueda">
      <fieldset className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <legend className="sr-only">Filtrar repositorios</legend>

        <div className="mb-4 flex min-h-8 items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-muted uppercase">
            <FilterIcon className="size-4 text-accent" />
            Filtros
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-soft animate-fade-in"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <SelectField
            id="filter-language"
            label="Lenguaje"
            value={filters.language}
            options={LANGUAGE_OPTIONS}
            placeholder="Todos"
            onChange={(value) => onFilterChange('language', value)}
          />
          <NumberField
            id="filter-stars"
            label="Stars mínimas"
            value={filters.minStars}
            placeholder="Ej: 500"
            onChange={(value) => onFilterChange('minStars', value)}
          />
          <NumberField
            id="filter-forks"
            label="Forks mínimos"
            value={filters.minForks}
            placeholder="Ej: 50"
            onChange={(value) => onFilterChange('minForks', value)}
          />
          <SelectField
            id="filter-updated"
            label="Actualizado"
            value={filters.updatedWithin}
            options={UPDATED_WITHIN_OPTIONS}
            placeholder="Cualquier fecha"
            onChange={(value) => onFilterChange('updatedWithin', value)}
          />
          <SelectField
            id="filter-license"
            label="Licencia"
            value={filters.license}
            options={LICENSE_OPTIONS}
            placeholder="Cualquiera"
            onChange={(value) => onFilterChange('license', value)}
          />
          <SelectField
            id="filter-sort"
            label="Ordenar por"
            value={sort}
            options={SORT_OPTIONS}
            onChange={onSortChange}
          />
        </div>
      </fieldset>
    </form>
  )
}
