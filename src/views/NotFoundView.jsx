import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import { CompassIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'

export default function NotFoundView() {
  return (
    <EmptyState
      icon={<CompassIcon className="size-6" />}
      title="404: esta ruta no existe"
      message="La página que buscas no está aquí. Vuelve a Explorar para seguir descubriendo repositorios."
      action={
        <Link to="/" className={buttonClasses({ variant: 'primary' })}>
          Ir a Explorar
        </Link>
      }
    />
  )
}
