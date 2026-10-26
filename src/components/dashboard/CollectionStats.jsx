import { CodeIcon, ForkIcon, NoteIcon, StarIcon, TagIcon } from '../ui/Icons'
import { formatFullNumber, formatNumber } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Estadísticas agregadas de la colección. totals: resultado de getCollectionTotals.
 * onOpenDetail: abre el detalle del repositorio con más stars.
 */
export default function CollectionStats({ totals, onOpenDetail }) {
  const { t } = useTranslation()
  const { mostStarred } = totals

  function handleOpenMostStarred(event) {
    event.preventDefault()
    onOpenDetail(mostStarred)
  }

  const stats = [
    { label: t('dashboard.totalStars'), value: formatNumber(totals.totalStars), title: formatFullNumber(totals.totalStars), Icon: StarIcon, iconClass: 'text-star' },
    { label: t('dashboard.averageStars'), value: formatNumber(totals.averageStars), title: formatFullNumber(totals.averageStars), Icon: StarIcon, iconClass: 'text-star' },
    { label: t('dashboard.totalForks'), value: formatNumber(totals.totalForks), title: formatFullNumber(totals.totalForks), Icon: ForkIcon, iconClass: 'text-purple' },
    { label: t('dashboard.withNotes'), value: formatFullNumber(totals.withNotes), Icon: NoteIcon, iconClass: 'text-info' },
    { label: t('dashboard.usedTags'), value: formatFullNumber(totals.usedTags), Icon: TagIcon, iconClass: 'text-accent' },
    { label: t('repo.languages'), value: formatFullNumber(totals.languageCount), Icon: CodeIcon, iconClass: 'text-muted' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {stats.map(({ label, value, title, Icon, iconClass }) => (
          <div key={label} className="bg-surface p-3">
            <dt className="flex items-center gap-1.5 font-mono text-2xs tracking-[0.08em] text-subtle uppercase">
              <Icon className={`size-3.5 ${iconClass}`} />
              {label}
            </dt>
            <dd title={title} className="mt-1 font-mono text-lg font-medium tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {mostStarred && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          {t('dashboard.mostPopular')}
          <button
            type="button"
            onClick={handleOpenMostStarred}
            className="cursor-pointer truncate font-mono font-semibold text-fg transition-colors hover:text-accent"
          >
            {mostStarred.fullName}
          </button>
          <span className="flex items-center gap-1 font-mono">
            <StarIcon className="size-3.5 text-star" />
            {formatFullNumber(mostStarred.stars)}
          </span>
        </p>
      )}
    </div>
  )
}
