import LanguageTag from '../repos/LanguageTag'
import { CloseIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { getStatusOption } from '../../constants/repoStatus'
import { formatDateTime, formatFullNumber, formatLicense, formatRelativeDate } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

// Filas de la tabla (labelKey: clave de traducción). numeric: se resalta el valor más alto.
const METRICS = [
  { labelKey: 'compare.table.stars', numeric: true, getValue: (repo) => repo.stars },
  { labelKey: 'compare.table.forks', numeric: true, getValue: (repo) => repo.forks },
  { labelKey: 'repo.openIssues', numeric: true, getValue: (repo) => repo.openIssues },
  {
    labelKey: 'filters.language',
    render: (repo, latestSnapshot, t) =>
      repo.language ? <LanguageTag language={repo.language} /> : t('dashboard.unknownLanguage'),
  },
  { labelKey: 'repo.license', render: (repo) => formatLicense(repo.license) },
  { labelKey: 'compare.table.lastUpdate', render: (repo) => formatRelativeDate(repo.updatedAt) },
  { labelKey: 'saved.filters.status', render: (repo, latestSnapshot, t) => t(getStatusOption(repo.status).labelKey) },
  {
    labelKey: 'history.latest',
    render: (repo, latestSnapshot, t) =>
      latestSnapshot ? formatDateTime(latestSnapshot.capturedAt) : t('compare.table.noSnapshots'),
  },
]

/**
 * Tabla con las estadísticas actuales de los repositorios comparados (una columna por repositorio).
 * - items: [{ repo, color, latestSnapshot }]
 * - onRemove(repo): lo quita de la comparación (no de la colección). onOpenDetail(repo): abre su detalle.
 */
export default function CompareTable({ items, onRemove, onOpenDetail }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card animate-fade-up">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <caption className="sr-only">{t('compare.table.caption')}</caption>
        <thead>
          <tr className="border-b border-line">
            <td className="sticky left-0 z-10 w-[16rem] bg-surface p-4" />
            {items.map(({ repo, color }) => (
              <th key={repo.id} scope="col" className="p-4 align-top font-normal">
                <RepoColumnHeader repo={repo} color={color} onRemove={onRemove} onOpenDetail={onOpenDetail} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => {
            const highest = metric.numeric ? getHighest(items.map(({ repo }) => metric.getValue(repo))) : null

            return (
              <tr key={metric.labelKey} className="border-b border-line/60 last:border-b-0">
                <th scope="row" className="sticky left-0 z-10 bg-surface p-4 font-mono text-2xs font-normal tracking-[0.08em] text-subtle uppercase">
                  {t(metric.labelKey)}
                </th>
                {items.map(({ repo, latestSnapshot }) => {
                  if (!metric.numeric) {
                    return (
                      <td key={repo.id} className="p-4">
                        {metric.render(repo, latestSnapshot, t)}
                      </td>
                    )
                  }

                  const value = metric.getValue(repo)
                  const isHighest = value === highest
                  return (
                    <td key={repo.id} className={`p-4 font-mono tabular-nums ${isHighest ? 'bg-accent-soft font-medium text-accent' : ''}`}>
                      {formatFullNumber(value)}
                      {isHighest && <span className="sr-only"> {t('compare.table.highest')}</span>}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// El valor más alto, o null si todos son iguales (no tiene sentido resaltar ninguno).
function getHighest(values) {
  const max = Math.max(...values)
  return values.every((value) => value === max) ? null : max
}

function RepoColumnHeader({ repo, color, onRemove, onOpenDetail }) {
  const { t } = useTranslation()

  function handleOpen(event) {
    event.preventDefault()
    onOpenDetail(repo)
  }

  function handleRemove(event) {
    event.preventDefault()
    onRemove(repo)
  }

  return (
    <div className="flex items-start gap-2">
      <span aria-hidden="true" className="mt-2 h-1 w-4 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs text-muted">{repo.owner.login}</span>
        <button
          type="button"
          onClick={handleOpen}
          className="cursor-pointer truncate text-left text-base font-semibold tracking-[-0.01em] transition-colors duration-150 hover:text-accent"
        >
          {repo.name}
        </button>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        title={t('compare.table.remove')}
        aria-label={t('compare.table.removeRepo', { name: repo.name })}
        className={buttonClasses({ variant: 'ghost', size: 'icon', className: '-mt-2 -mr-2' })}
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}
