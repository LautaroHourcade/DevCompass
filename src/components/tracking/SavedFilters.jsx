import { SelectField } from '../search/FilterField'
import { ResetIcon } from '../ui/Icons'
import { STATUS_OPTIONS } from '../../constants/repoStatus'
import { translateOptions, useTranslation } from '../../hooks/useTranslation'

/** Filtros de la colección guardada: por estado y por etiqueta. Se aplican al momento. */
export default function SavedFilters({ filters, tags, onChange, onReset, resultCount, totalCount }) {
  const { t } = useTranslation()
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
    <form onSubmit={handleSubmit} aria-label={t('saved.filters.formLabel')} className="animate-fade-up">
      <fieldset className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <legend className="sr-only">{t('saved.filters.legend')}</legend>

        <div className="grid flex-1 grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:flex sm:flex-none">
          <SelectField
            id="saved-filter-status"
            label={t('saved.filters.status')}
            value={filters.status}
            options={translateOptions(STATUS_OPTIONS, t)}
            placeholder={t('filters.all')}
            onChange={(value) => onChange('status', value)}
            className="sm:w-[22rem]"
          />
          <SelectField
            id="saved-filter-tag"
            label={t('saved.filters.tag')}
            value={filters.tagId}
            options={tagOptions}
            placeholder={tags.length === 0 ? t('saved.filters.noTags') : t('saved.filters.allTags')}
            onChange={(value) => onChange('tagId', value)}
            className="sm:w-[22rem]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-[color,background-color,scale] duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.97] animate-fade-in"
            >
              <ResetIcon className="size-3.5" />
              {t('saved.filters.reset')}
            </button>
          )}
          <p className="ml-auto font-mono text-xs text-muted tabular-nums" aria-live="polite">
            <span className="text-fg">{resultCount}</span> / {totalCount}
          </p>
        </div>
      </fieldset>
    </form>
  )
}
