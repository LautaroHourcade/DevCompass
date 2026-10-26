import { useState } from 'react'
import ProfileSection from './ProfileSection'
import TextField from '../ui/TextField'
import FormAlert from '../ui/FormAlert'
import { buttonClasses } from '../ui/buttonStyles'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import { updateProfile } from '../../services/authService'
import { getEmailError, hasNoErrors } from '../../utils/validation'
import { useTranslation } from '../../hooks/useTranslation'

export default function ProfileDetailsForm({ user }) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState(user.user_metadata?.full_name ?? '')
  const [email, setEmail] = useState(user.email)
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(null)
  const { isSubmitting, error, run } = useFormSubmit()

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccess(null)

    const errors = {
      fullName: fullName.trim() ? '' : t('validation.nameRequired'),
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

    setSuccess(
      emailChangePending
        ? { key: 'profile.details.savedEmailPending', vars: { email: email.trim() } }
        : { key: 'profile.details.saved' },
    )
  }

  return (
    <ProfileSection
      title={t('profile.details.title')}
      titleId="profile-details-title"
      description={t('profile.details.description')}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <FormAlert type="error">{error}</FormAlert>}
        {success && <FormAlert type="success">{t(success.key, success.vars)}</FormAlert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="profile-name"
            label={t('auth.name')}
            autoComplete="name"
            value={fullName}
            onChange={setFullName}
            error={fieldErrors.fullName}
          />
          <TextField
            id="profile-email"
            label={t('auth.email')}
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
          {isSubmitting ? t('common.saving') : t('profile.details.submit')}
        </button>
      </form>
    </ProfileSection>
  )
}
