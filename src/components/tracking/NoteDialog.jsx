import { useState } from 'react'
import Modal from '../ui/Modal'
import TextField from '../ui/TextField'
import FormAlert from '../ui/FormAlert'
import { TrashIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import { MAX_NOTE_LENGTH } from '../../services/savedReposService'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Añadir, editar o borrar la nota de un repositorio guardado.
 * Borrar la nota no quita el repositorio de la colección.
 * Se monta con un `key` distinto por repositorio para empezar con su nota.
 */
export default function NoteDialog({ repo, onSave, onDelete, onClose }) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState(repo.notes)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { isSubmitting, error, run } = useFormSubmit()

  const hasSavedNote = Boolean(repo.notes)

  async function handleSubmit(event) {
    event.preventDefault()
    const isDone = await run(() => onSave(repo, notes))
    if (isDone) onClose()
  }

  function handleAskDelete(event) {
    event.preventDefault()
    setIsConfirmingDelete(true)
  }

  function handleCancelDelete(event) {
    event.preventDefault()
    setIsConfirmingDelete(false)
  }

  async function handleConfirmDelete(event) {
    event.preventDefault()
    const isDone = await run(() => onDelete(repo))
    if (isDone) onClose()
  }

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  function handleModalClose() {
    if (!isSubmitting) onClose()
  }

  return (
    <Modal isOpen onClose={handleModalClose} labelledBy="note-dialog-title">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h2 id="note-dialog-title" className="text-xl font-semibold">
            {hasSavedNote ? t('note.yourNote') : t('note.add')}
          </h2>
          <p className="font-mono text-sm text-muted">{repo.fullName}</p>
        </header>

        {error && <FormAlert type="error">{error}</FormAlert>}

        <TextField
          id="repo-note"
          label={t('note.label')}
          multiline
          rows={6}
          placeholder={t('note.placeholder')}
          maxLength={MAX_NOTE_LENGTH}
          hint={t('note.hint', { length: notes.length, max: MAX_NOTE_LENGTH })}
          value={notes}
          onChange={setNotes}
          disabled={isSubmitting}
        />

        {isConfirmingDelete ? (
          <div className="flex flex-col gap-3 rounded-lg border border-danger/40 bg-danger/5 p-4 animate-fade-up">
            <p role="alert" className="text-sm">
              {t('note.confirmDelete')}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isSubmitting}
                className={buttonClasses({ size: 'sm' })}
              >
                {t('note.keep')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className={buttonClasses({ variant: 'danger', size: 'sm' })}
              >
                {isSubmitting ? t('note.deleting') : t('note.confirmDeleteButton')}
              </button>
            </div>
          </div>
        ) : (
          <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            {hasSavedNote && (
              <button
                type="button"
                onClick={handleAskDelete}
                disabled={isSubmitting}
                className={buttonClasses({ variant: 'danger-outline', className: 'sm:mr-auto' })}
              >
                <TrashIcon className="size-4" />
                {t('note.delete')}
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={buttonClasses({ className: hasSavedNote ? '' : 'sm:ml-auto' })}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting} className={buttonClasses({ variant: 'primary' })}>
              {isSubmitting ? t('common.saving') : t('note.save')}
            </button>
          </footer>
        )}
      </form>
    </Modal>
  )
}
