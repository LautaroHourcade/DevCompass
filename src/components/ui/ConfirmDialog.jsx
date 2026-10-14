import { useId, useState } from 'react'
import Modal from './Modal'
import TextField from './TextField'
import FormAlert from './FormAlert'
import { AlertIcon } from './Icons'
import { buttonClasses } from './buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'

/**
 * Confirmación de una acción destructiva con el estilo de la web (sustituye a window.confirm).
 * - onConfirm puede ser asíncrona: mientras se ejecuta, los botones quedan deshabilitados.
 * - confirmText: si se indica, hay que escribirlo exactamente para poder confirmar.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  confirmText = '',
  onConfirm,
  onClose,
}) {
  const titleId = useId()
  const inputId = useId()
  const [typedText, setTypedText] = useState('')
  const { isSubmitting, error, setError, run } = useFormSubmit()

  const canConfirm = !confirmText || typedText.trim() === confirmText

  function handleClose() {
    if (isSubmitting) return
    setTypedText('')
    setError('')
    onClose()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canConfirm) return

    const isDone = await run(onConfirm)
    if (isDone) {
      setTypedText('')
      onClose()
    }
  }

  function handleCancel(event) {
    event.preventDefault()
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} labelledBy={titleId}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <header className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <AlertIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            <p className="text-sm text-muted">{message}</p>
          </div>
        </header>

        {confirmText && (
          <TextField
            id={inputId}
            label={`Escribe "${confirmText}" para confirmar`}
            value={typedText}
            onChange={setTypedText}
            autoComplete="off"
          />
        )}

        {error && <FormAlert type="error">{error}</FormAlert>}

        <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleCancel} disabled={isSubmitting} className={buttonClasses()}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canConfirm || isSubmitting}
            className={buttonClasses({ variant: 'danger' })}
          >
            {isSubmitting ? 'Procesando…' : confirmLabel}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
