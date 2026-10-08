import PageHeader from '../components/layout/PageHeader'
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm'
import PasswordChangeForm from '../components/profile/PasswordChangeForm'
import DeleteAccountSection from '../components/profile/DeleteAccountSection'
import { useAuth } from '../hooks/useAuth'
import { getDisplayName } from '../services/authService'

export default function ProfileView() {
  const { user } = useAuth()

  return (
    <section aria-labelledby="profile-title" className="mx-auto flex max-w-[80rem] flex-col gap-6">
      <PageHeader
        command="whoami"
        title={`Hola, ${getDisplayName(user)}`}
        titleId="profile-title"
        description="Gestiona tus datos, tu contraseña y tu cuenta."
      />

      {/* key: si cambia el usuario (o su email confirmado), el formulario se reinicia con los datos nuevos */}
      <ProfileDetailsForm key={`${user.id}-${user.email}`} user={user} />
      <PasswordChangeForm email={user.email} />
      <DeleteAccountSection email={user.email} />
    </section>
  )
}
