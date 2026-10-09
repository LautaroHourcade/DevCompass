import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import TagFormDialog from '../components/tags/TagFormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import PageLoader from '../components/ui/PageLoader'
import { EditIcon, PlusIcon, TagIcon, TrashIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useToast } from '../hooks/useToast'

/**
 * Consultar, crear, renombrar y eliminar etiquetas.
 * onTagDeleted: avisa para quitar la etiqueta de los repos guardados y las listas en pantalla.
 */
export default function TagsView({ tagsState, savedRepos, lists, onTagDeleted }) {
  const { tags, isLoading, createTag, renameTag, deleteTag } = tagsState
  const { showToast } = useToast()
  // null: cerrado. { tag: null }: crear. { tag }: renombrar.
  const [formState, setFormState] = useState(null)
  const [tagToDelete, setTagToDelete] = useState(null)

  function countReposWithTag(tagId) {
    return savedRepos.filter((repo) => repo.tagIds.includes(tagId)).length
  }

  function countListsWithTag(tagId) {
    return lists.filter((list) => list.tagIds.includes(tagId)).length
  }

  function describeUsage(repoCount, listCount) {
    const repoText = repoCount === 1 ? '1 repositorio' : `${repoCount} repositorios`
    const listText = listCount === 1 ? '1 lista' : `${listCount} listas`
    return `${repoText} · ${listText}`
  }

  function handleOpenCreate(event) {
    event.preventDefault()
    setFormState({ tag: null })
  }

  async function handleSubmitForm(name) {
    if (formState.tag) {
      await renameTag(formState.tag.id, name)
      showToast(`Etiqueta renombrada a "${name}"`, 'success')
    } else {
      await createTag(name)
      showToast(`Etiqueta "${name}" creada`, 'success')
    }
  }

  async function handleConfirmDelete() {
    await deleteTag(tagToDelete.id)
    onTagDeleted(tagToDelete.id)
    showToast(`Etiqueta "${tagToDelete.name}" eliminada`, 'info')
  }

  const createButton = (
    <button type="button" onClick={handleOpenCreate} className={buttonClasses({ variant: 'primary' })}>
      <PlusIcon className="size-4" />
      Nueva etiqueta
    </button>
  )

  const isTagInUse = tagToDelete && (countReposWithTag(tagToDelete.id) > 0 || countListsWithTag(tagToDelete.id) > 0)

  return (
    <section aria-labelledby="tags-title" className="flex flex-col gap-6">
      <PageHeader
        command="ls ~/etiquetas"
        title="Tus etiquetas"
        titleId="tags-title"
        description="Clasifica tus repositorios guardados y tus listas por tecnología, tema o como prefieras."
      >
        {tags.length > 0 && createButton}
      </PageHeader>

      {isLoading && tags.length === 0 ? (
        <PageLoader label="Cargando tus etiquetas…" />
      ) : tags.length === 0 ? (
        <EmptyState
          icon={<TagIcon className="size-6" />}
          title="Todavía no tienes etiquetas"
          message="Crea etiquetas como Java, React o DevOps y asígnalas a tus repositorios guardados y a tus listas."
          action={createButton}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag, index) => {
            return (
              <li
                key={tag.id}
                style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 transition-colors animate-fade-up hover:border-purple/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple">
                  <TagIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-mono text-base font-semibold">{tag.name}</h2>
                  <p className="text-xs text-muted">
                    {describeUsage(countReposWithTag(tag.id), countListsWithTag(tag.id))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    setFormState({ tag })
                  }}
                  aria-label={`Renombrar la etiqueta ${tag.name}`}
                  title="Renombrar"
                  className={buttonClasses({ variant: 'ghost', size: 'icon' })}
                >
                  <EditIcon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    setTagToDelete(tag)
                  }}
                  aria-label={`Eliminar la etiqueta ${tag.name}`}
                  title="Eliminar"
                  className={buttonClasses({ variant: 'ghost', size: 'icon', className: 'hover:text-danger' })}
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {formState && (
        <TagFormDialog
          tag={formState.tag}
          existingTags={tags}
          onSubmit={handleSubmitForm}
          onClose={() => setFormState(null)}
        />
      )}

      {tagToDelete && (
        <ConfirmDialog
          isOpen
          title={`¿Eliminar la etiqueta "${tagToDelete.name}"?`}
          message={
            isTagInUse
              ? `Se quitará de ${describeUsage(countReposWithTag(tagToDelete.id), countListsWithTag(tagToDelete.id))}. Los repositorios y las listas no se borran.`
              : 'Nada la usa todavía. Tus repositorios y listas no se verán afectados.'
          }
          confirmLabel="Eliminar etiqueta"
          onConfirm={handleConfirmDelete}
          onClose={() => setTagToDelete(null)}
        />
      )}
    </section>
  )
}
