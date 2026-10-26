import { useState } from 'react'
import StatusSelect from './StatusSelect'
import TagChip from '../tags/TagChip'
import { NoteIcon } from '../ui/Icons'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Seguimiento personal dentro de la tarjeta de un repositorio guardado:
 * estado, indicador de nota y etiquetas.
 * onChangeStatus y onRemoveTag son asíncronas; quien las pasa se encarga de avisar del resultado.
 */
export default function RepoTracking({ repo, tags, onChangeStatus, onRemoveTag, onOpenNote }) {
  const { t } = useTranslation()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [removingTagId, setRemovingTagId] = useState(null)

  const hasNote = Boolean(repo.notes)

  async function handleStatusChange(status) {
    setIsUpdatingStatus(true)
    await onChangeStatus(repo, status)
    setIsUpdatingStatus(false)
  }

  async function handleRemoveTag(tag) {
    setRemovingTagId(tag.id)
    await onRemoveTag(repo, tag)
    setRemovingTagId(null)
  }

  function handleOpenNote(event) {
    event.preventDefault()
    onOpenNote(repo)
  }

  return (
    <section aria-label={t('tracking.region')} className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusSelect
          id={`status-${repo.savedId}`}
          label={t('tracking.statusOf', { name: repo.name })}
          value={repo.status}
          disabled={isUpdatingStatus}
          onChange={handleStatusChange}
        />

        <button
          type="button"
          onClick={handleOpenNote}
          title={hasNote ? t('tracking.editNote') : t('tracking.addNote')}
          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-[border-color,color,scale] duration-150 active:scale-[0.97] ${
            hasNote
              ? 'border-star/40 bg-star/10 text-star hover:border-star'
              : 'border-dashed border-line-strong text-muted hover:border-accent hover:text-accent'
          }`}
        >
          <NoteIcon className="size-3.5" />
          {hasNote ? t('tracking.hasNote') : t('tracking.noNote')}
        </button>
      </div>

      {hasNote && <p className="line-clamp-2 border-l-2 border-star/50 pl-3 text-xs text-muted">{repo.notes}</p>}

      {tags.length > 0 && (
        <ul aria-label={t('nav.tags')} className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag.id}>
              <TagChip
                name={tag.name}
                isRemoving={removingTagId === tag.id}
                onRemove={() => handleRemoveTag(tag)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
