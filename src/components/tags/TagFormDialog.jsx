import { useState } from 'react'
import Modal from '../ui/Modal'
import TextField from '../ui/TextField'
import FormAlert from '../ui/FormAlert'
import { buttonClasses } from '../ui/buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import { MAX_TAG_NAME_LENGTH, normalizeTagName } from '../../services/tagsService'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Crear o renombrar una etiqueta. Con `tag` renombra; sin ella crea una nueva.
 * existingTags: para avisar de duplicados (sin distinguir mayúsculas ni espacios) antes de ir a Supabase.
 */
export default function TagFormDialog({ tag = null, existingTags, onSubmit, onClose }) {
  const { t } = useTranslation()
  const isEditing = Boolean(tag)
  const [name, setName] = useState(tag?.name ?? '')
  const [nameError, setNameError] = useState('')
  const { isSubmitting, error, run } = useFormSubmit()

  function getNameError(normalizedName) {
    if (!normalizedName) return t('tags.form.nameRequired')

    const isDuplicate = existingTags.some(
      (candidate) => candidate.id !== tag?.id && candidate.name.toLowerCase() === normalizedName.toLowerCase(),
    )
    if (isDuplicate) return t('errors.tags.duplicate')

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedName = normalizeTagName(name)
    const validationError = getNameError(normalizedName)
    setNameError(validationError)
    if (validationError) return

    const isDone = await run(() => onSubmit(normalizedName))
    if (isDone) onClose()
  }

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} labelledBy="tag-form-title">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <h2 id="tag-form-title" className="text-xl font-semibold">
          {isEditing ? t('tags.form.renameTitle') : t('tags.new')}
        </h2>

        {error && <FormAlert type="error">{error}</FormAlert>}

        <TextField
          id="tag-name"
          label={t('auth.name')}
          placeholder={t('tags.form.placeholder')}
          maxLength={MAX_TAG_NAME_LENGTH}
          autoComplete="off"
          hint={t('tags.form.hint', { max: MAX_TAG_NAME_LENGTH })}
          value={name}
          onChange={setName}
          error={nameError}
        />

        <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleCancel} disabled={isSubmitting} className={buttonClasses()}>
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={isSubmitting} className={buttonClasses({ variant: 'primary' })}>
            {isSubmitting ? t('common.saving') : isEditing ? t('profile.details.submit') : t('tags.form.create')}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
