import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileSection from './ProfileSection'
import ConfirmDialog from '../ui/ConfirmDialog'
import { TrashIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { useToast } from '../../hooks/useToast'
import { deleteAccount, signOut } from '../../services/authService'

export default function DeleteAccountSection({ email }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
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
    showToast('Tu cuenta se ha eliminado.', 'info')
  }

  return (
    <ProfileSection
      title="Zona de peligro"
      titleId="profile-danger-title"
      description="Eliminar la cuenta borra tus repositorios guardados y tus listas. No se puede deshacer."
      danger
    >
      <button
        type="button"
        onClick={handleOpenDialog}
        className={buttonClasses({ variant: 'danger-outline', className: 'self-start' })}
      >
        <TrashIcon className="size-4" />
        Eliminar mi cuenta
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="¿Eliminar tu cuenta?"
        message="Se borrarán tu cuenta, tus repositorios guardados y tus listas de forma permanente."
        confirmLabel="Eliminar cuenta"
        confirmText={email}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDialogOpen(false)}
      />
    </ProfileSection>
  )
}
