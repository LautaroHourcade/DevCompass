import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import TagFormDialog from '../components/tags/TagFormDialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageLoader from '../components/ui/PageLoader'
import { EditIcon, PlusIcon, TagIcon, TrashIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'

/**
 * Consultar, crear, renombrar y eliminar etiquetas.
 * onTagDeleted: avisa para quitar la etiqueta de los repos guardados y las listas en pantalla.
 */
export default function TagsView({ tagsState, savedRepos, lists, onTagDeleted }) {
  const { tags, isLoading, loadError, reload, createTag, renameTag, deleteTag } = tagsState
  const { showToast } = useToast()
  const { t } = useTranslation()
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
    return `${t('tags.repoCount', { count: repoCount })} · ${t('tags.listCount', { count: listCount })}`
  }

  function handleOpenCreate(event) {
    event.preventDefault()
    setFormState({ tag: null })
  }

  async function handleSubmitForm(name) {
    if (formState.tag) {
      await renameTag(formState.tag.id, name)
      showToast(t('tags.toast.renamed', { name }), 'success')
    } else {
      await createTag(name)
      showToast(t('tags.toast.created', { name }), 'success')
    }
  }

  async function handleConfirmDelete() {
    await deleteTag(tagToDelete.id)
    onTagDeleted(tagToDelete.id)
    showToast(t('tags.toast.deleted', { name: tagToDelete.name }), 'info')
  }

  const createButton = (
    <button type="button" onClick={handleOpenCreate} className={buttonClasses({ variant: 'primary' })}>
      <PlusIcon className="size-4" />
      {t('tags.new')}
    </button>
  )

  const isTagInUse = tagToDelete && (countReposWithTag(tagToDelete.id) > 0 || countListsWithTag(tagToDelete.id) > 0)

  return (
    <section aria-labelledby="tags-title" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={t('tags.eyebrow')}
        title={t('tags.title')}
        titleId="tags-title"
        description={t('tags.description')}
      >
        {tags.length > 0 && createButton}
      </PageHeader>

      {loadError ? (
        <ErrorMessage error={loadError} onRetry={reload} />
      ) : isLoading && tags.length === 0 ? (
        <PageLoader label={t('tags.loading')} />
      ) : tags.length === 0 ? (
        <EmptyState
          icon={<TagIcon className="size-6" />}
          title={t('tags.empty.title')}
          message={t('tags.empty.message')}
          action={createButton}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag, index) => {
            return (
              <li
                key={tag.id}
                style={{ animationDelay: `${(index % 8) * 40}ms` }}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 pl-4 shadow-card transition-[border-color] duration-150 animate-fade-up hover:border-line-strong"
              >
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface-2 font-mono text-base text-accent">
                  #
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-mono text-base font-medium">{tag.name}</h2>
                  <p className="font-mono text-xs text-muted tabular-nums">
                    {describeUsage(countReposWithTag(tag.id), countListsWithTag(tag.id))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    setFormState({ tag })
                  }}
                  aria-label={t('tags.renameTag', { name: tag.name })}
                  title={t('tags.rename')}
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
                  aria-label={t('tags.deleteTag', { name: tag.name })}
                  title={t('common.delete')}
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
          title={t('tags.delete.title', { name: tagToDelete.name })}
          message={
            isTagInUse
              ? t('tags.delete.inUse', { usage: describeUsage(countReposWithTag(tagToDelete.id), countListsWithTag(tagToDelete.id)) })
              : t('tags.delete.unused')
          }
          confirmLabel={t('tags.delete.confirm')}
          onConfirm={handleConfirmDelete}
          onClose={() => setTagToDelete(null)}
        />
      )}
    </section>
  )
}
