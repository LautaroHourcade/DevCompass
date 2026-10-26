import SaveButton from './SaveButton'
import LanguageTag from './LanguageTag'
import { ForkIcon, GitHubIcon, IssueIcon, StarIcon } from '../ui/Icons'
import { formatDateTime, formatFullNumber, formatLicense, formatNumber, formatRelativeDate } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

const STAGGER_DELAY_MS = 40
const MAX_STAGGERED_CARDS = 8

/**
 * Tarjeta de repositorio. Toda la tarjeta abre el detalle: el botón del nombre se estira
 * con ::after para cubrirla. Los demás controles quedan por encima (relative z-10).
 * renderTracking (opcional): seguimiento personal (estado, nota, etiquetas) bajo las estadísticas.
 * renderActions (opcional): botones extra para el pie de la tarjeta (p. ej. "Añadir a lista").
 */
export default function RepoCard({ repo, index, isSaved, onToggleSave, onOpenDetail, renderTracking, renderActions }) {
  const { t } = useTranslation()

  function handleOpenDetail(event) {
    event.preventDefault()
    onOpenDetail(repo)
  }

  // Las tarjetas aparecen escalonadas; limitamos el retardo para no hacer esperar.
  const animationDelay = `${(index % MAX_STAGGERED_CARDS) * STAGGER_DELAY_MS}ms`

  const readouts = [
    { label: 'Stars', value: repo.stars, Icon: StarIcon, iconClass: 'text-star' },
    { label: 'Forks', value: repo.forks, Icon: ForkIcon, iconClass: 'text-purple' },
    { label: t('repo.issues'), value: repo.openIssues, Icon: IssueIcon, iconClass: 'text-info' },
  ]

  return (
    <article
      style={{ animationDelay }}
      className="group relative flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-card transition-[border-color,background-color] duration-150 ease-out animate-fade-up hover:border-line-strong hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_2%)]"
    >
      <header className="flex items-start gap-3">
        <img
          src={repo.owner.avatarUrl}
          alt=""
          width="36"
          height="36"
          loading="lazy"
          className="size-9 shrink-0 rounded-lg border border-line bg-surface-2"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">
            <span className="sr-only">{t('repo.author')} </span>
            {repo.owner.login}
          </p>
          <h3 className="truncate text-base leading-snug font-semibold tracking-[-0.01em]">
            <button
              type="button"
              onClick={handleOpenDetail}
              className="max-w-full cursor-pointer truncate text-left transition-colors duration-150 group-hover:text-accent focus-visible:outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
            >
              {repo.name}
              <span className="sr-only"> {t('repo.viewDetail')}</span>
            </button>
          </h3>
        </div>
        <div className="relative z-10 -mt-1.5 -mr-2 flex items-center">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            title={t('repo.openOnGitHub')}
            className="flex size-9 items-center justify-center rounded-lg text-subtle transition-[background-color,color,scale] duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.97]"
          >
            <GitHubIcon className="size-4" />
            <span className="sr-only">{t('repo.openRepoOnGitHub', { name: repo.name })}</span>
          </a>
          <SaveButton repo={repo} isSaved={isSaved} onToggleSave={onToggleSave} compact />
        </div>
      </header>

      {/* El contenedor crece para alinear las tarjetas; el párrafo solo recorta (si crece él, asoma una 3.ª línea) */}
      <div className="mt-3 flex-1">
        <p className="line-clamp-2 text-sm text-muted">{repo.description || t('repo.noDescription')}</p>
      </div>

      <dl className="mt-5 grid grid-cols-3 border-t border-line pt-4">
        {readouts.map(({ label, value, Icon, iconClass }) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 font-mono text-2xs tracking-[0.08em] text-subtle uppercase">
              <Icon className={`size-3 ${iconClass}`} />
              {label}
            </dt>
            <dd title={formatFullNumber(value)} className="font-mono text-base font-medium tabular-nums">
              {formatNumber(value)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {repo.language && <LanguageTag language={repo.language} />}
        <span>{formatLicense(repo.license)}</span>
        <span className="ml-auto">
          <span className="sr-only">{t('repo.updated')} </span>
          <time dateTime={repo.updatedAt} title={formatDateTime(repo.updatedAt)}>
            {formatRelativeDate(repo.updatedAt)}
          </time>
        </span>
      </p>

      {/* Con un desplegable abierto, el seguimiento se eleva para que su menú no quede bajo la tarjeta siguiente */}
      {renderTracking && (
        <div className="relative z-10 has-[[aria-expanded=true]]:z-30">{renderTracking(repo)}</div>
      )}

      {renderActions && (
        <footer className="relative z-10 mt-4 flex flex-wrap gap-1 border-t border-line pt-3">{renderActions(repo)}</footer>
      )}
    </article>
  )
}
