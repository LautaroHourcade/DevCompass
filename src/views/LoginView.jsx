import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import TextField from '../components/ui/TextField'
import FormAlert from '../components/ui/FormAlert'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useFormSubmit } from '../hooks/useFormSubmit'
import { signIn } from '../services/authService'
import { getEmailError, hasNoErrors } from '../utils/validation'
import { useTranslation } from '../hooks/useTranslation'

export default function LoginView() {
  const location = useLocation()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const { isSubmitting, error, run } = useFormSubmit()

  // Viene de una ruta protegida: explicamos por qué está aquí.
  const comesFromProtectedRoute = Boolean(location.state?.from)

  async function handleSubmit(event) {
    event.preventDefault()

    const errors = {
      email: getEmailError(email),
      password: password ? '' : t('validation.passwordRequired'),
    }
    setFieldErrors(errors)
    if (!hasNoErrors(errors)) return

    // Si todo va bien, PublicOnlyRoute redirige solo al detectar la sesión.
    await run(() => signIn({ email: email.trim(), password }))
  }

  return (
    <AuthCard
      title={t('auth.login.title')}
      titleId="login-title"
      description={t('auth.login.description')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to="/registro" state={location.state} className="font-medium text-accent hover:underline">
            {t('auth.login.signUpFree')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {comesFromProtectedRoute && !error && (
          <FormAlert type="info">{t('auth.login.protectedRoute')}</FormAlert>
        )}
        {error && <FormAlert type="error">{error}</FormAlert>}

        <TextField
          id="login-email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />
        <TextField
          id="login-password"
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses({ variant: 'primary', className: 'mt-2 w-full' })}
        >
          {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>
      </form>
    </AuthCard>
  )
}
