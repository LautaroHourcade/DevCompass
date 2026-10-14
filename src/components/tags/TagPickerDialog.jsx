import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../ui/Modal'
import FormAlert from '../ui/FormAlert'
import { CheckIcon, PlusIcon, TagIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { CONTROL_CLASSES, LABEL_CLASSES } from '../ui/formStyles'
import { MAX_TAG_NAME_LENGTH, normalizeTagName } from '../../services/tagsService'

/**
 * Marca o desmarca las etiquetas de un elemento (repositorio guardado o lista).
 * Cada casilla se guarda al momento y se puede crear una etiqueta nueva que se asigna directamente.
 * - subtitle: qué se está etiquetando (p. ej. el nombre del repositorio).
 * - selectedTagIds: etiquetas que ya tiene.
 * - onAdd(tagId) / onRemove(tagId) / onCreate(name): asíncronas; si fallan, el error se muestra aquí.
 */
export default function TagPickerDialog({ subtitle, selectedTagIds, tags, onAdd, onRemove, onCreate, onClose }) {
  const [pendingTagId, setPendingTagId] = useState(null)
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle(tag, hasTag) {
    setPendingTagId(tag.id)
    setError('')

    try {
      if (hasTag) {
        await onRemove(tag.id)
      } else {
        await onAdd(tag.id)
      }
    } catch (caughtError) {
      setError(caughtError.message)
    } finally {
      setPendingTagId(null)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()

    const name = normalizeTagName(newTagName)
    if (!name) {
      setError('Escribe un nombre para la etiqueta.')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // Si ya existe (sin distinguir mayúsculas), se usa esa en lugar de crear un duplicado.
      const existing = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())
      const tag = existing ?? (await onCreate(name))
      await onAdd(tag.id)
      setNewTagName('')
    } catch (caughtError) {
      setError(caughtError.message)
    } finally {
      setIsCreating(false)
    }
  }

  function handleClose(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} labelledBy="tag-picker-title">
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h2 id="tag-picker-title" className="text-xl font-semibold">
            Etiquetas
          </h2>
          <p className="font-mono text-sm text-muted">{subtitle}</p>
        </header>

        {error && <FormAlert type="error">{error}</FormAlert>}

        {tags.length === 0 ? (
          <FormAlert type="info">Todavía no tienes etiquetas. Crea la primera aquí abajo.</FormAlert>
        ) : (
          <fieldset className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
            <legend className="sr-only">Tus etiquetas</legend>
            {tags.map((tag) => {
              const hasTag = selectedTagIds.includes(tag.id)
              const isPending = pendingTagId === tag.id

              return (
                <label
                  key={tag.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    hasTag ? 'border-accent/50 bg-accent-soft' : 'border-line-strong hover:border-accent/40'
                  } ${isPending ? 'opacity-60' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={hasTag}
                    disabled={isPending}
                    onChange={() => handleToggle(tag, hasTag)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-5 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                      hasTag ? 'border-accent bg-accent text-on-accent' : 'border-line-strong'
                    }`}
                  >
                    {hasTag && <CheckIcon className="size-3.5" strokeWidth={3} />}
                  </span>
                  <TagIcon className="size-4 text-muted" />
                  <span className="flex-1 truncate font-mono text-sm">{tag.name}</span>
                </label>
              )
            })}
          </fieldset>
        )}

        <form onSubmit={handleCreate} noValidate className="flex flex-col gap-1.5 border-t border-line pt-5">
          <label htmlFor="new-tag-name" className={LABEL_CLASSES}>
            Nueva etiqueta
          </label>
          <div className="flex gap-2">
            <input
              id="new-tag-name"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              maxLength={MAX_TAG_NAME_LENGTH}
              placeholder="Ej: React, Testing, DevOps"
              autoComplete="off"
              disabled={isCreating}
              className={`${CONTROL_CLASSES} font-mono placeholder:font-sans`}
            />
            <button type="submit" disabled={isCreating} className={buttonClasses({ variant: 'primary' })}>
              <PlusIcon className="size-4" />
              <span className="sr-only sm:not-sr-only">{isCreating ? 'Creando…' : 'Crear'}</span>
            </button>
          </div>
        </form>

        <footer className="flex items-center justify-between gap-2">
          <Link to="/etiquetas" onClick={onClose} className="text-sm font-medium text-accent hover:underline">
            Gestionar etiquetas
          </Link>
          <button type="button" onClick={handleClose} className={buttonClasses()}>
            Hecho
          </button>
        </footer>
      </div>
    </Modal>
  )
}
