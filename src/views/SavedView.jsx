import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import AddToListDialog from '../components/lists/AddToListDialog'
import RepoGrid from '../components/repos/RepoGrid'
import TagPickerDialog from '../components/tags/TagPickerDialog'
import NoteDialog from '../components/tracking/NoteDialog'
import RepoTracking from '../components/tracking/RepoTracking'
import SavedFilters, { EMPTY_SAVED_FILTERS } from '../components/tracking/SavedFilters'
import EmptyState from '../components/ui/EmptyState'
import { BookmarkIcon, FilterIcon, ListIcon, TagIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { getStatusOption } from '../constants/repoStatus'
import { useToast } from '../hooks/useToast'

/**
 * tracking: acciones de seguimiento de useSavedRepos (updateStatus, updateNote, deleteNote, addTag, removeTag).
 * tagsState: lo que devuelve useTags.
 */
export default function SavedView({
  savedRepos,
  isLoading,
  isSaved,
  onToggleSave,
  onOpenDetail,
  listsState,
  tagsState,
  tracking,
}) {
  const { showToast } = useToast()
  const [filters, setFilters] = useState(EMPTY_SAVED_FILTERS)
  // Guardamos el id y buscamos el repo en cada render para que los diálogos vean siempre los datos al día.
  const [repoIdForLists, setRepoIdForLists] = useState(null)
  const [repoIdForNote, setRepoIdForNote] = useState(null)
  const [repoIdForTags, setRepoIdForTags] = useState(null)

  const findRepo = (savedId) => savedRepos.find((repo) => repo.savedId === savedId) ?? null
  const repoForLists = findRepo(repoIdForLists)
  const repoForNote = findRepo(repoIdForNote)
  const repoForTags = findRepo(repoIdForTags)

  // Si la etiqueta del filtro se ha eliminado, el filtro deja de aplicarse.
  const activeFilters = {
    status: filters.status,
    tagId: tagsState.getTagById(filters.tagId) ? filters.tagId : '',
  }

  const filteredRepos = savedRepos.filter(
    (repo) =>
      (!activeFilters.status || repo.status === activeFilters.status) &&
      (!activeFilters.tagId || repo.tagIds.includes(activeFilters.tagId)),
  )

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleResetFilters() {
    setFilters(EMPTY_SAVED_FILTERS)
  }

  function handleResetClick(event) {
    event.preventDefault()
    handleResetFilters()
  }

  // Los errores se muestran con un aviso; los diálogos muestran los suyos dentro del formulario.
  async function handleChangeStatus(repo, status) {
    try {
      await tracking.updateStatus(repo.savedId, status)
      showToast(`"${repo.name}" ahora está en «${getStatusOption(status).label}»`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleRemoveTag(repo, tag) {
    try {
      await tracking.removeTag(repo.savedId, tag.id)
      showToast(`Etiqueta "${tag.name}" quitada de "${repo.name}"`, 'info')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  async function handleSaveNote(repo, notes) {
    await tracking.updateNote(repo.savedId, notes)
    showToast(notes.trim() ? 'Nota guardada' : 'Nota borrada', notes.trim() ? 'success' : 'info')
  }

  async function handleDeleteNote(repo) {
    await tracking.deleteNote(repo.savedId)
    showToast('Nota borrada', 'info')
  }

  function renderTracking(repo) {
    const repoTags = repo.tagIds.map(tagsState.getTagById).filter(Boolean)

    return (
      <RepoTracking
        repo={repo}
        tags={repoTags}
        onChangeStatus={handleChangeStatus}
        onRemoveTag={handleRemoveTag}
        onOpenNote={(selected) => setRepoIdForNote(selected.savedId)}
      />
    )
  }

  function renderSavedActions(repo) {
    function handleOpenTags(event) {
      event.preventDefault()
      setRepoIdForTags(repo.savedId)
    }

    function handleOpenLists(event) {
      event.preventDefault()
      setRepoIdForLists(repo.savedId)
    }

    const listCount = listsState.lists.filter((list) => list.savedIds.includes(repo.savedId)).length

    return (
      <>
        <button
          type="button"
          onClick={handleOpenTags}
          className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'flex-1' })}
        >
          <TagIcon className="size-3.5" />
          Etiquetas
        </button>
        <button
          type="button"
          onClick={handleOpenLists}
          className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'flex-1' })}
        >
          <ListIcon className="size-3.5" />
          {listCount > 0 ? `En ${listCount} ${listCount === 1 ? 'lista' : 'listas'}` : 'Añadir a lista'}
        </button>
      </>
    )
  }

  function renderContent() {
    if (isLoading && savedRepos.length === 0) return <RepoGrid repos={[]} isLoading />

    if (savedRepos.length === 0) {
      return (
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
      )
    }

    return (
      <>
        <SavedFilters
          filters={activeFilters}
          tags={tagsState.tags}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          resultCount={filteredRepos.length}
          totalCount={savedRepos.length}
        />

        {filteredRepos.length === 0 ? (
          <EmptyState
            icon={<FilterIcon className="size-6" />}
            title="Ningún repositorio coincide"
            message="Prueba con otro estado u otra etiqueta, o restablece los filtros para ver toda tu colección."
            action={
              <button type="button" onClick={handleResetClick} className={buttonClasses({ variant: 'primary' })}>
                Restablecer filtros
              </button>
            }
          />
        ) : (
          <RepoGrid
            repos={filteredRepos}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
            onOpenDetail={onOpenDetail}
            renderTracking={renderTracking}
            renderActions={renderSavedActions}
          />
        )}
      </>
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

      {renderContent()}

      <AddToListDialog
        repo={repoForLists}
        lists={listsState.lists}
        onAdd={listsState.addRepoToList}
        onRemove={listsState.removeRepoFromList}
        onClose={() => setRepoIdForLists(null)}
      />

      {repoForNote && (
        <NoteDialog
          key={repoForNote.savedId}
          repo={repoForNote}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onClose={() => setRepoIdForNote(null)}
        />
      )}

      {repoForTags && (
        <TagPickerDialog
          subtitle={repoForTags.fullName}
          selectedTagIds={repoForTags.tagIds}
          tags={tagsState.tags}
          onAdd={(tagId) => tracking.addTag(repoForTags.savedId, tagId)}
          onRemove={(tagId) => tracking.removeTag(repoForTags.savedId, tagId)}
          onCreate={tagsState.createTag}
          onClose={() => setRepoIdForTags(null)}
        />
      )}
    </section>
  )
}
