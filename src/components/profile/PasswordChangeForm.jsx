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
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Cambio de contraseña confirmado por email, en dos pasos:
 * 1. Enviamos un código al email del usuario (reautenticación de Supabase).
 * 2. El usuario escribe el código y la nueva contraseña.
 */
export default function PasswordChangeForm({ email }) {
  const { t } = useTranslation()
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successKey, setSuccessKey] = useState('')
  const { isSubmitting, error, run } = useFormSubmit()

  async function handleSendCode(event) {
    event.preventDefault()
    setSuccessKey('')

    const isSent = await run(sendPasswordChangeCode)
    if (isSent) setIsCodeSent(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = {
      code: code.trim() ? '' : t('profile.password.codeRequired'),
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
    setSuccessKey('profile.password.updated')
  }

  function handleCancel(event) {
    event.preventDefault()
    setIsCodeSent(false)
    setFieldErrors({})
  }

  return (
    <ProfileSection
      title={t('profile.password.title')}
      titleId="profile-password-title"
      description={t('profile.password.description')}
    >
      {error && <FormAlert type="error">{error}</FormAlert>}
      {successKey && <FormAlert type="success">{t(successKey)}</FormAlert>}

      {!isCodeSent ? (
        <button
          type="button"
          onClick={handleSendCode}
          disabled={isSubmitting}
          className={buttonClasses({ className: 'self-start' })}
        >
          {isSubmitting ? t('profile.password.sendingCode') : t('profile.password.sendCode')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormAlert type="info">
            {t('profile.password.codeSentBefore')} <strong>{email}</strong>
            {t('profile.password.codeSentAfter')}
          </FormAlert>

          <TextField
            id="password-code"
            label={t('profile.password.code')}
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
              label={t('profile.password.new')}
              type="password"
              autoComplete="new-password"
              hint={t('validation.passwordHint', { min: MIN_PASSWORD_LENGTH })}
              value={newPassword}
              onChange={setNewPassword}
              error={fieldErrors.newPassword}
            />
            <TextField
              id="password-confirm"
              label={t('profile.password.repeatNew')}
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              error={fieldErrors.passwordConfirm}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={isSubmitting} className={buttonClasses({ variant: 'primary' })}>
              {isSubmitting ? t('common.saving') : t('profile.password.submit')}
            </button>
            <button type="button" onClick={handleSendCode} disabled={isSubmitting} className={buttonClasses()}>
              {t('profile.password.resendCode')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={buttonClasses({ variant: 'ghost' })}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}
    </ProfileSection>
  )
}
