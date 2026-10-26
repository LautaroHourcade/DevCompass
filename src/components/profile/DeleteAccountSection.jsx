import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileSection from './ProfileSection'
import ConfirmDialog from '../ui/ConfirmDialog'
import { TrashIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { useToast } from '../../hooks/useToast'
import { deleteAccount, signOut } from '../../services/authService'
import { useTranslation } from '../../hooks/useTranslation'

export default function DeleteAccountSection({ email }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function handleOpenDialog(event) {
    event.preventDefault()
    setIsDialogOpen(true)
  }

  async function handleConfirmDelete() {
    await deleteAccount()

    // El usuario ya no existe en el servidor: solo limpiamos la sesión local.
    try {
      await signOut()
    } catch {
      // La sesión ya no es válida; no hay nada más que hacer.
    }

    navigate('/', { replace: true })
    showToast(t('profile.delete.done'), 'info')
  }

  return (
    <ProfileSection
      title={t('profile.delete.title')}
      titleId="profile-danger-title"
      description={t('profile.delete.description')}
      danger
    >
      <button
        type="button"
        onClick={handleOpenDialog}
        className={buttonClasses({ variant: 'danger-outline', className: 'self-start' })}
      >
        <TrashIcon className="size-4" />
        {t('profile.delete.button')}
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title={t('profile.delete.confirmTitle')}
        message={t('profile.delete.confirmMessage')}
        confirmLabel={t('profile.delete.confirmLabel')}
        confirmText={email}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDialogOpen(false)}
      />
    </ProfileSection>
  )
}
