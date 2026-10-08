import { useState } from 'react'
import ProfileSection from './ProfileSection'
import TextField from '../ui/TextField'
import FormAlert from '../ui/FormAlert'
import { buttonClasses } from '../ui/buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import { updateProfile } from '../../services/authService'
import { getEmailError, hasNoErrors } from '../../utils/validation'

export default function ProfileDetailsForm({ user }) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name ?? '')
  const [email, setEmail] = useState(user.email)
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const { isSubmitting, error, run } = useFormSubmit()

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccessMessage('')

    const errors = {
      fullName: fullName.trim() ? '' : 'Escribe tu nombre.',
      email: getEmailError(email),
    }
    setFieldErrors(errors)
    if (!hasNoErrors(errors)) return

    let emailChangePending = false
    const isSaved = await run(async () => {
      const result = await updateProfile({ fullName, email, currentEmail: user.email })
      emailChangePending = result.emailChangePending
    })

    if (!isSaved) return

    setSuccessMessage(
      emailChangePending
        ? `Datos guardados. Te hemos enviado un enlace a ${email.trim()} para confirmar el nuevo email; hasta entonces seguirás usando el actual.`
        : 'Datos guardados.',
    )
  }

  return (
    <ProfileSection
      title="Tus datos"
      titleId="profile-details-title"
      description="Cómo te llamamos y el email con el que inicias sesión."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormAlert type="error">{error}</FormAlert>}
        {successMessage && <FormAlert type="success">{successMessage}</FormAlert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="profile-name"
            label="Nombre"
            autoComplete="name"
            value={fullName}
            onChange={setFullName}
            error={fieldErrors.fullName}
          />
          <TextField
            id="profile-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClasses({ variant: 'primary', className: 'self-start' })}
        >
          {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </ProfileSection>
  )
}
