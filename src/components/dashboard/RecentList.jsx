import LanguageTag from '../repos/LanguageTag'
import { getStatusOption } from '../../constants/repoStatus'
import { formatDateTime, formatRelativeDate } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Lista corta de repositorios con una fecha relativa (guardado o actualizado).
 * dateKey: propiedad del repo con la fecha ('savedAt' o 'updatedAt'). datePrefix: texto antes de la fecha.
 * Cada elemento abre el detalle del repositorio.
 */
export default function RecentList({ repos, dateKey, datePrefix, onOpenDetail }) {
  const { t } = useTranslation()

  if (repos.length === 0) {
    return <p className="text-sm text-muted">{t('dashboard.noRepos')}</p>
  }

  return (
    <ol className="-mx-2 flex flex-col">
      {repos.map((repo) => (
        <RecentItem key={repo.savedId} repo={repo} dateKey={dateKey} datePrefix={datePrefix} onOpenDetail={onOpenDetail} />
      ))}
    </ol>
  )
}

function RecentItem({ repo, dateKey, datePrefix, onOpenDetail }) {
  const { t } = useTranslation()
  const status = getStatusOption(repo.status)

  function handleOpen(event) {
    event.preventDefault()
    onOpenDetail(repo)
  }

  return (
    <li>
      <button
        type="button"
        onClick={handleOpen}
        className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-[background-color] duration-100 hover:bg-surface-2"
      >
        <img
          src={repo.owner.avatarUrl}
          alt=""
          width="28"
          height="28"
          loading="lazy"
          className="size-7 shrink-0 rounded-md border border-line bg-surface-2"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium transition-colors duration-150 group-hover:text-accent">
            {repo.fullName}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
            {repo.language && <LanguageTag language={repo.language} />}
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-2 rounded-full ${status.dotClass}`} />
              {t(status.labelKey)}
            </span>
          </span>
        </span>
        <time dateTime={repo[dateKey]} title={formatDateTime(repo[dateKey])} className="shrink-0 font-mono text-xs text-subtle tabular-nums">
          <span className="sr-only">{datePrefix} </span>
          {formatRelativeDate(repo[dateKey])}
        </time>
      </button>
    </li>
  )
}
