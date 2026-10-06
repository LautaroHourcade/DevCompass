import RepoGrid from '../components/repos/RepoGrid'
import EmptyState from '../components/ui/EmptyState'
import { BookmarkIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'

export default function SavedView({ savedRepos, isSaved, onToggleSave, onOpenDetail, onGoExplore }) {
  function handleGoExplore(event) {
    event.preventDefault()
    onGoExplore()
  }

  return (
    <section aria-labelledby="saved-title" className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 animate-fade-up">
        <p className="font-mono text-sm text-accent">
          <span aria-hidden="true">$ </span>ls ~/guardados
        </p>
        <h1 id="saved-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tus repositorios guardados
        </h1>
        <p className="text-base text-muted">
          {savedRepos.length === 1
            ? 'Tienes 1 repositorio en seguimiento.'
            : `Tienes ${savedRepos.length} repositorios en seguimiento.`}
        </p>
      </header>

      {savedRepos.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="size-6" />}
          title="Todavía no has guardado nada"
          message="Pulsa el icono de guardar en cualquier repositorio para tenerlo siempre a mano aquí."
          action={
            <button type="button" onClick={handleGoExplore} className={buttonClasses({ variant: 'primary' })}>
              Explorar repositorios
            </button>
          }
        />
      ) : (
        <RepoGrid
          repos={savedRepos}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
          onOpenDetail={onOpenDetail}
        />
      )}
    </section>
  )
}
