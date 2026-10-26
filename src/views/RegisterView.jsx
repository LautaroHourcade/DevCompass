import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import TextField from '../components/ui/TextField'
import FormAlert from '../components/ui/FormAlert'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useFormSubmit } from '../hooks/useFormSubmit'
import { signUp } from '../services/authService'
import {
  MIN_PASSWORD_LENGTH,
  getEmailError,
  getPasswordConfirmError,
  getPasswordError,
  hasNoErrors,
} from '../utils/validation'
import { useTranslation } from '../hooks/useTranslation'

export default function RegisterView() {
  const location = useLocation()
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [registeredEmail, setRegisteredEmail] = useState('')
  const { isSubmitting, error, run } = useFormSubmit()

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = {
      fullName: fullName.trim() ? '' : t('validation.nameRequired'),
      email: getEmailError(email),
      password: getPasswordError(password),
      passwordConfirm: getPasswordConfirmError(password, passwordConfirm),
    }
    setFieldErrors(errors)
    if (!hasNoErrors(errors)) return

    const isRegistered = await run(() =>
      signUp({ email: email.trim(), password, fullName: fullName.trim() }),
    )

    // Con "Confirm email" activado no hay sesión hasta confirmar: avisamos de que revise el correo.
    if (isRegistered) setRegisteredEmail(email.trim())
  }

  if (registeredEmail) {
    return (
      <AuthCard
        title={t('auth.register.checkEmailTitle')}
        titleId="register-done-title"
        footer={
          <Link to="/entrar" className="font-medium text-accent hover:underline">
            {t('auth.register.goToLogin')}
          </Link>
        }
      >
        <FormAlert type="success">
          {t('auth.register.checkEmailBefore')} <strong>{registeredEmail}</strong>
          {t('auth.register.checkEmailAfter')}
        </FormAlert>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t('auth.register.title')}
      titleId="register-title"
      description={t('auth.register.description')}
      footer={
        <>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/entrar" state={location.state} className="font-medium text-accent hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormAlert type="error">{error}</FormAlert>}

        <TextField
          id="register-name"
          label={t('auth.name')}
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
          error={fieldErrors.fullName}
        />
        <TextField
          id="register-email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />
        <TextField
          id="register-password"
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          hint={t('validation.passwordHint', { min: MIN_PASSWORD_LENGTH })}
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />
        <TextField
          id="register-password-confirm"
          label={t('auth.repeatPassword')}
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          error={fieldErrors.passwordConfirm}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses({ variant: 'primary', className: 'mt-2 w-full' })}
        >
          {isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </button>
      </form>
    </AuthCard>
  )
}
