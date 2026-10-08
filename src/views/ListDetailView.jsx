import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import ListFormDialog from '../components/lists/ListFormDialog'
import RepoGrid from '../components/repos/RepoGrid'
import EmptyState from '../components/ui/EmptyState'
import PageLoader from '../components/ui/PageLoader'
import { ArrowLeftIcon, BookmarkIcon, CloseIcon, EditIcon, ListIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useToast } from '../hooks/useToast'

export default function ListDetailView({
  listsState,
  savedRepos,
  isLoadingSaved,
  isSaved,
  onToggleSave,
  onOpenDetail,
}) {
  const { listId } = useParams()
  const { lists, isLoading, updateList, removeRepoFromList } = listsState
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const list = lists.find((candidate) => candidate.id === listId)

  if ((isLoading || isLoadingSaved) && !list) return <PageLoader label="Cargando la lista…" />

  if (!list) {
    return (
      <EmptyState
        icon={<ListIcon className="size-6" />}
        title="No encontramos esta lista"
        message="Puede que se haya eliminado o que el enlace no sea correcto."
        action={
          <Link to="/listas" className={buttonClasses({ variant: 'primary' })}>
            Ver mis listas
          </Link>
        }
      />
    )
  }

  // El detalle sale de los repos guardados: no hace falta otra consulta.
  const listRepos = savedRepos.filter((repo) => list.savedIds.includes(repo.savedId))

  async function handleRemoveFromList(repo) {
    try {
      await removeRepoFromList(list.id, repo.savedId)
      showToast(`"${repo.name}" quitado de la lista`, 'info')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleSubmitEdit(values) {
    await updateList(list.id, values)
    showToast('Lista actualizada', 'success')
  }

  function handleOpenEdit(event) {
    event.preventDefault()
    setIsEditing(true)
  }

  function renderListActions(repo) {
    function handleClick(event) {
      event.preventDefault()
      handleRemoveFromList(repo)
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'flex-1 hover:text-danger' })}
      >
        <CloseIcon className="size-3.5" />
        Quitar de la lista
      </button>
    )
  }

  return (
    <section aria-labelledby="list-detail-title" className="flex flex-col gap-6">
      <Link
        to="/listas"
        className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'self-start animate-fade-in' })}
      >
        <ArrowLeftIcon className="size-4" />
        Mis listas
      </Link>

      <PageHeader
        command={`cat ~/listas/${list.name.toLowerCase().replace(/\s+/g, '-')}`}
        title={list.name}
        titleId="list-detail-title"
        description={list.description || `${listRepos.length} repositorios en esta lista.`}
      >
        <button type="button" onClick={handleOpenEdit} className={buttonClasses()}>
          <EditIcon className="size-4" />
          Editar
        </button>
      </PageHeader>

      {listRepos.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="size-6" />}
          title="Esta lista está vacía"
          message="Ve a tus guardados y usa «Añadir a lista» en cualquier repositorio."
          action={
            <Link to="/guardados" className={buttonClasses({ variant: 'primary' })}>
              Ir a guardados
            </Link>
          }
        />
      ) : (
        <RepoGrid
          repos={listRepos}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
          onOpenDetail={onOpenDetail}
          renderActions={renderListActions}
        />
      )}

      {isEditing && (
        <ListFormDialog isOpen list={list} onSubmit={handleSubmitEdit} onClose={() => setIsEditing(false)} />
      )}
    </section>
  )
}
