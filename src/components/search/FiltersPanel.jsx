import { NumberField, SelectField } from './FilterField'
import { ResetIcon } from '../ui/Icons'
import { LANGUAGE_OPTIONS, LICENSE_OPTIONS, UPDATED_WITHIN_OPTIONS } from '../../constants/filters'
import { translateOptions, useTranslation } from '../../hooks/useTranslation'

/** Barra compacta de filtros bajo el buscador. La ordenación vive en la cabecera de resultados. */
export default function FiltersPanel({ filters, onFilterChange, onReset }) {
  const { t } = useTranslation()
  const activeCount = Object.values(filters).filter(Boolean).length

  // Los filtros se aplican al momento; el formulario no se envía nunca.
  function handleSubmit(event) {
    event.preventDefault()
  }

  function handleReset(event) {
    event.preventDefault()
    onReset()
  }

  return (
    <form onSubmit={handleSubmit} aria-label={t('filters.formLabel')}>
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">{t('filters.legend')}</legend>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
          <SelectField
            id="filter-language"
            label={t('filters.language')}
            value={filters.language}
            options={LANGUAGE_OPTIONS}
            placeholder={t('filters.all')}
            onChange={(value) => onFilterChange('language', value)}
            className="lg:w-[19rem]"
          />
          <NumberField
            id="filter-stars"
            label="Stars ≥"
            value={filters.minStars}
            placeholder="500"
            onChange={(value) => onFilterChange('minStars', value)}
            className="lg:w-[15rem]"
          />
          <NumberField
            id="filter-forks"
            label="Forks ≥"
            value={filters.minForks}
            placeholder="50"
            onChange={(value) => onFilterChange('minForks', value)}
            className="lg:w-[15rem]"
          />
          <SelectField
            id="filter-updated"
            label={t('filters.updated.label')}
            value={filters.updatedWithin}
            options={translateOptions(UPDATED_WITHIN_OPTIONS, t)}
            placeholder={t('filters.updated.always')}
            onChange={(value) => onFilterChange('updatedWithin', value)}
            className="lg:w-[22rem]"
          />
          <SelectField
            id="filter-license"
            label={t('filters.license')}
            value={filters.license}
            options={LICENSE_OPTIONS}
            placeholder={t('filters.any')}
            onChange={(value) => onFilterChange('license', value)}
            className="lg:w-[20rem]"
          />

          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-[color,background-color,scale] duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.97] animate-fade-in"
            >
              <ResetIcon className="size-3.5" />
              {t('filters.clear')}
              <span className="font-mono text-xs text-accent tabular-nums">{activeCount}</span>
            </button>
          )}
        </div>
      </fieldset>
    </form>
  )
}
