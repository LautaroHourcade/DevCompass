import { useState } from 'react'
import ProfileSection from './ProfileSection'
import TextField from '../ui/TextField'
import FormAlert from '../ui/FormAlert'
import { buttonClasses } from '../ui/buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import { changePassword, sendPasswordChangeCode } from '../../services/authService'
import {
  MIN_PASSWORD_LENGTH,
  getPasswordConfirmError,
  getPasswordError,
  hasNoErrors,
} from '../../utils/validation'

/**
 * Cambio de contraseña confirmado por email, en dos pasos:
 * 1. Enviamos un código al email del usuario (reautenticación de Supabase).
 * 2. El usuario escribe el código y la nueva contraseña.
 */
export default function PasswordChangeForm({ email }) {
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const { isSubmitting, error, run } = useFormSubmit()

  async function handleSendCode(event) {
    event.preventDefault()
    setSuccessMessage('')

    const isSent = await run(sendPasswordChangeCode)
    if (isSent) setIsCodeSent(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = {
      code: code.trim() ? '' : 'Escribe el código que te hemos enviado.',
      newPassword: getPasswordError(newPassword),
      passwordConfirm: getPasswordConfirmError(newPassword, passwordConfirm),
    }
    setFieldErrors(errors)
    if (!hasNoErrors(errors)) return

    const isChanged = await run(() => changePassword({ newPassword, code: code.trim() }))
    if (!isChanged) return

    setIsCodeSent(false)
    setCode('')
    setNewPassword('')
    setPasswordConfirm('')
    setSuccessMessage('Contraseña actualizada.')
  }

  function handleCancel(event) {
    event.preventDefault()
    setIsCodeSent(false)
    setFieldErrors({})
  }

  return (
    <ProfileSection
      title="Contraseña"
      titleId="profile-password-title"
      description="Por seguridad, para cambiarla te enviamos un código a tu email."
    >
      {error && <FormAlert type="error">{error}</FormAlert>}
      {successMessage && <FormAlert type="success">{successMessage}</FormAlert>}

      {!isCodeSent ? (
        <button
          type="button"
          onClick={handleSendCode}
          disabled={isSubmitting}
          className={buttonClasses({ className: 'self-start' })}
        >
          {isSubmitting ? 'Enviando código…' : 'Enviar código a mi email'}
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormAlert type="info">
            Hemos enviado un código a <strong>{email}</strong>. Puede tardar un minuto en llegar.
          </FormAlert>

          <TextField
            id="password-code"
            label="Código de verificación"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={setCode}
            error={fieldErrors.code}
            className="sm:max-w-[24rem]"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="password-new"
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
              value={newPassword}
              onChange={setNewPassword}
              error={fieldErrors.newPassword}
            />
            <TextField
              id="password-confirm"
              label="Repite la nueva contraseña"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              error={fieldErrors.passwordConfirm}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={isSubmitting} className={buttonClasses({ variant: 'primary' })}>
              {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
            <button type="button" onClick={handleSendCode} disabled={isSubmitting} className={buttonClasses()}>
              Reenviar código
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={buttonClasses({ variant: 'ghost' })}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </ProfileSection>
  )
}
