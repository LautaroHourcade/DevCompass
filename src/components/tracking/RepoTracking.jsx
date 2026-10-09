import { useState } from 'react'
import StatusSelect from './StatusSelect'
import TagChip from '../tags/TagChip'
import { NoteIcon } from '../ui/Icons'

/**
 * Seguimiento personal dentro de la tarjeta de un repositorio guardado:
 * estado, indicador de nota y etiquetas.
 * onChangeStatus y onRemoveTag son asíncronas; quien las pasa se encarga de avisar del resultado.
 */
export default function RepoTracking({ repo, tags, onChangeStatus, onRemoveTag, onOpenNote }) {
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
    <section aria-label="Tu seguimiento" className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusSelect
          id={`status-${repo.savedId}`}
          label={`Estado de ${repo.name}`}
          value={repo.status}
          disabled={isUpdatingStatus}
          onChange={handleStatusChange}
        />

        <button
          type="button"
          onClick={handleOpenNote}
          title={hasNote ? 'Ver o editar la nota' : 'Añadir una nota'}
          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
            hasNote
              ? 'border-star/40 bg-star/10 text-star hover:border-star'
              : 'border-dashed border-line text-muted hover:border-accent hover:text-accent'
          }`}
        >
          <NoteIcon className="size-3.5" />
          {hasNote ? 'Con nota' : 'Sin nota'}
        </button>
      </div>

      {hasNote && <p className="line-clamp-2 border-l-2 border-star/50 pl-3 text-xs text-muted italic">{repo.notes}</p>}

      {tags.length > 0 && (
        <ul aria-label="Etiquetas" className="flex flex-wrap gap-1.5">
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
