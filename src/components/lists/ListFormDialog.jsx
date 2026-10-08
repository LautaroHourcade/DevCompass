import { useState } from 'react'
import Modal from '../ui/Modal'
import TextField from '../ui/TextField'
import FormAlert from '../ui/FormAlert'
import { buttonClasses } from '../ui/buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import { MAX_LIST_DESCRIPTION_LENGTH, MAX_LIST_NAME_LENGTH } from '../../services/listsService'

/**
 * Crear o editar una lista. Con `list` edita; sin ella crea una nueva.
 * Se monta con un `key` distinto cada vez que se abre, para empezar con los valores correctos.
 */
export default function ListFormDialog({ isOpen, list = null, onSubmit, onClose }) {
  const isEditing = Boolean(list)
  const [name, setName] = useState(list?.name ?? '')
  const [description, setDescription] = useState(list?.description ?? '')
  const [nameError, setNameError] = useState('')
  const { isSubmitting, error, run } = useFormSubmit()

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Ponle un nombre a la lista.')
      return
    }
    setNameError('')

    const isDone = await run(() => onSubmit({ name: trimmedName, description }))
    if (isDone) onClose()
  }

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="list-form-title">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <h2 id="list-form-title" className="text-xl font-semibold">
          {isEditing ? 'Editar lista' : 'Nueva lista'}
        </h2>

        {error && <FormAlert type="error">{error}</FormAlert>}

        <TextField
          id="list-name"
          label="Nombre"
          placeholder="Ej: Herramientas de testing"
          maxLength={MAX_LIST_NAME_LENGTH}
          value={name}
          onChange={setName}
          error={nameError}
        />
        <TextField
          id="list-description"
          label="Descripción (opcional)"
          multiline
          maxLength={MAX_LIST_DESCRIPTION_LENGTH}
          hint={`${description.length}/${MAX_LIST_DESCRIPTION_LENGTH} caracteres`}
          value={description}
          onChange={setDescription}
        />

        <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleCancel} disabled={isSubmitting} className={buttonClasses()}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className={buttonClasses({ variant: 'primary' })}>
            {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear lista'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
