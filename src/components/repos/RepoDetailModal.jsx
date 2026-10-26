import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import SaveButton from './SaveButton'
import LanguageBar from './LanguageBar'
import RepoHistory from '../stats/RepoHistory'
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  ForkIcon,
  GitHubIcon,
  IssueIcon,
  LicenseIcon,
  LinkIcon,
  StarIcon,
} from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { getRepositoryLanguages } from '../../services/githubService'
import { formatDate, formatFullNumber, formatLicense, formatRelativeDate } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

const TITLE_ID = 'repo-detail-title'

export default function RepoDetailModal({ repo, onClose, isSaved, onToggleSave }) {
  // Mientras el modal se cierra (animación de salida) seguimos mostrando el último repositorio.
  const [shownRepo, setShownRepo] = useState(repo)
  if (repo && repo !== shownRepo) setShownRepo(repo)

  return (
    <Modal isOpen={Boolean(repo)} onClose={onClose} labelledBy={TITLE_ID} size="lg">
      {shownRepo && (
        // key: al cambiar de repositorio el detalle se monta de nuevo con su propio estado.
        <RepoDetail
          key={shownRepo.id}
          repo={shownRepo}
          onClose={onClose}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
        />
      )}
    </Modal>
  )
}

const SECTION_TITLE_CLASSES = 'font-mono text-2xs tracking-[0.14em] text-muted uppercase'

function RepoDetail({ repo, onClose, isSaved, onToggleSave }) {
  const { t } = useTranslation()
  const languagesState = useRepositoryLanguages(repo.id)
  const isRepoSaved = isSaved(repo.id)

  function handleClose(event) {
    event.preventDefault()
    onClose()
  }

  const stats = [
    { label: 'Stars', value: formatFullNumber(repo.stars), Icon: StarIcon, iconClass: 'text-star', isNumber: true },
    { label: 'Forks', value: formatFullNumber(repo.forks), Icon: ForkIcon, iconClass: 'text-purple', isNumber: true },
    { label: t('repo.openIssues'), value: formatFullNumber(repo.openIssues), Icon: IssueIcon, iconClass: 'text-info', isNumber: true },
    { label: t('repo.license'), value: formatLicense(repo.license), Icon: LicenseIcon, iconClass: 'text-subtle' },
    { label: t('repo.updated'), value: formatRelativeDate(repo.updatedAt), Icon: ClockIcon, iconClass: 'text-subtle' },
    { label: t('repo.created'), value: formatDate(repo.createdAt), Icon: CalendarIcon, iconClass: 'text-subtle' },
  ]

  return (
    <article className="flex flex-col gap-7">
      <header className="flex items-start gap-4">
        <img
          src={repo.owner.avatarUrl}
          alt=""
          width="52"
          height="52"
          className="size-13 shrink-0 rounded-xl border border-line bg-surface-2"
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <a
            href={repo.owner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors duration-150 hover:text-accent"
          >
            <span className="sr-only">{t('repo.author')} </span>
            {repo.owner.login}
          </a>
          <h2 id={TITLE_ID} className="text-2xl leading-tight font-semibold tracking-[-0.03em] break-words sm:text-3xl">
            {repo.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label={t('repo.closeDetail')}
          className={buttonClasses({ variant: 'ghost', size: 'icon', className: '-mt-1 -mr-1' })}
        >
          <CloseIcon className="size-5" />
        </button>
      </header>

      <p className="-mt-2 text-base text-muted">{repo.description || t('repo.noDescription')}</p>

      {repo.topics.length > 0 && (
        <ul aria-label={t('repo.topics')} className="-mt-2 flex flex-wrap gap-1.5">
          {repo.topics.map((topic) => (
            <li key={topic} className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent">
              {topic}
            </li>
          ))}
        </ul>
      )}

      {/* Panel de lecturas: una sola caja dividida en celdas, como la esfera de un instrumento */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        {stats.map(({ label, value, Icon, iconClass, isNumber }) => (
          <div key={label} className="flex flex-col gap-1.5 bg-raised p-4">
            <dt className="flex items-center gap-1.5 font-mono text-2xs tracking-[0.08em] text-subtle uppercase">
              <Icon className={`size-3 ${iconClass}`} />
              {label}
            </dt>
            <dd className={`truncate text-lg font-medium ${isNumber ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="repo-languages-title" className="flex flex-col gap-3">
        <h3 id="repo-languages-title" className={SECTION_TITLE_CLASSES}>
          {t('repo.languages')}
        </h3>
        <LanguagesContent state={languagesState} />
      </section>

      {/* El historial solo existe para repositorios que DevCompass sigue (guardados por el usuario). */}
      {isRepoSaved && <RepoHistory githubId={repo.id} />}

      <footer className="sticky bottom-0 -mx-5 -mb-5 flex flex-col-reverse gap-2 border-t border-line bg-raised/90 px-5 py-4 backdrop-blur-md sm:-mx-7 sm:-mb-7 sm:flex-row sm:justify-end sm:px-7">
        <SaveButton repo={repo} isSaved={isRepoSaved} onToggleSave={onToggleSave} />
        {repo.homepage && (
          <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className={buttonClasses()}>
            <LinkIcon className="size-4" />
            {t('repo.homepage')}
          </a>
        )}
        <a href={repo.url} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'primary' })}>
          <GitHubIcon className="size-4" />
          {t('repo.openOnGitHub')}
          <span className="sr-only">{t('repo.opensInNewTab')}</span>
        </a>
      </footer>
    </article>
  )
}

function LanguagesContent({ state }) {
  const { t } = useTranslation()

  if (state.status === 'loading') {
    return <p className="h-2.5 w-full rounded-full bg-surface-2 animate-shimmer" aria-label={t('repo.loadingLanguages')} />
  }

  if (state.status === 'error') {
    return <p className="text-sm text-muted">{t('repo.languagesError')}</p>
  }

  if (state.languages.length === 0) {
    return <p className="text-sm text-muted">{t('repo.noLanguages')}</p>
  }

  return <LanguageBar languages={state.languages} />
}

// Los lenguajes completos se piden solo al abrir el detalle (carga bajo demanda).
function useRepositoryLanguages(repoId) {
  const [state, setState] = useState({ status: 'loading', languages: [] })

  useEffect(() => {
    const controller = new AbortController()

    getRepositoryLanguages(repoId, controller.signal)
      .then((languages) => setState({ status: 'success', languages }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', languages: [] })
      })

    return () => controller.abort()
  }, [repoId])

  return state
}
