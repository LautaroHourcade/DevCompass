import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ListCard from '../components/lists/ListCard'
import ListFormDialog from '../components/lists/ListFormDialog'
import { SelectField } from '../components/search/FilterField'
import TagPickerDialog from '../components/tags/TagPickerDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageLoader from '../components/ui/PageLoader'
import { FilterIcon, ListIcon, PlusIcon, ResetIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useToast } from '../hooks/useToast'

/**
 * listsState: lo que devuelve useLists (listas y acciones).
 * tagsState: lo que devuelve useTags.
 */
export default function ListsView({ listsState, tagsState }) {
  const { lists, isLoading, loadError, reload, createList, updateList, deleteList, addTagToList, removeTagFromList } = listsState
  const { showToast } = useToast()
  // null: cerrado. { list: null }: crear. { list }: editar.
  const [formState, setFormState] = useState(null)
  const [listToDelete, setListToDelete] = useState(null)
  // Guardamos el id y buscamos la lista en cada render para que el selector vea siempre sus etiquetas al día.
  const [listIdForTags, setListIdForTags] = useState(null)
  const [tagFilter, setTagFilter] = useState('')

  const listForTags = lists.find((list) => list.id === listIdForTags) ?? null

  // Si la etiqueta del filtro se ha eliminado, el filtro deja de aplicarse.
  const activeTagFilter = tagsState.getTagById(tagFilter) ? tagFilter : ''
  const filteredLists = activeTagFilter ? lists.filter((list) => list.tagIds.includes(activeTagFilter)) : lists
  const tagOptions = tagsState.tags.map((tag) => ({ value: tag.id, label: tag.name }))

  function handleOpenCreate(event) {
    event.preventDefault()
    setFormState({ list: null })
  }

  function handleResetFilter(event) {
    event.preventDefault()
    setTagFilter('')
  }

  // El filtro se aplica al momento; el formulario no se envía nunca.
  function handleFilterSubmit(event) {
    event.preventDefault()
  }

  async function handleSubmitForm(values) {
    if (formState.list) {
      await updateList(formState.list.id, values)
      showToast('Lista actualizada', 'success')
    } else {
      await createList(values)
      showToast(`Lista "${values.name}" creada`, 'success')
    }
  }

  async function handleConfirmDelete() {
    await deleteList(listToDelete.id)
    showToast(`Lista "${listToDelete.name}" eliminada`, 'info')
  }

  const createButton = (
    <button type="button" onClick={handleOpenCreate} className={buttonClasses({ variant: 'primary' })}>
      <PlusIcon className="size-4" />
      Nueva lista
    </button>
  )

  function renderLists() {
    if (filteredLists.length === 0) {
      return (
        <EmptyState
          icon={<FilterIcon className="size-6" />}
          title="Ninguna lista tiene esta etiqueta"
          message="Asigna etiquetas a tus listas con el botón de etiqueta de cada tarjeta, o restablece el filtro."
          action={
            <button type="button" onClick={handleResetFilter} className={buttonClasses({ variant: 'primary' })}>
              Restablecer filtro
            </button>
          }
        />
      )
    }

    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLists.map((list, index) => (
          <li key={list.id}>
            <ListCard
              list={list}
              tags={list.tagIds.map(tagsState.getTagById).filter(Boolean)}
              index={index}
              onEdit={(selected) => setFormState({ list: selected })}
              onEditTags={(selected) => setListIdForTags(selected.id)}
              onDelete={setListToDelete}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="lists-title" className="flex flex-col gap-6">
      <PageHeader
        command="ls ~/listas"
        title="Tus listas"
        titleId="lists-title"
        description="Agrupa tus repositorios guardados por tema, proyecto o lo que necesites."
      >
        {lists.length > 0 && createButton}
      </PageHeader>

      {loadError ? (
        <ErrorMessage error={loadError} onRetry={reload} />
      ) : isLoading && lists.length === 0 ? (
        <PageLoader label="Cargando tus listas…" />
      ) : lists.length === 0 ? (
        <EmptyState
          icon={<ListIcon className="size-6" />}
          title="Todavía no tienes listas"
          message="Crea una lista y añade repositorios desde tu colección de guardados."
          action={createButton}
        />
      ) : (
        <>
          {tagsState.tags.length > 0 && (
            <form
              onSubmit={handleFilterSubmit}
              aria-label="Filtrar listas por etiqueta"
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 animate-fade-up min-[480px]:flex-row min-[480px]:items-end"
            >
              <div className="min-[480px]:w-[28rem]">
                <SelectField
                  id="lists-filter-tag"
                  label="Etiqueta"
                  value={activeTagFilter}
                  options={tagOptions}
                  placeholder="Todas las etiquetas"
                  onChange={setTagFilter}
                />
              </div>
              <p className="font-mono text-xs text-muted min-[480px]:mb-3 min-[480px]:ml-auto" aria-live="polite">
                {filteredLists.length} de {lists.length}
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                disabled={!activeTagFilter}
                className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'min-[480px]:mb-1' })}
              >
                <ResetIcon className="size-3.5" />
                Restablecer filtro
              </button>
            </form>
          )}

          {renderLists()}
        </>
      )}

      {formState && (
        <ListFormDialog
          isOpen
          list={formState.list}
          onSubmit={handleSubmitForm}
          onClose={() => setFormState(null)}
        />
      )}

      {listForTags && (
        <TagPickerDialog
          subtitle={listForTags.name}
          selectedTagIds={listForTags.tagIds}
          tags={tagsState.tags}
          onAdd={(tagId) => addTagToList(listForTags.id, tagId)}
          onRemove={(tagId) => removeTagFromList(listForTags.id, tagId)}
          onCreate={tagsState.createTag}
          onClose={() => setListIdForTags(null)}
        />
      )}

      {listToDelete && (
        <ConfirmDialog
          isOpen
          title={`¿Eliminar la lista "${listToDelete.name}"?`}
          message="Los repositorios seguirán en tus guardados; solo se borra la lista."
          confirmLabel="Eliminar lista"
          onConfirm={handleConfirmDelete}
          onClose={() => setListToDelete(null)}
        />
      )}
    </section>
  )
}
