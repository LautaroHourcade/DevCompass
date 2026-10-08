import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ListCard from '../components/lists/ListCard'
import ListFormDialog from '../components/lists/ListFormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import PageLoader from '../components/ui/PageLoader'
import { ListIcon, PlusIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useToast } from '../hooks/useToast'

/** listsState: lo que devuelve useLists (listas y acciones). */
export default function ListsView({ listsState }) {
  const { lists, isLoading, createList, updateList, deleteList } = listsState
  const { showToast } = useToast()
  // null: cerrado. { list: null }: crear. { list }: editar.
  const [formState, setFormState] = useState(null)
  const [listToDelete, setListToDelete] = useState(null)

  function handleOpenCreate(event) {
    event.preventDefault()
    setFormState({ list: null })
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

      {isLoading && lists.length === 0 ? (
        <PageLoader label="Cargando tus listas…" />
      ) : lists.length === 0 ? (
        <EmptyState
          icon={<ListIcon className="size-6" />}
          title="Todavía no tienes listas"
          message="Crea una lista y añade repositorios desde tu colección de guardados."
          action={createButton}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list, index) => (
            <li key={list.id}>
              <ListCard
                list={list}
                index={index}
                onEdit={(selected) => setFormState({ list: selected })}
                onDelete={setListToDelete}
              />
            </li>
          ))}
        </ul>
      )}

      {formState && (
        <ListFormDialog
          isOpen
          list={formState.list}
          onSubmit={handleSubmitForm}
          onClose={() => setFormState(null)}
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
