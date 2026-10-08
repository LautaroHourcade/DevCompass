import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import AddToListDialog from '../components/lists/AddToListDialog'
import RepoGrid from '../components/repos/RepoGrid'
import EmptyState from '../components/ui/EmptyState'
import { BookmarkIcon, ListIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'

export default function SavedView({ savedRepos, isLoading, isSaved, onToggleSave, onOpenDetail, listsState }) {
  // Repositorio cuyo diálogo "Añadir a lista" está abierto.
  const [repoForLists, setRepoForLists] = useState(null)

  function renderSavedActions(repo) {
    function handleClick(event) {
      event.preventDefault()
      setRepoForLists(repo)
    }

    const listCount = listsState.lists.filter((list) => list.savedIds.includes(repo.savedId)).length

    return (
      <button
        type="button"
        onClick={handleClick}
        className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'flex-1' })}
      >
        <ListIcon className="size-3.5" />
        {listCount > 0 ? `En ${listCount} ${listCount === 1 ? 'lista' : 'listas'}` : 'Añadir a lista'}
      </button>
    )
  }

  return (
    <section aria-labelledby="saved-title" className="flex flex-col gap-6">
      <PageHeader
        command="ls ~/guardados"
        title="Tus repositorios guardados"
        titleId="saved-title"
        description={
          isLoading
            ? 'Cargando tu colección…'
            : savedRepos.length === 1
              ? 'Tienes 1 repositorio en seguimiento.'
              : `Tienes ${savedRepos.length} repositorios en seguimiento.`
        }
      />

      {isLoading && savedRepos.length === 0 ? (
        <RepoGrid repos={[]} isLoading />
      ) : savedRepos.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="size-6" />}
          title="Todavía no has guardado nada"
          message="Pulsa el icono de guardar en cualquier repositorio para tenerlo siempre a mano aquí."
          action={
            <Link to="/" className={buttonClasses({ variant: 'primary' })}>
              Explorar repositorios
            </Link>
          }
        />
      ) : (
        <RepoGrid
          repos={savedRepos}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
          onOpenDetail={onOpenDetail}
          renderActions={renderSavedActions}
        />
      )}

      <AddToListDialog
        repo={repoForLists}
        lists={listsState.lists}
        onAdd={listsState.addRepoToList}
        onRemove={listsState.removeRepoFromList}
        onClose={() => setRepoForLists(null)}
      />
    </section>
  )
}
