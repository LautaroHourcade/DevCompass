import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import SaveButton from './SaveButton'
import LanguageBar from './LanguageBar'
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
  ForkIcon,
  IssueIcon,
  LicenseIcon,
  LinkIcon,
  StarIcon,
} from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { getRepositoryLanguages } from '../../services/githubService'
import { formatDate, formatFullNumber, formatRelativeDate } from '../../utils/formatters'

const TITLE_ID = 'repo-detail-title'

export default function RepoDetailModal({ repo, onClose, isSaved, onToggleSave }) {
  return (
    <Modal isOpen={Boolean(repo)} onClose={onClose} labelledBy={TITLE_ID}>
      {repo && (
        // key: al cambiar de repositorio el detalle se monta de nuevo con su propio estado.
        <RepoDetail
          key={repo.id}
          repo={repo}
          onClose={onClose}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
        />
      )}
    </Modal>
  )
}

function RepoDetail({ repo, onClose, isSaved, onToggleSave }) {
  const languagesState = useRepositoryLanguages(repo.id)

  function handleClose(event) {
    event.preventDefault()
    onClose()
  }

  const stats = [
    { label: 'Stars', value: formatFullNumber(repo.stars), Icon: StarIcon, iconClass: 'text-star' },
    { label: 'Forks', value: formatFullNumber(repo.forks), Icon: ForkIcon, iconClass: 'text-purple' },
    { label: 'Issues abiertos', value: formatFullNumber(repo.openIssues), Icon: IssueIcon, iconClass: 'text-info' },
    { label: 'Licencia', value: repo.license ?? 'Sin licencia', Icon: LicenseIcon, iconClass: 'text-muted' },
    { label: 'Última actualización', value: formatRelativeDate(repo.updatedAt), Icon: ClockIcon, iconClass: 'text-muted' },
    { label: 'Creado', value: formatDate(repo.createdAt), Icon: CalendarIcon, iconClass: 'text-muted' },
  ]

  return (
    <article className="flex flex-col gap-6">
      <header className="flex items-start gap-4">
        <img
          src={repo.owner.avatarUrl}
          alt=""
          width="48"
          height="48"
          className="size-12 rounded-full border border-line bg-surface-2"
        />
        <div className="min-w-0 flex-1">
          <a
            href={repo.owner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            <span className="sr-only">Autor: </span>
            {repo.owner.login}
          </a>
          <h2 id={TITLE_ID} className="break-words font-mono text-2xl font-bold">
            {repo.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar detalle"
          className={buttonClasses({ variant: 'ghost', size: 'icon' })}
        >
          <CloseIcon className="size-5" />
        </button>
      </header>

      <p className="text-base">{repo.description || 'Este repositorio no tiene descripción.'}</p>

      {repo.topics.length > 0 && (
        <ul aria-label="Temas" className="flex flex-wrap gap-2">
          {repo.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent"
            >
              {topic}
            </li>
          ))}
        </ul>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, Icon, iconClass }) => (
          <div key={label} className="rounded-lg border border-line bg-canvas p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted">
              <Icon className={`size-3.5 ${iconClass}`} />
              {label}
            </dt>
            <dd className="mt-1 truncate font-mono text-base font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="repo-languages-title" className="flex flex-col gap-3">
        <h3 id="repo-languages-title" className="font-mono text-sm font-semibold uppercase tracking-wider text-muted">
          Lenguajes
        </h3>
        <LanguagesContent state={languagesState} />
      </section>

      <footer className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <SaveButton repo={repo} isSaved={isSaved(repo.id)} onToggleSave={onToggleSave} />
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses()}
          >
            <LinkIcon className="size-4" />
            Web del proyecto
          </a>
        )}
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: 'primary' })}
        >
          Abrir en GitHub
          <ExternalLinkIcon className="size-4" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </footer>
    </article>
  )
}

function LanguagesContent({ state }) {
  if (state.status === 'loading') {
    return <p className="h-2.5 w-full rounded-full bg-surface-2 animate-shimmer" aria-label="Cargando lenguajes" />
  }

  if (state.status === 'error') {
    return <p className="text-sm text-muted">No se pudieron cargar los lenguajes.</p>
  }

  if (state.languages.length === 0) {
    return <p className="text-sm text-muted">GitHub no detecta lenguajes en este repositorio.</p>
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
