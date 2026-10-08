import SaveButton from './SaveButton'
import LanguageTag from './LanguageTag'
import { ClockIcon, ExternalLinkIcon, ForkIcon, IssueIcon, LicenseIcon, StarIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { formatNumber, formatRelativeDate } from '../../utils/formatters'

const STAGGER_DELAY_MS = 30
const MAX_STAGGERED_CARDS = 12

/** renderActions (opcional): devuelve botones extra para el pie de la tarjeta (p. ej. "Añadir a lista"). */
export default function RepoCard({ repo, index, isSaved, onToggleSave, onOpenDetail, renderActions }) {
  function handleOpenDetail(event) {
    event.preventDefault()
    onOpenDetail(repo)
  }

  // Las tarjetas aparecen escalonadas; limitamos el retardo para no hacer esperar.
  const animationDelay = `${(index % MAX_STAGGERED_CARDS) * STAGGER_DELAY_MS}ms`

  return (
    <article
      style={{ animationDelay }}
      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 animate-fade-up hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"
    >
      <header className="flex items-start gap-3">
        <img
          src={repo.owner.avatarUrl}
          alt=""
          width="32"
          height="32"
          loading="lazy"
          className="size-8 rounded-full border border-line bg-surface-2"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">
            <span className="sr-only">Autor: </span>
            {repo.owner.login}
          </p>
          <h3 className="truncate font-mono text-lg font-semibold">
            <button
              type="button"
              onClick={handleOpenDetail}
              className="max-w-full cursor-pointer truncate text-left transition-colors hover:text-accent"
            >
              {repo.name}
            </button>
          </h3>
        </div>
        <SaveButton repo={repo} isSaved={isSaved} onToggleSave={onToggleSave} compact />
      </header>

      <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">
        {repo.description || 'Este repositorio no tiene descripción.'}
      </p>

      <ul aria-label="Estadísticas" className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm">
        <li className="flex items-center gap-1.5" title="Stars">
          <StarIcon className="size-4 text-star" />
          {formatNumber(repo.stars)}
          <span className="sr-only">stars</span>
        </li>
        <li className="flex items-center gap-1.5" title="Forks">
          <ForkIcon className="size-4 text-purple" />
          {formatNumber(repo.forks)}
          <span className="sr-only">forks</span>
        </li>
        <li className="flex items-center gap-1.5" title="Issues abiertos">
          <IssueIcon className="size-4 text-info" />
          {formatNumber(repo.openIssues)}
          <span className="sr-only">issues abiertos</span>
        </li>
      </ul>

      <footer className="mt-4 flex flex-col gap-4 border-t border-line pt-4">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          {repo.language && <LanguageTag language={repo.language} />}
          <span className="inline-flex items-center gap-1.5">
            <LicenseIcon className="size-3.5" />
            {repo.license ?? 'Sin licencia'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" />
            <time dateTime={repo.updatedAt}>{formatRelativeDate(repo.updatedAt)}</time>
          </span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenDetail}
            className={buttonClasses({ size: 'sm', className: 'flex-1' })}
          >
            Ver detalle
          </button>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'flex-1' })}
          >
            GitHub
            <ExternalLinkIcon className="size-3.5" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>

        {renderActions && <div className="flex flex-wrap gap-2">{renderActions(repo)}</div>}
      </footer>
    </article>
  )
}
