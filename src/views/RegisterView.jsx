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

export default function RegisterView() {
  const location = useLocation()
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
      fullName: fullName.trim() ? '' : 'Escribe tu nombre.',
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
        title="Revisa tu correo"
        titleId="register-done-title"
        footer={
          <Link to="/entrar" className="font-medium text-accent hover:underline">
            Ir a iniciar sesión
          </Link>
        }
      >
        <FormAlert type="success">
          Te hemos enviado un enlace a <strong>{registeredEmail}</strong>. Ábrelo para confirmar tu cuenta y
          después inicia sesión.
        </FormAlert>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      titleId="register-title"
      description="Guarda repositorios, organízalos en listas y síguelos desde cualquier dispositivo."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/entrar" state={location.state} className="font-medium text-accent hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormAlert type="error">{error}</FormAlert>}

        <TextField
          id="register-name"
          label="Nombre"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
          error={fieldErrors.fullName}
        />
        <TextField
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
        />
        <TextField
          id="register-password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />
        <TextField
          id="register-password-confirm"
          label="Repite la contraseña"
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
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthCard>
  )
}
